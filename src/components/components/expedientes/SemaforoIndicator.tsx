import React from 'react'
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { getSemaforoColor } from '@/lib/utils'

interface SemaforoIndicatorProps {
  diasRestantes: number
  size?: 'sm' | 'md' | 'lg'
}

export const SemaforoIndicator: React.FC<SemaforoIndicatorProps> = ({ 
  diasRestantes, 
  size = 'md' 
}) => {
  const color = getSemaforoColor(diasRestantes)
  
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const iconSize = sizeClasses[size]

  switch (color) {
    case 'rojo':
      return <AlertTriangle className={`${iconSize} text-red-500`} />
    case 'amarillo':
      return <Clock className={`${iconSize} text-orange-500`} />
    default:
      return <CheckCircle className={`${iconSize} text-green-500`} />
  }
}