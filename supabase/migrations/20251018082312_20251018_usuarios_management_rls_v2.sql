/*
  # Gestión de Usuarios con Seguridad RLS

  1. Mejoras a tabla usuarios
    - Agregar columnas adicionales para gestión completa
    - `avatar_url` (text) - URL del avatar del usuario
    - `permisos_especiales` (text[]) - Permisos adicionales específicos
    - `clientes_asignados` (text[]) - IDs de clientes asignados al usuario
    - `preferencias` (jsonb) - Preferencias personalizadas del usuario
    - `estado` (text) - Estado del usuario: activo, inactivo, suspendido
    - `fecha_ultimo_cambio_password` (timestamptz) - Control de cambios de contraseña
    - `requiere_cambio_password` (boolean) - Indica si debe cambiar contraseña en próximo acceso
    - `intentos_login_fallidos` (integer) - Contador de intentos fallidos
    - `bloqueado_hasta` (timestamptz) - Fecha hasta la cual está bloqueado
    
  2. Tabla de auditoría de usuarios
    - Registra todas las acciones importantes de usuarios
    - Cambios de rol, permisos, activaciones/desactivaciones
    
  3. Seguridad RLS
    - Políticas restrictivas para proteger datos de usuarios
    - Solo admins pueden ver y gestionar usuarios
    - Usuarios pueden ver su propia información
    - Registro completo de auditoría de cambios
*/

-- Agregar columnas adicionales a tabla usuarios si no existen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN avatar_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'permisos_especiales'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN permisos_especiales text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'clientes_asignados'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN clientes_asignados text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'preferencias'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN preferencias jsonb DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'estado'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN estado text DEFAULT 'activo';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'fecha_ultimo_cambio_password'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN fecha_ultimo_cambio_password timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'requiere_cambio_password'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN requiere_cambio_password boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'intentos_login_fallidos'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN intentos_login_fallidos integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'bloqueado_hasta'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN bloqueado_hasta timestamptz;
  END IF;
END $$;

-- Crear tabla de auditoría de usuarios
CREATE TABLE IF NOT EXISTS auditoria_usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id),
  accion text NOT NULL,
  detalles jsonb,
  campo_modificado text,
  valor_anterior text,
  valor_nuevo text,
  realizado_por uuid,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS en tabla usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en tabla de auditoría
ALTER TABLE auditoria_usuarios ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Administradores pueden ver todos los usuarios" ON usuarios;
DROP POLICY IF EXISTS "Usuarios pueden ver su propia información" ON usuarios;
DROP POLICY IF EXISTS "Solo administradores pueden crear usuarios" ON usuarios;
DROP POLICY IF EXISTS "Solo administradores pueden actualizar usuarios" ON usuarios;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propia información" ON usuarios;
DROP POLICY IF EXISTS "Solo administradores pueden eliminar usuarios" ON usuarios;
DROP POLICY IF EXISTS "Administradores pueden ver auditoría" ON auditoria_usuarios;
DROP POLICY IF EXISTS "Sistema puede insertar en auditoría" ON auditoria_usuarios;

-- Política: Los administradores pueden ver todos los usuarios
CREATE POLICY "Administradores pueden ver todos los usuarios"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND u.rol = 'admin'
      AND u.is_active = true
    )
  );

-- Política: Los usuarios pueden ver su propia información
CREATE POLICY "Usuarios pueden ver su propia información"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Política: Solo administradores pueden crear usuarios
CREATE POLICY "Solo administradores pueden crear usuarios"
  ON usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND u.rol = 'admin'
      AND u.is_active = true
    )
  );

-- Política: Solo administradores pueden actualizar otros usuarios
CREATE POLICY "Solo administradores pueden actualizar usuarios"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND u.rol = 'admin'
      AND u.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND u.rol = 'admin'
      AND u.is_active = true
    )
  );

-- Política: Solo administradores pueden eliminar usuarios
CREATE POLICY "Solo administradores pueden eliminar usuarios"
  ON usuarios
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND u.rol = 'admin'
      AND u.is_active = true
    )
  );

-- Políticas de auditoría: Solo administradores pueden ver registros de auditoría
CREATE POLICY "Administradores pueden ver auditoría"
  ON auditoria_usuarios
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND u.rol = 'admin'
      AND u.is_active = true
    )
  );

-- Política: Sistema puede insertar en auditoría
CREATE POLICY "Sistema puede insertar en auditoría"
  ON auditoria_usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_estado ON usuarios(estado);
CREATE INDEX IF NOT EXISTS idx_usuarios_is_active ON usuarios(is_active);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_id ON auditoria_usuarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_created_at ON auditoria_usuarios(created_at DESC);

-- Insertar usuarios de prueba para desarrollo (solo si no existen)
DO $$
BEGIN
  -- Admin
  IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin@sgt.gov.ar') THEN
    INSERT INTO usuarios (id, email, nombre, apellido, rol, estado, is_active, permisos_especiales, clientes_asignados)
    VALUES (
      gen_random_uuid(),
      'admin@sgt.gov.ar',
      'Admin',
      'SGT',
      'admin',
      'activo',
      true,
      '{}',
      '{}'
    );
  END IF;

  -- Gestor
  IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'gestor@sgt.gov.ar') THEN
    INSERT INTO usuarios (id, email, nombre, apellido, rol, estado, is_active, permisos_especiales, clientes_asignados)
    VALUES (
      gen_random_uuid(),
      'gestor@sgt.gov.ar',
      'Gestor',
      'Principal',
      'gestor',
      'activo',
      true,
      '{}',
      '{}'
    );
  END IF;

  -- Despachante
  IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'despachante@sgt.gov.ar') THEN
    INSERT INTO usuarios (id, email, nombre, apellido, rol, estado, is_active, permisos_especiales, clientes_asignados)
    VALUES (
      gen_random_uuid(),
      'despachante@sgt.gov.ar',
      'Juan',
      'Pérez',
      'despachante',
      'activo',
      true,
      '{}',
      ARRAY['cliente-1', 'cliente-2']
    );
  END IF;
END $$;