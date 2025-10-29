import { Badge } from '../ui/badge';
import { CategoriaRiesgo, CATEGORIA_RIESGO_LABELS, CATEGORIA_RIESGO_COLORS } from '../../types/modulos-normativos';

interface CategoriaRiesgoBadgeProps {
  categoria: CategoriaRiesgo;
  size?: 'sm' | 'md' | 'lg';
}

export function CategoriaRiesgoBadge({ categoria, size = 'md' }: CategoriaRiesgoBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <Badge
      className={`${CATEGORIA_RIESGO_COLORS[categoria]} ${sizeClasses[size]} border-0`}
    >
      {CATEGORIA_RIESGO_LABELS[categoria]}
    </Badge>
  );
}
