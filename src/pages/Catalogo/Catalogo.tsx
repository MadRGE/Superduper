import React, { useState } from 'react';
import { Search, Filter, BookOpen, Building2, Tag, Clock } from 'lucide-react';
import { useSGT } from '../../context/SGTContext';
import { catalogoTramitesArgentina } from '@/data/catalogoTramitesCompleto';

export const Catalogo: React.FC = () => {
  const { state, catalogoTramites } = useSGT();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRubro, setSelectedRubro] = useState('');
  const [selectedOrganismo, setSelectedOrganismo] = useState('');
  const [showDetailed, setShowDetailed] = useState(false);

  // Combinar trámites del estado con el catálogo completo
  const allTramites = [
    ...state.tramiteTipos,
    ...Object.values(catalogoTramites).flatMap(org => 
      org.tramites.map(t => ({
        ...t,
        rubro: org.organismo,
        organismo_id: org.sigla,
        sla_total_dias: t.sla_dias,
        tags: [org.sigla, t.sistema]
      }))
    )
  ];

  const filteredTramites = allTramites.filter(tramite => {
    if (searchTerm && !tramite.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !tramite.codigo.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedRubro && tramite.rubro !== selectedRubro) return false;
    if (selectedOrganismo && tramite.organismo_id !== selectedOrganismo) return false;
    return true;
  });

  const rubros = [...new Set(allTramites.map(t => t.rubro))];

  const getOrganismoName = (organismoId: string) => {
    const organismo = state.organismos.find(o => o.id === organismoId);
    return organismo?.sigla || organismoId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Catálogo de Trámites</h1>
          <p className="text-gray-600 dark:text-gray-300">Consulta todos los trámites disponibles</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDetailed(!showDetailed)}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
              showDetailed
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>{showDetailed ? 'Vista Simple' : 'Vista Detallada'}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar trámites por nombre o código..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              value={selectedRubro}
              onChange={(e) => setSelectedRubro(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los rubros</option>
              {rubros.map((rubro) => (
                <option key={rubro} value={rubro}>{rubro}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedOrganismo}
              onChange={(e) => setSelectedOrganismo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los organismos</option>
              {state.organismos.map((org) => (
                <option key={org.id} value={org.id}>{org.sigla}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Mostrando {filteredTramites.length} de {allTramites.length} trámites
      </div>

      {/* Tramites Grid */}
      <div className={`grid gap-6 ${showDetailed ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {filteredTramites.map((tramite) => (
          <div key={tramite.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">{tramite.codigo}</span>
                </div>
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded-full">
                  {tramite.rubro}
                </span>
              </div>
              
              <h3 className={`font-semibold text-gray-900 dark:text-gray-100 mb-2 ${showDetailed ? '' : 'line-clamp-2'}`}>
                {tramite.nombre}
              </h3>

              <p className={`text-sm text-gray-600 dark:text-gray-400 mb-4 ${showDetailed ? '' : 'line-clamp-2'}`}>
                {tramite.alcance || tramite.descripcion}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Building2 className="w-4 h-4" />
                  <span>{getOrganismoName(tramite.organismo_id)}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{tramite.sla_total_dias || tramite.sla_dias} días hábiles</span>
                </div>
                
                {/* Mostrar información adicional en vista detallada */}
                {showDetailed && (
                  <>
                    {tramite.sistema && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Tag className="w-4 h-4" />
                        <span>Sistema: {tramite.sistema}</span>
                      </div>
                    )}

                    {tramite.arancel && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Arancel:</span>
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded">
                          {tramite.arancel}
                        </span>
                      </div>
                    )}

                    {tramite.documentacion_requerida && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2">Documentación Requerida:</p>
                        <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
                          {Array.isArray(tramite.documentacion_requerida)
                            ? tramite.documentacion_requerida.map((doc, idx) => (
                                <li key={idx}>{doc}</li>
                              ))
                            : <li>{tramite.documentacion_requerida}</li>
                          }
                        </ul>
                      </div>
                    )}

                    {tramite.observaciones && (
                      <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-xs font-semibold text-yellow-900 dark:text-yellow-300 mb-1">Observaciones:</p>
                        <p className="text-xs text-yellow-800 dark:text-yellow-400">{tramite.observaciones}</p>
                      </div>
                    )}

                    {tramite.pasos && tramite.pasos.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">Pasos del Trámite:</p>
                        <ol className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-decimal list-inside">
                          {tramite.pasos.map((paso, idx) => (
                            <li key={idx}>{typeof paso === 'string' ? paso : paso.nombre}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </>
                )}
                
                {tramite.tags && tramite.tags.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {tramite.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                      {tramite.tags.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{tramite.tags.length - 2} más
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Iniciar Trámite
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTramites.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron trámites</h3>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda.</p>
        </div>
      )}
    </div>
  );
};