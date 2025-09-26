import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Search,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { formatDate, getDaysRemaining } from '@/lib/utils';

export const ExpedientesCliente: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [filteredExpedientes, setFilteredExpedientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  
  const clienteSession = localStorage.getItem('cliente_session');
  const cliente = clienteSession ? JSON.parse(clienteSession) : null;

  useEffect(() => {
    if (!cliente) {
      navigate('/portal-cliente/login');
      return;
    }
    cargarExpedientes();
  }, [cliente, navigate]);

  useEffect(() => {
    // Aplicar filtros
    let filtered = expedientes;
    
    if (searchTerm) {
      filtered = filtered.filter(exp => 
        exp.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.alias?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.tramite_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (estadoFilter) {
      filtered = filtered.filter(exp => exp.estado === estadoFilter);
    }
    
    setFilteredExpedientes(filtered);
  }, [expedientes, searchTerm, estadoFilter]);

  const cargarExpedientes = async () => {
    try {
      setLoading(true);
      
      // Cargar expedientes del cliente desde localStorage
      const expedientesStorage = localStorage.getItem('sgt_expedientes');
      const todosExpedientes = expedientesStorage ? JSON.parse(expedientesStorage) : [];
      
      // Filtrar expedientes del cliente actual
      const expedientesCliente = todosExpedientes.filter((exp: any) => 
        exp.cliente_id === cliente.id || exp.cliente_nombre === cliente.razon_social
      );
      
      setExpedientes(expedientesCliente);
    } catch (error) {
      console.error('Error cargando expedientes:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los expedientes",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando expedientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Expedientes</h1>
        <p className="text-gray-600 dark:text-gray-200">Consulte el estado de sus trámites regulatorios</p>
      </div>

      {/* Filtros */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por código, alias o trámite..."
                className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="">Todos los estados</option>
              <option value="iniciado">Iniciado</option>
              <option value="en_proceso">En Proceso</option>
              <option value="observado">Observado</option>
              <option value="completado">Completado</option>
              <option value="vencido">Vencido</option>
            </Select>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setEstadoFilter(''); }} className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
              <Filter className="w-4 h-4 mr-2" />
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Expedientes */}
      <div className="space-y-4">
        {filteredExpedientes.map((expediente) => {
          const diasRestantes = getDaysRemaining(expediente.fecha_limite);
          const progreso = expediente.progreso || Math.round((expediente.paso_actual / 8) * 100);
          
          return (
            <Card key={expediente.id} className="hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    {getSemaforoIcon(diasRestantes)}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{expediente.codigo}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{expediente.alias}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{expediente.tramite_nombre}</p>
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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                  <div className="flex items-center space-x-1">
                    <Building2 className="w-4 h-4" />
                    <span className="dark:text-gray-200">{expediente.organismo}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span className="dark:text-gray-200">Inicio: {formatDate(expediente.fecha_inicio)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span className="dark:text-gray-200">Límite: {formatDate(expediente.fecha_limite)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className={diasRestantes < 0 ? 'text-red-600 dark:text-red-400 font-medium' : 'dark:text-gray-200'}>
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
                    <span className="text-gray-700 dark:text-gray-200">Progreso del trámite</span>
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
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Paso {expediente.paso_actual} de 8
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalle
                  </Button>
                  <Button size="sm" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Documento
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Estado
                  </Button>
                </div>

                {/* Observaciones si las hay */}
                {expediente.observaciones && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Observaciones:</strong> {expediente.observaciones}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredExpedientes.length === 0 && !loading && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No se encontraron expedientes
            </h3>
            <p className="text-gray-500 dark:text-gray-300 mb-6">
              {searchTerm || estadoFilter 
                ? 'Intente ajustar los filtros de búsqueda'
                : 'No tiene expedientes registrados en el sistema'
              }
            </p>
            {!searchTerm && !estadoFilter && (
              <Button variant="outline">
                <User className="w-4 h-4 mr-2" />
                Contactar Soporte
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};