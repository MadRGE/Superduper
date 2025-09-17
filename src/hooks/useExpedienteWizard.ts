import { useState } from 'react';
import { ExpedienteFormData } from '../services/ExpedienteService';

interface WizardErrors {
  [key: string]: string;
}

export const useExpedienteWizard = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ExpedienteFormData>({
    tramite_tipo_id: '',
    cliente_id: '',
    alias: '',
    prioridad: 'normal',
    despachante_id: '',
    observaciones: '',
    documentos: []
  });
  const [errors, setErrors] = useState<WizardErrors>({});
  const [loading, setLoading] = useState(false);

  // Actualizar datos del formulario
  const updateData = (newData: Partial<ExpedienteFormData>) => {
    setData(prev => ({ ...prev, ...newData }));
    // Limpiar errores relacionados
    const newErrors = { ...errors };
    Object.keys(newData).forEach(key => {
      delete newErrors[key];
    });
    setErrors(newErrors);
  };

  // Validar paso actual
  const validateStep = (stepNumber: number): boolean => {
    const newErrors: WizardErrors = {};

    switch (stepNumber) {
      case 1:
        if (!data.tramite_tipo_id) {
          newErrors.tramite_tipo_id = 'Debe seleccionar un tipo de trámite';
        }
        break;

      case 2:
        if (!data.cliente_id) {
          newErrors.cliente_id = 'Debe seleccionar o crear un cliente';
        }
        if (!data.alias || data.alias.trim().length < 3) {
          newErrors.alias = 'El alias debe tener al menos 3 caracteres';
        }
        break;

      case 3:
        // Validación de documentos - por ahora opcional
        break;

      case 4:
        // Validación final - verificar que todos los pasos anteriores estén completos
        if (!data.tramite_tipo_id || !data.cliente_id || !data.alias) {
          newErrors.general = 'Faltan datos obligatorios en pasos anteriores';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Avanzar al siguiente paso
  const nextStep = () => {
    if (validateStep(step) && step < 4) {
      setStep(step + 1);
      return true;
    }
    return false;
  };

  // Retroceder al paso anterior
  const previousStep = () => {
    if (step > 1) {
      setStep(step - 1);
      return true;
    }
    return false;
  };

  // Ir a un paso específico
  const goToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= 4) {
      setStep(stepNumber);
    }
  };

  // Resetear wizard
  const reset = () => {
    setStep(1);
    setData({
      tramite_tipo_id: '',
      cliente_id: '',
      alias: '',
      prioridad: 'normal',
      despachante_id: '',
      observaciones: '',
      documentos: []
    });
    setErrors({});
    setLoading(false);
  };

  // Verificar si un paso está completo
  const isStepComplete = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!data.tramite_tipo_id;
      case 2:
        return !!(data.cliente_id && data.alias && data.alias.trim().length >= 3);
      case 3:
        return true; // Por ahora siempre completo
      case 4:
        return !!(data.tramite_tipo_id && data.cliente_id && data.alias);
      default:
        return false;
    }
  };

  // Verificar si se puede avanzar desde el paso actual
  const canProceed = (): boolean => {
    return validateStep(step);
  };

  return {
    // Estado
    step,
    data,
    errors,
    loading,
    
    // Acciones
    setStep,
    setData: updateData,
    setErrors,
    setLoading,
    
    // Navegación
    nextStep,
    previousStep,
    goToStep,
    
    // Validación
    validateStep,
    isStepComplete,
    canProceed,
    
    // Utilidades
    reset
  };
};