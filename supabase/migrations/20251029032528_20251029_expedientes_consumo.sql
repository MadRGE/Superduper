/*
  # Módulo Productos de Consumo (Res. 313/2025)
  
  1. Tabla Principal
    - `expedientes_consumo`: 6 categorías de productos
  
  2. Categorías
    - Encendedores, Anteojos, Juguetes
    - Bicicletas, Tableros, Muebles
  
  3. Seguridad
    - RLS por rol de usuario
*/

CREATE TABLE IF NOT EXISTS expedientes_consumo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  tipo_producto TEXT NOT NULL CHECK (tipo_producto IN (
    'ENCENDEDORES', 'ANTEOJOS_SOL', 'JUGUETES', 
    'BICICLETAS_INFANTILES', 'TABLEROS_MADERA', 'MUEBLES'
  )),
  categoria TEXT NOT NULL,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  fabricante TEXT NOT NULL,
  pais_origen TEXT NOT NULL,
  especificaciones_tecnicas JSONB NOT NULL DEFAULT '{}'::jsonb,
  laboratorio_id UUID REFERENCES laboratorios_certificadores(id),
  certificado_numero TEXT NOT NULL,
  certificado_fecha_emision DATE NOT NULL,
  certificado_vigencia_anos INTEGER NOT NULL DEFAULT 1,
  fecha_vencimiento DATE NOT NULL,
  normas_aplicadas JSONB NOT NULL DEFAULT '[]'::jsonb,
  ensayos_realizados JSONB DEFAULT '{}'::jsonb,
  resultado_general TEXT CHECK (resultado_general IN ('CONFORME', 'NO_CONFORME', 'CONDICIONAL')),
  requiere_qr BOOLEAN DEFAULT false,
  qr_generado BOOLEAN DEFAULT false,
  qr_contenido JSONB DEFAULT '{}'::jsonb,
  rotulado_completo BOOLEAN DEFAULT false,
  vigilancias JSONB DEFAULT '[]'::jsonb,
  proxima_vigilancia DATE,
  estado TEXT NOT NULL DEFAULT 'DOCUMENTACION' CHECK (estado IN (
    'DOCUMENTACION', 'ENSAYOS', 'CERTIFICADO', 'VIGENTE', 'VENCIDO', 'RENOVACION_PENDIENTE'
  )),
  costo_ensayos DECIMAL(10,2) DEFAULT 0,
  costo_certificacion DECIMAL(10,2) DEFAULT 0,
  costo_total DECIMAL(10,2) DEFAULT 0,
  documentos_adjuntos JSONB DEFAULT '[]'::jsonb,
  certificado_url TEXT,
  ficha_tecnica_url TEXT,
  manual_usuario_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  notas_internas TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

CREATE INDEX IF NOT EXISTS idx_consumo_tipo ON expedientes_consumo(tipo_producto);
CREATE INDEX IF NOT EXISTS idx_consumo_estado ON expedientes_consumo(estado);
CREATE INDEX IF NOT EXISTS idx_consumo_vencimiento ON expedientes_consumo(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_consumo_cliente ON expedientes_consumo(cliente_id);

ALTER TABLE expedientes_consumo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver expedientes consumo según rol"
  ON expedientes_consumo FOR SELECT
  TO authenticated
  USING (
    CASE 
      WHEN EXISTS (SELECT 1 FROM usuarios WHERE usuarios.id = auth.uid() AND usuarios.rol IN ('admin', 'gestor')) THEN true
      WHEN EXISTS (SELECT 1 FROM usuarios WHERE usuarios.id = auth.uid() AND usuarios.rol = 'cliente' AND usuarios.entidad_id = cliente_id) THEN true
      ELSE false
    END
  );

CREATE POLICY "Crear expedientes consumo admin/gestor"
  ON expedientes_consumo FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol IN ('admin', 'gestor')
    )
  );

CREATE POLICY "Actualizar expedientes consumo admin/gestor"
  ON expedientes_consumo FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol IN ('admin', 'gestor')
    )
  );