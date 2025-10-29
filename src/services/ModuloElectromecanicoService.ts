import { supabase } from '../lib/supabase';
import { ExpedienteElectromecanico, TipoRegulacion, TipoProductoElectromecanico, EstadoElectromecanico } from '../types/modulos-normativos';
import { ModuloNormativoService } from './ModuloNormativoService';

export class ModuloElectromecanicoService extends ModuloNormativoService {
  private tabla = 'expedientes_electromecanico';

  async getExpedientesElectromecanico(clienteId?: string): Promise<ExpedienteElectromecanico[]> {
    let query = supabase
      .from(this.tabla)
      .select(`*,cliente:clientes(id, razon_social, cuit),laboratorio:laboratorios_certificadores(id, nombre, sigla)`)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (clienteId) query = query.eq('cliente_id', clienteId);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getExpedienteElectromecanicoById(id: string): Promise<ExpedienteElectromecanico | null> {
    const { data, error } = await supabase
      .from(this.tabla)
      .select(`*,cliente:clientes(*),laboratorio:laboratorios_certificadores(*)`)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createExpedienteElectromecanico(expediente: Partial<ExpedienteElectromecanico>): Promise<ExpedienteElectromecanico> {
    const fechaVencimiento = this.calcularFechaVencimiento(
      new Date(expediente.certificado_fecha_emision!),
      expediente.certificado_vigencia_anos || 2
    );

    const nuevoExpediente = {
      ...expediente,
      fecha_vencimiento: fechaVencimiento.toISOString(),
      estado: 'DOCUMENTACION' as EstadoElectromecanico,
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

  async updateExpedienteElectromecanico(id: string, expediente: Partial<ExpedienteElectromecanico>): Promise<ExpedienteElectromecanico> {
    if (expediente.costo_ensayos !== undefined || expediente.costo_certificacion !== undefined || expediente.costo_djc !== undefined) {
      const actual = await this.getExpedienteElectromecanicoById(id);
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

  async deleteExpedienteElectromecanico(id: string): Promise<void> {
    const { error } = await supabase.from(this.tabla).update({ is_active: false }).eq('id', id);
    if (error) throw error;
  }

  async getExpedientesByTipoRegulacion(tipo: TipoRegulacion): Promise<ExpedienteElectromecanico[]> {
    const { data, error } = await supabase
      .from(this.tabla)
      .select('*')
      .eq('tipo_regulacion', tipo)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getRepuestosInsumos(): Promise<ExpedienteElectromecanico[]> {
    const { data, error } = await supabase
      .from(this.tabla)
      .select('*')
      .eq('es_repuesto_insumo', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getCertificadosTransicion(): Promise<ExpedienteElectromecanico[]> {
    const fechaLimite = new Date('2026-02-26');

    const { data, error } = await supabase
      .from(this.tabla)
      .select('*')
      .eq('es_certificado_anterior', true)
      .lte('certificacion_anterior_vencimiento', fechaLimite.toISOString())
      .eq('is_active', true)
      .order('certificacion_anterior_vencimiento');

    if (error) throw error;
    return data || [];
  }

  async getEstadisticasPorRegulacion(): Promise<Record<TipoRegulacion, number>> {
    const { data, error } = await supabase.from(this.tabla).select('tipo_regulacion').eq('is_active', true);

    if (error) throw error;

    const estadisticas: Record<string, number> = {};
    (data || []).forEach(item => {
      estadisticas[item.tipo_regulacion] = (estadisticas[item.tipo_regulacion] || 0) + 1;
    });

    return estadisticas as Record<TipoRegulacion, number>;
  }
}

export const moduloElectromecanicoService = new ModuloElectromecanicoService();
