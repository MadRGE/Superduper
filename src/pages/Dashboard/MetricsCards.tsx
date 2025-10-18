import React from 'react';
import { 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Timer
} from 'lucide-react';
import { useSGT } from '../../context/SGTContext';

export const MetricsCards: React.FC = () => {
  const { state } = useSGT();
  
  const totalExpedientes = state.expedientes.length;
  const enProceso = state.expedientes.filter(e => e.estado === 'en_proceso').length;
  const vencidos = state.expedientes.filter(e => e.estado === 'vencido').length;
  const completados = state.expedientes.filter(e => e.estado === 'completado').length;
  const observados = state.expedientes.filter(e => e.estado === 'observado').length;
  
  const tiempoPromedio = Math.round(
    state.expedientes
      .filter(e => e.estado === 'completado')
      .reduce((acc, e) => acc + (e.paso_actual * 5), 0) / completados || 0
  );

  const metrics = [
    {
      title: 'Total Expedientes',
      value: totalExpedientes.toString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'En Proceso',
      value: enProceso.toString(),
      change: '+8%',
      changeType: 'positive' as const,
      icon: Clock,
      color: 'orange'
    },
    {
      title: 'Vencidos',
      value: vencidos.toString(),
      change: '-23%',
      changeType: 'negative' as const,
      icon: AlertTriangle,
      color: 'red'
    },
    {
      title: 'Completados',
      value: completados.toString(),
      change: '+15%',
      changeType: 'positive' as const,
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Observados',
      value: observados.toString(),
      change: '-5%',
      changeType: 'negative' as const,
      icon: TrendingUp,
      color: 'yellow'
    },
    {
      title: 'Tiempo Promedio',
      value: `${tiempoPromedio}d`,
      change: '-8%',
      changeType: 'negative' as const,
      icon: Timer,
      color: 'purple'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-teal-50 text-teal-600'
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
      {metrics.map((metric) => (
        <div key={metric.title} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col min-h-[160px] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-lg ${colorClasses[metric.color]}`}>
              <metric.icon className="w-6 h-6" />
            </div>
            <div className={`text-sm font-medium ${
              metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {metric.change}
            </div>
          </div>
          <div className="mt-4 flex-1 flex flex-col justify-end">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.title}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{metric.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};