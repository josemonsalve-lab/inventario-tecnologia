// =====================================================================
//  Función "invitar" — administra usuarios desde la app.
//
//  Atiende dos operaciones:
//    · invitar  → crea la cuenta y envía el correo con el enlace
//    · eliminar → borra la cuenta y su perfil
//
//  Se instala una sola vez en Supabase: Edge Functions → Implementar una
//  nueva función → Vía Editor → nombre: invitar → pega este archivo
//  completo → Deploy. No hay que configurar claves: Supabase entrega las
//  suyas. Si ya la tenías instalada, vuelve a pegarla y desplegar para
//  que acepte la eliminación.
//
//  Toda operación comprueba que quien llama sea administrador, así que
//  un vendedor no puede usarla aunque lo intente por fuera de la app.
// =====================================================================

import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const responder = (cuerpo: unknown, estado = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { ...cors, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const claveServicio = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, claveServicio);

    // 1. ¿Quién está llamando?
    const jwt = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    const { data: sesion } = await admin.auth.getUser(jwt);
    if (!sesion?.user) return responder({ error: "Sesión inválida" }, 401);

    // 2. ¿Es administrador?
    const { data: perfil } = await admin
      .from("perfiles").select("rol").eq("id", sesion.user.id).single();
    const esAdmin = perfil && (perfil.rol === "admin" || perfil.rol === "super");
    const esSuper = perfil && perfil.rol === "super";
    if (!esAdmin)
      return responder({ error: "Solo un administrador puede hacer esto" }, 403);

    const cuerpo = await req.json();
    const accion = cuerpo.accion || "invitar";

    // ------------------------------------------------------- eliminar
    if (accion === "eliminar") {
      const id = cuerpo.id;
      if (!id) return responder({ error: "Falta el usuario" }, 400);
      if (id === sesion.user.id)
        return responder({ error: "No puedes eliminar tu propia cuenta" }, 400);

      // Un super administrador solo lo elimina otro super
      const { data: objetivo } = await admin
        .from("perfiles").select("rol").eq("id", id).single();
      if (objetivo?.rol === "super" && !esSuper)
        return responder({ error: "Solo un super administrador puede eliminar a otro" }, 403);

      // Nunca dejar el sistema sin administradores
      const { data: mandan } = await admin
        .from("perfiles").select("id").in("rol", ["admin", "super"]);
      if ((mandan || []).length <= 1 && (mandan || []).some((a) => a.id === id))
        return responder({ error: "Debe quedar al menos un administrador" }, 400);

      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) return responder({ error: error.message }, 400);
      await admin.from("perfiles").delete().eq("id", id);
      return responder({ ok: true });
    }

    // -------------------------------------------------------- invitar
    const { email, nombre, rol, redirect } = cuerpo;
    if (!email) return responder({ error: "Falta el correo" }, 400);
    if (rol === "super" && !esSuper)
      return responder({ error: "Solo un super administrador puede crear otro super" }, 403);

    const { data: inv, error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: redirect || undefined,
      data: { nombre: nombre || email },
    });
    if (error) return responder({ error: error.message }, 400);

    await admin.from("perfiles").upsert({
      id: inv.user.id,
      email,
      nombre: nombre || email,
      rol: rol === "super" ? "super" : rol === "admin" ? "admin" : "vendedor",
    });

    return responder({ ok: true, id: inv.user.id });
  } catch (e) {
    return responder({ error: String(e) }, 500);
  }
});
