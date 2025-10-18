import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { ResumenCompacto } from './ResumenCompacto';
import { ExpedientesConProblemas } from './ExpedientesConProblemas';
import { ActiveExpedientes } from './ActiveExpedientes';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userRole } = usePermissions();

  // Redirigir despachantes a su portal específico
  useEffect(() => {
    if (userRole === 'despachante') {
      navigate('/despachantes/portal');
    }
  }, [userRole, navigate]);

  // Si es despachante, mostrar mensaje de carga mientras redirige
  if (userRole === 'despachante') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Redirigiendo a tu portal...</p>
        </div>
      </div>
    );
  }

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