import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Building2, 
  User, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Bell
} from 'lucide-react'
import { Expediente } from '@/types/database'
import { formatDate, getDaysRemaining, getSemaforoColor, getEstadoColor, getPrioridadColor } from '@/lib/utils'

interface ExpedienteCardProps {
  expediente: Expediente
  view?: 'grid' | 'list'
}

export const ExpedienteCard: React.FC<ExpedienteCardProps> = ({ 
  expediente, 
  view = 'grid' 
}) => {
  const diasRestantes = getDaysRemaining(expediente.fecha_limite)
  const semaforoColor = getSemaforoColor(diasRestantes)
  
  const getSemaforoIcon = (color: string) => {
    switch (color) {
      case 'rojo':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'amarillo':
        return <Clock className="w-4 h-4 text-orange-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />
    }
  }

  const getProgressColor = (progreso: number) => {
    if (progreso < 30) return 'bg-red-500'
    if (progreso < 70) return 'bg-orange-500'
    return 'bg-green-500'
  }

  // Calculate progress based on current step
  const progreso = expediente.paso_actual ? Math.round((expediente.paso_actual / 8) * 100) : 0

  if (view === 'list') {
    return (
      <Link to={`/expedientes/${expediente.id}`}>
        <Card className={`hover:shadow-md transition-all border-l-4 ${getPrioridadColor(expediente.prioridad)}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{expediente.alias || expediente.codigo}</h3>
                  <Badge className={getEstadoColor(expediente.estado)}>
                    {expediente.estado.replace('_', ' ')}
                  </Badge>
                  {/* Notification indicator */}
                  <div className="flex items-center space-x-1 text-orange-600">
                    <Bell className="w-4 h-4" />
                    <span className="text-xs">0</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>{expediente.codigo}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4" />
                    <span>{expediente.tramite_tipo?.organismo?.sigla}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{expediente.cliente?.razon_social}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(expediente.fecha_limite)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-sm">
                    {getSemaforoIcon(semaforoColor)}
                    <span className={`font-medium ${
                      diasRestantes < 0 ? 'text-red-600' : 
                      diasRestantes < 7 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {diasRestantes < 0 
                        ? `Vencido ${Math.abs(diasRestantes)}d`
                        : `${diasRestantes}d restantes`
                      }
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Paso {expediente.paso_actual}/8
                  </div>
                </div>
                <div className="w-16">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getProgressColor(progreso)}`}
                      style={{ width: `${progreso}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 text-center mt-1">
                    {progreso}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link to={`/expedientes/${expediente.id}`}>
      <Card className={`hover:shadow-md transition-all border-l-4 ${getPrioridadColor(expediente.prioridad)}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                {expediente.alias || expediente.codigo}
              </h3>
              <p className="text-sm text-gray-500">{expediente.codigo}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getEstadoColor(expediente.estado)}>
                {expediente.estado.replace('_', ' ')}
              </Badge>
              <div className="flex items-center space-x-1 text-orange-600">
                <Bell className="w-4 h-4" />
                <span className="text-xs">0</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Building2 className="w-4 h-4" />
              <span>{expediente.tramite_tipo?.organismo?.sigla}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{expediente.cliente?.razon_social}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Vence: {formatDate(expediente.fecha_limite)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-sm">
              {getSemaforoIcon(semaforoColor)}
              <span className={`font-medium ${
                diasRestantes < 0 ? 'text-red-600' : 
                diasRestantes < 7 ? 'text-orange-600' : 'text-green-600'
              }`}>
                {diasRestantes < 0 
                  ? `Vencido ${Math.abs(diasRestantes)}d`
                  : `${diasRestantes}d restantes`
                }
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Paso {expediente.paso_actual}/8
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progreso</span>
              <span>{progreso}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${getProgressColor(progreso)}`}
                style={{ width: `${progreso}%` }}
              />
            </div>
          </div>

          {expediente.observaciones && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-yellow-600">
                Observaciones: {expediente.observaciones}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}