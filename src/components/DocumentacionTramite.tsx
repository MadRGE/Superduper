import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Download,
  Upload,
  Calendar,
  DollarSign,
  Info,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { catalogoTramitesArgentina } from '@/data/catalogoTramitesCompleto';

interface DocumentacionTramiteProps {
  tramiteTipoId: string;
  expedienteId?: string;
  onDocumentUpload?: (documento: any) => void;
  readOnly?: boolean;
}

export const DocumentacionTramite: React.FC<DocumentacionTramiteProps> = ({ 
  tramiteTipoId, 
  expedienteId,
  onDocumentUpload,
  readOnly = false
}) => {
  const [tramite, setTramite] = useState<any>(null);
  const [documentosSubidos, setDocumentosSubidos] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  
  useEffect(() => {
    // Buscar el trámite en el catálogo
    Object.values(catalogoTramitesArgentina).forEach(org => {
      const found = org.tramites.find(t => t.id === tramiteTipoId);
      if (found) setTramite(found);
    });
    
    // Cargar documentos ya subidos si existe expediente
    if (expedienteId) {
      const docs = JSON.parse(localStorage.getItem(`sgt_docs_${expedienteId}`) || '[]');
      setDocumentosSubidos(docs);
    }
  }, [tramiteTipoId, expedienteId]);

  if (!tramite) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No se encontró información del trámite</p>
        </CardContent>
      </Card>
    );
  }

  const calcularProgreso = () => {
    const totalObligatorios = tramite.documentacion_obligatoria.length;
    const subidos = tramite.documentacion_obligatoria.filter((doc: any) => 
      documentosSubidos.some(subido => subido.nombre.toLowerCase().includes(doc.documento.toLowerCase()))
    ).length;
    return totalObligatorios > 0 ? Math.round((subidos / totalObligatorios) * 100) : 0;
  };

  const isDocumentoSubido = (documento: string) => {
    return documentosSubidos.some(subido => 
      subido.nombre.toLowerCase().includes(documento.toLowerCase())
    );
  };

  const handleUploadDocument = (documento: any) => {
    setSelectedDoc(documento);
    setShowUploadModal(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    // Always close the modal first, regardless of file selection
    setShowUploadModal(false);
    setSelectedDoc(null);
    
    if (!file || !selectedDoc) return;

    const nuevoDocumento = {
      id: `doc-${Date.now()}`,
      expediente_id: expedienteId,
      nombre: file.name,
      tipo: file.type,
      size: file.size,
      estado: 'subido',
      documento_requerido: selectedDoc.documento,
      formato_esperado: selectedDoc.formato,
      created_at: new Date().toISOString()
    };

    const nuevosDocumentos = [...documentosSubidos, nuevoDocumento];
    setDocumentosSubidos(nuevosDocumentos);

    if (expedienteId) {
      localStorage.setItem(`sgt_docs_${expedienteId}`, JSON.stringify(nuevosDocumentos));
    }

    if (onDocumentUpload) {
      onDocumentUpload(nuevoDocumento);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con información del trámite */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{tramite.nombre}</span>
            <Badge variant="outline">{tramite.codigo}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Sistema</p>
              <p className="font-medium flex items-center">
                <ExternalLink className="w-4 h-4 mr-1" />
                {tramite.sistema}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Tiempo estimado</p>
              <p className="font-medium flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {tramite.sla_dias} días
              </p>
            </div>
            <div>
              <p className="text-gray-500">Vigencia</p>
              <p className="font-medium flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {tramite.vigencia_anos} años
              </p>
            </div>
            <div>
              <p className="text-gray-500">Arancel</p>
              <p className="font-medium flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                {tramite.arancel}
              </p>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progreso documentación obligatoria</span>
              <span className="font-medium">{calcularProgreso()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  calcularProgreso() === 100 ? 'bg-green-500' : 
                  calcularProgreso() >= 50 ? 'bg-blue-500' : 'bg-red-500'
                }`}
                style={{ width: `${calcularProgreso()}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentación Obligatoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-600">Documentación Obligatoria</span>
            <Badge variant="destructive" className="text-xs">
              {tramite.documentacion_obligatoria.length} documentos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tramite.documentacion_obligatoria.map((doc: any, index: number) => {
              const subido = isDocumentoSubido(doc.documento);
              return (
                <div key={index} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-red-300">
                  <div className="flex items-start space-x-3 flex-1">
                    {subido ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{doc.documento}</p>
                      {doc.detalle && (
                        <p className="text-sm text-gray-600 mt-1">{doc.detalle}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {doc.formato}
                        </Badge>
                        {doc.vigencia_maxima && (
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                            Vigencia: {doc.vigencia_maxima}
                          </Badge>
                        )}
                        {doc.firma && (
                          <Badge variant="secondary" className="text-xs">
                            Firma: {doc.firma}
                          </Badge>
                        )}
                        {doc.idioma && (
                          <Badge variant="secondary" className="text-xs">
                            Idioma: {doc.idioma}
                          </Badge>
                        )}
                        {doc.lab && (
                          <Badge variant="secondary" className="text-xs">
                            Lab: {doc.lab}
                          </Badge>
                        )}
                      </div>
                      {doc.incluye && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                          <Info className="w-3 h-3 inline mr-1" />
                          Incluye: {doc.incluye}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    {!readOnly && (
                      <Button 
                        size="sm" 
                        variant={subido ? "outline" : "default"}
                        onClick={() => handleUploadDocument(doc)}
                      >
                        {subido ? (
                          <>
                            <Download className="w-4 h-4 mr-1" />
                            Ver
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-1" />
                            Subir
                          </>
                        )}
                      </Button>
                    )}
                    {subido && (
                      <div className="text-xs text-green-600 mt-1 text-center">
                        ✓ Subido
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Documentación Opcional */}
      {tramite.documentacion_opcional && tramite.documentacion_opcional.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-blue-500" />
              <span className="text-blue-600">Documentación Opcional/Condicional</span>
              <Badge variant="secondary" className="text-xs">
                {tramite.documentacion_opcional.length} documentos
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tramite.documentacion_opcional.map((doc: any, index: number) => {
                const subido = isDocumentoSubido(doc.documento);
                return (
                  <div key={index} className="flex items-start justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-300">
                    <div className="flex items-start space-x-3 flex-1">
                      {subido ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      ) : (
                        <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{doc.documento}</p>
                        {doc.cuando && (
                          <div className="mt-1 p-2 bg-blue-100 rounded text-sm text-blue-800">
                            <strong>Requerido cuando:</strong> {doc.cuando}
                          </div>
                        )}
                        {doc.detalle && (
                          <p className="text-sm text-gray-600 mt-1">{doc.detalle}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {doc.formato}
                          </Badge>
                          {doc.duracion && (
                            <Badge variant="outline" className="text-xs">
                              Duración: {doc.duracion}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      {!readOnly && (
                        <Button 
                          size="sm" 
                          variant={subido ? "outline" : "secondary"}
                          onClick={() => handleUploadDocument(doc)}
                        >
                          {subido ? (
                            <>
                              <Download className="w-4 h-4 mr-1" />
                              Ver
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-1" />
                              Subir
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen de estado */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Documentación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {tramite.documentacion_obligatoria.filter((doc: any) => !isDocumentoSubido(doc.documento)).length}
              </p>
              <p className="text-sm text-red-600">Obligatorios pendientes</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {tramite.documentacion_obligatoria.filter((doc: any) => isDocumentoSubido(doc.documento)).length}
              </p>
              <p className="text-sm text-green-600">Obligatorios completos</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {tramite.documentacion_opcional ? 
                  tramite.documentacion_opcional.filter((doc: any) => isDocumentoSubido(doc.documento)).length : 0}
              </p>
              <p className="text-sm text-blue-600">Opcionales subidos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de subida de documentos */}
      {showUploadModal && selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Subir Documento</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowUploadModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm">{selectedDoc.documento}</p>
                {selectedDoc.detalle && (
                  <p className="text-xs text-gray-600 mt-1">{selectedDoc.detalle}</p>
                )}
                <div className="flex gap-1 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedDoc.formato}
                  </Badge>
                  {selectedDoc.vigencia_maxima && (
                    <Badge variant="outline" className="text-xs">
                      Vigencia: {selectedDoc.vigencia_maxima}
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar archivo
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos aceptados: {selectedDoc.formato}
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};