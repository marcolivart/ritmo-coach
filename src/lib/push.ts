/** Notificaciones push (Web Push). El recordatorio de pesaje lo envía la función
 *  serverless de Vercel (`api/send-reminders.js`); aquí solo se gestiona la
 *  suscripción del navegador. La clave VAPID pública NO es secreta (va en el
 *  cliente por diseño); la privada vive solo en el servidor. */
export const VAPID_PUBLIC_KEY =
  "BI9OhDyJMKkws3_izdr25eZUTo8P4zx2djgfxJgbiMuV-mW5D71hxLL1Gw3cfaGJ0_eVOfFf3H0T6jOOnGvpMuk";

/** Estados posibles del soporte de notificaciones para gobernar la UI. */
export type PushEnv =
  | "unsupported"    // el navegador no expone la Push API
  | "needs-install"  // iPhone en Safari: hace falta instalar la app en pantalla de inicio
  | "denied"         // el usuario bloqueó el permiso
  | "ready"          // se puede activar
  | "subscribed";    // ya activo en este dispositivo

export type PushSubscriptionPayload = { endpoint: string; p256dh: string; auth: string };

function isIos(): boolean {
  return /iP(hone|ad|od)/.test(navigator.userAgent);
}

/** ¿La PWA está abierta como app instalada (no como pestaña del navegador)? */
export function isStandalone(): boolean {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isPushSupported(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

function toPayload(sub: PushSubscription): PushSubscriptionPayload {
  const json = sub.toJSON();
  return { endpoint: sub.endpoint, p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" };
}

/** Diagnóstico del estado actual, sin pedir permiso todavía. */
export async function getPushEnv(): Promise<PushEnv> {
  // En iOS la Push API solo existe si la app está instalada como PWA.
  if (isIos() && !isStandalone()) return "needs-install";
  if (!isPushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  const registration = await navigator.serviceWorker.getRegistration();
  const existing = await registration?.pushManager.getSubscription();
  return existing ? "subscribed" : "ready";
}

/** Pide permiso y suscribe este navegador. Devuelve el payload a guardar en BD. */
export async function subscribeToPush(): Promise<PushSubscriptionPayload> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Permiso de notificaciones denegado");
  // Asegura que hay un service worker registrado (en dev main.tsx no lo registra).
  const registration =
    (await navigator.serviceWorker.getRegistration()) ??
    (await navigator.serviceWorker.register("/sw.js"));
  await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }));
  return toPayload(subscription);
}

/** Cancela la suscripción local. Devuelve el endpoint borrado (para quitarlo de BD). */
export async function unsubscribeFromPush(): Promise<string | null> {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return null;
  const { endpoint } = subscription;
  await subscription.unsubscribe();
  return endpoint;
}
