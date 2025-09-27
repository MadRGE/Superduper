import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types
export type Expediente = Tables<'expedientes'>
export type Cliente = Tables<'clientes'>
export type TramiteTipo = Tables<'tramite_tipos'>
export type Organismo = Tables<'organismos'>
export type Documento = Tables<'documentos'>
export type Historial = Tables<'historial'>
export type Usuario = Tables<'usuarios'>
export type Despachante = Tables<'despachantes'>
export type CasoLegal = Tables<'casos_legales'>
export type Producto = Tables<'productos'>
export type Habilitacion = Tables<'habilitaciones'>
export type Comunicacion = Tables<'comunicaciones'>
export type Tarea = Tables<'tareas'>