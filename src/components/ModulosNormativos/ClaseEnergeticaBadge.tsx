import { Badge } from '../ui/badge';
import { ClaseEnergetica, CLASE_ENERGETICA_COLORS } from '../../types/modulos-normativos';

interface ClaseEnergeticaBadgeProps {
  clase: ClaseEnergetica;
  size?: 'sm' | 'md' | 'lg';
}

export function ClaseEnergeticaBadge({ clase, size = 'md' }: ClaseEnergeticaBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <Badge
      className={`${CLASE_ENERGETICA_COLORS[clase]} ${sizeClasses[size]} font-bold border-0`}
    >
      Clase {clase}
    </Badge>
  );
}
