import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, XCircle } from 'lucide-react';
import { useSGT } from '../../context/SGTContext';

export const ExpedientesConProblemas: React.FC = () => {
  const { state } = useSGT();

  const expedientesProblematicos = state.expedientes
    .filter(e => e.estado === 'vencido' || e.estado === 'observado' || e.semaforo === 'rojo' || e.dias_restantes < 3)
    .sort((a, b) => {
      if (a.estado === 'vencido' && b.estado !== 'vencido') return -1;
      if (a.estado !== 'vencido' && b.estado === 'vencido') return 1;
      if (a.estado === 'observado' && b.estado !== 'observado') return -1;
      if (a.estado !== 'observado' && b.estado === 'observado') return 1;
      return a.dias_restantes - b.dias_restantes;
    });

  const getUrgenciaIcon = (expediente: any) => {
    if (expediente.estado === 'vencido') return <XCircle className="w-5 h-5 text-red-600" />;
    if (expediente.estado === 'observado') return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <Clock className="w-5 h-5 text-orange-600" />;
  };

  const getUrgenciaColor = (expediente: any) => {
    if (expediente.estado === 'vencido') return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10';
    if (expediente.estado === 'observado') return 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
    return 'border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/10';
  };

  const getUrgenciaLabel = (expediente: any) => {
    if (expediente.estado === 'vencido') return { text: 'VENCIDO', color: 'text-red-700 dark:text-red-400' };
    if (expediente.estado === 'observado') return { text: 'OBSERVADO', color: 'text-yellow-700 dark:text-yellow-400' };
    return { text: 'URGENTE', color: 'text-orange-700 dark:text-orange-400' };
  };

  if (expedientesProblematicos.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            ¡Todo en orden!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No hay expedientes con problemas o urgentes en este momento
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-900 dark:text-red-100">
                Expedientes que Requieren Atención
              </h2>
              <p className="text-sm text-red-700 dark:text-red-300">
                {expedientesProblematicos.length} expediente{expedientesProblematicos.length !== 1 ? 's' : ''} con problemas o urgentes
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {expedientesProblematicos.map((expediente) => {
          const urgencia = getUrgenciaLabel(expediente);
          return (
            <Link
              key={expediente.id}
              to={`/expedientes/${expediente.id}`}
              className={`block p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all ${getUrgenciaColor(expediente)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="mt-1">
                    {getUrgenciaIcon(expediente)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                        {expediente.alias}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${urgencia.color} bg-white dark:bg-gray-800`}>
                        {urgencia.text}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Código:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{expediente.codigo}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Organismo:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{expediente.organismo}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Cliente:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{expediente.cliente_nombre}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Paso:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                          {expediente.paso_actual}/{expediente.total_pasos}
                        </span>
                      </div>
                    </div>

                    {expediente.estado === 'observado' && (
                      <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          ⚠️ Tiene observaciones que deben ser atendidas
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className={`text-2xl font-bold ${
                    expediente.dias_restantes < 0 ? 'text-red-600 dark:text-red-400' :
                    expediente.dias_restantes < 3 ? 'text-orange-600 dark:text-orange-400' :
                    'text-gray-900 dark:text-gray-100'
                  }`}>
                    {expediente.dias_restantes < 0
                      ? `+${Math.abs(expediente.dias_restantes)}`
                      : expediente.dias_restantes
                    }
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {expediente.dias_restantes < 0 ? 'días vencido' : 'días restantes'}
                  </div>

                  <div className="mt-3 w-32">
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          expediente.progreso < 30 ? 'bg-red-500' :
                          expediente.progreso < 70 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${expediente.progreso}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                      {expediente.progreso}% completado
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

function CheckCircle(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
