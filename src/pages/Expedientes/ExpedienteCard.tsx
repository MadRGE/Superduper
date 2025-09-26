import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Building, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SemaforoIndicator } from '@/components/expedientes/SemaforoIndicator';
import { EstadoBadge } from '@/components/expedientes/EstadoBadge';
import type { Expediente } from '../../types/database';
import { useSGT } from '../../context/SGTContext';

interface ExpedienteCardProps {
  expediente: Expediente;
  view?: 'grid' | 'list';
}

export const ExpedienteCard: React.FC<ExpedienteCardProps> = ({ 
  expediente, 
  view = 'grid' 
}) => {
  const { state } = useSGT();
  
  const diasRestantes = Math.ceil(
    (new Date(expediente.fecha_limite).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'bg-red-100 text-red-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'baja': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get organismo name from state.organismos using tramite_tipo_id
  const getOrganismoName = () => {
    if (expediente.organismo) return expediente.organismo; // Fallback to direct property
    const tramiteTipo = state.tramiteTipos.find(tt => tt.id === expediente.tramite_tipo_id);
    if (tramiteTipo?.organismo_id) {
      const organismo = state.organismos.find(org => org.id === tramiteTipo.organismo_id);
      return organismo?.sigla || 'N/A';
    }
    return 'N/A';
  };

  if (view === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <SemaforoIndicator diasRestantes={diasRestantes} size="sm" />
              <div className="flex-1">
                <Link 
                  to={`/expedientes/${expediente.id}`}
                  className="font-semibold text-gray-900 hover:text-blue-600"
                >
                  {expediente.codigo}
                </Link>
                {expediente.alias && (
                  <p className="text-sm text-gray-600">{expediente.alias}</p>
                )}
              </div>
              <div className="text-sm text-gray-600">
                <p>{expediente.cliente?.razon_social}</p>
              </div>
              <div className="text-sm text-gray-600">
                <p>{expediente.tramite_nombre || expediente.tramite_tipo?.nombre}</p>
              </div>
              <EstadoBadge estado={expediente.estado} />
              <Badge className={getPriorityColor(expediente.prioridad)}>
                {expediente.prioridad}
              </Badge>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>{new Date(expediente.fecha_limite).toLocaleDateString('es-AR')}</p>
              <p className={diasRestantes < 0 ? 'text-red-600 font-medium' : ''}>
                {diasRestantes < 0 ? `${Math.abs(diasRestantes)} días vencido` : `${diasRestantes} días`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <SemaforoIndicator diasRestantes={diasRestantes} />
            <div>
              <Link 
                to={`/expedientes/${expediente.id}`}
                className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
              >
                {expediente.codigo}
              </Link>
              {expediente.alias && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{expediente.alias}</p>
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p className="dark:text-gray-200">{expediente.cliente?.razon_social}</p>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <User className="w-4 h-4 mr-2" />
            <span className="dark:text-gray-200">{expediente.cliente?.razon_social}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Building className="w-4 h-4 mr-2" />
            <span className="dark:text-gray-200">{getOrganismoName()}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <p className="dark:text-gray-200">{expediente.tramite_nombre || expediente.tramite_tipo?.nombre}</p>
              <span className="dark:text-gray-200">{new Date(expediente.fecha_limite).toLocaleDateString('es-AR')}</span>
            </div>
            <Badge className={getPriorityColor(expediente.prioridad)}>
              {expediente.prioridad}
            </Badge>
          </div>
          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
            <p className="dark:text-gray-300">{new Date(expediente.fecha_limite).toLocaleDateString('es-AR')}</p>
            <p className={diasRestantes < 0 ? 'text-red-600 dark:text-red-400 font-medium' : 'dark:text-gray-300'}>
              <Clock className="w-4 h-4 mr-1" />
              <span className={diasRestantes < 0 ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-300'}>
                {diasRestantes < 0 ? `${Math.abs(diasRestantes)} días vencido` : `${diasRestantes} días restantes`}
              </span>
            </div>
            {diasRestantes <= 3 && diasRestantes >= 0 && (
              <AlertCircle className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
            )}
            {diasRestantes < 0 && (
              <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};