/*
  # Módulo Eficiencia Energética (Res. 438/2024)
  
  1. Tabla Principal
    - `expedientes_eficiencia`: Etiquetado energético
  
  2. Clasificación
    - Escala A-G (A = máxima eficiencia, G = mínima)
    - Base de datos pública para consumidores
  
  3. Seguridad
    - RLS con acceso público parcial
*/

CREATE TABLE IF NOT EXISTS expedientes_eficiencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  categoria_producto TEXT NOT NULL CHECK (categoria_producto IN (
    'REFRIGERADORES', 'CONGELADORES', 'LAVARROPAS', 'LAVAVAJILLAS',
    'AIRE_ACONDICIONADO', 'CALEFACCION', 'HORNOS', 'COCINAS',
    'TERMOTANQUES', 'ILUMINACION', 'TELEVISORES', 'EQUIPOS_COMPUTO', 'OTROS_ELECTRONICOS'
  )),
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  fabricante TEXT NOT NULL,
  pais_origen TEXT NOT NULL,
  año_modelo INTEGER,
  descripcion TEXT,
  especificaciones_tecnicas JSONB NOT NULL DEFAULT '{}'::jsonb,
  consumo_energetico DECIMAL(10,2) NOT NULL,
  unidad_consumo TEXT DEFAULT 'kWh_anual' CHECK (unidad_consumo IN ('kWh_anual', 'kWh_diario', 'kWh_ciclo', 'W')),
  indicador_eficiencia TEXT,
  valor_indicador DECIMAL(10,2),
  clase_energetica TEXT NOT NULL CHECK (clase_energetica IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
  clase_energetica_anterior TEXT CHECK (clase_energetica_anterior IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
  percentil_comparativo DECIMAL(5,2),
  potencial_ahorro DECIMAL(5,2),
  laboratorio_id UUID REFERENCES laboratorios_certificadores(id),
  certificado_numero TEXT NOT NULL,
  certificado_fecha_emision DATE NOT NULL,
  certificado_vigencia_anos INTEGER NOT NULL DEFAULT 2,
  fecha_vencimiento DATE NOT NULL,
  normas_aplicadas JSONB NOT NULL DEFAULT '[]'::jsonb,
  metodologia_ensayo TEXT,
  ensayos_realizados JSONB DEFAULT '{}'::jsonb,
  etiqueta_generada BOOLEAN DEFAULT false,
  etiqueta_datos JSONB DEFAULT '{}'::jsonb,
  ficha_informacion JSONB DEFAULT '{}'::jsonb,
  qr_incluido BOOLEAN DEFAULT false,
  qr_codigo TEXT,
  registrado_base_datos BOOLEAN DEFAULT false,
  fecha_registro DATE,
  codigo_acceso_publico TEXT UNIQUE,
  enlace_portal_dnrt TEXT,
  vigilancias JSONB DEFAULT '[]'::jsonb,
  proxima_vigilancia DATE,
  estado TEXT NOT NULL DEFAULT 'DOCUMENTACION' CHECK (estado IN (
    'DOCUMENTACION', 'ENSAYOS_LABORATORIO', 'CERTIFICADO_ENERGETICO',
    'DECLARACION_JURADA', 'PRESENTACION_TAD', 'REGISTRO_BASE_DATOS',
    'ROTULADO_COMERCIAL', 'VIGENTE', 'VENCIDO'
  )),
  costo_ensayos DECIMAL(10,2) DEFAULT 0,
  costo_certificacion DECIMAL(10,2) DEFAULT 0,
  costo_etiquetado DECIMAL(10,2) DEFAULT 0,
  costo_total DECIMAL(10,2) DEFAULT 0,
  documentos_adjuntos JSONB DEFAULT '[]'::jsonb,
  certificado_url TEXT,
  informe_ensayos_url TEXT,
  etiqueta_url TEXT,
  ficha_informacion_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  notas_internas TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

CREATE INDEX IF NOT EXISTS idx_eficiencia_categoria ON expedientes_eficiencia(categoria_producto);
CREATE INDEX IF NOT EXISTS idx_eficiencia_clase ON expedientes_eficiencia(clase_energetica);
CREATE INDEX IF NOT EXISTS idx_eficiencia_estado ON expedientes_eficiencia(estado);
CREATE INDEX IF NOT EXISTS idx_eficiencia_vencimiento ON expedientes_eficiencia(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_eficiencia_cliente ON expedientes_eficiencia(cliente_id);
CREATE INDEX IF NOT EXISTS idx_eficiencia_publico ON expedientes_eficiencia(codigo_acceso_publico) WHERE registrado_base_datos = true;

ALTER TABLE expedientes_eficiencia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Base datos pública eficiencia accesible"
  ON expedientes_eficiencia FOR SELECT
  TO authenticated
  USING (
    CASE
      WHEN registrado_base_datos = true AND estado = 'VIGENTE' THEN true
      WHEN EXISTS (SELECT 1 FROM usuarios WHERE usuarios.id = auth.uid() AND usuarios.rol IN ('admin', 'gestor')) THEN true
      WHEN EXISTS (SELECT 1 FROM usuarios WHERE usuarios.id = auth.uid() AND usuarios.rol = 'cliente' AND usuarios.entidad_id = cliente_id) THEN true
      ELSE false
    END
  );

CREATE POLICY "Crear expedientes eficiencia admin/gestor"
  ON expedientes_eficiencia FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol IN ('admin', 'gestor')
    )
  );

CREATE POLICY "Actualizar expedientes eficiencia admin/gestor"
  ON expedientes_eficiencia FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol IN ('admin', 'gestor')
    )
  );