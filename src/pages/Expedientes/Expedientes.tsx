import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Download, Calendar } from 'lucide-react';
import { ExpedienteCard } from './ExpedienteCard';
import { ExpedienteFilters } from './ExpedienteFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { useSGT } from '../../context/SGTContext';

export const Expedientes: React.FC = () => {
  const { state, fetchExpedientes } = useSGT();
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchExpedientes();
  }, []);

  const filteredExpedientes = state.expedientes.filter(expediente => {
    const { estado, organismo, prioridad, search } = state.filters;
    
    if (estado && expediente.estado !== estado) return false;
    if (organismo) {
      const organismoData = state.organismos.find(org => org.id === expediente.tramite_tipo_id);
      if (!organismoData || organismoData.sigla !== organismo) return false;
    }
    if (prioridad && expediente.prioridad !== prioridad) return false;
    if (search && !expediente.alias?.toLowerCase().includes(search.toLowerCase()) && 
        !expediente.codigo.toLowerCase().includes(search.toLowerCase()) &&
        !expediente.cliente?.razon_social?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  if (state.loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expedientes</h1>
          <p className="text-gray-600">Gestión de trámites regulatorios</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
          <Link 
            to="/expedientes/nuevo"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Expediente
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por código, alias o cliente..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={state.filters.search}
              onChange={(e) => state.dispatch({
                type: 'UPDATE_FILTERS',
                payload: { search: e.target.value }
              })}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium ${
              showFilters ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                view === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Tarjetas
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Lista
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && <ExpedienteFilters />}
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Mostrando {filteredExpedientes.length} de {state.expedientes.length} expedientes
        </span>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>Última actualización: {new Date().toLocaleDateString('es-AR')}</span>
        </div>
      </div>

      {/* Expedientes Grid */}
      <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredExpedientes.map((expediente) => (
          <ExpedienteCard key={expediente.id} expediente={expediente} view={view} />
        ))}
      </div>

      {filteredExpedientes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron expedientes</h3>
          <p className="text-gray-500 mb-6">Intenta ajustar los filtros o crear un nuevo expediente.</p>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Crear Expediente
          </button>
        </div>
      )}
    </div>
  );
};