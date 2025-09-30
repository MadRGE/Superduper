import React, { useState } from 'react';
import { Plus, Save, LayoutTemplate as Template, Copy, Trash2, ArrowUp, ArrowDown, Settings, User, Clock, FileText, AlertTriangle, CheckCircle, Workflow } from 'lucide-react';

interface ProcessTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: ProcessStepTemplate[];
  estimatedDuration: number;
  complexity: 'simple' | 'medium' | 'complex';
}

interface ProcessStepTemplate {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  requiredDocuments: string[];
  assigneeRole?: string;
  isOptional: boolean;
  dependencies: string[];
  automatable: boolean;
}

interface ProcessCreatorProps {
  onSave: (process: ProcessTemplate) => void;
  onCancel: () => void;
  editingProcess?: ProcessTemplate;
  templates?: ProcessTemplate[];
}

export const ProcessCreator: React.FC<ProcessCreatorProps> = ({
  onSave,
  onCancel,
  editingProcess,
  templates = []
}) => {
  const [currentTab, setCurrentTab] = useState<'basic' | 'steps' | 'settings'>('basic');
  const [process, setProcess] = useState<ProcessTemplate>(
    editingProcess || {
      id: '',
      name: '',
      description: '',
      category: '',
      steps: [],
      estimatedDuration: 0,
      complexity: 'simple'
    }
  );

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [draggedStep, setDraggedStep] = useState<number | null>(null);

  const defaultTemplates: ProcessTemplate[] = [
    {
      id: 'template-1',
      name: 'Registro de Producto Alimentario',
      description: 'Proceso estándar para registro de productos alimentarios ante ANMAT',
      category: 'Alimentario',
      estimatedDuration: 45,
      complexity: 'medium',
      steps: [
        {
          id: 'step-1',
          title: 'Recopilación de Documentación Técnica',
          description: 'Reunir toda la documentación técnica necesaria del producto',
          estimatedHours: 8,
          requiredDocuments: ['Ficha técnica', 'Análisis microbiológicos', 'Análisis nutricional'],
          assigneeRole: 'Technical Specialist',
          isOptional: false,
          dependencies: [],
          automatable: false
        },
        {
          id: 'step-2',
          title: 'Preparación de Formularios',
          description: 'Completar formularios oficiales de ANMAT',
          estimatedHours: 4,
          requiredDocuments: ['Formulario F-A-01', 'Formulario F-A-02'],
          assigneeRole: 'Process Manager',
          isOptional: false,
          dependencies: ['step-1'],
          automatable: true
        }
      ]
    },
    {
      id: 'template-2',
      name: 'Habilitación de Establecimiento',
      description: 'Proceso para habilitar establecimientos alimentarios',
      category: 'Habilitaciones',
      estimatedDuration: 60,
      complexity: 'complex',
      steps: [
        {
          id: 'step-1',
          title: 'Inspección Previa',
          description: 'Realizar inspección preliminar del establecimiento',
          estimatedHours: 6,
          requiredDocuments: ['Planos del establecimiento', 'Certificado de habilitación municipal'],
          assigneeRole: 'Inspector',
          isOptional: false,
          dependencies: [],
          automatable: false
        }
      ]
    }
  ];

  const allTemplates = [...defaultTemplates, ...templates];

  const addStep = () => {
    const newStep: ProcessStepTemplate = {
      id: `step-${Date.now()}`,
      title: 'Nuevo Paso',
      description: '',
      estimatedHours: 1,
      requiredDocuments: [],
      assigneeRole: '',
      isOptional: false,
      dependencies: [],
      automatable: false
    };
    setProcess({
      ...process,
      steps: [...process.steps, newStep]
    });
  };

  const updateStep = (stepId: string, updates: Partial<ProcessStepTemplate>) => {
    setProcess({
      ...process,
      steps: process.steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      )
    });
  };

  const removeStep = (stepId: string) => {
    setProcess({
      ...process,
      steps: process.steps.filter(step => step.id !== stepId)
    });
  };

  const moveStep = (fromIndex: number, toIndex: number) => {
    const newSteps = [...process.steps];
    const [removed] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, removed);
    setProcess({ ...process, steps: newSteps });
  };

  const loadTemplate = () => {
    const template = allTemplates.find(t => t.id === selectedTemplate);
    if (template) {
      setProcess({
        ...template,
        id: '', // Reset ID for new process
        name: `${template.name} - Copia`
      });
    }
  };

  const calculateTotalDuration = () => {
    return process.steps.reduce((total, step) => total + step.estimatedHours, 0);
  };

  const handleSave = () => {
    if (!process.name || process.steps.length === 0) {
      alert('Por favor complete el nombre del proceso y agregue al menos un paso.');
      return;
    }

    const processToSave = {
      ...process,
      id: process.id || `process-${Date.now()}`,
      estimatedDuration: calculateTotalDuration()
    };

    onSave(processToSave);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {editingProcess ? 'Editar Proceso' : 'Crear Nuevo Proceso'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Diseña un proceso personalizado para tu organización
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Proceso
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'basic', label: 'Información Básica', icon: Settings },
          { id: 'steps', label: 'Pasos del Proceso', icon: Workflow },
          { id: 'settings', label: 'Configuración Avanzada', icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id as typeof currentTab)}
            className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              currentTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* Basic Information Tab */}
        {currentTab === 'basic' && (
          <div className="space-y-6">
            {/* Template Selection */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                <Template className="w-4 h-4 mr-2" />
                Comenzar con una Plantilla
              </h3>
              <div className="flex items-center space-x-3">
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar plantilla...</option>
                  {allTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.complexity})
                    </option>
                  ))}
                </select>
                <button
                  onClick={loadTemplate}
                  disabled={!selectedTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cargar Plantilla
                </button>
              </div>
            </div>

            {/* Basic Process Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Proceso *
                </label>
                <input
                  type="text"
                  value={process.name}
                  onChange={(e) => setProcess({ ...process, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Registro de Producto Alimentario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  value={process.category}
                  onChange={(e) => setProcess({ ...process, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar categoría...</option>
                  <option value="Alimentario">Alimentario</option>
                  <option value="Farmacéutico">Farmacéutico</option>
                  <option value="Cosmético">Cosmético</option>
                  <option value="Habilitaciones">Habilitaciones</option>
                  <option value="Legal">Legal</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={process.description}
                  onChange={(e) => setProcess({ ...process, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe el propósito y alcance de este proceso..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Complejidad
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['simple', 'medium', 'complex'] as const).map((complexity) => (
                    <button
                      key={complexity}
                      onClick={() => setProcess({ ...process, complexity })}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        process.complexity === complexity
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {complexity === 'simple' ? 'Simple' :
                       complexity === 'medium' ? 'Intermedio' : 'Complejo'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duración Estimada
                </label>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {calculateTotalDuration()} horas
                  ({Math.ceil(calculateTotalDuration() / 8)} días laborales)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Steps Tab */}
        {currentTab === 'steps' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Pasos del Proceso
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Define los pasos secuenciales que componen este proceso
                </p>
              </div>
              <button
                onClick={addStep}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Paso
              </button>
            </div>

            {process.steps.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Workflow className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No hay pasos definidos
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Agrega el primer paso para comenzar a estructurar tu proceso
                </p>
                <button
                  onClick={addStep}
                  className="flex items-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Paso
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {process.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => updateStep(step.id, { title: e.target.value })}
                          className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100"
                          placeholder="Título del paso..."
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => index > 0 && moveStep(index, index - 1)}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => index < process.steps.length - 1 && moveStep(index, index + 1)}
                          disabled={index === process.steps.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeStep(step.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Descripción
                        </label>
                        <textarea
                          value={step.description}
                          onChange={(e) => updateStep(step.id, { description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Describe qué se debe hacer en este paso..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Horas Estimadas
                        </label>
                        <input
                          type="number"
                          value={step.estimatedHours}
                          onChange={(e) => updateStep(step.id, { estimatedHours: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Rol Asignado
                        </label>
                        <input
                          type="text"
                          value={step.assigneeRole || ''}
                          onChange={(e) => updateStep(step.id, { assigneeRole: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Ej: Técnico especialista"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Documentos Requeridos
                        </label>
                        <input
                          type="text"
                          onChange={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              updateStep(step.id, {
                                requiredDocuments: [...step.requiredDocuments, e.target.value.trim()]
                              });
                              e.target.value = '';
                            }
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              updateStep(step.id, {
                                requiredDocuments: [...step.requiredDocuments, e.target.value.trim()]
                              });
                              e.target.value = '';
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Escribe y presiona Enter para agregar documentos..."
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                          {step.requiredDocuments.map((doc, docIndex) => (
                            <span
                              key={docIndex}
                              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              {doc}
                              <button
                                onClick={() => updateStep(step.id, {
                                  requiredDocuments: step.requiredDocuments.filter((_, i) => i !== docIndex)
                                })}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={step.isOptional}
                              onChange={(e) => updateStep(step.id, { isOptional: e.target.checked })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              Paso opcional
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={step.automatable}
                              onChange={(e) => updateStep(step.id, { automatable: e.target.checked })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              Automatizable
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {currentTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Configuración Avanzada
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Automatización</h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Enviar notificaciones automáticas
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Escalamiento automático por vencimientos
                    </span>
                  </label>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Permisos</h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Requiere aprobación para iniciar
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Permite modificaciones durante ejecución
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};