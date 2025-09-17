import React, { useState, useCallback } from 'react';
import { Upload, FileText, Image, FileSpreadsheet, AlertCircle, Check, X } from 'lucide-react';
import { getChecklistByTramiteId, ChecklistItem } from '../../../data/checklists';

interface Step3DocumentosProps {
  tramiteTipoId: string;
  documentos: any[];
  onDocumentosChange: (documentos: any[]) => void;
}

interface DocumentoSubido {
  id: string;
  nombre: string;
  tipo: string;
  size: number;
  checklistItem?: string;
  obligatorio: boolean;
  file?: File;
}

export const Step3Documentos: React.FC<Step3DocumentosProps> = ({
  tramiteTipoId,
  documentos,
  onDocumentosChange
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const checklist = getChecklistByTramiteId(tramiteTipoId);
  const obligatorios = checklist.filter(item => item.obligatorio);
  const opcionales = checklist.filter(item => !item.obligatorio);

  // Obtener icono según tipo de archivo
  const getFileIcon = (tipo: string) => {
    switch (tipo) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'imagen':
        return <Image className="w-5 h-5 text-green-600" />;
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  // Validar tipo de archivo
  const validarTipoArchivo = (file: File, tipoEsperado: string): boolean => {
    const mimeTypes: Record<string, string[]> = {
      pdf: ['application/pdf'],
      imagen: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
      excel: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      word: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };

    const tiposPermitidos = mimeTypes[tipoEsperado] || [];
    return tiposPermitidos.includes(file.type);
  };

  // Manejar archivos seleccionados
  const handleFiles = useCallback((files: FileList | null, checklistItem?: ChecklistItem) => {
    if (!files) return;

    setUploading(true);
    const nuevosDocumentos: DocumentoSubido[] = [];

    Array.from(files).forEach((file) => {
      // Validar tipo si hay un item específico del checklist
      if (checklistItem && !validarTipoArchivo(file, checklistItem.tipo)) {
        alert(`El archivo ${file.name} no es del tipo esperado (${checklistItem.tipo})`);
        return;
      }

      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`El archivo ${file.name} es demasiado grande (máximo 10MB)`);
        return;
      }

      const documento: DocumentoSubido = {
        id: crypto.randomUUID(),
        nombre: file.name,
        tipo: file.type,
        size: file.size,
        checklistItem: checklistItem?.item,
        obligatorio: checklistItem?.obligatorio || false,
        file
      };

      nuevosDocumentos.push(documento);
    });

    // Simular upload con delay
    setTimeout(() => {
      onDocumentosChange([...documentos, ...nuevosDocumentos]);
      setUploading(false);
    }, 1000);
  }, [documentos, onDocumentosChange]);

  // Manejar drag & drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  // Eliminar documento
  const eliminarDocumento = (id: string) => {
    onDocumentosChange(documentos.filter(doc => doc.id !== id));
  };

  // Verificar si un item del checklist está cubierto
  const isChecklistItemCovered = (item: ChecklistItem): boolean => {
    return documentos.some(doc => doc.checklistItem === item.item);
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Documentación Inicial
        </h2>
        <p className="text-gray-600">
          Sube los documentos requeridos para este tipo de trámite. Los documentos marcados como obligatorios son necesarios para continuar.
        </p>
      </div>

      {/* Zona de drag & drop general */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Arrastra archivos aquí o haz clic para seleccionar
        </h3>
        <p className="text-gray-500 mb-4">
          Formatos soportados: PDF, JPG, PNG, Excel, Word (máximo 10MB por archivo)
        </p>
        <input
          type="file"
          multiple
          className="hidden"
          id="file-upload-general"
          onChange={(e) => handleFiles(e.target.files)}
          accept=".pdf,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.doc,.docx"
        />
        <label
          htmlFor="file-upload-general"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          <Upload className="w-4 h-4 mr-2" />
          Seleccionar Archivos
        </label>
      </div>

      {/* Checklist de documentos obligatorios */}
      {obligatorios.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-medium text-red-900">Documentos Obligatorios</h3>
          </div>
          <div className="space-y-3">
            {obligatorios.map((item) => (
              <div key={item.item} className="flex items-center justify-between p-3 bg-white rounded border">
                <div className="flex items-center space-x-3">
                  {getFileIcon(item.tipo)}
                  <div>
                    <p className="font-medium text-gray-900">{item.item}</p>
                    {item.descripcion && (
                      <p className="text-sm text-gray-600">{item.descripcion}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isChecklistItemCovered(item) ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Subido</span>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        className="hidden"
                        id={`file-${item.item}`}
                        onChange={(e) => handleFiles(e.target.files, item)}
                        accept={item.tipo === 'pdf' ? '.pdf' : item.tipo === 'imagen' ? '.jpg,.jpeg,.png,.gif' : item.tipo === 'excel' ? '.xls,.xlsx' : '.doc,.docx'}
                      />
                      <label
                        htmlFor={`file-${item.item}`}
                        className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 cursor-pointer"
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Subir
                      </label>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checklist de documentos opcionales */}
      {opcionales.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Documentos Opcionales</h3>
          </div>
          <div className="space-y-3">
            {opcionales.map((item) => (
              <div key={item.item} className="flex items-center justify-between p-3 bg-white rounded border">
                <div className="flex items-center space-x-3">
                  {getFileIcon(item.tipo)}
                  <div>
                    <p className="font-medium text-gray-900">{item.item}</p>
                    {item.descripcion && (
                      <p className="text-sm text-gray-600">{item.descripcion}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isChecklistItemCovered(item) ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Subido</span>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        className="hidden"
                        id={`file-${item.item}`}
                        onChange={(e) => handleFiles(e.target.files, item)}
                        accept={item.tipo === 'pdf' ? '.pdf' : item.tipo === 'imagen' ? '.jpg,.jpeg,.png,.gif' : item.tipo === 'excel' ? '.xls,.xlsx' : '.doc,.docx'}
                      />
                      <label
                        htmlFor={`file-${item.item}`}
                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 cursor-pointer"
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Subir
                      </label>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de documentos subidos */}
      {documentos.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">
              Documentos Subidos ({documentos.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {documentos.map((doc) => (
              <div key={doc.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {doc.tipo.includes('image') ? (
                    <Image className="w-5 h-5 text-green-600" />
                  ) : doc.tipo.includes('pdf') ? (
                    <FileText className="w-5 h-5 text-red-600" />
                  ) : (
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{doc.nombre}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{formatFileSize(doc.size)}</span>
                      {doc.checklistItem && (
                        <>
                          <span>•</span>
                          <span>{doc.checklistItem}</span>
                        </>
                      )}
                      {doc.obligatorio && (
                        <>
                          <span>•</span>
                          <span className="text-red-600 font-medium">Obligatorio</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => eliminarDocumento(doc.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado de carga */}
      {uploading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Subiendo archivos...</span>
          </div>
        </div>
      )}

      {/* Resumen */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Resumen de Documentación</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Documentos subidos:</span>
            <span className="ml-2 font-medium">{documentos.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Obligatorios cubiertos:</span>
            <span className="ml-2 font-medium">
              {obligatorios.filter(item => isChecklistItemCovered(item)).length} / {obligatorios.length}
            </span>
          </div>
        </div>
        
        {obligatorios.length > 0 && obligatorios.some(item => !isChecklistItemCovered(item)) && (
          <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            Faltan documentos obligatorios. El expediente se creará pero quedará pendiente de documentación.
          </div>
        )}
      </div>
    </div>
  );
};