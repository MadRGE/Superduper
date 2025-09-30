import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle,
  Calendar,
  Phone,
  Mail,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { useSGT } from '../../context/SGTContext';

interface DashboardCard {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
  details?: string;
  action?: string;
}

interface AlertItem {
  id: string;
  type: 'urgent' | 'warning' | 'info';
  title: string;
  description: string;
  date: string;
  actionRequired: boolean;
}

export const EnhancedDashboard: React.FC = () => {
  const { state } = useSGT();
  const [refreshTime, setRefreshTime] = useState(new Date());
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  // Calculate comprehensive metrics
  const metrics = React.useMemo(() => {
    const totalExpedientes = state.expedientes.length;
    const activeClients = state.clientes?.filter(c => c.is_active).length || 0;
    const completedToday = state.expedientes.filter(e =>
      e.fecha_completado && new Date(e.fecha_completado).toDateString() === new Date().toDateString()
    ).length;

    const overdueExpedientes = state.expedientes.filter(e =>
      e.fecha_limite && new Date(e.fecha_limite) < new Date() && e.estado !== 'completado'
    ).length;

    return {
      totalExpedientes,
      activeClients,
      completedToday,
      overdueExpedientes,
      pendingInvoices: 12, // Mock data - would come from financial module
      totalRevenue: 285600, // Mock data
      monthlyGrowth: 8.5,
      avgProcessingTime: 18.5
    };
  }, [state]);

  // Priority alerts and notifications
  const alerts: AlertItem[] = [
    {
      id: '1',
      type: 'urgent',
      title: 'Expedientes Vencidos',
      description: `${metrics.overdueExpedientes} expedientes requieren atención inmediata`,
      date: new Date().toISOString(),
      actionRequired: true
    },
    {
      id: '2',
      type: 'warning',
      title: 'Facturas Pendientes',
      description: `${metrics.pendingInvoices} facturas por cobrar`,
      date: new Date().toISOString(),
      actionRequired: true
    },
    {
      id: '3',
      type: 'info',
      title: 'Nuevos Clientes',
      description: '3 nuevos clientes registrados esta semana',
      date: new Date().toISOString(),
      actionRequired: false
    }
  ];

  const dashboardCards: DashboardCard[] = [
    {
      title: 'Expedientes Activos',
      value: metrics.totalExpedientes,
      change: '+12%',
      changeType: 'positive',
      icon: FileText,
      color: 'blue',
      details: 'vs. mes anterior',
      action: 'Ver todos'
    },
    {
      title: 'Clientes Activos',
      value: metrics.activeClients,
      change: '+5%',
      changeType: 'positive',
      icon: Users,
      color: 'green',
      details: 'base de clientes',
      action: 'Gestionar'
    },
    {
      title: 'Ingresos del Mes',
      value: `$${metrics.totalRevenue.toLocaleString()}`,
      change: `+${metrics.monthlyGrowth}%`,
      changeType: 'positive',
      icon: DollarSign,
      color: 'emerald',
      details: 'vs. mes anterior',
      action: 'Ver detalles'
    },
    {
      title: 'Completados Hoy',
      value: metrics.completedToday,
      change: '+15%',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'indigo',
      details: 'expedientes finalizados',
      action: 'Revisar'
    },
    {
      title: 'Vencidos',
      value: metrics.overdueExpedientes,
      change: '-8%',
      changeType: metrics.overdueExpedientes > 0 ? 'negative' : 'positive',
      icon: AlertTriangle,
      color: 'red',
      details: 'requieren atención',
      action: 'Atender'
    },
    {
      title: 'Tiempo Promedio',
      value: `${metrics.avgProcessingTime}d`,
      change: '-12%',
      changeType: 'positive',
      icon: Clock,
      color: 'orange',
      details: 'días de procesamiento',
      action: 'Optimizar'
    }
  ];

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    emerald: 'from-emerald-500 to-emerald-600',
    indigo: 'from-indigo-500 to-indigo-600',
    red: 'from-red-500 to-red-600',
    orange: 'from-orange-500 to-orange-600'
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'urgent': return AlertTriangle;
      case 'warning': return Clock;
      default: return CheckCircle;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'border-red-200 bg-red-50 text-red-800';
      case 'warning': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      default: return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Dashboard Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Panel de Control Integral
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Visión completa de tu negocio • Última actualización: {refreshTime.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 3 meses</option>
                <option value="1y">Último año</option>
              </select>
              <button
                onClick={() => setRefreshTime(new Date())}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Priority Alerts Bar */}
        {alerts.filter(a => a.actionRequired).length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-red-800">Atención Requerida</h3>
                  <p className="text-red-600 text-sm">
                    {alerts.filter(a => a.actionRequired).length} elementos requieren tu atención inmediata
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Revisar Todo
              </button>
            </div>
          </div>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {dashboardCards.map((card) => (
            <div key={card.title} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[card.color]} text-white`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div className={`text-sm font-medium ${
                    card.changeType === 'positive' ? 'text-green-600' :
                    card.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {card.change}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {card.title}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {card.details}
                  </p>
                </div>
                {card.action && (
                  <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    {card.action} →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Section - Process Overview */}
          <div className="lg:col-span-3 space-y-6">
            {/* Active Processes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Expedientes en Proceso
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Filter className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {state.expedientes.slice(0, 5).map((exp) => (
                    <div key={exp.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {exp.codigo} - {exp.alias}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Cliente: {state.clientes?.find(c => c.id === exp.cliente_id)?.razon_social}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          exp.estado === 'completado' ? 'bg-green-100 text-green-800' :
                          exp.estado === 'vencido' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {exp.estado}
                        </span>
                        <span className="text-sm text-gray-500">
                          Paso {exp.paso_actual}/5
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Estado Financiero
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Ingresos del Mes</span>
                    <span className="font-semibold text-green-600">$285,600</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Gastos del Mes</span>
                    <span className="font-semibold text-red-600">$142,300</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">Beneficio Neto</span>
                    <span className="font-bold text-blue-600">$143,300</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Cobranzas Pendientes
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">0-30 días</span>
                    <span className="font-semibold">$45,200</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">31-60 días</span>
                    <span className="font-semibold text-yellow-600">$28,500</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">+60 días</span>
                    <span className="font-semibold text-red-600">$12,800</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Alerts & Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Acciones Rápidas
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <FileText className="w-4 h-4 mr-2" />
                  Nuevo Expediente
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Users className="w-4 h-4 mr-2" />
                  Añadir Cliente
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Generar Factura
                </button>
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Alertas y Notificaciones
              </h3>
              <div className="space-y-3">
                {alerts.map((alert) => {
                  const Icon = getAlertIcon(alert.type);
                  return (
                    <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
                      <div className="flex items-start">
                        <Icon className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{alert.title}</h4>
                          <p className="text-xs mt-1 opacity-75">{alert.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Estadísticas Rápidas
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Esta Semana
                  </span>
                  <span className="font-semibold">+23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Llamadas
                  </span>
                  <span className="font-semibold">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Emails
                  </span>
                  <span className="font-semibold">126</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};