import React from 'react';
import { ResumenCompacto } from './ResumenCompacto';
import { ExpedientesConProblemas } from './ExpedientesConProblemas';
import { ActiveExpedientes } from './ActiveExpedientes';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Panel de Control</h1>
          <p className="text-gray-600 dark:text-gray-300">Expedientes que requieren atención inmediata</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Actualizado: {new Date().toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Resumen compacto */}
      <ResumenCompacto />

      {/* Expedientes con problemas - PRIORIDAD MÁXIMA */}
      <ExpedientesConProblemas />

      {/* Otros expedientes activos */}
      <ActiveExpedientes />
    </div>
  );
};