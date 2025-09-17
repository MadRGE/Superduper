import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DocumentUploaderProps {
  expedienteId: string
  onUpload: (files: File[]) => void
  requiredDocs: string[]
  uploadedDocs: any[]
  maxFiles?: number
  maxSize?: number // in MB
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  expedienteId,
  onUpload,
  requiredDocs,
  uploadedDocs,
  maxFiles = 10,
  maxSize = 10
}) => {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: `${file.name} excede el tamaño máximo de ${maxSize}MB`,
          variant: "destructive",
        })
        return false
      }
      return true
    })

    setFiles(prev => [...prev, ...validFiles].slice(0, maxFiles))
  }, [maxFiles, maxSize, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles,
    multiple: true
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    try {
      await onUpload(files)
      setFiles([])
      toast({
        title: "Documentos subidos",
        description: `Se subieron ${files.length} archivo(s) correctamente`,
      })
    } catch (error) {
      toast({
        title: "Error al subir",
        description: "Ocurrió un error al subir los documentos",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isDocumentUploaded = (docName: string) => {
    return uploadedDocs.some(doc => 
      doc.tipo?.toLowerCase().includes(docName.toLowerCase()) ||
      doc.nombre?.toLowerCase().includes(docName.toLowerCase())
    )
  }

  return (
    <div className="space-y-6">
      {/* Required Documents Checklist */}
      {requiredDocs.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">Documentos Requeridos</h4>
            <div className="space-y-2">
              {requiredDocs.map((doc, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  {isDocumentUploaded(doc) ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                  )}
                  <span className={isDocumentUploaded(doc) ? 'text-green-700' : 'text-gray-700'}>
                    {doc}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Suelta los archivos aquí...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Arrastra archivos aquí o haz click para seleccionar
                </p>
                <p className="text-sm text-gray-500">
                  PDF, DOC, DOCX, PNG, JPG (máx. {maxSize}MB cada uno)
                </p>
              </div>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium text-gray-900">Archivos seleccionados:</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <File className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {uploading ? 'Subiendo...' : `Subir ${files.length} archivo(s)`}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      {uploadedDocs.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">Documentos Subidos</h4>
            <div className="space-y-2">
              {uploadedDocs.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.nombre}</p>
                      <p className="text-xs text-gray-500">
                        {doc.formato} • {formatFileSize(doc.size_kb * 1024)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}