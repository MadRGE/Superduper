import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function getDaysRemaining(date: string | Date): number {
  const targetDate = new Date(date)
  const today = new Date()
  const diffTime = targetDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getSemaforoColor(days: number): 'verde' | 'amarillo' | 'rojo' {
  if (days < 0) return 'rojo'
  if (days <= 3) return 'amarillo'
  return 'verde'
}

export function getEstadoColor(estado: string): string {
  const colors: { [key: string]: string } = {
    completado: 'bg-green-100 text-green-800 border-green-200',
    aprobado: 'bg-green-100 text-green-800 border-green-200',
    en_proceso: 'bg-blue-100 text-blue-800 border-blue-200',
    iniciado: 'bg-gray-100 text-gray-800 border-gray-200',
    observado: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    vencido: 'bg-red-100 text-red-800 border-red-200',
    cancelado: 'bg-gray-100 text-gray-800 border-gray-200'
  }
  return colors[estado] || 'bg-gray-100 text-gray-800 border-gray-200'
}

export function getPrioridadColor(prioridad: string): string {
  const colors: { [key: string]: string } = {
    urgente: 'border-l-red-500',
    alta: 'border-l-orange-500',
    normal: 'border-l-blue-500',
    baja: 'border-l-gray-500'
  }
  return colors[prioridad] || 'border-l-gray-500'
}