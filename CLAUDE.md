# Ritmo Coach — Contexto del proyecto

App de entrenador personal (nutrición semanal medida + entrenamiento guiado). PWA móvil, diseñada como app nativa iPhone pero funciona en cualquier navegador.

## Preferencias de trabajo del usuario (Marc)

- **Responde en español**, con honestidad directa. Si algo está mal o hay una idea mejor, dilo sin rodeos antes de los puntos positivos. No validar por validar.
- **Modo eficiencia**: respuestas mínimas, sin relleno, resultado final listo para usar. Pregunta solo si es imprescindible.
- No asumas que el usuario tiene razón. Cuestiona supuestos cuando aporte. Diferencia hechos de inferencias.
- **Verifica de verdad, no supongas**: compila (`npx tsc --noEmit`) y prueba antes de afirmar que algo funciona. Este proyecto ha tenido varios bugs por dar cosas por buenas sin ejecutarlas.

## Stack

- React 18 + TypeScript + Vite (SPA)
- Supabase (auth + base de datos, con RLS por `auth.uid()`)
- lucide-react (iconos)
- Vercel (deploy automático al hacer push a `main`)
- **NO usa Tailwind.** Todo el CSS está en `src/index.css` con variables propias. No introducir clases Tailwind, no se compilan.

## Comandos

```
npm run dev       # servidor local (localhost:5173)
npm run build     # build de producción
npx tsc --noEmit -p tsconfig.json   # comprobar tipos (usar SIEMPRE antes de dar algo por bueno)
```

Deploy: `git add . && git commit -m "..." && git push` → Vercel despliega solo.
Producción: https://ritmo-coach.vercel.app/
Repo: https://github.com/marcolivart/ritmo-coach

## Sistema de diseño (src/index.css)

Paleta (variables CSS en `:root`):
- `--bg: #f4f5ef` (crema de fondo)
- `--ink: #161b17` (texto/oscuro)
- `--green: #1f6d48`, `--green-deep: #154c33`, `--green-soft: #daf2e2`
- `--lime: #d9f37d` (acento)
- `--orange: #ff9f5b`, `--red: #e75f5f`
- `--muted: #6d756e`

Estética: wellness premium, tipografía redondeada (SF Pro Rounded / ui-rounded), radios generosos (shell 44px, tarjetas ~26px), sombras suaves. Móvil primero, ancho base 390-430px.

## Estructura

```
src/
  App.tsx              # entry, gestiona sesión Supabase y perfil; muestra AuthScreen/Onboarding/HealthCoachApp
  main.tsx
  index.css            # TODO el CSS (grande, ~1000 líneas)
  types.ts             # Profile, WeightLog, FoodPreference
  lib/
    supabase.ts        # cliente Supabase (persistSession activo)
    database.ts        # todas las queries: perfil, peso, entrenos, preferencias, compra, resetUserData
    nutrition.ts       # cálculo calorías/proteína objetivo, fechas de pesaje, racha
    stats.ts           # estadísticas de Progreso (1RM Epley, adherencia, tendencia fuerza)
    routes.ts          # tipo Tab + mapa de rutas (/hoy, /comida, etc.)
components/
  AuthScreen.tsx       # login/registro (arranca en modo login)
  Onboarding.tsx       # asistente 5 pasos, se muestra si onboarding_completed=false
  HealthCoachApp.tsx   # COMPONENTE PRINCIPAL (~1250 líneas, monolítico). Contiene render de las 5 pestañas.
  layout/
    AppLayout.tsx      # shell: header fijo + contenido scrolleable + bottom nav. Rutas nativas (History API), animación slide, scroll-to-top.
    Header.tsx         # título de pestaña + avatar + indicador sync
    BottomNavigation.tsx
  today/
    ActivityRings.tsx  # anillo(s) SVG estilo Apple Watch
    WidgetRow.tsx      # YA NO SE USA (se puede borrar), quedó del diseño anterior
supabase/schema.sql    # esquema de BD con RLS
vercel.json            # rewrites SPA (para que /entreno no dé 404 al recargar)
```

## Navegación

Rutas reales con **History API nativa** (no react-router — no se pudo instalar en el entorno donde se desarrolló, pero funciona igual). Cada pestaña tiene URL: `/hoy`, `/comida`, `/entreno`, `/progreso`, `/perfil`. Botón atrás del navegador funciona. Si se migra a react-router en el futuro, el cambio se localiza en `AppLayout.tsx` y `routes.ts`.

## Estado de los sprints (roadmap V2)

- **2.1 Layout/navegación** ✅ AppLayout, header fijo, bottom nav, safe areas, animación slide iOS, rutas, accesibilidad (aria-current, aria-label).
- **2.2 Pantalla Hoy** ✅ Rediseñada por completo: hero de peso→objetivo (tarjeta oscura), foco de entreno con anillo, franja de métricas, plan del día, nota del coach.
- **2.3 Comida** ⏳ PENDIENTE: PDF, lista de compra, vista semana. (La pantalla existe pero no se ha rehecho en V2.)
- **2.4 Entreno** ⏳ PENDIENTE: biblioteca de ejercicios, vídeos, registro.
- **2.5 Perfil/Estadísticas** ⏳ Parcial: "Progreso" ya usa datos reales; Perfil tiene botón de reset. Falta pulir ajustes y onboarding.

## Datos reales vs. placeholder (IMPORTANTE)

El proyecto tenía muchos números hardcodeados que parecían reales. Se han ido conectando a datos de verdad, pero queda ojo:

- **Real**: peso y su evolución, series de entreno (tabla `exercise_sets`), adherencia semanal, racha de pesajes, fuerza estimada (Epley), días entrenados, calorías/proteína objetivo (fórmulas en nutrition.ts).
- **Plan de comida**: el menú se auto-escala al objetivo calórico (`personalizeWeek`), así que las kcal del menú ≈ objetivo siempre. NO hay tracking de consumo real (marcar comida como "hecha" no persiste nada). No presentar las kcal del menú como "progreso".
- **Pendiente/placeholder conocido**: la nota del coach en Hoy es texto fijo. Algunos textos de ejercicios concretos siguen siendo de ejemplo.

## Bugs históricos ya resueltos (no reintroducir)

- Modales que se abrían desplazados: los overlays (modales/toast) deben ir en el prop `overlay` de AppLayout, FUERA del contenedor con la animación `transform` (si no, el `position:absolute` se ancla mal).
- Nav que se ocultaba en iOS: `.phone-shell` en móvil usa `height:100dvh` con fallback `100vh`, NO `min-height`.
- Header que tapaba el título: `.screen-with-header` reserva `padding-top: max(80px, ...)`. El header `.app-header` es sólido (`background: var(--bg)`), no translúcido.
- Fecha: la pantalla Comida abre en el día actual de la semana (`(new Date().getDay()+6)%7`), no en lunes fijo.

## Notas de flujo

- Al editar `HealthCoachApp.tsx` (monolítico), cuidado con imports de iconos lucide huérfanos (tsconfig no tiene noUnusedLocals, no avisa).
- El `.env` (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) NO está en git. Está solo en local.
- Idea a futuro: partir HealthCoachApp.tsx en componentes por pestaña (hoy es demasiado grande).
