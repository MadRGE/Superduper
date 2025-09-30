import React, { useState } from 'react';
import { Play, Pause, CheckCircle, AlertCircle, Clock, User, FileText, MessageSquare, ArrowRight, MoreHorizontal, CreditCard as Edit3, Trash2, Copy } from 'lucide-react';

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped';
  assignedTo?: string;
  estimatedHours: number;
  actualHours?: number;
  dueDate?: string;
  dependencies?: string[];
  documents: string[];
  comments: number;
}

interface ProcessWorkflowProps {
  expedienteId: string;
  steps: ProcessStep[];
  onStepUpdate: (stepId: string, updates: Partial<ProcessStep>) => void;
  onProcessAction: (action: 'start' | 'pause' | 'complete' | 'cancel') => void;
}

export const ProcessWorkflow: React.FC<ProcessWorkflowProps> = ({
  expedienteId,
  steps,
  onStepUpdate,
  onProcessAction
}) => {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status: ProcessStep['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 border-green-200';
      case 'in_progress': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'blocked': return 'text-red-600 bg-red-100 border-red-200';
      case 'skipped': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    }
  };

  const getStatusIcon = (status: ProcessStep['status']) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Play;
      case 'blocked': return AlertCircle;
      case 'skipped': return ArrowRight;
      default: return Clock;
    }
  };

  const currentStep = steps.find(step => step.status === 'in_progress') || steps[0];
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Process Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Flujo de Proceso - {expedienteId}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {completedSteps} de {steps.length} pasos completados
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-3 py-2 text-gray-600 hover:text-gray-900 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {showDetails ? 'Vista Simple' : 'Vista Detallada'}
            </button>
            <div className="relative">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progreso</span>
            <span className="text-sm text-gray-500">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onProcessAction('start')}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Play className="w-4 h-4 mr-2" />
            Iniciar
          </button>
          <button
            onClick={() => onProcessAction('pause')}
            className="flex items-center px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
          >
            <Pause className="w-4 h-4 mr-2" />
            Pausar
          </button>
          <button
            onClick={() => onProcessAction('complete')}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Completar
          </button>
        </div>
      </div>

      {/* Process Steps */}
      <div className="p-6">
        <div className="space-y-4">
          {steps.map((step, index) => {
            const StatusIcon = getStatusIcon(step.status);
            const isSelected = selectedStep === step.id;

            return (
              <div
                key={step.id}
                className={`border rounded-lg transition-all cursor-pointer ${
                  isSelected ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
                }`}
                onClick={() => setSelectedStep(isSelected ? null : step.id)}
              >
                {/* Step Header */}
                <div className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* Step Number & Status */}
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border ${getStatusColor(step.status)}`}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <StatusIcon className={`w-5 h-5 ${getStatusColor(step.status).split(' ')[0]}`} />
                    </div>

                    {/* Step Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {step.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {step.assignedTo && (
                            <div className="flex items-center text-sm text-gray-500">
                              <User className="w-4 h-4 mr-1" />
                              {step.assignedTo}
                            </div>
                          )}
                          {step.dueDate && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(step.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                        {step.description}
                      </p>

                      {/* Progress Indicators */}
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <FileText className="w-3 h-3 mr-1" />
                          {step.documents.length} documentos
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          {step.comments} comentarios
                        </div>
                        <div className="text-xs text-gray-500">
                          {step.estimatedHours}h estimadas
                          {step.actualHours && ` / ${step.actualHours}h reales`}
                        </div>
                      </div>
                    </div>

                    {/* Step Actions */}
                    <div className="flex items-center space-x-1">
                      <button
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Edit step logic
                        }}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Duplicate step logic
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Delete step logic
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isSelected && showDetails && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Dependencies */}
                      {step.dependencies && step.dependencies.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Dependencias</h4>
                          <ul className="space-y-1">
                            {step.dependencies.map((dep, i) => (
                              <li key={i} className="text-sm text-gray-600 dark:text-gray-300">
                                • {dep}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Documents */}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Documentos</h4>
                        <div className="space-y-1">
                          {step.documents.map((doc, i) => (
                            <div key={i} className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                              <FileText className="w-4 h-4 mr-2" />
                              {doc}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons for Selected Step */}
                    <div className="mt-4 flex items-center space-x-2">
                      {step.status === 'pending' && (
                        <button
                          onClick={() => onStepUpdate(step.id, { status: 'in_progress' })}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Iniciar Paso
                        </button>
                      )}
                      {step.status === 'in_progress' && (
                        <>
                          <button
                            onClick={() => onStepUpdate(step.id, { status: 'completed' })}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            Completar
                          </button>
                          <button
                            onClick={() => onStepUpdate(step.id, { status: 'blocked' })}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            Marcar Bloqueado
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onStepUpdate(step.id, { status: 'skipped' })}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                      >
                        Saltar Paso
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};