import React, { useState } from 'react';
import { Shield, FileText, Users, Calendar, Clock, CheckCircle, AlertTriangle, User, Building2, Phone, Mail, Eye, CreditCard as Edit, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/use-auth';

export const PortalDespachante: React.FC = () => {
  const { hasPermission, userRole, userName } = usePermissions();
  const { usuario } = useAuth();
  const [selectedCliente, setSelectedCliente] = useState<any>(null);

  // Verificar permisos de despachante
  if (!hasPermission('ver_clientes_asignados')) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
        <p className="text-gray-600">No tiene permisos para acceder a esta sección</p>
      </div>
    );
  }

  // Obtener clientes asignados del usuario actual
  const clientesAsignadosIds = usuario?.clientes_asignados || [];
  const clientesAsignados = clientesAsignadosIds.length;

  return (
    <div className="space-y-6">
      {/* Header con restricción de permisos */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portal Despachante</h1>
          <p className="text-gray-600">Gestión de trámites de clientes asignados</p>
          <p className="text-sm text-gray-500">Bienvenido, {userName}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            <Shield className="w-4 h-4 mr-2" />
            Acceso Limitado
          </Badge>
          <Badge variant="outline">
            {clientesAsignados} clientes asignados
          </Badge>
        </div>
      </div>

      {/* Stats del Despachante */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clientes Asignados</p>
                <p className="text-2xl font-bold text-blue-600">{clientesAsignados}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trámites Activos</p>
                <p className="text-2xl font-bold text-green-600">12</p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tareas Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">8</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vencimientos Próximos</p>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Lista de Clientes Asignados */}
        <div className="col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Mis Clientes Asignados</CardTitle>
            </CardHeader>
            <CardContent>
              <MisClientesDespachante onSelectCliente={setSelectedCliente} />
            </CardContent>
          </Card>
        </div>

        {/* Detalle del Cliente Seleccionado */}
        <div className="col-span-8">
          {selectedCliente ? (
            <ClienteDetalleRestringido cliente={selectedCliente} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Seleccione un cliente
                </h3>
                <p>Seleccione un cliente de su lista asignada para gestionar sus trámites</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Sección de Tareas y Calendario */}
      <Tabs defaultValue="tareas">
        <TabsList>
          <TabsTrigger value="tareas">Mis Tareas</TabsTrigger>
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="actividad">Actividad Reciente</TabsTrigger>
        </TabsList>

        <TabsContent value="tareas">
          <TareasDespachante />
        </TabsContent>

        <TabsContent value="calendario">
          <CalendarioDespachante />
        </TabsContent>

        <TabsContent value="actividad">
          <ActividadRecienteDespachante />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente de Clientes para Despachante (vista limitada)
const MisClientesDespachante: React.FC<{onSelectCliente: (cliente: any) => void}> = ({ onSelectCliente }) => {
  const { usuario } = useAuth();
  const { canViewCliente } = usePermissions();
  
  // Filtrar solo clientes asignados al despachante actual
  const clientesAsignados = [
    {
      id: 'cliente-1',
      razon_social: 'Alimentos del Sur SA',
      cuit: '30-71234567-8',
      tramites_activos: 3,
      ultimo_contacto: '2025-01-25',
      contacto_nombre: 'María González',
      contacto_email: 'maria@lacteosdelsur.com',
      contacto_telefono: '+54 11 4567-8900',
      estado: 'activo',
      prioridad_maxima: 'alta'
    },
    {
      id: 'cliente-2',
      razon_social: 'TechImport SA',
      cuit: '33-69876543-9',
      tramites_activos: 2,
      ultimo_contacto: '2025-01-24',
      contacto_nombre: 'Carlos Rodríguez',
      contacto_email: 'carlos@techimport.com',
      contacto_telefono: '+54 11 9876-5432',
      estado: 'activo',
      prioridad_maxima: 'normal'
    }
  ].filter(cliente => canViewCliente(cliente.id));

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {clientesAsignados.map(cliente => (
        <div
          key={cliente.id}
          onClick={() => onSelectCliente(cliente)}
          className="p-4 border rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <p className="font-medium text-sm">{cliente.razon_social}</p>
                <Badge variant={cliente.prioridad_maxima === 'alta' ? 'destructive' : 'secondary'} className="text-xs">
                  {cliente.prioridad_maxima}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mb-2">{cliente.cuit}</p>
              
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>{cliente.contacto_nombre}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Mail className="w-3 h-3" />
                  <span>{cliente.contacto_email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="w-3 h-3" />
                  <span>{cliente.contacto_telefono}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-3 text-xs">
                <span className="flex items-center text-blue-600">
                  <FileText className="w-3 h-3 mr-1" />
                  {cliente.tramites_activos} activos
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">
                  Último contacto: {new Date(cliente.ultimo_contacto).toLocaleDateString('es-AR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente Detalle Restringido para Despachantes
const ClienteDetalleRestringido: React.FC<{cliente: any}> = ({ cliente }) => {
  const { hasPermission } = usePermissions();
  
  return (
    <div className="space-y-6">
      {/* Header del Cliente */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{cliente.razon_social}</h2>
                <p className="text-gray-600">CUIT: {cliente.cuit}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    Cliente asignado
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {cliente.tramites_activos} trámites activos
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                Contactar
              </Button>
              {hasPermission('gestionar_tareas_propias') && (
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Tarea
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información de Contacto */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Contacto Principal</p>
                <p className="text-sm text-gray-600">{cliente.contacto_nombre}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-600">{cliente.contacto_email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Teléfono</p>
                <p className="text-sm text-gray-600">{cliente.contacto_telefono}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trámites del Cliente (Vista Despachante) */}
      <TramitesClienteDespachante clienteId={cliente.id} />
    </div>
  );
};

// Componente Trámites para Vista Despachante
const TramitesClienteDespachante: React.FC<{clienteId: string}> = ({ clienteId }) => {
  const { canEditExpediente } = usePermissions();
  
  const tramites = [
    {
      id: 'exp-001',
      codigo: 'SGT-2025-ANMAT-00123',
      alias: 'RNPA Yogur Natural',
      estado: 'en_proceso',
      progreso: 65,
      fecha_limite: '2025-03-01',
      dias_restantes: 12,
      mi_tarea: 'Revisión documentación',
      prioridad: 'alta'
    },
    {
      id: 'exp-002',
      codigo: 'SGT-2025-ANMAT-00134',
      alias: 'RNPA Cereal Integral',
      estado: 'iniciado',
      progreso: 25,
      fecha_limite: '2025-03-06',
      dias_restantes: 17,
      mi_tarea: 'Preparar carpeta técnica',
      prioridad: 'normal'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trámites Asignados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tramites.map(tramite => (
            <div key={tramite.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{tramite.alias}</h4>
                  <p className="text-sm text-gray-600">{tramite.codigo}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={tramite.prioridad === 'alta' ? 'destructive' : 'secondary'}>
                    {tramite.prioridad}
                  </Badge>
                  <Badge className={
                    tramite.estado === 'completado' ? 'bg-green-100 text-green-800' :
                    tramite.estado === 'en_proceso' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {tramite.estado.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-900">Mi tarea actual:</p>
                  <p className="text-sm text-yellow-700">{tramite.mi_tarea}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso:</span>
                    <span className="font-medium">{tramite.progreso}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        tramite.progreso < 30 ? 'bg-red-500' :
                        tramite.progreso < 70 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${tramite.progreso}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Vence: {new Date(tramite.fecha_limite).toLocaleDateString('es-AR')}</span>
                    <span className={tramite.dias_restantes < 7 ? 'text-orange-600 font-medium' : ''}>
                      {tramite.dias_restantes} días restantes
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalle
                  </Button>
                  {canEditExpediente(tramite) && (
                    <Button size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Trabajar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente Tareas del Despachante
const TareasDespachante: React.FC = () => {
  const { hasPermission } = usePermissions();
  
  const tareas = [
    {
      id: 1,
      titulo: 'Revisión documentación RNPA',
      expediente: 'SGT-2025-ANMAT-00123',
      cliente: 'Alimentos del Sur SA',
      vencimiento: '2025-01-28',
      prioridad: 'alta',
      estado: 'pendiente'
    },
    {
      id: 2,
      titulo: 'Preparar carpeta técnica',
      expediente: 'SGT-2025-ANMAT-00134',
      cliente: 'Alimentos del Sur SA',
      vencimiento: '2025-01-30',
      prioridad: 'normal',
      estado: 'en_proceso'
    },
    {
      id: 3,
      titulo: 'Contactar laboratorio ensayos',
      expediente: 'SGT-2025-ENACOM-00087',
      cliente: 'TechImport SA',
      vencimiento: '2025-01-29',
      prioridad: 'alta',
      estado: 'pendiente'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Tareas Pendientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tareas.map(tarea => (
            <div key={tarea.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  tarea.prioridad === 'alta' ? 'bg-red-500' :
                  tarea.prioridad === 'normal' ? 'bg-blue-500' : 'bg-gray-500'
                }`} />
                <div>
                  <p className="font-medium text-gray-900">{tarea.titulo}</p>
                  <p className="text-sm text-gray-600">{tarea.expediente} • {tarea.cliente}</p>
                  <p className="text-xs text-gray-500">
                    Vence: {new Date(tarea.vencimiento).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={tarea.estado === 'en_proceso' ? 'default' : 'secondary'}>
                  {tarea.estado.replace('_', ' ')}
                </Badge>
                {hasPermission('gestionar_tareas_propias') && (
                  <Button size="sm">
                    Trabajar
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {hasPermission('gestionar_tareas_propias') && (
            <div className="mt-4 pt-4 border-t">
              <Button size="sm" variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Tarea
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente Calendario del Despachante
const CalendarioDespachante: React.FC = () => {
  const eventos = [
    {
      fecha: '2025-01-28',
      titulo: 'Vencimiento documentación RNPA',
      cliente: 'Alimentos del Sur SA',
      tipo: 'vencimiento'
    },
    {
      fecha: '2025-01-29',
      titulo: 'Reunión con laboratorio',
      cliente: 'TechImport SA',
      tipo: 'reunion'
    },
    {
      fecha: '2025-01-30',
      titulo: 'Entrega carpeta técnica',
      cliente: 'Alimentos del Sur SA',
      tipo: 'entrega'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos Eventos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {eventos.map((evento, idx) => (
            <div key={idx} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{evento.titulo}</p>
                <p className="text-sm text-gray-600">{evento.cliente}</p>
                <p className="text-xs text-gray-500">
                  {new Date(evento.fecha).toLocaleDateString('es-AR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {evento.tipo}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente Actividad Reciente del Despachante
const ActividadRecienteDespachante: React.FC = () => {
  const { usuario } = useAuth();
  
  const actividades = [
    {
      fecha: '2025-01-25 14:30',
      accion: 'Documento revisado',
      detalle: 'Manual técnico aprobado - Router WiFi 6',
      expediente: 'SGT-2025-ENACOM-00087',
      usuario: usuario?.nombre || 'Usuario'
    },
    {
      fecha: '2025-01-25 10:15',
      accion: 'Tarea completada',
      detalle: 'Preparación carpeta RNPA',
      expediente: 'SGT-2025-ANMAT-00123',
      usuario: usuario?.nombre || 'Usuario'
    },
    {
      fecha: '2025-01-24 16:45',
      accion: 'Observación agregada',
      detalle: 'Falta certificado de libre venta',
      expediente: 'SGT-2025-ANMAT-00134',
      usuario: usuario?.nombre || 'Usuario'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mi Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actividades.map((actividad, idx) => (
            <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{actividad.accion}</p>
                <p className="text-sm text-gray-600">{actividad.detalle}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">{actividad.fecha}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{actividad.expediente}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">Por: {actividad.usuario}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};