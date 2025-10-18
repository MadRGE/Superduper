import React from 'react';
import { FileText, Clock, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useSGT } from '../../context/SGTContext';

export const ResumenCompacto: React.FC = () => {
  const { state } = useSGT();

  const stats = {
    vencidos: state.expedientes.filter(e => e.estado === 'vencido').length,
    observados: state.expedientes.filter(e => e.estado === 'observado').length,
    urgentes: state.expedientes.filter(e => e.dias_restantes < 3 && e.estado !== 'vencido' && e.estado !== 'observado').length,
    enProceso: state.expedientes.filter(e => e.estado === 'en_proceso').length,
    completadosHoy: state.expedientes.filter(e =>
      e.fecha_completado && new Date(e.fecha_completado).toDateString() === new Date().toDateString()
    ).length,
    total: state.expedientes.length
  };

  const cards = [
    {
      label: 'Vencidos',
      value: stats.vencidos,
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      urgent: true
    },
    {
      label: 'Observados',
      value: stats.observados,
      icon: Eye,
      color: 'yellow',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      urgent: true
    },
    {
      label: 'Urgentes (<3 días)',
      value: stats.urgentes,
      icon: AlertTriangle,
      color: 'orange',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      urgent: true
    },
    {
      label: 'En Proceso',
      value: stats.enProceso,
      icon: Clock,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      urgent: false
    },
    {
      label: 'Completados Hoy',
      value: stats.completadosHoy,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      urgent: false
    },
    {
      label: 'Total Activos',
      value: stats.total,
      icon: FileText,
      color: 'gray',
      bgColor: 'bg-gray-50 dark:bg-gray-800',
      textColor: 'text-gray-600 dark:text-gray-400',
      iconBg: 'bg-gray-100 dark:bg-gray-700',
      urgent: false
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bgColor} rounded-lg p-4 border-2 ${
            card.urgent ? `border-${card.color}-300 dark:border-${card.color}-700` : 'border-transparent'
          } hover:shadow-md transition-all ${card.urgent && card.value > 0 ? 'ring-2 ring-' + card.color + '-400 ring-offset-2' : ''}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`${card.iconBg} p-2 rounded-lg`}>
              <card.icon className={`w-5 h-5 ${card.textColor}`} />
            </div>
            {card.urgent && card.value > 0 && (
              <div className={`${card.textColor} text-xs font-bold uppercase animate-pulse`}>
                ¡Atención!
              </div>
            )}
          </div>
          <div>
            <div className={`text-3xl font-bold ${card.textColor} mb-1`}>
              {card.value}
            </div>
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {card.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
