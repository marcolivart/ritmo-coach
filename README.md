# RITMO — prototipo de entrenador personal

Prototipo funcional mobile-first, diseñado para iPhone, construido con React + Vite.

## Funciones incluidas

- Inicio diario con objetivo, peso y siguiente comida.
- Pesaje semanal y adaptación visual del plan.
- Menú completo de lunes a domingo con cantidades en gramos.
- Calorías, proteína y alternativas equivalentes por comida.
- Lista de la compra interactiva agrupada por categorías.
- Alimentos bloqueados que nunca deben incluirse.
- Alimentos favoritos y apartado de alergias/intolerancias.
- Documento semanal preparado para imprimir o guardar como PDF.
- Plan de gimnasio y running.
- Modo gimnasio guiado con series, kilos, repeticiones, técnica y errores.
- Progresión recomendada según el rendimiento anterior.
- Evolución del peso, adherencia y estadísticas.
- Persistencia local de peso, bloqueos y lista de compra.

## Ejecutar el proyecto

Requiere Node.js 18 o superior.

```bash
npm install
npm run dev
```

Después abre la dirección local que muestra Vite.

## Crear versión de producción

```bash
npm run build
npm run preview
```

## Estado actual

Es una primera versión funcional de interfaz y flujo. Los menús, cálculos y recomendaciones incluidos son datos de demostración. Antes de utilizarlo con usuarios reales faltará conectar:

- Supabase y autenticación.
- Motor nutricional validado.
- Generación de planes mediante IA con validación determinista.
- Base de datos de alimentos y nutrientes.
- Base de ejercicios y vídeos.
- Notificaciones de pesaje en iPhone.
- Reglas clínicas y de seguridad.

## Vídeos de ejercicios

La guía de entrenamiento reproduce vídeos reales mediante `<video playsInline>` para mantenerlos dentro de la interfaz del iPhone. Los vídeos se cargan desde Wikimedia Commons y requieren conexión a internet.

Créditos incluidos dentro de la propia aplicación:

- **Press de pecho en máquina** — Centers for Disease Control and Prevention — dominio público.
- **Remo inclinado, press de hombros, sentadilla, peso muerto y dominadas** — FitnessScape — Creative Commons Attribution 3.0.

Los enlaces de atribución y licencia aparecen bajo cada reproductor. Para una versión comercial conviene almacenar copias optimizadas propias o sustituirlas por una biblioteca audiovisual producida específicamente para la aplicación.
