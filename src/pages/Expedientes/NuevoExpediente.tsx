import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, FileText, User, Upload, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSGT } from '../../context/SGTContext';
import { useNotifications } from '../../components/Notifications/NotificationProvider';
import { TramiteTipo, Cliente, Expediente } from '../../types/database';

interface NewClientData {
  razon_social: string;
  cuit: string;
  email: string;
  telefono: string;
  contacto_nombre: string;
}

export const NuevoExpediente: React.FC = () => {
  const navigate = useNavigate();
  const { state, addExpediente, addCliente } = useSGT();
  const { addNotification } = useNotifications();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTramiteTipo, setSelectedTramiteTipo] = useState<TramiteTipo | null>(null);
  const [clientOption, setClientOption] = useState<'existing' | 'new'>('existing');
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [newClientData, setNewClientData] = useState<NewClientData>({
    razon_social: '',
    cuit: '',
    email: '',
    telefono: '',
    contacto_nombre: ''
  });
  const [loading, setLoading] = useState(false);

  const steps = [
    { number: 1, title: 'Tipo de Trámite', icon: FileText },
    { number: 2, title: 'Cliente', icon: User },
    { number: 3, title: 'Documentación', icon: Upload },
    { number: 4, title: 'Confirmación', icon: Eye }
  ];

  const generateExpedienteCode = (tramiteTipo: TramiteTipo): string => {
    const year = new Date().getFullYear();
    const organismo = state.organismos.find(org => org.id === tramiteTipo.organismo_id);
    const organismoSigla = organismo?.sigla.replace('/', '-') || 'ORG';
    const randomNumber = Math.floor(Math.random() * 99999) + 1;
    const paddedNumber = randomNumber.toString().padStart(5, '0');
    return `SGT-${year}-${organismoSigla}-${paddedNumber}`;
  };

  const calculateFechaLimite = (tramiteTipo: TramiteTipo): Date => {
    const fechaInicio = new Date();
    const fechaLimite = new Date(fechaInicio);
    fechaLimite.setDate(fechaLimite.getDate() + (tramiteTipo.sla_total_dias || 30));
    return fechaLimite;
  };

  const canProceedToNextStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return selectedTramiteTipo !== null;
      case 2:
        if (clientOption === 'existing') {
          return selectedClient !== null;
        } else {
          return newClientData.razon_social.trim() !== '' && 
                 newClientData.cuit.trim() !== '' && 
                 newClientData.email.trim() !== '';
        }
      case 3:
        return true; // Por ahora siempre permitir avanzar desde documentación
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canProceedToNextStep() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirm = async () => {
    if (!selectedTramiteTipo) return;

    setLoading(true);
    try {
      let clienteToUse: Cliente;

      // Crear nuevo cliente si es necesario
      if (clientOption === 'new') {
        const newCliente: Cliente = {
          id: `cliente-${Date.now()}`,
          ...newClientData
        };
        addCliente(newCliente);
        clienteToUse = newCliente;
      } else {
        clienteToUse = selectedClient!;
      }

      // Crear nuevo expediente
      const newExpediente: Expediente = {
        id: `exp-${Date.now()}`,
        codigo: generateExpedienteCode(selectedTramiteTipo),
        alias: `${selectedTramiteTipo.nombre} - ${clienteToUse.razon_social}`,
        tramite_tipo_id: selectedTramiteTipo.id,
        cliente_id: clienteToUse.id,
        estado: 'iniciado',
        prioridad: 'normal',
        fecha_inicio: new Date(),
        fecha_limite: calculateFechaLimite(selectedTramiteTipo),
        paso_actual: 1,
        observaciones: '',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        tramite_tipo: selectedTramiteTipo,
        cliente: clienteToUse
      };

      addExpediente(newExpediente);

      addNotification({
        type: 'success',
        title: 'Expediente creado exitosamente',
        message: `Se creó el expediente ${newExpediente.codigo}`
      });

      navigate(`/expedientes/${newExpediente.id}`);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error al crear expediente',
        message: 'Ocurrió un error inesperado. Intenta nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Selecciona el tipo de trámite</h3>
      <div className="grid grid-cols-1 gap-4">
        {state.tramiteTipos.map((tramite) => {
          const organismo = state.organismos.find(org => org.id === tramite.organismo_id);
          return (
            <div
              key={tramite.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedTramiteTipo?.id === tramite.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTramiteTipo(tramite)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{tramite.nombre}</h4>
                  <p className="text-sm text-gray-600">{tramite.codigo}</p>
                  <p className="text-sm text-gray-500">{organismo?.sigla} • {tramite.rubro}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{tramite.sla_total_dias} días</p>
                  <p className="text-xs text-gray-500">SLA</p>
                </div>
              </div>
              {tramite.alcance && (
                <p className="text-sm text-gray-600 mt-2">{tramite.alcance}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Selecciona o crea un cliente</h3>
      
      {/* Opciones de cliente */}
      <div className="flex space-x-4">
        <button
          onClick={() => setClientOption('existing')}
          className={`px-4 py-2 rounded-lg border ${
            clientOption === 'existing'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Cliente existente
        </button>
        <button
          onClick={() => setClientOption('new')}
          className={`px-4 py-2 rounded-lg border ${
            clientOption === 'new'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Nuevo cliente
        </button>
      </div>

      {clientOption === 'existing' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar cliente
          </label>
          <select
            value={selectedClient?.id || ''}
            onChange={(e) => {
              const cliente = state.clientes.find(c => c.id === e.target.value);
              setSelectedClient(cliente || null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona un cliente...</option>
            {state.clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.razon_social} - {cliente.cuit}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razón Social *
            </label>
            <input
              type="text"
              value={newClientData.razon_social}
              onChange={(e) => setNewClientData({...newClientData, razon_social: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre de la empresa"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CUIT *
            </label>
            <input
              type="text"
              value={newClientData.cuit}
              onChange={(e) => setNewClientData({...newClientData, cuit: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="30-12345678-9"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={newClientData.email}
              onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="contacto@empresa.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={newClientData.telefono}
              onChange={(e) => setNewClientData({...newClientData, telefono: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="+54 11 1234-5678"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Contacto
            </label>
            <input
              type="text"
              value={newClientData.contacto_nombre}
              onChange={(e) => setNewClientData({...newClientData, contacto_nombre: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Juan Pérez"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Documentación inicial requerida</h3>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          📋 Aquí se mostrará la lista de documentos requeridos para el trámite seleccionado.
        </p>
        <p className="text-blue-600 text-xs mt-2">
          El componente de carga de documentos se implementará en la siguiente fase.
        </p>
      </div>
      {selectedTramiteTipo?.entregables && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Documentos requeridos:</h4>
          <ul className="space-y-1">
            {selectedTramiteTipo.entregables.map((doc, index) => (
              <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => {
    const organismo = selectedTramiteTipo ? 
      state.organismos.find(org => org.id === selectedTramiteTipo.organismo_id) : null;
    const clienteToShow = clientOption === 'existing' ? selectedClient : newClientData;

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Resumen del expediente</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información del trámite */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información del Trámite</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Tipo:</span>
                <p className="text-sm text-gray-900">{selectedTramiteTipo?.nombre}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Código:</span>
                <p className="text-sm text-gray-900">{selectedTramiteTipo?.codigo}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Organismo:</span>
                <p className="text-sm text-gray-900">{organismo?.sigla}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">SLA:</span>
                <p className="text-sm text-gray-900">{selectedTramiteTipo?.sla_total_dias} días hábiles</p>
              </div>
            </CardContent>
          </Card>

          {/* Información del cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Razón Social:</span>
                <p className="text-sm text-gray-900">
                  {clientOption === 'existing' ? selectedClient?.razon_social : newClientData.razon_social}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">CUIT:</span>
                <p className="text-sm text-gray-900">
                  {clientOption === 'existing' ? selectedClient?.cuit : newClientData.cuit}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <p className="text-sm text-gray-900">
                  {clientOption === 'existing' ? selectedClient?.email : newClientData.email}
                </p>
              </div>
              {clientOption === 'new' && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  Se creará un nuevo cliente con esta información
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Código que se generará */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Código del expediente que se generará:</p>
              <p className="text-lg font-mono font-bold text-blue-600">
                {selectedTramiteTipo ? generateExpedienteCode(selectedTramiteTipo) : 'SGT-YYYY-ORG-NNNNN'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return null;
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
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.number
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-300 text-gray-400'
              }`}>
                {currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  Paso {step.number}
                </p>
                <p className={`text-xs ${
                  currentStep >= step.number ? 'text-blue-500' : 'text-gray-400'
                }`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 ml-6 ${
                  currentStep > step.number ? 'bg-blue-500' : 'bg-gray-300'
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
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        <div className="text-sm text-gray-500">
          Paso {currentStep} de {steps.length}
        </div>

        {currentStep < 4 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceedToNextStep()}
          >
            Siguiente
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleConfirm}
            disabled={loading || !canProceedToNextStep()}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Creando...' : 'Confirmar Expediente'}
            <Check className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};