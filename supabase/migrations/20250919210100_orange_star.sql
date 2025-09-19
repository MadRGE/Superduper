/*
  # Seed Data for SGT System

  1. Initial Data
    - Sample organismos (ANMAT, ENACOM, SIC, SENASA)
    - Sample tramite_tipos for each organismo
    - Sample clientes for testing

  2. Test Data
    - Provides realistic data for development and testing
*/

-- Insert sample organismos
INSERT INTO organismos (codigo, sigla, nombre, descripcion, canal, activo) VALUES
('ORG-ANMAT-INAL', 'ANMAT/INAL', 'Administración Nacional de Medicamentos, Alimentos y Tecnología Médica - Instituto Nacional de Alimentos', 'Organismo regulador de medicamentos, alimentos y tecnología médica', 'SIFeGA', true),
('ORG-ENACOM', 'ENACOM', 'Ente Nacional de Comunicaciones', 'Regulador de telecomunicaciones y servicios de comunicación', 'RAMATEL', true),
('ORG-SIC', 'SIC', 'Secretaría de Industria y Comercio', 'Secretaría encargada de la industria y comercio', 'TAD', true),
('ORG-SENASA', 'SENASA', 'Servicio Nacional de Sanidad y Calidad Agroalimentaria', 'Organismo de sanidad animal y vegetal', 'SIGSA', true),
('ORG-ANMAC', 'ANMaC', 'Agencia Nacional de Materiales Controlados', 'Control de armas y materiales controlados', 'SIGIMAC', true)
ON CONFLICT (codigo) DO NOTHING;

-- Insert sample tramite_tipos
INSERT INTO tramite_tipos (codigo, nombre, descripcion, organismo_id, rubro, alcance, sla_total_dias, tags, is_active) VALUES
('TT-INAL-002', 'Registro Nacional de Producto Alimenticio', 'Registro RNPA para productos alimenticios envasados', (SELECT id FROM organismos WHERE codigo = 'ORG-ANMAT-INAL'), 'Alimentos', 'Producto alimenticio envasado (por SKU)', 45, ARRAY['CAA', 'SIFeGA', 'alimentos', 'producto'], true),
('TT-ENACOM-001', 'Homologación de Equipos de Telecomunicaciones', 'Homologación ENACOM para equipos con radiofrecuencia', (SELECT id FROM organismos WHERE codigo = 'ORG-ENACOM'), 'Telecomunicaciones', 'Equipos con radiofrecuencia', 45, ARRAY['telecomunicaciones', 'RAMATEL', 'radio'], true),
('TT-SIC-001', 'Certificación Seguridad Eléctrica BT', 'Certificación de seguridad eléctrica para productos de baja tensión', (SELECT id FROM organismos WHERE codigo = 'ORG-SIC'), 'Seguridad de Productos', 'Productos eléctricos de baja tensión', 35, ARRAY['seguridad', 'electrico', 'BT'], true),
('TT-SENASA-001', 'Registro Alimentos para Animales', 'Registro de alimentos balanceados para animales', (SELECT id FROM organismos WHERE codigo = 'ORG-SENASA'), 'Veterinaria', 'Alimentos balanceados', 60, ARRAY['veterinaria', 'alimentos', 'animales'], true),
('TT-ANMAC-001', 'Importación de Armas y Municiones', 'Gestión de importación de material controlado', (SELECT id FROM organismos WHERE codigo = 'ORG-ANMAC'), 'Materiales Controlados', 'Armas de fuego y municiones', 90, ARRAY['armas', 'importacion', 'SIGIMAC'], true)
ON CONFLICT (codigo) DO NOTHING;

-- Insert sample clientes
INSERT INTO clientes (razon_social, cuit, email, telefono, contacto_nombre, is_active) VALUES
('Lácteos del Sur S.A.', '30-12345678-9', 'contacto@lacteosdelsur.com.ar', '+54 11 4567-8900', 'María González', true),
('TechCorp Argentina', '30-98765432-1', 'info@techcorp.com.ar', '+54 11 9876-5432', 'Carlos Rodríguez', true),
('BeautyTech Imports', '30-11223344-5', 'ventas@beautytech.com.ar', '+54 11 2233-4455', 'Laura Martínez', true),
('NutriLife S.A.', '30-55667788-9', 'contacto@nutrilife.com.ar', '+54 11 5566-7788', 'Roberto Silva', true),
('PetCare Argentina', '30-99887766-3', 'info@petcare.com.ar', '+54 11 9988-7766', 'Ana Fernández', true),
('Seguridad Integral SRL', '33-69876543-9', 'admin@seguridadintegral.com.ar', '+54 11 4321-9876', 'Diego Morales', true)
ON CONFLICT (cuit) DO NOTHING;

-- Insert sample despachantes
INSERT INTO despachantes (nombre, cuit, matricula, email, telefono, especialidades, is_active) VALUES
('Despachos García & Asociados', '20-28765432-1', 'DGA-001', 'info@despachosgarcia.com', '+54 11 4345-6789', ARRAY['Importación', 'Exportación', 'Tránsito'], true),
('Consultoría Aduanera Martínez', '27-34567890-2', 'CAM-002', 'contacto@consultoriamartinez.com', '+54 11 5678-9012', ARRAY['Importación', 'Clasificación Arancelaria'], true)
ON CONFLICT (cuit) DO NOTHING;