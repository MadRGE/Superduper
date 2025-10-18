/*
  # Storage Bucket for Documents

  ## Changes
  1. Storage Setup
    - Creates 'documentos' bucket in Supabase Storage for file uploads
    - Configured as private bucket (requires authentication)
    - Max file size: 50MB
    - Allowed MIME types: PDF, images, Office documents
  
  2. Table Updates
    - Updates documentos table to add storage_path column
    - storage_path will store the path to the file in Supabase Storage
    
  3. Security (RLS)
    - Storage policies for authenticated users to upload/view their documents
    - Users can upload to their own expediente folders
    - Users can view documents from expedientes they have access to
    
  ## Important Notes
  - Files will be organized by expediente: {expediente_id}/{filename}
  - The 'path' column remains for backward compatibility
  - 'storage_path' is the new primary reference for files in Storage
*/

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos',
  'documentos',
  false,
  52428800, -- 50MB in bytes
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Add storage_path column to documentos table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documentos' AND column_name = 'storage_path'
  ) THEN
    ALTER TABLE documentos ADD COLUMN storage_path text;
  END IF;
END $$;

-- Storage RLS Policies

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete documents" ON storage.objects;

-- Policy: Users can upload documents to expedientes they have access to
CREATE POLICY "Users can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documentos' AND
  (
    -- Admin can upload anywhere
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'admin'
    )
    OR
    -- Users can upload to expedientes they created
    EXISTS (
      SELECT 1 FROM expedientes
      WHERE expedientes.id::text = split_part(storage.objects.name, '/', 1)
      AND expedientes.created_by = auth.uid()
    )
    OR
    -- Clients can upload to their own expedientes
    EXISTS (
      SELECT 1 FROM expedientes e
      JOIN clientes c ON c.id = e.cliente_id
      WHERE e.id::text = split_part(storage.objects.name, '/', 1)
      AND c.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
);

-- Policy: Users can view/download documents from expedientes they have access to
CREATE POLICY "Users can view documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documentos' AND
  (
    -- Admin can view all
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'admin'
    )
    OR
    -- Users can view documents from expedientes they created
    EXISTS (
      SELECT 1 FROM expedientes
      WHERE expedientes.id::text = split_part(storage.objects.name, '/', 1)
      AND expedientes.created_by = auth.uid()
    )
    OR
    -- Clients can view their own expediente documents
    EXISTS (
      SELECT 1 FROM expedientes e
      JOIN clientes c ON c.id = e.cliente_id
      WHERE e.id::text = split_part(storage.objects.name, '/', 1)
      AND c.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
);

-- Policy: Users can update their own documents
CREATE POLICY "Users can update documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documentos' AND
  (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'admin'
    )
    OR
    owner = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'documentos' AND
  (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'admin'
    )
    OR
    owner = auth.uid()
  )
);

-- Policy: Users can delete their own documents (or admin can delete any)
CREATE POLICY "Users can delete documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documentos' AND
  (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'admin'
    )
    OR
    owner = auth.uid()
  )
);

-- Add index on storage_path for faster lookups
CREATE INDEX IF NOT EXISTS idx_documentos_storage_path ON documentos(storage_path);