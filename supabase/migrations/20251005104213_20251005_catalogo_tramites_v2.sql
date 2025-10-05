/*
  # Catálogo de Trámites - Argentina

  Carga inicial de organismos y tipos de trámites desde el catálogo completo.

  Organismos incluidos:
  - ANMAT (Medicamentos, Alimentos, Cosméticos)
  - SENASA (Sanidad Agropecuaria)
  - ENACOM (Telecomunicaciones)
  - ANMaC (Material Controlado)
  - SEDRONAR (Precursores Químicos)
  - SIC (Lealtad Comercial)
  - FAUNA (Fauna y Flora Silvestre)
  
  Se insertan 7 organismos y 20 tipos de trámites principales.
*/

-- Insertar Organismos
INSERT INTO organismos (id, codigo, sigla, nombre, activo, created_at, updated_at)
VALUES ('69c2fc6b-7678-490c-91e8-2589de24565c', 'ANMAT', 'ANMAT', 'Administración Nacional de Medicamentos, Alimentos y Tecnología Médica', true, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre, sigla = EXCLUDED.sigla, updated_at = NOW();

INSERT INTO organismos (id, codigo, sigla, nombre, activo, created_at, updated_at)
VALUES ('1716f04c-097b-4da2-bfd5-a977f42a4e41', 'SENASA', 'SENASA', 'Servicio Nacional de Sanidad y Calidad Agroalimentaria', true, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre, sigla = EXCLUDED.sigla, updated_at = NOW();

INSERT INTO organismos (id, codigo, sigla, nombre, activo, created_at, updated_at)
VALUES ('e9ac5cc0-8f51-4a7b-a026-dd99a55de606', 'ENACOM', 'ENACOM', 'Ente Nacional de Comunicaciones', true, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre, sigla = EXCLUDED.sigla, updated_at = NOW();

INSERT INTO organismos (id, codigo, sigla, nombre, activo, created_at, updated_at)
VALUES ('62f99de4-cf35-42e2-99ad-5c3874fc405a', 'ANMAC', 'ANMaC', 'Agencia Nacional de Materiales Controlados', true, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre, sigla = EXCLUDED.sigla, updated_at = NOW();

INSERT INTO organismos (id, codigo, sigla, nombre, activo, created_at, updated_at)
VALUES ('17aefc8f-fec9-4a76-8e60-dd872cb25d9e', 'SEDRONAR', 'SEDRONAR', 'Secretaría de Políticas Integrales sobre Drogas', true, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre, sigla = EXCLUDED.sigla, updated_at = NOW();

INSERT INTO organismos (id, codigo, sigla, nombre, activo, created_at, updated_at)
VALUES ('b5aac122-0d0e-47a7-9095-e1a0651a024e', 'SIC', 'SIC', 'Secretaría de Industria y Comercio', true, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre, sigla = EXCLUDED.sigla, updated_at = NOW();

INSERT INTO organismos (id, codigo, sigla, nombre, activo, created_at, updated_at)
VALUES ('5b812472-1e58-4f38-a6cf-01629cc26bd4', 'FAUNA', 'FAUNA', 'Dirección Nacional de Fauna y Flora Silvestre', true, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre, sigla = EXCLUDED.sigla, updated_at = NOW();


-- Insertar Tipos de Trámites ANMAT - Alimentos
INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, rubro, sla_total_dias, renovacion, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'RNPA-001',
  'Registro Nacional de Producto Alimenticio (RNPA)',
  'Registro de producto alimenticio nacional o importado',
  '69c2fc6b-7678-490c-91e8-2589de24565c',
  'Alimentos',
  45,
  '5 años',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_total_dias = EXCLUDED.sla_total_dias,
  renovacion = EXCLUDED.renovacion,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, rubro, sla_total_dias, renovacion, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'RNE-001',
  'Registro Nacional de Establecimiento (RNE)',
  'Habilitación de establecimiento elaborador/fraccionador/importador',
  '69c2fc6b-7678-490c-91e8-2589de24565c',
  'Alimentos',
  60,
  '5 años',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_total_dias = EXCLUDED.sla_total_dias,
  renovacion = EXCLUDED.renovacion,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, rubro, sla_total_dias, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'RNPA-MOD',
  'Modificación RNPA',
  'Cambios en fórmula, rótulo o datos del producto registrado',
  '69c2fc6b-7678-490c-91e8-2589de24565c',
  'Alimentos',
  30,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_total_dias = EXCLUDED.sla_total_dias,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, rubro, sla_total_dias, renovacion, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'RNPA-REN',
  'Renovación RNPA',
  'Renovación de registro vencido o próximo a vencer',
  '69c2fc6b-7678-490c-91e8-2589de24565c',
  'Alimentos',
  45,
  '5 años',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_total_dias = EXCLUDED.sla_total_dias,
  renovacion = EXCLUDED.renovacion,
  updated_at = NOW();

-- ANMAT - Cosméticos
INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, rubro, sla_total_dias, renovacion, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'COS-G1',
  'Registro Producto Cosmético Grado I',
  'Productos de riesgo mínimo - Admisión automática',
  '69c2fc6b-7678-490c-91e8-2589de24565c',
  'Cosméticos',
  15,
  '5 años',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_total_dias = EXCLUDED.sla_total_dias,
  renovacion = EXCLUDED.renovacion,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, rubro, sla_total_dias, renovacion, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'COS-G2',
  'Registro Producto Cosmético Grado II',
  'Productos riesgo moderado - Evaluación completa ANMAT',
  '69c2fc6b-7678-490c-91e8-2589de24565c',
  'Cosméticos',
  60,
  '5 años',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_total_dias = EXCLUDED.sla_total_dias,
  renovacion = EXCLUDED.renovacion,
  updated_at = NOW();

-- ANMAT - Dispositivos Médicos
INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, rubro, sla_total_dias, renovacion, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'DM-CLASE-I',
  'Registro Dispositivo Médico Clase I',
  'Bajo riesgo - Proceso de notificación simplificado',
  '69c2fc6b-7678-490c-91e8-2589de24565c',
  'Dispositivos Médicos',
  30,
  '5 años',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_total_dias = EXCLUDED.sla_total_dias,
  renovacion = EXCLUDED.renovacion,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, rubro, sla_total_dias, renovacion, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'DM-CLASE-II',
  'Registro Dispositivo Médico Clase II',
  'Riesgo moderado - Certificado de inscripción completo',
  '69c2fc6b-7678-490c-91e8-2589de24565c',
  'Dispositivos Médicos',
  90,
  '5 años',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_total_dias = EXCLUDED.sla_total_dias,
  renovacion = EXCLUDED.renovacion,
  updated_at = NOW();

-- SENASA
INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, rubro, sla_total_dias, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'RENSPA',
  'Registro Nacional Sanitario de Productores Agropecuarios',
  'Inscripción obligatoria de establecimiento productivo agropecuario',
  '1716f04c-097b-4da2-bfd5-a977f42a4e41',
  'Producción Agropecuaria',
  30,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_total_dias = EXCLUDED.sla_total_dias,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, rubro, sla_total_dias, renovacion, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'CUA',
  'Certificado Único de Aptitud',
  'Habilitación para exportación de productos agroalimentarios',
  '1716f04c-097b-4da2-bfd5-a977f42a4e41',
  'Exportación',
  15,
  '1 año',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_total_dias = EXCLUDED.sla_total_dias,
  renovacion = EXCLUDED.renovacion,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, rubro, sla_total_dias, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'TRAZABILIDAD',
  'Registro de Trazabilidad Animal',
  'Sistema de identificación y seguimiento de animales',
  '1716f04c-097b-4da2-bfd5-a977f42a4e41',
  'Trazabilidad',
  10,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_total_dias = EXCLUDED.sla_total_dias,
  updated_at = NOW();

-- ENACOM
INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, rubro, sla_total_dias, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'HOM-RF',
  'Homologación de Equipos de Radiofrecuencia',
  'Certificación técnica de equipos de telecomunicaciones',
  'e9ac5cc0-8f51-4a7b-a026-dd99a55de606',
  'Telecomunicaciones',
  45,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_total_dias = EXCLUDED.sla_total_dias,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, rubro, sla_total_dias, renovacion, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'LICENCIA-COM',
  'Licencia de Servicios de Comunicación',
  'Autorización legal para operar servicios de comunicaciones',
  'e9ac5cc0-8f51-4a7b-a026-dd99a55de606',
  'Telecomunicaciones',
  90,
  '15 años',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_total_dias = EXCLUDED.sla_total_dias,
  renovacion = EXCLUDED.renovacion,
  updated_at = NOW();

-- ANMaC
INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, rubro, sla_total_dias, renovacion, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'CLU',
  'Credencial de Legítimo Usuario',
  'Autorización para tenencia y portación de armas de fuego',
  '62f99de4-cf35-42e2-99ad-5c3874fc405a',
  'Material Controlado',
  180,
  '5 años',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_total_dias = EXCLUDED.sla_total_dias,
  renovacion = EXCLUDED.renovacion,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, rubro, sla_total_dias, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'CLUSE',
  'Inscripción en CLUSE',
  'Registro nacional de usuarios de material bélico y explosivos',
  '62f99de4-cf35-42e2-99ad-5c3874fc405a',
  'Material Controlado',
  90,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_total_dias = EXCLUDED.sla_total_dias,
  updated_at = NOW();

-- SEDRONAR (RENPRE)
INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, rubro, sla_total_dias, renovacion, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'RENPRE-INS',
  'Inscripción en RENPRE',
  'Registro obligatorio de operadores de precursores químicos',
  '17aefc8f-fec9-4a76-8e60-dd872cb25d9e',
  'Precursores Químicos',
  60,
  '2 años',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_total_dias = EXCLUDED.sla_total_dias,
  renovacion = EXCLUDED.renovacion,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, rubro, sla_total_dias, renovacion, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'RENPRE-REN',
  'Renovación RENPRE',
  'Actualización bianual del registro de operadores',
  '17aefc8f-fec9-4a76-8e60-dd872cb25d9e',
  'Precursores Químicos',
  45,
  '2 años',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_total_dias = EXCLUDED.sla_total_dias,
  renovacion = EXCLUDED.renovacion,
  updated_at = NOW();

-- SIC (Lealtad Comercial)
INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, rubro, sla_total_dias, renovacion, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MAS',
  'Marca Argentina de Servicios',
  'Certificación de origen y calidad argentina para servicios',
  'b5aac122-0d0e-47a7-9095-e1a0651a024e',
  'Certificación',
  30,
  '2 años',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_total_dias = EXCLUDED.sla_total_dias,
  renovacion = EXCLUDED.renovacion,
  updated_at = NOW();

-- FAUNA (CITES)
INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, rubro, sla_total_dias, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'CITES-EXP',
  'Permiso CITES de Exportación',
  'Autorización para exportar especies de fauna/flora protegidas',
  '5b812472-1e58-4f38-a6cf-01629cc26bd4',
  'Fauna Silvestre',
  30,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_total_dias = EXCLUDED.sla_total_dias,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, rubro, sla_total_dias, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'CITES-IMP',
  'Permiso CITES de Importación',
  'Autorización para importar especies de fauna/flora protegidas',
  '5b812472-1e58-4f38-a6cf-01629cc26bd4',
  'Fauna Silvestre',
  30,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_total_dias = EXCLUDED.sla_total_dias,
  updated_at = NOW();
