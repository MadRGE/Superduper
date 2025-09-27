import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Briefcase, Calendar, User, Building2, Eye, CreditCard as Edit, Clock, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { databaseService } from '@/services/DatabaseService';
import { formatDate } from '@/lib/utils';

export const CasosLegalesList: React.FC = () => {
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const [casosLegales, setCasosLegales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [clienteFilter, setClienteFilter] = useState('');

  useEffect(() => {
    cargarCasosLegales();
  }, []);

  const cargarCasosLegales = async () => {
    try {
      setLoading(true);
      const casos = await databaseService.getCasosLegales();
      setCasosLegales(casos);
    } catch (error) {
      console.error('Error cargando casos legales:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los casos legales",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCasos = casosLegales.filter(caso => {
    if (searchTerm && !caso.nombre_caso.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !caso.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (estadoFilter && caso.estado_legal !== estadoFilter) return false;
    if (clienteFilter && caso.cliente_id !== clienteFilter) return false;
    return true;
  });

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

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'abierto':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'en_litigio':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'cerrado':
        return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!hasPermission('ver_casos_legales')) {
    return (
      <div className="text-center py-12">
        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
        <p className="text-gray-600">No tiene permisos para ver casos legales</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Casos Legales</h1>
          <p className="text-gray-600">Gestión de archivos de casos y dossiers legales</p>
        </div>
        {hasPermission('crear_casos_legales') && (
          <Link 
            to="/casos-legales/nuevo"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Caso Legal
          </Link>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Casos</p>
                <p className="text-2xl font-bold text-gray-900">{casosLegales.length}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Casos Abiertos</p>
                <p className="text-2xl font-bold text-green-600">
                  {casosLegales.filter(c => c.estado_legal === 'abierto').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Litigio</p>
                <p className="text-2xl font-bold text-red-600">
                  {casosLegales.filter(c => c.estado_legal === 'en_litigio').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cerrados</p>
                <p className="text-2xl font-bold text-gray-600">
                  {casosLegales.filter(c => c.estado_legal === 'cerrado').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar casos por nombre o descripción..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="abierto">Abierto</option>
              <option value="en_litigio">En Litigio</option>
              <option value="cerrado">Cerrado</option>
              <option value="archivado">Archivado</option>
            </Select>
            
            <Select
              value={clienteFilter}
              onChange={(e) => setClienteFilter(e.target.value)}
            >
              <option value="">Todos los clientes</option>
              {/* Aquí se cargarían los clientes dinámicamente */}
              <option value="cliente-1">Alimentos del Sur SA</option>
              <option value="cliente-2">TechCorp Argentina</option>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={() => { 
                setSearchTerm(''); 
                setEstadoFilter(''); 
                setClienteFilter(''); 
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Casos Legales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCasos.map((caso) => (
          <Card key={caso.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getEstadoIcon(caso.estado_legal)}
                  <div>
                    <Link 
                      to={`/casos-legales/${caso.id}`}
                      className="font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {caso.nombre_caso}
                    </Link>
                  </div>
                </div>
                <Badge className={getEstadoColor(caso.estado_legal)}>
                  {caso.estado_legal.replace('_', ' ')}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {caso.descripcion || 'Sin descripción'}
              </p>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4" />
                  <span>{caso.cliente?.razon_social || 'Cliente no especificado'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Apertura: {formatDate(caso.fecha_apertura)}</span>
                </div>
                {caso.abogado_responsable_id && (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Responsable asignado</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver
                </Button>
                {hasPermission('editar_casos_legales') && (
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCasos.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron casos legales
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || estadoFilter || clienteFilter 
                ? 'Intente ajustar los filtros de búsqueda'
                : 'Comience creando su primer caso legal'
              }
            </p>
            {hasPermission('crear_casos_legales') && !searchTerm && !estadoFilter && !clienteFilter && (
              <Link 
                to="/casos-legales/nuevo"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Caso Legal
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};