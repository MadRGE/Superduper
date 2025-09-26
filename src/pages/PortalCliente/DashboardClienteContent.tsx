import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Eye,
  Upload,
  Calendar,
  Building2,
  User,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDate, getDaysRemaining } from '@/lib/utils';

export const DashboardClienteContent: React.FC = () => {
  const { toast } = useToast();
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpediente, setSelectedExpediente] = useState<any>(null);
  
  // Obtener datos del cliente de la sesión
  const clienteSession = localStorage.getItem('cliente_session');
  const cliente = clienteSession ? JSON.parse(clienteSession) : null;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar expedientes del cliente desde localStorage (mock data)
      const expedientesStorage = localStorage.getItem('sgt_expedientes');
      const todosExpedientes = expedientesStorage ? JSON.parse(expedientesStorage) : [];
      
      // Filtrar expedientes del cliente actual
      const expedientesCliente = todosExpedientes.filter((exp: any) => 
        exp.cliente_id === cliente.id || exp.cliente_nombre === cliente.razon_social
      );
      
      setExpedientes(expedientesCliente);
      
      // Cargar documentos si hay expedientes
      if (expedientesCliente.length > 0) {
        const todosDocumentos: any[] = [];
        expedientesCliente.forEach((exp: any) => {
          const docsExpediente = JSON.parse(
            localStorage.getItem(`sgt_documentos_${exp.id}`) || '[]'
          );
          todosDocumentos.push(...docsExpediente);
        });
        setDocumentos(todosDocumentos);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800';
      case 'observado':
        return 'bg-yellow-100 text-yellow-800';
      case 'vencido':
        return 'bg-red-100 text-red-800';
      case 'iniciado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSemaforoIcon = (diasRestantes: number) => {
    if (diasRestantes < 0) return <AlertCircle className="w-5 h-5 text-red-500" />;
    if (diasRestantes <= 3) return <Clock className="w-5 h-5 text-yellow-500" />;
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const calcularEstadisticas = () => {
    const total = expedientes.length;
    const activos = expedientes.filter(e => !['completado', 'cancelado'].includes(e.estado)).length;
    const completados = expedientes.filter(e => e.estado === 'completado').length;
    const vencidos = expedientes.filter(e => e.estado === 'vencido').length;
    const documentosPendientes = documentos.filter(d => d.estado === 'pendiente').length;
    
    return { total, activos, completados, vencidos, documentosPendientes };
  };

  const stats = calcularEstadisticas();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expedientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-blue-600">{stats.activos}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-green-600">{stats.completados}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Docs Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.documentosPendientes}</p>
              </div>
              <Upload className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expedientes del Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Mis Expedientes</span>
            <Badge variant="secondary">{expedientes.length} expedientes</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expedientes.length > 0 ? (
            <div className="space-y-4">
              {expedientes.map((expediente) => {
                const diasRestantes = getDaysRemaining(expediente.fecha_limite);
                const progreso = expediente.progreso || Math.round((expediente.paso_actual / 8) * 100);
                
                return (
                  <div 
                    key={expediente.id} 
                    className="p-4 border rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                    onClick={() => setSelectedExpediente(
                      selectedExpediente?.id === expediente.id ? null : expediente
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getSemaforoIcon(diasRestantes)}
                        <div>
                          <p className="font-medium text-gray-900">{expediente.codigo}</p>
                          <p className="text-sm text-gray-600">{expediente.alias}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getEstadoColor(expediente.estado)}>
                          {expediente.estado.replace('_', ' ')}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Building2 className="w-4 h-4" />
                        <span>{expediente.organismo}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Inicio: {formatDate(expediente.fecha_inicio)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Límite: {formatDate(expediente.fecha_limite)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={diasRestantes < 0 ? 'text-red-600 font-medium' : ''}>
                          {diasRestantes < 0 
                            ? `Vencido ${Math.abs(diasRestantes)}d` 
                            : `${diasRestantes}d restantes`
                          }
                        </span>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">Progreso del trámite</span>
                        <span className="font-medium text-gray-900">{progreso}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            progreso < 30 ? 'bg-red-500' :
                            progreso < 70 ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${progreso}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Paso {expediente.paso_actual} de 8
                      </div>
                    </div>

                    {/* Detalles expandibles */}
                    {selectedExpediente?.id === expediente.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Información del Trámite</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Tipo:</span>
                              <span className="ml-2">{expediente.tramite_nombre}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Prioridad:</span>
                              <Badge className="ml-2" variant="outline">
                                {expediente.prioridad}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-gray-500">Fecha límite:</span>
                              <span className={`ml-2 ${diasRestantes < 0 ? 'text-red-600 font-medium' : ''}`}>
                                {formatDate(expediente.fecha_limite)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Paso actual:</span>
                              <span className="ml-2">{expediente.paso_actual} de 8</span>
                            </div>
                          </div>
                        </div>

                        {expediente.observaciones && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Observaciones</h4>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                              {expediente.observaciones}
                            </p>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Descargar Estado
                          </Button>
                          <Button size="sm" variant="outline">
                            <Upload className="w-4 h-4 mr-2" />
                            Subir Documento
                          </Button>
                          <Button size="sm" variant="outline">
                            <Bell className="w-4 h-4 mr-2" />
                            Notificaciones
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tiene expedientes registrados
              </h3>
              <p className="text-gray-500 mb-6">
                Contacte a nuestro equipo para iniciar un nuevo trámite
              </p>
              <Button variant="outline">
                <User className="w-4 h-4 mr-2" />
                Contactar Soporte
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documentos Pendientes */}
      {stats.documentosPendientes > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <span>Documentos Pendientes</span>
              <Badge variant="destructive">{stats.documentosPendientes}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documentos
                .filter(doc => doc.estado === 'pendiente')
                .slice(0, 5)
                .map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.nombre}</p>
                        <p className="text-sm text-gray-600">
                          Expediente: {expedientes.find(e => e.id === doc.expediente_id)?.codigo}
                        </p>
                      </div>
                    </div>
                    <Button size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Subir
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información de Contacto */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Datos de la Empresa</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Razón Social:</span>
                  <span className="ml-2">{cliente.razon_social}</span>
                </div>
                <div>
                  <span className="text-gray-500">CUIT:</span>
                  <span className="ml-2">{cliente.cuit}</span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2">{cliente.email}</span>
                </div>
                {cliente.telefono && (
                  <div>
                    <span className="text-gray-500">Teléfono:</span>
                    <span className="ml-2">{cliente.telefono}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Soporte Técnico</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2">soporte@sgt.gov.ar</span>
                </div>
                <div>
                  <span className="text-gray-500">Teléfono:</span>
                  <span className="ml-2">+54 11 4000-0000</span>
                </div>
                <div>
                  <span className="text-gray-500">Horario:</span>
                  <span className="ml-2">Lun-Vie 9:00-18:00</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};