import React from 'react'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react'
import { getEstadoColor } from '@/lib/utils'

interface EstadoBadgeProps {
  estado: string
  showIcon?: boolean
}

export const EstadoBadge: React.FC<EstadoBadgeProps> = ({ estado, showIcon = false }) => {
  const getIcon = (estado: string) => {
    switch (estado) {
      case 'completado':
      case 'aprobado':
        return <CheckCircle className="w-3 h-3" />
      case 'en_proceso':
        return <Clock className="w-3 h-3" />
      case 'observado':
        return <AlertTriangle className="w-3 h-3" />
      case 'cancelado':
      case 'vencido':
        return <XCircle className="w-3 h-3" />
      default:
        return null
    }
  }

  return (
    <Badge className={getEstadoColor(estado)}>
      {showIcon && getIcon(estado)}
      <span className={showIcon ? 'ml-1' : ''}>
        {estado.replace('_', ' ')}
      </span>
    </Badge>
  )
}