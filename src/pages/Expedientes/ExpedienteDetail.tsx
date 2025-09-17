import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Building2, 
  User, 
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  Upload,
  MessageSquare
} from 'lucide-react';
import { useSGT } from '../../context/SGTContext';

export const ExpedienteDetail: React.FC = () => {
  const { id } = useParams();
  const { state } = useSGT();
  
  const expediente = state.expedientes.find(exp => exp.id === id);

  if (!expediente) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Expediente no encontrado</h2>
        <Link to="/expedientes" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
          Volver a expedientes
        </Link>
      </div>
    );
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800';
      case 'observado':
        return 'bg-yellow-100 text-yellow-800';
      case 'vencido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSemaforoIcon = (semaforo: string) => {
    switch (semaforo) {
      case 'rojo':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'amarillo':
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const pasos = [
    { id: 1, nombre: 'Relevamiento inicial', completado: true },
    { id: 2, nombre: 'Preparación documentación', completado: true },
    { id: 3, nombre: 'Revisión cliente', completado: true },
    { id: 4, nombre: 'Presentación SIFeGA', completado: expediente.paso_actual >= 4 },
    { id: 5, nombre: 'Evaluación INAL', completado: expediente.paso_actual >= 5 },
    { id: 6, nombre: 'Respuesta observaciones', completado: expediente.paso_actual >= 6 },
    { id: 7, nombre: 'Emisión RNPA', completado: expediente.paso_actual >= 7 },
    { id: 8, nombre: 'Entrega al cliente', completado: expediente.paso_actual >= 8 },
  ];

  const documentos = [
    { id: 1, nombre: 'Certificado RNE vigente', tipo: 'PDF', estado: 'aprobado', fecha: '2025-01-15' },
    { id: 2, nombre: 'Fórmula cualicuantitativa', tipo: 'PDF', estado: 'aprobado', fecha: '2025-01-16' },
    { id: 3, nombre: 'Proyecto de rótulo', tipo: 'PDF', estado: 'pendiente', fecha: null },
    { id: 4, nombre: 'Análisis de laboratorio', tipo: 'PDF', estado: 'pendiente', fecha: null },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link 
          to="/expedientes"
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{expediente.alias}</h1>
          <p className="text-gray-600">{expediente.codigo}</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(expediente.estado)}`}>
            {expediente.estado.replace('_', ' ')}
          </span>
          {getSemaforoIcon(expediente.semaforo)}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Trámite</p>
                  <p className="text-sm text-gray-600">{expediente.tramite_nombre}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Organismo</p>
                  <p className="text-sm text-gray-600">{expediente.organismo}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Cliente</p>
                  <p className="text-sm text-gray-600">{expediente.cliente_nombre}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Fecha límite</p>
                  <p className={`text-sm ${
                    expediente.dias_restantes < 0 ? 'text-red-600' : 
                    expediente.dias_restantes < 7 ? 'text-orange-600' : 'text-gray-600'
                  }`}>
                    {new Date(expediente.fecha_limite).toLocaleDateString('es-AR')}
                    {expediente.dias_restantes < 0 
                      ? ` (Vencido ${Math.abs(expediente.dias_restantes)}d)`
                      : ` (${expediente.dias_restantes}d restantes)`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Progreso del Trámite</h2>
              <div className="text-sm text-gray-500">
                Paso {expediente.paso_actual} de {expediente.total_pasos}
              </div>
            </div>
            
            <div className="space-y-4">
              {pasos.map((paso, index) => (
                <div key={paso.id} className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    paso.completado 
                      ? 'bg-green-100 text-green-600' 
                      : expediente.paso_actual === paso.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {paso.completado ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : expediente.paso_actual === paso.id ? (
                      <Clock className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{paso.id}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      paso.completado ? 'text-green-900' : 
                      expediente.paso_actual === paso.id ? 'text-blue-900' : 'text-gray-500'
                    }`}>
                      {paso.nombre}
                    </p>
                  </div>
                  {expediente.paso_actual === paso.id && (
                    <div className="text-sm text-blue-600 font-medium">En progreso</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Documentos</h2>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Upload className="w-4 h-4 mr-2" />
                Subir documento
              </button>
            </div>
            
            <div className="space-y-3">
              {documentos.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.nombre}</p>
                      <p className="text-sm text-gray-500">{doc.tipo}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      doc.estado === 'aprobado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doc.estado}
                    </span>
                    {doc.fecha && (
                      <span className="text-sm text-gray-500">
                        {new Date(doc.fecha).toLocaleDateString('es-AR')}
                      </span>
                    )}
                    {doc.estado === 'aprobado' && (
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500">Progreso general</span>
                  <span className="font-medium">{expediente.progreso}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      expediente.progreso < 30 ? 'bg-red-500' :
                      expediente.progreso < 70 ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${expediente.progreso}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{expediente.documentos_pendientes}</p>
                  <p className="text-sm text-gray-500">Docs pendientes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{expediente.notificaciones_pendientes}</p>
                  <p className="text-sm text-gray-500">Notificaciones</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
            <div className="space-y-3">
              <button className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <MessageSquare className="w-4 h-4 mr-2" />
                Enviar mensaje
              </button>
              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                <Upload className="w-4 h-4 mr-2" />
                Subir documento
              </button>
              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Descargar todo
              </button>
            </div>
          </div>

          {/* Observaciones */}
          {expediente.observaciones && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h4 className="font-medium text-yellow-900">Observaciones</h4>
              </div>
              <p className="text-sm text-yellow-800">{expediente.observaciones}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};