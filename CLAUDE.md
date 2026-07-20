# Ritmo Coach — Contexto del proyecto

App de entrenador personal (nutrición semanal medida + entrenamiento guiado). PWA móvil, diseñada como app nativa iPhone pero funciona en cualquier navegador.

## Enfoque de producto (IMPORTANTE, no lo derivas del código)

**La comida es el corazón de la app.** El entreno es motivación secundaria: anima a moverse, pero **esto NO es una app de levantamiento de pesas**. Ante cualquier decisión de diseño o de dónde poner el foco (orden en Hoy, tamaño de las tarjetas, qué se pule primero), la comida gana. No añadir profundidad de gimnasio (series/RPE/periodización) sin que Marc lo pida explícitamente; sí se puede seguir mejorando motivación al movimiento (rachas, variedad, cardio) mientras no compita visualmente con la comida.

## Preferencias de trabajo del usuario (Marc)

- **Responde en español**, con honestidad directa. Si algo está mal o hay una idea mejor, dilo sin rodeos antes de los puntos positivos. No validar por validar.
- **Modo eficiencia**: respuestas mínimas, sin relleno, resultado final listo para usar. Pregunta solo si es imprescindible.
- No asumas que el usuario tiene razón. Cuestiona supuestos cuando aporte. Diferencia hechos de inferencias.
- **Verifica de verdad, no supongas**: compila (`npm run typecheck`) y prueba antes de afirmar que algo funciona. Este proyecto ha tenido varios bugs por dar cosas por buenas sin ejecutarlas.

## Stack

- React 18 + TypeScript + Vite (SPA)
- Supabase (auth + base de datos, con RLS por `auth.uid()`)
- lucide-react (iconos)
- Vercel (deploy automático al hacer push a `main`)
- **NO usa Tailwind.** CSS propio con tokens en `src/styles/` (entrada: `src/index.css`, solo @imports). No introducir clases Tailwind, no se compilan.

## Comandos

```
npm run dev        # servidor local con Supabase real (localhost:5173)
npm run dev:demo   # servidor local en MODO DEMO (localStorage, no toca Supabase) — usar para probar UI
npm run build      # build de producción
npm run typecheck  # comprobar tipos (usar SIEMPRE antes de dar algo por bueno)
```

Deploy: `git add . && git commit -m "..." && git push` → Vercel despliega solo.
Producción: https://ritmo-coach.vercel.app/
Repo: https://github.com/marcolivart/ritmo-coach

## Migraciones pendientes de ejecutar

`supabase/migration-v2.sql` — ✅ ya ejecutada por Marc (2026-07-20).

`supabase/migration-v3.sql` — PENDIENTE. Añade la tabla `daily_wellness` (agua/sueño del widget de Hoy) y actualiza `reset_user_data` para incluirla. **La app funciona sin ella** (fallback por código de error `PGRST205`/`42P01` en `database.ts`: el widget sigue operativo, solo que agua/sueño no persisten entre sesiones hasta que se ejecute).

## Sistema de diseño (src/styles/)

Tokens en `src/styles/tokens.css` — única fuente de verdad. No usar valores literales para color/radio/sombra/peso tipográfico en componentes: si falta un token, se añade.

- Color: paleta crema/verde/lima de siempre + tonos derivados (`--green-tint`, `--lime-soft`, `--red-soft`, `--muted-strong` para texto pequeño AA…).
- Escalas: `--space-1..8` (paso 4px), radios `--radius-xs..shell` (8→44) + `--radius-full`, tipografía `--text-2xs..mega` con SOLO 4 pesos (`--font-semibold/bold/heavy/black` = 600/700/800/900), sombras `--shadow-sm/md/lg/shell/sheet`, `--z-chrome/sheet/toast`, movimiento `--ease-out`, `--dur-fast/base/slow`.
- Ficheros: `tokens` → `motion` (keyframes, `.pressable`, reduced-motion) → `base` → `layout` → `components` (card/pill/iconbox/botones/filas/seg/skeleton) → `screens` → `overlays` (sheet/toast) → `auth`.
- Interacción: todo elemento pulsable lleva clase `.pressable`; `:focus-visible` global; touch targets ≥44px.
- Estética: wellness premium, ui-rounded/SF Pro Rounded, móvil primero 390-430px.

## Estructura

```
src/
  App.tsx               # entry: sesión Supabase + perfil; AuthScreen/Onboarding/HealthCoachApp
  main.tsx              # + registro del service worker (solo PROD)
  index.css             # solo @imports de src/styles/
  types.ts              # Profile (con schedule), Schedule+DEFAULT_SCHEDULE, WeightLog, FoodPreference…
  state/
    useAppState.ts      # TODO el estado de la app (hook compositor): carga, perfil, peso, comida, entreno, sheets, coach
    AppContext.tsx      # AppDataProvider + useAppData()
  lib/
    supabase.ts         # cliente (persistSession)
    database.ts         # queries + fallbacks pre-migración (códigos de error PGRST202/42P10/42703/PGRST205…)
    dates.ts            # ÚNICA fuente de fechas (local-safe). PROHIBIDO toISOString().slice(0,10) para días
    nutrition.ts        # kcal (Mifflin-St Jeor), proteína (sobre peso de referencia, no siempre el actual), macroSplit real, isWeightDue, racha, estimateHydrationTargetMl (35 ml/kg)
    menu.ts             # 3 semanas de menú que ROTAN (menuWeeks + menuWeekIndex, determinista por semana natural)
                         # applyMealCount (3/4/5) + personalizeWeek (semana natural Lun-Dom, para compra/PDF)
                         # + personalizeRollingWeek (ventana móvil hoy+6 días, para el selector de Comida)
                         # alergias∪bloqueados filtran, favoritos influyen
    eatingOut.ts        # sugerencias de bar/restaurante ("Voy a comer fuera" en MealSheet), emparejadas por tipo de comida y kcal/proteína objetivo
    batchCooking.ts     # detecta ingredientes que se repiten ≥2 veces en la semana (pollo, arroz, legumbres…) → tarjeta "Cocina de una vez" en Compra
    groceries.ts        # lista de compra desde ingredientes reales
    workouts.ts         # catálogo: gym (Torso A/B, Pierna), casa, cardio (run/walk/bike). Unión StrengthWorkout|CardioWorkout
    plan.ts             # buildWeeklyPlan según exercise_types y training_days (mezcla fuerza+cardio)
    stats.ts            # 1RM Epley, adherencia, tendencia fuerza
    coach.ts            # motor del coach POR REGLAS (~15 reglas priorizadas, variantes deterministas por día+usuario)
    pdf.ts              # exportWeekPDF (ventana imprimible)
    routes.ts           # Tab + rutas
components/
  AuthScreen.tsx, Onboarding.tsx
  HealthCoachApp.tsx    # ~85 líneas: Provider + AppLayout + switch de tabs + sheets en overlay
  layout/               # AppLayout (History API, slide, overlay, header border on-scroll), Header, BottomNavigation
  ui/                   # BottomSheet (dialog+focus trap+Esc), Pill, IconBox, SettingRow, SegmentedControl, Skeleton, Toast, CountUp
  tabs/                 # TodayTab(+today/WellnessRow), FoodTab(+food/*), TrainingTab(+training/*), ProgressTab(+progress/WeightChart), ProfileTab
  sheets/               # WeightSheet, MealSheet, ProfileSheet (edición completa), ScheduleSheet, WorkoutOptionsSheet, ResetSheet
supabase/schema.sql     # esquema inicial · migration-v2.sql · migration-v3.sql (ver arriba)
public/sw.js            # service worker mínimo (CACHE_VERSION a mano) · manifest maskable
vercel.json             # rewrites SPA
.env.demo               # anula credenciales → modo demo (npm run dev:demo)
```

## Reglas de arquitectura (no romper)

- Los sheets/toast van SIEMPRE en el prop `overlay` de AppLayout, FUERA del contenedor con la animación `transform` (si no, el `position:absolute` se ancla mal). Todos los sheets se montan sobre `components/ui/BottomSheet`.
- Fechas de calendario: solo helpers de `src/lib/dates.ts`. `toISOString().slice(0,10)` mezcla día UTC con hora local (bug histórico).
- Los `name` de los ejercicios de torso-a y pierna NO se renombran: el historial de `exercise_sets` cruza por ese texto.
- Desmarcar una serie BORRA su fila en BD (`deleteExerciseSetsForDay`); nunca dejarlo solo en UI (duplicaba series e inflaba stats).
- `useCountUp` y el cierre de BottomSheet llevan fallback por temporizador: rAF/animationend se congelan en pestañas en segundo plano.
- Estado: un solo hook `useAppState` + contexto. Solo hay un tab montado a la vez (`key={tab}` remonta).

## Navegación

History API nativa (sin react-router). URLs: `/hoy`, `/comida`, `/entreno`, `/progreso`, `/perfil`; botón atrás funciona. Los sheets NO entran en el history (se cierran con Esc/backdrop). Migración futura a react-router: localizada en `AppLayout.tsx` y `routes.ts`.

## Datos reales vs. limitaciones conocidas

Tras el rediseño V3 **no quedan placeholders**: coach por reglas con datos reales, semana dinámica, macros calculados, gráfico con escala/fechas reales, horarios editables, meal_count y exercise_types honrados, alergias y favoritos afectan al menú y a la compra.

Limitaciones asumidas (documentadas, no bugs):
- El menú rota sobre 3 semanas fijas (`menuWeeks`) que se personalizan/escalan; no hay generador infinito de recetas. "Regenerar" alterna base↔alternativa (cada plato tiene UNA alternativa) dentro de la semana activa.
- El selector de días de Comida es una ventana móvil (hoy + 6 días, `personalizeRollingWeek`); la compra y el PDF siguen sobre la semana natural Lun-Dom (`personalizeWeek`) porque así se compra.
- Marcar comida "hecha" SÍ persiste (`meal_completions`) y alimenta al coach y a Progreso (`weeklyFoodAdherencePercent` en `useAppState.ts`, semana natural Lun→hoy), pero no hay tracking de kcal consumidas reales.
- Con pocos datos las stats devuelven `null` y la UI muestra "—" (mejor que inventar).
- El clamp de escalado del menú es 0.72–1.35: objetivos calóricos extremos no se alcanzan solo escalando.
- `excluded_meals` es por día-de-semana (aplica cada semana); `meal_completions` por fecha. Inconsistencia de modelo asumida.
- Ejercicios nuevos (Torso B, Casa) sin vídeo aún (`videoUrl:""` → estado "no disponible" honesto; solo se usan vídeos con licencia de Commons).

## Bugs históricos ya resueltos (no reintroducir)

- Overlays fuera del contenedor animado (ver Reglas de arquitectura).
- Nav oculta en iOS: `.phone-shell` móvil usa `height:100dvh` con fallback `100vh`, NO `min-height`.
- Header tapando título: `.screen-with-header` reserva `padding-top: max(80px, ...)`; `.app-header` sólido, con borde inferior activado por scroll.
- Comida abre en el día actual (`weekdayMon0()`), no en lunes fijo.
- Series duplicadas en `exercise_sets` (ver Reglas de arquitectura + migración v2).

## Notas de flujo

- tsconfig no tiene `noUnusedLocals`: para cazar imports muertos, `npx tsc --noEmit -p tsconfig.json --noUnusedLocals` puntualmente.
- El `.env` (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) NO está en git; `.env.demo` sí (vacío a propósito).
- Al subir cambios que deban invalidar el caché offline, bump de `CACHE_VERSION` en `public/sw.js`.
