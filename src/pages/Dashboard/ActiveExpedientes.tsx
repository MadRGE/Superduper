import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { useSGT } from '../../context/SGTContext';

export const ActiveExpedientes: React.FC = () => {
  const { state } = useSGT();
  
  const activeExpedientes = state.expedientes
    .filter(e => ['iniciado', 'en_proceso', 'observado'].includes(e.estado))
    .sort((a, b) => a.dias_restantes - b.dias_restantes)
    .slice(0, 6);

  const getStatusColor = (estado: string, semaforo: string) => {
    if (estado === 'observado') return 'bg-yellow-100 text-yellow-800';
    if (semaforo === 'rojo') return 'bg-red-100 text-red-800';
    if (semaforo === 'amarillo') return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getSemaforoIcon = (semaforo: string) => {
    switch (semaforo) {
      case 'rojo':
        return <AlertTriangle className="w-4 h-4" />;
      case 'amarillo':
        return <Clock className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Expedientes Activos</h2>
          </div>
          <Link 
            to="/expedientes" 
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver todos
          </Link>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {activeExpedientes.map((expediente) => (
          <Link
            key={expediente.id}
            to={`/expedientes/${expediente.id}`}
            className="block p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-medium text-gray-900 truncate">
                    {expediente.alias}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(expediente.estado, expediente.semaforo)}`}>
                    {expediente.estado.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{expediente.codigo}</span>
                  <span>•</span>
                  <span>{expediente.organismo}</span>
                  <span>•</span>
                  <span>{expediente.cliente_nombre}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-sm">
                    {getSemaforoIcon(expediente.semaforo)}
                    <span className={`font-medium ${
                      expediente.dias_restantes < 0 ? 'text-red-600' : 
                      expediente.dias_restantes < 7 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {expediente.dias_restantes < 0 
                        ? `Vencido ${Math.abs(expediente.dias_restantes)}d`
                        : `${expediente.dias_restantes}d restantes`
                      }
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Paso {expediente.paso_actual}/{expediente.total_pasos}
                  </div>
                </div>
                
                <div className="w-16">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        expediente.progreso < 30 ? 'bg-red-500' :
                        expediente.progreso < 70 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${expediente.progreso}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 text-center mt-1">
                    {expediente.progreso}%
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};