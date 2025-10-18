import React, { useEffect, useState } from 'react';
import {
  Upload,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
  X,
  Eye
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { StorageService } from '@/services/StorageService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

export const DocumentosClienteContent: React.FC = () => {
  const { toast } = useToast();
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    expediente_id: '',
    nombre: '',
    tipo: 'pdf',
    descripcion: ''
  });
  
  const clienteSession = localStorage.getItem('cliente_session');
  const cliente = clienteSession ? JSON.parse(clienteSession) : null;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar expedientes del cliente desde Supabase
      const { data: expedientesData, error: expError } = await supabase
        .from('expedientes')
        .select('id, codigo, alias, cliente_id')
        .eq('cliente_id', cliente.id)
        .eq('is_active', true);

      if (expError) throw expError;

      setExpedientes(expedientesData || []);

      // Cargar documentos de los expedientes del cliente
      if (expedientesData && expedientesData.length > 0) {
        const expedienteIds = expedientesData.map(exp => exp.id);

        const { data: docsData, error: docsError } = await supabase
          .from('documentos')
          .select('*')
          .in('expediente_id', expedienteIds)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (docsError) throw docsError;

        // Enrich documents with expediente info
        const documentosEnriquecidos = (docsData || []).map(doc => {
          const expediente = expedientesData.find(exp => exp.id === doc.expediente_id);
          return {
            ...doc,
            expediente_codigo: expediente?.codigo,
            expediente_alias: expediente?.alias
          };
        });

        setDocumentos(documentosEnriquecidos);
      } else {
        setDocumentos([]);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los documentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !uploadData.expediente_id) return;

    setUploading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Usuario no autenticado');

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${uploadData.expediente_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Create document record in database
      const { error: dbError } = await supabase
        .from('documentos')
        .insert({
          expediente_id: uploadData.expediente_id,
          nombre: uploadData.nombre || file.name,
          tipo: uploadData.tipo,
          descripcion: uploadData.descripcion || null,
          storage_path: filePath,
          formato: file.type,
          size_kb: Math.round(file.size / 1024),
          subido_por: user.id,
          subido_por_rol: 'cliente',
          estado: 'revision',
          is_active: true
        });

      if (dbError) throw dbError;

      toast({
        title: "Documento subido",
        description: `${uploadData.nombre || file.name} se subió correctamente`,
      });

      // Reload documents
      await cargarDatos();

      // Reset form
      setUploadData({
        expediente_id: '',
        nombre: '',
        tipo: 'pdf',
        descripcion: ''
      });
      setShowUploadModal(false);
    } catch (error: any) {
      console.error('Error subiendo documento:', error);
      toast({
        title: "Error al subir documento",
        description: error.message || 'No se pudo subir el archivo',
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
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

  const getEstadoDocumento = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'rechazado':
        return { color: 'bg-red-100 text-red-800', icon: AlertCircle };
      case 'revision':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'pendiente':
        return { color: 'bg-gray-100 text-gray-800', icon: Upload };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: FileText };
    }
  };

  const documentosPorEstado = {
    pendientes: documentos.filter(d => d.estado === 'pendiente').length,
    revision: documentos.filter(d => d.estado === 'revision').length,
    aprobados: documentos.filter(d => d.estado === 'aprobado').length,
    rechazados: documentos.filter(d => d.estado === 'rechazado').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas de documentos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{documentosPorEstado.pendientes}</p>
              </div>
              <Upload className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Revisión</p>
                <p className="text-2xl font-bold text-yellow-600">{documentosPorEstado.revision}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aprobados</p>
                <p className="text-2xl font-bold text-green-600">{documentosPorEstado.aprobados}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rechazados</p>
                <p className="text-2xl font-bold text-red-600">{documentosPorEstado.rechazados}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botón para subir documento */}
      <div className="flex justify-end">
        <Button onClick={() => setShowUploadModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Subir Documento
        </Button>
      </div>

      {/* Lista de documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos Subidos ({documentos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {documentos.length > 0 ? (
            <div className="space-y-3">
              {documentos.map((documento) => {
                const estadoConfig = getEstadoDocumento(documento.estado);
                const IconComponent = estadoConfig.icon;
                
                return (
                  <div key={documento.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-300">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{documento.nombre}</p>
                        <p className="text-sm text-gray-600">
                          {documento.expediente_codigo} - {documento.expediente_alias}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>Subido: {formatDate(documento.created_at)}</span>
                          <span>Tamaño: {documento.size_kb || 0} KB</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={estadoConfig.color}>
                        {documento.estado}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadDocument(documento)}
                          title="Descargar documento"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay documentos subidos
              </h3>
              <p className="text-gray-500 mb-6">
                Comience subiendo la documentación requerida para sus expedientes
              </p>
              <Button onClick={() => setShowUploadModal(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Subir Primer Documento
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de subida */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Subir Documento</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowUploadModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expediente *
                </label>
                <select
                  value={uploadData.expediente_id}
                  onChange={(e) => setUploadData({...uploadData, expediente_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Seleccionar expediente...</option>
                  {expedientes.map((exp) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.codigo} - {exp.alias}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del documento
                </label>
                <input
                  type="text"
                  value={uploadData.nombre}
                  onChange={(e) => setUploadData({...uploadData, nombre: e.target.value})}
                  placeholder="Ej: Certificado de origen"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={uploadData.descripcion}
                  onChange={(e) => setUploadData({...uploadData, descripcion: e.target.value})}
                  rows={3}
                  placeholder="Descripción opcional del documento"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seleccionar archivo *
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos aceptados: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX
                </p>
              </div>

              {uploading && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Subiendo archivo...</p>
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