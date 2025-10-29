import { supabase } from '../lib/supabase';
import { ExpedienteConsumo, TipoProductoConsumo, EstadoConsumo } from '../types/modulos-normativos';
import { ModuloNormativoService } from './ModuloNormativoService';

export class ModuloConsumoService extends ModuloNormativoService {
  private tabla = 'expedientes_consumo';

  // =====================================================
  // CRUD BÁSICO
  // =====================================================

  async getExpedientesConsumo(clienteId?: string): Promise<ExpedienteConsumo[]> {
    let query = supabase
      .from(this.tabla)
      .select(`
        *,
        cliente:clientes(id, razon_social, cuit),
        laboratorio:laboratorios_certificadores(id, nombre, sigla)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getExpedienteConsumoById(id: string): Promise<ExpedienteConsumo | null> {
    const { data, error } = await supabase
      .from(this.tabla)
      .select(`
        *,
        cliente:clientes(id, razon_social, cuit, email),
        laboratorio:laboratorios_certificadores(id, nombre, sigla, pais)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createExpedienteConsumo(expediente: Partial<ExpedienteConsumo>): Promise<ExpedienteConsumo> {
    const fechaVencimiento = this.calcularFechaVencimiento(
      new Date(expediente.certificado_fecha_emision!),
      expediente.certificado_vigencia_anos || 1
    );

    const nuevoExpediente = {
      ...expediente,
      fecha_vencimiento: fechaVencimiento.toISOString(),
      estado: 'DOCUMENTACION' as EstadoConsumo,
      costo_total: (expediente.costo_ensayos || 0) + (expediente.costo_certificacion || 0),
    };

    const { data, error } = await supabase
      .from(this.tabla)
      .insert(nuevoExpediente)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateExpedienteConsumo(id: string, expediente: Partial<ExpedienteConsumo>): Promise<ExpedienteConsumo> {
    if (expediente.costo_ensayos !== undefined || expediente.costo_certificacion !== undefined) {
      const actual = await this.getExpedienteConsumoById(id);
      if (actual) {
        expediente.costo_total =
          (expediente.costo_ensayos ?? actual.costo_ensayos) +
          (expediente.costo_certificacion ?? actual.costo_certificacion);
      }
    }

    const { data, error } = await supabase
      .from(this.tabla)
      .update(expediente)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteExpedienteConsumo(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tabla)
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  // =====================================================
  // BÚSQUEDAS ESPECÍFICAS
  // =====================================================

  async getExpedientesByTipoProducto(tipo: TipoProductoConsumo, clienteId?: string): Promise<ExpedienteConsumo[]> {
    let query = supabase
      .from(this.tabla)
      .select('*')
      .eq('tipo_producto', tipo)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getExpedientesByEstado(estado: EstadoConsumo, clienteId?: string): Promise<ExpedienteConsumo[]> {
    let query = supabase
      .from(this.tabla)
      .select('*')
      .eq('estado', estado)
      .eq('is_active', true)
      .order('created_at', { ascending: false});

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getExpedientesPorVencer(diasAntes: number = 60): Promise<ExpedienteConsumo[]> {
    return await this.getExpedientesProximosVencer(this.tabla, diasAntes);
  }

  async getExpedientesVencidos(): Promise<ExpedienteConsumo[]> {
    return await super.getExpedientesVencidos(this.tabla);
  }

  async searchExpedientes(query: string): Promise<ExpedienteConsumo[]> {
    const { data, error } = await supabase
      .from(this.tabla)
      .select('*')
      .or(`marca.ilike.%${query}%,modelo.ilike.%${query}%,certificado_numero.ilike.%${query}%`)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  // =====================================================
  // LÓGICA DE NEGOCIO ESPECÍFICA
  // =====================================================

  async actualizarEstado(id: string, nuevoEstado: EstadoConsumo): Promise<ExpedienteConsumo> {
    const expediente = await this.getExpedienteConsumoById(id);
    if (!expediente) throw new Error('Expediente no encontrado');

    const actualizacion: Partial<ExpedienteConsumo> = {
      estado: nuevoEstado,
    };

    if (nuevoEstado === 'VIGENTE') {
      actualizacion.proxima_vigilancia = this.calcularProximaVigilancia(
        new Date(expediente.fecha_vencimiento),
        'ANUAL'
      ).toISOString() as any;
    }

    return await this.updateExpedienteConsumo(id, actualizacion);
  }

  async generarYAsignarQR(id: string, contenido: any): Promise<ExpedienteConsumo> {
    const codigo = this.generarCodigoQR(contenido);

    return await this.updateExpedienteConsumo(id, {
      qr_generado: true,
      qr_contenido: { codigo, ...contenido } as any,
    });
  }

  async marcarRotuladoCompleto(id: string): Promise<ExpedienteConsumo> {
    return await this.updateExpedienteConsumo(id, {
      rotulado_completo: true,
    });
  }

  async agregarVigilancia(id: string, vigilancia: any): Promise<ExpedienteConsumo> {
    const expediente = await this.getExpedienteConsumoById(id);
    if (!expediente) throw new Error('Expediente no encontrado');

    const vigilancias = Array.isArray(expediente.vigilancias) ? expediente.vigilancias : [];
    vigilancias.push({
      ...vigilancia,
      fecha: new Date().toISOString(),
    });

    return await this.updateExpedienteConsumo(id, {
      vigilancias: vigilancias as any,
    });
  }

  // =====================================================
  // ESTADÍSTICAS Y DASHBOARDS
  // =====================================================

  async getEstadisticasPorTipo(): Promise<Record<TipoProductoConsumo, number>> {
    const { data, error } = await supabase
      .from(this.tabla)
      .select('tipo_producto')
      .eq('is_active', true);

    if (error) throw error;

    const estadisticas: Record<string, number> = {};
    (data || []).forEach(item => {
      estadisticas[item.tipo_producto] = (estadisticas[item.tipo_producto] || 0) + 1;
    });

    return estadisticas as Record<TipoProductoConsumo, number>;
  }

  async getEstadisticasPorEstado(): Promise<Record<EstadoConsumo, number>> {
    const { data, error } = await supabase
      .from(this.tabla)
      .select('estado')
      .eq('is_active', true);

    if (error) throw error;

    const estadisticas: Record<string, number> = {};
    (data || []).forEach(item => {
      estadisticas[item.estado] = (estadisticas[item.estado] || 0) + 1;
    });

    return estadisticas as Record<EstadoConsumo, number>;
  }

  async getCostosTotales(): Promise<{ ensayos: number; certificacion: number; total: number }> {
    const { data, error } = await supabase
      .from(this.tabla)
      .select('costo_ensayos, costo_certificacion, costo_total')
      .eq('is_active', true);

    if (error) throw error;

    const totales = (data || []).reduce(
      (acc, item) => ({
        ensayos: acc.ensayos + (item.costo_ensayos || 0),
        certificacion: acc.certificacion + (item.costo_certificacion || 0),
        total: acc.total + (item.costo_total || 0),
      }),
      { ensayos: 0, certificacion: 0, total: 0 }
    );

    return totales;
  }

  // =====================================================
  // VALIDACIONES ESPECÍFICAS POR TIPO
  // =====================================================

  validarEncendedor(especificaciones: any): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!especificaciones.tipo_material) errores.push('Tipo de material es requerido');
    if (!especificaciones.capacidad_combustible_ml) errores.push('Capacidad de combustible es requerida');
    if (!especificaciones.tipo_combustible) errores.push('Tipo de combustible es requerido');
    if (!especificaciones.mecanismo_encendido) errores.push('Mecanismo de encendido es requerido');

    if (especificaciones.capacidad_combustible_ml > 65) {
      errores.push('Capacidad máxima para encendedores recargables es 65ml');
    }

    return { valido: errores.length === 0, errores };
  }

  validarAnteojos(especificaciones: any): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!especificaciones.tipo_anteojo) errores.push('Tipo de anteojo es requerido');
    if (!especificaciones.material_lentes) errores.push('Material de lentes es requerido');
    if (!especificaciones.tipo_lentes) errores.push('Tipo de lentes es requerido');

    return { valido: errores.length === 0, errores };
  }

  validarJuguete(especificaciones: any): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!especificaciones.materiales_principales || especificaciones.materiales_principales.length === 0) {
      errores.push('Al menos un material principal es requerido');
    }

    if (!especificaciones.peso_gramos) errores.push('Peso es requerido');

    return { valido: errores.length === 0, errores };
  }
}

export const moduloConsumoService = new ModuloConsumoService();
