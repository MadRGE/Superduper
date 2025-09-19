/*
  # Initial Schema Migration for SGT System

  1. New Tables
    - `clientes` - Client information with contact details
    - `organismos` - Regulatory organisms (ANMAT, ENACOM, etc.)
    - `tramite_tipos` - Types of procedures/processes
    - `expedientes` - Main expediente records
    - `documentos` - Document attachments for expedientes
    - `historial` - Audit log for all changes

  2. Security
    - Enable RLS on all tables
    - Add basic policies for authenticated users
    - Proper foreign key relationships

  3. Indexes
    - Performance indexes on frequently queried columns
    - Composite indexes for common query patterns
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de Organismos
CREATE TABLE IF NOT EXISTS organismos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  sigla VARCHAR(20) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  canal VARCHAR(100),
  email_contacto VARCHAR(255),
  telefono VARCHAR(50),
  direccion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  razon_social VARCHAR(255) NOT NULL,
  cuit VARCHAR(13) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  direccion TEXT,
  contacto_nombre VARCHAR(255),
  contacto_email VARCHAR(255),
  contacto_telefono VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Tipos de Trámite
CREATE TABLE IF NOT EXISTS tramite_tipos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  organismo_id UUID REFERENCES organismos(id),
  rubro VARCHAR(100),
  pais VARCHAR(50) DEFAULT 'Argentina',
  alcance TEXT,
  obligatoriedad VARCHAR(50),
  base_legal TEXT[],
  entregables TEXT[],
  renovacion VARCHAR(100),
  tags TEXT[],
  sla_total_dias INTEGER DEFAULT 30,
  requiere_tasa BOOLEAN DEFAULT false,
  monto_tasa DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Despachantes
CREATE TABLE IF NOT EXISTS despachantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  cuit VARCHAR(13) UNIQUE NOT NULL,
  matricula VARCHAR(50),
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  direccion TEXT,
  especialidades TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Expedientes
CREATE TABLE IF NOT EXISTS expedientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  alias VARCHAR(255),
  tramite_tipo_id UUID REFERENCES tramite_tipos(id),
  cliente_id UUID REFERENCES clientes(id),
  despachante_id UUID REFERENCES despachantes(id),
  estado VARCHAR(50) DEFAULT 'iniciado',
  prioridad VARCHAR(20) DEFAULT 'normal',
  fecha_inicio DATE DEFAULT CURRENT_DATE,
  fecha_limite DATE,
  fecha_completado DATE,
  paso_actual INTEGER DEFAULT 1,
  observaciones TEXT,
  metadata JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- Tabla de Documentos
CREATE TABLE IF NOT EXISTS documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
  tarea_id UUID,
  tipo VARCHAR(100),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  path TEXT,
  formato VARCHAR(50),
  size_kb INTEGER,
  hash_sha256 VARCHAR(64),
  subido_por UUID,
  subido_por_rol VARCHAR(50),
  estado VARCHAR(50) DEFAULT 'pendiente',
  version INTEGER DEFAULT 1,
  metadata JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Historial (Audit Log)
CREATE TABLE IF NOT EXISTS historial (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expediente_id UUID REFERENCES expedientes(id),
  accion VARCHAR(100) NOT NULL,
  descripcion TEXT,
  estado_anterior VARCHAR(50),
  estado_nuevo VARCHAR(50),
  usuario_id UUID,
  usuario_nombre VARCHAR(255),
  detalles JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255),
  rol VARCHAR(50) NOT NULL DEFAULT 'cliente',
  entidad_id UUID,
  password_hash VARCHAR(255),
  ultimo_acceso TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_expedientes_estado ON expedientes(estado);
CREATE INDEX IF NOT EXISTS idx_expedientes_cliente ON expedientes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_expedientes_fecha_limite ON expedientes(fecha_limite);
CREATE INDEX IF NOT EXISTS idx_expedientes_tramite_tipo ON expedientes(tramite_tipo_id);
CREATE INDEX IF NOT EXISTS idx_documentos_expediente ON documentos(expediente_id);
CREATE INDEX IF NOT EXISTS idx_historial_expediente ON historial(expediente_id);
CREATE INDEX IF NOT EXISTS idx_tramite_tipos_organismo ON tramite_tipos(organismo_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE expedientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial ENABLE ROW LEVEL SECURITY;
ALTER TABLE tramite_tipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE organismos ENABLE ROW LEVEL SECURITY;
ALTER TABLE despachantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad básicas
CREATE POLICY "Users can view all expedientes" ON expedientes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create expedientes" ON expedientes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update expedientes" ON expedientes
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view all clientes" ON clientes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create clientes" ON clientes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update clientes" ON clientes
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view all documentos" ON documentos
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create documentos" ON documentos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update documentos" ON documentos
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view all historial" ON historial
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create historial" ON historial
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view all tramite_tipos" ON tramite_tipos
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tramite_tipos" ON tramite_tipos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view all organismos" ON organismos
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create organismos" ON organismos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view all despachantes" ON despachantes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create despachantes" ON despachantes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view all usuarios" ON usuarios
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create usuarios" ON usuarios
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);