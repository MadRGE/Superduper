import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Building2, 
  User, 
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  Upload,
  MessageSquare,
  Edit,
  Save,
  X,
  Plus,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  TrendingUp,
  Package,
  Shield,
  Activity,
  Users,
  Briefcase,
  History,
  Info,
  ChevronRight,
  ChevronDown,
  Eye,
  Send,
  Paperclip,
  Award,
  Star,
  CreditCard,
  FileSpreadsheet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSGT } from '../../context/SGTContext';
import { expedienteService, ExpedienteService } from '../../services/ExpedienteService';
import { ClienteExpedientesDashboard } from './ClienteDashboardExcel';
import { formatDate, getDaysRemaining } from '@/lib/utils';

// Componente Productos Registrados con Fichas
const ProductosRegistrados: React.FC<{
  clienteId: string;
  productos: any[];
  onShowFicha: (producto: any) => void;
}> = ({ clienteId, productos, onShowFicha }) => {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {productos.map((producto) => (
        <div key={producto.id} className="p-4 border rounded-lg hover:border-blue-300 transition-colors">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-medium text-gray-900">{producto.nombre}</h4>
              <p className="text-sm text-gray-600">{producto.marca} • {producto.rnpa}</p>
              <p className="text-xs text-gray-500">{producto.categoria}</p>
            </div>
            <Badge variant={
              producto.estado === 'vigente' ? 'default' :
              producto.estado === 'por_renovar' ? 'destructive' :
              'secondary'
            }>
              {producto.estado.replace('_', ' ')}
            </Badge>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>Peso: {producto.peso_neto}</div>
              <div>Vida útil: {producto.vida_util}</div>
              <div>EAN: {producto.codigo_ean}</div>
              {producto.vencimiento && (
                <div className={
                  new Date(producto.vencimiento) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) 
                    ? 'text-orange-600 font-medium' : ''
                }>
                  Vence: {formatDate(producto.vencimiento)}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2 mt-3">
            <Button size="sm" variant="outline" onClick={() => onShowFicha(producto)}>
              <Eye className="w-4 h-4 mr-1" />
              Ver Ficha
            </Button>
            {producto.estado === 'por_renovar' && (
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Renovar
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export const ClienteDetailEnhanced: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useSGT();
  const { toast } = useToast();
  
  const [cliente, setCliente] = useState<any>(null);
  const [expedientesCliente, setExpedientesCliente] = useState<any[]>([]);
  const [productosCliente, setProductosCliente] = useState<any[]>([]);
  const [habilitacionesCliente, setHabilitacionesCliente] = useState<any[]>([]);
  const [comunicacionesCliente, setComunicacionesCliente] = useState<any[]>([]);
  const [facturasCliente, setFacturasCliente] = useState<any[]>([]);
  const [despachanteAsignado, setDespachanteAsignado] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    expedientes: true,
    dashboard: false,
    productos: false,
    habilitaciones: false,
    comunicaciones: false,
    financiero: false
  });

  const onShowFichaProducto = (producto: any) => {
    toast({
      title: "Ficha de producto",
      description: `Mostrando ficha de ${producto.nombre}`,
    });
  };

  const cargarDatosCompletos = React.useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Buscar cliente por ID
      const clienteEncontrado = state.clientes.find(c => c.id === id);
      if (!clienteEncontrado) {
        toast({
          title: "Cliente no encontrado",
          description: "El cliente solicitado no existe",
          variant: "destructive"
        });
        navigate('/clientes');
        return;
      }


      // Enriquecer datos del cliente con información adicional
      const clienteEnriquecido = {
        ...clienteEncontrado,
        categoria: 'Premium',
        satisfaccion: 4.5,
        credito_disponible: 500000,
        credito_utilizado: 125000,
        dias_promedio_pago: 15,
        direccion: 'Av. Corrientes 1234, CABA',
        contactos: [
          {
            id: 1,
            nombre: clienteEncontrado.contacto_nombre || 'Juan Pérez',
            cargo: 'Gerente de Operaciones',
            email: clienteEncontrado.email,
            telefono: clienteEncontrado.telefono,
            principal: true
          },
          {
            id: 2,
            nombre: 'María González',
            cargo: 'Responsable Regulatorio',
            email: 'maria.gonzalez@empresa.com',
            telefono: '+54 11 4567-8901',
            principal: false
          },
          {
            id: 3,
            nombre: 'Carlos Martínez',
            cargo: 'Director Técnico',
            email: 'carlos.martinez@empresa.com',
            telefono: '+54 11 4567-8902',
            principal: false
          }
        ]
      };
      setCliente(clienteEnriquecido);

      // Cargar expedientes del cliente usando el servicio
      const expedientes = expedienteService.getExpedientesByCliente(id);
      setExpedientesCliente(expedientes);

      // Cargar productos usando el servicio
      const productos = expedienteService.getProductosByCliente(id);
      setProductosCliente(productos);

      // Cargar habilitaciones usando el servicio
      const habilitaciones = expedienteService.getHabilitacionesByCliente(id);
      setHabilitacionesCliente(habilitaciones);

      // Cargar comunicaciones usando el servicio
      const comunicaciones = expedienteService.getComunicacionesByCliente(id);
      setComunicacionesCliente(comunicaciones);

      // Cargar facturas usando el servicio
      const facturas = expedienteService.getFacturasByCliente(id);
      setFacturasCliente(facturas);

      // Simular despachante asignado
      const despachante = {
        id: 'desp-1',
        nombre: 'Juan Carlos Pérez',
        email: 'juan.perez@sgt.gov.ar',
        telefono: '+54 11 4000-0001',
        especialidades: ['ANMAT', 'SENASA', 'Alimentos'],
        calificacion: 4.8,
        clientes_asignados: 12,
        expedientes_completados: 156
      };
      setDespachanteAsignado(despachante);

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
  }, [id, toast, navigate]);

  useEffect(() => {
    cargarDatosCompletos();
  }, [cargarDatosCompletos]);
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const enviarComunicacion = (tipo: string) => {
    toast({
      title: "Comunicación enviada",
      description: `Se envió ${tipo} al cliente`,
    });
    
    const nuevaComunicacion = {
      id: `com-${Date.now()}`,
      fecha: new Date().toLocaleString('es-AR'),
      tipo,
      asunto: `Nueva comunicación por ${tipo}`,
      destinatario: tipo === 'email' ? cliente?.email : cliente?.telefono,
      estado: 'enviado',
      mensaje: `Mensaje enviado desde el sistema por ${tipo}`,
      expediente_relacionado: null
    };
    
    setComunicacionesCliente([nuevaComunicacion, ...comunicacionesCliente]);
  };

  const calcularEstadisticas = () => {
    const expedientesActivos = expedientesCliente.filter(e => !['completado', 'cancelado'].includes(e.estado)).length;
    const expedientesCompletados = expedientesCliente.filter(e => e.estado === 'completado').length;
    const expedientesVencidos = expedientesCliente.filter(e => e.estado === 'vencido').length;
    const productosVigentes = productosCliente.filter(p => p.estado === 'vigente').length;
    const habilitacionesVigentes = habilitacionesCliente.filter(h => h.estado === 'vigente').length;
    const facturasPendientes = facturasCliente.filter(f => f.estado === 'pendiente').length;
    
    return {
      expedientesActivos,
      expedientesCompletados,
      expedientesVencidos,
      productosVigentes,
      habilitacionesVigentes,
      facturasPendientes
    };
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

  const stats = calcularEstadisticas();

  return (
    <div className="space-y-6">
      {/* Header Principal del Cliente */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              to="/clientes"
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{cliente.razon_social}</h1>
              <p className="text-gray-600 dark:text-gray-300">CUIT: {cliente.cuit}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="outline" className="text-xs">
                  Categoría: {cliente.categoria}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{cliente.satisfaccion}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => enviarComunicacion('email')}>
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button variant="outline" size="sm" onClick={() => enviarComunicacion('whatsapp')}>
              <MessageSquare className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={() => enviarComunicacion('llamada')}>
              <Phone className="w-4 h-4 mr-2" />
              Llamar
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Expediente
            </Button>
          </div>
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.expedientesActivos}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Expedientes Activos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.expedientesCompletados}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Completados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.expedientesVencidos}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Vencidos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.productosVigentes}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Productos Vigentes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.habilitacionesVigentes}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Habilitaciones</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.facturasPendientes}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Facturas Pendientes</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal - 2 espacios */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Información General y Contactos */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection('general')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <CardTitle className="dark:text-gray-100">Información General y Contactos</CardTitle>
                </div>
                {expandedSections.general ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </CardHeader>
            {expandedSections.general && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Datos de la empresa */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Datos de la Empresa</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Building2 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Razón Social</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{cliente.razon_social}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">CUIT</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{cliente.cuit}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Dirección</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{cliente.direccion}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Shield className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Estado</p>
                            <Badge variant="default">Activo</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contactos */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Contactos Clave</h4>
                      <div className="space-y-3">
                        {cliente.contactos?.map((contacto: any) => (
                          <div key={contacto.id} className={`p-3 rounded-lg border ${
                            contacto.principal ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                          }`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contacto.nombre}</p>
                                  {contacto.principal && (
                                    <Badge variant="secondary" className="text-xs">Principal</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{contacto.cargo}</p>
                              </div>
                            </div>
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center space-x-2">
                                <Mail className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                                <a href={`mailto:${contacto.email}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                  {contacto.email}
                                </a>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Phone className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                                <a href={`tel:${contacto.telefono}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                  {contacto.telefono}
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Expedientes del Cliente */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection('expedientes')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <CardTitle className="dark:text-gray-100">Expedientes del Cliente ({expedientesCliente.length})</CardTitle>
                </div>
                {expandedSections.expedientes ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </CardHeader>
            {expandedSections.expedientes && (
              <CardContent>
                <Tabs defaultValue="activos">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="activos">
                      Activos ({stats.expedientesActivos})
                    </TabsTrigger>
                    <TabsTrigger value="completados">
                      Completados ({stats.expedientesCompletados})
                    </TabsTrigger>
                    <TabsTrigger value="vencidos">
                      Vencidos ({stats.expedientesVencidos})
                    </TabsTrigger>
                    <TabsTrigger value="todos">
                      Todos ({expedientesCliente.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  {['activos', 'completados', 'vencidos', 'todos'].map(tab => (
                    <TabsContent key={tab} value={tab}>
                      <div className="space-y-3">
                        {expedientesCliente
                          .filter(exp => {
                            if (tab === 'todos') return true;
                            if (tab === 'activos') return !['completado', 'cancelado', 'vencido'].includes(exp.estado);
                            if (tab === 'completados') return exp.estado === 'completado';
                            if (tab === 'vencidos') return exp.estado === 'vencido';
                            return true;
                          })
                          .map((expediente) => {
                            const diasRestantes = getDaysRemaining(expediente.fecha_limite);
                            const progreso = expediente.progreso || Math.round((expediente.paso_actual / 8) * 100);
                            
                            return (
                              <div key={expediente.id} className="p-4 border dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-start space-x-3">
                                    <div className={`w-3 h-3 rounded-full mt-2 ${
                                      diasRestantes < 0 ? 'bg-red-500' :
                                      diasRestantes <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`} />
                                    <div>
                                      <Link 
                                        to={`/expedientes/${expediente.id}`}
                                        className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                      >
                                        {expediente.codigo}
                                      </Link>
                                      <p className="text-sm text-gray-600 dark:text-gray-300">{expediente.alias}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">{expediente.tramite_nombre}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge className={
                                      expediente.estado === 'completado' ? 'bg-green-100 text-green-800' :
                                      expediente.estado === 'en_proceso' ? 'bg-blue-100 text-blue-800' :
                                      expediente.estado === 'vencido' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }>
                                      {expediente.estado.replace('_', ' ')}
                                    </Badge>
                                    <Button variant="ghost" size="sm">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Progreso:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{progreso}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full transition-all ${
                                        progreso < 30 ? 'bg-red-500' :
                                        progreso < 70 ? 'bg-orange-500' : 'bg-green-500'
                                      }`}
                                      style={{ width: `${progreso}%` }}
                                    />
                                  </div>
                                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                    <span className="dark:text-gray-300">Límite: {formatDate(expediente.fecha_limite)}</span>
                                    <span className={diasRestantes < 0 ? 'text-red-600 dark:text-red-400 font-medium' : 'dark:text-gray-300'}>
                                      {diasRestantes < 0 ? `Vencido ${Math.abs(diasRestantes)}d` : `${diasRestantes}d restantes`}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            )}
          </Card>

          {/* Dashboard de Expedientes Integrado */}
          <Card>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection('dashboard')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5 text-gray-400" />
                  <CardTitle>Dashboard Detallado de Expedientes</CardTitle>
                </div>
                {expandedSections.dashboard ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </CardHeader>
            {expandedSections.dashboard && (
              <CardContent>
                <ClienteExpedientesDashboard 
                  clienteId={cliente.id}
                  clienteData={cliente}
                />
              </CardContent>
            )}
          </Card>

          {/* Productos Registrados */}
          <Card>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection('productos')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  <CardTitle>Productos Registrados ({productosCliente.length})</CardTitle>
                </div>
                {expandedSections.productos ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </CardHeader>
            {expandedSections.productos && (
              <CardContent>
                <ProductosRegistrados 
                  clienteId={cliente.id}
                  productos={productosCliente}
                  onShowFicha={onShowFichaProducto}
                />
              </CardContent>
            )}
          </Card>

          {/* Habilitaciones */}
          <Card>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection('habilitaciones')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-gray-400" />
                  <CardTitle>Habilitaciones y Certificaciones ({habilitacionesCliente.length})</CardTitle>
                </div>
                {expandedSections.habilitaciones ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </CardHeader>
            {expandedSections.habilitaciones && (
              <CardContent>
                <div className="space-y-4">
                  {habilitacionesCliente.map((habilitacion) => (
                    <div key={habilitacion.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            habilitacion.estado === 'vigente' ? 'bg-green-100' : 'bg-orange-100'
                          }`}>
                            <Award className={`w-5 h-5 ${
                              habilitacion.estado === 'vigente' ? 'text-green-600' : 'text-orange-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{habilitacion.tipo}</p>
                            <p className="text-sm text-gray-600">{habilitacion.numero}</p>
                            <p className="text-xs text-gray-500">{habilitacion.establecimiento}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={habilitacion.estado === 'vigente' ? 'default' : 'destructive'}>
                            {habilitacion.estado.replace('_', ' ')}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            Vence: {formatDate(habilitacion.vencimiento)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-600">{habilitacion.direccion}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Actividades autorizadas:</p>
                          <div className="flex flex-wrap gap-1">
                            {habilitacion.actividades.map((actividad: string) => (
                              <Badge key={actividad} variant="secondary" className="text-xs">
                                {actividad}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Comunicaciones */}
          <Card>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection('comunicaciones')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <CardTitle>Historial de Comunicaciones ({comunicacionesCliente.length})</CardTitle>
                </div>
                {expandedSections.comunicaciones ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </CardHeader>
            {expandedSections.comunicaciones && (
              <CardContent>
                <div className="space-y-3">
                  {comunicacionesCliente.map((comunicacion) => (
                    <div key={comunicacion.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        comunicacion.tipo === 'email' ? 'bg-blue-100' :
                        comunicacion.tipo === 'whatsapp' ? 'bg-green-100' :
                        comunicacion.tipo === 'llamada' ? 'bg-purple-100' :
                        'bg-gray-100'
                      }`}>
                        {comunicacion.tipo === 'email' ? <Mail className="w-4 h-4 text-blue-600" /> :
                         comunicacion.tipo === 'whatsapp' ? <MessageSquare className="w-4 h-4 text-green-600" /> :
                         comunicacion.tipo === 'llamada' ? <Phone className="w-4 h-4 text-purple-600" /> :
                         <Info className="w-4 h-4 text-gray-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{comunicacion.asunto}</p>
                            <p className="text-xs text-gray-600 mt-1">{comunicacion.mensaje}</p>
                            {comunicacion.expediente_relacionado && (
                              <p className="text-xs text-blue-600 mt-1">
                                Relacionado: {comunicacion.expediente_relacionado}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {comunicacion.estado}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 mt-2">
                          <span>{comunicacion.fecha}</span>
                          <span>•</span>
                          <span>Para: {comunicacion.destinatario}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-3" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva comunicación
                </Button>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Sidebar - Columna Derecha */}
        <div className="space-y-6">
          
          {/* Resumen Financiero */}
          <Card>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection('financiero')}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Información Financiera</CardTitle>
                {expandedSections.financiero ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </CardHeader>
            {expandedSections.financiero && (
              <CardContent>
                <div className="space-y-4">
                  {/* Estado crediticio */}
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900 mb-2">Estado Crediticio</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Línea de crédito:</span>
                        <span className="font-medium">${cliente.credito_disponible?.toLocaleString('es-AR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Utilizado:</span>
                        <span className="font-medium">${cliente.credito_utilizado?.toLocaleString('es-AR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Disponible:</span>
                        <span className="font-medium text-green-600">
                          ${(cliente.credito_disponible - cliente.credito_utilizado)?.toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Días pago promedio:</span>
                        <span className="font-medium">{cliente.dias_promedio_pago} días</span>
                      </div>
                    </div>
                  </div>

                  {/* Resumen de facturación */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Facturación</p>
                    <div className="space-y-2">
                      {facturasCliente.map((factura) => (
                        <div key={factura.id} className="p-2 bg-gray-50 rounded text-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{factura.numero}</span>
                            <Badge variant={
                              factura.estado === 'pagada' ? 'default' :
                              factura.estado === 'pendiente' ? 'secondary' :
                              'destructive'
                            } className="text-xs">
                              {factura.estado}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>{formatDate(factura.fecha)}</span>
                            <span className="font-medium">${factura.total.toLocaleString('es-AR')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button size="sm" variant="outline" className="w-full mt-2">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Ver todas las facturas
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Despachante Asignado */}
          {despachanteAsignado && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Despachante Asignado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{despachanteAsignado.nombre}</p>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-gray-600">{despachanteAsignado.calificacion}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${despachanteAsignado.email}`} className="text-blue-600 hover:underline">
                        {despachanteAsignado.email}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${despachanteAsignado.telefono}`} className="text-blue-600 hover:underline">
                        {despachanteAsignado.telefono}
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Especialidades:</p>
                    <div className="flex flex-wrap gap-1">
                      {despachanteAsignado.especialidades.map((esp: string) => (
                        <Badge key={esp} variant="secondary" className="text-xs">
                          {esp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-2 border-t">
                    <div>
                      <span className="text-gray-500">Clientes:</span>
                      <span className="ml-1 font-medium">{despachanteAsignado.clientes_asignados}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Completados:</span>
                      <span className="ml-1 font-medium">{despachanteAsignado.expedientes_completados}</span>
                    </div>
                  </div>
                  
                  <Button size="sm" variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver perfil completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Expediente
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Generar Presupuesto
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Documento
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Programar Reunión
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Datos
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <History className="w-4 h-4 mr-2" />
                  Ver Historial Completo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actividad Reciente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {comunicacionesCliente.slice(0, 5).map((actividad) => (
                  <div key={actividad.id} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{actividad.asunto}</p>
                      <p className="text-xs text-gray-500">{actividad.fecha}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};