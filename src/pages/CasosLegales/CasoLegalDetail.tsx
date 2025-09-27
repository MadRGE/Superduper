import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Building2, User, FileText, Clock, AlertTriangle, CheckCircle, Download, Upload, MessageSquare, CreditCard as Edit, Save, X, Plus, Briefcase, Activity, History, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { databaseService } from '@/services/DatabaseService';
import { CasoLegalFormModal } from '@/components/CasosLegales/CasoLegalFormModal';
import { formatDate } from '@/lib/utils';

export const CasoLegalDetail: React.FC = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  
  const [casoLegal, setCasoLegal] = useState<any>(null);
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [tareas, setTareas] = useState<any[]>([]);
  const [comunicaciones, setComunicaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);

  useEffect(() => {
    if (id) {
      cargarCasoLegal();
    }
  }, [id]);

  const cargarCasoLegal = async () => {
    try {
      setLoading(true);
      
      // Cargar caso legal por ID (mock data por ahora)
      const casosMock = [
        {
          id: 'caso-1',
          cliente_id: 'cliente-1',
          nombre_caso: 'Registro RNPA Productos Lácteos',
          descripcion: 'Gestión integral de registros RNPA para línea de productos lácteos de la empresa',
          estado_legal: 'abierto',
          fecha_apertura: '2025-01-15',
          fecha_cierre: null,
          abogado_responsable_id: null,
          metadata: { categoria: 'regulatorio', prioridad: 'alta' },
          is_active: true,
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
          cliente: {
            id: 'cliente-1',
            razon_social: 'Lácteos del Sur S.A.',
            cuit: '30-12345678-9',
            email: 'contacto@lacteosdelsur.com'
          }
        },
        {
          id: 'caso-2',
          cliente_id: 'cliente-2',
          nombre_caso: 'Homologación Equipos Telecomunicaciones',
          descripcion: 'Proceso de homologación ENACOM para línea de productos tecnológicos',
          estado_legal: 'abierto',
          fecha_apertura: '2025-01-10',
          fecha_cierre: null,
          abogado_responsable_id: null,
          metadata: { categoria: 'tecnologia', prioridad: 'normal' },
          is_active: true,
          created_at: '2025-01-10T09:00:00Z',
          updated_at: '2025-01-10T09:00:00Z',
          cliente: {
            id: 'cliente-2',
            razon_social: 'TechCorp Argentina',
            cuit: '30-98765432-1',
            email: 'info@techcorp.com.ar'
          }
        }
      ];
      
      const caso = casosMock.find(c => c.id === id);
      if (!caso) {
        toast({
          title: "Caso no encontrado",
          description: "El caso legal solicitado no existe",
          variant: "destructive"
        });
        return;
      }
      
      setCasoLegal(caso);
      setEditData({
        nombre_caso: caso.nombre_caso,
        descripcion: caso.descripcion || '',
        estado_legal: caso.estado_legal,
        fecha_cierre: caso.fecha_cierre || ''
      });

      // Cargar expedientes relacionados
      const expedientesMock = [
        {
          id: 'exp-001',
          codigo: 'SGT-2025-ANMAT-00123',
          alias: 'RNPA Yogur Natural',
          estado: 'en_proceso',
          caso_legal_id: 'caso-1'
        },
        {
          id: 'exp-002',
          codigo: 'SGT-2025-ANMAT-00134',
          alias: 'RNPA Cereal Integral',
          estado: 'iniciado',
          caso_legal_id: 'caso-1'
        }
      ];
      setExpedientes(expedientesMock.filter(e => e.caso_legal_id === id));

      // Cargar tareas relacionadas
      const tareasMock = [
        {
          id: 'tarea-1',
          titulo: 'Preparar documentación RNPA',
          descripcion: 'Recopilar y organizar documentación técnica',
          estado: 'pendiente',
          prioridad: 'alta',
          fecha_vencimiento: '2025-01-30',
          caso_legal_id: 'caso-1'
        },
        {
          id: 'tarea-2',
          titulo: 'Revisión legal de contratos',
          descripcion: 'Análisis de contratos con proveedores',
          estado: 'en_proceso',
          prioridad: 'normal',
          fecha_vencimiento: '2025-02-05',
          caso_legal_id: 'caso-1'
        }
      ];
      setTareas(tareasMock.filter(t => t.caso_legal_id === id));

      // Cargar comunicaciones relacionadas
      const comunicacionesMock = [
        {
          id: 'com-1',
          tipo: 'email',
          asunto: 'Inicio de caso legal',
          mensaje: 'Se ha iniciado el caso legal para registros RNPA',
          destinatario: 'contacto@lacteosdelsur.com',
          estado: 'enviado',
          created_at: '2025-01-15T10:30:00Z',
          caso_legal_id: 'caso-1'
        }
      ];
      setComunicaciones(comunicacionesMock.filter(c => c.caso_legal_id === id));

    } catch (error) {
      console.error('Error cargando caso legal:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el caso legal",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCaso = () => {
    setShowFormModal(true);
  };

  const handleDeleteCaso = async () => {
    if (!casoLegal) return;
    
    if (!confirm(`¿Está seguro de que desea eliminar el caso "${casoLegal.nombre_caso}"?`)) {
      return;
    }

    try {
      await databaseService.updateCasoLegal(casoLegal.id, { is_active: false });
      
      toast({
        title: "Caso eliminado",
        description: `${casoLegal.nombre_caso} ha sido eliminado`,
      });
      
      // Redirigir a la lista
      window.location.href = '/casos-legales';
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el caso",
        variant: "destructive"
      });
    }
  };

  const handleModalSuccess = () => {
    cargarCasoLegal();
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'abierto':
        return 'bg-green-100 text-green-800';
      case 'en_litigio':
        return 'bg-red-100 text-red-800';
      case 'cerrado':
        return 'bg-gray-100 text-gray-800';
      case 'archivado':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando caso legal...</p>
        </div>
      </div>
    );
  }

  if (!casoLegal) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Caso legal no encontrado</h2>
        <Link to="/casos-legales" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
          Volver a casos legales
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link 
          to="/casos-legales"
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{casoLegal.nombre_caso}</h1>
          <p className="text-gray-600">{casoLegal.cliente?.razon_social}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={getEstadoColor(casoLegal.estado_legal)}>
            {casoLegal.estado_legal.replace('_', ' ')}
          </Badge>
          {hasPermission('editar_casos_legales') && (
            <Button variant="outline" onClick={handleEditCaso}>
              <Edit className="w-4 h-4 mr-2" />
              Editar Caso
            </Button>
          )}
          {hasPermission('*') && (
            <Button 
              variant="outline"
              onClick={handleDeleteCaso}
              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* Información General */}
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Cliente</p>
                <p className="text-sm text-gray-600">{casoLegal.cliente?.razon_social}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Fecha de apertura</p>
                <p className="text-sm text-gray-600">{formatDate(casoLegal.fecha_apertura)}</p>
              </div>
            </div>
            {casoLegal.fecha_cierre && (
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Fecha de cierre</p>
                  <p className="text-sm text-gray-600">{formatDate(casoLegal.fecha_cierre)}</p>
                </div>
              </div>
            )}
            {casoLegal.abogado_responsable_id && (
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Abogado responsable</p>
                  <p className="text-sm text-gray-600">Asignado</p>
                </div>
              </div>
            )}
          </div>
          
          {casoLegal.descripcion && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-2">Descripción</p>
              <p className="text-sm text-gray-700">{casoLegal.descripcion}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs de contenido */}
      <Tabs defaultValue="expedientes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expedientes">
            Expedientes Relacionados ({expedientes.length})
          </TabsTrigger>
          <TabsTrigger value="tareas">
            Tareas ({tareas.length})
          </TabsTrigger>
          <TabsTrigger value="comunicaciones">
            Comunicaciones ({comunicaciones.length})
          </TabsTrigger>
          <TabsTrigger value="documentos">
            Documentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expedientes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Expedientes Relacionados</CardTitle>
                {hasPermission('crear_expedientes') && (
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Vincular Expediente
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expedientes.map((expediente) => (
                  <div key={expediente.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Link 
                        to={`/expedientes/${expediente.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {expediente.codigo}
                      </Link>
                      <p className="text-sm text-gray-600">{expediente.alias}</p>
                    </div>
                    <Badge className={
                      expediente.estado === 'completado' ? 'bg-green-100 text-green-800' :
                      expediente.estado === 'en_proceso' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {expediente.estado.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
                
                {expedientes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay expedientes vinculados a este caso</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tareas">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tareas del Caso</CardTitle>
                {hasPermission('gestionar_tareas') && (
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Tarea
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tareas.map((tarea) => (
                  <div key={tarea.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        tarea.estado === 'completado' ? 'bg-green-500' :
                        tarea.estado === 'en_proceso' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{tarea.titulo}</p>
                        <p className="text-sm text-gray-600">{tarea.descripcion}</p>
                        <p className="text-xs text-gray-500">
                          Vence: {formatDate(tarea.fecha_vencimiento)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        tarea.prioridad === 'alta' ? 'destructive' : 'secondary'
                      }>
                        {tarea.prioridad}
                      </Badge>
                      <Badge variant={
                        tarea.estado === 'completado' ? 'default' : 'secondary'
                      }>
                        {tarea.estado.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {tareas.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay tareas asignadas a este caso</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comunicaciones">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Comunicaciones del Caso</CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Comunicación
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {comunicaciones.map((comunicacion) => (
                  <div key={comunicacion.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-500 mt-1" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{comunicacion.asunto}</p>
                      <p className="text-sm text-gray-600 mt-1">{comunicacion.mensaje}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(comunicacion.created_at)}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          Para: {comunicacion.destinatario}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {comunicacion.tipo}
                    </Badge>
                  </div>
                ))}
                
                {comunicaciones.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay comunicaciones registradas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Documentos del Caso</CardTitle>
                <Button size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Documento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Funcionalidad de documentos en desarrollo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Formulario */}
      <CasoLegalFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        casoLegal={casoLegal}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};