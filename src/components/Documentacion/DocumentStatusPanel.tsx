import React from 'react';
import { CheckCircle, AlertCircle, Clock, FileText, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DocumentStatus {
  total: number;
  obligatorios: number;
  pendientes: number;
  aprobados: number;
  rechazados: number;
  revision: number;
  vencidos: number;
}

interface DocumentStatusPanelProps {
  expedienteId: string;
  documentos: any[];
  showDetails?: boolean;
}

export const DocumentStatusPanel: React.FC<DocumentStatusPanelProps> = ({
  expedienteId,
  documentos,
  showDetails = true
}) => {
  const calculateStatus = (): DocumentStatus => {
    const obligatorios = documentos.filter(d => d.obligatorio || d.es_obligatorio);

    return {
      total: documentos.length,
      obligatorios: obligatorios.length,
      pendientes: documentos.filter(d => d.estado === 'pendiente').length,
      aprobados: documentos.filter(d => d.estado === 'aprobado').length,
      rechazados: documentos.filter(d => d.estado === 'rechazado').length,
      revision: documentos.filter(d => d.estado === 'revision').length,
      vencidos: documentos.filter(d => {
        if (!d.fecha_vencimiento) return false;
        return new Date(d.fecha_vencimiento) < new Date();
      }).length
    };
  };

  const status = calculateStatus();

  const calculateProgress = (): number => {
    if (status.obligatorios === 0) return 100;
    const completados = documentos.filter(d =>
      (d.obligatorio || d.es_obligatorio) && d.estado === 'aprobado'
    ).length;
    return Math.round((completados / status.obligatorios) * 100);
  };

  const progress = calculateProgress();

  const getProgressColor = () => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusColor = () => {
    if (progress === 100) return 'text-green-600 dark:text-green-400';
    if (progress >= 70) return 'text-blue-600 dark:text-blue-400';
    if (progress >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusText = () => {
    if (progress === 100) return 'Completo';
    if (progress >= 70) return 'Casi completo';
    if (progress >= 40) return 'En progreso';
    return 'Requiere atención';
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2 dark:text-gray-100">
            <FileText className="w-5 h-5" />
            <span>Estado de Documentación</span>
          </span>
          <Badge
            variant={progress === 100 ? 'default' : 'secondary'}
            className={progress === 100 ? 'bg-green-500' : ''}
          >
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Progreso documentación obligatoria
            </span>
            <span className={`text-2xl font-bold ${getStatusColor()}`}>
              {progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{status.aprobados} aprobados de {status.obligatorios} obligatorios</span>
            <span>{status.obligatorios - status.aprobados} pendientes</span>
          </div>
        </div>

        {/* Status Grid */}
        {showDetails && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Total Documents */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Total</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{status.total}</p>
            </div>

            {/* Pending */}
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-xs text-yellow-700 dark:text-yellow-300">Pendientes</span>
              </div>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{status.pendientes}</p>
            </div>

            {/* Approved */}
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs text-green-700 dark:text-green-300">Aprobados</span>
              </div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{status.aprobados}</p>
            </div>

            {/* In Review */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-blue-700 dark:text-blue-300">En revisión</span>
              </div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{status.revision}</p>
            </div>
          </div>
        )}

        {/* Alerts */}
        {status.rechazados > 0 && (
          <div className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-300">
                {status.rechazados} documento{status.rechazados > 1 ? 's' : ''} rechazado{status.rechazados > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                Revise los comentarios y vuelva a subir los documentos corregidos
              </p>
            </div>
          </div>
        )}

        {status.vencidos > 0 && (
          <div className="flex items-start space-x-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-orange-900 dark:text-orange-300">
                {status.vencidos} documento{status.vencidos > 1 ? 's' : ''} vencido{status.vencidos > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                Actualice los documentos vencidos para mantener el expediente vigente
              </p>
            </div>
          </div>
        )}

        {progress === 100 && (
          <div className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-300">
                Documentación completa
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Todos los documentos obligatorios han sido aprobados
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
