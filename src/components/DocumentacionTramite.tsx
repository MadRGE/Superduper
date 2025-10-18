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
  ExternalLink,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { StorageService } from '@/services/StorageService';
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
  const { toast } = useToast();
  const [tramite, setTramite] = useState<any>(null);
  const [documentosSubidos, setDocumentosSubidos] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    // Buscar el trámite en el catálogo
    Object.values(catalogoTramitesArgentina).forEach(org => {
      const found = org.tramites.find(t => t.id === tramiteTipoId);
      if (found) setTramite(found);
    });
    
    // Cargar documentos ya subidos si existe expediente
    if (expedienteId) {
      cargarDocumentos();
    }
  }, [tramiteTipoId, expedienteId]);

  const cargarDocumentos = async () => {
    if (!expedienteId) return;

    try {
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .eq('expediente_id', expedienteId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocumentosSubidos(data || []);
    } catch (error) {
      console.error('Error cargando documentos:', error);
    }
  };

  if (!tramite) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-300">No se encontró información del trámite</p>
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
      subido.tipo?.toLowerCase().includes(documento.toLowerCase()) ||
      subido.nombre.toLowerCase().includes(documento.toLowerCase())
    );
  };

  const handleUploadDocument = (documento: any) => {
    setSelectedDoc(documento);
    setShowUploadModal(true);
  };

  const handleDownloadDocument = async (documento: any) => {
    if (!documento.storage_path) {
      toast({
        title: 'Error',
        description: 'Este documento no tiene archivo asociado',
        variant: 'destructive'
      });
      return;
    }

    const { error } = await StorageService.downloadFileToDevice(
      documento.storage_path,
      documento.nombre
    );

    if (error) {
      toast({
        title: 'Error al descargar',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !selectedDoc || !expedienteId) {
      setShowUploadModal(false);
      setSelectedDoc(null);
      return;
    }

    setUploading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Usuario no autenticado');

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${expedienteId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Create document record in database
      const { data: newDoc, error: dbError } = await supabase
        .from('documentos')
        .insert({
          expediente_id: expedienteId,
          nombre: file.name,
          tipo: selectedDoc.documento,
          descripcion: selectedDoc.detalle || null,
          storage_path: filePath,
          formato: file.type,
          size_kb: Math.round(file.size / 1024),
          subido_por: user.id,
          estado: 'revision',
          is_active: true,
          metadata: {
            formato_esperado: selectedDoc.formato,
            vigencia_maxima: selectedDoc.vigencia_maxima || null,
            firma: selectedDoc.firma || null
          }
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: 'Documento subido',
        description: `${file.name} se subió correctamente`,
      });

      // Reload documents
      await cargarDocumentos();

      if (onDocumentUpload) {
        onDocumentUpload(newDoc);
      }
    } catch (error: any) {
      console.error('Error subiendo documento:', error);
      toast({
        title: 'Error al subir documento',
        description: error.message || 'No se pudo subir el archivo',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      setShowUploadModal(false);
      setSelectedDoc(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con información del trámite */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="dark:text-gray-100">{tramite.nombre}</span>
            <Badge variant="outline">{tramite.codigo}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Sistema</p>
              <p className="font-medium flex items-center text-gray-900 dark:text-gray-100">
                <ExternalLink className="w-4 h-4 mr-1" />
                {tramite.sistema}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Tiempo estimado</p>
              <p className="font-medium flex items-center text-gray-900 dark:text-gray-100">
                <Clock className="w-4 h-4 mr-1" />
                {tramite.sla_dias} días
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Vigencia</p>
              <p className="font-medium flex items-center text-gray-900 dark:text-gray-100">
                <Calendar className="w-4 h-4 mr-1" />
                {tramite.vigencia_anos} años
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Arancel</p>
              <p className="font-medium flex items-center text-gray-900 dark:text-gray-100">
                <DollarSign className="w-4 h-4 mr-1" />
                <span className="dark:text-gray-100">{tramite.arancel}</span>
              </p>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 dark:text-gray-200">Progreso documentación obligatoria</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{calcularProgreso()}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
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
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
            <span className="text-red-600 dark:text-red-400">Documentación Obligatoria</span>
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
                <div key={index} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-red-300 dark:border-red-600">
                  <div className="flex items-start space-x-3 flex-1">
                    {subido ? (
                      <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{doc.documento}</p>
                      {doc.detalle && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{doc.detalle}</p>
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
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
                          <Info className="w-3 h-3 inline mr-1 dark:text-blue-400" />
                          Incluye: {doc.incluye}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    {!readOnly && !subido && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleUploadDocument(doc)}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Subir
                      </Button>
                    )}
                    {subido && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const docSubido = documentosSubidos.find(d =>
                              d.tipo?.toLowerCase().includes(doc.documento.toLowerCase()) ||
                              d.nombre.toLowerCase().includes(doc.documento.toLowerCase())
                            );
                            if (docSubido) handleDownloadDocument(docSubido);
                          }}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Descargar
                        </Button>
                        <div className="text-xs text-green-600 text-center">
                          ✓ Subido
                        </div>
                      </>
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
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <span className="text-blue-600 dark:text-blue-400">Documentación Opcional/Condicional</span>
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
                  <div key={index} className="flex items-start justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-300 dark:border-blue-600">
                    <div className="flex items-start space-x-3 flex-1">
                      {subido ? (
                        <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5" />
                      ) : (
                        <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{doc.documento}</p>
                        {doc.cuando && (
                          <div className="mt-1 p-2 bg-blue-100 dark:bg-blue-800/30 rounded text-sm text-blue-800 dark:text-blue-200">
                            <strong>Requerido cuando:</strong> {doc.cuando}
                          </div>
                        )}
                        {doc.detalle && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{doc.detalle}</p>
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
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-gray-100">Resumen de Documentación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {tramite.documentacion_obligatoria.filter((doc: any) => !isDocumentoSubido(doc.documento)).length}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">Obligatorios pendientes</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {tramite.documentacion_obligatoria.filter((doc: any) => isDocumentoSubido(doc.documento)).length}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">Obligatorios completos</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {tramite.documentacion_opcional ? 
                  tramite.documentacion_opcional.filter((doc: any) => isDocumentoSubido(doc.documento)).length : 0}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">Opcionales subidos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de subida de documentos */}
      {showUploadModal && selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="dark:text-gray-100">Subir Documento</span>
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
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{selectedDoc.documento}</p>
                {selectedDoc.detalle && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{selectedDoc.detalle}</p>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Seleccionar archivo
                </label>
                <input
                  key={selectedDoc?.documento || 'file-input'}
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Formatos aceptados: {selectedDoc.formato}
                </p>
              </div>

              {uploading && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Subiendo archivo...</p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                >
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