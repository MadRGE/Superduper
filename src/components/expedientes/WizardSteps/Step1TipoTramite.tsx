import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText, Clock, Tag } from 'lucide-react';
import { useSGT } from '../../../context/SGTContext';
import { TramiteTipo, Organismo } from '../../../types/database';

interface Step1TipoTramiteProps {
  selectedTramiteId: string;
  onSelect: (tramiteId: string) => void;
}

export const Step1TipoTramite: React.FC<Step1TipoTramiteProps> = ({
  selectedTramiteId,
  onSelect
}) => {
  const { state } = useSGT();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrganismo, setSelectedOrganismo] = useState('');

  // Filtrar trámites según búsqueda y organismo
  const filteredTramites = state.tramiteTipos.filter(tramite => {
    const matchesSearch = !searchTerm || 
      tramite.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tramite.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tramite.rubro.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOrganismo = !selectedOrganismo || 
      tramite.organismo_id === selectedOrganismo;

    return matchesSearch && matchesOrganismo;
  });

  const getOrganismoName = (organismoId: string): string => {
    const organismo = state.organismos.find(org => org.id === organismoId);
    return organismo?.sigla || 'N/A';
  };

  const getPriorityColor = (sla: number): string => {
    if (sla <= 15) return 'text-red-600 bg-red-50';
    if (sla <= 30) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Seleccionar Tipo de Trámite
        </h2>
        <p className="text-gray-600">
          Elige el tipo de trámite que deseas iniciar. Cada trámite tiene requisitos y tiempos específicos.
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, código o rubro..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtro por organismo */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedOrganismo}
              onChange={(e) => setSelectedOrganismo(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Todos los organismos</option>
              {state.organismos.map((organismo) => (
                <option key={organismo.id} value={organismo.id}>
                  {organismo.sigla}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="text-sm text-gray-600">
          Mostrando {filteredTramites.length} de {state.tramiteTipos.length} trámites
        </div>
      </div>

      {/* Lista de trámites */}
      <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
        {filteredTramites.map((tramite) => (
          <div
            key={tramite.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedTramiteId === tramite.id
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelect(tramite.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">{tramite.nombre}</h3>
                  {selectedTramiteId === tramite.id && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="font-medium">Código: {tramite.codigo}</span>
                    <span>•</span>
                    <span>{getOrganismoName(tramite.organismo_id)}</span>
                    <span>•</span>
                    <span>{tramite.rubro}</span>
                  </div>
                  
                  {tramite.alcance && (
                    <p className="text-sm text-gray-700">{tramite.alcance}</p>
                  )}
                  
                  {tramite.tags && tramite.tags.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-wrap gap-1">
                        {tramite.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {tramite.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{tramite.tags.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SLA */}
              <div className="ml-4 text-right">
                <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(tramite.sla_total_dias || 30)}`}>
                  <Clock className="w-4 h-4" />
                  <span>{tramite.sla_total_dias || 30} días</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">SLA máximo</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sin resultados */}
      {filteredTramites.length === 0 && (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron trámites
          </h3>
          <p className="text-gray-500">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}

      {/* Información del trámite seleccionado */}
      {selectedTramiteId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Trámite Seleccionado</h4>
          {(() => {
            const selectedTramite = state.tramiteTipos.find(t => t.id === selectedTramiteId);
            if (!selectedTramite) return null;
            
            return (
              <div className="text-sm text-blue-800">
                <p><strong>{selectedTramite.nombre}</strong></p>
                <p>Organismo: {getOrganismoName(selectedTramite.organismo_id)}</p>
                <p>SLA: {selectedTramite.sla_total_dias || 30} días hábiles</p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};