/*
  # Proveedores y Listas de Precios
  
  Sistema completo de gestión de proveedores y catálogo de servicios con precios.
  
  ## Nuevas Tablas
  
  ### 1. `proveedores`
  Registro completo de proveedores y subcontratistas del sistema.
  - `id` (uuid, PK) - Identificador único
  - `razon_social` (text, required) - Razón social del proveedor
  - `cuit` (text, required, unique) - CUIT del proveedor
  - `categoria` (text) - Tipo: laboratorio, certificadora, despachante, consultor, traductor
  - `especialidades` (text[]) - Áreas de especialización
  - `ubicacion` (text) - Ubicación geográfica
  - `telefono` (text) - Teléfono de contacto
  - `email` (text) - Email de contacto
  - `web` (text) - Sitio web
  - `certificaciones` (text[]) - Certificaciones que posee (ISO 17025, OCP, etc)
  - `calificacion` (integer) - Calificación de 1-5 estrellas
  - `servicios_completados` (integer) - Cantidad de servicios realizados
  - `monto_facturado` (numeric) - Total facturado histórico
  - `estado` (text) - activo, inactivo, suspendido
  - `observaciones` (text) - Notas adicionales
  - `metadata` (jsonb) - Datos adicionales flexibles
  - `is_active` (boolean, default true)
  - `created_at`, `updated_at` (timestamptz)
  
  ### 2. `catalogo_servicios_proveedor`
  Define los servicios que cada proveedor puede ofrecer.
  - `id` (uuid, PK) - Identificador único
  - `proveedor_id` (uuid, FK -> proveedores) - Referencia al proveedor
  - `codigo` (text, required) - Código del servicio
  - `nombre` (text, required) - Nombre descriptivo del servicio
  - `descripcion` (text) - Descripción detallada
  - `unidad` (text) - Unidad de medida: servicio, ensayo, hora, producto, código
  - `categoria` (text) - Categoría del servicio
  - `tiempo_entrega_dias` (integer) - Tiempo estimado de entrega
  - `requiere_muestra` (boolean) - Indica si requiere envío de muestra
  - `observaciones` (text) - Notas adicionales
  - `is_active` (boolean, default true)
  - `created_at`, `updated_at` (timestamptz)
  
  ### 3. `lista_precios`
  Precios de servicios por proveedor con vigencia y condiciones.
  - `id` (uuid, PK) - Identificador único
  - `proveedor_id` (uuid, FK -> proveedores) - Referencia al proveedor
  - `servicio_id` (uuid, FK -> catalogo_servicios_proveedor) - Referencia al servicio
  - `precio_unitario` (numeric, required) - Precio por unidad
  - `moneda` (text, default 'ARS') - Moneda del precio
  - `vigencia_desde` (date) - Fecha de inicio de vigencia
  - `vigencia_hasta` (date) - Fecha de fin de vigencia
  - `descuento_volumen` (jsonb) - Estructura de descuentos por cantidad
  - `condiciones_comerciales` (text) - Términos y condiciones
  - `tiempo_pago_dias` (integer) - Plazo de pago en días
  - `incluye_iva` (boolean, default false) - Si el precio incluye IVA
  - `observaciones` (text) - Notas adicionales
  - `is_active` (boolean, default true)
  - `created_at`, `updated_at` (timestamptz)
  
  ## Seguridad
  
  1. Habilitar RLS en todas las tablas
  2. Políticas restrictivas basadas en autenticación
  3. Solo usuarios autenticados pueden consultar
  4. Solo admins/gestores pueden modificar
  
  ## Notas Importantes
  
  - La relación proveedor -> servicios -> precios permite flexibilidad total
  - Un proveedor puede tener múltiples servicios
  - Cada servicio puede tener múltiples precios (histórico y vigentes)
  - Los precios inactivos se mantienen para auditoría
  - El campo metadata permite extensibilidad sin cambios de schema
*/

-- =============================================
-- 1. TABLA PROVEEDORES
-- =============================================

CREATE TABLE IF NOT EXISTS proveedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razon_social text NOT NULL,
  cuit text NOT NULL UNIQUE,
  categoria text,
  especialidades text[],
  ubicacion text,
  telefono text,
  email text,
  web text,
  certificaciones text[],
  calificacion integer DEFAULT 0 CHECK (calificacion >= 0 AND calificacion <= 5),
  servicios_completados integer DEFAULT 0,
  monto_facturado numeric DEFAULT 0,
  estado text DEFAULT 'activo',
  observaciones text,
  metadata jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para proveedores
CREATE INDEX IF NOT EXISTS idx_proveedores_categoria ON proveedores(categoria);
CREATE INDEX IF NOT EXISTS idx_proveedores_estado ON proveedores(estado);
CREATE INDEX IF NOT EXISTS idx_proveedores_cuit ON proveedores(cuit);
CREATE INDEX IF NOT EXISTS idx_proveedores_is_active ON proveedores(is_active);

-- =============================================
-- 2. TABLA CATALOGO_SERVICIOS_PROVEEDOR
-- =============================================

CREATE TABLE IF NOT EXISTS catalogo_servicios_proveedor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id uuid NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
  codigo text NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  unidad text DEFAULT 'servicio',
  categoria text,
  tiempo_entrega_dias integer,
  requiere_muestra boolean DEFAULT false,
  observaciones text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(proveedor_id, codigo)
);

-- Índices para catalogo_servicios_proveedor
CREATE INDEX IF NOT EXISTS idx_servicios_proveedor_id ON catalogo_servicios_proveedor(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_servicios_categoria ON catalogo_servicios_proveedor(categoria);
CREATE INDEX IF NOT EXISTS idx_servicios_codigo ON catalogo_servicios_proveedor(codigo);
CREATE INDEX IF NOT EXISTS idx_servicios_is_active ON catalogo_servicios_proveedor(is_active);

-- =============================================
-- 3. TABLA LISTA_PRECIOS
-- =============================================

CREATE TABLE IF NOT EXISTS lista_precios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id uuid NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
  servicio_id uuid NOT NULL REFERENCES catalogo_servicios_proveedor(id) ON DELETE CASCADE,
  precio_unitario numeric NOT NULL CHECK (precio_unitario >= 0),
  moneda text DEFAULT 'ARS',
  vigencia_desde date,
  vigencia_hasta date,
  descuento_volumen jsonb,
  condiciones_comerciales text,
  tiempo_pago_dias integer DEFAULT 30,
  incluye_iva boolean DEFAULT false,
  observaciones text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para lista_precios
CREATE INDEX IF NOT EXISTS idx_precios_proveedor_id ON lista_precios(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_precios_servicio_id ON lista_precios(servicio_id);
CREATE INDEX IF NOT EXISTS idx_precios_vigencia ON lista_precios(vigencia_desde, vigencia_hasta);
CREATE INDEX IF NOT EXISTS idx_precios_is_active ON lista_precios(is_active);

-- =============================================
-- 4. TRIGGERS PARA UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_proveedores_updated_at ON proveedores;
CREATE TRIGGER update_proveedores_updated_at
  BEFORE UPDATE ON proveedores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_servicios_updated_at ON catalogo_servicios_proveedor;
CREATE TRIGGER update_servicios_updated_at
  BEFORE UPDATE ON catalogo_servicios_proveedor
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_precios_updated_at ON lista_precios;
CREATE TRIGGER update_precios_updated_at
  BEFORE UPDATE ON lista_precios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 5. ROW LEVEL SECURITY
-- =============================================

-- Habilitar RLS
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_servicios_proveedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_precios ENABLE ROW LEVEL SECURITY;

-- Políticas para PROVEEDORES
CREATE POLICY "Usuarios autenticados pueden ver proveedores"
  ON proveedores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo admins/gestores pueden crear proveedores"
  ON proveedores FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.rol IN ('admin', 'gestor')
    )
  );

CREATE POLICY "Solo admins/gestores pueden actualizar proveedores"
  ON proveedores FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.rol IN ('admin', 'gestor')
    )
  );

CREATE POLICY "Solo admins pueden eliminar proveedores"
  ON proveedores FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.rol = 'admin'
    )
  );

-- Políticas para CATALOGO_SERVICIOS_PROVEEDOR
CREATE POLICY "Usuarios autenticados pueden ver servicios"
  ON catalogo_servicios_proveedor FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo admins/gestores pueden crear servicios"
  ON catalogo_servicios_proveedor FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.rol IN ('admin', 'gestor')
    )
  );

CREATE POLICY "Solo admins/gestores pueden actualizar servicios"
  ON catalogo_servicios_proveedor FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.rol IN ('admin', 'gestor')
    )
  );

CREATE POLICY "Solo admins pueden eliminar servicios"
  ON catalogo_servicios_proveedor FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.rol = 'admin'
    )
  );

-- Políticas para LISTA_PRECIOS
CREATE POLICY "Usuarios autenticados pueden ver precios"
  ON lista_precios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo admins/gestores pueden crear precios"
  ON lista_precios FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.rol IN ('admin', 'gestor')
    )
  );

CREATE POLICY "Solo admins/gestores pueden actualizar precios"
  ON lista_precios FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.rol IN ('admin', 'gestor')
    )
  );

CREATE POLICY "Solo admins pueden eliminar precios"
  ON lista_precios FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.rol = 'admin'
    )
  );
