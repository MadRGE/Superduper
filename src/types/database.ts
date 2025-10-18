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
      proveedores: {
        Row: {
          id: string
          razon_social: string
          cuit: string
          categoria: string | null
          especialidades: string[] | null
          ubicacion: string | null
          telefono: string | null
          email: string | null
          web: string | null
          certificaciones: string[] | null
          calificacion: number | null
          servicios_completados: number | null
          monto_facturado: number | null
          estado: string | null
          observaciones: string | null
          metadata: Json | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          razon_social: string
          cuit: string
          categoria?: string | null
          especialidades?: string[] | null
          ubicacion?: string | null
          telefono?: string | null
          email?: string | null
          web?: string | null
          certificaciones?: string[] | null
          calificacion?: number | null
          servicios_completados?: number | null
          monto_facturado?: number | null
          estado?: string | null
          observaciones?: string | null
          metadata?: Json | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          razon_social?: string
          cuit?: string
          categoria?: string | null
          especialidades?: string[] | null
          ubicacion?: string | null
          telefono?: string | null
          email?: string | null
          web?: string | null
          certificaciones?: string[] | null
          calificacion?: number | null
          servicios_completados?: number | null
          monto_facturado?: number | null
          estado?: string | null
          observaciones?: string | null
          metadata?: Json | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      catalogo_servicios_proveedor: {
        Row: {
          id: string
          proveedor_id: string
          codigo: string
          nombre: string
          descripcion: string | null
          unidad: string | null
          categoria: string | null
          tiempo_entrega_dias: number | null
          requiere_muestra: boolean | null
          observaciones: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          proveedor_id: string
          codigo: string
          nombre: string
          descripcion?: string | null
          unidad?: string | null
          categoria?: string | null
          tiempo_entrega_dias?: number | null
          requiere_muestra?: boolean | null
          observaciones?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          proveedor_id?: string
          codigo?: string
          nombre?: string
          descripcion?: string | null
          unidad?: string | null
          categoria?: string | null
          tiempo_entrega_dias?: number | null
          requiere_muestra?: boolean | null
          observaciones?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      lista_precios: {
        Row: {
          id: string
          proveedor_id: string
          servicio_id: string
          precio_unitario: number
          moneda: string | null
          vigencia_desde: string | null
          vigencia_hasta: string | null
          descuento_volumen: Json | null
          condiciones_comerciales: string | null
          tiempo_pago_dias: number | null
          incluye_iva: boolean | null
          observaciones: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          proveedor_id: string
          servicio_id: string
          precio_unitario: number
          moneda?: string | null
          vigencia_desde?: string | null
          vigencia_hasta?: string | null
          descuento_volumen?: Json | null
          condiciones_comerciales?: string | null
          tiempo_pago_dias?: number | null
          incluye_iva?: boolean | null
          observaciones?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          proveedor_id?: string
          servicio_id?: string
          precio_unitario?: number
          moneda?: string | null
          vigencia_desde?: string | null
          vigencia_hasta?: string | null
          descuento_volumen?: Json | null
          condiciones_comerciales?: string | null
          tiempo_pago_dias?: number | null
          incluye_iva?: boolean | null
          observaciones?: string | null
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
          checklist_item_id: string | null
          fecha_vencimiento: string | null
          dias_vigencia: number | null
          requiere_aprobacion: boolean | null
          nivel_aprobacion_actual: number | null
          responsable_id: string | null
          notas_internas: string | null
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

  casos_legales: {
    Row: {
      id: string
      cliente_id: string
      nombre_caso: string
      descripcion: string | null
      estado_legal: string | null
      fecha_apertura: string | null
      fecha_cierre: string | null
      abogado_responsable_id: string | null
      metadata: Json | null
      is_active: boolean | null
      created_at: string | null
      updated_at: string | null
    }
    Insert: {
      id?: string
      cliente_id: string
      nombre_caso: string
      descripcion?: string | null
      estado_legal?: string | null
      fecha_apertura?: string | null
      fecha_cierre?: string | null
      abogado_responsable_id?: string | null
      metadata?: Json | null
      is_active?: boolean | null
      created_at?: string | null
      updated_at?: string | null
    }
    Update: {
      id?: string
      cliente_id?: string
      nombre_caso?: string
      descripcion?: string | null
      estado_legal?: string | null
      fecha_apertura?: string | null
      fecha_cierre?: string | null
      abogado_responsable_id?: string | null
      metadata?: Json | null
      is_active?: boolean | null
      created_at?: string | null
      updated_at?: string | null
    }
  }
  productos: {
    Row: {
      id: string
      cliente_id: string
      nombre: string
      marca: string | null
      rnpa: string | null
      categoria: string | null
      estado: string | null
      vencimiento: string | null
      peso_neto: string | null
      vida_util: string | null
      codigo_ean: string | null
      metadata: Json | null
      is_active: boolean | null
      created_at: string | null
      updated_at: string | null
    }
    Insert: {
      id?: string
      cliente_id: string
      nombre: string
      marca?: string | null
      rnpa?: string | null
      categoria?: string | null
      estado?: string | null
      vencimiento?: string | null
      peso_neto?: string | null
      vida_util?: string | null
      codigo_ean?: string | null
      metadata?: Json | null
      is_active?: boolean | null
      created_at?: string | null
      updated_at?: string | null
    }
    Update: {
      id?: string
      cliente_id?: string
      nombre?: string
      marca?: string | null
      rnpa?: string | null
      categoria?: string | null
      estado?: string | null
      vencimiento?: string | null
      peso_neto?: string | null
      vida_util?: string | null
      codigo_ean?: string | null
      metadata?: Json | null
      is_active?: boolean | null
      created_at?: string | null
      updated_at?: string | null
    }
  }
  habilitaciones: {
    Row: {
      id: string
      cliente_id: string
      tipo: string
      numero: string
      establecimiento: string | null
      direccion: string | null
      vencimiento: string
      estado: string | null
      actividades: string[] | null
      metadata: Json | null
      is_active: boolean | null
      created_at: string | null
      updated_at: string | null
    }
    Insert: {
      id?: string
      cliente_id: string
      tipo: string
      numero: string
      establecimiento?: string | null
      direccion?: string | null
      vencimiento: string
      estado?: string | null
      actividades?: string[] | null
      metadata?: Json | null
      is_active?: boolean | null
      created_at?: string | null
      updated_at?: string | null
    }
    Update: {
      id?: string
      cliente_id?: string
      tipo?: string
      numero?: string
      establecimiento?: string | null
      direccion?: string | null
      vencimiento?: string
      estado?: string | null
      actividades?: string[] | null
      metadata?: Json | null
      is_active?: boolean | null
      created_at?: string | null
      updated_at?: string | null
    }
  }
  comunicaciones: {
    Row: {
      id: string
      cliente_id: string
      expediente_id: string | null
      caso_legal_id: string | null
      tipo: string
      asunto: string
      mensaje: string
      destinatario: string
      estado: string | null
      fecha_envio: string | null
      metadata: Json | null
      created_at: string | null
    }
    Insert: {
      id?: string
      cliente_id: string
      expediente_id?: string | null
      caso_legal_id?: string | null
      tipo: string
      asunto: string
      mensaje: string
      destinatario: string
      estado?: string | null
      fecha_envio?: string | null
      metadata?: Json | null
      created_at?: string | null
    }
    Update: {
      id?: string
      cliente_id?: string
      expediente_id?: string | null
      caso_legal_id?: string | null
      tipo?: string
      asunto?: string
      mensaje?: string
      destinatario?: string
      estado?: string | null
      fecha_envio?: string | null
      metadata?: Json | null
      created_at?: string | null
    }
  }
  tareas: {
    Row: {
      id: string
      expediente_id: string | null
      caso_legal_id: string | null
      usuario_asignado_id: string | null
      titulo: string
      descripcion: string | null
      estado: string | null
      prioridad: string | null
      fecha_vencimiento: string | null
      fecha_completado: string | null
      metadata: Json | null
      created_at: string | null
      updated_at: string | null
    }
    Insert: {
      id?: string
      expediente_id?: string | null
      caso_legal_id?: string | null
      usuario_asignado_id?: string | null
      titulo: string
      descripcion?: string | null
      estado?: string | null
      prioridad?: string | null
      fecha_vencimiento?: string | null
      fecha_completado?: string | null
      metadata?: Json | null
      created_at?: string | null
      updated_at?: string | null
    }
    Update: {
      id?: string
      expediente_id?: string | null
      caso_legal_id?: string | null
      usuario_asignado_id?: string | null
      titulo?: string
      descripcion?: string | null
      estado?: string | null
      prioridad?: string | null
      fecha_vencimiento?: string | null
      fecha_completado?: string | null
      metadata?: Json | null
      created_at?: string | null
      updated_at?: string | null
    }
  }
export type Estado = 'iniciado' | 'en_proceso' | 'observado' | 'aprobado' | 'completado' | 'cancelado'
export type Prioridad = 'baja' | 'normal' | 'alta' | 'urgente'
export type Rol = 'admin' | 'gestor' | 'despachante' | 'cliente'
export type EstadoLegal = 'abierto' | 'en_litigio' | 'cerrado' | 'archivado'
export type EstadoTarea = 'pendiente' | 'en_proceso' | 'completado' | 'cancelado'

export interface CasoLegal {
  id: string
  cliente_id: string
  nombre_caso: string
  descripcion?: string
  estado_legal: EstadoLegal
  fecha_apertura: Date
  fecha_cierre?: Date
  abogado_responsable_id?: string
  metadata?: any
  is_active: boolean
  created_at: Date
  updated_at: Date
  // Relations
  cliente?: Cliente
  expedientes?: Expediente[]
  tareas?: Tarea[]
  comunicaciones?: Comunicacion[]
}

export interface Producto {
  id: string
  cliente_id: string
  nombre: string
  marca?: string
  rnpa?: string
  categoria?: string
  estado: string
  vencimiento?: Date
  peso_neto?: string
  vida_util?: string
  codigo_ean?: string
  metadata?: any
  is_active: boolean
  created_at: Date
  updated_at: Date
  // Relations
  cliente?: Cliente
}

export interface Habilitacion {
  id: string
  cliente_id: string
  tipo: string
  numero: string
  establecimiento?: string
  direccion?: string
  vencimiento: Date
  estado: string
  actividades?: string[]
  metadata?: any
  is_active: boolean
  created_at: Date
  updated_at: Date
  // Relations
  cliente?: Cliente
}

export interface Comunicacion {
  id: string
  cliente_id: string
  expediente_id?: string
  caso_legal_id?: string
  tipo: string
  asunto: string
  mensaje: string
  destinatario: string
  estado: string
  fecha_envio?: Date
  metadata?: any
  created_at: Date
  // Relations
  cliente?: Cliente
  expediente?: Expediente
  caso_legal?: CasoLegal
}

export interface Tarea {
  id: string
  expediente_id?: string
  caso_legal_id?: string
  usuario_asignado_id?: string
  titulo: string
  descripcion?: string
  estado: EstadoTarea
  prioridad: Prioridad
  fecha_vencimiento?: Date
  fecha_completado?: Date
  metadata?: any
  created_at: Date
  updated_at: Date
  // Relations
  expediente?: Expediente
  caso_legal?: CasoLegal
  usuario_asignado?: Usuario
}

export interface Expediente {
  id: string
  codigo: string
  alias?: string
  tramite_tipo_id: string
  cliente_id: string
  despachante_id?: string
  caso_legal_id?: string
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
  caso_legal?: CasoLegal
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

export interface Proveedor {
  id: string
  razon_social: string
  cuit: string
  categoria?: string
  especialidades?: string[]
  ubicacion?: string
  telefono?: string
  email?: string
  web?: string
  certificaciones?: string[]
  calificacion: number
  servicios_completados: number
  monto_facturado: number
  estado: string
  observaciones?: string
  metadata?: any
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface CatalogoServicioProveedor {
  id: string
  proveedor_id: string
  codigo: string
  nombre: string
  descripcion?: string
  unidad: string
  categoria?: string
  tiempo_entrega_dias?: number
  requiere_muestra: boolean
  observaciones?: string
  is_active: boolean
  created_at: Date
  updated_at: Date
  proveedor?: Proveedor
}

export interface ListaPrecio {
  id: string
  proveedor_id: string
  servicio_id: string
  precio_unitario: number
  moneda: string
  vigencia_desde?: Date
  vigencia_hasta?: Date
  descuento_volumen?: any
  condiciones_comerciales?: string
  tiempo_pago_dias: number
  incluye_iva: boolean
  observaciones?: string
  is_active: boolean
  created_at: Date
  updated_at: Date
  proveedor?: Proveedor
  servicio?: CatalogoServicioProveedor
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