import React from 'react';
import { X, Building2, Clock, DollarSign, FileText, Tag, AlertCircle, CheckCircle, Calendar, User } from 'lucide-react';

interface TramiteDetailModalProps {
  tramite: any;
  isOpen: boolean;
  onClose: () => void;
  onIniciarTramite?: (tramite: any) => void;
}

export const TramiteDetailModal: React.FC<TramiteDetailModalProps> = ({
  tramite,
  isOpen,
  onClose,
  onIniciarTramite
}) => {
  if (!isOpen || !tramite) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-start justify-between z-10">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                  {tramite.codigo}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  {tramite.rubro}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {tramite.nombre}
              </h2>
              {tramite.alcance && (
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {tramite.alcance}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tiempo Estimado */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Tiempo Estimado</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {tramite.sla_total_dias || tramite.sla_dias || 'N/A'}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">días hábiles</p>
              </div>

              {/* Costo */}
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">Arancel</h3>
                </div>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {tramite.arancel || 'Sin costo'}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">estimado</p>
              </div>

              {/* Organismo */}
              <div className="bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                    <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Organismo</h3>
                </div>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {tramite.organismo_id || tramite.rubro}
                </p>
                {tramite.sistema && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sistema: {tramite.sistema}</p>
                )}
              </div>
            </div>

            {/* Descripción */}
            {tramite.descripcion && (
              <div className="bg-white dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                  Descripción del Trámite
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {tramite.descripcion}
                </p>
              </div>
            )}

            {/* Documentación Requerida */}
            {tramite.documentacion_requerida && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Documentación Requerida
                </h3>
                <div className="space-y-2">
                  {Array.isArray(tramite.documentacion_requerida) ? (
                    tramite.documentacion_requerida.map((doc, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className="mt-1 w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0" />
                        <p className="text-sm text-blue-900 dark:text-blue-200">{doc}</p>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start space-x-3">
                      <div className="mt-1 w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0" />
                      <p className="text-sm text-blue-900 dark:text-blue-200">{tramite.documentacion_requerida}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pasos del Trámite */}
            {tramite.pasos && tramite.pasos.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Pasos del Proceso
                </h3>
                <ol className="space-y-3">
                  {tramite.pasos.map((paso, idx) => (
                    <li key={idx} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                          {typeof paso === 'string' ? paso : paso.nombre}
                        </p>
                        {typeof paso === 'object' && paso.descripcion && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{paso.descripcion}</p>
                        )}
                        {typeof paso === 'object' && paso.sla_dias && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            ⏱️ {paso.sla_dias} días hábiles
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Observaciones */}
            {tramite.observaciones && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Observaciones Importantes
                </h3>
                <p className="text-yellow-900 dark:text-yellow-200">
                  {tramite.observaciones}
                </p>
              </div>
            )}

            {/* Requisitos */}
            {tramite.requisitos && tramite.requisitos.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Requisitos Previos
                </h3>
                <ul className="space-y-2">
                  {tramite.requisitos.map((req, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700 dark:text-gray-300">{req}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {tramite.tags && tramite.tags.length > 0 && (
              <div className="flex items-center space-x-2 flex-wrap">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Etiquetas:</span>
                {tramite.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                if (onIniciarTramite) {
                  onIniciarTramite(tramite);
                }
              }}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              Iniciar Trámite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
