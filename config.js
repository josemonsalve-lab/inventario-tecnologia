/* ---------------------------------------------------------------------
   Conexión a la base compartida (Supabase).
   Mientras estos valores queden como están, la app funciona en modo local:
   los datos se guardan solo en este teléfono y todo se ve como administrador.

   Para trabajar en equipo:
   1. Crea un proyecto en supabase.com
   2. Ejecuta esquema.sql y catalogo.sql en el SQL Editor
   3. Copia acá la URL y la clave anon (Project Settings → API)
   La clave anon es pública por diseño: quien manda es el rol del usuario.
--------------------------------------------------------------------- */
window.CONFIG = {
  url: "https://obtptqzcxmdcqsiuxjjg.supabase.co/rest/v1/",
  anonKey: "sb_publishable_8cl8xcdi0opeLwSIzDz6gQ_Uqj380FZ"
};
