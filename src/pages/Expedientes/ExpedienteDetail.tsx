import React, { useState, useEffect } from 'react';
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
  MessageSquare,
  Edit,
  Save,
  X,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSGT } from '../../context/SGTContext';
import { ExpedienteService } from '../../services/ExpedienteService';
import { getChecklistByTramiteId } from '../../data/checklists';

export const ExpedienteDetail: React.FC = () => {
  const { id } = useParams();
  const { state } = useSGT();
  const { toast } = useToast();
  const [expediente, setExpediente] = useState<any>(null);
  const [pasos, setPasos] = useState<any[]>([]);
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [historial, setHistorial] = useState<any[]>([]);
  const [tareas, setTareas] = useState<any[]>([]);
  const [showEditObservaciones, setShowEditObservaciones] = useState(false);
  const [showUploadDoc, setShowUploadDoc] = useState(false);
  const [observacionesEdit, setObservacionesEdit] = useState('');
  const [nuevoDocumento, setNuevoDocumento] = useState({
    nombre: '',
    tipo: 'pdf',
    obligatorio: false
  });

  const expedienteService = new ExpedienteService();

  useEffect(() => {
    if (id) {
      cargarExpediente();
    }
  }, [id]);

  const cargarExpediente = () => {
    const expedienteEncontrado = state.expedientes.find(exp => exp.id === id);
    if (expedienteEncontrado) {
      setExpediente(expedienteEncontrado);
      setObservacionesEdit(expedienteEncontrado.observaciones || '');
      
      // Cargar pasos dinámicamente
      const pasosTramite = expedienteService.getPasosPorTramite(expedienteEncontrado.tramite_tipo_id);
      setPasos(pasosTramite);
      
      // Cargar historial dinámicamente
      const historialExpediente = expedienteService.getHistorial(expedienteEncontrado.id);
      setHistorial(historialExpediente);
      
      // Cargar tareas dinámicamente
      const tareasExpediente = expedienteService.getTareasPorExpediente(expedienteEncontrado.id);
      setTareas(tareasExpediente);
      
      // Cargar documentos dinámicamente
      const docsExpediente = expedienteService.getDocumentosPorExpediente(expedienteEncontrado.id);
      
      // Si no hay documentos guardados, crear desde checklist
      if (docsExpediente.length === 0) {
        const checklist = getChecklistByTramiteId(expedienteEncontrado.tramite_tipo_id);
        const documentosIniciales = checklist.map((item, index) => ({
          id: `doc-${expedienteEncontrado.id}-${index}`,
          expediente_id: expedienteEncontrado.id,
          nombre: item.item,
          tipo: item.tipo,
          obligatorio: item.obligatorio,
          estado: 'pendiente',
          descripcion: item.descripcion || '',
          created_at: new Date().toISOString()
        }));
        
        // Guardar documentos iniciales
        localStorage.setItem(`sgt_documentos_${expedienteEncontrado.id}`, JSON.stringify(documentosIniciales));
        setDocumentos(documentosIniciales);
      } else {
        setDocumentos(docsExpediente);
      }
      
      // Si no hay historial, crear entrada inicial
      if (historialExpediente.length === 0) {
        const historialInicial = [{
          id: `hist-${expedienteEncontrado.id}-1`,
          expediente_id: expedienteEncontrado.id,
          accion: 'expediente_creado',
          descripcion: 'Expediente creado en el sistema',
          estado_anterior: null,
          estado_nuevo: 'iniciado',
          usuario: 'Sistema',
          fecha: expedienteEncontrado.fecha_inicio || new Date().toISOString(),
          detalles: {
            tramite_tipo: expedienteEncontrado.tramite_nombre,
            cliente: expedienteEncontrado.cliente_nombre,
            prioridad: expedienteEncontrado.prioridad
          }
        }];
        localStorage.setItem(`sgt_historial_${expedienteEncontrado.id}`, JSON.stringify(historialInicial));
        setHistorial(historialInicial);
      }
    }
  };

  const cambiarEstadoExpediente = async (nuevoEstado: string) => {
    if (!expediente) return;
    
    try {
      const estadoAnterior = expediente.estado;
      await expedienteService.cambiarEstado(expediente.id, nuevoEstado, 'Cambio manual desde detalle');
      
      // Actualizar expediente local
      const expedienteActualizado = { ...expediente, estado: nuevoEstado };
      setExpediente(expedienteActualizado);
      
      // Agregar al historial
      const nuevaEntradaHistorial = {
        id: `hist-${expediente.id}-${Date.now()}`,
        expediente_id: expediente.id,
        accion: 'cambio_estado',
        descripcion: `Estado cambiado de ${estadoAnterior} a ${nuevoEstado}`,
        estado_anterior: estadoAnterior,
        estado_nuevo: nuevoEstado,
        usuario: 'Usuario Actual',
        fecha: new Date().toISOString(),
        detalles: { motivo: 'Cambio manual desde detalle' }
      };
      
      const historialActualizado = [...historial, nuevaEntradaHistorial];
      setHistorial(historialActualizado);
      localStorage.setItem(`sgt_historial_${expediente.id}`, JSON.stringify(historialActualizado));
      
      toast({
        title: "Estado actualizado",
        description: `El expediente cambió a: ${nuevoEstado}`,
      });
      
      // Actualizar expediente en localStorage
      const expedientes = JSON.parse(localStorage.getItem('sgt_expedientes') || '[]');
      const index = expedientes.findIndex((e: any) => e.id === expediente.id);
      if (index !== -1) {
        expedientes[index] = expedienteActualizado;
        localStorage.setItem('sgt_expedientes', JSON.stringify(expedientes));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const avanzarPaso = () => {
    if (!expediente || expediente.paso_actual >= pasos.length) return;
    
    const pasoAnterior = expediente.paso_actual;
    const nuevoExpediente = {
      ...expediente,
      paso_actual: expediente.paso_actual + 1,
      progreso: Math.round(((expediente.paso_actual + 1) / pasos.length) * 100)
    };
    
    // Actualizar en localStorage
    const expedientes = JSON.parse(localStorage.getItem('sgt_expedientes') || '[]');
    const index = expedientes.findIndex((e: any) => e.id === expediente.id);
    if (index !== -1) {
      expedientes[index] = nuevoExpediente;
      localStorage.setItem('sgt_expedientes', JSON.stringify(expedientes));
    }
    
    setExpediente(nuevoExpediente);
    
    // Agregar al historial
    const pasoActual = pasos.find(p => p.orden === nuevoExpediente.paso_actual);
    const nuevaEntradaHistorial = {
      id: `hist-${expediente.id}-${Date.now()}`,
      expediente_id: expediente.id,
      accion: 'paso_avanzado',
      descripcion: `Paso avanzado: ${pasoActual?.nombre || 'Paso ' + nuevoExpediente.paso_actual}`,
      estado_anterior: null,
      estado_nuevo: null,
      usuario: 'Usuario Actual',
      fecha: new Date().toISOString(),
      detalles: { 
        paso_anterior: pasoAnterior,
        paso_nuevo: nuevoExpediente.paso_actual,
        progreso: nuevoExpediente.progreso
      }
    };
    
    const historialActualizado = [...historial, nuevaEntradaHistorial];
    setHistorial(historialActualizado);
    localStorage.setItem(`sgt_historial_${expediente.id}`, JSON.stringify(historialActualizado));
    
    toast({
      title: "Paso avanzado",
      description: `Paso ${nuevoExpediente.paso_actual} de ${pasos.length}`,
    });
  };

  const cambiarEstadoDocumento = (docId: string, nuevoEstado: string) => {
    const documento = documentos.find(d => d.id === docId);
    const estadoAnterior = documento?.estado;
    
    const nuevosDocumentos = documentos.map(doc => 
      doc.id === docId ? { ...doc, estado: nuevoEstado } : doc
    );
    setDocumentos(nuevosDocumentos);
    
    // Guardar en localStorage
    localStorage.setItem(`sgt_documentos_${expediente.id}`, JSON.stringify(nuevosDocumentos));
    
    // Agregar al historial
    const nuevaEntradaHistorial = {
      id: `hist-${expediente.id}-${Date.now()}`,
      expediente_id: expediente.id,
      accion: 'documento_actualizado',
      descripcion: `Documento "${documento?.nombre}" cambió de ${estadoAnterior} a ${nuevoEstado}`,
      estado_anterior: null,
      estado_nuevo: null,
      usuario: 'Usuario Actual',
      fecha: new Date().toISOString(),
      detalles: { 
        documento_id: docId,
        documento_nombre: documento?.nombre,
        estado_anterior: estadoAnterior,
        estado_nuevo: nuevoEstado
      }
    };
    
    const historialActualizado = [...historial, nuevaEntradaHistorial];
    setHistorial(historialActualizado);
    localStorage.setItem(`sgt_historial_${expediente.id}`, JSON.stringify(historialActualizado));
    
    toast({
      title: "Documento actualizado",
      description: `Estado cambiado a: ${nuevoEstado}`,
    });
  };

  const guardarObservaciones = () => {
    if (!expediente) return;
    
    const observacionesAnteriores = expediente.observaciones;
    const expedienteActualizado = { ...expediente, observaciones: observacionesEdit };
    
    // Actualizar en localStorage
    const expedientes = JSON.parse(localStorage.getItem('sgt_expedientes') || '[]');
    const index = expedientes.findIndex((e: any) => e.id === expediente.id);
    if (index !== -1) {
      expedientes[index] = expedienteActualizado;
      localStorage.setItem('sgt_expedientes', JSON.stringify(expedientes));
    }
    
    setExpediente(expedienteActualizado);
    setShowEditObservaciones(false);
    
    // Agregar al historial
    const nuevaEntradaHistorial = {
      id: `hist-${expediente.id}-${Date.now()}`,
      expediente_id: expediente.id,
      accion: 'observaciones_actualizadas',
      descripcion: 'Observaciones actualizadas',
      estado_anterior: null,
      estado_nuevo: null,
      usuario: 'Usuario Actual',
      fecha: new Date().toISOString(),
      detalles: { 
        observaciones_anteriores: observacionesAnteriores,
        observaciones_nuevas: observacionesEdit
      }
    };
    
    const historialActualizado = [...historial, nuevaEntradaHistorial];
    setHistorial(historialActualizado);
    localStorage.setItem(`sgt_historial_${expediente.id}`, JSON.stringify(historialActualizado));
    
    toast({
      title: "Observaciones guardadas",
      description: "Las observaciones se actualizaron correctamente",
    });
  };

  const agregarDocumento = () => {
    if (!nuevoDocumento.nombre) {
      toast({
        title: "Error",
        description: "Ingrese el nombre del documento",
        variant: "destructive"
      });
      return;
    }

    const documento = {
      id: `doc-${expediente.id}-${Date.now()}`,
      expediente_id: expediente.id,
      nombre: nuevoDocumento.nombre,
      tipo: nuevoDocumento.tipo,
      obligatorio: nuevoDocumento.obligatorio,
      estado: 'pendiente',
      created_at: new Date().toISOString()
    };

    const nuevosDocumentos = [...documentos, documento];
    setDocumentos(nuevosDocumentos);
    
    // Guardar en localStorage
    localStorage.setItem(`sgt_documentos_${expediente.id}`, JSON.stringify(nuevosDocumentos));
    
    // Agregar al historial
    const nuevaEntradaHistorial = {
      id: `hist-${expediente.id}-${Date.now()}`,
      expediente_id: expediente.id,
      accion: 'documento_agregado',
      descripcion: `Documento agregado: ${nuevoDocumento.nombre}`,
      estado_anterior: null,
      estado_nuevo: null,
      usuario: 'Usuario Actual',
      fecha: new Date().toISOString(),
      detalles: { 
        documento_nombre: nuevoDocumento.nombre,
        documento_tipo: nuevoDocumento.tipo,
        obligatorio: nuevoDocumento.obligatorio
      }
    };
    
    const historialActualizado = [...historial, nuevaEntradaHistorial];
    setHistorial(historialActualizado);
    localStorage.setItem(`sgt_historial_${expediente.id}`, JSON.stringify(historialActualizado));
    
    toast({
      title: "Documento agregado",
      description: nuevoDocumento.nombre,
    });

    setNuevoDocumento({ nombre: '', tipo: 'pdf', obligatorio: false });
    setShowUploadDoc(false);
  };

  const getIconoAccion = (accion: string) => {
    switch (accion) {
      case 'expediente_creado':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'cambio_estado':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'paso_avanzado':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'documento_agregado':
        return <Upload className="w-4 h-4 text-purple-500" />;
      case 'documento_actualizado':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'observaciones_actualizadas':
        return <Edit className="w-4 h-4 text-gray-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
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

  const diasRestantes = Math.ceil(
    (new Date(expediente.fecha_limite).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

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
          <select
            value={expediente.estado}
            onChange={(e) => cambiarEstadoExpediente(e.target.value)}
            className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(expediente.estado)}`}
          >
            <option value="iniciado">Iniciado</option>
            <option value="en_proceso">En Proceso</option>
            <option value="observado">Observado</option>
            <option value="aprobado">Aprobado</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          {getSemaforoIcon(expediente.semaforo)}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent>
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
                      diasRestantes < 0 ? 'text-red-600' : 
                      diasRestantes < 7 ? 'text-orange-600' : 'text-gray-600'
                    }`}>
                      {new Date(expediente.fecha_limite).toLocaleDateString('es-AR')}
                      {diasRestantes < 0 
                        ? ` (Vencido ${Math.abs(diasRestantes)}d)`
                        : ` (${diasRestantes}d restantes)`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Timeline */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Progreso del Trámite</CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    Paso {expediente.paso_actual} de {pasos.length}
                  </span>
                  {expediente.paso_actual < pasos.length && expediente.estado !== 'completado' && (
                    <Button size="sm" onClick={avanzarPaso}>
                      Avanzar Paso
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pasos.map((paso, index) => {
                  const pasoCompletado = expediente.paso_actual > paso.orden;
                  const pasoActual = expediente.paso_actual === paso.orden;
                  
                  return (
                    <div key={paso.id} className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        pasoCompletado 
                          ? 'bg-green-100 text-green-600' 
                          : pasoActual
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {pasoCompletado ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : pasoActual ? (
                          <Clock className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-medium">{paso.orden}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          pasoCompletado ? 'text-green-900' : 
                          pasoActual ? 'text-blue-900' : 'text-gray-500'
                        }`}>
                          {paso.nombre}
                        </p>
                        <p className="text-sm text-gray-500">{paso.descripcion}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                          <span>SLA: {paso.sla_dias} días</span>
                          <span>Responsable: {paso.rol_responsable}</span>
                        </div>
                      </div>
                      {pasoActual && (
                        <div className="text-sm text-blue-600 font-medium">En progreso</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Documentos ({documentos.length})</CardTitle>
                <Button 
                  size="sm"
                  onClick={() => setShowUploadDoc(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Documento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documentos.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{doc.nombre}</p>
                          {doc.obligatorio && (
                            <Badge variant="destructive" className="text-xs">Obligatorio</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{doc.tipo.toUpperCase()}</p>
                        {doc.descripcion && (
                          <p className="text-xs text-gray-500">{doc.descripcion}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <select
                        value={doc.estado}
                        onChange={(e) => cambiarEstadoDocumento(doc.id, e.target.value)}
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${
                          doc.estado === 'aprobado' ? 'bg-green-100 text-green-800 border-green-200' :
                          doc.estado === 'rechazado' ? 'bg-red-100 text-red-800 border-red-200' :
                          doc.estado === 'revision' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }`}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="revision">En Revisión</option>
                        <option value="aprobado">Aprobado</option>
                        <option value="rechazado">Rechazado</option>
                      </select>
                      <span className="text-sm text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString('es-AR')}
                      </span>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {documentos.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay documentos cargados</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Observaciones */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Observaciones</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowEditObservaciones(true)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showEditObservaciones ? (
                <div className="space-y-3">
                  <textarea
                    value={observacionesEdit}
                    onChange={(e) => setObservacionesEdit(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Ingrese observaciones..."
                  />
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowEditObservaciones(false)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={guardarObservaciones}>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  {expediente.observaciones ? (
                    <p className="text-gray-700">{expediente.observaciones}</p>
                  ) : (
                    <p className="text-gray-500 italic">Sin observaciones</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historial Completo */}
          <Card>
            <CardHeader>
              <CardTitle>Historial Completo del Expediente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {historial.length > 0 ? (
                  historial
                    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                    .map((entrada) => (
                      <div key={entrada.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="mt-1">
                          {getIconoAccion(entrada.accion)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {entrada.descripcion}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {formatearFecha(entrada.fecha)}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {entrada.usuario}
                            </span>
                          </div>
                          {entrada.detalles && (
                            <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border">
                              {entrada.accion === 'cambio_estado' && (
                                <p>Motivo: {entrada.detalles.motivo}</p>
                              )}
                              {entrada.accion === 'paso_avanzado' && (
                                <p>Progreso: {entrada.detalles.progreso}%</p>
                              )}
                              {entrada.accion === 'documento_actualizado' && (
                                <p>Estado: {entrada.detalles.estado_anterior} → {entrada.detalles.estado_nuevo}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay historial disponible</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent>
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
                    <p className="text-2xl font-bold text-gray-900">
                      {documentos.filter(d => d.estado === 'pendiente').length}
                    </p>
                    <p className="text-sm text-gray-500">Docs pendientes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {documentos.filter(d => d.estado === 'aprobado').length}
                    </p>
                    <p className="text-sm text-gray-500">Aprobados</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-2xl font-bold text-blue-900">
                      {historial.length}
                    </p>
                    <p className="text-sm text-gray-500">Eventos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {pasos.filter((_, i) => i < expediente.paso_actual).length}
                    </p>
                    <p className="text-sm text-gray-500">Pasos completados</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full" variant="default">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Enviar mensaje al cliente
                </Button>
                <Button className="w-full" variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Subir documento
                </Button>
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar expediente
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => window.open(`/presupuestos?expediente=${expediente.id}`, '_blank')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generar presupuesto
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resumen de Actividad Reciente */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {historial.slice(0, 5).map((entrada) => (
                  <div key={entrada.id} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {entrada.descripcion}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatearFecha(entrada.fecha)}
                      </p>
                    </div>
                  </div>
                ))}
                {historial.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Sin actividad reciente
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Agregar Documento */}
      {showUploadDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Agregar Documento</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowUploadDoc(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Nombre del Documento *
                </label>
                <input
                  type="text"
                  value={nuevoDocumento.nombre}
                  onChange={(e) => setNuevoDocumento({...nuevoDocumento, nombre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ej: Certificado de origen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Tipo de Archivo
                </label>
                <select
                  value={nuevoDocumento.tipo}
                  onChange={(e) => setNuevoDocumento({...nuevoDocumento, tipo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="pdf">PDF</option>
                  <option value="imagen">Imagen</option>
                  <option value="excel">Excel</option>
                  <option value="word">Word</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="obligatorio"
                  checked={nuevoDocumento.obligatorio}
                  onChange={(e) => setNuevoDocumento({...nuevoDocumento, obligatorio: e.target.checked})}
                />
                <label htmlFor="obligatorio" className="text-sm">
                  Documento obligatorio
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowUploadDoc(false)}>
                  Cancelar
                </Button>
                <Button onClick={agregarDocumento}>
                  Agregar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};