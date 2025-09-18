import { v4 as uuidv4 } from 'uuid';

export interface Cliente {
  id: string;
  razon_social: string;
  cuit: string;
  email: string;
  telefono?: string;
  contacto_nombre?: string;
}

export interface Expediente {
  id: string;
  codigo: string;
  alias: string;
  tramite_tipo_id: string;
  cliente_id: string;
  estado: string;
  prioridad: string;
  fecha_inicio: string;
  fecha_limite: string;
  paso_actual: number;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export class ExpedienteService {
  private readonly STORAGE_KEY = 'sgt_expedientes';
  private readonly CLIENTES_KEY = 'sgt_clientes';
  private readonly TAREAS_KEY = 'sgt_tareas';

  generarCodigo(organismoSigla: string): string {
    const year = new Date().getFullYear();
    const sequential = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    return `SGT-${year}-${organismoSigla}-${sequential}`;
  }

  calcularFechaLimite(slaDias: number): Date {
    const fecha = new Date();
    let diasAgregados = 0;
    
    while (diasAgregados < slaDias) {
      fecha.setDate(fecha.getDate() + 1);
      // Skip weekends
      if (fecha.getDay() !== 0 && fecha.getDay() !== 6) {
        diasAgregados++;
      }
    }
    
    return fecha;
  }

  async crearCliente(clienteData: any): Promise<Cliente> {
    const cliente: Cliente = {
      id: uuidv4(),
      razon_social: clienteData.razon_social,
      cuit: clienteData.cuit,
      email: clienteData.email,
      telefono: clienteData.telefono,
      contacto_nombre: clienteData.contacto_nombre
    };

    const clientes = this.getClientes();
    clientes.push(cliente);
    localStorage.setItem(this.CLIENTES_KEY, JSON.stringify(clientes));

    return cliente;
  }

  async crearExpediente(data: any): Promise<Expediente> {
    const tramiteTipo = this.getTramiteTipo(data.tramite_tipo_id);
    
    const expediente: Expediente = {
      id: uuidv4(),
      codigo: this.generarCodigo(tramiteTipo?.organismo?.sigla || 'GEN'),
      alias: data.alias,
      tramite_tipo_id: data.tramite_tipo_id,
      cliente_id: data.cliente_id,
      estado: 'iniciado',
      prioridad: data.prioridad,
      fecha_inicio: new Date().toISOString(),
      fecha_limite: this.calcularFechaLimite(tramiteTipo?.sla_total_dias || 30).toISOString(),
      paso_actual: 1,
      observaciones: data.observaciones,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const expedientes = this.getExpedientes();
    expedientes.push(expediente);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(expedientes));

    // Crear tareas automáticas
    await this.crearTareasAutomaticas(expediente.id, data.tramite_tipo_id);

    // Guardar documentos si los hay
    if (data.documentos && data.documentos.length > 0) {
      await this.guardarDocumentos(expediente.id, data.documentos);
    }

    return expediente;
  }

  private async crearTareasAutomaticas(expedienteId: string, tramiteTipoId: string): Promise<void> {
    const pasos = this.getPasosPorTramite(tramiteTipoId);
    
    const tareas = pasos.map((paso, index) => ({
      id: uuidv4(),
      expediente_id: expedienteId,
      paso_id: paso.id,
      nombre: paso.nombre,
      descripcion: paso.descripcion,
      estado: index === 0 ? 'en_proceso' : 'pendiente',
      orden: paso.orden,
      sla_dias: paso.sla_dias,
      rol_responsable: paso.rol_responsable,
      fecha_asignacion: new Date().toISOString(),
      fecha_limite: this.calcularFechaLimite(paso.sla_dias).toISOString(),
      created_at: new Date().toISOString()
    }));

    const tareasKey = `${this.TAREAS_KEY}_${expedienteId}`;
    localStorage.setItem(tareasKey, JSON.stringify(tareas));
  }

  private async guardarDocumentos(expedienteId: string, documentos: any[]): Promise<void> {
    const docsKey = `sgt_documentos_${expedienteId}`;
    const docs = documentos.map(doc => ({
      id: uuidv4(),
      expediente_id: expedienteId,
      nombre: doc.item,
      tipo: doc.tipo,
      obligatorio: doc.obligatorio,
      estado: 'pendiente',
      created_at: new Date().toISOString()
    }));
    localStorage.setItem(docsKey, JSON.stringify(docs));
  }

  getExpedientes(): Expediente[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  getClientes(): Cliente[] {
    const data = localStorage.getItem(this.CLIENTES_KEY);
    return data ? JSON.parse(data) : [];
  }

  getTramiteTipo(id: string): any {
    // Aquí deberías obtener el tipo de trámite de tu store o API
    const tramiteTipos = JSON.parse(localStorage.getItem('sgt_tramite_tipos') || '[]');
    return tramiteTipos.find((t: any) => t.id === id);
  }

  getPasosPorTramite(tramiteTipoId: string): any[] {
    // Retornar pasos según el tipo de trámite
    const pasosPorTipo: any = {
      'TT-INAL-002': [ // RNPA
        { id: 1, orden: 1, nombre: 'Relevamiento inicial', descripcion: 'Checklist y análisis', sla_dias: 3, rol_responsable: 'gestor' },
        { id: 2, orden: 2, nombre: 'Preparación documentación', descripcion: 'Armado carpeta técnica', sla_dias: 5, rol_responsable: 'gestor' },
        { id: 3, orden: 3, nombre: 'Revisión cliente', descripcion: 'Validación cliente', sla_dias: 2, rol_responsable: 'cliente' },
        { id: 4, orden: 4, nombre: 'Presentación SIFeGA', descripcion: 'Carga en sistema', sla_dias: 1, rol_responsable: 'gestor' },
        { id: 5, orden: 5, nombre: 'Evaluación INAL', descripcion: 'Análisis organismo', sla_dias: 30, rol_responsable: 'tercero' },
        { id: 6, orden: 6, nombre: 'Respuesta observaciones', descripcion: 'Si las hubiere', sla_dias: 5, rol_responsable: 'gestor' },
        { id: 7, orden: 7, nombre: 'Emisión RNPA', descripcion: 'Certificado', sla_dias: 5, rol_responsable: 'tercero' },
        { id: 8, orden: 8, nombre: 'Entrega cliente', descripcion: 'Cierre', sla_dias: 1, rol_responsable: 'gestor' }
      ],
      'TT-ENACOM-001': [ // ENACOM
        { id: 1, orden: 1, nombre: 'Análisis técnico', descripcion: 'Revisión specs', sla_dias: 3, rol_responsable: 'gestor' },
        { id: 2, orden: 2, nombre: 'Selección laboratorio', descripcion: 'OCP acreditado', sla_dias: 2, rol_responsable: 'gestor' },
        { id: 3, orden: 3, nombre: 'Ensayos laboratorio', descripcion: 'Tests requeridos', sla_dias: 15, rol_responsable: 'tercero' },
        { id: 4, orden: 4, nombre: 'Armado expediente', descripcion: 'Documentación', sla_dias: 3, rol_responsable: 'gestor' },
        { id: 5, orden: 5, nombre: 'Presentación RAMATEL', descripcion: 'Carga sistema', sla_dias: 1, rol_responsable: 'gestor' },
        { id: 6, orden: 6, nombre: 'Evaluación ENACOM', descripcion: 'Análisis', sla_dias: 20, rol_responsable: 'tercero' },
        { id: 7, orden: 7, nombre: 'Emisión certificado', descripcion: 'Homologación', sla_dias: 5, rol_responsable: 'tercero' }
      ]
    };

    return pasosPorTipo[tramiteTipoId] || [
      { id: 1, orden: 1, nombre: 'Inicio', descripcion: 'Inicio del trámite', sla_dias: 1, rol_responsable: 'gestor' },
      { id: 2, orden: 2, nombre: 'Proceso', descripcion: 'En proceso', sla_dias: 10, rol_responsable: 'gestor' },
      { id: 3, orden: 3, nombre: 'Finalización', descripcion: 'Cierre', sla_dias: 1, rol_responsable: 'gestor' }
    ];
  }

  // Cambio de estado con validaciones
  async cambiarEstado(expedienteId: string, nuevoEstado: string, motivo?: string): Promise<void> {
    const expedientes = this.getExpedientes();
    const index = expedientes.findIndex(e => e.id === expedienteId);
    
    if (index === -1) throw new Error('Expediente no encontrado');
    
    const expediente = expedientes[index];
    
    // Validaciones según estado
    if (nuevoEstado === 'aprobado') {
      // Validar que todos los documentos obligatorios estén cargados
      const documentos = this.getDocumentosPorExpediente(expedienteId);
      const obligatoriosPendientes = documentos.filter(d => d.obligatorio && d.estado === 'pendiente');
      
      if (obligatoriosPendientes.length > 0) {
        throw new Error(`Faltan ${obligatoriosPendientes.length} documentos obligatorios`);
      }
    }
    
    // Guardar historial
    const historial = this.getHistorial(expedienteId);
    historial.push({
      id: uuidv4(),
      expediente_id: expedienteId,
      estado_anterior: expediente.estado,
      estado_nuevo: nuevoEstado,
      motivo: motivo,
      fecha: new Date().toISOString(),
      usuario: 'usuario_actual' // Aquí deberías obtener el usuario actual
    });
    localStorage.setItem(`sgt_historial_${expedienteId}`, JSON.stringify(historial));
    
    // Actualizar estado
    expediente.estado = nuevoEstado;
    expediente.updated_at = new Date().toISOString();
    expedientes[index] = expediente;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(expedientes));
  }

  getDocumentosPorExpediente(expedienteId: string): any[] {
    const docsKey = `sgt_documentos_${expedienteId}`;
    const data = localStorage.getItem(docsKey);
    return data ? JSON.parse(data) : [];
  }

  getHistorial(expedienteId: string): any[] {
    const historialKey = `sgt_historial_${expedienteId}`;
    const data = localStorage.getItem(historialKey);
    return data ? JSON.parse(data) : [];
  }

  getTareasPorExpediente(expedienteId: string): any[] {
    const tareasKey = `${this.TAREAS_KEY}_${expedienteId}`;
    const data = localStorage.getItem(tareasKey);
    return data ? JSON.parse(data) : [];
  }

  // Agregar entrada al historial
  agregarHistorial(expedienteId: string, entrada: any): void {
    const historial = this.getHistorial(expedienteId);
    historial.push({
      id: `hist-${expedienteId}-${Date.now()}`,
      expediente_id: expedienteId,
      fecha: new Date().toISOString(),
      ...entrada
    });
    localStorage.setItem(`sgt_historial_${expedienteId}`, JSON.stringify(historial));
  }

  // Actualizar tarea
  actualizarTarea(expedienteId: string, tareaId: string, cambios: any): void {
    const tareas = this.getTareasPorExpediente(expedienteId);
    const index = tareas.findIndex(t => t.id === tareaId);
    if (index !== -1) {
      tareas[index] = { ...tareas[index], ...cambios, updated_at: new Date().toISOString() };
      localStorage.setItem(`${this.TAREAS_KEY}_${expedienteId}`, JSON.stringify(tareas));
    }
  }
}