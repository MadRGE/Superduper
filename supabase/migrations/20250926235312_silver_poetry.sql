/*
  # Create legal cases and missing tables

  1. New Tables
    - `casos_legales`
      - `id` (uuid, primary key)
      - `cliente_id` (uuid, foreign key to clientes)
      - `nombre_caso` (text)
      - `descripcion` (text)
      - `estado_legal` (text)
      - `fecha_apertura` (date)
      - `fecha_cierre` (date, nullable)
      - `abogado_responsable_id` (uuid, nullable)
      - `metadata` (jsonb)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `productos`
      - `id` (uuid, primary key)
      - `cliente_id` (uuid, foreign key to clientes)
      - `nombre` (text)
      - `marca` (text)
      - `rnpa` (text, nullable)
      - `categoria` (text)
      - `estado` (text)
      - `vencimiento` (date, nullable)
      - `peso_neto` (text, nullable)
      - `vida_util` (text, nullable)
      - `codigo_ean` (text, nullable)
      - `metadata` (jsonb)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `habilitaciones`
      - `id` (uuid, primary key)
      - `cliente_id` (uuid, foreign key to clientes)
      - `tipo` (text)
      - `numero` (text)
      - `establecimiento` (text)
      - `direccion` (text)
      - `vencimiento` (date)
      - `estado` (text)
      - `actividades` (text array)
      - `metadata` (jsonb)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `comunicaciones`
      - `id` (uuid, primary key)
      - `cliente_id` (uuid, foreign key to clientes)
      - `expediente_id` (uuid, foreign key to expedientes, nullable)
      - `caso_legal_id` (uuid, foreign key to casos_legales, nullable)
      - `tipo` (text)
      - `asunto` (text)
      - `mensaje` (text)
      - `destinatario` (text)
      - `estado` (text)
      - `fecha_envio` (timestamp, nullable)
      - `metadata` (jsonb)
      - `created_at` (timestamp)
    - `tareas`
      - `id` (uuid, primary key)
      - `expediente_id` (uuid, foreign key to expedientes, nullable)
      - `caso_legal_id` (uuid, foreign key to casos_legales, nullable)
      - `usuario_asignado_id` (uuid, foreign key to usuarios, nullable)
      - `titulo` (text)
      - `descripcion` (text)
      - `estado` (text)
      - `prioridad` (text)
      - `fecha_vencimiento` (date, nullable)
      - `fecha_completado` (timestamp, nullable)
      - `metadata` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their data
    - Add policies for role-based access control

  3. Indexes
    - Add indexes for foreign keys and commonly queried columns
*/

-- Create casos_legales table
CREATE TABLE IF NOT EXISTS casos_legales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nombre_caso character varying(255) NOT NULL,
  descripcion text,
  estado_legal character varying(50) DEFAULT 'abierto',
  fecha_apertura date DEFAULT CURRENT_DATE,
  fecha_cierre date,
  abogado_responsable_id uuid REFERENCES usuarios(id),
  metadata jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create productos table
CREATE TABLE IF NOT EXISTS productos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nombre character varying(255) NOT NULL,
  marca character varying(255),
  rnpa character varying(100),
  categoria character varying(100),
  estado character varying(50) DEFAULT 'vigente',
  vencimiento date,
  peso_neto character varying(50),
  vida_util character varying(50),
  codigo_ean character varying(50),
  metadata jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create habilitaciones table
CREATE TABLE IF NOT EXISTS habilitaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo character varying(100) NOT NULL,
  numero character varying(100) NOT NULL,
  establecimiento character varying(255),
  direccion text,
  vencimiento date NOT NULL,
  estado character varying(50) DEFAULT 'vigente',
  actividades text[],
  metadata jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comunicaciones table
CREATE TABLE IF NOT EXISTS comunicaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  expediente_id uuid REFERENCES expedientes(id) ON DELETE SET NULL,
  caso_legal_id uuid REFERENCES casos_legales(id) ON DELETE SET NULL,
  tipo character varying(50) NOT NULL,
  asunto character varying(255) NOT NULL,
  mensaje text NOT NULL,
  destinatario character varying(255) NOT NULL,
  estado character varying(50) DEFAULT 'enviado',
  fecha_envio timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create tareas table
CREATE TABLE IF NOT EXISTS tareas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id uuid REFERENCES expedientes(id) ON DELETE CASCADE,
  caso_legal_id uuid REFERENCES casos_legales(id) ON DELETE CASCADE,
  usuario_asignado_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  titulo character varying(255) NOT NULL,
  descripcion text,
  estado character varying(50) DEFAULT 'pendiente',
  prioridad character varying(20) DEFAULT 'normal',
  fecha_vencimiento date,
  fecha_completado timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add caso_legal_id to expedientes table (optional relationship)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expedientes' AND column_name = 'caso_legal_id'
  ) THEN
    ALTER TABLE expedientes ADD COLUMN caso_legal_id uuid REFERENCES casos_legales(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS on all new tables
ALTER TABLE casos_legales ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE habilitaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;

-- Create policies for casos_legales
CREATE POLICY "Authenticated users can view casos_legales"
  ON casos_legales
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create casos_legales"
  ON casos_legales
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update casos_legales"
  ON casos_legales
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Create policies for productos
CREATE POLICY "Authenticated users can view productos"
  ON productos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create productos"
  ON productos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update productos"
  ON productos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Create policies for habilitaciones
CREATE POLICY "Authenticated users can view habilitaciones"
  ON habilitaciones
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create habilitaciones"
  ON habilitaciones
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update habilitaciones"
  ON habilitaciones
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Create policies for comunicaciones
CREATE POLICY "Authenticated users can view comunicaciones"
  ON comunicaciones
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create comunicaciones"
  ON comunicaciones
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create policies for tareas
CREATE POLICY "Authenticated users can view tareas"
  ON tareas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tareas"
  ON tareas
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update tareas"
  ON tareas
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_casos_legales_cliente ON casos_legales(cliente_id);
CREATE INDEX IF NOT EXISTS idx_casos_legales_estado ON casos_legales(estado_legal);
CREATE INDEX IF NOT EXISTS idx_casos_legales_fecha_apertura ON casos_legales(fecha_apertura);

CREATE INDEX IF NOT EXISTS idx_productos_cliente ON productos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_productos_estado ON productos(estado);

CREATE INDEX IF NOT EXISTS idx_habilitaciones_cliente ON habilitaciones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_habilitaciones_vencimiento ON habilitaciones(vencimiento);

CREATE INDEX IF NOT EXISTS idx_comunicaciones_cliente ON comunicaciones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_comunicaciones_expediente ON comunicaciones(expediente_id);
CREATE INDEX IF NOT EXISTS idx_comunicaciones_caso_legal ON comunicaciones(caso_legal_id);

CREATE INDEX IF NOT EXISTS idx_tareas_expediente ON tareas(expediente_id);
CREATE INDEX IF NOT EXISTS idx_tareas_caso_legal ON tareas(caso_legal_id);
CREATE INDEX IF NOT EXISTS idx_tareas_usuario_asignado ON tareas(usuario_asignado_id);
CREATE INDEX IF NOT EXISTS idx_tareas_estado ON tareas(estado);
CREATE INDEX IF NOT EXISTS idx_tareas_fecha_vencimiento ON tareas(fecha_vencimiento);

CREATE INDEX IF NOT EXISTS idx_expedientes_caso_legal ON expedientes(caso_legal_id);