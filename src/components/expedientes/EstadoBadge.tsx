import React from 'react';
import { Badge } from '@/components/ui/badge';

interface EstadoBadgeProps {
  estado: string;
}

export const EstadoBadge: React.FC<EstadoBadgeProps> = ({ estado }) => {
  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case 'completado':
        return {
          label: 'Completado',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'en_proceso':
        return {
          label: 'En Proceso',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'observado':
        return {
          label: 'Observado',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'vencido':
        return {
          label: 'Vencido',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'iniciado':
        return {
          label: 'Iniciado',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
      default:
        return {
          label: estado,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getEstadoConfig(estado);

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
};