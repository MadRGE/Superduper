/*
  # Tablas Comunes: Laboratorios y Normas Técnicas
  
  1. Tablas Creadas
    - `laboratorios_certificadores`: Organismos acreditados
    - `normas_tecnicas`: Catálogo de normas internacionales
  
  2. Seguridad
    - RLS habilitado
    - Lectura pública para authenticated
    - Modificación solo admin
*/

CREATE TABLE IF NOT EXISTS laboratorios_certificadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  sigla TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('NACIONAL', 'INTERNACIONAL', 'NOTIFICADO_UE', 'MERCOSUR')),
  pais TEXT NOT NULL,
  acreditacion JSONB NOT NULL DEFAULT '[]'::jsonb,
  alcances TEXT[] DEFAULT '{}',
  contacto JSONB DEFAULT '{}'::jsonb,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'suspendido', 'inactivo')),
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS normas_tecnicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  organismo TEXT NOT NULL CHECK (organismo IN ('ISO', 'EN', 'IEC', 'ANSI', 'IRAM', 'NM', 'JIS', 'KC', 'ASTM')),
  año INTEGER,
  categoria TEXT NOT NULL,
  alcance TEXT,
  vigente BOOLEAN DEFAULT true,
  reemplaza TEXT,
  equivalencias JSONB DEFAULT '[]'::jsonb,
  link_documento TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_normas_codigo ON normas_tecnicas(codigo);
CREATE INDEX IF NOT EXISTS idx_normas_organismo ON normas_tecnicas(organismo);

ALTER TABLE laboratorios_certificadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE normas_tecnicas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Laboratorios lectura pública"
  ON laboratorios_certificadores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Normas lectura pública"
  ON normas_tecnicas FOR SELECT
  TO authenticated
  USING (true);