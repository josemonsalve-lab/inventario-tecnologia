// =====================================================================
//  Función "zoho" — sincroniza las tareas de la app con Zoho Projects
//  en las dos direcciones.
//
//  INSTALACIÓN (una sola vez)
//  1. Ejecuta zoho.sql en el SQL Editor.
//  2. Edge Functions → Implementar una nueva función → Vía Editor →
//     nombre: zoho → pega este archivo → Deploy.
//  3. Edge Functions → zoho → Secrets, y agrega:
//        ZOHO_CLIENT_ID       del Zoho API Console
//        ZOHO_CLIENT_SECRET   del Zoho API Console
//        ZOHO_REFRESH_TOKEN   el que generaste con el self client
//        ZOHO_DC              com, eu, in, com.au... (por defecto com)
//  4. En la app, Ajustes → Zoho Projects, escribe el portal y el proyecto.
//
//  ACCIONES
//    probar        comprueba credenciales y devuelve una tarea cruda de
//                  Zoho, para confirmar los nombres de los campos
//    sincronizar   trae lo de Zoho y empuja lo de la app (dos vías)
//    empujar       manda una tarea concreta a Zoho {id}
//
//  QUIÉN GANA: la versión modificada más tarde. La app guarda
//  tareas.actualizado y Zoho entrega last_updated_time.
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

const DC = Deno.env.get("ZOHO_DC") || "com";
const API = `https://projectsapi.zoho.${DC}/api/v3`;

/* ---------------------------------------------------- token de acceso */
async function accessToken(): Promise<string> {
  // Los espacios o saltos de línea al pegar las credenciales son la causa
  // más común de invalid_client, así que se limpian.
  const limpio = (k: string) => (Deno.env.get(k) || "").trim();
  const id = limpio("ZOHO_CLIENT_ID");
  const secreto = limpio("ZOHO_CLIENT_SECRET");
  const refresco = limpio("ZOHO_REFRESH_TOKEN");

  const faltan = [["ZOHO_CLIENT_ID", id], ["ZOHO_CLIENT_SECRET", secreto],
                  ["ZOHO_REFRESH_TOKEN", refresco]].filter(([, v]) => !v).map(([k]) => k);
  if (faltan.length)
    throw new Error("Faltan credenciales en los Secrets de la función: " + faltan.join(", "));

  const p = new URLSearchParams({
    refresh_token: refresco, client_id: id, client_secret: secreto, grant_type: "refresh_token",
  });
  const r = await fetch(`https://accounts.zoho.${DC}/oauth/v2/token?${p}`, { method: "POST" });
  const j = await r.json();
  if (!j.access_token) {
    const pistas: Record<string, string> = {
      invalid_client: "El Client ID o el Client Secret no corresponden, o el Self Client está en otra " +
        "región. Estás consultando accounts.zoho." + DC + "; si tu portal es de otra, define ZOHO_DC.",
      invalid_code: "El código ya se usó o caducó: genera uno nuevo y vuelve a canjearlo.",
      invalid_grant: "El refresh token no es válido para ese Client ID. Genéralo de nuevo con este " +
        "mismo Self Client.",
    };
    const e = String(j.error || "");
    throw new Error((pistas[e] || "Zoho rechazó las credenciales: " + JSON.stringify(j)) +
      "  ·  ID termina en …" + id.slice(-6) + ", token termina en …" + refresco.slice(-6));
  }
  return j.access_token;
}

async function zoho(token: string, ruta: string, metodo = "GET", cuerpo?: unknown) {
  const r = await fetch(API + ruta, {
    method: metodo,
    headers: {
      "Authorization": "Zoho-oauthtoken " + token,
      "Content-Type": "application/json",
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const txt = await r.text();
  let j: any = {};
  try { j = txt ? JSON.parse(txt) : {}; } catch { j = { crudo: txt }; }
  if (!r.ok) throw new Error("Zoho " + r.status + ": " + txt.slice(0, 300));
  return j;
}

/* --------------------------------------------- traducción de campos
   Calibrada con la respuesta real del portal: las fechas viajan en ISO,
   el cierre se sabe por is_closed_type / is_completed, y el responsable
   trae su correo, así que el emparejamiento con la app es exacto. */
const prioridadAZoho = (p: string) => p === "Alta" ? "high" : p === "Baja" ? "low" : "medium";
const prioridadDeZoho = (p: string) => {
  const v = String(p || "").toLowerCase();
  if (v === "high") return "Alta";
  if (v === "low") return "Baja";
  return "Normal";                       // medium y none caen acá
};

const estaCerradaEnZoho = (t: any) =>
  t?.is_completed === true ||
  t?.status?.is_closed_type === true ||
  Number(t?.completion_percentage ?? t?.percent_complete ?? 0) >= 100;

/* Zoho entrega "2024-07-15T15:00:00.000Z"; la app usa "2024-07-15" */
const fechaApp = (f: string) => f ? String(f).slice(0, 10) : null;
/* y para escribir se manda la misma fecha a mediodía UTC */
const fechaZoho = (f: string) => f ? String(f).slice(0, 10) + "T12:00:00.000Z" : "";

const correoDe = (t: any) =>
  String(t?.owners_and_work?.owners?.[0]?.email || t?.details?.owners?.[0]?.email || "").toLowerCase();
const nombreDe = (t: any) =>
  t?.owners_and_work?.owners?.[0]?.name || t?.details?.owners?.[0]?.name || "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Solo administradores
    const jwt = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    const { data: sesion } = await admin.auth.getUser(jwt);
    if (!sesion?.user) return responder({ error: "Sesión inválida" }, 401);
    const { data: perfil } = await admin.from("perfiles").select("rol").eq("id", sesion.user.id).single();
    if (!perfil || (perfil.rol !== "admin" && perfil.rol !== "super"))
      return responder({ error: "Solo un administrador puede sincronizar" }, 403);

    const cuerpo = await req.json().catch(() => ({}));
    const accion = cuerpo.accion || "sincronizar";

    /* ------------------------------------------------- listar proyectos
       Devuelve los portales de la cuenta y los proyectos de cada uno,
       para elegirlos en la app sin tener que copiar números a mano. */
    if (accion === "listar") {
      const token0 = await accessToken();
      const rp = await zoho(token0, "/portals");
      const portales = rp.portals || rp.data || [];
      const salida = [];
      for (const p of portales.slice(0, 5)) {
        const pid = String(p.id || p.id_string || "");
        let proyectos: any[] = [];
        try {
          const rpr = await zoho(token0, `/portal/${pid}/projects?range=100`);
          proyectos = (rpr.projects || rpr.data || []).map((x: any) => ({
            id: String(x.id || x.id_string || ""),
            nombre: x.name || x.project_name || "(sin nombre)",
          }));
        } catch (e) { /* un portal sin acceso no detiene al resto */ }
        salida.push({ id: pid, nombre: p.name || p.project_name || p.portal_name || pid, proyectos });
      }
      return responder({ ok: true, portales: salida });
    }

    // Parámetros guardados en la base
    const { data: conf } = await admin.from("integraciones").select("clave, valor");
    const cfg: Record<string, string> = {};
    for (const c of conf || []) cfg[c.clave] = c.valor || "";
    const portal = cuerpo.portal || cfg.zoho_portal;
    const proyecto = cuerpo.proyecto || cfg.zoho_proyecto;
    if (!portal || !proyecto)
      return responder({ error: "Falta indicar el portal y el proyecto de Zoho" }, 400);

    const token = await accessToken();
    const base = `/portal/${portal}/projects/${proyecto}`;

    /* ---------------------------------------------------------- probar */
    if (accion === "probar") {
      const info: Record<string, unknown> = { ok: true, portal, proyecto };

      // nombre del proyecto, para confirmar que apunta al correcto
      try {
        const rp = await zoho(token, `${base}`);
        const p = (rp.projects || rp.data || [rp])[0] || {};
        info.proyecto_nombre = p.name || p.project_name || "(sin nombre)";
        info.estado_proyecto = p.status || "";
      } catch (e) { info.proyecto_nombre = "no se pudo leer: " + String(e).slice(0, 120); }

      // personas del portal, que son las que se pueden asignar
      try {
        const ru = await zoho(token, `${base}/users`);
        const us = ru.users || ru.data || [];
        info.usuarios = us.length;
        info.usuarios_ejemplo = us.slice(0, 3).map((u: any) => u.email || u.email_id || u.name);
      } catch (e) { info.usuarios = "sin permiso para leerlos"; }

      // tareas existentes
      try {
        const rt = await zoho(token, `${base}/tasks?range=5`);
        const ts = rt.tasks || rt.data || [];
        info.tareas_en_zoho = ts.length;
        info.ejemplo = ts[0] || null;
        if (!ts.length) info.nota = "El proyecto no tiene tareas todavía. La conexión está bien.";
      } catch (e) { info.tareas_en_zoho = "error: " + String(e).slice(0, 160); }

      return responder(info);
    }

    /* ------------------------------------------------ mapa de personas */
    const { data: perfiles } = await admin.from("perfiles").select("id, email, nombre, zoho_id");
    let usuariosZoho: any[] = [];
    try {
      const u = await zoho(token, `${base}/users`);
      usuariosZoho = u.users || u.data || [];
    } catch { /* si el scope de usuarios no está, se sigue sin asignar */ }
    const zohoPorCorreo: Record<string, string> = {};
    for (const u of usuariosZoho) {
      const correo = String(u.email || u.email_id || "").toLowerCase();
      if (correo) zohoPorCorreo[correo] = String(u.zpuid || u.id || u.id_string || "");
    }
    /* Una persona puede tener un correo en la app y otro en Zoho: el campo
       zoho_email del perfil los une. */
    const correosDe = (p: any) => [p.email, p.zoho_email]
      .filter(Boolean).map((c: string) => String(c).toLowerCase());
    const idZohoDe = (perfilId: string) => {
      const p = (perfiles || []).find((x) => x.id === perfilId);
      if (!p) return null;
      if (p.zoho_id) return p.zoho_id;
      for (const c of correosDe(p)) if (zohoPorCorreo[c]) return zohoPorCorreo[c];
      return null;
    };
    const perfilDeZoho = (zid: string) => {
      const p = (perfiles || []).find((x) => String(x.zoho_id || "") === String(zid));
      if (p) return p;
      const correo = Object.keys(zohoPorCorreo).find((c) => zohoPorCorreo[c] === String(zid));
      return (perfiles || []).find((x) => String(x.email || "").toLowerCase() === correo) || null;
    };

    /* -------------------------------------------------------- empujar */
    const aZoho = (t: any) => {
      const campos: Record<string, unknown> = {
        name: t.titulo,
        description: [t.detalle, t.solucion ? "Solución: " + t.solucion : "",
                      t.serie ? "Serie: " + t.serie : "", t.cliente ? "Cliente: " + t.cliente : ""]
                      .filter(Boolean).join("\n\n"),
        priority: prioridadAZoho(t.prioridad),
      };
      if (t.vence) campos.end_date = fechaZoho(t.vence);
      const zid = idZohoDe(t.asignado_a);
      if (zid) campos.owners = String(zid);
      if (t.estado === "Hecha") {
        campos.completion_percentage = 100;
        if (estadoCerrado) campos.custom_status = estadoCerrado;
      } else if (estadoAbierto) {
        campos.completion_percentage = 0;
        campos.custom_status = estadoAbierto;
      }
      return campos;
    };

    const empujar = async (t: any) => {
      const campos = aZoho(t);
      let zohoId = t.zoho_id;
      if (zohoId) {
        await zoho(token, `${base}/tasks/${zohoId}/`, "POST", campos);
      } else {
        const r = await zoho(token, `${base}/tasks/`, "POST", campos);
        const creada = (r.tasks || r.data || [r])[0] || r;
        zohoId = String(creada.id || creada.id_string || creada.task_id || "");
      }
      await admin.from("tareas")
        .update({ zoho_id: zohoId, zoho_sync: new Date().toISOString() })
        .eq("id", t.id);
      return zohoId;
    };

    if (accion === "empujar") {
      const { data: t } = await admin.from("tareas").select("*").eq("id", cuerpo.id).single();
      if (!t) return responder({ error: "No encuentro esa tarea" }, 404);
      const zid = await empujar(t);
      return responder({ ok: true, zoho_id: zid });
    }

    /* ---------------------------------------------------- sincronizar */
    let creadas = 0, actualizadas = 0, enviadas = 0, omitidas = 0;
    const errores: string[] = [];
    const sinPersona = new Set<string>();
    let estadoAbierto = "", estadoCerrado = "";
    const modo = cfg.zoho_modo || "traer";             // traer | dos_vias
    const desde = cfg.zoho_desde ? new Date(cfg.zoho_desde).getTime() : 0;

    // 1. Zoho -> app
    /* Zoho pagina de a 100 con index/range: hay que recorrer todas las páginas
       o solo llega la primera, que son las más antiguas. */
    const tareasZoho: any[] = [];
    for (let indice = 1; indice <= 5000; indice += 100) {
      const r = await zoho(token, `${base}/tasks?index=${indice}&range=100`);
      const pagina = r.tasks || r.data || [];
      tareasZoho.push(...pagina);
      if (pagina.length < 100) break;
    }

    /* Los identificadores de estado salen del propio proyecto: así se cierra
       y se reabre una tarea con los estados que usa este portal. */
    for (const t of tareasZoho) {
      const st = t.status;
      if (!st?.id) continue;
      if (st.is_closed_type && !estadoCerrado) estadoCerrado = String(st.id);
      if (!st.is_closed_type && !estadoAbierto) estadoAbierto = String(st.id);
    }

    const perfilPorCorreo: Record<string, any> = {};
    for (const p of perfiles || []) for (const c of correosDe(p)) perfilPorCorreo[c] = p;

    for (const z of tareasZoho) {
      const zid = String(z.id || "");
      if (!zid) continue;
      if (desde && new Date(z.last_modified_time || 0).getTime() < desde) { omitidas++; continue; }

      const { data: existente } = await admin.from("tareas").select("*").eq("zoho_id", zid).maybeSingle();
      const correo = correoDe(z);
      const p = correo ? perfilPorCorreo[correo] : null;
      const zpuid = z?.owners_and_work?.owners?.[0]?.zpuid;
      if (p && zpuid && !p.zoho_id) {
        await admin.from("perfiles").update({ zoho_id: String(zpuid) }).eq("id", p.id);
        p.zoho_id = String(zpuid);
      }
      const fila: Record<string, unknown> = {
        titulo: (z.prefix ? z.prefix + " · " : "") + (z.name || "(sin título)"),
        detalle: z.description || "",
        vence: fechaApp(z.end_date || ""),
        prioridad: prioridadDeZoho(z.priority),
        estado: estaCerradaEnZoho(z) ? "Hecha" : "Pendiente",
        asignado_a: p?.id || null,
        asignado_nombre: p?.nombre || nombreDe(z) || "",
        cerrada: z.completed_on || null,
        zoho_id: zid,
        zoho_sync: new Date().toISOString(),
      };
      if (correo && !p) sinPersona.add(correo);
      if (!existente) {
        const { error } = await admin.from("tareas").insert({
          ...fila,
          creador_nombre: z.created_by?.name ? z.created_by.name + " (Zoho)" : "Zoho Projects",
          creada: z.created_time || new Date().toISOString(),
        });
        if (error) {
          if (errores.length < 3) errores.push("al crear " + zid + ": " + error.message);
        } else creadas++;
      } else {
        const zohoCambio = new Date(z.last_modified_time || 0).getTime();
        const appCambio = new Date(existente.actualizado || existente.creada || 0).getTime();
        if (zohoCambio >= appCambio) {                    // gana el más reciente
          const { error } = await admin.from("tareas").update(fila).eq("id", existente.id);
          if (error) {
            if (errores.length < 3) errores.push("al actualizar " + zid + ": " + error.message);
          } else actualizadas++;
        } else omitidas++;
      }
    }

    // 2. App -> Zoho (solo si la integración está en dos vías)
    if (modo !== "dos_vias")
      return responder({ ok: true, modo, creadas, actualizadas, enviadas: 0,
        leidas: tareasZoho.length, omitidas, errores, sin_persona: [...sinPersona] });

    const { data: pendientes } = await admin.from("tareas")
      .select("*")
      .or("zoho_id.is.null,zoho_sync.is.null,actualizado.gt.zoho_sync")
      .limit(200);
    for (const t of pendientes || []) {
      try { await empujar(t); enviadas++; }
      catch (e) { if (errores.length < 3) errores.push("al enviar " + t.titulo + ": " + String(e).slice(0, 200)); }
    }

    await admin.from("integraciones")
      .upsert({ clave: "zoho_ultima_sync", valor: new Date().toISOString(), actualizado: new Date().toISOString() });

    return responder({ ok: true, modo, creadas, actualizadas, enviadas,
      leidas: tareasZoho.length, omitidas, errores, sin_persona: [...sinPersona] });
  } catch (e) {
    return responder({ error: String(e) }, 500);
  }
});
