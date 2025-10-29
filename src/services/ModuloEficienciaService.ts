import { supabase } from '../lib/supabase';
import { ExpedienteEficiencia, ClaseEnergetica, CategoriaProductoEficiencia, EstadoEficiencia } from '../types/modulos-normativos';
import { ModuloNormativoService } from './ModuloNormativoService';

export class ModuloEficienciaService extends ModuloNormativoService {
  private tabla = 'expedientes_eficiencia';

  async getExpedientesEficiencia(clienteId?: string): Promise<ExpedienteEficiencia[]> {
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

  async getExpedienteEficienciaById(id: string): Promise<ExpedienteEficiencia | null> {
    const { data, error } = await supabase
      .from(this.tabla)
      .select(`*,cliente:clientes(*),laboratorio:laboratorios_certificadores(*)`)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createExpedienteEficiencia(expediente: Partial<ExpedienteEficiencia>): Promise<ExpedienteEficiencia> {
    const fechaVencimiento = this.calcularFechaVencimiento(
      new Date(expediente.certificado_fecha_emision!),
      expediente.certificado_vigencia_anos || 2
    );

    const nuevoExpediente = {
      ...expediente,
      fecha_vencimiento: fechaVencimiento.toISOString(),
      estado: 'DOCUMENTACION' as EstadoEficiencia,
      costo_total:
        (expediente.costo_ensayos || 0) +
        (expediente.costo_certificacion || 0) +
        (expediente.costo_etiquetado || 0),
    };

    const { data, error } = await supabase
      .from(this.tabla)
      .insert(nuevoExpediente)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateExpedienteEficiencia(id: string, expediente: Partial<ExpedienteEficiencia>): Promise<ExpedienteEficiencia> {
    if (expediente.costo_ensayos !== undefined || expediente.costo_certificacion !== undefined || expediente.costo_etiquetado !== undefined) {
      const actual = await this.getExpedienteEficienciaById(id);
      if (actual) {
        expediente.costo_total =
          (expediente.costo_ensayos ?? actual.costo_ensayos) +
          (expediente.costo_certificacion ?? actual.costo_certificacion) +
          (expediente.costo_etiquetado ?? actual.costo_etiquetado);
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

  async deleteExpedienteEficiencia(id: string): Promise<void> {
    const { error } = await supabase.from(this.tabla).update({ is_active: false }).eq('id', id);
    if (error) throw error;
  }

  async getExpedientesByClase(clase: ClaseEnergetica): Promise<ExpedienteEficiencia[]> {
    const { data, error } = await supabase
      .from(this.tabla)
      .select('*')
      .eq('clase_energetica', clase)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getExpedientesPublicos(): Promise<ExpedienteEficiencia[]> {
    const { data, error } = await supabase
      .from(this.tabla)
      .select('*')
      .eq('registrado_base_datos', true)
      .eq('estado', 'VIGENTE')
      .eq('is_active', true)
      .order('clase_energetica');

    if (error) throw error;
    return data || [];
  }

  async registrarEnBaseDatos(id: string): Promise<ExpedienteEficiencia> {
    const codigo = this.generarCodigoAccesoPublico();

    return await this.updateExpedienteEficiencia(id, {
      registrado_base_datos: true,
      fecha_registro: new Date().toISOString() as any,
      codigo_acceso_publico: codigo,
      enlace_portal_dnrt: `https://portal.dnrt.gov.ar/eficiencia/${codigo}`,
    });
  }

  async generarEtiqueta(id: string, datosEtiqueta: any): Promise<ExpedienteEficiencia> {
    return await this.updateExpedienteEficiencia(id, {
      etiqueta_generada: true,
      etiqueta_datos: datosEtiqueta as any,
    });
  }

  async getEstadisticasPorClase(): Promise<Record<ClaseEnergetica, number>> {
    const { data, error } = await supabase.from(this.tabla).select('clase_energetica').eq('is_active', true);

    if (error) throw error;

    const estadisticas: Record<string, number> = {};
    (data || []).forEach(item => {
      estadisticas[item.clase_energetica] = (estadisticas[item.clase_energetica] || 0) + 1;
    });

    return estadisticas as Record<ClaseEnergetica, number>;
  }

  async getConsumoPromedio(categoria: CategoriaProductoEficiencia): Promise<number> {
    const { data, error } = await supabase
      .from(this.tabla)
      .select('consumo_energetico')
      .eq('categoria_producto', categoria)
      .eq('is_active', true);

    if (error) throw error;

    const total = (data || []).reduce((acc, item) => acc + item.consumo_energetico, 0);
    return data && data.length > 0 ? total / data.length : 0;
  }
}

export const moduloEficienciaService = new ModuloEficienciaService();
