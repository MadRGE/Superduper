import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, User, Mail, Phone, MapPin, CreditCard as Edit, Plus, Eye, FileText, Calendar, DollarSign, Activity, Briefcase, Package, Shield, MessageSquare, Download, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { databaseService } from '@/services/DatabaseService';
import { ClientFormModal } from '@/components/Clientes/ClientFormModal';
import { CasoLegalFormModal } from '@/components/CasosLegales/CasoLegalFormModal';
import { formatDate } from '@/lib/utils';

export const ClienteDetailEnhanced: React.FC = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { hasPermission, canViewCliente } = usePermissions();
  
  const [cliente, setCliente] = useState<any>(null);
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [habilitaciones, setHabilitaciones] = useState<any[]>([]);
  const [comunicaciones, setComunicaciones] = useState<any[]>([]);
  const [casosLegales, setCasosLegales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCasoLegalModal, setShowCasoLegalModal] = useState(false);

  useEffect(() => {
    if (id) {
      cargarDatosCompletos();
    }
  }, [id]);

  // Verificar permisos de acceso al cliente
  if (id && !canViewCliente(id)) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
        <p className="text-gray-600">No tiene permisos para ver este cliente</p>
        <Link to="/clientes" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Volver a clientes
        </Link>
      </div>
    );
  }

  const cargarDatosCompletos = async () => {
    try {
      setLoading(true);
      
      // Cargar cliente
      const clienteData = await databaseService.getClienteCompleto(id!);
      if (!clienteData) {
        toast({
          title: "Cliente no encontrado",
          description: "El cliente solicitado no existe",
          variant: "destructive"
        });
        return;
      }
      setCliente(clienteData);

      // Cargar expedientes del cliente
      const expedientesData = await databaseService.getExpedientes();
      const expedientesCliente = expedientesData.filter((exp: any) => exp.cliente_id === id);
      setExpedientes(expedientesCliente);

      // Cargar productos
      const productosData = await databaseService.getProductosByCliente(id!);
      setProductos(productosData);

      // Cargar habilitaciones
      const habilitacionesData = await databaseService.getHabilitacionesByCliente(id!);
      setHabilitaciones(habilitacionesData);

      // Cargar comunicaciones
      const comunicacionesData = await databaseService.getComunicacionesByCliente(id!);
      setComunicaciones(comunicacionesData);

      // Cargar casos legales
      const casosData = await databaseService.getCasosLegalesByCliente(id!);
      setCasosLegales(casosData);

    } catch (error) {
      console.error('Error cargando datos del cliente:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del cliente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!cliente) return;
    
    if (!confirm(`¿Está seguro de que desea desactivar el cliente "${cliente.razon_social}"?`)) {
      return;
    }

    try {
      await databaseService.updateCliente(cliente.id, { is_active: false });
      toast({
        title: "Cliente desactivado",
        description: `${cliente.razon_social} ha sido desactivado`,
      });
      // Redirigir a la lista de clientes
      window.location.href = '/clientes';
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo desactivar el cliente",
        variant: "destructive"
      });
    }
  };

  const handleModalSuccess = () => {
    cargarDatosCompletos();
  };

  const handleCreateCasoLegal = () => {
    setShowCasoLegalModal(true);
  };

  const handleCasoLegalSuccess = () => {
    cargarDatosCompletos();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del cliente...</p>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Cliente no encontrado</h2>
        <Link to="/clientes" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
          Volver a clientes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link 
          to="/clientes"
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{cliente.razon_social}</h1>
          <p className="text-gray-600">CUIT: {cliente.cuit}</p>
        </div>
        <div className="flex items-center space-x-2">
          {hasPermission('editar_clientes') && (
            <Button 
              variant="outline"
              onClick={() => setShowEditModal(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Cliente
            </Button>
          )}
          {hasPermission('*') && (
            <Button 
              variant="outline"
              onClick={handleDeleteClient}
              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Desactivar
            </Button>
          )}
        </div>
      </div>

      {/* Información General del Cliente */}
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-gray-600" />
                Datos de la Empresa
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Razón Social:</span>
                  <span className="ml-2 font-medium">{cliente.razon_social}</span>
                </div>
                <div>
                  <span className="text-gray-500">CUIT:</span>
                  <span className="ml-2 font-medium">{cliente.cuit}</span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2 font-medium">{cliente.email}</span>
                </div>
                {cliente.telefono && (
                  <div>
                    <span className="text-gray-500">Teléfono:</span>
                    <span className="ml-2 font-medium">{cliente.telefono}</span>
                  </div>
                )}
                {cliente.direccion && (
                  <div>
                    <span className="text-gray-500">Dirección:</span>
                    <span className="ml-2 font-medium">{cliente.direccion}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                Contacto Principal
              </h3>
              <div className="space-y-2 text-sm">
                {cliente.contacto_nombre && (
                  <div>
                    <span className="text-gray-500">Nombre:</span>
                    <span className="ml-2 font-medium">{cliente.contacto_nombre}</span>
                  </div>
                )}
                {cliente.contacto_email && (
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2 font-medium">{cliente.contacto_email}</span>
                  </div>
                )}
                {cliente.contacto_telefono && (
                  <div>
                    <span className="text-gray-500">Teléfono:</span>
                    <span className="ml-2 font-medium">{cliente.contacto_telefono}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-gray-600" />
                Estadísticas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{expedientes.length}</p>
                  <p className="text-xs text-gray-600">Expedientes</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{productos.length}</p>
                  <p className="text-xs text-gray-600">Productos</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{casosLegales.length}</p>
                  <p className="text-xs text-gray-600">Casos Legales</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{habilitaciones.length}</p>
                  <p className="text-xs text-gray-600">Habilitaciones</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Información Detallada */}
      <Tabs defaultValue="expedientes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="expedientes">
            Expedientes ({expedientes.length})
          </TabsTrigger>
          <TabsTrigger value="casos-legales">
            Casos Legales ({casosLegales.length})
          </TabsTrigger>
          <TabsTrigger value="productos">
            Productos ({productos.length})
          </TabsTrigger>
          <TabsTrigger value="habilitaciones">
            Habilitaciones ({habilitaciones.length})
          </TabsTrigger>
          <TabsTrigger value="comunicaciones">
            Comunicaciones ({comunicaciones.length})
          </TabsTrigger>
          {hasPermission('gestionar_facturacion') && (
            <TabsTrigger value="financiero">
              Financiero
            </TabsTrigger>
          )}
        </TabsList>

        {/* Tab Expedientes */}
        <TabsContent value="expedientes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Expedientes del Cliente</CardTitle>
                {hasPermission('crear_expedientes') && (
                  <Link to="/expedientes/nuevo">
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Expediente
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ExpedientesCliente expedientes={expedientes} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Casos Legales */}
        <TabsContent value="casos-legales">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Casos Legales</CardTitle>
                {hasPermission('crear_casos_legales') && (
                  <Button size="sm" onClick={handleCreateCasoLegal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Caso Legal
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CasosLegalesCliente casosLegales={casosLegales} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Productos */}
        <TabsContent value="productos">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Productos Registrados</CardTitle>
                {hasPermission('*') && (
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Producto
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ProductosCliente productos={productos} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Habilitaciones */}
        <TabsContent value="habilitaciones">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Habilitaciones y Certificaciones</CardTitle>
                {hasPermission('*') && (
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Habilitación
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <HabilitacionesCliente habilitaciones={habilitaciones} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Comunicaciones */}
        <TabsContent value="comunicaciones">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Historial de Comunicaciones</CardTitle>
                {hasPermission('*') && (
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Comunicación
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ComunicacionesCliente comunicaciones={comunicaciones} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Financiero (Solo para roles autorizados) */}
        {hasPermission('gestionar_facturacion') && (
          <TabsContent value="financiero">
            <Card>
              <CardHeader>
                <CardTitle>Información Financiera</CardTitle>
              </CardHeader>
              <CardContent>
                <FinancieroCliente clienteId={id!} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Modal de Edición de Cliente */}
      <ClientFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        cliente={cliente}
        onSuccess={handleModalSuccess}
      />

      {/* Modal de Caso Legal */}
      <CasoLegalFormModal
        isOpen={showCasoLegalModal}
        onClose={() => setShowCasoLegalModal(false)}
        clienteId={cliente?.id}
        onSuccess={handleCasoLegalSuccess}
      />
    </div>
  );
};

// Componente Expedientes del Cliente
const ExpedientesCliente: React.FC<{expedientes: any[]}> = ({ expedientes }) => {
  if (expedientes.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">No hay expedientes registrados</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expedientes.map((expediente) => (
        <div key={expediente.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-300">
          <div>
            <Link 
              to={`/expedientes/${expediente.id}`}
              className="font-medium text-blue-600 hover:text-blue-800"
            >
              {expediente.codigo}
            </Link>
            <p className="text-sm text-gray-600">{expediente.alias}</p>
            <p className="text-xs text-gray-500">
              {expediente.tramite_tipo?.nombre || expediente.tramite_nombre}
            </p>
          </div>
          <div className="text-right">
            <Badge className={
              expediente.estado === 'completado' ? 'bg-green-100 text-green-800' :
              expediente.estado === 'en_proceso' ? 'bg-blue-100 text-blue-800' :
              expediente.estado === 'observado' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }>
              {expediente.estado.replace('_', ' ')}
            </Badge>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(expediente.fecha_limite)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente Casos Legales del Cliente
const CasosLegalesCliente: React.FC<{casosLegales: any[]}> = ({ casosLegales }) => {
  if (casosLegales.length === 0) {
    return (
      <div className="text-center py-8">
        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">No hay casos legales registrados</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {casosLegales.map((caso) => (
        <div key={caso.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-300">
          <div className="flex items-center space-x-3">
            <Briefcase className="w-5 h-5 text-gray-400" />
            <div>
              <Link 
                to={`/casos-legales/${caso.id}`}
                className="font-medium text-blue-600 hover:text-blue-800"
              >
                {caso.nombre_caso}
              </Link>
              <p className="text-sm text-gray-600">{caso.descripcion}</p>
              <p className="text-xs text-gray-500">
                Apertura: {formatDate(caso.fecha_apertura)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge className={
              caso.estado_legal === 'abierto' ? 'bg-green-100 text-green-800' :
              caso.estado_legal === 'en_litigio' ? 'bg-red-100 text-red-800' :
              caso.estado_legal === 'cerrado' ? 'bg-gray-100 text-gray-800' :
              'bg-blue-100 text-blue-800'
            }>
              {caso.estado_legal.replace('_', ' ')}
            </Badge>
            {caso.fecha_cierre && (
              <p className="text-xs text-gray-500 mt-1">
                Cierre: {formatDate(caso.fecha_cierre)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente Productos del Cliente
const ProductosCliente: React.FC<{productos: any[]}> = ({ productos }) => {
  if (productos.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">No hay productos registrados</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {productos.map((producto) => (
        <div key={producto.id} className="p-4 border rounded-lg hover:border-blue-300">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-medium text-gray-900">{producto.nombre}</h4>
              <p className="text-sm text-gray-600">{producto.marca}</p>
              {producto.rnpa && (
                <p className="text-xs text-gray-500">{producto.rnpa}</p>
              )}
            </div>
            <Badge variant={producto.estado === 'vigente' ? 'default' : 'destructive'}>
              {producto.estado}
            </Badge>
          </div>
          
          <div className="space-y-1 text-xs text-gray-600">
            <div>Categoría: {producto.categoria}</div>
            {producto.peso_neto && <div>Peso: {producto.peso_neto}</div>}
            {producto.vencimiento && (
              <div>Vence: {formatDate(producto.vencimiento)}</div>
            )}
          </div>
          
          <div className="flex space-x-2 mt-3">
            <Button size="sm" variant="outline">
              <Eye className="w-4 h-4 mr-1" />
              Ver Ficha
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente Habilitaciones del Cliente
const HabilitacionesCliente: React.FC<{habilitaciones: any[]}> = ({ habilitaciones }) => {
  if (habilitaciones.length === 0) {
    return (
      <div className="text-center py-8">
        <Shield className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">No hay habilitaciones registradas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {habilitaciones.map((habilitacion) => (
        <div key={habilitacion.id} className="p-4 border rounded-lg hover:border-blue-300">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-medium text-gray-900">{habilitacion.tipo}</h4>
              <p className="text-sm text-gray-600">{habilitacion.numero}</p>
              {habilitacion.establecimiento && (
                <p className="text-sm text-gray-500">{habilitacion.establecimiento}</p>
              )}
            </div>
            <Badge variant={habilitacion.estado === 'vigente' ? 'default' : 'destructive'}>
              {habilitacion.estado}
            </Badge>
          </div>
          
          <div className="text-xs text-gray-600 space-y-1">
            {habilitacion.direccion && (
              <div>Dirección: {habilitacion.direccion}</div>
            )}
            <div>Vencimiento: {formatDate(habilitacion.vencimiento)}</div>
            {habilitacion.actividades && (
              <div className="flex flex-wrap gap-1 mt-2">
                {habilitacion.actividades.map((actividad: string) => (
                  <Badge key={actividad} variant="secondary" className="text-xs">
                    {actividad}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente Comunicaciones del Cliente
const ComunicacionesCliente: React.FC<{comunicaciones: any[]}> = ({ comunicaciones }) => {
  if (comunicaciones.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">No hay comunicaciones registradas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comunicaciones.map((comunicacion) => (
        <div key={comunicacion.id} className="p-4 border rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-medium text-gray-900">{comunicacion.asunto}</h4>
              <p className="text-sm text-gray-600">{comunicacion.mensaje}</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {comunicacion.tipo}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Para: {comunicacion.destinatario}</span>
            <span>{formatDate(comunicacion.created_at || comunicacion.fecha)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente Financiero del Cliente
const FinancieroCliente: React.FC<{clienteId: string}> = ({ clienteId }) => {
  const facturas = [
    {
      numero: 'FC-A-00001-00000234',
      fecha: '2025-01-20',
      concepto: 'RNPA Yogur Natural',
      total: 544500,
      estado: 'pagada'
    },
    {
      numero: 'FC-A-00001-00000235',
      fecha: '2025-01-18',
      concepto: 'Homologación ENACOM',
      total: 332750,
      estado: 'pendiente'
    }
  ];

  const totalFacturado = facturas.reduce((sum, f) => sum + f.total, 0);
  const totalCobrado = facturas.filter(f => f.estado === 'pagada').reduce((sum, f) => sum + f.total, 0);

  return (
    <div className="space-y-6">
      {/* Resumen Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-600">
            ${(totalFacturado / 1000000).toFixed(1)}M
          </p>
          <p className="text-sm text-gray-600">Total Facturado</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-600">
            ${(totalCobrado / 1000000).toFixed(1)}M
          </p>
          <p className="text-sm text-gray-600">Total Cobrado</p>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg text-center">
          <p className="text-2xl font-bold text-orange-600">
            ${((totalFacturado - totalCobrado) / 1000).toFixed(0)}K
          </p>
          <p className="text-sm text-gray-600">Pendiente de Cobro</p>
        </div>
      </div>

      {/* Lista de Facturas */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-900">Facturas Recientes</h4>
        {facturas.map((factura) => (
          <div key={factura.numero} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{factura.numero}</p>
              <p className="text-sm text-gray-600">{factura.concepto}</p>
              <p className="text-xs text-gray-500">{formatDate(factura.fecha)}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">${factura.total.toLocaleString('es-AR')}</p>
              <Badge variant={factura.estado === 'pagada' ? 'default' : 'secondary'}>
                {factura.estado}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};