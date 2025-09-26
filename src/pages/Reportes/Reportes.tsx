import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Download, Filter } from 'lucide-react';

export const Reportes: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');
  const [selectedType, setSelectedType] = useState('general');

  const reportes = [
    {
      id: 'general',
      title: 'Reporte General de Expedientes',
      description: 'Vista general de todos los expedientes por estado y organismo',
      metrics: ['Total expedientes', 'Estados', 'Tiempos promedio', 'Distribución por organismo']
    },
    {
      id: 'performance',
      title: 'Reporte de Performance',
      description: 'Análisis de tiempos y eficiencia de trámites',
      metrics: ['SLA compliance', 'Tiempo promedio', 'Cuellos de botella', 'Productividad']
    },
    {
      id: 'client',
      title: 'Reporte por Cliente',
      description: 'Actividad y historial por cliente específico',
      metrics: ['Expedientes por cliente', 'Satisfacción', 'Frecuencia', 'Ingresos']
    },
    {
      id: 'organismo',
      title: 'Reporte por Organismo',
      description: 'Análisis de trámites por organismo regulatorio',
      metrics: ['Volumen por organismo', 'Tiempos de respuesta', 'Observaciones', 'Aprobaciones']
    }
  ];

  const metricsData = {
    totalExpedientes: 247,
    completados: 156,
    enProceso: 68,
    vencidos: 12,
    observados: 11,
    tiempoPromedio: 32,
    slaCompliance: 87,
    satisfaccionCliente: 4.2
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reportes y Análisis</h1>
          <p className="text-gray-600 dark:text-gray-300">Métricas y estadísticas de rendimiento</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="last7days">Últimos 7 días</option>
              <option value="last30days">Últimos 30 días</option>
              <option value="last90days">Últimos 90 días</option>
              <option value="thisyear">Este año</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Reporte</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {reportes.map((reporte) => (
                <option key={reporte.id} value={reporte.id}>
                  {reporte.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
              Generar Reporte
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expedientes</p>
              <p className="text-2xl font-bold text-gray-900">{metricsData.totalExpedientes}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-green-600">
            ↑ 12% vs mes anterior
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completados</p>
              <p className="text-2xl font-bold text-gray-900">{metricsData.completados}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-green-600">
            ↑ 8% vs mes anterior
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
              <p className="text-2xl font-bold text-gray-900">{metricsData.tiempoPromedio}d</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-red-600">
            ↑ 3% vs mes anterior
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">SLA Compliance</p>
              <p className="text-2xl font-bold text-gray-900">{metricsData.slaCompliance}%</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-green-600">
            ↑ 5% vs mes anterior
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estados Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Estados</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completados</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '63%' }} />
                </div>
                <span className="text-sm font-medium text-gray-900">{metricsData.completados}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">En Proceso</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '28%' }} />
                </div>
                <span className="text-sm font-medium text-gray-900">{metricsData.enProceso}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Vencidos</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '5%' }} />
                </div>
                <span className="text-sm font-medium text-gray-900">{metricsData.vencidos}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Observados</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '4%' }} />
                </div>
                <span className="text-sm font-medium text-gray-900">{metricsData.observados}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Organismos Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance por Organismo</h3>
          <div className="space-y-4">
            {[
              { organismo: 'ANMAT/INAL', expedientes: 98, tiempo: 28 },
              { organismo: 'ENACOM', expedientes: 67, tiempo: 35 },
              { organismo: 'SIC', expedientes: 45, tiempo: 25 },
              { organismo: 'SENASA', expedientes: 37, tiempo: 42 }
            ].map((item) => (
              <div key={item.organismo} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.organismo}</p>
                  <p className="text-sm text-gray-600">{item.expedientes} expedientes</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{item.tiempo}d</p>
                  <p className="text-xs text-gray-500">promedio</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Available Reports */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Reportes Disponibles</h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {reportes.map((reporte) => (
            <div key={reporte.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{reporte.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{reporte.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {reporte.metrics.map((metric) => (
                      <span key={metric} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="ml-4">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Generar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};