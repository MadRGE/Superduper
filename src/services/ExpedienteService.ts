import { Expediente, Cliente, TramiteTipo, Organismo } from '../types/database';

export interface ExpedienteFormData {
  tramite_tipo_id: string;
  cliente_id: string;
  alias: string;
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  despachante_id?: string;
  observaciones?: string;
  documentos: any[];
}

export interface TareaAutomatica {
  id: string;
  expediente_id: string;
  paso_id: string;
  nombre: string;
  estado: 'pendiente' | 'en_proceso' | 'completado';
  orden: number;
  sla_dias: number;
  rol_responsable: string;
  created_at: string;
}

class ExpedienteService {
  // Generar código único para expediente
  generarCodigo(organismoSigla: string): string {
    const year = new Date().getFullYear();
    
    // Obtener expedientes existentes para generar número secuencial
    const expedientes = this.obtenerExpedientes();
    const expedientesDelOrganismo = expedientes.filter(exp => 
      exp.codigo.includes(organismoSigla)
    );
    
    const ultimoNumero = expedientesDelOrganismo.length > 0 
      ? Math.max(...expedientesDelOrganismo.map(exp => {
          const match = exp.codigo.match(/-(\d+)$/);
          return match ? parseInt(match[1]) : 0;
        }))
      : 0;
    
    const nuevoNumero = (ultimoNumero + 1).toString().padStart(5, '0');
    
    // Limpiar sigla para código (reemplazar / con -)
    const siglaLimpia = organismoSigla.replace('/', '-');
    
    return `SGT-${year}-${siglaLimpia}-${nuevoNumero}`;
  }

  // Calcular fecha límite considerando días hábiles
  calcularFechaLimite(sla_dias: number): Date {
    const fecha = new Date();
    let diasAgregados = 0;
    
    while (diasAgregados < sla_dias) {
      fecha.setDate(fecha.getDate() + 1);
      
      // Saltar fines de semana (0 = domingo, 6 = sábado)
      if (fecha.getDay() !== 0 && fecha.getDay() !== 6) {
        diasAgregados++;
      }
    }
    
    return fecha;
  }

  // Obtener expedientes desde localStorage
  obtenerExpedientes(): Expediente[] {
    try {
      const expedientes = localStorage.getItem('sgt_expedientes');
      return expedientes ? JSON.parse(expedientes) : [];
    } catch (error) {
      console.error('Error al obtener expedientes:', error);
      return [];
    }
  }

  // Guardar expedientes en localStorage
  guardarExpedientes(expedientes: Expediente[]): void {
    try {
      localStorage.setItem('sgt_expedientes', JSON.stringify(expedientes));
    } catch (error) {
      console.error('Error al guardar expedientes:', error);
    }
  }

  // Crear nuevo expediente
  async crearExpediente(
    data: ExpedienteFormData, 
    tramiteTipo: TramiteTipo, 
    organismo: Organismo,
    cliente: Cliente
  ): Promise<Expediente> {
    try {
      const expediente: Expediente = {
        id: crypto.randomUUID(),
        codigo: this.generarCodigo(organismo.sigla),
        alias: data.alias,
        tramite_tipo_id: data.tramite_tipo_id,
        cliente_id: data.cliente_id,
        despachante_id: data.despachante_id,
        estado: 'iniciado',
        prioridad: data.prioridad,
        fecha_inicio: new Date(),
        fecha_limite: this.calcularFechaLimite(tramiteTipo.sla_total_dias || 30),
        fecha_completado: undefined,
        paso_actual: 1,
        observaciones: data.observaciones,
        metadata: {
          documentos_subidos: data.documentos.length,
          checklist_completado: false
        },
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        // Relaciones
        tramite_tipo: tramiteTipo,
        cliente: cliente,
        documentos: []
      };

      // Guardar expediente
      const expedientes = this.obtenerExpedientes();
      expedientes.push(expediente);
      this.guardarExpedientes(expedientes);

      // Crear tareas automáticas
      await this.crearTareasAutomaticas(expediente.id, data.tramite_tipo_id);

      return expediente;
    } catch (error) {
      console.error('Error al crear expediente:', error);
      throw new Error('No se pudo crear el expediente');
    }
  }

  // Crear tareas automáticas según el tipo de trámite
  async crearTareasAutomaticas(expedienteId: string, tramiteTipoId: string): Promise<void> {
    try {
      const pasos = this.obtenerPasosPorTramite(tramiteTipoId);
      
      const tareas: TareaAutomatica[] = pasos.map((paso, index) => ({
        id: crypto.randomUUID(),
        expediente_id: expedienteId,
        paso_id: paso.id,
        nombre: paso.nombre,
        estado: index === 0 ? 'en_proceso' : 'pendiente',
        orden: paso.orden,
        sla_dias: paso.sla_dias,
        rol_responsable: paso.rol_responsable,
        created_at: new Date().toISOString()
      }));

      // Guardar tareas en localStorage
      localStorage.setItem(`sgt_tareas_${expedienteId}`, JSON.stringify(tareas));
    } catch (error) {
      console.error('Error al crear tareas automáticas:', error);
    }
  }

  // Obtener pasos por tipo de trámite (mock data)
  obtenerPasosPorTramite(tramiteTipoId: string) {
    const pasosPorTramite: Record<string, any[]> = {
      'TT-INAL-002': [
        { id: '1', nombre: 'Relevamiento inicial', orden: 1, sla_dias: 3, rol_responsable: 'gestor' },
        { id: '2', nombre: 'Preparación documentación', orden: 2, sla_dias: 5, rol_responsable: 'gestor' },
        { id: '3', nombre: 'Revisión cliente', orden: 3, sla_dias: 7, rol_responsable: 'cliente' },
        { id: '4', nombre: 'Presentación SIFeGA', orden: 4, sla_dias: 2, rol_responsable: 'gestor' },
        { id: '5', nombre: 'Evaluación INAL', orden: 5, sla_dias: 20, rol_responsable: 'organismo' },
        { id: '6', nombre: 'Respuesta observaciones', orden: 6, sla_dias: 5, rol_responsable: 'cliente' },
        { id: '7', nombre: 'Emisión RNPA', orden: 7, sla_dias: 2, rol_responsable: 'organismo' },
        { id: '8', nombre: 'Entrega al cliente', orden: 8, sla_dias: 1, rol_responsable: 'gestor' }
      ],
      'TT-ENACOM-001': [
        { id: '1', nombre: 'Análisis documentación', orden: 1, sla_dias: 5, rol_responsable: 'gestor' },
        { id: '2', nombre: 'Preparación expediente', orden: 2, sla_dias: 3, rol_responsable: 'gestor' },
        { id: '3', nombre: 'Presentación RAMATEL', orden: 3, sla_dias: 2, rol_responsable: 'gestor' },
        { id: '4', nombre: 'Evaluación técnica', orden: 4, sla_dias: 25, rol_responsable: 'organismo' },
        { id: '5', nombre: 'Ensayos laboratorio', orden: 5, sla_dias: 10, rol_responsable: 'organismo' },
        { id: '6', nombre: 'Emisión certificado', orden: 6, sla_dias: 3, rol_responsable: 'organismo' },
        { id: '7', nombre: 'Entrega certificado', orden: 7, sla_dias: 1, rol_responsable: 'gestor' }
      ],
      'TT-SIC-001': [
        { id: '1', nombre: 'Revisión documentación', orden: 1, sla_dias: 3, rol_responsable: 'gestor' },
        { id: '2', nombre: 'Presentación TAD', orden: 2, sla_dias: 2, rol_responsable: 'gestor' },
        { id: '3', nombre: 'Evaluación SIC', orden: 3, sla_dias: 20, rol_responsable: 'organismo' },
        { id: '4', nombre: 'Ensayos seguridad', orden: 4, sla_dias: 8, rol_responsable: 'organismo' },
        { id: '5', nombre: 'Emisión certificado', orden: 5, sla_dias: 2, rol_responsable: 'organismo' }
      ]
    };

    return pasosPorTramite[tramiteTipoId] || [
      { id: '1', nombre: 'Inicio trámite', orden: 1, sla_dias: 5, rol_responsable: 'gestor' },
      { id: '2', nombre: 'Procesamiento', orden: 2, sla_dias: 15, rol_responsable: 'organismo' },
      { id: '3', nombre: 'Finalización', orden: 3, sla_dias: 3, rol_responsable: 'gestor' }
    ];
  }

  // Obtener tareas de un expediente
  obtenerTareasExpediente(expedienteId: string): TareaAutomatica[] {
    try {
      const tareas = localStorage.getItem(`sgt_tareas_${expedienteId}`);
      return tareas ? JSON.parse(tareas) : [];
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      return [];
    }
  }

  // Validar si se puede crear el expediente
  validarCreacion(data: ExpedienteFormData): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!data.tramite_tipo_id) {
      errores.push('Debe seleccionar un tipo de trámite');
    }

    if (!data.cliente_id) {
      errores.push('Debe seleccionar o crear un cliente');
    }

    if (!data.alias || data.alias.trim().length < 3) {
      errores.push('El alias debe tener al menos 3 caracteres');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }
}

export const expedienteService = new ExpedienteService();