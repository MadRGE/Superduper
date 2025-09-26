import React from 'react';
import { X } from 'lucide-react';
import { useSGT } from '../../context/SGTContext';

export const ExpedienteFilters: React.FC = () => {
  const { state, dispatch } = useSGT();

  const estados = [
    { value: '', label: 'Todos los estados' },
    { value: 'iniciado', label: 'Iniciado' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'observado', label: 'Observado' },
    { value: 'completado', label: 'Completado' },
    { value: 'vencido', label: 'Vencido' },
  ];

  const prioridades = [
    { value: '', label: 'Todas las prioridades' },
    { value: 'normal', label: 'Normal' },
    { value: 'alta', label: 'Alta' },
    { value: 'urgente', label: 'Urgente' },
  ];

  const organismos = [
    { value: '', label: 'Todos los organismos' },
    ...state.organismos.map(org => ({ value: org.sigla, label: org.sigla }))
  ];

  const clearFilters = () => {
    dispatch({
      type: 'UPDATE_FILTERS',
      payload: {
        estado: '',
        organismo: '',
        prioridad: '',
        search: ''
      }
    });
  };

  const hasActiveFilters = state.filters.estado || state.filters.organismo || state.filters.prioridad;

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Estado</label>
          <select
            value={state.filters.estado}
            onChange={(e) => dispatch({
              type: 'UPDATE_FILTERS',
              payload: { estado: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {estados.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Organismo</label>
          <select
            value={state.filters.organismo}
            onChange={(e) => dispatch({
              type: 'UPDATE_FILTERS',
              payload: { organismo: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {organismos.map((organismo) => (
              <option key={organismo.value} value={organismo.value}>
                {organismo.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Prioridad</label>
          <select
            value={state.filters.prioridad}
            onChange={(e) => dispatch({
              type: 'UPDATE_FILTERS',
              payload: { prioridad: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {prioridades.map((prioridad) => (
              <option key={prioridad.value} value={prioridad.value}>
                {prioridad.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <X className="w-4 h-4 mr-2" />
              Limpiar filtros
            </button>
          )}
        </div>
      </div>
    </div>
  );
};