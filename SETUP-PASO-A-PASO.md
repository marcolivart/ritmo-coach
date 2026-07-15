# Puesta en marcha

1. Sustituye los archivos de tu carpeta local por los de este paquete.
2. En CMD, dentro de `C:\Proyectos\ritmo-coach`:

```bat
rmdir /s /q node_modules
npm install
npm run build
npm run dev
```

3. Ejecuta `supabase/schema.sql` en el SQL Editor de Supabase.
4. Crea `.env.local` copiando `.env.example` y pega tus dos valores públicos.
5. Reinicia `npm run dev`.
6. Comprueba registro, onboarding, peso, preferencias, compra y series.
7. Sube el cambio:

```bat
git add .
git commit -m "Implementar usuarios y sincronizacion Supabase"
git push
```

8. En Vercel añade las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` y realiza un redeploy.
