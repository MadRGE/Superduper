/*
  # Módulo EPP (Res. 18/2025)
  
  1. Tabla Principal
    - `expedientes_epp`: Equipos de Protección Personal
  
  2. Clasificación
    - Categoría I: Riesgo mínimo
    - Categoría II: Riesgo intermedio
    - Categoría III: Riesgo elevado
  
  3. Seguridad
    - RLS por rol
*/

CREATE TABLE IF NOT EXISTS expedientes_epp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  categoria_riesgo TEXT NOT NULL CHECK (categoria_riesgo IN ('CATEGORIA_I', 'CATEGORIA_II', 'CATEGORIA_III')),
  tipo_epp TEXT NOT NULL CHECK (tipo_epp IN (
    'PROTECCION_OJOS', 'PROTECCION_CABEZA', 'PROTECCION_AUDITIVA',
    'PROTECCION_RESPIRATORIA', 'GUANTES', 'CALZADO', 'INDUMENTARIA',
    'CAIDAS_ALTURAS', 'MANOS_BRAZOS', 'PIES', 'OTRO'
  )),
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  fabricante TEXT NOT NULL,
  pais_origen TEXT NOT NULL,
  descripcion TEXT,
  especificaciones_tecnicas JSONB NOT NULL DEFAULT '{}'::jsonb,
  laboratorio_id UUID REFERENCES laboratorios_certificadores(id),
  certificado_numero TEXT NOT NULL UNIQUE,
  certificado_tipo TEXT CHECK (certificado_tipo IN (
    'CERTIFICACION_LOCAL', 'CERTIFICACION_INTERNACIONAL_VALIDADA', 'CERTIFICACION_COMBINADA'
  )),
  certificado_fecha_emision DATE NOT NULL,
  certificado_vigencia_anos INTEGER NOT NULL DEFAULT 2,
  fecha_vencimiento DATE NOT NULL,
  normas_aplicadas JSONB NOT NULL DEFAULT '[]'::jsonb,
  ensayos_realizados JSONB DEFAULT '{}'::jsonb,
  protecciones_verificadas JSONB DEFAULT '{}'::jsonb,
  resultado_general TEXT CHECK (resultado_general IN ('CONFORME', 'NO_CONFORME', 'CONDICIONAL')),
  rotulado_completado BOOLEAN DEFAULT false,
  rotulado_datos JSONB DEFAULT '{}'::jsonb,
  vigilancias JSONB DEFAULT '[]'::jsonb,
  proxima_vigilancia DATE,
  frecuencia_vigilancia TEXT DEFAULT 'ANUAL' CHECK (frecuencia_vigilancia IN ('ANUAL', 'SEMESTRAL', 'TRIMESTRAL')),
  estado TEXT NOT NULL DEFAULT 'DOCUMENTACION' CHECK (estado IN (
    'DOCUMENTACION', 'EVALUACION_ENSAYOS', 'CERTIFICADO_OBTENIDO',
    'DECLARACION_JURADA', 'PRESENTACION_TAD', 'APROBADO_COMERCIAL',
    'VIGENTE', 'VENCIDO', 'RENOVACION_PENDIENTE'
  )),
  costo_ensayos DECIMAL(10,2) DEFAULT 0,
  costo_certificacion DECIMAL(10,2) DEFAULT 0,
  costo_djc DECIMAL(10,2) DEFAULT 0,
  costo_total DECIMAL(10,2) DEFAULT 0,
  documentos_adjuntos JSONB DEFAULT '[]'::jsonb,
  certificado_url TEXT,
  djc_url TEXT,
  manual_usuario_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  notas_internas TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

CREATE INDEX IF NOT EXISTS idx_epp_categoria ON expedientes_epp(categoria_riesgo);
CREATE INDEX IF NOT EXISTS idx_epp_tipo ON expedientes_epp(tipo_epp);
CREATE INDEX IF NOT EXISTS idx_epp_estado ON expedientes_epp(estado);
CREATE INDEX IF NOT EXISTS idx_epp_vencimiento ON expedientes_epp(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_epp_cliente ON expedientes_epp(cliente_id);

ALTER TABLE expedientes_epp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver expedientes EPP según rol"
  ON expedientes_epp FOR SELECT
  TO authenticated
  USING (
    CASE 
      WHEN EXISTS (SELECT 1 FROM usuarios WHERE usuarios.id = auth.uid() AND usuarios.rol IN ('admin', 'gestor')) THEN true
      WHEN EXISTS (SELECT 1 FROM usuarios WHERE usuarios.id = auth.uid() AND usuarios.rol = 'cliente' AND usuarios.entidad_id = cliente_id) THEN true
      ELSE false
    END
  );

CREATE POLICY "Crear expedientes EPP admin/gestor"
  ON expedientes_epp FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol IN ('admin', 'gestor')
    )
  );

CREATE POLICY "Actualizar expedientes EPP admin/gestor"
  ON expedientes_epp FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol IN ('admin', 'gestor')
    )
  );