import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Building, User, Mail, Phone, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { databaseService } from '@/services/DatabaseService';
import { ClientFormModal } from '@/components/Clientes/ClientFormModal';
import { useSGT } from '../../context/SGTContext';

export const Clientes: React.FC = () => {
  const { state, fetchClientes, fetchExpedientes } = useSGT();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [clientes, setClientes] = useState<any[]>([]);

  React.useEffect(() => {
    cargarClientes();
    fetchExpedientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const clientesData = await databaseService.getClientes();
      setClientes(clientesData);
    } catch (error) {
      console.error('Error cargando clientes:', error);
      // Fallback a datos del contexto
      setClientes(state.clientes);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClient = (cliente: any) => {
    setEditingClient(cliente);
    setShowClientModal(true);
  };

  const handleNewClient = () => {
    setEditingClient(null);
    setShowClientModal(true);
  };

  const handleDeleteClient = async (cliente: any) => {
    if (!confirm(`¿Está seguro de que desea desactivar el cliente "${cliente.razon_social}"?`)) {
      return;
    }

    try {
      await databaseService.updateCliente(cliente.id, { is_active: false });
      toast({
        title: "Cliente desactivado",
        description: `${cliente.razon_social} ha sido desactivado`,
      });
      cargarClientes();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo desactivar el cliente",
        variant: "destructive"
      });
    }
  };

  const handleModalSuccess = () => {
    cargarClientes();
    fetchClientes(); // Actualizar también el contexto
  };

  // Enriquecer clientes con datos de expedientes
  const clientesEnriquecidos = clientes.map(cliente => {
    const expedientesCliente = state.expedientes.filter(exp => 
      exp.cliente_id === cliente.id || 
      exp.cliente?.razon_social === cliente.razon_social
    );
    
    const expedientesActivos = expedientesCliente.filter(exp => 
      !['completado', 'cancelado'].includes(exp.estado)
    ).length;
    
    const ultimoExpediente = expedientesCliente
      .sort((a, b) => new Date(b.created_at || b.fecha_inicio).getTime() - new Date(a.created_at || a.fecha_inicio).getTime())[0];
    
    return {
      ...cliente,
      expedientes_activos: expedientesActivos,
      ultimo_tramite: ultimoExpediente?.alias || ultimoExpediente?.tramite_tipo?.nombre || 'Sin trámites'
    };
  });

  // Filtrar clientes por búsqueda
  const clientesFiltrados = clientesEnriquecidos.filter(cliente =>
    cliente.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cuit.includes(searchTerm) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cliente.contacto_nombre && cliente.contacto_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Clientes</h1>
          <p className="text-gray-600 dark:text-gray-300">Gestión de clientes y contactos</p>
        </div>
        {hasPermission('crear_clientes') && (
          <Button 
            onClick={handleNewClient}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cliente
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar clientes por razón social, CUIT o contacto..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Clientes List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Clientes ({clientesFiltrados.length})</span>
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {clientesFiltrados.map((cliente) => (
              <div
                key={cliente.id} 
                className="p-4 border rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{cliente.razon_social}</h3>
                      <p className="text-sm text-gray-500">CUIT: {cliente.cuit}</p>
                      <p className="text-sm text-gray-500">{cliente.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{cliente.expedientes_activos}</p>
                      <p className="text-sm text-gray-500">Activos</p>
                    </div>
                    <div className="text-right flex-1">
                      <p className="text-sm font-medium text-gray-900">Último trámite:</p>
                      <p className="text-sm text-gray-600">{cliente.ultimo_tramite}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col space-y-2">
                        <Link 
                          to={`/clientes/${cliente.id}`}
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium text-center"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Vista 360°
                        </Link>
                        <div className="flex space-x-1">
                          {hasPermission('editar_clientes') && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditClient(cliente)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {hasPermission('*') && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteClient(cliente)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{cliente.contacto_nombre}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{cliente.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{cliente.telefono}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {clientesFiltrados.length === 0 && !loading && (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ? 'Intente ajustar el término de búsqueda' : 'Comience agregando su primer cliente'}
                </p>
                {hasPermission('crear_clientes') && !searchTerm && (
                  <Button onClick={handleNewClient}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primer Cliente
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Cliente */}
      <ClientFormModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        cliente={editingClient}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};