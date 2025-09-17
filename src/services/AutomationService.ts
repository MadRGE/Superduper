import { ExpedienteService } from './ExpedienteService';
import { NotificationService } from './NotificationService';

export class AutomationService {
  private expedienteService: ExpedienteService;
  private notificationService: NotificationService;
  private intervalId: number | null = null;

  constructor() {
    this.expedienteService = new ExpedienteService();
    this.notificationService = new NotificationService();
  }

  // Iniciar automatizaciones
  start(): void {
    if (this.intervalId) return; // Ya está corriendo

    // Ejecutar cada minuto
    this.intervalId = window.setInterval(() => {
      this.run();
    }, 60000); // 60 segundos

    // Ejecutar inmediatamente
    this.run();
  }

  // Detener automatizaciones
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Ejecutar todas las automatizaciones
  private async run(): Promise<void> {
    console.log('🤖 Ejecutando automatizaciones...', new Date().toLocaleTimeString());

    try {
      await this.checkVencimientos();
      await this.checkDocumentosPendientes();
      await this.checkRenovaciones();
      await this.procesarColaNotificaciones();
      await this.actualizarSemaforos();
    } catch (error) {
      console.error('Error en automatizaciones:', error);
    }
  }

  // 1. Verificar vencimientos y actualizar semáforos
  private async checkVencimientos(): Promise<void> {
    const expedientes = this.expedienteService.getExpedientes();
    const hoy = new Date();

    for (const expediente of expedientes) {
      if (['completado', 'cancelado'].includes(expediente.estado)) continue;

      const fechaLimite = new Date(expediente.fecha_limite);
      const diasRestantes = Math.ceil((fechaLimite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

      // Actualizar semáforo
      let semaforo = 'verde';
      if (diasRestantes < 0) {
        semaforo = 'rojo';
        // Cambiar estado a vencido si corresponde
        if (expediente.estado !== 'vencido') {
          await this.expedienteService.cambiarEstado(expediente.id, 'vencido', 'Vencimiento automático');
        }
      } else if (diasRestantes <= 3) {
        semaforo = 'amarillo';
      }

      // Guardar semáforo
      this.actualizarSemaforo(expediente.id, semaforo);

      // Enviar notificaciones según el caso
      if (diasRestantes === 3) {
        await this.notificationService.notificarVencimientoProximo(expediente, diasRestantes);
      } else if (diasRestantes === 1) {
        await this.notificationService.notificarVencimientoProximo(expediente, diasRestantes);
      } else if (diasRestantes === 0) {
        await this.notificationService.crearNotificacion({
          expediente_id: expediente.id,
          template_code: 'VENCIMIENTO_PROXIMO',
          destinatario_email: expediente.cliente_email || 'cliente@example.com',
          variables: {
            expediente_codigo: expediente.codigo,
            expediente_alias: expediente.alias,
            dias_restantes: 0,
            cliente_nombre: 'Cliente'
          }
        });
      }
    }
  }

  // 2. Verificar documentos pendientes
  private async checkDocumentosPendientes(): Promise<void> {
    const expedientes = this.expedienteService.getExpedientes();

    for (const expediente of expedientes) {
      if (!['iniciado', 'en_proceso'].includes(expediente.estado)) continue;

      const documentos = this.expedienteService.getDocumentosPorExpediente(expediente.id);
      const obligatoriosPendientes = documentos.filter(d => d.obligatorio && d.estado === 'pendiente');

      if (obligatoriosPendientes.length > 0) {
        // Verificar último recordatorio
        const ultimoRecordatorio = this.getUltimoRecordatorio(expediente.id, 'DOCUMENTO_REQUERIDO');
        const haceUnDia = new Date(Date.now() - 24 * 60 * 60 * 1000);

        if (!ultimoRecordatorio || new Date(ultimoRecordatorio) < haceUnDia) {
          await this.notificationService.crearNotificacion({
            expediente_id: expediente.id,
            template_code: 'DOCUMENTO_REQUERIDO',
            destinatario_email: expediente.cliente_email || 'cliente@example.com',
            variables: {
              expediente_codigo: expediente.codigo,
              tramite_nombre: expediente.alias,
              documentos_pendientes: obligatoriosPendientes.map(d => `- ${d.nombre}`).join('\n'),
              fecha_limite: new Date(expediente.fecha_limite).toLocaleDateString('es-AR'),
              cliente_nombre: 'Cliente'
            }
          });

          this.guardarRecordatorio(expediente.id, 'DOCUMENTO_REQUERIDO');
        }
      }
    }
  }

  // 3. Verificar renovaciones próximas
  private async checkRenovaciones(): Promise<void> {
    const expedientes = this.expedienteService.getExpedientes();
    const hoy = new Date();

    for (const expediente of expedientes) {
      if (expediente.estado !== 'completado') continue;

      // Simular fecha de vencimiento del certificado (ej: 1 año después de completado)
      const fechaCompletado = new Date(expediente.fecha_completado || expediente.fecha_limite);
      const fechaVencimientoCertificado = new Date(fechaCompletado);
      fechaVencimientoCertificado.setFullYear(fechaVencimientoCertificado.getFullYear() + 1);

      const diasHastaVencimiento = Math.ceil(
        (fechaVencimientoCertificado.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Si faltan 30 días para vencer, crear expediente de renovación
      if (diasHastaVencimiento === 30) {
        await this.crearExpedienteRenovacion(expediente);
      }
    }
  }

  // 4. Procesar cola de notificaciones
  private async procesarColaNotificaciones(): Promise<void> {
    await this.notificationService.procesarCola();
  }

  // 5. Actualizar semáforos en localStorage
  private async actualizarSemaforos(): Promise<void> {
    const expedientes = this.expedienteService.getExpedientes();
    const semaforos: Record<string, string> = {};

    for (const expediente of expedientes) {
      const fechaLimite = new Date(expediente.fecha_limite);
      const hoy = new Date();
      const diasRestantes = Math.ceil((fechaLimite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

      let color = 'verde';
      if (diasRestantes < 0) color = 'rojo';
      else if (diasRestantes <= 3) color = 'amarillo';

      semaforos[expediente.id] = color;
    }

    localStorage.setItem('sgt_semaforos', JSON.stringify(semaforos));
  }

  // Helpers
  private actualizarSemaforo(expedienteId: string, color: string): void {
    const semaforos = JSON.parse(localStorage.getItem('sgt_semaforos') || '{}');
    semaforos[expedienteId] = color;
    localStorage.setItem('sgt_semaforos', JSON.stringify(semaforos));
  }

  private getUltimoRecordatorio(expedienteId: string, tipo: string): string | null {
    const recordatorios = JSON.parse(
      localStorage.getItem(`sgt_recordatorios_${expedienteId}`) || '{}'
    );
    return recordatorios[tipo] || null;
  }

  private guardarRecordatorio(expedienteId: string, tipo: string): void {
    const recordatorios = JSON.parse(
      localStorage.getItem(`sgt_recordatorios_${expedienteId}`) || '{}'
    );
    recordatorios[tipo] = new Date().toISOString();
    localStorage.setItem(`sgt_recordatorios_${expedienteId}`, JSON.stringify(recordatorios));
  }

  private async crearExpedienteRenovacion(expedienteOriginal: any): Promise<void> {
    // Verificar si ya existe renovación
    const expedientes = this.expedienteService.getExpedientes();
    const yaExisteRenovacion = expedientes.some(
      e => e.observaciones?.includes(`Renovación de ${expedienteOriginal.codigo}`)
    );

    if (yaExisteRenovacion) return;

    // Crear expediente de renovación
    await this.expedienteService.crearExpediente({
      tramite_tipo_id: expedienteOriginal.tramite_tipo_id,
      cliente_id: expedienteOriginal.cliente_id,
      alias: `Renovación - ${expedienteOriginal.alias}`,
      prioridad: 'normal',
      observaciones: `Renovación automática de ${expedienteOriginal.codigo}`,
      documentos: []
    });

    // Notificar al cliente
    await this.notificationService.crearNotificacion({
      expediente_id: expedienteOriginal.id,
      template_code: 'EXPEDIENTE_CREADO',
      destinatario_email: expedienteOriginal.cliente_email || 'cliente@example.com',
      variables: {
        expediente_codigo: expedienteOriginal.codigo,
        tramite_nombre: `Renovación - ${expedienteOriginal.alias}`,
        fecha_limite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-AR'),
        cliente_nombre: 'Cliente'
      }
    });
  }
}

// Singleton para inicializar automáticamente
let automationInstance: AutomationService | null = null;

export function startAutomations(): void {
  if (!automationInstance) {
    automationInstance = new AutomationService();
    automationInstance.start();
    console.log('✅ Automatizaciones iniciadas');
  }
}

export function stopAutomations(): void {
  if (automationInstance) {
    automationInstance.stop();
    automationInstance = null;
    console.log('⏹️ Automatizaciones detenidas');
  }
}