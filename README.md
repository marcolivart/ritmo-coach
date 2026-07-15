# Ritmo Coach

Aplicación mobile-first para iPhone con:

- Registro e inicio de sesión mediante Supabase Auth.
- Onboarding guiado con objetivo, altura, peso, actividad, ejercicio y día de pesaje.
- Perfil sincronizado entre dispositivos.
- Pesaje semanal e historial por kilos.
- Alimentos bloqueados, favoritos, alergias e intolerancias.
- Menú semanal personalizado mediante una estimación energética inicial.
- Lista de compra interactiva sincronizada.
- Gimnasio guiado con vídeos, técnica, series, kilos y repeticiones.
- Generación del plan semanal para imprimir o guardar como PDF.
- Modo demostración automático cuando no existen variables de Supabase.

> La estimación nutricional es orientativa y está pensada para bienestar general en adultos. No sustituye la valoración de un profesional sanitario o dietista-nutricionista.

## 1. Instalar

```bash
npm install
npm run dev
```

## 2. Crear Supabase

1. Crea un proyecto en Supabase.
2. Abre `SQL Editor`.
3. Copia y ejecuta todo `supabase/schema.sql`.
4. En `Authentication > URL Configuration`, configura:
   - Site URL: la URL de Vercel.
   - Redirect URLs: la URL de Vercel y `http://localhost:5173/**`.
5. Copia Project URL y Publishable/anon key.

Crea `.env.local`:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
```

## 3. Variables en Vercel

En `Project > Settings > Environment Variables`, añade las mismas variables para Production, Preview y Development. Después haz un Redeploy sin caché.

## 4. Subir cambios

```bash
git add .
git commit -m "Conectar Ritmo con Supabase"
git push
```

Vercel publicará automáticamente la nueva versión.
