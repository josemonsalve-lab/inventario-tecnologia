# Inventario de equipos — app Android (PWA) con inventario compartido

Control de equipos **por número de serie**, con fotos y ficha técnica del producto, ficha de proveedor y **dos perfiles de usuario**: administrador y vendedor. Se instala en el teléfono y funciona sin señal.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La app completa |
| `config.EJEMPLO.js` | Plantilla de la conexión: cópiala como `config.js` la primera vez |
| `esquema.sql` | Tablas, roles y permisos de la base de datos |
| `catalogo.sql` | Los 37 modelos con precios y ficha técnica |
| `logo-rex.png` | Logo del encabezado, de la pantalla de acceso y del PDF |
| `jspdf.umd.min.js` | Generador del PDF de la cotización, incluido para que funcione sin internet |
| `xlsx.mini.min.js` | Lector de archivos Excel para la importación, también incluido |
| `manifest.webmanifest`, `sw.js`, `icon-*.png` | Instalación en el teléfono y uso sin conexión |

La paleta de la app sale del logo: celeste `#00BAFF` para las acciones, lima `#BEDA69` para lo disponible y un azul profundo `#0A5C85` del mismo tono para los textos y títulos, que es el que da contraste suficiente para leer en pantalla. Si cambian el logo, reemplaza `logo-rex.png` manteniendo el nombre y el fondo transparente.

## Los dos perfiles

**Administrador** — bodega y operaciones. Ve y edita todo: modelos, fichas técnicas, fotos, equipos serie por serie, clientes, costos de compra, órdenes de compra, proveedores con sus facturas, reportes e historial. Importa y exporta.

**Vendedor** — solo consulta, y no ve nada sensible. Cuatro pantallas: catálogo con fotos y precios en UF, disponibilidad por modelo, cotizador, y su cuenta. Puede abrir la ficha técnica completa de cada equipo, ver cuántas unidades hay disponibles y reservadas, y el plazo de reposición cuando no hay stock.

Lo que un vendedor **no** puede ver: números de serie, nombres de clientes, costos de compra, órdenes de compra, facturas de proveedores ni el historial. Esto no es solo la interfaz: la base de datos se lo impide. Los vendedores no tienen permiso de lectura sobre la tabla `unidades`; leen una vista resumida (`v_disponibilidad`) que solo entrega conteos por modelo. Aunque alguien consultara la API a mano con su cuenta, no obtendría esos datos.

## Ocultar modelos a los vendedores

Cada modelo se puede desactivar. En su ficha técnica hay un botón **Desactivar para vendedores**, y en el formulario de edición el campo *Visible para vendedores*.

Un modelo desactivado desaparece del catálogo y de la disponibilidad del vendedor, y tampoco aparece en la lista de equipos del cotizador, así que no puede cotizarlo. Si arrastraba una línea de una cotización anterior con ese modelo, deja de sumarse al total.

El administrador lo sigue viendo todo: la tarjeta aparece atenuada con la etiqueta *Inactivo*, la ficha muestra un aviso y en su propio cotizador el modelo sigue disponible, marcado como inactivo. Los equipos de ese modelo siguen contando en el stock y en los reportes.

Esto no es solo la interfaz: la base de datos entrega los modelos desactivados únicamente a los administradores, así que un vendedor no los obtendría ni consultando la API por fuera de la app.

## Vaciar equipos

En Ajustes, el botón **Vaciar equipos y mantener el catálogo** sirve para empezar de nuevo sin perder los modelos. Primero muestra la lista de modelos que tienen equipos, con cuántos hay en cada uno y cuántos están entregados a clientes, y eliges cuáles vaciar: puede ser uno solo, varios o todos.

Después pasa a una pantalla de confirmación que resume cuántos equipos de cuántos modelos se van a eliminar, advierte si hay entregados a clientes y pide **escribir la palabra VACIAR**. Hasta que no esté escrita, el botón no borra nada.

Los modelos, sus fotos y sus fichas técnicas se conservan siempre. Lo único que también se elimina son los modelos "Sin clasificar" que haya creado una importación y que queden sin equipos.

## Reportes

Pestaña **Reportes** del administrador, donde antes estaba Movimientos. Cada reporte muestra un resumen arriba, el detalle abajo y dos formas de llevárselo: **PDF con el formato Rex+** para enviar o imprimir, y CSV para seguir trabajándolo en Excel. Ambos incluyen más columnas de las que caben en pantalla.

El PDF lleva la franja azul con el logo, el nombre del reporte, la fecha de emisión y, cuando corresponde, el período y el texto buscado. Debajo van las cifras de resumen y la tabla completa, que se reparte en varias páginas numeradas con el encabezado repetido. Se arma en vertical o apaisado según cuántas columnas tenga el reporte, y las columnas se dimensionan con el contenido real para que nada quede cortado. El buscador de la cabecera filtra el reporte que estés viendo, y los que dependen de fechas tienen filtro de período: todo, 30 días, 90 días o el año en curso.

- **Por modelo**: cuántos equipos hay de cada uno y cómo se reparten entre disponibles, reservados, entregados, en revisión y de baja, más la valorización del stock en UF.
- **Disponibilidad**: ordenado por lo que falta. Muestra el mínimo definido, cuántas unidades faltan para alcanzarlo y el plazo de reposición del proveedor cuando algo está en cero.
- **Por cliente**: equipos entregados a cada uno, cuántos modelos distintos, primera y última entrega. El CSV incluye las series, que es lo que sirve cuando un cliente reclama por un equipo.
- **Por proveedor**: equipos comprados, inversión en pesos, facturas cargadas y monto facturado, con origen y plazo de entrega.
- **Por vendedor**: equipos entregados por cada uno, cuántos clientes distintos y las cotizaciones que ha creado con su total en UF.
- **Por equipo**: la trazabilidad de una serie. Escribe la serie, el cliente o la orden de compra en el buscador y aparece de dónde vino, con qué factura, a qué costo, quién la vendió y a quién.
- **Movimientos**: el historial de altas, entregas y cambios de situación, con el usuario que hizo cada uno.

### Acotar el reporte

Sobre cualquiera de los siete se puede elegir exactamente qué sale, con tres controles:

- **Filtros**: rango de fechas propio (desde y hasta), situación, categoría y proveedor. Las fechas se comparan con la de entrega y, si el equipo no la tiene, con la de ingreso. Los botones de período siguen ahí como atajos, y el chip queda marcado en rojo mientras haya algún filtro puesto.
- **Columnas**: enciende y apaga las que quieras. Las apagadas desaparecen del PDF y del CSV, lo que sirve para sacar, por ejemplo, un listado por equipo sin costos ni órdenes de compra para mandárselo a un cliente.
- **Filas**: cada línea tiene un cuadro para marcarla. Si marcas alguna, el PDF y el CSV salen solo con esas; si no marcas ninguna, salen todas. Arriba de la lista aparece cuántas llevas y los botones para marcarlas todas o quitar la selección.

El PDF deja constancia en el encabezado de con qué se generó: el período o rango, los filtros aplicados, el texto buscado y si fue sobre una selección de filas.

Para que el reporte por vendedor funcione hay un campo **Vendedor** en la ficha de cada equipo, junto al cliente y la fecha de entrega. Se completa al momento de entregar y sugiere los nombres ya usados, para que no queden escritos de tres formas distintas.

## Cotizador

Está en la pestaña **Cotizador** del vendedor; el administrador entra desde Ajustes. Suma tres cosas: equipos, envío e instalación.

Se elige cliente, ciudad de destino y modalidad (venta o arriendo). Después se agregan equipos con cantidad y descuento opcional; el precio sale del catálogo, de venta o de arriendo mensual según la modalidad. Tocando una línea se cambia la cantidad o el descuento. Si un modelo tiene menos stock del que se está cotizando, aparece el aviso en la línea.

### El valor de la UF

Se actualiza solo, una vez al día, y **no se puede editar**. La app lo consulta en `https://mindicador.cl/api/uf`, que publica el dato oficial del Banco Central. Debajo del monto aparece la fecha del valor y un botón *Actualizar* para forzar la consulta.

mindicador.cl es un servicio gratuito y sin fines de lucro. Si alguna vez deja de responder, la app sigue funcionando con el último valor guardado y el aviso correspondiente; cambiar de fuente es modificar una sola línea en `index.html`.

Sin conexión se conserva el último valor obtenido, con su fecha a la vista. Las cotizaciones guardadas mantienen la UF con la que se hicieron, para que un documento enviado no cambie de monto después.

### Solo visitas técnicas

El cotizador también sirve cuando no se vende nada: una revisión, una capacitación, una reinstalación. Deja la lista de equipos vacía y completa el bloque **Visitas técnicas** con cuántas visitas de 2 horas y cuántas horas adicionales.

Los valores salen de la misma hoja *Costos Instalacion* de tu archivo: la visita de 2 horas cuesta lo mismo que una instalación en las 30 ciudades, y la hora adicional está en 0,714 UF netas, a la que se le aplica el mismo margen que al resto de los servicios. Debajo de los campos aparece cuánto vale cada cosa en la ciudad elegida.

Cuando no hay equipos, la cotización no arrastra envío ni instalación, y el PDF sale titulado *Cotización de servicio*.

### Envío e instalación

Dos interruptores deciden qué entra en el total. *Con envío* lo incluye o lo deja fuera, útil cuando el cliente retira en oficina o pone su propio transporte; al apagarlo desaparece también el recargo por seguro. *Con instalación* hace lo mismo con la puesta en marcha.

Cuando la instalación está activa, el campo *Instalaciones a cobrar* viene con una por equipo, que es el criterio de tu planilla, pero se puede cambiar: cinco equipos en la misma oficina pueden cobrarse como una sola instalación, o como las que correspondan.

Los costos vienen de tu propio archivo:

- **Envío**: la tabla de 336 tarifas por modelo y destino de la hoja *Costos Envios*, 12 modelos y 28 ciudades. Se usa el monto máximo del tramo, que es el criterio conservador, multiplicado por la cantidad. El interruptor *Seguro de envío +25%* aplica el mismo factor que traía la planilla.
- **Instalación**: la hoja *Costos Instalacion*, con las 30 ciudades y el valor con margen. Por defecto se cobra una por equipo, tal como dice la nota de tu archivo, y cuando la ciudad requiere traslado se indica desde dónde viaja el técnico.

Los 26 modelos del catálogo que no tienen tarifa de envío cargada (cajas, accesorios, torniquetes) quedan marcados y aparece un campo para escribir el envío cotizado a mano.

El total se muestra en UF y en pesos, con IVA opcional. En arriendo se separa el pago único (envío e instalación) del cargo mensual. *Guardar* lo deja en la lista de cotizaciones: cada vendedor ve solo las suyas, el administrador ve todas. *Copiar resumen* deja el texto listo para pegar en un correo o WhatsApp.

### El PDF

*Descargar PDF* genera el documento para enviar al cliente: encabezado azul con el logo, número de cotización, fecha, cliente, destino, modalidad y ejecutivo; el detalle de equipos con cantidad, valor unitario y total en UF; y el bloque de totales con envío, instalación e IVA en UF y en pesos. Al pie van las notas: con qué UF se calcularon los pesos y de qué día, cómo se cobra la instalación y la validez de 15 días.

La fecha viene del campo *Fecha de la cotización*, editable por si se emite con fecha distinta a la de hoy. El número de cotización se asigna al guardar; si aprietas *Descargar PDF* sin haber guardado, la app la guarda primero para que el documento salga con folio y quede registrada.

El PDF se arma en el teléfono, sin pasar por ningún servidor, así que funciona igual sin señal. Por eso el generador viene incluido en la carpeta (`jspdf.umd.min.js`) y no se descarga de internet.

Las tarifas de envío e instalación sí están fijadas dentro de `index.html`; si cambian, mándame el Excel nuevo y las regenero. El valor 38.121,27 que traía tu planilla quedó solo como respaldo para cuando no haya conexión el primer día de uso.

## Ingreso de equipos por número de serie

Es el flujo principal de bodega, en la pestaña **Equipos** con el botón **+**. Arriba se define una sola vez lo que comparten todos los equipos de esa entrada: qué modelo es, de qué proveedor viene, a qué factura corresponde, la orden de compra, el costo unitario, la fecha de ingreso, el estado y la ubicación.

Abajo va el campo de series. Escribes una y pulsas Enter, y el campo queda listo para la siguiente. Con un lector de código de barras funciona igual, porque cada lectura termina en Enter: puedes ir pasando equipo por equipo sin tocar el teléfono. Si prefieres, el bloque *Pegar varias de una vez* acepta una lista completa.

Al elegir el equipo aparece su foto y su precio, para confirmar de un vistazo que estás ingresando el modelo correcto. Cada serie agregada se lista en pantalla y las repetidas quedan marcadas en rojo con el aviso de que no se guardarán, así no se duplica nada. El botón final dice cuántos equipos va a guardar. Todos entran con el mismo proveedor y la misma factura, y quedan registrados en el historial en una sola línea.

### Entregar varios equipos al mismo cliente

En la pestaña Equipos, cada fila tiene un cuadro para marcarla. Al marcar uno o más aparece el botón **Asignar N equipos a un cliente**, que abre una sola ventana con el nombre del cliente, la fecha de entrega, el tipo, el vendedor, el instalador y la ubicación.

Lo que se aplica es lo que escribas: los campos que dejes vacíos no se tocan en cada equipo, así que puedes asignar solo el cliente y conservar los vendedores que ya tenía cada uno. Todos pasan a Entregado y queda un único movimiento en el historial, "Entrega de N equipos a Cliente".

El botón *Todos* marca los equipos que estés viendo, así que si primero filtras por situación o buscas por modelo, la selección respeta ese filtro.

### Qué se edita en cada lugar

Los datos que identifican al equipo —número de serie, modelo, proveedor, factura, orden de compra, costo y fecha de ingreso— se definen una sola vez, al ingresarlo, y no se editan desde la ficha individual. La ficha muestra la serie, la fecha de ingreso y la situación actual arriba, y el modelo con su código junto a la foto. Lo editable es lo que cambia con el uso: estado, ubicación, cliente, vendedor, fecha de entrega, tipo, observaciones y la foto de la unidad.

Si una serie quedó con el modelo equivocado, en su ficha hay un botón **Cambiar el modelo de este equipo**, bajo el título Correcciones. Abre un diálogo aparte que muestra con qué modelo figura hoy y deja elegir el nuevo. La serie, la situación, el cliente y las fechas se conservan, y el cambio queda anotado en el historial como "Cambio de modelo: X → Y".

Cuando el error afecta a un lote completo —típicamente una importación que dejó todos los equipos en un modelo creado por error— la ficha técnica de ese modelo tiene **Mover sus N equipos a otro modelo**, que los reasigna todos de una vez.

### La situación se deduce sola

Ya no hay lista desplegable de situación. Al escribir un cliente o una fecha de entrega y guardar, el equipo pasa a **Entregado**; si se borran ambos, vuelve a **Disponible**. Los tres estados que no dependen de una entrega se fijan con botones al pie de la ficha, que además dejan el movimiento en el historial:

- *Registrar devolución*: limpia el cliente y la fecha, y devuelve el equipo a disponible.
- *Enviar a revisión* y *Marcar como disponible*.
- *Dar de baja* y *Reactivar equipo*.

Un equipo en revisión o dado de baja conserva ese estado aunque se guarden otros cambios en la ficha; solo los botones lo sacan de ahí.

Esto evita que el mismo lote termine con tres proveedores distintos porque alguien corrigió una ficha suelta. Si un ingreso quedó mal cargado, lo correcto es eliminar esas series y volver a ingresarlas con los datos correctos, que además deja el movimiento registrado en el historial.

### La foto en la lista de equipos

Cada equipo se ve con la foto de su modelo, así la lista de series deja de ser una pared de códigos. Si además le tomas una foto a esa unidad en particular —para dejar registro del estado en que llegó o se entregó— esa reemplaza a la del modelo y se distingue en su ficha. Al quitarla, vuelve a mostrarse la del modelo.

## Facturas de proveedores

Dentro de cada proveedor hay una sección de facturas. Cada una guarda número, fecha, monto con su moneda (CLP, USD o UF), notas y el archivo: un PDF o una foto del documento, hasta 8 MB. Las fotos se comprimen antes de subir; los PDF van tal cual.

El archivo queda en un bucket privado de Supabase. No tiene URL pública: cuando alguien toca *Ver archivo*, la app pide un enlace firmado que caduca en una hora. Solo los administradores pueden subir o descargar.

La factura también muestra qué equipos llegaron en ella. Ese vínculo se crea solo cuando ingresas los equipos eligiendo la factura, y aparece en la exportación a CSV como una columna más.

## Puesta en marcha

### 1. Crear la base (10 minutos, una sola vez)

1. Entra a supabase.com y crea un proyecto gratuito. Elige la región más cercana (`South America (São Paulo)`).
2. Abre **SQL Editor** y ejecuta `esquema.sql` completo. Crea las tablas, la vista de disponibilidad, las cotizaciones, el bucket privado de facturas y todos los permisos. Si ya tenías una versión anterior de la base, ejecútalo de nuevo: está escrito para poder repetirse sin borrar datos.
3. Ejecuta `catalogo.sql`. Deja cargados los 37 modelos con precios y ficha técnica.
4. Ve a **Project Settings → API** y copia *Project URL* y la clave *anon public*.
5. Pega ambas en `config.js`.

La clave anon es pública por diseño: no da acceso a nada por sí sola. Quien decide qué se puede ver es el rol del usuario que inicia sesión.

### 2. Crear las cuentas

En **Authentication → Users → Add user**, crea una cuenta con correo y contraseña para cada persona. Todos entran como vendedores. Para convertir a alguien en administrador, en el SQL Editor:

```sql
update public.perfiles set rol = 'admin' where email = 'tu.correo@rexmas.com';
```

Para ver quién tiene qué rol:

```sql
select email, rol from public.perfiles order by rol, email;
```

### 3. Publicar la app

Android solo instala una app web servida por HTTPS. De menor a mayor esfuerzo:

1. **Netlify Drop** — app.netlify.com/drop, arrastra la carpeta completa y te da una URL al instante.
2. **GitHub Pages** — sube los archivos y activa Pages en Settings.
3. **Servidor de Rex+** — cualquier subdominio existente. Recomendado si va a manejar datos de clientes.

### 4. Instalar en el teléfono

Abre la URL en Chrome y toca **Instalar** arriba a la derecha, o menú ⋮ → *Agregar a pantalla de inicio*. En iPhone: Safari → Compartir → *Agregar a pantalla de inicio*. Cada persona entra con su propia cuenta.

## Actualizar la app más adelante

El paquete **ya no incluye `config.js`**, justamente para que el del servidor nunca se pise. Al actualizar, sube los archivos nuevos sobre la carpeta que ya tienes y deja tu `config.js` donde está. La primera vez, copia `config.EJEMPLO.js` como `config.js` y escribe tus datos.

Si por lo que sea el archivo se pierde, la app no queda inservible: el aviso que aparece incluye un enlace discreto, *Soy el administrador: configurar la conexión*, donde se pegan la URL y la clave una sola vez y quedan guardadas en ese dispositivo. Es una herramienta de recuperación para quien administra, no algo que deba hacer un vendedor. Lo mismo está en Ajustes → Conexión, que en modo conectado solo ven los administradores.

Sobre qué es sensible y qué no: la URL y la clave *publishable* son públicas por diseño, viajan en el código de la app y no dan acceso a nada por sí solas. Quien decide qué ve cada persona es su rol en la tabla `perfiles`, que se aplica dentro de Postgres. La clave que nunca debe salir de Supabase es la `sb_secret_`, que no está en ningún archivo de la app.

Después de subir los archivos, recarga dos veces en el teléfono. El service worker guarda una copia local y la primera recarga solo descarga la versión nueva.

## Probar antes de configurar

Mientras `config.js` mantenga los valores de ejemplo, la app corre en **modo local**: sin login, todo en el teléfono, siempre como administrador. En Ajustes hay un botón *Ver como vendedor* para revisar cómo queda la otra vista. Sirve para mostrarla internamente antes de montar la base.

## Cómo se mantiene sincronizada

Al abrir, la app carga desde la base y refresca cada 20 segundos mientras está en pantalla, más cada vez que vuelves a ella. El indicador de arriba muestra **En vivo**, el tiempo desde la última actualización, o **Sin conexión**.

Los archivos de factura no se guardan en el teléfono: se piden al servidor cada vez que los abres, así que necesitan conexión. Sin señal, la app abre igual con la última copia descargada y avisa que está desconectada. Las fotos quedan guardadas en el teléfono la primera vez que se ven, así que no se descargan de nuevo. Los cambios que hace un administrador se guardan directo en la base; si falla, aparece un aviso y no se pierde lo escrito en el formulario.

Veinte segundos es un intervalo cómodo para bodega y no gasta datos. Si alguna vez necesitan reflejo instantáneo entre dispositivos, Supabase incluye Realtime por websockets y se puede cambiar sin tocar el resto de la app.

## Importar tu planilla actual

Como administrador, en Ajustes → *Importar equipos desde Excel*, eliges el archivo `.xlsx`, `.xls` o `.csv` directamente. La app lo lee en el teléfono, sin subirlo a ningún servidor.

El archivo debe tener estas columnas en la primera fila, en cualquier orden:

```
Serie · Codigo · Situacion · Fecha de ingreso · Fecha de entrega · Cliente · Tipo · Instalador · Vendedor · Proveedor
```

Solo la serie es obligatoria; las columnas que falten quedan vacías. Los códigos se comparan ignorando guiones, espacios, puntos y mayúsculas, así que `ZK-IN05A`, `zk in05 a` y `ZK-IN05-A` entran todos al mismo modelo del catálogo en vez de crear duplicados. La vista previa te muestra qué códigos se reconocieron y cuáles se van a crear como modelo nuevo. Los encabezados se reconocen con o sin tilde y en mayúsculas o minúsculas, y aceptan variantes como "N° de serie", "Modelo" por código o "Ejecutivo" por vendedor. Si no tienes el archivo armado, el botón *Descargar plantilla vacía* genera uno con las columnas correctas.

El proveedor se busca por nombre, ignorando tildes y mayúsculas: si ya existe se reutiliza, y si no, se crea con ese nombre para que después completes su contacto y plazo. Las filas que vengan sin proveedor toman el que elijas en el desplegable de abajo. La vista previa te dice cuáles reconoció y cuáles va a crear.

La app entiende las fechas como texto `aaaa-mm-dd`, como `dd/mm/aaaa` o como fecha real de Excel. La situación acepta la nomenclatura de tu planilla: "No Disponible" entra como Entregado, "Disponible" como disponible, y también reconoce revisión, baja y reservado. El tipo acepta venta, arriendo o préstamo escritos de cualquier forma.

Antes de importar verás un resumen con todo lo que va a pasar, y el detalle de lo que queda fuera: cada serie descartada aparece con su número de fila en el Excel y el motivo. Si ya estaba en el inventario, además muestra con qué modelo, en qué situación, con qué cliente y desde cuándo, para que puedas decidir si el problema es el archivo o el registro anterior. Debajo va la lista de las que sí entran. Recién ahí confirmas. Todo se sube a la base en lotes, así que queda visible para el equipo de inmediato.

Antes de importar conviene normalizar la columna Status del archivo original: hoy tiene 22 escrituras distintas para cinco estados, y todo lo que no calce exacto entra como *Disponible* o *Entregado* según si tiene cliente.

## Respaldos

La base queda respaldada por Supabase, pero el plan gratuito pausa los proyectos que pasan una semana sin actividad. Dos precauciones: que alguien abra la app cada tanto, o subir al plan pago cuando el inventario ya sea el oficial. Además, exportar el CSV desde Ajustes de vez en cuando no cuesta nada.
