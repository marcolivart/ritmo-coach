// RITMO · Recordatorio de pesaje por notificación push.
// La invoca Vercel Cron dos veces al día (7:00 y 8:00 UTC). La función solo
// envía si en ese instante son las 9:00 en Europe/Madrid, de modo que el aviso
// llega siempre a las 9:00 hora española tanto en horario de invierno (UTC+1)
// como de verano (UTC+2), sin drift por el cambio de hora.
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

// La clave pública VAPID no es secreta (también va en el cliente). La privada,
// el subject, la URL de Supabase y la service role key son variables de entorno.
const VAPID_PUBLIC_KEY =
  "BI9OhDyJMKkws3_izdr25eZUTo8P4zx2djgfxJgbiMuV-mW5D71hxLL1Gw3cfaGJ0_eVOfFf3H0T6jOOnGvpMuk";

/** Componentes de la hora actual en Madrid (hora 0-23, fecha ISO y día 0=domingo). */
function madridNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value ?? "";
  const dow = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[get("weekday")];
  return { hour: Number(get("hour")), date: `${get("year")}-${get("month")}-${get("day")}`, dow };
}

/** Lunes (ISO) de la semana natural que contiene `dateISO` con día `dow`. */
function mondayOf(dateISO, dow) {
  const base = new Date(`${dateISO}T00:00:00Z`);
  const daysSinceMonday = (dow + 6) % 7;
  base.setUTCDate(base.getUTCDate() - daysSinceMonday);
  return base.toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  // Solo Vercel Cron: envía Authorization: Bearer <CRON_SECRET> si está definido.
  const secret = process.env.CRON_SECRET;
  const authorized = Boolean(secret) && req.headers.authorization === `Bearer ${secret}`;
  if (secret && !authorized) {
    return res.status(401).json({ error: "no autorizado" });
  }

  // Prueba manual bajo demanda: ?force=1 salta la comprobación horaria, pero solo
  // si vienes autenticado con el CRON_SECRET (para no abrir el envío a cualquiera).
  const url = new URL(req.url, `https://${req.headers.host}`);
  const force = authorized && url.searchParams.get("force") === "1";

  const { hour, date, dow } = madridNow();
  if (!force && hour !== 9) {
    return res.status(200).json({ skipped: true, reason: "no son las 9 en Madrid", hour });
  }
  if (dow === undefined) return res.status(500).json({ error: "no se pudo determinar el día" });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || "mailto:soporte@ritmo-coach.app";
  if (!supabaseUrl || !serviceKey || !vapidPrivate) {
    return res.status(500).json({ error: "faltan variables de entorno del servidor" });
  }

  webpush.setVapidDetails(vapidSubject, VAPID_PUBLIC_KEY, vapidPrivate);
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // Perfiles cuyo día de pesaje es hoy (0=domingo, como getDay()).
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id")
    .eq("weighing_day", dow);
  if (profilesError) return res.status(500).json({ error: profilesError.message });
  const dueIds = (profiles ?? []).map((p) => p.id);
  if (dueIds.length === 0) return res.status(200).json({ sent: 0, reason: "nadie tiene pesaje hoy" });

  // Quién ya se pesó esta semana natural (no hace falta recordárselo).
  const monday = mondayOf(date, dow);
  const { data: weighed } = await supabase
    .from("weight_logs")
    .select("user_id")
    .in("user_id", dueIds)
    .gte("measured_at", monday);
  const weighedSet = new Set((weighed ?? []).map((w) => w.user_id));

  // Suscripciones de esos usuarios, saltando las ya avisadas hoy (idempotente).
  const { data: subs, error: subsError } = await supabase
    .from("push_subscriptions")
    .select("id, user_id, endpoint, p256dh, auth, last_reminded_on")
    .in("user_id", dueIds);
  if (subsError) return res.status(500).json({ error: subsError.message });

  const targets = (subs ?? []).filter(
    (s) => !weighedSet.has(s.user_id) && s.last_reminded_on !== date,
  );

  const payload = JSON.stringify({
    title: "Ritmo · Pesaje semanal",
    body: "Hoy toca tu pesaje. Pésate al levantarte y registra el dato 📉",
    url: "/hoy",
  });

  let sent = 0;
  let removed = 0;
  const notifiedIds = [];
  await Promise.all(
    targets.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        );
        sent += 1;
        notifiedIds.push(s.id);
      } catch (err) {
        // 404/410 = suscripción caducada: se borra para no reintentar.
        if (err && (err.statusCode === 404 || err.statusCode === 410)) {
          await supabase.from("push_subscriptions").delete().eq("id", s.id);
          removed += 1;
        }
      }
    }),
  );

  // Marca las avisadas hoy para no duplicar en la segunda ventana del cron.
  if (notifiedIds.length > 0) {
    await supabase.from("push_subscriptions").update({ last_reminded_on: date }).in("id", notifiedIds);
  }

  return res.status(200).json({ sent, removed, candidates: targets.length });
}
