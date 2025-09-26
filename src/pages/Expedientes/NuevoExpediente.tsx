import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Save, FileText, User, Upload, CheckCircle, Building2, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSGT } from '../../context/SGTContext';
import { ExpedienteService } from '../../services/ExpedienteService';
import { DocumentacionTramite } from '@/components/DocumentacionTramite';

export const NuevoExpediente: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state } = useSGT();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    tramite_tipo_id: '',
    tramite_tipo: null,
    cliente_id: '',
    cliente: null,
    alias: '',
    prioridad: 'normal',
    despachante_id: '',
    observaciones: '',
    documentos: [],
    nuevo_cliente: false,
    cliente_data: {
      razon_social: '',
      cuit: '',
      email: '',
      telefono: '',
      contacto_nombre: ''
    }
  });

  const steps = [
    { id: 1, name: 'Tipo de Trámite', icon: FileText },
    { id: 2, name: 'Datos del Cliente', icon: User },
    { id: 3, name: 'Documentación', icon: Upload },
    { id: 4, name: 'Confirmación', icon: CheckCircle }
  ];

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.tramite_tipo_id) {
          toast({
            title: "Error",
            description: "Debe seleccionar un tipo de trámite",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 2:
        if (!formData.cliente_id && !formData.nuevo_cliente) {
          toast({
            title: "Error",
            description: "Debe seleccionar o crear un cliente",
            variant: "destructive"
          });
          return false;
        }
        if (formData.nuevo_cliente) {
          const { razon_social, cuit, email } = formData.cliente_data;
          if (!razon_social || !cuit || !email) {
            toast({
              title: "Error",
              description: "Complete los datos obligatorios del cliente",
              variant: "destructive"
            });
            return false;
          }
        }
        return true;
      case 3:
        // Validar documentos obligatorios
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const expedienteService = new ExpedienteService();
      
      // Si es cliente nuevo, crearlo primero
      let clienteId = formData.cliente_id;
      if (formData.nuevo_cliente) {
        const nuevoCliente = await expedienteService.crearCliente(formData.cliente_data);
        clienteId = nuevoCliente.id;
      }

      // Crear expediente
      const expediente = await expedienteService.crearExpediente({
        tramite_tipo_id: formData.tramite_tipo_id,
        cliente_id: clienteId,
        alias: formData.alias || `${formData.tramite_tipo?.nombre} - ${formData.cliente?.razon_social || formData.cliente_data.razon_social}`,
        prioridad: formData.prioridad,
        observaciones: formData.observaciones,
        documentos: formData.documentos
      });

      toast({
        title: "Expediente creado",
        description: `Se creó el expediente ${expediente.codigo} exitosamente`,
      });

      navigate(`/expedientes/${expediente.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el expediente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nuevo Expediente</h1>
        <p className="text-gray-600 dark:text-gray-200">Complete los pasos para crear un nuevo expediente</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
              ${currentStep >= step.id 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'bg-white border-gray-300 text-gray-500'}`}>
              <step.icon className="w-5 h-5" />
            </div>
            <div className="ml-2">
              <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                {step.name}
              </p>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-6">
          {currentStep === 1 && <Step1TipoTramite formData={formData} setFormData={setFormData} />}
          {currentStep === 2 && <Step2Cliente formData={formData} setFormData={setFormData} />}
          {currentStep === 3 && <Step3Documentos formData={formData} setFormData={setFormData} />}
          {currentStep === 4 && <Step4Confirmacion formData={formData} />}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? () => navigate('/expedientes') : handleBack}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {currentStep === 1 ? 'Cancelar' : 'Anterior'}
        </Button>

        {currentStep < 4 ? (
          <Button onClick={handleNext}>
            Siguiente
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creando...' : 'Crear Expediente'}
            <Save className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

// Step 1: Tipo de Trámite
const Step1TipoTramite: React.FC<{ formData: any; setFormData: any }> = ({ formData, setFormData }) => {
  const { state } = useSGT();
  const [selectedOrganismo, setSelectedOrganismo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTramites = state.tramiteTipos.filter(tramite => {
    if (selectedOrganismo && tramite.organismo_id !== selectedOrganismo) return false;
    if (searchTerm && !tramite.nombre.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Seleccione el tipo de trámite</h2>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Organismo</label>
          <select
            value={selectedOrganismo}
            onChange={(e) => setSelectedOrganismo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Todos los organismos</option>
            {state.organismos.map(org => (
              <option key={org.id} value={org.id}>{org.sigla} - {org.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Buscar</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-300"
          />
        </div>
      </div>

      {/* Tramite Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredTramites.map(tramite => (
          <Card 
            key={tramite.id}
            className={`cursor-pointer transition-all dark:bg-gray-800 dark:border-gray-700 ${
              formData.tramite_tipo_id === tramite.id 
                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setFormData({ 
              ...formData, 
              tramite_tipo_id: tramite.id,
              tramite_tipo: tramite 
            })}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{tramite.nombre}</h3>
                {formData.tramite_tipo_id === tramite.id && (
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{tramite.codigo}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-1" />
                  <span className="dark:text-gray-300">{state.organismos.find(o => o.id === tramite.organismo_id)?.sigla}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className="dark:text-gray-300">{tramite.sla_total_dias} días</span>
                </div>
              </div>
              {tramite.tags && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {tramite.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Step 2: Cliente
const Step2Cliente: React.FC<{ formData: any; setFormData: any }> = ({ formData, setFormData }) => {
  const { state } = useSGT();
  const { toast } = useToast();
  const [searchCuit, setSearchCuit] = useState('');

  const handleSearchCliente = () => {
    const cliente = state.clientes.find(c => c.cuit === searchCuit);
    if (cliente) {
      setFormData({ 
        ...formData, 
        cliente_id: cliente.id,
        cliente: cliente,
        nuevo_cliente: false 
      });
      toast({
        title: "Cliente encontrado",
        description: cliente.razon_social,
      });
    } else {
      toast({
        title: "Cliente no encontrado",
        description: "Puede crear un nuevo cliente",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Datos del Cliente</h2>

      {/* Buscar cliente existente */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Buscar cliente existente</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchCuit}
            onChange={(e) => setSearchCuit(e.target.value)}
            placeholder="Ingrese CUIT (XX-XXXXXXXX-X)"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-300"
          />
          <Button onClick={handleSearchCliente}>Buscar</Button>
        </div>
      </div>

      {formData.cliente && !formData.nuevo_cliente && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <h3 className="font-medium text-green-900 dark:text-green-300">Cliente seleccionado:</h3>
          <p className="text-green-700 dark:text-green-200">{formData.cliente.razon_social}</p>
          <p className="text-sm text-green-600 dark:text-green-300">CUIT: {formData.cliente.cuit}</p>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="nuevo_cliente"
          checked={formData.nuevo_cliente}
          onChange={(e) => setFormData({ ...formData, nuevo_cliente: e.target.checked })}
        />
        <label htmlFor="nuevo_cliente" className="font-medium text-gray-900 dark:text-gray-100">
          Crear nuevo cliente
        </label>
      </div>

      {formData.nuevo_cliente && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Razón Social *
            </label>
            <input
              type="text"
              value={formData.cliente_data.razon_social}
              onChange={(e) => setFormData({
                ...formData,
                cliente_data: { ...formData.cliente_data, razon_social: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              CUIT *
            </label>
            <input
              type="text"
              value={formData.cliente_data.cuit}
              onChange={(e) => setFormData({
                ...formData,
                cliente_data: { ...formData.cliente_data, cuit: e.target.value }
              })}
              placeholder="XX-XXXXXXXX-X"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.cliente_data.email}
              onChange={(e) => setFormData({
                ...formData,
                cliente_data: { ...formData.cliente_data, email: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.cliente_data.telefono}
              onChange={(e) => setFormData({
                ...formData,
                cliente_data: { ...formData.cliente_data, telefono: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Contacto
            </label>
            <input
              type="text"
              value={formData.cliente_data.contacto_nombre}
              onChange={(e) => setFormData({
                ...formData,
                cliente_data: { ...formData.cliente_data, contacto_nombre: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      )}

      {/* Prioridad */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Prioridad</label>
        <select
          value={formData.prioridad}
          onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="baja">Baja</option>
          <option value="normal">Normal</option>
          <option value="alta">Alta</option>
          <option value="urgente">Urgente</option>
        </select>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Observaciones iniciales
        </label>
        <textarea
          value={formData.observaciones}
          onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-300"
        />
      </div>
    </div>
  );
};

// Step 3: Documentos
const Step3Documentos: React.FC<{ formData: any; setFormData: any }> = ({ formData, setFormData }) => {
  const expedienteService = new ExpedienteService();
  const checklist = expedienteService.generarChecklistAutomatico(formData.tramite_tipo_id);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Documentación Inicial</h2>
      
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Los documentos marcados con (*) son obligatorios para iniciar el trámite.
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Podrá subir documentación adicional una vez creado el expediente.
            </p>
          </div>
        </div>
      </div>

      {/* Usar el nuevo componente de documentación */}
      {formData.tramite_tipo_id && (
        <DocumentacionTramite 
          tramiteTipoId={formData.tramite_tipo_id}
          readOnly={true}
        />
      )}

      {/* Checklist para selección */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">Confirmar documentos a preparar</h3>
        {checklist.map((doc, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={`doc-${index}`}
                onChange={(e) => {
                  const newDocs = [...formData.documentos];
                  if (e.target.checked) {
                    newDocs.push(doc);
                  } else {
                    const idx = newDocs.findIndex(d => d.item === doc.item);
                    if (idx > -1) newDocs.splice(idx, 1);
                  }
                  setFormData({ ...formData, documentos: newDocs });
                }}
              />
              <label htmlFor={`doc-${index}`} className="text-sm text-gray-700 dark:text-gray-200">
                {doc.item} {doc.obligatorio && <span className="text-red-500 dark:text-red-400">*</span>}
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={doc.obligatorio ? "destructive" : "secondary"}>
                {doc.obligatorio ? 'Obligatorio' : 'Opcional'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {doc.tipo}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
        <Upload className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-500 mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-300">
          La carga de documentos se realizará después de crear el expediente
        </p>
      </div>
    </div>
  );
};

// Step 4: Confirmación
const Step4Confirmacion: React.FC<{ formData: any }> = ({ formData }) => {
  const expedienteService = new ExpedienteService();
  const codigoGenerado = expedienteService.generarCodigo(
    formData.tramite_tipo?.organismo?.sigla || 'GEN'
  );
  const fechaLimite = expedienteService.calcularFechaLimite(
    formData.tramite_tipo?.sla_total_dias || 30
  );

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Confirmación del Expediente</h2>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Código de expediente generado:</h3>
        <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">{codigoGenerado}</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tipo de Trámite</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{formData.tramite_tipo?.nombre}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Organismo</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{formData.tramite_tipo?.organismo?.sigla}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cliente</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {formData.cliente?.razon_social || formData.cliente_data.razon_social}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">CUIT</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {formData.cliente?.cuit || formData.cliente_data.cuit}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Prioridad</p>
            <Badge className={
              formData.prioridad === 'urgente' ? 'bg-red-100 text-red-800' :
              formData.prioridad === 'alta' ? 'bg-orange-100 text-orange-800' :
              formData.prioridad === 'normal' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }>
              {formData.prioridad}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fecha Límite Estimada</p>
            <p className="font-medium text-red-600 dark:text-red-400">
              {fechaLimite.toLocaleDateString('es-AR')}
            </p>
          </div>
        </div>

        {formData.observaciones && (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Observaciones</p>
            <p className="text-gray-700 dark:text-gray-200">{formData.observaciones}</p>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Documentos a cargar</p>
          <div className="space-y-1">
            {formData.documentos.map((doc: any, index: number) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-200">
                <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                <span className="dark:text-gray-200">{doc.item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900 dark:text-green-300">
              El expediente está listo para ser creado
            </p>
            <p className="text-sm text-green-700 dark:text-green-200 mt-1">
              Se generarán automáticamente las tareas según el flujo del trámite seleccionado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};