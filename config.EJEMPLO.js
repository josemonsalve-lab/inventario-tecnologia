/* ---------------------------------------------------------------------
   ESTE ARCHIVO ES UN EJEMPLO. Cópialo como config.js la primera vez,
   escribe tus datos y NO lo vuelvas a subir: el config.js del servidor
   debe quedar tal cual está para que nadie tenga que reconectar nada.

   ATENCIÓN AL ACTUALIZAR LA APP:
   este archivo guarda TUS credenciales. Cuando reemplaces la carpeta por
   una versión nueva, conserva tu config.js o vuelve a escribir los datos.
   Si queda con los valores de ejemplo, la app arranca en modo local:
   sin inicio de sesión y con los datos guardados solo en ese dispositivo.

   Dónde salen los valores, en el panel de Supabase:
   - url      → Project Settings → Data API → Project URL
                solo el dominio, sin el /rest/v1/ del final
   - anonKey  → Project Settings → API Keys → pestaña "API keys"
                (la clave publishable, empieza con sb_publishable_)
                En proyectos antiguos es la clave anon public.
   Nunca pongas acá la clave secreta (sb_secret_ o service_role).
--------------------------------------------------------------------- */
window.CONFIG = {
  url: "https://TU-PROYECTO.supabase.co",
  anonKey: "TU-CLAVE-PUBLISHABLE"
};
