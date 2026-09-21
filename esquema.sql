-- =====================================================================
--  Inventario de equipos — esquema para Supabase
--  Pega este archivo completo en el SQL Editor y ejecútalo una vez.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------ perfiles
-- Cada usuario que crees en Authentication queda acá con su rol.
create table if not exists public.perfiles (
  id      uuid primary key references auth.users(id) on delete cascade,
  email   text,
  nombre  text,
  rol     text not null default 'vendedor' check (rol in ('admin','vendedor')),
  creado  timestamptz not null default now()
);

-- Al registrarse un usuario nuevo entra como vendedor.
create or replace function public.nuevo_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, email, nombre)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nombre', new.email))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario after insert on auth.users
  for each row execute function public.nuevo_perfil();

-- ¿El usuario actual es administrador?
create or replace function public.es_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin');
$$;

-- --------------------------------------------------------------- proveedores
create table if not exists public.proveedores (
  id        uuid primary key default gen_random_uuid(),
  nombre    text not null,
  contacto  text,
  telefono  text,
  email     text,
  origen    text default 'Local',
  plazo     int,
  notas     text,
  creado    timestamptz not null default now()
);

-- ------------------------------------------------------------------ modelos
create table if not exists public.modelos (
  id           uuid primary key default gen_random_uuid(),
  codigo       text not null unique,
  modelo       text,
  nombre       text,
  categoria    text,
  venta_uf     numeric,
  arriendo_uf  numeric,
  minimo       int not null default 0,
  proveedor_id uuid references public.proveedores(id) on delete set null,
  ficha        jsonb not null default '{}'::jsonb,
  func         jsonb not null default '{}'::jsonb,
  fotos        text[] not null default '{}',
  activo       boolean not null default true,     -- si es falso, los vendedores no lo ven
  actualizado  timestamptz not null default now()
);
alter table public.modelos add column if not exists activo boolean not null default true;

-- -------------------------------------------------------------------- fotos
-- Imagen comprimida en base64. Una fila por foto, referenciada por modelos.fotos.
create table if not exists public.fotos (
  id     text primary key,
  data   text not null,
  creado timestamptz not null default now()
);

-- ----------------------------------------------------------------- facturas
-- Documento de compra del proveedor. El PDF o la foto vive en el bucket
-- 'facturas' de Storage; acá queda la referencia y los datos del documento.
create table if not exists public.facturas (
  id           uuid primary key default gen_random_uuid(),
  proveedor_id uuid not null references public.proveedores(id) on delete cascade,
  numero       text,
  fecha        date,
  monto        numeric,
  moneda       text default 'CLP' check (moneda in ('CLP','USD','UF')),
  archivo      text,          -- nombre del objeto dentro del bucket
  tipo         text,          -- tipo MIME del archivo
  notas        text,
  creado       timestamptz not null default now()
);
create index if not exists facturas_proveedor_idx on public.facturas (proveedor_id);

-- ------------------------------------------------------------------ unidades
create table if not exists public.unidades (
  id           uuid primary key default gen_random_uuid(),
  serie        text not null unique,
  codigo       text not null references public.modelos(codigo) on update cascade,
  situacion    text not null default 'Disponible'
               check (situacion in ('Disponible','Reservado','Entregado','En revisión','Baja')),
  estado       text default 'Nuevo',
  ubicacion    text,
  proveedor_id uuid references public.proveedores(id) on delete set null,
  oc           text,
  costo        numeric,
  ingreso      date,
  cliente      text,
  entrega      date,
  tipo         text,
  obs          text,
  factura_id   uuid references public.facturas(id) on delete set null,
  actualizado  timestamptz not null default now()
);
alter table public.unidades add column if not exists vendedor text;
alter table public.unidades add column if not exists instalador text;
alter table public.unidades add column if not exists lote   uuid;         -- identifica cada importación
alter table public.unidades add column if not exists creado timestamptz default now();
create index if not exists unidades_lote_idx on public.unidades (lote);

create index if not exists unidades_codigo_idx on public.unidades (codigo);
create index if not exists unidades_situacion_idx on public.unidades (situacion);

-- -------------------------------------------------------------- movimientos
create table if not exists public.movimientos (
  id      uuid primary key default gen_random_uuid(),
  ts      timestamptz not null default now(),
  texto   text not null,
  serie   text,
  usuario text
);
create index if not exists movimientos_ts_idx on public.movimientos (ts desc);

-- --------------------------------------------------------------- cotizaciones
-- Las crea el vendedor. Cada uno ve y edita las suyas; el admin las ve todas.
create table if not exists public.cotizaciones (
  id            uuid primary key default gen_random_uuid(),
  usuario_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  usuario_email text,
  cliente       text,
  destino       text,
  modalidad     text default 'Venta' check (modalidad in ('Venta','Arriendo')),
  uf            numeric,
  seguro        boolean default true,
  iva           boolean default true,
  lineas        jsonb not null default '[]'::jsonb,
  envio_uf      numeric,
  instalacion_uf numeric,
  total_uf      numeric,
  creada        timestamptz not null default now()
);
create index if not exists cotizaciones_usuario_idx on public.cotizaciones (usuario_id, creada desc);

-- columnas agregadas después de la primera versión
alter table public.cotizaciones add column if not exists fecha         date default current_date;
alter table public.cotizaciones add column if not exists visitas       integer default 0;
alter table public.cotizaciones add column if not exists horas         numeric default 0;
alter table public.cotizaciones add column if not exists enviar        boolean default true;
alter table public.cotizaciones add column if not exists instalar      boolean default true;
alter table public.cotizaciones add column if not exists instalaciones integer;

-- ============================ Vista para vendedores ===================
-- Los vendedores NO leen la tabla unidades: no ven series, clientes ni costos.
-- Solo este resumen de disponibilidad por modelo.
create or replace view public.v_disponibilidad as
  select codigo,
         count(*) filter (where situacion = 'Disponible')   as disponibles,
         count(*) filter (where situacion = 'Reservado')    as reservados,
         count(*) filter (where situacion = 'En revisión')  as revision,
         count(*)                                          as total
  from public.unidades
  group by codigo;

grant select on public.v_disponibilidad to authenticated;

-- ====================== Seguridad a nivel de fila =====================
alter table public.perfiles     enable row level security;
alter table public.proveedores  enable row level security;
alter table public.modelos      enable row level security;
alter table public.fotos        enable row level security;
alter table public.facturas     enable row level security;
alter table public.unidades     enable row level security;
alter table public.movimientos  enable row level security;

-- perfiles: cada uno ve el suyo; el admin los ve todos y puede cambiar roles.
drop policy if exists perfil_propio on public.perfiles;
create policy perfil_propio on public.perfiles for select to authenticated
  using (id = auth.uid() or public.es_admin());
drop policy if exists perfil_admin on public.perfiles;
create policy perfil_admin on public.perfiles for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- catálogo, fotos y proveedores: todos leen, solo el admin escribe.
do $$
declare t text;
begin
  foreach t in array array['modelos','fotos','proveedores'] loop
    execute format('drop policy if exists %I on public.%I', t || '_lectura', t);
    execute format('create policy %I on public.%I for select to authenticated using (true)', t || '_lectura', t);
    execute format('drop policy if exists %I on public.%I', t || '_admin', t);
    execute format('create policy %I on public.%I for all to authenticated using (public.es_admin()) with check (public.es_admin())', t || '_admin', t);
  end loop;
end $$;

-- cotizaciones: cada vendedor las suyas, el administrador todas.
alter table public.cotizaciones enable row level security;
drop policy if exists cotiza_propias on public.cotizaciones;
create policy cotiza_propias on public.cotizaciones for all to authenticated
  using      (usuario_id = auth.uid() or public.es_admin())
  with check  (usuario_id = auth.uid() or public.es_admin());

-- los modelos desactivados solo los ve el administrador.
drop policy if exists modelos_lectura on public.modelos;
create policy modelos_lectura on public.modelos for select to authenticated
  using (activo or public.es_admin());

-- unidades y movimientos: solo administradores, en lectura y escritura.
do $$
declare t text;
begin
  foreach t in array array['unidades','movimientos','facturas'] loop
    execute format('drop policy if exists %I on public.%I', t || '_admin', t);
    execute format('create policy %I on public.%I for all to authenticated using (public.es_admin()) with check (public.es_admin())', t || '_admin', t);
  end loop;
end $$;

-- ======================== Archivos de facturas ========================
-- Bucket privado: solo los administradores suben y descargan.
insert into storage.buckets (id, name, public)
  values ('facturas', 'facturas', false)
  on conflict (id) do nothing;

drop policy if exists facturas_archivos on storage.objects;
create policy facturas_archivos on storage.objects for all to authenticated
  using      (bucket_id = 'facturas' and public.es_admin())
  with check (bucket_id = 'facturas' and public.es_admin());

-- ===================== Marca de tiempo automática =====================
create or replace function public.tocar()
returns trigger language plpgsql as $$
begin new.actualizado = now(); return new; end $$;

drop trigger if exists modelos_tocar on public.modelos;
create trigger modelos_tocar before update on public.modelos
  for each row execute function public.tocar();

drop trigger if exists unidades_tocar on public.unidades;
create trigger unidades_tocar before update on public.unidades
  for each row execute function public.tocar();

-- =====================================================================
--  Después de ejecutar esto:
--  1) Authentication → Users → Add user (correo y contraseña) para cada persona.
--  2) Convierte en administrador a quien corresponda:
--       update public.perfiles set rol = 'admin' where email = 'tu.correo@rexmas.com';
--  3) Carga el catálogo desde la app (Ajustes → Cargar catálogo Rex+)
--     o ejecutando catalogo.sql.
-- =====================================================================
