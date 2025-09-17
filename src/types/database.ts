export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organismos: {
        Row: {
          id: string
          sigla: string
          nombre: string
          jurisdiccion: string | null
          canal: string | null
          email_contacto: string | null
          telefono: string | null
          direccion: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          sigla: string
          nombre: string
          jurisdiccion?: string | null
          canal?: string | null
          email_contacto?: string | null
          telefono?: string | null
          direccion?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          sigla?: string
          nombre?: string
          jurisdiccion?: string | null
          canal?: string | null
          email_contacto?: string | null
          telefono?: string | null
          direccion?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      tramite_tipos: {
        Row: {
          id: string
          codigo: string
          nombre: string
          organismo_id: string | null
          rubro: string | null
          pais: string | null
          alcance: string | null
          obligatoriedad: string | null
          base_legal: string[] | null
          entregables: string[] | null
          renovacion: string | null
          tags: string[] | null
          sla_total_dias: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          codigo: string
          nombre: string
          organismo_id?: string | null
          rubro?: string | null
          pais?: string | null
          alcance?: string | null
          obligatoriedad?: string | null
          base_legal?: string[] | null
          entregables?: string[] | null
          renovacion?: string | null
          tags?: string[] | null
          sla_total_dias?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          codigo?: string
          nombre?: string
          organismo_id?: string | null
          rubro?: string | null
          pais?: string | null
          alcance?: string | null
          obligatoriedad?: string | null
          base_legal?: string[] | null
          entregables?: string[] | null
          renovacion?: string | null
          tags?: string[] | null
          sla_total_dias?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      clientes: {
        Row: {
          id: string
          razon_social: string
          cuit: string
          email: string
          telefono: string | null
          direccion: string | null
          contacto_nombre: string | null
          contacto_email: string | null
          contacto_telefono: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          razon_social: string
          cuit: string
          email: string
          telefono?: string | null
          direccion?: string | null
          contacto_nombre?: string | null
          contacto_email?: string | null
          contacto_telefono?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          razon_social?: string
          cuit?: string
          email?: string
          telefono?: string | null
          direccion?: string | null
          contacto_nombre?: string | null
          contacto_email?: string | null
          contacto_telefono?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      despachantes: {
        Row: {
          id: string
          nombre: string
          cuit: string
          matricula: string | null
          email: string
          telefono: string | null
          direccion: string | null
          especialidades: string[] | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          nombre: string
          cuit: string
          matricula?: string | null
          email: string
          telefono?: string | null
          direccion?: string | null
          especialidades?: string[] | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          nombre?: string
          cuit?: string
          matricula?: string | null
          email?: string
          telefono?: string | null
          direccion?: string | null
          especialidades?: string[] | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      expedientes: {
        Row: {
          id: string
          codigo: string
          alias: string | null
          tramite_tipo_id: string | null
          cliente_id: string | null
          despachante_id: string | null
          estado: string
          prioridad: string | null
          fecha_inicio: string | null
          fecha_limite: string | null
          fecha_completado: string | null
          paso_actual: number | null
          observaciones: string | null
          metadata: Json | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          codigo: string
          alias?: string | null
          tramite_tipo_id?: string | null
          cliente_id?: string | null
          despachante_id?: string | null
          estado?: string
          prioridad?: string | null
          fecha_inicio?: string | null
          fecha_limite?: string | null
          fecha_completado?: string | null
          paso_actual?: number | null
          observaciones?: string | null
          metadata?: Json | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          codigo?: string
          alias?: string | null
          tramite_tipo_id?: string | null
          cliente_id?: string | null
          despachante_id?: string | null
          estado?: string
          prioridad?: string | null
          fecha_inicio?: string | null
          fecha_limite?: string | null
          fecha_completado?: string | null
          paso_actual?: number | null
          observaciones?: string | null
          metadata?: Json | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      usuarios: {
        Row: {
          id: string
          email: string
          nombre: string
          apellido: string | null
          rol: string
          entidad_id: string | null
          password_hash: string | null
          ultimo_acceso: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          nombre: string
          apellido?: string | null
          rol: string
          entidad_id?: string | null
          password_hash?: string | null
          ultimo_acceso?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          nombre?: string
          apellido?: string | null
          rol?: string
          entidad_id?: string | null
          password_hash?: string | null
          ultimo_acceso?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      documentos: {
        Row: {
          id: string
          expediente_id: string | null
          tarea_id: string | null
          tipo: string | null
          nombre: string
          descripcion: string | null
          path: string | null
          formato: string | null
          size_kb: number | null
          hash_sha256: string | null
          subido_por: string | null
          subido_por_rol: string | null
          estado: string | null
          version: number | null
          metadata: Json | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          expediente_id?: string | null
          tarea_id?: string | null
          tipo?: string | null
          nombre: string
          descripcion?: string | null
          path?: string | null
          formato?: string | null
          size_kb?: number | null
          hash_sha256?: string | null
          subido_por?: string | null
          subido_por_rol?: string | null
          estado?: string | null
          version?: number | null
          metadata?: Json | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          expediente_id?: string | null
          tarea_id?: string | null
          tipo?: string | null
          nombre?: string
          descripcion?: string | null
          path?: string | null
          formato?: string | null
          size_kb?: number | null
          hash_sha256?: string | null
          subido_por?: string | null
          subido_por_rol?: string | null
          estado?: string | null
          version?: number | null
          metadata?: Json | null
          is_active?: boolean | null
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Estado = 'iniciado' | 'en_proceso' | 'observado' | 'aprobado' | 'completado' | 'cancelado'
export type Prioridad = 'baja' | 'normal' | 'alta' | 'urgente'
export type Rol = 'admin' | 'gestor' | 'despachante' | 'cliente'

export interface Expediente {
  id: string
  codigo: string
  alias?: string
  tramite_tipo_id: string
  cliente_id: string
  despachante_id?: string
  estado: Estado
  prioridad: Prioridad
  fecha_inicio: Date
  fecha_limite: Date
  fecha_completado?: Date
  paso_actual: number
  observaciones?: string
  metadata?: any
  is_active: boolean
  created_at: Date
  updated_at: Date
  // Relations
  tramite_tipo?: TramiteTipo
  cliente?: Cliente
  despachante?: Despachante
  documentos?: Documento[]
}

export interface TramiteTipo {
  id: string
  codigo: string
  nombre: string
  organismo_id: string
  rubro: string
  alcance: string
  sla_total_dias: number
  tags: string[]
  // Relations
  organismo?: Organismo
}

export interface Cliente {
  id: string
  razon_social: string
  cuit: string
  email: string
  telefono?: string
  contacto_nombre?: string
  contacto_email?: string
  contacto_telefono?: string
}

export interface Despachante {
  id: string
  nombre: string
  cuit: string
  email: string
  telefono?: string
  especialidades?: string[]
}

export interface Organismo {
  id: string
  sigla: string
  nombre: string
  canal: string
}

export interface Documento {
  id: string
  expediente_id: string
  nombre: string
  tipo: string
  path: string
  formato: string
  size_kb: number
  estado: string
  created_at: Date
}

export interface Usuario {
  id: string
  email: string
  nombre: string
  apellido?: string
  rol: Rol
  entidad_id?: string
}