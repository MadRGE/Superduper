import React from 'react';
import { BarChart3 } from 'lucide-react';

export const VencimientoChart: React.FC = () => {
  const chartData = [
    { label: 'Ene', vencen: 12, completados: 8 },
    { label: 'Feb', vencen: 18, completados: 15 },
    { label: 'Mar', vencen: 24, completados: 20 },
    { label: 'Abr', vencen: 15, completados: 18 },
    { label: 'May', vencen: 20, completados: 16 },
    { label: 'Jun', vencen: 16, completados: 14 },
  ];

  const maxValue = Math.max(...chartData.map(d => Math.max(d.vencen, d.completados)));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Vencimientos vs Completados</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Vencen este mes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Completados</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-end justify-between space-x-2 h-64">
          {chartData.map((data) => (
            <div key={data.label} className="flex-1 flex flex-col items-center">
              <div className="w-full flex justify-center items-end space-x-1 flex-1">
                <div className="flex flex-col items-center space-y-1">
                  <div 
                    className="w-8 bg-orange-500 rounded-t"
                    style={{ height: `${(data.vencen / maxValue) * 200}px` }}
                  />
                  <span className="text-xs text-gray-500">{data.vencen}</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div 
                    className="w-8 bg-green-500 rounded-t"
                    style={{ height: `${(data.completados / maxValue) * 200}px` }}
                  />
                  <span className="text-xs text-gray-500">{data.completados}</span>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-700 mt-2">
                {data.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};