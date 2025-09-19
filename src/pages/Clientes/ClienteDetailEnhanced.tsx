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
  CreditCard,
  Star,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSGT } from '../../context/SGTContext';
import { DatabaseService } from '../../services/DatabaseService';
import { formatDate, getDaysRemaining } from '@/lib/utils';

export const ClienteDetailEnhanced: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useSGT();
  const { toast } = useToast();
  
  const [cliente, setCliente] = useState<any>(null);
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [habilitaciones, setHabilitaciones] = useState<any[]>([]);
  const [comunicaciones, setComunicaciones] = useState<any[]>([]);
  const [facturas, setFacturas] = useState<any[]>([]);
  const [despachante, setDespachante] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    expedientes: true,
    productos: false,
    habilitaciones: false,
    financiero: false,
    comunicaciones: false,
    despachante: false
  });

  const databaseService = new DatabaseService();

  useEffect(() => {
    if (id) {
      cargarDatosCompletos();
    }
  }, [id]);

  const cargarDatosCompletos = async () => {
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
        credito_disponible: 1000000,
        credito_utilizado: 250000,
        dias_promedio_pago: 18,
        satisfaccion: 4.7,
        fecha_alta: '2023-03-15',
        ultimo_contacto: '2025-01-25',
        contactos: [
          {
            id: 1,
            nombre: clienteEncontrado.contacto_nombre || 'Juan Pérez',
            cargo: 'Gerente de Operaciones',
            email: clienteEncontrado.email,
            telefono: clienteEncontrado.telefono,
            principal: true,
            activo: true
          },
          {
            id: 2,
            nombre: 'María González',
            cargo: 'Responsable Regulatorio',
            email: 'maria.gonzalez@empresa.com',
            telefono: '+54 11 4567-8901',
            principal: false,
            activo: true
          },
          {
            id: 3,
            nombre: 'Carlos Martínez',
            cargo: 'Director Técnico',
            email: 'carlos.martinez@empresa.com',
            telefono: '+54 11 4567-8902',
            principal: false,
            activo: true
          }
        ]
      };
      setCliente(clienteEnriquecido);

      // Cargar expedientes del cliente
      const expedientesCliente = state.expedientes.filter(exp => 
        exp.cliente_id === id || exp.cliente_nombre === clienteEncontrado.razon_social
      );
      setExpedientes(expedientesCliente);

      // Simular productos del cliente
      const productosCliente = [
        {
          id: 'prod-1',
          nombre: 'Yogur Natural 200g',
          marca: 'DelSur',
          rnpa: 'RNPA 04-123456',
          estado: 'vigente',
          vencimiento: '2026-03-15',
          categoria: 'Lácteos',
          peso_neto: '200g',
          vida_util: '30 días',
          codigo_ean: '7791234567890',
          expediente_origen: expedientesCliente[0]?.id,
          imagenes: 4,
          fecha_registro: '2024-03-15'
        },
        {
          id: 'prod-2',
          nombre: 'Yogur Frutilla 200g',
          marca: 'DelSur',
          rnpa: 'RNPA 04-123457',
          estado: 'en_tramite',
          vencimiento: null,
          categoria: 'Lácteos',
          peso_neto: '200g',
          vida_util: '30 días',
          codigo_ean: '7791234567891',
          expediente_origen: expedientesCliente[1]?.id,
          imagenes: 3,
          fecha_registro: '2025-01-20'
        },
        {
          id: 'prod-3',
          nombre: 'Queso Cremoso 300g',
          marca: 'DelSur',
          rnpa: 'RNPA 04-123458',
          estado: 'vigente',
          vencimiento: '2025-12-20',
          categoria: 'Lácteos',
          peso_neto: '300g',
          vida_util: '45 días',
          codigo_ean: '7791234567892',
          expediente_origen: null,
          imagenes: 2,
          fecha_registro: '2023-12-20'
        }
      ];
      setProductos(productosCliente);

      // Simular habilitaciones
      const habilitacionesCliente = [
        {
          id: 'hab-1',
          tipo: 'RNE',
          numero: '04-000123',
          establecimiento: 'Planta Elaboradora Principal',
          direccion: 'Av. Industrial 1234, Quilmes, Buenos Aires',
          vencimiento: '2027-05-15',
          estado: 'vigente',
          actividades: ['Elaboración', 'Fraccionamiento', 'Depósito'],
          superficie: '2500 m²',
          empleados: 45,
          fecha_otorgamiento: '2022-05-15'
        },
        {
          id: 'hab-2',
          tipo: 'Habilitación Municipal',
          numero: 'HM-2024-0456',
          establecimiento: 'Depósito Central',
          direccion: 'Ruta 3 Km 45, Ezeiza, Buenos Aires',
          vencimiento: '2025-12-31',
          estado: 'vigente',
          actividades: ['Almacenamiento', 'Distribución'],
          superficie: '1200 m²',
          empleados: 12,
          fecha_otorgamiento: '2024-01-01'
        },
        {
          id: 'hab-3',
          tipo: 'Certificación HACCP',
          numero: 'HACCP-2024-789',
          establecimiento: 'Planta Elaboradora Principal',
          direccion: 'Av. Industrial 1234, Quilmes, Buenos Aires',
          vencimiento: '2025-08-20',
          estado: 'por_renovar',
          actividades: ['Sistema HACCP'],
          certificadora: 'IRAM',
          fecha_otorgamiento: '2022-08-20'
        }
      ];
      setHabilitaciones(habilitacionesCliente);

      // Simular comunicaciones
      const comunicacionesCliente = [
        {
          id: 'com-1',
          fecha: '2025-01-25 10:30',
          tipo: 'email',
          asunto: 'Documentación pendiente - RNPA Yogur',
          destinatario: clienteEncontrado.email,
          remitente: 'Gestor Principal',
          estado: 'enviado',
          mensaje: 'Estimado cliente, necesitamos que complete la documentación para continuar con el trámite...',
          expediente_relacionado: expedientesCliente[0]?.codigo,
          adjuntos: 2
        },
        {
          id: 'com-2',
          fecha: '2025-01-24 14:20',
          tipo: 'whatsapp',
          asunto: 'Recordatorio vencimiento',
          destinatario: clienteEncontrado.telefono,
          remitente: 'Sistema Automático',
          estado: 'entregado',
          mensaje: 'Le recordamos que su trámite vence en 5 días. Por favor, complete la documentación pendiente.',
          expediente_relacionado: expedientesCliente[0]?.codigo,
          adjuntos: 0
        },
        {
          id: 'com-3',
          fecha: '2025-01-23 09:15',
          tipo: 'nota',
          asunto: 'Observación interna - Prioridad',
          destinatario: 'Interno',
          remitente: 'Despachante Juan',
          estado: 'leido',
          mensaje: 'Cliente solicitó prioridad en el trámite por viaje al exterior programado para marzo.',
          expediente_relacionado: expedientesCliente[0]?.codigo,
          adjuntos: 0
        },
        {
          id: 'com-4',
          fecha: '2025-01-22 16:45',
          tipo: 'llamada',
          asunto: 'Consulta sobre tiempos',
          destinatario: clienteEncontrado.telefono,
          remitente: 'Gestor Principal',
          estado: 'completado',
          mensaje: 'Cliente consultó sobre tiempos de aprobación. Se le explicó el proceso y se acordó seguimiento semanal.',
          expediente_relacionado: null,
          adjuntos: 0,
          duracion: '15 min'
        }
      ];
      setComunicaciones(comunicacionesCliente);

      // Simular información financiera
      const facturasCliente = [
        {
          id: 'fact-1',
          numero: 'FC-A-00001-00000234',
          fecha: '2025-01-20',
          expediente: expedientesCliente[0]?.codigo,
          concepto: 'RNPA Yogur Natural - Honorarios profesionales',
          subtotal: 225000,
          iva: 47250,
          total: 272250,
          estado: 'pagada',
          fecha_pago: '2025-01-25',
          medio_pago: 'Transferencia bancaria',
          dias_pago: 5
        },
        {
          id: 'fact-2',
          numero: 'FC-A-00001-00000235',
          fecha: '2025-01-22',
          expediente: expedientesCliente[1]?.codigo,
          concepto: 'RNPA Cereal Integral - Anticipo 50%',
          subtotal: 112500,
          iva: 23625,
          total: 136125,
          estado: 'pendiente',
          fecha_vencimiento: '2025-02-21',
          dias_vencimiento: 27
        }
      ];
      setFacturas(facturasCliente);

      // Simular despachante asignado
      setDespachante({
        id: 'desp-1',
        nombre: 'Juan Carlos Pérez',
        email: 'juan.perez@sgt.gov.ar',
        telefono: '+54 11 4000-0001',
        matricula: 'MP-1234',
        especialidades: ['ANMAT', 'SENASA', 'Alimentos'],
        clientes_asignados: 8,
        expedientes_activos: 15,
        calificacion: 4.8,
        fecha_asignacion: '2023-03-15'
      });

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
      fecha: new Date().toISOString(),
      tipo,
      asunto: 'Nueva comunicación',
      destinatario: cliente?.email,
      remitente: 'Usuario Actual',
      estado: 'enviado',
      mensaje: 'Mensaje enviado desde el sistema',
      expediente_relacionado: null,
      adjuntos: 0
    };
    
    setComunicaciones([nuevaComunicacion, ...comunicaciones]);
  };

  const calcularEstadisticasFinancieras = () => {
    const totalFacturado = facturas.reduce((acc, f) => acc + f.total, 0);
    const totalPagado = facturas.filter(f => f.estado === 'pagada').reduce((acc, f) => acc + f.total, 0);
    const totalPendiente = facturas.filter(f => f.estado === 'pendiente').reduce((acc, f) => acc + f.total, 0);
    const diasPromedioReal = facturas.filter(f => f.dias_pago).reduce((acc, f) => acc + (f.dias_pago || 0), 0) / facturas.filter(f => f.dias_pago).length || 0;
    
    return {
      totalFacturado,
      totalPagado,
      totalPendiente,
      diasPromedioReal: Math.round(diasPromedioReal)
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

  const estadisticasFinancieras = calcularEstadisticasFinancieras();

  return (
    <div className="space-y-6">
      {/* Header con navegación y acciones rápidas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              to="/clientes"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{cliente.razon_social}</h1>
                <div className="flex items-center space-x-3">
                  <p className="text-gray-600">CUIT: {cliente.cuit}</p>
                  <Badge variant="outline">{cliente.categoria}</Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{cliente.satisfaccion}</span>
                  </div>
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
              Nuevo Trámite
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal - 2 espacios */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Información General del Cliente */}
          <Card>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection('general')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <CardTitle>Información General</CardTitle>
                </div>
                {expandedSections.general ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </CardHeader>
            {expandedSections.general && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Datos principales */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Datos de la Empresa</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span>{cliente.razon_social}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span>CUIT: {cliente.cuit}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{cliente.direccion || 'Av. Corrientes 1234, CABA'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Cliente desde: {formatDate(cliente.fecha_alta)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contactos */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Contactos</h4>
                      <div className="space-y-2">
                        {cliente.contactos?.map((contacto: any) => (
                          <div key={contacto.id} className={`p-3 rounded-lg ${contacto.principal ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-medium">{contacto.nombre}</p>
                                  {contacto.principal && (
                                    <Badge variant="secondary" className="text-xs">Principal</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600">{contacto.cargo}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 gap-1 mt-2">
                              <a href={`mailto:${contacto.email}`} className="text-xs text-blue-600 hover:underline flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {contacto.email}
                              </a>
                              <a href={`tel:${contacto.telefono}`} className="text-xs text-green-600 hover:underline flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {contacto.telefono}
                              </a>
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
          <Card>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection('expedientes')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <CardTitle>Expedientes ({expedientes.length})</CardTitle>
                </div>
                {expandedSections.expedientes ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </CardHeader>
            {expandedSections.expedientes && (
              <CardContent>
                <Tabs defaultValue="activos">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="activos">
                      Activos ({expedientes.filter(e => !['completado', 'cancelado'].includes(e.estado)).length})
                    </TabsTrigger>
                    <TabsTrigger value="completados">
                      Completados ({expedientes.filter(e => e.estado === 'completado').length})
                    </TabsTrigger>
                    <TabsTrigger value="vencidos">
                      Vencidos ({expedientes.filter(e => e.estado === 'vencido').length})
                    </TabsTrigger>
                    <TabsTrigger value="todos">
                      Todos
                    </TabsTrigger>
                  </TabsList>
                  
                  {['activos', 'completados', 'vencidos', 'todos'].map(tab => (
                    <TabsContent key={tab} value={tab}>
                      <div className="space-y-3">
                        {expedientes
                          .filter(exp => {
                            if (tab === 'activos') return !['completado', 'cancelado'].includes(exp.estado);
                            if (tab === 'completados') return exp.estado === 'completado';
                            if (tab === 'vencidos') return exp.estado === 'vencido';
                            return true;
                          })
                          .map((expediente) => {
                            const diasRestantes = getDaysRemaining(expediente.fecha_limite);
                            return (
                              <div key={expediente.id} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <Link 
                                      to={`/expedientes/${expediente.id}`}
                                      className="font-medium text-blue-600 hover:text-blue-800"
                                    >
                                      {expediente.codigo}
                                    </Link>
                                    <p className="text-sm text-gray-600">{expediente.alias}</p>
                                    <p className="text-xs text-gray-500">{expediente.tramite_nombre}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge className={
                                      expediente.estado === 'completado' ? 'bg-green-100 text-green-800' :
                                      expediente.estado === 'en_proceso' ? 'bg-blue-100 text-blue-800' :
                                      expediente.estado === 'vencido' ? 'bg-red-100 text-red-800' :
                                      expediente.estado === 'observado' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }>
                                      {expediente.estado.replace('_', ' ')}
                                    </Badge>
                                    <Button variant="ghost" size="sm">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center space-x-1">
                                    <Building2 className="w-4 h-4" />
                                    <span>{expediente.organismo}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(expediente.fecha_limite)}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span className={diasRestantes < 0 ? 'text-red-600 font-medium' : ''}>
                                      {diasRestantes < 0 ? `Vencido ${Math.abs(diasRestantes)}d` : `${diasRestantes}d restantes`}
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Progreso:</span>
                                    <span className="font-medium">{expediente.progreso}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full transition-all ${
                                        expediente.progreso < 30 ? 'bg-red-500' :
                                        expediente.progreso < 70 ? 'bg-orange-500' : 'bg-green-500'
                                      }`}
                                      style={{ width: `${expediente.progreso}%` }}
                                    />
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

          {/* Productos Registrados */}
          <Card>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection('productos')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  <CardTitle>Productos Registrados ({productos.length})</CardTitle>
                </div>
                {expandedSections.productos ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </CardHeader>
            {expandedSections.productos && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {productos.map((producto) => (
                    <div key={producto.id} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{producto.nombre}</h4>
                          <p className="text-sm text-gray-600">{producto.marca} • {producto.rnpa}</p>
                          <p className="text-xs text-gray-500">{producto.categoria}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge variant={producto.estado === 'vigente' ? 'default' : 'secondary'}>
                            {producto.estado.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-gray-500">{producto.imagenes} fotos</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                        <div>Peso: {producto.peso_neto}</div>
                        <div>Vida útil: {producto.vida_util}</div>
                        <div>EAN: {producto.codigo_ean}</div>
                        <div>Registro: {formatDate(producto.fecha_registro)}</div>
                      </div>

                      {producto.vencimiento && (
                        <div className="text-xs text-gray-500 mb-3">
                          <span className={getDaysRemaining(producto.vencimiento) < 90 ? 'text-orange-600 font-medium' : ''}>
                            Vence: {formatDate(producto.vencimiento)}
                          </span>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Ficha
                        </Button>
                        {producto.expediente_origen && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/expedientes/${producto.expediente_origen}`)}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Expediente
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar nuevo producto
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Habilitaciones y Certificaciones */}
          <Card>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection('habilitaciones')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <CardTitle>Habilitaciones y Certificaciones ({habilitaciones.length})</CardTitle>
                </div>
                {expandedSections.habilitaciones ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </CardHeader>
            {expandedSections.habilitaciones && (
              <CardContent>
                <div className="space-y-4">
                  {habilitaciones.map((hab) => {
                    const diasVencimiento = getDaysRemaining(hab.vencimiento);
                    return (
                      <div key={hab.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              hab.estado === 'vigente' ? 'bg-green-100' : 
                              hab.estado === 'por_renovar' ? 'bg-orange-100' : 'bg-red-100'
                            }`}>
                              <Award className={`w-5 h-5 ${
                                hab.estado === 'vigente' ? 'text-green-600' : 
                                hab.estado === 'por_renovar' ? 'text-orange-600' : 'text-red-600'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{hab.tipo}</p>
                              <p className="text-sm text-gray-600">{hab.numero}</p>
                              <p className="text-xs text-gray-500">{hab.establecimiento}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={
                              hab.estado === 'vigente' ? 'default' : 
                              hab.estado === 'por_renovar' ? 'secondary' : 'destructive'
                            }>
                              {hab.estado.replace('_', ' ')}
                            </Badge>
                            <p className={`text-xs mt-1 ${
                              diasVencimiento < 90 ? 'text-orange-600 font-medium' : 'text-gray-500'
                            }`}>
                              Vence: {formatDate(hab.vencimiento)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Dirección:</span>
                            <span className="ml-2">{hab.direccion}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Actividades autorizadas:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {hab.actividades.map((actividad: string) => (
                                <Badge key={actividad} variant="outline" className="text-xs">
                                  {actividad}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {hab.superficie && (
                            <div>
                              <span className="text-gray-600">Superficie:</span>
                              <span className="ml-2">{hab.superficie}</span>
                            </div>
                          )}
                          {hab.empleados && (
                            <div>
                              <span className="text-gray-600">Empleados:</span>
                              <span className="ml-2">{hab.empleados}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                  <CardTitle>Historial de Comunicaciones ({comunicaciones.length})</CardTitle>
                </div>
                {expandedSections.comunicaciones ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </CardHeader>
            {expandedSections.comunicaciones && (
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {comunicaciones.map((com) => (
                    <div key={com.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        com.tipo === 'email' ? 'bg-blue-100' :
                        com.tipo === 'whatsapp' ? 'bg-green-100' :
                        com.tipo === 'llamada' ? 'bg-purple-100' :
                        'bg-gray-100'
                      }`}>
                        {com.tipo === 'email' ? <Mail className="w-4 h-4 text-blue-600" /> :
                         com.tipo === 'whatsapp' ? <MessageSquare className="w-4 h-4 text-green-600" /> :
                         com.tipo === 'llamada' ? <Phone className="w-4 h-4 text-purple-600" /> :
                         <Info className="w-4 h-4 text-gray-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{com.asunto}</p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{com.mensaje}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {com.estado}
                            </Badge>
                            {com.adjuntos > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {com.adjuntos} adj.
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 mt-2">
                          <span>{new Date(com.fecha).toLocaleString('es-AR')}</span>
                          <span>•</span>
                          <span>De: {com.remitente}</span>
                          {com.expediente_relacionado && (
                            <>
                              <span>•</span>
                              <Link 
                                to={`/expedientes/${expedientes.find(e => e.codigo === com.expediente_relacionado)?.id}`}
                                className="text-blue-600 hover:underline"
                              >
                                {com.expediente_relacionado}
                              </Link>
                            </>
                          )}
                          {com.duracion && (
                            <>
                              <span>•</span>
                              <span>Duración: {com.duracion}</span>
                            </>
                          )}
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

        {/* Columna lateral - 1 espacio */}
        <div className="space-y-6">
          
          {/* Resumen del cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Resumen del Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{expedientes.length}</p>
                    <p className="text-xs text-blue-600">Expedientes</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{productos.length}</p>
                    <p className="text-xs text-green-600">Productos</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{habilitaciones.length}</p>
                    <p className="text-xs text-purple-600">Habilitaciones</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{comunicaciones.length}</p>
                    <p className="text-xs text-orange-600">Comunicaciones</p>
                  </div>
                </div>
                
                <div className="pt-3 border-t space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Cliente desde</span>
                    <span className="font-medium">{formatDate(cliente.fecha_alta)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Último contacto</span>
                    <span className="font-medium">{formatDate(cliente.ultimo_contacto)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Satisfacción</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{cliente.satisfaccion}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estado Crediticio */}
          <Card>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection('financiero')}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Estado Financiero</CardTitle>
                {expandedSections.financiero ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </CardHeader>
            {expandedSections.financiero && (
              <CardContent>
                <div className="space-y-4">
                  {/* Línea de crédito */}
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900 mb-2">Línea de Crédito</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Disponible:</span>
                        <span className="font-medium">${cliente.credito_disponible?.toLocaleString('es-AR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Utilizado:</span>
                        <span className="font-medium">${cliente.credito_utilizado?.toLocaleString('es-AR')}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(cliente.credito_utilizado / cliente.credito_disponible) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resumen financiero */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total facturado:</span>
                      <span className="font-medium">${estadisticasFinancieras.totalFacturado.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pagado:</span>
                      <span className="font-medium text-green-600">${estadisticasFinancieras.totalPagado.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pendiente:</span>
                      <span className="font-medium text-orange-600">${estadisticasFinancieras.totalPendiente.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Días pago promedio:</span>
                      <span className="font-medium">{estadisticasFinancieras.diasPromedioReal} días</span>
                    </div>
                  </div>

                  {/* Últimas facturas */}
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-2">Últimas Facturas</p>
                    <div className="space-y-2">
                      {facturas.slice(0, 3).map((factura) => (
                        <div key={factura.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="text-xs font-medium">{factura.numero}</p>
                            <p className="text-xs text-gray-500">{factura.concepto}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium">${factura.total.toLocaleString('es-AR')}</p>
                            <Badge variant={factura.estado === 'pagada' ? 'default' : 'secondary'} className="text-xs">
                              {factura.estado}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full mt-3">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Ver detalle financiero
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Despachante Asignado */}
          {despachante && (
            <Card>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleSection('despachante')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Despachante Asignado</CardTitle>
                  {expandedSections.despachante ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              </CardHeader>
              {expandedSections.despachante && (
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{despachante.nombre}</p>
                        <p className="text-sm text-gray-600">Matrícula: {despachante.matricula}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a href={`mailto:${despachante.email}`} className="text-blue-600 hover:underline">
                          {despachante.email}
                        </a>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${despachante.telefono}`} className="text-green-600 hover:underline">
                          {despachante.telefono}
                        </a>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {despachante.especialidades.map((esp: string) => (
                          <Badge key={esp} variant="secondary" className="text-xs">
                            {esp}
                          </Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>Clientes: {despachante.clientes_asignados}</div>
                        <div>Activos: {despachante.expedientes_activos}</div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span>{despachante.calificacion}</span>
                        </div>
                        <div>Desde: {formatDate(despachante.fecha_asignacion)}</div>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-3">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Ver perfil completo
                  </Button>
                </CardContent>
              )}
            </Card>
          )}

          {/* Acciones rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Nuevo Trámite
                </Button>
                <Button size="sm" variant="outline">
                  <FileText className="w-4 h-4 mr-1" />
                  Presupuesto
                </Button>
                <Button size="sm" variant="outline">
                  <CreditCard className="w-4 h-4 mr-1" />
                  Facturar
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-1" />
                  Exportar
                </Button>
                <Button size="sm" variant="outline">
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </Button>
                <Button size="sm" variant="outline">
                  <Phone className="w-4 h-4 mr-1" />
                  Llamar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alertas y recordatorios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Alertas y Recordatorios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {habilitaciones.filter(h => getDaysRemaining(h.vencimiento) < 90).map((hab) => (
                  <div key={hab.id} className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="text-xs font-medium text-orange-900">
                          {hab.tipo} por vencer
                        </p>
                        <p className="text-xs text-orange-700">
                          {getDaysRemaining(hab.vencimiento)} días restantes
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {productos.filter(p => p.vencimiento && getDaysRemaining(p.vencimiento) < 90).map((prod) => (
                  <div key={prod.id} className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-yellow-600" />
                      <div>
                        <p className="text-xs font-medium text-yellow-900">
                          {prod.nombre} por vencer
                        </p>
                        <p className="text-xs text-yellow-700">
                          RNPA vence en {getDaysRemaining(prod.vencimiento)} días
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {expedientes.filter(e => getDaysRemaining(e.fecha_limite) < 7 && !['completado', 'cancelado'].includes(e.estado)).map((exp) => (
                  <div key={exp.id} className="p-2 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-red-600" />
                      <div>
                        <p className="text-xs font-medium text-red-900">
                          Expediente próximo a vencer
                        </p>
                        <p className="text-xs text-red-700">
                          {exp.codigo} - {getDaysRemaining(exp.fecha_limite)} días
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actividad reciente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {comunicaciones.slice(0, 5).map((com) => (
                  <div key={com.id} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900">{com.asunto}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(com.fecha).toLocaleDateString('es-AR')} • {com.tipo}
                      </p>
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