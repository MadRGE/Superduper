import React from 'react';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface SemaforoIndicatorProps {
  diasRestantes: number;
  size?: 'sm' | 'md' | 'lg';
}

export const SemaforoIndicator: React.FC<SemaforoIndicatorProps> = ({ 
  diasRestantes, 
  size = 'md' 
}) => {
  const getSemaforoColor = () => {
    if (diasRestantes < 0) return 'text-red-500';
    if (diasRestantes <= 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getSemaforoIcon = () => {
    if (diasRestantes < 0) return AlertTriangle;
    if (diasRestantes <= 3) return Clock;
    return CheckCircle;
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-8 h-8';
      default: return 'w-6 h-6';
    }
  };

  const Icon = getSemaforoIcon();

  return (
    <div className={`${getSemaforoColor()} ${getSizeClass()}`}>
      <Icon className="w-full h-full" />
    </div>
  );
};