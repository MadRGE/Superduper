import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Check, AlertTriangle, Info, Calendar } from 'lucide-react';

const mockNotificaciones = [
  {
    id: 1,
    tipo: 'documento_requerido',
    expediente: 'SGT-2025-ANMAT-00123',
    cliente: 'Lácteos del Sur S.A.',
    asunto: 'Documentación pendiente - RNPA Yogur Natural',
    mensaje: 'Necesitamos que subas los siguientes documentos para continuar...',
    canal: 'email',
    estado: 'pendiente',
    fecha: '2025-01-25T10:30:00',
    prioridad: 'alta',
    leido: false
  },
  {
    id: 2,
    tipo: 'paso_completado',
    expediente: 'SGT-2025-ENACOM-00087',
    cliente: 'TechCorp Argentina',
    asunto: 'Tu trámite avanzó: Ensayos de laboratorio',
    mensaje: 'El expediente Router WiFi completó el paso de ensayos...',
    canal: 'email',
    estado: 'enviado',
    fecha: '2025-01-25T09:15:00',
    prioridad: 'normal',
    leido: true
  },
  {
    id: 3,
    tipo: 'observacion_recibida',
    expediente: 'SGT-2025-ANMAT-00134',
    cliente: 'NutriLife S.A.',
    asunto: 'Observación en RNPA Cereal - Acción requerida',
    mensaje: 'El organismo ANMAT realizó observaciones en tu expediente...',
    canal: 'whatsapp',
    estado: 'enviado',
    fecha: '2025-01-24T16:45:00',
    prioridad: 'urgente',
    leido: false
  },
  {
    id: 4,
    tipo: 'vencimiento_proximo',
    expediente: 'SGT-2025-SIC-00156',
    cliente: 'BeautyTech Imports',
    asunto: 'Vencimiento próximo - Certificación Plancha',
    mensaje: 'Te recordamos que el expediente vence en 3 días...',
    canal: 'email',
    estado: 'enviado',
    fecha: '2025-01-24T14:20:00',
    prioridad: 'alta',
    leido: true
  },
  {
    id: 5,
    tipo: 'certificado_emitido',
    expediente: 'SGT-2025-SIC-00142',
    cliente: 'ElectroMax S.A.',
    asunto: '✅ Certificado emitido - Seguridad Eléctrica',
    mensaje: '¡Excelente noticia! El certificado fue emitido exitosamente...',
    canal: 'email',
    estado: 'enviado',
    fecha: '2025-01-24T11:30:00',
    prioridad: 'normal',
    leido: true
  }
];

export const Notificaciones: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('todas');
  const [selectedCanal, setSelectedCanal] = useState('todos');

  const filteredNotifications = mockNotificaciones.filter(notif => {
    if (selectedFilter === 'pendientes' && notif.estado !== 'pendiente') return false;
    if (selectedFilter === 'enviadas' && notif.estado !== 'enviado') return false;
    if (selectedFilter === 'no_leidas' && notif.leido) return false;
    if (selectedCanal !== 'todos' && notif.canal !== selectedCanal) return false;
    return true;
  });

  const getIconByType = (tipo: string) => {
    switch (tipo) {
      case 'documento_requerido':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'observacion_recibida':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'certificado_emitido':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'vencimiento_proximo':
        return <Calendar className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente':
        return 'border-l-red-500 bg-red-50';
      case 'alta':
        return 'border-l-orange-500 bg-orange-50';
      case 'normal':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getChannelIcon = (canal: string) => {
    switch (canal) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notificaciones</h1>
          <p className="text-gray-600 dark:text-gray-300">Gestión de comunicaciones y alertas</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredNotifications.filter(n => !n.leido).length} no leídas de {filteredNotifications.length}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas</option>
              <option value="no_leidas">No leídas</option>
              <option value="pendientes">Pendientes</option>
              <option value="enviadas">Enviadas</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Canal</label>
            <select
              value={selectedCanal}
              onChange={(e) => setSelectedCanal(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>

          <div className="flex items-end space-x-2">
            <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
              Marcar todas como leídas
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">
            {mockNotificaciones.length}
          </div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">
            {mockNotificaciones.filter(n => n.estado === 'pendiente').length}
          </div>
          <div className="text-sm text-gray-600">Pendientes</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {mockNotificaciones.filter(n => n.estado === 'enviado').length}
          </div>
          <div className="text-sm text-gray-600">Enviadas</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">
            {mockNotificaciones.filter(n => !n.leido).length}
          </div>
          <div className="text-sm text-gray-600">No leídas</div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Notificaciones ({filteredNotifications.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {filteredNotifications.map((notificacion) => (
            <div 
              key={notificacion.id} 
              className={`border-l-4 ${getPriorityColor(notificacion.prioridad)} ${!notificacion.leido ? 'bg-opacity-75' : 'bg-opacity-25'}`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {getIconByType(notificacion.tipo)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`font-medium ${!notificacion.leido ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notificacion.asunto}
                        </h3>
                        {!notificacion.leido && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {notificacion.expediente} • {notificacion.cliente}
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {notificacion.mensaje}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 ml-4">
                    <div className="flex items-center space-x-1 text-gray-500">
                      {getChannelIcon(notificacion.canal)}
                      <span className="text-xs uppercase">{notificacion.canal}</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        notificacion.estado === 'enviado' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {notificacion.estado}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(notificacion.fecha).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
          <p className="text-gray-500">No se encontraron notificaciones con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
};