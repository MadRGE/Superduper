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
*/

-- Insertar Organismos
INSERT INTO organismos (id, codigo, sigla, nombre, activo, created_at, updated_at)
VALUES ('69c2fc6b-7678-490c-91e8-2589de24565c', 'ANMAT', 'ANMAT', 'Administración Nacional de Medicamentos, Alimentos y Tecnología Médica', true, NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO organismos (id, codigo, sigla, nombre, activo, created_at, updated_at)
VALUES ('1716f04c-097b-4da2-bfd5-a977f42a4e41', 'SENASA', 'SENASA', 'Servicio Nacional de Sanidad y Calidad Agroalimentaria', true, NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO organismos (id, codigo, sigla, nombre, activo, created_at, updated_at)
VALUES ('e9ac5cc0-8f51-4a7b-a026-dd99a55de606', 'ENACOM', 'ENACOM', 'Ente Nacional de Comunicaciones', true, NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO organismos (id, codigo, sigla, nombre, activo, created_at, updated_at)
VALUES ('62f99de4-cf35-42e2-99ad-5c3874fc405a', 'ANMaC', 'ANMaC', 'Agencia Nacional de Materiales Controlados', true, NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO organismos (id, codigo, sigla, nombre, activo, created_at, updated_at)
VALUES ('17aefc8f-fec9-4a76-8e60-dd872cb25d9e', 'SEDRONAR', 'SEDRONAR', 'Secretaría de Políticas Integrales sobre Drogas', true, NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO organismos (id, codigo, sigla, nombre, activo, created_at, updated_at)
VALUES ('b5aac122-0d0e-47a7-9095-e1a0651a024e', 'SIC', 'SIC', 'Secretaría de Industria y Comercio', true, NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO organismos (id, codigo, sigla, nombre, activo, created_at, updated_at)
VALUES ('5b812472-1e58-4f38-a6cf-01629cc26bd4', 'FAUNA', 'FAUNA', 'Dirección Nacional de Fauna y Flora Silvestre', true, NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;


-- Insertar Tipos de Trámites
INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, sla_dias, vigencia_anos, categoria, activo, created_at, updated_at)
VALUES (
  '4196909f-f77b-4cef-8bee-21e8ffdc2ffa',
  'RNPA-001',
  'Registro Nacional de Producto Alimenticio (RNPA)',
  'Registro de producto alimenticio nacional o importado',
  '69c2fc6b-7678-490c-91e8-2589de24565c',
  45,
  5,
  'Alimentos',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_dias = EXCLUDED.sla_dias,
  vigencia_anos = EXCLUDED.vigencia_anos,
  categoria = EXCLUDED.categoria,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, sla_dias, vigencia_anos, categoria, activo, created_at, updated_at)
VALUES (
  'dbfe5484-4ee4-47fa-bdc6-b9fdafc4902d',
  'RNE-001',
  'Registro Nacional de Establecimiento (RNE)',
  'Habilitación de establecimiento elaborador/fraccionador/importador',
  '69c2fc6b-7678-490c-91e8-2589de24565c',
  60,
  5,
  'Alimentos',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_dias = EXCLUDED.sla_dias,
  vigencia_anos = EXCLUDED.vigencia_anos,
  categoria = EXCLUDED.categoria,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, sla_dias, vigencia_anos, categoria, activo, created_at, updated_at)
VALUES (
  '199498e0-fc3c-4f9b-b235-3f77d89d4546',
  'RNPA-MOD',
  'Modificación RNPA',
  'Cambios en fórmula, rótulo o datos del producto',
  '69c2fc6b-7678-490c-91e8-2589de24565c',
  30,
  NULL,
  'Alimentos',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_dias = EXCLUDED.sla_dias,
  vigencia_anos = EXCLUDED.vigencia_anos,
  categoria = EXCLUDED.categoria,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, sla_dias, vigencia_anos, categoria, activo, created_at, updated_at)
VALUES (
  '5519b085-1727-487a-a84e-c7c82fd7e002',
  'RNPA-REN',
  'Renovación RNPA',
  'Renovación de registro vencido o próximo a vencer',
  '69c2fc6b-7678-490c-91e8-2589de24565c',
  45,
  5,
  'Alimentos',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_dias = EXCLUDED.sla_dias,
  vigencia_anos = EXCLUDED.vigencia_anos,
  categoria = EXCLUDED.categoria,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, sla_dias, vigencia_anos, categoria, activo, created_at, updated_at)
VALUES (
  '009d16bf-7264-4bca-96d8-896241a7479f',
  'COS-G1',
  'Registro Producto Cosmético Grado I',
  'Productos de riesgo mínimo - Admisión automática',
  '69c2fc6b-7678-490c-91e8-2589de24565c',
  15,
  5,
  'Cosméticos',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_dias = EXCLUDED.sla_dias,
  vigencia_anos = EXCLUDED.vigencia_anos,
  categoria = EXCLUDED.categoria,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, sla_dias, vigencia_anos, categoria, activo, created_at, updated_at)
VALUES (
  '423f26e5-c546-4b1c-8947-768e23b5b25d',
  'COS-G2',
  'Registro Producto Cosmético Grado II',
  'Productos riesgo moderado - Evaluación completa',
  '69c2fc6b-7678-490c-91e8-2589de24565c',
  60,
  5,
  'Cosméticos',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_dias = EXCLUDED.sla_dias,
  vigencia_anos = EXCLUDED.vigencia_anos,
  categoria = EXCLUDED.categoria,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, sla_dias, vigencia_anos, categoria, activo, created_at, updated_at)
VALUES (
  '632defd7-4d93-4083-8ac2-01aee215c5dd',
  'DM-CLASE-I',
  'Registro Dispositivo Médico Clase I',
  'Bajo riesgo - Notificación',
  '69c2fc6b-7678-490c-91e8-2589de24565c',
  30,
  5,
  'Dispositivos Médicos',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_dias = EXCLUDED.sla_dias,
  vigencia_anos = EXCLUDED.vigencia_anos,
  categoria = EXCLUDED.categoria,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, sla_dias, vigencia_anos, categoria, activo, created_at, updated_at)
VALUES (
  'e59d4dfd-b5b6-42dc-a785-cd05d33350d7',
  'DM-CLASE-II',
  'Registro Dispositivo Médico Clase II',
  'Riesgo moderado - Certificado',
  '69c2fc6b-7678-490c-91e8-2589de24565c',
  90,
  5,
  'Dispositivos Médicos',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_dias = EXCLUDED.sla_dias,
  vigencia_anos = EXCLUDED.vigencia_anos,
  categoria = EXCLUDED.categoria,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, sla_dias, vigencia_anos, categoria, activo, created_at, updated_at)
VALUES (
  '4d51f143-8ff7-43f4-ae69-8e7666632dd4',
  'RENSPA',
  'Registro Nacional Sanitario de Productores Agropecuarios',
  'Inscripción de establecimiento productivo',
  '1716f04c-097b-4da2-bfd5-a977f42a4e41',
  30,
  NULL,
  'Producción Agropecuaria',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_dias = EXCLUDED.sla_dias,
  vigencia_anos = EXCLUDED.vigencia_anos,
  categoria = EXCLUDED.categoria,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, sla_dias, vigencia_anos, categoria, activo, created_at, updated_at)
VALUES (
  'feaeb841-684a-4389-8082-f97dc84136a7',
  'CUA',
  'Certificado Único de Aptitud',
  'Habilitación para exportación de productos',
  '1716f04c-097b-4da2-bfd5-a977f42a4e41',
  15,
  1,
  'Exportación',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_dias = EXCLUDED.sla_dias,
  vigencia_anos = EXCLUDED.vigencia_anos,
  categoria = EXCLUDED.categoria,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, sla_dias, vigencia_anos, categoria, activo, created_at, updated_at)
VALUES (
  '74356bdc-96e2-4bb4-ba38-4ecca0422621',
  'TRAZABILIDAD',
  'Registro de Trazabilidad Animal',
  'Sistema de identificación y seguimiento',
  '1716f04c-097b-4da2-bfd5-a977f42a4e41',
  10,
  NULL,
  'Trazabilidad',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_dias = EXCLUDED.sla_dias,
  vigencia_anos = EXCLUDED.vigencia_anos,
  categoria = EXCLUDED.categoria,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, sla_dias, vigencia_anos, categoria, activo, created_at, updated_at)
VALUES (
  'ebe52c8a-9aab-4e6b-83f3-37205355a3b5',
  'HOM-RF',
  'Homologación de Equipos de RF',
  'Certificación de equipos de radiofrecuencia',
  'e9ac5cc0-8f51-4a7b-a026-dd99a55de606',
  45,
  NULL,
  'Telecomunicaciones',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_dias = EXCLUDED.sla_dias,
  vigencia_anos = EXCLUDED.vigencia_anos,
  categoria = EXCLUDED.categoria,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, sla_dias, vigencia_anos, categoria, activo, created_at, updated_at)
VALUES (
  '9c7c43ce-7259-47d9-85dd-2785a333352f',
  'LICENCIA-COM',
  'Licencia de Servicios de Comunicación',
  'Autorización para operar servicios',
  'e9ac5cc0-8f51-4a7b-a026-dd99a55de606',
  90,
  15,
  'Telecomunicaciones',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_dias = EXCLUDED.sla_dias,
  vigencia_anos = EXCLUDED.vigencia_anos,
  categoria = EXCLUDED.categoria,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, sla_dias, vigencia_anos, categoria, activo, created_at, updated_at)
VALUES (
  'c85e0d1a-ef60-4212-84ef-8adb92cc38a9',
  'CLU',
  'Credencial de Legítimo Usuario',
  'Autorización para uso de armas de fuego',
  '62f99de4-cf35-42e2-99ad-5c3874fc405a',
  180,
  5,
  'Material Controlado',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_dias = EXCLUDED.sla_dias,
  vigencia_anos = EXCLUDED.vigencia_anos,
  categoria = EXCLUDED.categoria,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, sla_dias, vigencia_anos, categoria, activo, created_at, updated_at)
VALUES (
  'bf957208-b8ba-405b-867f-785bbdc686e5',
  'CLUSE',
  'Inscripción en CLUSE',
  'Registro de usuarios de material bélico',
  '62f99de4-cf35-42e2-99ad-5c3874fc405a',
  90,
  NULL,
  'Material Controlado',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_dias = EXCLUDED.sla_dias,
  vigencia_anos = EXCLUDED.vigencia_anos,
  categoria = EXCLUDED.categoria,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, sla_dias, vigencia_anos, categoria, activo, created_at, updated_at)
VALUES (
  'd3cdc3ac-deb4-4ab0-921d-fa42edc82107',
  'RENPRE-INS',
  'Inscripción en RENPRE',
  'Registro de operadores de precursores químicos',
  '17aefc8f-fec9-4a76-8e60-dd872cb25d9e',
  60,
  2,
  'Precursores Químicos',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_dias = EXCLUDED.sla_dias,
  vigencia_anos = EXCLUDED.vigencia_anos,
  categoria = EXCLUDED.categoria,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, sla_dias, vigencia_anos, categoria, activo, created_at, updated_at)
VALUES (
  '08638c71-6b9e-402b-9e45-646371164cae',
  'RENPRE-REN',
  'Renovación RENPRE',
  'Actualización de registro',
  '17aefc8f-fec9-4a76-8e60-dd872cb25d9e',
  45,
  2,
  'Precursores Químicos',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_dias = EXCLUDED.sla_dias,
  vigencia_anos = EXCLUDED.vigencia_anos,
  categoria = EXCLUDED.categoria,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, sla_dias, vigencia_anos, categoria, activo, created_at, updated_at)
VALUES (
  '0573102f-a812-4f93-af53-b27276fe9eef',
  'MAS',
  'Marca Argentina de Servicios',
  'Certificación de origen argentino',
  'b5aac122-0d0e-47a7-9095-e1a0651a024e',
  30,
  2,
  'Certificación',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_dias = EXCLUDED.sla_dias,
  vigencia_anos = EXCLUDED.vigencia_anos,
  categoria = EXCLUDED.categoria,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, sla_dias, vigencia_anos, categoria, activo, created_at, updated_at)
VALUES (
  '847a1402-57de-4bef-984d-d727f7c3b532',
  'CITES-EXP',
  'Permiso CITES de Exportación',
  'Autorización para exportar especies protegidas',
  '5b812472-1e58-4f38-a6cf-01629cc26bd4',
  30,
  NULL,
  'Fauna Silvestre',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_dias = EXCLUDED.sla_dias,
  vigencia_anos = EXCLUDED.vigencia_anos,
  categoria = EXCLUDED.categoria,
  updated_at = NOW();

INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, sla_dias, vigencia_anos, categoria, activo, created_at, updated_at)
VALUES (
  '19bf924e-800a-4365-9c08-1cb6472d6e6d',
  'CITES-IMP',
  'Permiso CITES de Importación',
  'Autorización para importar especies protegidas',
  '5b812472-1e58-4f38-a6cf-01629cc26bd4',
  30,
  NULL,
  'Fauna Silvestre',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_dias = EXCLUDED.sla_dias,
  vigencia_anos = EXCLUDED.vigencia_anos,
  categoria = EXCLUDED.categoria,
  updated_at = NOW();

