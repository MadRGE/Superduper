import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  Building2, 
  Package,
  Calendar,
  Award,
  AlertCircle,
  Camera,
  History,
  Shield,
  ChevronRight,
  Edit,
  Download,
  Plus,
  X,
  Eye,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';

export const GestionIntegral: React.FC = () => {
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [showFichaProducto, setShowFichaProducto] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<any>(null);
  const { hasPermission, userRole } = usePermissions();
  const { toast } = useToast();

  // Verificar permisos de administrador
  if (!hasPermission('*')) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
        <p className="text-gray-600">No tiene permisos para acceder a esta sección</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión Integral de Clientes</h1>
          <p className="text-gray-600">Vista completa de clientes, productos y habilitaciones</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">Vista: {userRole}</Badge>
          <Shield className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Lista de Clientes */}
        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Mis Clientes</span>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClientesList onSelectCliente={setSelectedCliente} />
            </CardContent>
          </Card>
        </div>

        {/* Detalle del Cliente */}
        <div className="col-span-9">
          {selectedCliente ? (
            <ClienteDetalle 
              cliente={selectedCliente}
              onShowFichaProducto={(producto) => {
                setSelectedProducto(producto);
                setShowFichaProducto(true);
              }}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Seleccione un cliente
                </h3>
                <p>Seleccione un cliente de la lista para ver su información completa</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal Ficha de Producto */}
      {showFichaProducto && selectedProducto && (
        <FichaProductoModal 
          producto={selectedProducto}
          onClose={() => {
            setShowFichaProducto(false);
            setSelectedProducto(null);
          }}
        />
      )}
    </div>
  );
};

// Componente Lista de Clientes
const ClientesList: React.FC<{onSelectCliente: (cliente: any) => void}> = ({ onSelectCliente }) => {
  const clientes = [
    {
      id: 'cliente-1',
      razon_social: 'Alimentos del Sur SA',
      cuit: '30-71234567-8',
      tramites_activos: 3,
      productos_registrados: 12,
      alertas: 2,
      ultimo_contacto: '2025-01-25',
      estado: 'activo'
    },
    {
      id: 'cliente-2',
      razon_social: 'Laboratorios Pharma SRL',
      cuit: '30-70987654-3',
      tramites_activos: 5,
      productos_registrados: 28,
      alertas: 0,
      ultimo_contacto: '2025-01-24',
      estado: 'activo'
    },
    {
      id: 'cliente-3',
      razon_social: 'TechImport SA',
      cuit: '33-69876543-9',
      tramites_activos: 2,
      productos_registrados: 7,
      alertas: 1,
      ultimo_contacto: '2025-01-23',
      estado: 'activo'
    },
    {
      id: 'cliente-4',
      razon_social: 'Cosméticos Bella SRL',
      cuit: '30-65432109-8',
      tramites_activos: 1,
      productos_registrados: 15,
      alertas: 0,
      ultimo_contacto: '2025-01-22',
      estado: 'activo'
    }
  ];

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {clientes.map(cliente => (
        <div
          key={cliente.id}
          onClick={() => onSelectCliente(cliente)}
          className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-sm">{cliente.razon_social}</p>
              <p className="text-xs text-gray-500">{cliente.cuit}</p>
              <div className="flex items-center space-x-3 mt-2 text-xs">
                <span className="flex items-center text-blue-600">
                  <FileText className="w-3 h-3 mr-1" />
                  {cliente.tramites_activos}
                </span>
                <span className="flex items-center text-green-600">
                  <Package className="w-3 h-3 mr-1" />
                  {cliente.productos_registrados}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Último contacto: {new Date(cliente.ultimo_contacto).toLocaleDateString('es-AR')}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-1">
              {cliente.alertas > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {cliente.alertas}
                </Badge>
              )}
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente Detalle del Cliente
const ClienteDetalle: React.FC<{
  cliente: any;
  onShowFichaProducto: (producto: any) => void;
}> = ({ cliente, onShowFichaProducto }) => {
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
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>{cliente.tramites_activos} trámites activos</span>
                  <span>•</span>
                  <span>{cliente.productos_registrados} productos registrados</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <History className="w-4 h-4 mr-2" />
                Historial Completo
              </Button>
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Nuevo Trámite
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Información */}
      <Tabs defaultValue="tramites">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tramites">Trámites Activos</TabsTrigger>
          <TabsTrigger value="habilitaciones">Habilitaciones</TabsTrigger>
          <TabsTrigger value="productos">Productos</TabsTrigger>
          <TabsTrigger value="certificados">Certificados</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="tramites">
          <TramitesCliente clienteId={cliente.id} />
        </TabsContent>

        <TabsContent value="habilitaciones">
          <HabilitacionesCliente clienteId={cliente.id} />
        </TabsContent>

        <TabsContent value="productos">
          <ProductosRegistrados 
            clienteId={cliente.id}
            onShowFicha={onShowFichaProducto}
          />
        </TabsContent>

        <TabsContent value="certificados">
          <CertificadosCliente clienteId={cliente.id} />
        </TabsContent>

        <TabsContent value="historial">
          <HistorialCliente clienteId={cliente.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente Trámites del Cliente
const TramitesCliente: React.FC<{clienteId: string}> = ({ clienteId }) => {
  const tramites = [
    {
      id: 'exp-001',
      codigo: 'SGT-2025-ANMAT-00123',
      alias: 'RNPA Yogur Natural',
      estado: 'en_proceso',
      progreso: 65,
      fecha_limite: '2025-03-01',
      dias_restantes: 12
    },
    {
      id: 'exp-002',
      codigo: 'SGT-2025-ANMAT-00134',
      alias: 'RNPA Cereal Integral',
      estado: 'iniciado',
      progreso: 25,
      fecha_limite: '2025-03-06',
      dias_restantes: 17
    }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {tramites.map(tramite => (
            <div key={tramite.id} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{tramite.alias}</h4>
                  <p className="text-sm text-gray-600">{tramite.codigo}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={
                    tramite.estado === 'completado' ? 'bg-green-100 text-green-800' :
                    tramite.estado === 'en_proceso' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {tramite.estado.replace('_', ' ')}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente Habilitaciones del Cliente
const HabilitacionesCliente: React.FC<{clienteId: string}> = ({ clienteId }) => {
  const habilitaciones = [
    {
      tipo: 'RNE',
      numero: '04-000123',
      establecimiento: 'Planta Elaboradora Sur',
      direccion: 'Av. Industrial 1234, Quilmes',
      vencimiento: '2027-05-15',
      estado: 'vigente',
      actividades: ['Elaboración', 'Fraccionamiento', 'Depósito']
    },
    {
      tipo: 'Habilitación Municipal',
      numero: 'HM-2024-0456',
      establecimiento: 'Depósito Central',
      direccion: 'Ruta 3 Km 45, Ezeiza',
      vencimiento: '2025-12-31',
      estado: 'vigente',
      actividades: ['Almacenamiento', 'Distribución']
    },
    {
      tipo: 'Certificación HACCP',
      numero: 'HACCP-2024-789',
      establecimiento: 'Planta Elaboradora Sur',
      direccion: 'Av. Industrial 1234, Quilmes',
      vencimiento: '2025-08-20',
      estado: 'por_renovar',
      actividades: ['Sistema HACCP']
    }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {habilitaciones.map((hab, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    hab.estado === 'vigente' ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    <Building2 className={`w-5 h-5 ${
                      hab.estado === 'vigente' ? 'text-green-600' : 'text-orange-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{hab.tipo}</p>
                    <p className="text-sm text-gray-600">{hab.numero}</p>
                    <p className="text-xs text-gray-500">{hab.establecimiento}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={hab.estado === 'vigente' ? 'default' : 'destructive'}>
                    {hab.estado.replace('_', ' ')}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    Vence: {new Date(hab.vencimiento).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Dirección:</strong> {hab.direccion}
                </p>
                <div>
                  <p className="text-sm text-gray-600 mb-1"><strong>Actividades autorizadas:</strong></p>
                  <div className="flex flex-wrap gap-1">
                    {hab.actividades.map(actividad => (
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
    </Card>
  );
};

// Componente Productos Registrados con Fichas
const ProductosRegistrados: React.FC<{
  clienteId: string;
  onShowFicha: (producto: any) => void;
}> = ({ clienteId, onShowFicha }) => {
  const productos = [
    {
      id: 1,
      nombre: 'Galletitas Dulces Vainilla',
      marca: 'DelSur',
      rnpa: 'RNPA 04-123456',
      vencimiento: '2026-03-15',
      estado: 'vigente',
      categoria: 'Productos de Panadería',
      imagenes: 3,
      peso_neto: '200g',
      vida_util: '6 meses',
      presentacion: 'Paquete flow pack',
      codigo_ean: '7791234567890'
    },
    {
      id: 2,
      nombre: 'Aceite de Girasol Premium',
      marca: 'DelSur',
      rnpa: 'RNPA 04-789012',
      vencimiento: '2025-08-20',
      estado: 'por_renovar',
      categoria: 'Aceites y Grasas',
      imagenes: 5,
      peso_neto: '900ml',
      vida_util: '18 meses',
      presentacion: 'Botella PET',
      codigo_ean: '7791234567891'
    },
    {
      id: 3,
      nombre: 'Mermelada de Frutilla',
      marca: 'DelSur',
      rnpa: 'RNPA 04-345678',
      vencimiento: '2026-01-10',
      estado: 'vigente',
      categoria: 'Conservas Dulces',
      imagenes: 4,
      peso_neto: '450g',
      vida_util: '24 meses',
      presentacion: 'Frasco vidrio',
      codigo_ean: '7791234567892'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Productos Registrados ({productos.length})</span>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {productos.map(producto => (
            <div key={producto.id} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{producto.nombre}</h4>
                  <p className="text-sm text-gray-600">{producto.marca} • {producto.rnpa}</p>
                  <p className="text-xs text-gray-500">{producto.categoria}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={
                      producto.estado === 'vigente' ? 'default' : 'destructive'
                    }>
                      {producto.estado.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Vence: {new Date(producto.vencimiento).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onShowFicha(producto)}
                  >
                    <Camera className="w-4 h-4 mr-1" />
                    Ver Ficha
                  </Button>
                  <Badge variant="secondary" className="text-center text-xs">
                    {producto.imagenes} fotos
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>Peso: {producto.peso_neto}</div>
                <div>Vida útil: {producto.vida_util}</div>
                <div>EAN: {producto.codigo_ean}</div>
                <div>Envase: {producto.presentacion}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente Certificados del Cliente
const CertificadosCliente: React.FC<{clienteId: string}> = ({ clienteId }) => {
  const certificados = [
    {
      tipo: 'Certificado Libre de Gluten',
      numero: 'CLG-2024-789',
      producto: 'Galletitas Dulces Vainilla',
      vencimiento: '2025-06-15',
      estado: 'vigente',
      laboratorio: 'INTI'
    },
    {
      tipo: 'Certificación Orgánica',
      numero: 'ORG-2024-456',
      producto: 'Aceite de Girasol Premium',
      vencimiento: '2025-12-20',
      estado: 'vigente',
      laboratorio: 'SENASA'
    },
    {
      tipo: 'Análisis Microbiológico',
      numero: 'MICRO-2025-123',
      producto: 'Mermelada de Frutilla',
      vencimiento: '2025-07-10',
      estado: 'por_renovar',
      laboratorio: 'Lab. Central'
    }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-3">
          {certificados.map((cert, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Award className={`w-8 h-8 ${
                  cert.estado === 'vigente' ? 'text-green-500' : 'text-orange-500'
                }`} />
                <div>
                  <p className="font-medium text-gray-900">{cert.tipo}</p>
                  <p className="text-sm text-gray-600">{cert.numero} • {cert.producto}</p>
                  <p className="text-xs text-gray-500">Laboratorio: {cert.laboratorio}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={cert.estado === 'vigente' ? 'default' : 'destructive'}>
                  {cert.estado.replace('_', ' ')}
                </Badge>
                <p className="text-xs text-gray-500 mt-1">
                  Vence: {new Date(cert.vencimiento).toLocaleDateString('es-AR')}
                </p>
                <div className="flex space-x-1 mt-2">
                  <Button size="sm" variant="ghost">
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente Historial del Cliente
const HistorialCliente: React.FC<{clienteId: string}> = ({ clienteId }) => {
  const historial = [
    {
      fecha: '2025-01-25 10:30',
      accion: 'Documento subido',
      detalle: 'Manual técnico - Router WiFi 6',
      usuario: 'Cliente',
      tipo: 'documento'
    },
    {
      fecha: '2025-01-24 16:45',
      accion: 'Estado cambiado',
      detalle: 'RNPA Yogur: iniciado → en_proceso',
      usuario: 'Gestor Principal',
      tipo: 'estado'
    },
    {
      fecha: '2025-01-24 14:20',
      accion: 'Observación agregada',
      detalle: 'Falta certificado de origen',
      usuario: 'Despachante Juan',
      tipo: 'observacion'
    },
    {
      fecha: '2025-01-23 11:15',
      accion: 'Expediente creado',
      detalle: 'SGT-2025-ANMAT-00134 - RNPA Cereal',
      usuario: 'Admin SGT',
      tipo: 'creacion'
    }
  ];

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'documento':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'estado':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'observacion':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'creacion':
        return <Plus className="w-4 h-4 text-purple-500" />;
      default:
        return <History className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {historial.map((item, idx) => (
            <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="mt-1">
                {getIconoTipo(item.tipo)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.accion}</p>
                <p className="text-sm text-gray-600">{item.detalle}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">{item.fecha}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{item.usuario}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Modal de Ficha de Producto
const FichaProductoModal: React.FC<{
  producto: any;
  onClose: () => void;
}> = ({ producto, onClose }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "Imagen subida",
        description: `Se agregó la imagen ${file.name} al producto`,
      });
    }
  };

  // Imágenes de ejemplo (en producción serían URLs reales)
  const imagenesEjemplo = [
    'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1998635/pexels-photo-1998635.jpeg?auto=compress&cs=tinysrgb&w=400'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ficha de Producto - {producto.nombre}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información Principal */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Datos del Producto</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre Comercial:</span>
                  <span className="font-medium">{producto.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Marca:</span>
                  <span className="font-medium">{producto.marca}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">RNPA:</span>
                  <span className="font-medium">{producto.rnpa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Categoría:</span>
                  <span className="font-medium">{producto.categoria}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <Badge variant={producto.estado === 'vigente' ? 'default' : 'destructive'}>
                    {producto.estado.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Características</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Peso Neto:</span>
                  <span className="font-medium">{producto.peso_neto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vida Útil:</span>
                  <span className="font-medium">{producto.vida_util}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Presentación:</span>
                  <span className="font-medium">{producto.presentacion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Código EAN:</span>
                  <span className="font-medium font-mono">{producto.codigo_ean}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vencimiento RNPA:</span>
                  <span className={`font-medium ${
                    new Date(producto.vencimiento) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) 
                      ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {new Date(producto.vencimiento).toLocaleDateString('es-AR')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Galería de Imágenes */}
          <div>
            <h3 className="font-medium mb-3">Galería de Imágenes del Producto</h3>
            
            {/* Imagen principal */}
            <div className="mb-4">
              <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={imagenesEjemplo[activeImageIndex]} 
                  alt={`${producto.nombre} - Vista ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Miniaturas */}
            <div className="grid grid-cols-6 gap-2">
              {/* Botón agregar imagen */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-20 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <Camera className="w-6 h-6 text-gray-400" />
                </div>
              </div>
              
              {/* Imágenes existentes */}
              {imagenesEjemplo.map((imagen, index) => (
                <div 
                  key={index} 
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 ${
                    activeImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img 
                    src={imagen}
                    alt={`${producto.nombre} - ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Información Regulatoria */}
          <div>
            <h3 className="font-medium mb-3">Información Regulatoria</h3>
            <div className="space-y-3">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-900">RNPA Vigente</p>
                    <p className="text-sm text-green-700">
                      Número: {producto.rnpa} • Vencimiento: {new Date(producto.vencimiento).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <Award className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">RNE del Elaborador</p>
                    <p className="text-sm text-blue-700">N° 04-000123 - Vigente hasta 2027</p>
                  </div>
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Historial de Modificaciones del Producto */}
          <div>
            <h3 className="font-medium mb-3">Historial de Cambios</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {[
                { fecha: '15/01/2025', cambio: 'Actualización de rótulo', usuario: 'Admin SGT', tipo: 'modificacion' },
                { fecha: '10/12/2024', cambio: 'Renovación RNPA', usuario: 'Despachante Juan', tipo: 'renovacion' },
                { fecha: '05/06/2024', cambio: 'Cambio de fórmula', usuario: 'Admin SGT', tipo: 'modificacion' },
                { fecha: '15/03/2024', cambio: 'Registro inicial', usuario: 'Gestor Principal', tipo: 'creacion' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <History className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">{item.cambio}</span>
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    <div>{item.fecha}</div>
                    <div>{item.usuario}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Editar Producto
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Descargar Ficha
            </Button>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Renovar RNPA
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};