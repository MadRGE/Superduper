import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, FileText, User, Upload, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSGT } from '../../context/SGTContext';
import { useNotifications } from '../../components/Notifications/NotificationProvider';
import { useExpedienteWizard } from '../../hooks/useExpedienteWizard';
import { expedienteService } from '../../services/ExpedienteService';
import { Step1TipoTramite } from '../../components/expedientes/WizardSteps/Step1TipoTramite';
import { Step2Cliente } from '../../components/expedientes/WizardSteps/Step2Cliente';
import { Step3Documentos } from '../../components/expedientes/WizardSteps/Step3Documentos';
import { Step4Confirmacion } from '../../components/expedientes/WizardSteps/Step4Confirmacion';

export const NuevoExpediente: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useSGT();
  const { addNotification } = useNotifications();
  const {
    step,
    data,
    errors,
    loading,
    setData,
    setLoading,
    nextStep,
    previousStep,
    canProceed,
    isStepComplete
  } = useExpedienteWizard();

  const steps = [
    { number: 1, title: 'Tipo de Trámite', icon: FileText },
    { number: 2, title: 'Cliente', icon: User },
    { number: 3, title: 'Documentación', icon: Upload },
    { number: 4, title: 'Confirmación', icon: Eye }
  ];

  const handleConfirm = async () => {
    if (!data.tramite_tipo_id || !data.cliente_id) {
      addNotification({
        type: 'error',
        title: 'Error de validación',
        message: 'Faltan datos obligatorios para crear el expediente'
      });
      return;
    }

    setLoading(true);
    try {
      const tramiteTipo = state.tramiteTipos.find(t => t.id === data.tramite_tipo_id);
      const cliente = state.clientes.find(c => c.id === data.cliente_id);
      const organismo = tramiteTipo ? state.organismos.find(o => o.id === tramiteTipo.organismo_id) : null;

      if (!tramiteTipo || !cliente || !organismo) {
        throw new Error('No se encontraron los datos necesarios');
      }

      // Crear expediente usando el servicio
      const nuevoExpediente = await expedienteService.crearExpediente(
        data,
        tramiteTipo,
        organismo,
        cliente
      );

      addNotification({
        type: 'success',
        title: 'Expediente creado exitosamente',
        message: `Se creó el expediente ${nuevoExpediente.codigo}`
      });

      // Redirigir al expediente creado
      navigate(`/expedientes/${nuevoExpediente.id}`);
    } catch (error) {
      console.error('Error al crear expediente:', error);
      addNotification({
        type: 'error',
        title: 'Error al crear expediente',
        message: 'Ocurrió un error inesperado. Intenta nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1TipoTramite
            selectedTramiteId={data.tramite_tipo_id}
            onSelect={(tramiteId) => setData({ tramite_tipo_id: tramiteId })}
          />
        );
      case 2:
        return (
          <Step2Cliente
            selectedClienteId={data.cliente_id}
            alias={data.alias}
            prioridad={data.prioridad}
            despachante_id={data.despachante_id}
            observaciones={data.observaciones}
            onUpdate={(updateData) => setData(updateData)}
          />
        );
      case 3:
        return (
          <Step3Documentos
            tramiteTipoId={data.tramite_tipo_id}
            documentos={data.documentos}
            onDocumentosChange={(documentos) => setData({ documentos })}
          />
        );
      case 4:
        return (
          <Step4Confirmacion
            tramiteTipoId={data.tramite_tipo_id}
            clienteId={data.cliente_id}
            alias={data.alias}
            prioridad={data.prioridad}
            observaciones={data.observaciones}
            documentos={data.documentos}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/expedientes')}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Expediente</h1>
          <p className="text-gray-600">Crear un nuevo expediente paso a paso</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {steps.map((stepItem, index) => (
            <div key={stepItem.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step >= stepItem.number
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-300 text-gray-400'
              }`}>
                {step > stepItem.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <stepItem.icon className="w-5 h-5" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  step >= stepItem.number ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  Paso {stepItem.number}
                </p>
                <p className={`text-xs ${
                  step >= stepItem.number ? 'text-blue-500' : 'text-gray-400'
                }`}>
                  {stepItem.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 ml-6 ${
                  step > stepItem.number ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderCurrentStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={previousStep}
          disabled={step === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        <div className="text-sm text-gray-500">
          Paso {step} de {steps.length}
        </div>

        {step < 4 ? (
          <Button
            onClick={nextStep}
            disabled={!canProceed()}
          >
            Siguiente
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleConfirm}
            disabled={loading || !canProceed()}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Creando...' : 'Crear Expediente'}
            <Check className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Errores */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2">Errores de validación:</h4>
          <ul className="text-sm text-red-800 space-y-1">
            {Object.values(errors).map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};