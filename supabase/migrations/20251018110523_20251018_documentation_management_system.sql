/*
  # Documentation Management System Enhancement

  ## Overview
  This migration enhances the transmission management system with comprehensive documentation control,
  automated checklist generation, and complete audit trail functionality.

  ## 1. New Tables

  ### documentos_checklist
  Stores checklist templates for each transmission type with document requirements.
  - `id` (uuid, primary key)
  - `tramite_tipo_id` (uuid, foreign key to tramite_tipos)
  - `documento_nombre` (text, document name)
  - `documento_tipo` (text, document type: pdf, imagen, excel, word)
  - `es_obligatorio` (boolean, whether document is mandatory)
  - `descripcion` (text, detailed description)
  - `formato_esperado` (text, expected file format)
  - `vigencia_dias` (integer, validity period in days)
  - `requiere_firma` (text, signature requirements)
  - `orden` (integer, display order)
  - `is_active` (boolean, active status)

  ### documentos_versiones
  Maintains complete version history of all documents with audit trail.
  - `id` (uuid, primary key)
  - `documento_id` (uuid, foreign key to documentos)
  - `version_numero` (integer, version number)
  - `path` (text, file path in storage)
  - `formato` (text, file format)
  - `size_kb` (numeric, file size)
  - `hash_sha256` (text, file hash for integrity)
  - `subido_por` (uuid, foreign key to usuarios)
  - `motivo_cambio` (text, reason for version update)
  - `created_at` (timestamptz, creation timestamp)

  ### documentos_responsables
  Tracks who is responsible for each document in a transmission.
  - `id` (uuid, primary key)
  - `expediente_id` (uuid, foreign key to expedientes)
  - `documento_id` (uuid, foreign key to documentos)
  - `usuario_responsable_id` (uuid, foreign key to usuarios)
  - `fecha_asignacion` (timestamptz, assignment date)
  - `fecha_limite` (timestamptz, deadline)
  - `prioridad` (text, priority level)
  - `notas` (text, additional notes)

  ### documentos_aprobaciones
  Manages document approval workflow with multi-level review capability.
  - `id` (uuid, primary key)
  - `documento_id` (uuid, foreign key to documentos)
  - `nivel_aprobacion` (integer, approval level: 1=technical, 2=managerial)
  - `estado` (text, status: pendiente, aprobado, rechazado)
  - `aprobador_id` (uuid, foreign key to usuarios)
  - `fecha_revision` (timestamptz, review date)
  - `comentarios` (text, approval/rejection comments)
  - `created_at` (timestamptz)

  ### notificaciones_documentos
  Stores notifications for documentation deadlines and missing documents.
  - `id` (uuid, primary key)
  - `expediente_id` (uuid, foreign key to expedientes)
  - `documento_id` (uuid, foreign key to documentos)
  - `tipo_notificacion` (text, notification type)
  - `destinatario_id` (uuid, foreign key to usuarios)
  - `mensaje` (text, notification message)
  - `fecha_envio` (timestamptz, send date)
  - `leida` (boolean, read status)
  - `created_at` (timestamptz)

  ## 2. Enhanced Existing Tables

  ### expedientes
  Add fields for documentation control and tracking.
  - `requiere_documentacion` (boolean, whether transmission requires documentation)
  - `documentacion_estado` (text, overall documentation status)
  - `documentacion_progreso` (integer, completion percentage)
  - `documentacion_deadline` (timestamptz, documentation deadline)

  ### documentos
  Add fields for enhanced tracking and validation.
  - `checklist_item_id` (uuid, reference to checklist template)
  - `fecha_vencimiento` (timestamptz, document expiration date)
  - `dias_vigencia` (integer, validity period in days)
  - `requiere_aprobacion` (boolean, requires approval workflow)
  - `nivel_aprobacion_actual` (integer, current approval level)
  - `responsable_id` (uuid, responsible user)
  - `notas_internas` (text, internal notes)

  ## 3. Security
  All tables have RLS enabled with appropriate policies for authenticated users based on roles.

  ## 4. Indexes
  Created for optimal query performance on foreign keys and frequently searched fields.
*/

-- ============================================================================
-- 1. CREATE NEW TABLES
-- ============================================================================

-- documentos_checklist: Template for document requirements by transmission type
CREATE TABLE IF NOT EXISTS documentos_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tramite_tipo_id uuid REFERENCES tramite_tipos(id) ON DELETE CASCADE,
  documento_nombre text NOT NULL,
  documento_tipo text NOT NULL DEFAULT 'pdf',
  es_obligatorio boolean DEFAULT true,
  descripcion text,
  formato_esperado text,
  vigencia_dias integer,
  requiere_firma text,
  orden integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT documentos_checklist_documento_tipo_check CHECK (documento_tipo IN ('pdf', 'imagen', 'excel', 'word', 'otro'))
);

-- documentos_versiones: Version history for all documents
CREATE TABLE IF NOT EXISTS documentos_versiones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id uuid REFERENCES documentos(id) ON DELETE CASCADE,
  version_numero integer NOT NULL DEFAULT 1,
  path text,
  formato text,
  size_kb numeric,
  hash_sha256 text,
  subido_por uuid REFERENCES usuarios(id),
  motivo_cambio text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT documentos_versiones_version_numero_check CHECK (version_numero > 0)
);

-- documentos_responsables: Responsible parties for documents
CREATE TABLE IF NOT EXISTS documentos_responsables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id uuid REFERENCES expedientes(id) ON DELETE CASCADE,
  documento_id uuid REFERENCES documentos(id) ON DELETE CASCADE,
  usuario_responsable_id uuid REFERENCES usuarios(id),
  fecha_asignacion timestamptz DEFAULT now(),
  fecha_limite timestamptz,
  prioridad text DEFAULT 'normal',
  notas text,
  estado text DEFAULT 'asignado',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT documentos_responsables_prioridad_check CHECK (prioridad IN ('baja', 'normal', 'alta', 'urgente')),
  CONSTRAINT documentos_responsables_estado_check CHECK (estado IN ('asignado', 'en_proceso', 'completado', 'cancelado'))
);

-- documentos_aprobaciones: Approval workflow tracking
CREATE TABLE IF NOT EXISTS documentos_aprobaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id uuid REFERENCES documentos(id) ON DELETE CASCADE,
  nivel_aprobacion integer DEFAULT 1,
  estado text DEFAULT 'pendiente',
  aprobador_id uuid REFERENCES usuarios(id),
  fecha_revision timestamptz,
  comentarios text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT documentos_aprobaciones_nivel_check CHECK (nivel_aprobacion >= 1 AND nivel_aprobacion <= 3),
  CONSTRAINT documentos_aprobaciones_estado_check CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'revision'))
);

-- notificaciones_documentos: Document-related notifications
CREATE TABLE IF NOT EXISTS notificaciones_documentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id uuid REFERENCES expedientes(id) ON DELETE CASCADE,
  documento_id uuid REFERENCES documentos(id) ON DELETE SET NULL,
  tipo_notificacion text NOT NULL,
  destinatario_id uuid REFERENCES usuarios(id),
  mensaje text NOT NULL,
  fecha_envio timestamptz DEFAULT now(),
  leida boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT notificaciones_documentos_tipo_check CHECK (tipo_notificacion IN ('deadline', 'missing', 'approved', 'rejected', 'expired', 'reminder'))
);

-- ============================================================================
-- 2. ENHANCE EXISTING TABLES
-- ============================================================================

-- Add documentation control fields to expedientes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expedientes' AND column_name = 'requiere_documentacion') THEN
    ALTER TABLE expedientes ADD COLUMN requiere_documentacion boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expedientes' AND column_name = 'documentacion_estado') THEN
    ALTER TABLE expedientes ADD COLUMN documentacion_estado text DEFAULT 'pendiente';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expedientes' AND column_name = 'documentacion_progreso') THEN
    ALTER TABLE expedientes ADD COLUMN documentacion_progreso integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expedientes' AND column_name = 'documentacion_deadline') THEN
    ALTER TABLE expedientes ADD COLUMN documentacion_deadline timestamptz;
  END IF;
END $$;

-- Add enhanced tracking fields to documentos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documentos' AND column_name = 'checklist_item_id') THEN
    ALTER TABLE documentos ADD COLUMN checklist_item_id uuid REFERENCES documentos_checklist(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documentos' AND column_name = 'fecha_vencimiento') THEN
    ALTER TABLE documentos ADD COLUMN fecha_vencimiento timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documentos' AND column_name = 'dias_vigencia') THEN
    ALTER TABLE documentos ADD COLUMN dias_vigencia integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documentos' AND column_name = 'requiere_aprobacion') THEN
    ALTER TABLE documentos ADD COLUMN requiere_aprobacion boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documentos' AND column_name = 'nivel_aprobacion_actual') THEN
    ALTER TABLE documentos ADD COLUMN nivel_aprobacion_actual integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documentos' AND column_name = 'responsable_id') THEN
    ALTER TABLE documentos ADD COLUMN responsable_id uuid REFERENCES usuarios(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documentos' AND column_name = 'notas_internas') THEN
    ALTER TABLE documentos ADD COLUMN notas_internas text;
  END IF;
END $$;

-- ============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Indexes for documentos_checklist
CREATE INDEX IF NOT EXISTS idx_documentos_checklist_tramite_tipo ON documentos_checklist(tramite_tipo_id);
CREATE INDEX IF NOT EXISTS idx_documentos_checklist_obligatorio ON documentos_checklist(es_obligatorio);
CREATE INDEX IF NOT EXISTS idx_documentos_checklist_orden ON documentos_checklist(orden);

-- Indexes for documentos_versiones
CREATE INDEX IF NOT EXISTS idx_documentos_versiones_documento ON documentos_versiones(documento_id);
CREATE INDEX IF NOT EXISTS idx_documentos_versiones_subido_por ON documentos_versiones(subido_por);
CREATE INDEX IF NOT EXISTS idx_documentos_versiones_created_at ON documentos_versiones(created_at DESC);

-- Indexes for documentos_responsables
CREATE INDEX IF NOT EXISTS idx_documentos_responsables_expediente ON documentos_responsables(expediente_id);
CREATE INDEX IF NOT EXISTS idx_documentos_responsables_documento ON documentos_responsables(documento_id);
CREATE INDEX IF NOT EXISTS idx_documentos_responsables_usuario ON documentos_responsables(usuario_responsable_id);
CREATE INDEX IF NOT EXISTS idx_documentos_responsables_fecha_limite ON documentos_responsables(fecha_limite);
CREATE INDEX IF NOT EXISTS idx_documentos_responsables_estado ON documentos_responsables(estado);

-- Indexes for documentos_aprobaciones
CREATE INDEX IF NOT EXISTS idx_documentos_aprobaciones_documento ON documentos_aprobaciones(documento_id);
CREATE INDEX IF NOT EXISTS idx_documentos_aprobaciones_aprobador ON documentos_aprobaciones(aprobador_id);
CREATE INDEX IF NOT EXISTS idx_documentos_aprobaciones_estado ON documentos_aprobaciones(estado);

-- Indexes for notificaciones_documentos
CREATE INDEX IF NOT EXISTS idx_notificaciones_documentos_expediente ON notificaciones_documentos(expediente_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_documentos_destinatario ON notificaciones_documentos(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_documentos_leida ON notificaciones_documentos(leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_documentos_tipo ON notificaciones_documentos(tipo_notificacion);

-- Indexes for enhanced documentos fields
CREATE INDEX IF NOT EXISTS idx_documentos_checklist_item ON documentos(checklist_item_id);
CREATE INDEX IF NOT EXISTS idx_documentos_fecha_vencimiento ON documentos(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_documentos_responsable ON documentos(responsable_id);

-- Indexes for enhanced expedientes fields
CREATE INDEX IF NOT EXISTS idx_expedientes_documentacion_estado ON expedientes(documentacion_estado);
CREATE INDEX IF NOT EXISTS idx_expedientes_documentacion_deadline ON expedientes(documentacion_deadline);

-- ============================================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE documentos_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_versiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_responsables ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_aprobaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones_documentos ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. CREATE RLS POLICIES
-- ============================================================================

-- documentos_checklist policies
CREATE POLICY "Users can view checklist templates"
  ON documentos_checklist FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and gestors can manage checklist templates"
  ON documentos_checklist FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol IN ('admin', 'gestor')
    )
  );

-- documentos_versiones policies
CREATE POLICY "Users can view document versions they have access to"
  ON documentos_versiones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documentos
      WHERE documentos.id = documentos_versiones.documento_id
      AND (
        documentos.subido_por = auth.uid()
        OR EXISTS (
          SELECT 1 FROM usuarios
          WHERE usuarios.id = auth.uid()
          AND usuarios.rol IN ('admin', 'gestor')
        )
      )
    )
  );

CREATE POLICY "Users can create document versions"
  ON documentos_versiones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documentos
      WHERE documentos.id = documentos_versiones.documento_id
    )
  );

-- documentos_responsables policies
CREATE POLICY "Users can view their assigned documents"
  ON documentos_responsables FOR SELECT
  TO authenticated
  USING (
    usuario_responsable_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol IN ('admin', 'gestor')
    )
  );

CREATE POLICY "Gestors and admins can manage document assignments"
  ON documentos_responsables FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol IN ('admin', 'gestor')
    )
  );

-- documentos_aprobaciones policies
CREATE POLICY "Users can view document approvals they're involved with"
  ON documentos_aprobaciones FOR SELECT
  TO authenticated
  USING (
    aprobador_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM documentos
      WHERE documentos.id = documentos_aprobaciones.documento_id
      AND documentos.subido_por = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol IN ('admin', 'gestor')
    )
  );

CREATE POLICY "Approvers can create and update approvals"
  ON documentos_aprobaciones FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol IN ('admin', 'gestor')
    )
  );

-- notificaciones_documentos policies
CREATE POLICY "Users can view their own notifications"
  ON notificaciones_documentos FOR SELECT
  TO authenticated
  USING (destinatario_id = auth.uid());

CREATE POLICY "Users can update their notification read status"
  ON notificaciones_documentos FOR UPDATE
  TO authenticated
  USING (destinatario_id = auth.uid())
  WITH CHECK (destinatario_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notificaciones_documentos FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- 6. CREATE FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to automatically create document version on upload
CREATE OR REPLACE FUNCTION create_document_version()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (OLD.path IS DISTINCT FROM NEW.path OR OLD.version IS DISTINCT FROM NEW.version)) THEN
    INSERT INTO documentos_versiones (
      documento_id,
      version_numero,
      path,
      formato,
      size_kb,
      hash_sha256,
      subido_por
    ) VALUES (
      NEW.id,
      COALESCE(NEW.version, 1),
      NEW.path,
      NEW.formato,
      NEW.size_kb,
      NEW.hash_sha256,
      NEW.subido_por
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic version creation
DROP TRIGGER IF EXISTS trigger_create_document_version ON documentos;
CREATE TRIGGER trigger_create_document_version
  AFTER INSERT OR UPDATE ON documentos
  FOR EACH ROW
  EXECUTE FUNCTION create_document_version();

-- Function to calculate documentation progress for expedientes
CREATE OR REPLACE FUNCTION calculate_documentation_progress(expediente_uuid uuid)
RETURNS integer AS $$
DECLARE
  total_docs integer;
  completed_docs integer;
  progress integer;
BEGIN
  SELECT COUNT(*) INTO total_docs
  FROM documentos
  WHERE expediente_id = expediente_uuid
  AND tipo IN (SELECT documento_nombre FROM documentos_checklist WHERE es_obligatorio = true);
  
  IF total_docs = 0 THEN
    RETURN 0;
  END IF;
  
  SELECT COUNT(*) INTO completed_docs
  FROM documentos
  WHERE expediente_id = expediente_uuid
  AND estado IN ('aprobado', 'completado')
  AND tipo IN (SELECT documento_nombre FROM documentos_checklist WHERE es_obligatorio = true);
  
  progress := ROUND((completed_docs::numeric / total_docs::numeric) * 100);
  
  RETURN progress;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update expediente documentation status
CREATE OR REPLACE FUNCTION update_expediente_documentation_status()
RETURNS TRIGGER AS $$
DECLARE
  exp_id uuid;
  doc_progress integer;
BEGIN
  IF TG_OP = 'INSERT' THEN
    exp_id := NEW.expediente_id;
  ELSIF TG_OP = 'UPDATE' THEN
    exp_id := NEW.expediente_id;
  ELSIF TG_OP = 'DELETE' THEN
    exp_id := OLD.expediente_id;
  END IF;
  
  IF exp_id IS NOT NULL THEN
    doc_progress := calculate_documentation_progress(exp_id);
    
    UPDATE expedientes
    SET 
      documentacion_progreso = doc_progress,
      documentacion_estado = CASE
        WHEN doc_progress = 100 THEN 'completo'
        WHEN doc_progress > 0 THEN 'en_proceso'
        ELSE 'pendiente'
      END,
      updated_at = now()
    WHERE id = exp_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update expediente documentation status
DROP TRIGGER IF EXISTS trigger_update_expediente_doc_status ON documentos;
CREATE TRIGGER trigger_update_expediente_doc_status
  AFTER INSERT OR UPDATE OR DELETE ON documentos
  FOR EACH ROW
  EXECUTE FUNCTION update_expediente_documentation_status();

-- ============================================================================
-- 7. INSERT SAMPLE CHECKLIST DATA
-- ============================================================================

-- Note: Sample data will be inserted via application code or separate data migration
-- This ensures proper reference to existing tramite_tipos

-- Migration completed successfully
