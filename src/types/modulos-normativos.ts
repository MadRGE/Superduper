import { Json } from './database';

// =====================================================
// TIPOS COMUNES
// =====================================================

export type EstadoExpedienteNormativo =
  | 'DOCUMENTACION'
  | 'ENSAYOS'
  | 'CERTIFICADO'
  | 'VIGENTE'
  | 'VENCIDO'
  | 'RENOVACION_PENDIENTE';

export type ResultadoEnsayo = 'CONFORME' | 'NO_CONFORME' | 'CONDICIONAL';

export type TipoCertificacion =
  | 'CERTIFICACION_LOCAL'
  | 'CERTIFICACION_INTERNACIONAL_VALIDADA'
  | 'CERTIFICACION_COMBINADA';

// =====================================================
// LABORATORIOS Y NORMAS
// =====================================================

export type TipoLaboratorio = 'NACIONAL' | 'INTERNACIONAL' | 'NOTIFICADO_UE' | 'MERCOSUR';

export type EstadoLaboratorio = 'activo' | 'suspendido' | 'inactivo';

export interface Acreditacion {
  organismo: string;
  numero: string;
  vigencia: string;
  alcances?: string[];
}

export interface LaboratorioCertificador {
  id: string;
  nombre: string;
  sigla: string;
  tipo: TipoLaboratorio;
  pais: string;
  acreditacion: Acreditacion[];
  alcances: string[];
  contacto: {
    email?: string;
    telefono?: string;
    direccion?: string;
    web?: string;
  };
  estado: EstadoLaboratorio;
  metadata?: Json;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export type OrganismoNorma = 'ISO' | 'EN' | 'IEC' | 'ANSI' | 'IRAM' | 'NM' | 'JIS' | 'KC' | 'ASTM';

export interface Equivalencia {
  codigo: string;
  equivalente_a: string;
  observaciones?: string;
}

export interface NormaTecnica {
  id: string;
  codigo: string;
  titulo: string;
  organismo: OrganismoNorma;
  año: number | null;
  categoria: string;
  alcance?: string;
  vigente: boolean;
  reemplaza?: string;
  equivalencias: Equivalencia[];
  link_documento?: string;
  metadata?: Json;
  created_at: Date;
  updated_at: Date;
}

// =====================================================
// MÓDULO PRODUCTOS DE CONSUMO (Res. 313/2025)
// =====================================================

export type TipoProductoConsumo =
  | 'ENCENDEDORES'
  | 'ANTEOJOS_SOL'
  | 'JUGUETES'
  | 'BICICLETAS_INFANTILES'
  | 'TABLEROS_MADERA'
  | 'MUEBLES';

export type EstadoConsumo =
  | 'DOCUMENTACION'
  | 'ENSAYOS'
  | 'CERTIFICADO'
  | 'VIGENTE'
  | 'VENCIDO'
  | 'RENOVACION_PENDIENTE';

export interface EspecificacionesEncendedores {
  tipo_material: string;
  capacidad_combustible_ml: number;
  tipo_combustible: 'butano' | 'nafta' | 'otro';
  mecanismo_encendido: string;
  dimensiones_mm: {
    largo: number;
    ancho: number;
    alto: number;
  };
  peso_gramos: number;
}

export interface EspecificacionesAnteojos {
  tipo_anteojo: 'general' | 'deportivo' | 'graduado' | 'infantil';
  material_armazon: string;
  material_lentes: string;
  tipo_lentes: 'no_polarizado' | 'polarizado' | 'fotocromica';
  color_lentes: string[];
  revestimientos: string[];
  peso_gramos: number;
  medidas_mm: {
    ancho_lente: number;
    alto_lente: number;
    puente: number;
  };
}

export interface EspecificacionesJuguetes {
  materiales_principales: string[];
  dimensiones_mm: Json;
  peso_gramos: number;
  capacidad_carga_kg?: number;
  voltaje_si_electrico?: string;
  baterias_tipo?: string;
  piezas_pequenas: boolean;
}

export interface ExpedienteConsumo {
  id: string;
  expediente_id: string | null;
  cliente_id: string | null;
  tipo_producto: TipoProductoConsumo;
  categoria: string;
  marca: string;
  modelo: string;
  fabricante: string;
  pais_origen: string;
  especificaciones_tecnicas: Json;
  laboratorio_id: string | null;
  certificado_numero: string;
  certificado_fecha_emision: Date;
  certificado_vigencia_anos: number;
  fecha_vencimiento: Date;
  normas_aplicadas: Json;
  ensayos_realizados: Json;
  resultado_general: ResultadoEnsayo | null;
  requiere_qr: boolean;
  qr_generado: boolean;
  qr_contenido: Json;
  rotulado_completo: boolean;
  vigilancias: Json;
  proxima_vigilancia: Date | null;
  estado: EstadoConsumo;
  costo_ensayos: number;
  costo_certificacion: number;
  costo_total: number;
  documentos_adjuntos: Json;
  certificado_url: string | null;
  ficha_tecnica_url: string | null;
  manual_usuario_url: string | null;
  metadata: Json;
  notas_internas: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  created_by: string | null;
  updated_by: string | null;
}

// =====================================================
// MÓDULO EPP (Res. 18/2025)
// =====================================================

export type CategoriaRiesgo = 'CATEGORIA_I' | 'CATEGORIA_II' | 'CATEGORIA_III';

export type TipoEPP =
  | 'PROTECCION_OJOS'
  | 'PROTECCION_CABEZA'
  | 'PROTECCION_AUDITIVA'
  | 'PROTECCION_RESPIRATORIA'
  | 'GUANTES'
  | 'CALZADO'
  | 'INDUMENTARIA'
  | 'CAIDAS_ALTURAS'
  | 'MANOS_BRAZOS'
  | 'PIES'
  | 'OTRO';

export type EstadoEPP =
  | 'DOCUMENTACION'
  | 'EVALUACION_ENSAYOS'
  | 'CERTIFICADO_OBTENIDO'
  | 'DECLARACION_JURADA'
  | 'PRESENTACION_TAD'
  | 'APROBADO_COMERCIAL'
  | 'VIGENTE'
  | 'VENCIDO'
  | 'RENOVACION_PENDIENTE';

export type FrecuenciaVigilancia = 'ANUAL' | 'SEMESTRAL' | 'TRIMESTRAL';

export interface ProteccionesVerificadas {
  choque_electrico: boolean;
  peligros_mecanicos: boolean;
  peligros_termicos: boolean;
  ignicion_potencial: boolean;
  radiacion_electromagnetica?: boolean;
  energia_baterias?: boolean;
  partes_rotativas?: boolean;
  vibraciones?: boolean;
  ruido?: boolean;
  proyecciones_material?: boolean;
  sistema_parada_emergencia?: boolean;
}

export interface ExpedienteEPP {
  id: string;
  expediente_id: string | null;
  cliente_id: string | null;
  categoria_riesgo: CategoriaRiesgo;
  tipo_epp: TipoEPP;
  marca: string;
  modelo: string;
  fabricante: string;
  pais_origen: string;
  descripcion: string | null;
  especificaciones_tecnicas: Json;
  laboratorio_id: string | null;
  certificado_numero: string;
  certificado_tipo: TipoCertificacion | null;
  certificado_fecha_emision: Date;
  certificado_vigencia_anos: number;
  fecha_vencimiento: Date;
  normas_aplicadas: Json;
  ensayos_realizados: Json;
  protecciones_verificadas: Json;
  resultado_general: ResultadoEnsayo | null;
  rotulado_completado: boolean;
  rotulado_datos: Json;
  vigilancias: Json;
  proxima_vigilancia: Date | null;
  frecuencia_vigilancia: FrecuenciaVigilancia;
  estado: EstadoEPP;
  costo_ensayos: number;
  costo_certificacion: number;
  costo_djc: number;
  costo_total: number;
  documentos_adjuntos: Json;
  certificado_url: string | null;
  djc_url: string | null;
  manual_usuario_url: string | null;
  metadata: Json;
  notas_internas: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  created_by: string | null;
  updated_by: string | null;
}

// =====================================================
// MÓDULO EFICIENCIA ENERGÉTICA (Res. 438/2024)
// =====================================================

export type CategoriaProductoEficiencia =
  | 'REFRIGERADORES'
  | 'CONGELADORES'
  | 'LAVARROPAS'
  | 'LAVAVAJILLAS'
  | 'AIRE_ACONDICIONADO'
  | 'CALEFACCION'
  | 'HORNOS'
  | 'COCINAS'
  | 'TERMOTANQUES'
  | 'ILUMINACION'
  | 'TELEVISORES'
  | 'EQUIPOS_COMPUTO'
  | 'OTROS_ELECTRONICOS';

export type ClaseEnergetica = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export type UnidadConsumo = 'kWh_anual' | 'kWh_diario' | 'kWh_ciclo' | 'W';

export type EstadoEficiencia =
  | 'DOCUMENTACION'
  | 'ENSAYOS_LABORATORIO'
  | 'CERTIFICADO_ENERGETICO'
  | 'DECLARACION_JURADA'
  | 'PRESENTACION_TAD'
  | 'REGISTRO_BASE_DATOS'
  | 'ROTULADO_COMERCIAL'
  | 'VIGENTE'
  | 'VENCIDO';

export interface EtiquetaEnergetica {
  clase_visual: string;
  consumo_display: string;
  unidades_display: string;
  informacion_adicional: string[];
  qr_incluido: boolean;
  qr_codigo?: string;
  diseño_aprobado: boolean;
  formato_fisico: 'adhesivo_papel' | 'grabado' | 'otro';
  tamanio_mm: {
    largo: number;
    ancho: number;
  };
  ubicacion_producto: string;
  foto_etiqueta_url?: string;
}

export interface ExpedienteEficiencia {
  id: string;
  expediente_id: string | null;
  cliente_id: string | null;
  categoria_producto: CategoriaProductoEficiencia;
  marca: string;
  modelo: string;
  fabricante: string;
  pais_origen: string;
  año_modelo: number | null;
  descripcion: string | null;
  especificaciones_tecnicas: Json;
  consumo_energetico: number;
  unidad_consumo: UnidadConsumo;
  indicador_eficiencia: string | null;
  valor_indicador: number | null;
  clase_energetica: ClaseEnergetica;
  clase_energetica_anterior: ClaseEnergetica | null;
  percentil_comparativo: number | null;
  potencial_ahorro: number | null;
  laboratorio_id: string | null;
  certificado_numero: string;
  certificado_fecha_emision: Date;
  certificado_vigencia_anos: number;
  fecha_vencimiento: Date;
  normas_aplicadas: Json;
  metodologia_ensayo: string | null;
  ensayos_realizados: Json;
  etiqueta_generada: boolean;
  etiqueta_datos: Json;
  ficha_informacion: Json;
  qr_incluido: boolean;
  qr_codigo: string | null;
  registrado_base_datos: boolean;
  fecha_registro: Date | null;
  codigo_acceso_publico: string | null;
  enlace_portal_dnrt: string | null;
  vigilancias: Json;
  proxima_vigilancia: Date | null;
  estado: EstadoEficiencia;
  costo_ensayos: number;
  costo_certificacion: number;
  costo_etiquetado: number;
  costo_total: number;
  documentos_adjuntos: Json;
  certificado_url: string | null;
  informe_ensayos_url: string | null;
  etiqueta_url: string | null;
  ficha_informacion_url: string | null;
  metadata: Json;
  notas_internas: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  created_by: string | null;
  updated_by: string | null;
}

// =====================================================
// MÓDULO ELECTROMECÁNICO (Res. 16-17/2025)
// =====================================================

export type TipoRegulacion =
  | 'EQUIPAMIENTO_ELECTRICO_RES16'
  | 'MAQUINAS_HERRAMIENTAS_RES17'
  | 'COMBINADO_RES16_17';

export type TipoProductoElectromecanico =
  | 'RES16_FUENTES_CARGADORES'
  | 'RES16_ELECTRODOMESTICOS'
  | 'RES16_ILUMINACION'
  | 'RES16_ELECTRONICA_AV'
  | 'RES17_HERR_MANO'
  | 'RES17_HERR_TRANSPORTABLE'
  | 'RES17_MAQUINARIA_JARDIN'
  | 'RES17_MAQUINARIA_INDUSTRIAL';

export type EstadoElectromecanico =
  | 'DOCUMENTACION'
  | 'EVALUACION_CERTIFICACIONES'
  | 'ENSAYOS_LABORATORIO'
  | 'CERTIFICADO_OBTENIDO'
  | 'DECLARACION_JURADA'
  | 'PRESENTACION_TAD'
  | 'APROBADO_COMERCIAL'
  | 'VIGENTE'
  | 'VENCIDO'
  | 'TRANSICION_1_ANO';

export interface EspecificacionesElectromecanicas {
  voltaje_entrada_v: number;
  corriente_nominal_a: number;
  potencia_nominal_w: number;
  clase_aislacion: 'I' | 'II' | 'III';
  clase_ip: string;
  velocidad_rpm?: number;
  temperatura_operacion_c: {
    min: number;
    max: number;
  };
  dimensiones_mm: {
    largo: number;
    ancho: number;
    alto: number;
  };
  peso_kg: number;
  materiales: string[];
  caracteristicas_especiales: string[];
}

export interface ExpedienteElectromecanico {
  id: string;
  expediente_id: string | null;
  cliente_id: string | null;
  tipo_regulacion: TipoRegulacion;
  tipo_producto: TipoProductoElectromecanico;
  marca: string;
  modelo: string;
  fabricante: string;
  pais_origen: string;
  descripcion: string | null;
  especificaciones_tecnicas: Json;
  laboratorio_id: string | null;
  certificado_numero: string;
  certificado_tipo: TipoCertificacion | null;
  certificado_fecha_emision: Date;
  certificado_vigencia_anos: number;
  fecha_vencimiento: Date;
  normas_aplicadas: Json;
  ensayos_realizados: Json;
  protecciones_verificadas: Json;
  resultado_general: ResultadoEnsayo | null;
  rotulado_completado: boolean;
  rotulado_datos: Json;
  ficha_argentina: boolean;
  ficha_tipo: string | null;
  es_repuesto_insumo: boolean;
  repuesto_bien_final_id: string | null;
  consulta_tecnica_dnrt: Json;
  vigilancias: Json;
  proxima_vigilancia: Date | null;
  estado: EstadoElectromecanico;
  es_certificado_anterior: boolean;
  certificacion_anterior_tipo: string | null;
  certificacion_anterior_vencimiento: Date | null;
  costo_ensayos: number;
  costo_certificacion: number;
  costo_djc: number;
  costo_total: number;
  documentos_adjuntos: Json;
  certificado_url: string | null;
  djc_url: string | null;
  manual_usuario_url: string | null;
  esquema_electrico_url: string | null;
  metadata: Json;
  notas_internas: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  created_by: string | null;
  updated_by: string | null;
}

// =====================================================
// UTILIDADES Y HELPERS
// =====================================================

export const CLASE_ENERGETICA_COLORS: Record<ClaseEnergetica, string> = {
  A: 'bg-green-700 text-white',
  B: 'bg-green-500 text-white',
  C: 'bg-yellow-400 text-gray-900',
  D: 'bg-orange-300 text-gray-900',
  E: 'bg-orange-500 text-white',
  F: 'bg-red-400 text-white',
  G: 'bg-red-700 text-white',
};

export const CATEGORIA_RIESGO_LABELS: Record<CategoriaRiesgo, string> = {
  CATEGORIA_I: 'Riesgo Mínimo',
  CATEGORIA_II: 'Riesgo Intermedio',
  CATEGORIA_III: 'Riesgo Elevado',
};

export const CATEGORIA_RIESGO_COLORS: Record<CategoriaRiesgo, string> = {
  CATEGORIA_I: 'bg-blue-100 text-blue-800',
  CATEGORIA_II: 'bg-yellow-100 text-yellow-800',
  CATEGORIA_III: 'bg-red-100 text-red-800',
};
