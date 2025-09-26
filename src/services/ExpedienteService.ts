import { v4 as uuidv4 } from 'uuid';
import { catalogoTramitesArgentina, buscarTramitePorId } from '@/data/catalogoTramitesCompleto';

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

  // ============= MÉTODOS PARA VISTA 360° DE CLIENTES =============

  // Obtener información completa del cliente
  getClienteCompleto(clienteId: string): any {
    const clientes = this.getClientes();
    const cliente = clientes.find(c => c.id === clienteId);
    
    if (!cliente) return null;
    
    // Enriquecer con datos adicionales
    return {
      ...cliente,
      categoria: 'Premium',
      satisfaccion: 4.5,
      credito_disponible: 500000,
      credito_utilizado: 125000,
      dias_promedio_pago: 15,
      direccion: 'Av. Corrientes 1234, CABA',
      contactos: [
        {
          id: 1,
          nombre: cliente.contacto_nombre || 'Contacto Principal',
          cargo: 'Gerente de Operaciones',
          email: cliente.email,
          telefono: cliente.telefono,
          principal: true
        }
      ]
    };
  }

  // Obtener expedientes por cliente
  getExpedientesByCliente(clienteId: string): any[] {
    const expedientes = this.getExpedientes();
    return expedientes.filter(exp => exp.cliente_id === clienteId);
  }

  // Obtener productos por cliente
  getProductosByCliente(clienteId: string): any[] {
    // Datos mock base
    const productosMock = [
      {
        id: 'prod-1',
        cliente_id: 'cliente-1',
        nombre: 'Yogur Natural 200g',
        marca: 'DelSur',
        rnpa: 'RNPA 04-123456',
        categoria: 'Productos Lácteos',
        estado: 'vigente',
        vencimiento: '2026-03-15',
        peso_neto: '200g',
        vida_util: '30 días',
        codigo_ean: '7791234567890'
      },
      {
        id: 'prod-2',
        cliente_id: 'cliente-2',
        nombre: 'Router WiFi 6 Pro',
        marca: 'TechCorp',
        rnpa: 'N/A',
        categoria: 'Equipos de Telecomunicaciones',
        estado: 'vigente',
        vencimiento: '2026-08-15',
        peso_neto: '450g',
        vida_util: 'N/A',
        codigo_ean: '7791234567891'
      },
      {
        id: 'prod-3',
        cliente_id: 'cliente-3',
        nombre: 'Plancha de Pelo Cerámica',
        marca: 'BeautyTech',
        rnpa: 'N/A',
        categoria: 'Productos Eléctricos',
        estado: 'vigente',
        vencimiento: '2025-12-20',
        peso_neto: '800g',
        vida_util: 'N/A',
        codigo_ean: '7791234567892'
      },
      {
        id: 'prod-4',
        cliente_id: 'cliente-4',
        nombre: 'Suplemento Vitamínico',
        marca: 'NutriLife',
        rnpa: 'RNPA 04-789012',
        categoria: 'Suplementos Dietarios',
        estado: 'vigente',
        vencimiento: '2026-05-10',
        peso_neto: '120 cápsulas',
        vida_util: '24 meses',
        codigo_ean: '7791234567893'
      },
      {
        id: 'prod-5',
        cliente_id: 'cliente-5',
        nombre: 'Pet Food Premium',
        marca: 'PetCare',
        rnpa: 'RNPA 04-345678',
        categoria: 'Alimentos para Animales',
        estado: 'por_renovar',
        vencimiento: '2025-06-15',
        peso_neto: '15kg',
        vida_util: '18 meses',
        codigo_ean: '7791234567894'
      }
    ];
    
    // Filtrar productos por clienteId
    return productosMock.filter(producto => producto.cliente_id === clienteId);
  }

  // Obtener habilitaciones por cliente
  getHabilitacionesByCliente(clienteId: string): any[] {
    // Datos mock base con cliente_id
    const habilitacionesMock = [
      {
        id: 'hab-1',
        cliente_id: 'cliente-1',
        tipo: 'RNE',
        numero: '04-000123',
        establecimiento: 'Planta Elaboradora Sur',
        direccion: 'Av. Industrial 1234, Quilmes',
        vencimiento: '2027-05-15',
        estado: 'vigente',
        actividades: ['Elaboración', 'Fraccionamiento', 'Depósito']
      },
      {
        id: 'hab-2',
        cliente_id: 'cliente-2',
        tipo: 'Homologación ENACOM',
        numero: 'ENACOM-2024-456',
        establecimiento: 'Laboratorio Técnico',
        direccion: 'Av. Tecnológica 567, CABA',
        vencimiento: '2026-03-20',
        estado: 'vigente',
        actividades: ['Ensayos EMC', 'Certificación']
      },
      {
        id: 'hab-3',
        cliente_id: 'cliente-3',
        tipo: 'Certificación CE',
        numero: 'CE-2024-789',
        establecimiento: 'Planta de Manufactura',
        direccion: 'Parque Industrial 890, Córdoba',
        vencimiento: '2025-11-30',
        estado: 'vigente',
        actividades: ['Seguridad Eléctrica', 'EMC']
      },
      {
        id: 'hab-4',
        cliente_id: 'cliente-4',
        tipo: 'Habilitación ANMAT',
        numero: 'ANMAT-2024-012',
        establecimiento: 'Laboratorio Nutricional',
        direccion: 'Zona Industrial 123, Mendoza',
        vencimiento: '2026-07-15',
        estado: 'vigente',
        actividades: ['Elaboración Suplementos', 'Control Calidad']
      },
      {
        id: 'hab-5',
        cliente_id: 'cliente-5',
        tipo: 'Registro SENASA',
        numero: 'SENASA-2024-345',
        establecimiento: 'Planta Alimentos Mascotas',
        direccion: 'Ruta Nacional 678, Buenos Aires',
        vencimiento: '2025-09-10',
        estado: 'por_renovar',
        actividades: ['Elaboración Pet Food', 'Almacenamiento']
      }
    ];
    
    // Filtrar habilitaciones por clienteId
    return habilitacionesMock.filter(habilitacion => habilitacion.cliente_id === clienteId);
  }

  // Obtener comunicaciones por cliente
  getComunicacionesByCliente(clienteId: string): any[] {
    // Datos mock base con cliente_id
    const comunicacionesMock = [
      {
        id: 'com-1',
        cliente_id: 'cliente-1',
        fecha: '2025-01-25 10:30',
        tipo: 'email',
        asunto: 'Documentación pendiente',
        destinatario: 'contacto@lacteosdelsur.com',
        estado: 'enviado',
        mensaje: 'Estimado cliente, necesitamos que complete la documentación...',
        expediente_relacionado: 'SGT-2025-ANMAT-00123'
      },
      {
        id: 'com-2',
        cliente_id: 'cliente-2',
        fecha: '2025-01-24 14:15',
        tipo: 'whatsapp',
        asunto: 'Actualización de estado',
        destinatario: '+54 11 9876-5432',
        estado: 'enviado',
        mensaje: 'Su expediente de homologación avanzó al siguiente paso...',
        expediente_relacionado: 'SGT-2025-ENACOM-00087'
      },
      {
        id: 'com-3',
        cliente_id: 'cliente-3',
        fecha: '2025-01-23 16:45',
        tipo: 'email',
        asunto: 'Certificado emitido',
        destinatario: 'ventas@beautytech.com.ar',
        estado: 'enviado',
        mensaje: 'Su certificado de seguridad eléctrica ha sido emitido...',
        expediente_relacionado: 'SGT-2025-SIC-00156'
      },
      {
        id: 'com-4',
        cliente_id: 'cliente-4',
        fecha: '2025-01-22 11:20',
        tipo: 'llamada',
        asunto: 'Consulta sobre documentación',
        destinatario: '+54 11 5566-7788',
        estado: 'completado',
        mensaje: 'Llamada telefónica para aclarar requisitos de documentación...',
        expediente_relacionado: 'SGT-2025-ANMAT-00167'
      },
      {
        id: 'com-5',
        cliente_id: 'cliente-5',
        fecha: '2025-01-21 09:30',
        tipo: 'email',
        asunto: 'Expediente vencido - Acción requerida',
        destinatario: 'info@petcare.com.ar',
        estado: 'enviado',
        mensaje: 'Su expediente ha vencido. Necesitamos su respuesta urgente...',
        expediente_relacionado: 'SGT-2024-SENASA-00089'
      }
    ];
    
    // Filtrar comunicaciones por clienteId
    return comunicacionesMock.filter(comunicacion => comunicacion.cliente_id === clienteId);
  }

  // Obtener facturas por cliente
  getFacturasByCliente(clienteId: string): any[] {
    // Datos mock base con cliente_id
    const facturasMock = [
      {
        id: 'fact-1',
        cliente_id: 'cliente-1',
        numero: 'FC-A-00001-00000234',
        fecha: '2025-01-20',
        concepto: 'RNPA Yogur Natural',
        total: 544500,
        estado: 'pagada',
        fecha_pago: '2025-01-25'
      },
      {
        id: 'fact-2',
        cliente_id: 'cliente-2',
        numero: 'FC-A-00001-00000235',
        fecha: '2025-01-18',
        concepto: 'Homologación ENACOM Router WiFi',
        total: 332750,
        estado: 'pendiente',
        fecha_pago: null
      },
      {
        id: 'fact-3',
        cliente_id: 'cliente-3',
        numero: 'FC-A-00001-00000236',
        fecha: '2025-01-15',
        concepto: 'Certificación Seguridad Eléctrica',
        total: 275000,
        estado: 'pagada',
        fecha_pago: '2025-01-20'
      },
      {
        id: 'fact-4',
        cliente_id: 'cliente-4',
        numero: 'FC-A-00001-00000237',
        fecha: '2025-01-12',
        concepto: 'RNPA Suplemento Vitamínico',
        total: 425000,
        estado: 'pendiente',
        fecha_pago: null
      },
      {
        id: 'fact-5',
        cliente_id: 'cliente-5',
        numero: 'FC-A-00001-00000238',
        fecha: '2025-01-10',
        concepto: 'Registro Pet Food Premium',
        total: 380000,
        estado: 'vencida',
        fecha_pago: null
      }
    ];
    
    // Filtrar facturas por clienteId
    return facturasMock.filter(factura => factura.cliente_id === clienteId);
  }
  // ============= NUEVAS FUNCIONALIDADES =============

  // Validar documentación completa según tipo de trámite
  validarDocumentacionCompleta(tramiteTipoId: string, documentosSubidos: any[]): {
    completo: boolean;
    faltantes: string[];
    progreso: number;
  } {
    // Buscar requisitos del trámite en el catálogo
    const tramite = buscarTramitePorId(tramiteTipoId);
    
    if (!tramite || !tramite.documentacion_obligatoria) {
      return { completo: false, faltantes: [], progreso: 0 };
    }

    const requisitos = tramite.documentacion_obligatoria;
    
    const faltantes = requisitos.filter(req => 
      !documentosSubidos.some(doc => 
        doc.nombre.toLowerCase().includes(req.documento.toLowerCase()) ||
        doc.documento_requerido === req.documento
      )
    ).map(req => req.documento);
    
    const progreso = requisitos.length > 0 
      ? Math.round(((requisitos.length - faltantes.length) / requisitos.length) * 100)
      : 0;
    
    return {
      completo: faltantes.length === 0,
      faltantes,
      progreso
    };
  }
  
  // Generar checklist automático según trámite
  generarChecklistAutomatico(tramiteTipoId: string): any[] {
    const checklist: any[] = [];
    
    const tramite = buscarTramitePorId(tramiteTipoId);
    
    if (!tramite) return checklist;
    
    // Agregar documentos obligatorios
    if (tramite.documentacion_obligatoria) {
      tramite.documentacion_obligatoria.forEach((doc: any) => {
        checklist.push({
          item: doc.documento,
          obligatorio: true,
          tipo: doc.formato.toLowerCase().includes('pdf') ? 'pdf' : 
                doc.formato.toLowerCase().includes('jpg') || doc.formato.toLowerCase().includes('jpeg') ? 'imagen' :
                doc.formato.toLowerCase().includes('excel') ? 'excel' :
                doc.formato.toLowerCase().includes('word') ? 'word' : 'pdf',
          descripcion: doc.detalle || '',
          vigencia: doc.vigencia_maxima || null,
          firma_requerida: doc.firma || null,
          estado: 'pendiente'
        });
      });
    }
    
    // Agregar documentos opcionales
    if (tramite.documentacion_opcional) {
      tramite.documentacion_opcional.forEach((doc: any) => {
        checklist.push({
          item: doc.documento,
          obligatorio: false,
          tipo: doc.formato.toLowerCase().includes('pdf') ? 'pdf' : 
                doc.formato.toLowerCase().includes('jpg') || doc.formato.toLowerCase().includes('jpeg') ? 'imagen' :
                doc.formato.toLowerCase().includes('excel') ? 'excel' :
                doc.formato.toLowerCase().includes('word') ? 'word' : 'pdf',
          descripcion: doc.detalle || '',
          condicion: doc.cuando || '',
          estado: 'pendiente'
        });
      });
    }
    
    return checklist;
  }
  
  // Calcular vencimientos de documentos
  calcularVencimientoDocumentos(documentos: any[]): any[] {
    const alertas = [];
    const hoy = new Date();
    
    documentos.forEach(doc => {
      if (doc.fecha_vencimiento) {
        const vencimiento = new Date(doc.fecha_vencimiento);
        const diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diasRestantes < 0) {
          alertas.push({
            documento: doc.nombre,
            expediente_id: doc.expediente_id,
            estado: 'vencido',
            dias: Math.abs(diasRestantes),
            prioridad: 'alta',
            fecha_vencimiento: doc.fecha_vencimiento
          });
        } else if (diasRestantes <= 30) {
          alertas.push({
            documento: doc.nombre,
            expediente_id: doc.expediente_id,
            estado: 'por_vencer',
            dias: diasRestantes,
            prioridad: diasRestantes <= 7 ? 'alta' : 'media',
            fecha_vencimiento: doc.fecha_vencimiento
          });
        }
      }
    });
    
    return alertas.sort((a, b) => a.dias - b.dias);
  }

  // Obtener información detallada del trámite
  obtenerInfoTramite(tramiteTipoId: string): any {
    return buscarTramitePorId(tramiteTipoId);
  }

  // Calcular costo estimado del trámite
  calcularCostoEstimado(tramiteTipoId: string): {
    arancel: string;
    costo_estimado?: number;
    moneda: string;
  } {
    const tramite = buscarTramitePorId(tramiteTipoId);
    
    if (!tramite) {
      return { arancel: 'No disponible', moneda: 'ARS' };
    }

    // Extraer monto si está en formato numérico
    const arancelText = tramite.arancel;
    const montoMatch = arancelText.match(/\$([0-9.,]+)/);
    
    return {
      arancel: arancelText,
      costo_estimado: montoMatch ? parseFloat(montoMatch[1].replace(/[.,]/g, '')) : undefined,
      moneda: 'ARS'
    };
  }
}

// Export singleton instance
export const expedienteService = new ExpedienteService();