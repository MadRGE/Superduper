export interface Notification {
  id: string;
  expediente_id: string;
  tipo: string;
  template_code: string;
  destinatario_email: string;
  canal: 'email' | 'whatsapp' | 'in-app';
  asunto: string;
  mensaje: string;
  variables: Record<string, any>;
  estado: 'pendiente' | 'enviado' | 'error';
  fecha_programada?: string;
  fecha_envio?: string;
  created_at: string;
}

export class NotificationService {
  private readonly QUEUE_KEY = 'sgt_notification_queue';
  private readonly HISTORY_KEY = 'sgt_notification_history';

  // Templates predefinidos
  private templates = {
    EXPEDIENTE_CREADO: {
      subject: 'Nuevo expediente {{expediente_codigo}} - {{tramite_nombre}}',
      body: `Hola {{cliente_nombre}},\n\nSe ha creado el expediente {{expediente_codigo}} para el trámite {{tramite_nombre}}.\n\nFecha límite: {{fecha_limite}}\n\nSaludos,\nEquipo SGT`
    },
    DOCUMENTO_REQUERIDO: {
      subject: '⚠️ Documentación pendiente - {{tramite_nombre}}',
      body: `Hola {{cliente_nombre}},\n\nNecesitamos que subas los siguientes documentos:\n{{documentos_pendientes}}\n\nFecha límite: {{fecha_limite}}`
    },
    VENCIMIENTO_PROXIMO: {
      subject: '⚠️ Tu trámite vence en {{dias_restantes}} días',
      body: `Hola {{cliente_nombre}},\n\nTu expediente {{expediente_codigo}} vence en {{dias_restantes}} días.\n\nPor favor, completa las tareas pendientes.`
    },
    ESTADO_CAMBIADO: {
      subject: 'Cambio de estado - {{expediente_alias}}',
      body: `El expediente {{expediente_codigo}} cambió de {{estado_anterior}} a {{estado_nuevo}}.`
    }
  };

  // Crear notificación
  async crearNotificacion(data: {
    expediente_id: string;
    template_code: string;
    destinatario_email: string;
    variables: Record<string, any>;
    canal?: 'email' | 'whatsapp' | 'in-app';
    fecha_programada?: string;
  }): Promise<Notification> {
    const template = this.templates[data.template_code as keyof typeof this.templates];
    if (!template) throw new Error('Template no encontrado');

    const notification: Notification = {
      id: this.generateId(),
      expediente_id: data.expediente_id,
      tipo: data.template_code,
      template_code: data.template_code,
      destinatario_email: data.destinatario_email,
      canal: data.canal || 'email',
      asunto: this.processTemplate(template.subject, data.variables),
      mensaje: this.processTemplate(template.body, data.variables),
      variables: data.variables,
      estado: 'pendiente',
      fecha_programada: data.fecha_programada,
      created_at: new Date().toISOString()
    };

    // Agregar a la cola
    const queue = this.getQueue();
    queue.push(notification);
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));

    // Si no está programada, enviar inmediatamente
    if (!data.fecha_programada) {
      await this.enviarNotificacion(notification);
    }

    return notification;
  }

  // Procesar template con variables
  private processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, variables[key]);
    });
    return processed;
  }

  // Enviar notificación
  async enviarNotificacion(notification: Notification): Promise<void> {
    try {
      // Simulación de envío
      console.log('📧 Enviando notificación:', {
        to: notification.destinatario_email,
        subject: notification.asunto,
        body: notification.mensaje,
        canal: notification.canal
      });

      // Marcar como enviada
      notification.estado = 'enviado';
      notification.fecha_envio = new Date().toISOString();

      // Actualizar en cola
      const queue = this.getQueue();
      const index = queue.findIndex(n => n.id === notification.id);
      if (index > -1) {
        queue.splice(index, 1);
      }
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));

      // Agregar a historial
      const history = this.getHistory();
      history.push(notification);
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));

      // Mostrar toast notification in-app
      this.showInAppNotification(notification);
    } catch (error) {
      notification.estado = 'error';
      console.error('Error enviando notificación:', error);
    }
  }

  // Procesar cola de notificaciones
  async procesarCola(): Promise<void> {
    const queue = this.getQueue();
    const now = new Date();

    for (const notification of queue) {
      // Si está programada y es hora de enviarla
      if (notification.fecha_programada) {
        const scheduledDate = new Date(notification.fecha_programada);
        if (scheduledDate <= now) {
          await this.enviarNotificacion(notification);
        }
      } else if (notification.estado === 'pendiente') {
        // Si no está programada y está pendiente, enviar
        await this.enviarNotificacion(notification);
      }
    }
  }

  // Notificaciones in-app
  private showInAppNotification(notification: Notification): void {
    // Crear elemento DOM para notificación
    const notifElement = document.createElement('div');
    notifElement.className = 'fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-sm z-50 animate-slide-in';
    notifElement.innerHTML = `
      <div class="flex items-start">
        <div class="flex-1">
          <h4 class="font-medium text-gray-900">${notification.asunto}</h4>
          <p class="text-sm text-gray-600 mt-1">${notification.mensaje.substring(0, 100)}...</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(notifElement);

    // Auto-remove después de 5 segundos
    setTimeout(() => {
      notifElement.remove();
    }, 5000);
  }

  // Helpers
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getQueue(): Notification[] {
    const data = localStorage.getItem(this.QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  }

  getHistory(): Notification[] {
    const data = localStorage.getItem(this.HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Notificaciones automáticas por evento
  async notificarCambioEstado(expediente: any, estadoAnterior: string, estadoNuevo: string): Promise<void> {
    await this.crearNotificacion({
      expediente_id: expediente.id,
      template_code: 'ESTADO_CAMBIADO',
      destinatario_email: expediente.cliente_email,
      variables: {
        expediente_codigo: expediente.codigo,
        expediente_alias: expediente.alias,
        estado_anterior: estadoAnterior,
        estado_nuevo: estadoNuevo,
        cliente_nombre: expediente.cliente_nombre
      }
    });
  }

  async notificarVencimientoProximo(expediente: any, diasRestantes: number): Promise<void> {
    await this.crearNotificacion({
      expediente_id: expediente.id,
      template_code: 'VENCIMIENTO_PROXIMO',
      destinatario_email: expediente.cliente_email,
      variables: {
        expediente_codigo: expediente.codigo,
        expediente_alias: expediente.alias,
        dias_restantes: diasRestantes,
        fecha_limite: new Date(expediente.fecha_limite).toLocaleDateString('es-AR'),
        cliente_nombre: expediente.cliente_nombre
      }
    });
  }
}