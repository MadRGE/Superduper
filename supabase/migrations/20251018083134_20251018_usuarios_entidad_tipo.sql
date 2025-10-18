/*
  # Agregar campo entidad_tipo a usuarios

  1. Cambios
    - Agregar columna `entidad_tipo` para indicar si el usuario es despachante o cliente
    - Esto permite una relación más clara entre usuarios y sus entidades
    - El campo entidad_id ahora puede apuntar a despachantes o clientes según el tipo

  2. Notas
    - entidad_tipo puede ser: 'despachante', 'cliente', o null (para admin/gestor)
    - Cuando entidad_tipo = 'despachante', entidad_id apunta a la tabla despachantes
    - Cuando entidad_tipo = 'cliente', entidad_id apunta a la tabla clientes
*/

-- Agregar campo entidad_tipo si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'entidad_tipo'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN entidad_tipo text;
  END IF;
END $$;

-- Actualizar entidad_tipo basado en el rol existente
UPDATE usuarios
SET entidad_tipo = CASE
  WHEN rol = 'despachante' THEN 'despachante'
  WHEN rol = 'cliente' THEN 'cliente'
  ELSE NULL
END
WHERE entidad_tipo IS NULL;

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_entidad_tipo ON usuarios(entidad_tipo);
CREATE INDEX IF NOT EXISTS idx_usuarios_entidad_id ON usuarios(entidad_id);