import React from 'react';
import { Clock, FileText, CheckCircle, AlertTriangle, User } from 'lucide-react';

const recentActivities = [
  {
    id: 1,
    type: 'documento',
    message: 'Nuevo documento subido',
    expediente: 'SGT-2025-ANMAT-00123',
    user: 'Lácteos del Sur S.A.',
    time: '5 min',
    icon: FileText,
    color: 'blue'
  },
  {
    id: 2,
    type: 'completado',
    message: 'Paso completado: Ensayos de laboratorio',
    expediente: 'SGT-2025-ENACOM-00087',
    user: 'TechCorp Argentina',
    time: '1 hora',
    icon: CheckCircle,
    color: 'green'
  },
  {
    id: 3,
    type: 'observacion',
    message: 'Observación recibida de ANMAT',
    expediente: 'SGT-2025-ANMAT-00134',
    user: 'NutriLife S.A.',
    time: '2 horas',
    icon: AlertTriangle,
    color: 'yellow'
  },
  {
    id: 4,
    type: 'asignacion',
    message: 'Tarea asignada: Revisión cliente',
    expediente: 'SGT-2025-SIC-00156',
    user: 'BeautyTech Imports',
    time: '4 horas',
    icon: User,
    color: 'purple'
  },
  {
    id: 5,
    type: 'documento',
    message: 'Documento aprobado: Manual técnico',
    expediente: 'SGT-2025-ENACOM-00087',
    user: 'TechCorp Argentina',
    time: '6 horas',
    icon: FileText,
    color: 'blue'
  }
];

export const RecentActivity: React.FC = () => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {recentActivities.map((activity) => (
          <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${colorClasses[activity.color]}`}>
                <activity.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.message}
                </p>
                <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                  <span>{activity.expediente}</span>
                  <span>•</span>
                  <span>{activity.user}</span>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {activity.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};