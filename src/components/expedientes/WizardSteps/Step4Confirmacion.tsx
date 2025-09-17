import React from 'react';
import { Calendar, User, FileText, Building, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSGT } from '../../../context/SGTContext';
import { getChecklistByTramiteId } from '../../../data/checklists';

interface Step4ConfirmacionProps {
  tramiteTipoId: string;
  clienteId: string;
  alias: string;
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  observaciones?: string;
  documentos: any[];
}

export const Step4Confirmacion: React.FC<Step4ConfirmacionProps> = ({
  tramiteTipoId,
  clienteId,
  alias,
  prioridad,
  observaciones,
  documentos
}) => {
  const { state } = useSGT();

  const tramiteTipo = state.tramiteTipos.find(t => t.id === tramiteTipoId);
  const cliente = state.clientes.find(c => c.id === clienteId);
  const organismo = tramiteTipo ? state.organismos.find(o => o.id === tramiteTipo.organismo_id) : null;
  const checklist = getChecklistByTramiteId(tramiteTipoId);
  const obligatorios = checklist.filter(item => item.obligatorio);

  // Generar código de ejemplo
  const generarCodigoEjemplo = (): string => {
    const year = new Date().getFullYear();
    const siglaLimpia = organismo?.sigla.replace('/', '-') || 'ORG';
    const numeroEjemplo = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    return `SGT-${year}-${siglaLimpia}-${numeroEjemplo}`;
  };

  // Calcular fecha límite
  const calcularFechaLimite = (): string => {
    const fecha = new Date();
    const sla = tramiteTipo?.sla_total_dias || 30;
    let diasAgregados = 0;
    
    while (diasAgregados < sla) {
      fecha.setDate(fecha.getDate() + 1);
      if (fecha.getDay() !== 0 && fecha.getDay() !== 6) {
        diasAgregados++;
      }
    }
    
    return fecha.toLocaleDateString('es-AR');
  };

  // Verificar documentos obligatorios
  const documentosObligatoriosFaltantes = obligatorios.filter(item => 
    !documentos.some(doc => doc.checklistItem === item.item)
  );

  const getPrioridadColor = (prioridad: string): string => {
    switch (prioridad) {
      case 'urgente': return 'bg-red-100 text-red-800 border-red-200';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'baja': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Confirmación del Expediente
        </h2>
        <p className="text-gray-600">
          Revisa todos los datos antes de crear el expediente. Una vez creado, se generará automáticamente el código y las tareas correspondientes.
        </p>
      </div>

      {/* Código que se generará */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Código del Expediente
        </h3>
        <div className="text-2xl font-mono font-bold text-blue-700 mb-2">
          {generarCodigoEjemplo()}
        </div>
        <p className="text-sm text-blue-600">
          Este código se generará automáticamente al crear el expediente
        </p>
      </div>

      {/* Información del trámite */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Información del Trámite</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Tipo:</span>
              <span className="ml-2 font-medium">{tramiteTipo?.nombre}</span>
            </div>
            <div>
              <span className="text-gray-600">Código:</span>
              <span className="ml-2 font-medium">{tramiteTipo?.codigo}</span>
            </div>
            <div>
              <span className="text-gray-600">Organismo:</span>
              <span className="ml-2 font-medium">{organismo?.sigla}</span>
            </div>
            <div>
              <span className="text-gray-600">Rubro:</span>
              <span className="ml-2 font-medium">{tramiteTipo?.rubro}</span>
            </div>
            <div>
              <span className="text-gray-600">SLA:</span>
              <span className="ml-2 font-medium">{tramiteTipo?.sla_total_dias || 30} días hábiles</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <User className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Información del Cliente</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Razón Social:</span>
              <span className="ml-2 font-medium">{cliente?.razon_social}</span>
            </div>
            <div>
              <span className="text-gray-600">CUIT:</span>
              <span className="ml-2 font-medium">{cliente?.cuit}</span>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <span className="ml-2 font-medium">{cliente?.email}</span>
            </div>
            {cliente?.telefono && (
              <div>
                <span className="text-gray-600">Teléfono:</span>
                <span className="ml-2 font-medium">{cliente.telefono}</span>
              </div>
            )}
            {cliente?.contacto_nombre && (
              <div>
                <span className="text-gray-600">Contacto:</span>
                <span className="ml-2 font-medium">{cliente.contacto_nombre}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Datos del expediente */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Building className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Datos del Expediente</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Alias:</span>
            <span className="ml-2 font-medium">{alias}</span>
          </div>
          <div>
            <span className="text-gray-600">Prioridad:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs font-medium border ${getPrioridadColor(prioridad)}`}>
              {prioridad.charAt(0).toUpperCase() + prioridad.slice(1)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Fecha límite:</span>
            <span className="ml-2 font-medium">{calcularFechaLimite()}</span>
          </div>
        </div>
        {observaciones && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-gray-600">Observaciones:</span>
            <p className="mt-1 text-sm text-gray-900">{observaciones}</p>
          </div>
        )}
      </div>

      {/* Documentación */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <FileText className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-gray-900">Estado de la Documentación</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">{documentos.length}</div>
            <div className="text-sm text-gray-600">Documentos subidos</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-600">
              {obligatorios.length - documentosObligatoriosFaltantes.length}
            </div>
            <div className="text-sm text-gray-600">Obligatorios cubiertos</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded">
            <div className="text-2xl font-bold text-red-600">
              {documentosObligatoriosFaltantes.length}
            </div>
            <div className="text-sm text-gray-600">Obligatorios faltantes</div>
          </div>
        </div>

        {/* Advertencias */}
        {documentosObligatoriosFaltantes.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-2">
                  Documentos Obligatorios Faltantes
                </h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {documentosObligatoriosFaltantes.map((item) => (
                    <li key={item.item} className="flex items-center space-x-1">
                      <span>•</span>
                      <span>{item.item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-yellow-700 mt-2">
                  El expediente se creará pero quedará pendiente de documentación. 
                  Podrás subir estos documentos después desde la vista del expediente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de documentos subidos */}
        {documentos.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Documentos que se incluirán:</h4>
            <div className="space-y-2">
              {documentos.map((doc) => (
                <div key={doc.id} className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{doc.nombre}</span>
                  {doc.checklistItem && (
                    <span className="text-gray-500">({doc.checklistItem})</span>
                  )}
                  {doc.obligatorio && (
                    <span className="px-1 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                      Obligatorio
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Próximos pasos */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Próximos Pasos</h3>
        </div>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Se generará automáticamente el código del expediente</p>
          <p>• Se crearán las tareas correspondientes según el tipo de trámite</p>
          <p>• Se calculará la fecha límite considerando días hábiles</p>
          <p>• Se asignará el expediente al gestor correspondiente</p>
          <p>• Se enviará una notificación de confirmación al cliente</p>
        </div>
      </div>

      {/* Confirmación final */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-gray-700 mb-2">
          ¿Estás seguro de que deseas crear este expediente con la información mostrada?
        </p>
        <p className="text-sm text-gray-500">
          Una vez creado, se generarán automáticamente todas las tareas y notificaciones correspondientes.
        </p>
      </div>
    </div>
  );
};