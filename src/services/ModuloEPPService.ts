import { supabase } from '../lib/supabase';
import { ExpedienteEPP, CategoriaRiesgo, TipoEPP, EstadoEPP, FrecuenciaVigilancia } from '../types/modulos-normativos';
import { ModuloNormativoService } from './ModuloNormativoService';

export class ModuloEPPService extends ModuloNormativoService {
  private tabla = 'expedientes_epp';

  // =====================================================
  // CRUD BÁSICO
  // =====================================================

  async getExpedientesEPP(clienteId?: string): Promise<ExpedienteEPP[]> {
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

  async getExpedienteEPPById(id: string): Promise<ExpedienteEPP | null> {
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

  async createExpedienteEPP(expediente: Partial<ExpedienteEPP>): Promise<ExpedienteEPP> {
    const fechaVencimiento = this.calcularFechaVencimiento(
      new Date(expediente.certificado_fecha_emision!),
      expediente.certificado_vigencia_anos || 2
    );

    const frecuencia = this.determinarFrecuenciaVigilancia(expediente.categoria_riesgo!);

    const nuevoExpediente = {
      ...expediente,
      fecha_vencimiento: fechaVencimiento.toISOString(),
      frecuencia_vigilancia: frecuencia,
      estado: 'DOCUMENTACION' as EstadoEPP,
      costo_total:
        (expediente.costo_ensayos || 0) +
        (expediente.costo_certificacion || 0) +
        (expediente.costo_djc || 0),
    };

    const { data, error } = await supabase
      .from(this.tabla)
      .insert(nuevoExpediente)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateExpedienteEPP(id: string, expediente: Partial<ExpedienteEPP>): Promise<ExpedienteEPP> {
    if (expediente.costo_ensayos !== undefined || expediente.costo_certificacion !== undefined || expediente.costo_djc !== undefined) {
      const actual = await this.getExpedienteEPPById(id);
      if (actual) {
        expediente.costo_total =
          (expediente.costo_ensayos ?? actual.costo_ensayos) +
          (expediente.costo_certificacion ?? actual.costo_certificacion) +
          (expediente.costo_djc ?? actual.costo_djc);
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

  async deleteExpedienteEPP(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tabla)
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  // =====================================================
  // BÚSQUEDAS ESPECÍFICAS
  // =====================================================

  async getExpedientesByCategoria(categoria: CategoriaRiesgo, clienteId?: string): Promise<ExpedienteEPP[]> {
    let query = supabase
      .from(this.tabla)
      .select('*')
      .eq('categoria_riesgo', categoria)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getExpedientesByTipoEPP(tipo: TipoEPP, clienteId?: string): Promise<ExpedienteEPP[]> {
    let query = supabase
      .from(this.tabla)
      .select('*')
      .eq('tipo_epp', tipo)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getExpedientesByEstado(estado: EstadoEPP, clienteId?: string): Promise<ExpedienteEPP[]> {
    let query = supabase
      .from(this.tabla)
      .select('*')
      .eq('estado', estado)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getExpedientesPorVencer(diasAntes: number = 60): Promise<ExpedienteEPP[]> {
    return await this.getExpedientesProximosVencer(this.tabla, diasAntes);
  }

  async getExpedientesVencidos(): Promise<ExpedienteEPP[]> {
    return await super.getExpedientesVencidos(this.tabla);
  }

  async searchExpedientes(query: string): Promise<ExpedienteEPP[]> {
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

  determinarFrecuenciaVigilancia(categoria: CategoriaRiesgo): FrecuenciaVigilancia {
    switch (categoria) {
      case 'CATEGORIA_I':
        return 'ANUAL';
      case 'CATEGORIA_II':
        return 'SEMESTRAL';
      case 'CATEGORIA_III':
        return 'TRIMESTRAL';
      default:
        return 'ANUAL';
    }
  }

  async actualizarEstado(id: string, nuevoEstado: EstadoEPP): Promise<ExpedienteEPP> {
    const expediente = await this.getExpedienteEPPById(id);
    if (!expediente) throw new Error('Expediente no encontrado');

    const actualizacion: Partial<ExpedienteEPP> = {
      estado: nuevoEstado,
    };

    if (nuevoEstado === 'VIGENTE') {
      actualizacion.proxima_vigilancia = this.calcularProximaVigilancia(
        new Date(expediente.fecha_vencimiento),
        expediente.frecuencia_vigilancia
      ).toISOString() as any;
    }

    return await this.updateExpedienteEPP(id, actualizacion);
  }

  async marcarRotuladoCompleto(id: string, datosRotulado: any): Promise<ExpedienteEPP> {
    return await this.updateExpedienteEPP(id, {
      rotulado_completado: true,
      rotulado_datos: datosRotulado as any,
    });
  }

  async agregarVigilancia(id: string, vigilancia: any): Promise<ExpedienteEPP> {
    const expediente = await this.getExpedienteEPPById(id);
    if (!expediente) throw new Error('Expediente no encontrado');

    const vigilancias = Array.isArray(expediente.vigilancias) ? expediente.vigilancias : [];
    vigilancias.push({
      ...vigilancia,
      fecha: new Date().toISOString(),
    });

    const proximaVigilancia = this.calcularProximaVigilancia(
      new Date(expediente.fecha_vencimiento),
      expediente.frecuencia_vigilancia
    );

    return await this.updateExpedienteEPP(id, {
      vigilancias: vigilancias as any,
      proxima_vigilancia: proximaVigilancia.toISOString() as any,
    });
  }

  // =====================================================
  // ESTADÍSTICAS Y DASHBOARDS
  // =====================================================

  async getEstadisticasPorCategoria(): Promise<Record<CategoriaRiesgo, number>> {
    const { data, error } = await supabase
      .from(this.tabla)
      .select('categoria_riesgo')
      .eq('is_active', true);

    if (error) throw error;

    const estadisticas: Record<string, number> = {};
    (data || []).forEach(item => {
      estadisticas[item.categoria_riesgo] = (estadisticas[item.categoria_riesgo] || 0) + 1;
    });

    return estadisticas as Record<CategoriaRiesgo, number>;
  }

  async getEstadisticasPorTipo(): Promise<Record<TipoEPP, number>> {
    const { data, error } = await supabase
      .from(this.tabla)
      .select('tipo_epp')
      .eq('is_active', true);

    if (error) throw error;

    const estadisticas: Record<string, number> = {};
    (data || []).forEach(item => {
      estadisticas[item.tipo_epp] = (estadisticas[item.tipo_epp] || 0) + 1;
    });

    return estadisticas as Record<TipoEPP, number>;
  }

  async getEstadisticasPorEstado(): Promise<Record<EstadoEPP, number>> {
    const { data, error } = await supabase
      .from(this.tabla)
      .select('estado')
      .eq('is_active', true);

    if (error) throw error;

    const estadisticas: Record<string, number> = {};
    (data || []).forEach(item => {
      estadisticas[item.estado] = (estadisticas[item.estado] || 0) + 1;
    });

    return estadisticas as Record<EstadoEPP, number>;
  }

  async getCostosTotales(): Promise<{ ensayos: number; certificacion: number; djc: number; total: number }> {
    const { data, error } = await supabase
      .from(this.tabla)
      .select('costo_ensayos, costo_certificacion, costo_djc, costo_total')
      .eq('is_active', true);

    if (error) throw error;

    const totales = (data || []).reduce(
      (acc, item) => ({
        ensayos: acc.ensayos + (item.costo_ensayos || 0),
        certificacion: acc.certificacion + (item.costo_certificacion || 0),
        djc: acc.djc + (item.costo_djc || 0),
        total: acc.total + (item.costo_total || 0),
      }),
      { ensayos: 0, certificacion: 0, djc: 0, total: 0 }
    );

    return totales;
  }

  async getVigilanciasProximas(): Promise<ExpedienteEPP[]> {
    const hoy = new Date();
    const { data, error } = await supabase
      .from(this.tabla)
      .select('*')
      .eq('is_active', true)
      .eq('estado', 'VIGENTE')
      .not('proxima_vigilancia', 'is', null)
      .lte('proxima_vigilancia', hoy.toISOString())
      .order('proxima_vigilancia');

    if (error) throw error;
    return data || [];
  }

  // =====================================================
  // VALIDACIONES PROTECCIONES
  // =====================================================

  validarProteccionesBasicas(protecciones: any): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (protecciones.choque_electrico === undefined) {
      errores.push('Debe verificar protección contra choque eléctrico');
    }

    if (protecciones.peligros_mecanicos === undefined) {
      errores.push('Debe verificar protección contra peligros mecánicos');
    }

    if (protecciones.peligros_termicos === undefined) {
      errores.push('Debe verificar protección contra peligros térmicos');
    }

    return { valido: errores.length === 0, errores };
  }

  validarProteccionesCategoriaIII(protecciones: any): { valido: boolean; errores: string[] } {
    const validacionBasica = this.validarProteccionesBasicas(protecciones);

    if (!validacionBasica.valido) {
      return validacionBasica;
    }

    const errores: string[] = [];

    if (protecciones.sistema_parada_emergencia === undefined) {
      errores.push('EPP Categoría III debe verificar sistema de parada de emergencia');
    }

    return { valido: errores.length === 0, errores };
  }
}

export const moduloEPPService = new ModuloEPPService();
