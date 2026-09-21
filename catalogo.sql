-- =====================================================================
--  Catálogo Rex+ — 37 modelos con precios en UF y ficha técnica.
--  Extraído de Stock_Equipos_Tecnologia_Asistencia.xlsx
--  (hojas Stock Equipos, Funcionalidades Equipos y Costos Envios).
--  Ejecútalo después de esquema.sql. Se puede repetir sin duplicar.
-- =====================================================================

insert into public.modelos (codigo, modelo, nombre, categoria, venta_uf, arriendo_uf, ficha, func) values
  ('CJ-IN01A', 'Genérico', 'Caja Protectora IN01-A', 'Cajas', 3.75, 0.27, '{}'::jsonb, '{}'::jsonb),
  ('CJ-IN01A-IMP', 'Genérico', 'Caja Metálica IN01-A + Impresora (No Incluida)', 'Cajas', 4.85, 0.35, '{}'::jsonb, '{}'::jsonb),
  ('CJ-MB360', 'Genérico', 'Caja Metálica MB360', 'Cajas', 3.75, 0.27, '{}'::jsonb, '{}'::jsonb),
  ('CJ-M560VL', 'Genérico', 'Caja Metálica MB560VL', 'Cajas', 3.75, 0.27, '{}'::jsonb, '{}'::jsonb),
  ('CJ-PF', 'Genérico', 'Caja Metálica Proface X', 'Cajas', 3.75, 0.27, '{}'::jsonb, '{}'::jsonb),
  ('CJ-SF-V4L', 'Genérico', 'Caja Metálica Speed Face V4L', 'Cajas', 3.75, 0.27, '{}'::jsonb, '{}'::jsonb),
  ('CJ-SF-V5L', 'Genérico', 'Caja Metálica Speed Face V5L', 'Cajas', 3.75, 0.27, '{}'::jsonb, '{}'::jsonb),
  ('CJ-G3', 'Genérico', 'Caja Metálica G3', 'Cajas', 3.75, 0.27, '{}'::jsonb, '{}'::jsonb),
  ('ZK-G3', 'G3', 'CONTROL DE ASISTENCIA: MODELO G3', 'Control de Asistencia', 15.0, 1.25, '{"peso": 2.1, "largo": 30.0, "alto": 12.0, "ancho": 25.0, "url": "https://drive.google.com/file/d/1h09emwrE7OuMkxUaM-Wib7tMOgNajqj7/view?usp=drive_link"}'::jsonb, '{"bateria": "si", "wifi": "opcional", "huella": "si", "rostro": "si", "tarjeta": "si", "palma": "opcional", "marcaje": "si", "enrolamiento": "si", "firma": "no", "controlAcceso": "si", "impresora": "si"}'::jsonb),
  ('ZK-IN01A', 'IN01-A', 'CONTROL DE ASISTENCIA: MODELO IN01-A', 'Control de Asistencia', 8.4, 0.466667, '{"peso": 1.9, "largo": 27.0, "alto": 9.0, "ancho": 23.0, "url": "https://drive.google.com/file/d/1c5wCegottE7Qd4pm27AoEeb9xlo3MseM/view?usp=drive_link"}'::jsonb, '{"bateria": "si", "wifi": "no", "huella": "si", "rostro": "no", "tarjeta": "si", "palma": "no", "marcaje": "si", "enrolamiento": "si", "firma": "no", "controlAcceso": "si", "impresora": "si"}'::jsonb),
  ('ZK-IN05-A', 'IN05-A', 'CONTROL DE ASISTENCIA: MODELO IN05-A', 'Control de Asistencia', 10.36, 0.575556, '{"peso": 1.9, "largo": 27.0, "alto": 9.0, "ancho": 23.0, "url": "https://drive.google.com/file/d/1EVAhBuVUrMB9TLEci31jMp_p83idSIim/view?usp=drive_link"}'::jsonb, '{"bateria": "si", "wifi": "si", "huella": "si", "rostro": "no", "tarjeta": "si", "palma": "no", "marcaje": "si", "enrolamiento": "si", "firma": "no", "controlAcceso": "si", "impresora": "si"}'::jsonb),
  ('ZK-KF160', 'KF160', 'KF160  CONTROL DE ASISTENCIA STAND ALONE', 'Control de Asistencia', null, null, '{}'::jsonb, '{"bateria": "no", "wifi": "no", "huella": "si", "rostro": "si", "tarjeta": "si", "palma": "no", "marcaje": "si", "enrolamiento": "si", "firma": "no", "controlAcceso": "no", "impresora": "no"}'::jsonb),
  ('ZK-MB360', 'MB360', 'CONTROL DE ASISTENCIA: MB360', 'Control de Asistencia', 6.75, 0.4, '{"peso": 1.0, "largo": 27.0, "alto": 9.0, "ancho": 23.0, "url": "https://drive.google.com/file/d/10lrvj2wmNN03dHjmeCPguaE1h43-VA3n/view?usp=drive_link"}'::jsonb, '{"bateria": "opcional", "wifi": "opcional", "huella": "si", "rostro": "si", "tarjeta": "si", "palma": "no", "marcaje": "si", "enrolamiento": "si", "firma": "no", "controlAcceso": "si", "impresora": "si"}'::jsonb),
  ('ZK-MB560VL', 'MB560VL', 'MB560VL CONTROL DE ASISTENCIA STAND ALONE', 'Control de Asistencia', 10.13, 0.562778, '{"peso": 1.0, "largo": 27.0, "alto": 9.0, "ancho": 23.0, "url": "https://drive.google.com/file/d/1_QPhCQ4Mw7pChIoW17H_uAB-JFxQm2g9/view?usp=drive_link"}'::jsonb, '{"bateria": "no", "wifi": "si", "huella": "si", "rostro": "si", "tarjeta": "si", "palma": "no", "marcaje": "si", "enrolamiento": "si", "firma": "no", "controlAcceso": "si", "impresora": "no"}'::jsonb),
  ('ZK-PFX-TI', 'Proface-X TI', 'CONTROL DE ASISTENCIA: Proface-X TI', 'Control de Asistencia', 43.4, 2.5, '{"peso": 2.3, "largo": 27.0, "alto": 12.0, "ancho": 19.0, "url": "https://drive.google.com/file/d/1mDIseBvtpNL7QHomNdpObF-DtztV6nUC/view?usp=drive_link"}'::jsonb, '{"bateria": "no", "wifi": "opcional", "huella": "no", "rostro": "si", "tarjeta": "no", "palma": "si", "marcaje": "si", "enrolamiento": "si", "firma": "no", "controlAcceso": "si", "impresora": "no"}'::jsonb),
  ('ZK-SF-V4L', 'SpeedFace-V4L', 'CONTROL DE ASISTENCIA: SpeedFace-V4L', 'Control de Asistencia', 6.0, 0.35, '{"peso": 1.0, "largo": 24.0, "alto": 17.0, "ancho": 20.0, "url": "https://drive.google.com/file/d/12ou2ZZME2YzPaS-GyNvsJsvjrzZcOzUu/view?usp=drive_link"}'::jsonb, '{"bateria": "no", "wifi": "opcional", "huella": "no", "rostro": "si", "tarjeta": "si", "palma": "si", "marcaje": "si", "enrolamiento": "si", "firma": "no", "controlAcceso": "si", "impresora": "no"}'::jsonb),
  ('ZK-SF-V5L', 'SpeedFace-V5L', 'CONTROL DE ASISTENCIA: SpeedFace-V5L', 'Control de Asistencia', 20.0, 1.8, '{"peso": 1.5, "largo": 27.0, "alto": 10.0, "ancho": 20.0, "url": "https://drive.google.com/file/d/1Jf23JEQ8TJBsoeGL1ntn-elmNh8_mE0E/view?usp=drive_link"}'::jsonb, '{"bateria": "no", "wifi": "opcional", "huella": "si", "rostro": "si", "tarjeta": "si", "palma": "si", "marcaje": "si", "enrolamiento": "si", "firma": "no", "controlAcceso": "si", "impresora": "no"}'::jsonb),
  ('ZK-SF2A', 'SenseFace 2A', 'CONTROL DE ASISTENCIA: Senseface 2A', 'Control de Asistencia', 3.0, 0.3, '{}'::jsonb, '{}'::jsonb),
  ('ZK-FD-19', 'FD19', 'CONTROL DE ACCESO: FD19', 'Control de Asistencia', 9.09, 0.505, '{}'::jsonb, '{}'::jsonb),
  ('ZK-UFACE602', 'UFACE602', 'UFACE602 CONTROL DE ASISTENCIA STAND ALONE', 'Control de Asistencia', null, null, '{"url": "https://rexmas.sharepoint.com/:b:/s/TecnologaAsistencia/EcEtJnW_qN9EqYkJENRnlG4BaUKJRSM8RipHLYigLl_3tg?e=Rgk2a1"}'::jsonb, '{"bateria": "si", "wifi": "no", "huella": "si", "rostro": "si", "tarjeta": "si", "palma": "no", "marcaje": "si", "enrolamiento": "si", "firma": "no", "controlAcceso": "si", "impresora": "no"}'::jsonb),
  ('ZK-S922', 'S922', 'S922 EQUIPO BIOMETRICO PORTATIL, CONTROL DE ASISTENCIA', 'Control de Asistencia', null, null, '{}'::jsonb, '{"bateria": "no", "wifi": "no", "huella": "no", "rostro": "no", "tarjeta": "no", "palma": "no", "marcaje": "no", "enrolamiento": "no", "firma": "no", "controlAcceso": "no", "impresora": "no"}'::jsonb),
  ('SILK-TS-2022PRO', 'TS2022', 'TORNIQUETE BIDIRECCIONAL SIMPLE ABATIBLE + Controladora', 'Torniquetes', 42.94, 0.0, '{"url": "https://drive.google.com/file/d/116NjuT90a1uZc5iTRtXB7nxa6RIXrJjG/view?usp=drive_link"}'::jsonb, '{"bateria": "no", "wifi": "no", "huella": "si", "rostro": "no", "tarjeta": "si", "palma": "no", "marcaje": "no", "enrolamiento": "si", "firma": "no", "controlAcceso": "si", "impresora": "no"}'::jsonb),
  ('TR-2-BRAZOSTS2222', 'TS2222', 'TORNIQUETE BIDIRECCIONAL DOBLE', 'Torniquetes', 72.21, 0.0, '{}'::jsonb, '{}'::jsonb),
  ('ZK-ZK9500', 'Huellero ZKTECO', 'ENROLADOR DE HUELLAS USB STANDARD: MODELO ZK-ZK9500', 'Huelleros', 3.0, 0.2, '{"peso": 0.2, "largo": 11.0, "alto": 7.0, "ancho": 9.0, "url": "https://drive.google.com/file/d/1LyehpZuF01dTzzKCD3lhJJ-U6wKQ183C/view?usp=drive_link"}'::jsonb, '{"bateria": "no", "wifi": "no", "huella": "no", "rostro": "no", "tarjeta": "no", "palma": "no", "marcaje": "no", "enrolamiento": "si", "firma": "no", "controlAcceso": "no", "impresora": "no"}'::jsonb),
  ('ZK-SLK20R', 'Huellero ZKTECO', 'ENROLADOR DE HUELLAS USB STANDARD: MODELO ZK-SLK20R', 'Huelleros', 3.0, 0.2, '{}'::jsonb, '{}'::jsonb),
  ('HU-4500-FR', 'HID', 'HUELLERO ASISTENCIA Y FIRMA: MODELO 4500', 'Huelleros', 3.5, 0.25, '{"peso": 0.2, "largo": 15.0, "alto": 4.0, "ancho": 8.0, "url": "https://drive.google.com/file/d/1_SRtGN5nECThoYYl-Oen1hygofP_RS_9/view?usp=drive_link"}'::jsonb, '{"bateria": "no", "wifi": "no", "huella": "no", "rostro": "no", "tarjeta": "no", "palma": "no", "marcaje": "si", "enrolamiento": "si", "firma": "si", "controlAcceso": "no", "impresora": "no"}'::jsonb),
  ('ZK-ZK8008', 'ZK8008', 'IMPRESORA TERMICA ZK8008', 'Impresoras', 3.0, 0.25, '{"peso": 2.1, "largo": 22.0, "alto": 17.0, "ancho": 22.0}'::jsonb, '{}'::jsonb),
  ('ZK-BAR-CMP200', 'CMP 200', 'BARRERA VEHICULAR CMP200', 'Barrera', 56.7, 0.0, '{}'::jsonb, '{}'::jsonb),
  ('FU-PO-GA-12V/5A', 'DLUX CP12-5A', 'FUENTE DE PODER C/CARGADOR/GABINETE 12V/5A', 'Accesorios', 1.48, 0.0, '{}'::jsonb, '{}'::jsonb),
  ('ACC-BT-NT', 'Generico', 'BOTON NO TOUCH', 'Accesorios', 0.57, 0.0, '{}'::jsonb, '{}'::jsonb),
  ('TJ-Prox', 'Genérico', 'Tarjetas de proximidad', 'Accesorios', 0.062, 0.0, '{}'::jsonb, '{}'::jsonb),
  ('ZK-CT-INBIO260PRO', 'INBIO260PRO', 'INBIO 260 PRO CONTROLADOR TORNIQUETE 2 PUERTAS PUSH', 'Accesorios', 12.0, 0.0, '{}'::jsonb, '{}'::jsonb),
  ('ZK-CT-INBIO460PRO', 'INBIO460PRO', 'INBIO 460 PRO CONTROLADOR TORNIQUETE 4 PUERTAS PUSH', 'Accesorios', 15.0, 0.0, '{}'::jsonb, '{}'::jsonb),
  ('ACC-BAT-12V', 'Generico', 'BATERIA 12V/7A', 'Accesorios', 0.53, 0.0, '{}'::jsonb, '{}'::jsonb),
  ('ACC-RET-EM', null, 'RETENEDOR ELECTROMAGNETICO', 'Accesorios', 1.38, 0.0, '{}'::jsonb, '{}'::jsonb),
  ('ZK-SOP-L', 'ZK-AL-280PL', 'SOPORTE TIPO L PARA RETENEDOR AL280', 'Accesorios', 0.53, 0.0, '{}'::jsonb, '{}'::jsonb),
  ('MINI-UPS', 'Mini-UPS', 'MINI UPS BATERIA EXTERNA', 'Accesorios', 1.0, 0.0, '{}'::jsonb, '{}'::jsonb)
on conflict (codigo) do update set
  modelo      = excluded.modelo,
  nombre      = excluded.nombre,
  categoria   = excluded.categoria,
  venta_uf    = excluded.venta_uf,
  arriendo_uf = excluded.arriendo_uf,
  ficha       = public.modelos.ficha || excluded.ficha,
  func        = public.modelos.func  || excluded.func;
