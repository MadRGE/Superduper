import React, { useState, useEffect } from 'react';
import { MetricsCards } from './MetricsCards';
import { ActiveExpedientes } from './ActiveExpedientes';
import { RecentActivity } from './RecentActivity';
import { VencimientoChart } from './VencimientoChart';
import { OrganismoStats } from './OrganismoStats';
import { DashboardSkeleton } from '../../components/ui/DashboardSkeleton';

export const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Vista general de expedientes y actividades</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Última actualización: {new Date().toLocaleString('es-AR')}
        </div>
      </div>

      {/* Metrics */}
      <MetricsCards />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Left column - 2 spans */}
        <div className="lg:col-span-2 space-y-6">
          <ActiveExpedientes />
          <VencimientoChart />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <OrganismoStats />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};