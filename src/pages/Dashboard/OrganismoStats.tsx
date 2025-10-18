import React from 'react';
import { Building2 } from 'lucide-react';
import { useSGT } from '../../context/SGTContext';

export const OrganismoStats: React.FC = () => {
  const { state } = useSGT();
  
  const organismoStats = state.organismos.map(org => {
    const expedientes = state.expedientes.filter(exp => exp.organismo === org.sigla);
    const enProceso = expedientes.filter(exp => exp.estado === 'en_proceso').length;
    const completados = expedientes.filter(exp => exp.estado === 'completado').length;
    const vencidos = expedientes.filter(exp => exp.estado === 'vencido').length;
    
    return {
      ...org,
      total: expedientes.length,
      enProceso,
      completados,
      vencidos,
      eficiencia: expedientes.length > 0 ? Math.round((completados / expedientes.length) * 100) : 0
    };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Estadísticas por Organismo</h2>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {organismoStats.map((org) => (
          <div key={org.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{org.sigla}</h3>
                <p className="text-sm text-gray-500 truncate">{org.canal}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{org.total}</div>
                <div className="text-xs text-gray-500">expedientes</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-sm font-medium text-orange-600">{org.enProceso}</div>
                <div className="text-xs text-gray-500">En proceso</div>
              </div>
              <div>
                <div className="text-sm font-medium text-green-600">{org.completados}</div>
                <div className="text-xs text-gray-500">Completados</div>
              </div>
              <div>
                <div className="text-sm font-medium text-red-600">{org.vencidos}</div>
                <div className="text-xs text-gray-500">Vencidos</div>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Eficiencia</span>
                <span>{org.eficiencia}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${org.eficiencia >= 80 ? 'bg-green-500' : org.eficiencia >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${org.eficiencia}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};