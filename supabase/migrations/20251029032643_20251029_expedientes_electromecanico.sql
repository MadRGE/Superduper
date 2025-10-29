/*
  # Módulo Electromecánico (Res. 16-17/2025)
  
  1. Tabla Principal
    - `expedientes_electromecanico`: Equipamiento eléctrico y máquinas
  
  2. Tipos
    - Res. 16: Equipamiento eléctrico (50-1000V AC / 75-1500V DC)
    - Res. 17: Máquinas y herramientas motorizadas
  
  3. Seguridad
    - RLS por rol
*/

CREATE TABLE IF NOT EXISTS expedientes_electromecanico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  tipo_regulacion TEXT NOT NULL CHECK (tipo_regulacion IN (
    'EQUIPAMIENTO_ELECTRICO_RES16', 'MAQUINAS_HERRAMIENTAS_RES17', 'COMBINADO_RES16_17'
  )),
  tipo_producto TEXT NOT NULL CHECK (tipo_producto IN (
    'RES16_FUENTES_CARGADORES', 'RES16_ELECTRODOMESTICOS', 'RES16_ILUMINACION', 'RES16_ELECTRONICA_AV',
    'RES17_HERR_MANO', 'RES17_HERR_TRANSPORTABLE', 'RES17_MAQUINARIA_JARDIN', 'RES17_MAQUINARIA_INDUSTRIAL'
  )),
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  fabricante TEXT NOT NULL,
  pais_origen TEXT NOT NULL,
  descripcion TEXT,
  especificaciones_tecnicas JSONB NOT NULL DEFAULT '{}'::jsonb,
  laboratorio_id UUID REFERENCES laboratorios_certificadores(id),
  certificado_numero TEXT NOT NULL,
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
  ficha_argentina BOOLEAN DEFAULT false,
  ficha_tipo TEXT,
  es_repuesto_insumo BOOLEAN DEFAULT false,
  repuesto_bien_final_id UUID,
  consulta_tecnica_dnrt JSONB DEFAULT '{}'::jsonb,
  vigilancias JSONB DEFAULT '[]'::jsonb,
  proxima_vigilancia DATE,
  estado TEXT NOT NULL DEFAULT 'DOCUMENTACION' CHECK (estado IN (
    'DOCUMENTACION', 'EVALUACION_CERTIFICACIONES', 'ENSAYOS_LABORATORIO',
    'CERTIFICADO_OBTENIDO', 'DECLARACION_JURADA', 'PRESENTACION_TAD',
    'APROBADO_COMERCIAL', 'VIGENTE', 'VENCIDO', 'TRANSICION_1_ANO'
  )),
  es_certificado_anterior BOOLEAN DEFAULT false,
  certificacion_anterior_tipo TEXT,
  certificacion_anterior_vencimiento DATE,
  costo_ensayos DECIMAL(10,2) DEFAULT 0,
  costo_certificacion DECIMAL(10,2) DEFAULT 0,
  costo_djc DECIMAL(10,2) DEFAULT 0,
  costo_total DECIMAL(10,2) DEFAULT 0,
  documentos_adjuntos JSONB DEFAULT '[]'::jsonb,
  certificado_url TEXT,
  djc_url TEXT,
  manual_usuario_url TEXT,
  esquema_electrico_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  notas_internas TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

CREATE INDEX IF NOT EXISTS idx_electro_tipo_reg ON expedientes_electromecanico(tipo_regulacion);
CREATE INDEX IF NOT EXISTS idx_electro_tipo_prod ON expedientes_electromecanico(tipo_producto);
CREATE INDEX IF NOT EXISTS idx_electro_estado ON expedientes_electromecanico(estado);
CREATE INDEX IF NOT EXISTS idx_electro_vencimiento ON expedientes_electromecanico(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_electro_cliente ON expedientes_electromecanico(cliente_id);

ALTER TABLE expedientes_electromecanico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver expedientes electromecánico según rol"
  ON expedientes_electromecanico FOR SELECT
  TO authenticated
  USING (
    CASE 
      WHEN EXISTS (SELECT 1 FROM usuarios WHERE usuarios.id = auth.uid() AND usuarios.rol IN ('admin', 'gestor')) THEN true
      WHEN EXISTS (SELECT 1 FROM usuarios WHERE usuarios.id = auth.uid() AND usuarios.rol = 'cliente' AND usuarios.entidad_id = cliente_id) THEN true
      ELSE false
    END
  );

CREATE POLICY "Crear expedientes electromecánico admin/gestor"
  ON expedientes_electromecanico FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol IN ('admin', 'gestor')
    )
  );

CREATE POLICY "Actualizar expedientes electromecánico admin/gestor"
  ON expedientes_electromecanico FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol IN ('admin', 'gestor')
    )
  );