import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Building, User, Mail, Phone, Eye, CreditCard as Edit, Trash2 } from 'lucide-react';
import { useSGT } from '../../context/SGTContext';

export const Clientes: React.FC = () => {
  const { state, fetchClientes, fetchExpedientes } = useSGT();

  React.useEffect(() => {
    fetchClientes();
    fetchExpedientes();
  }, []);

  // Enriquecer clientes con datos de expedientes
  const clientesEnriquecidos = state.clientes.map(cliente => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Clientes</h1>
          <p className="text-gray-600 dark:text-gray-300">Gestión de clientes y contactos</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar clientes por razón social, CUIT o contacto..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Clientes List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Lista de Clientes</h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {clientesEnriquecidos.map((cliente) => (
            <div
              key={cliente.id} 
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{cliente.razon_social}</h3>
                    <p className="text-sm text-gray-500">CUIT: {cliente.cuit}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{cliente.expedientes_activos}</p>
                    <p className="text-sm text-gray-500">Activos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Último trámite:</p>
                    <p className="text-sm text-gray-600">{cliente.ultimo_tramite}</p>
                    <div className="mt-2">
                      <Link 
                        to={`/clientes/${cliente.id}`}
                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Vista 360°
                      </Link>
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
        </div>
      </div>
    </div>
  );
};