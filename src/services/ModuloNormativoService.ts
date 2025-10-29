import { supabase } from '../lib/supabase';
import {
  LaboratorioCertificador,
  NormaTecnica,
  ExpedienteConsumo,
  ExpedienteEPP,
  ExpedienteEficiencia,
  ExpedienteElectromecanico
} from '../types/modulos-normativos';

export class ModuloNormativoService {
  // =====================================================
  // LABORATORIOS CERTIFICADORES
  // =====================================================

  async getLaboratorios(): Promise<LaboratorioCertificador[]> {
    const { data, error } = await supabase
      .from('laboratorios_certificadores')
      .select('*')
      .eq('is_active', true)
      .order('nombre');

    if (error) throw error;
    return data || [];
  }

  async getLaboratorioById(id: string): Promise<LaboratorioCertificador | null> {
    const { data, error } = await supabase
      .from('laboratorios_certificadores')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getLaboratoriosBySigla(sigla: string): Promise<LaboratorioCertificador[]> {
    const { data, error } = await supabase
      .from('laboratorios_certificadores')
      .select('*')
      .ilike('sigla', `%${sigla}%`)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  async getLaboratoriosByTipo(tipo: string): Promise<LaboratorioCertificador[]> {
    const { data, error } = await supabase
      .from('laboratorios_certificadores')
      .select('*')
      .eq('tipo', tipo)
      .eq('is_active', true)
      .order('nombre');

    if (error) throw error;
    return data || [];
  }

  async createLaboratorio(laboratorio: Omit<LaboratorioCertificador, 'id' | 'created_at' | 'updated_at'>): Promise<LaboratorioCertificador> {
    const { data, error } = await supabase
      .from('laboratorios_certificadores')
      .insert(laboratorio)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateLaboratorio(id: string, laboratorio: Partial<LaboratorioCertificador>): Promise<LaboratorioCertificador> {
    const { data, error } = await supabase
      .from('laboratorios_certificadores')
      .update(laboratorio)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // =====================================================
  // NORMAS TÉCNICAS
  // =====================================================

  async getNormas(): Promise<NormaTecnica[]> {
    const { data, error } = await supabase
      .from('normas_tecnicas')
      .select('*')
      .eq('vigente', true)
      .order('codigo');

    if (error) throw error;
    return data || [];
  }

  async getNormaById(id: string): Promise<NormaTecnica | null> {
    const { data, error } = await supabase
      .from('normas_tecnicas')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getNormaByCodigo(codigo: string): Promise<NormaTecnica | null> {
    const { data, error } = await supabase
      .from('normas_tecnicas')
      .select('*')
      .eq('codigo', codigo)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getNormasByOrganismo(organismo: string): Promise<NormaTecnica[]> {
    const { data, error } = await supabase
      .from('normas_tecnicas')
      .select('*')
      .eq('organismo', organismo)
      .eq('vigente', true)
      .order('codigo');

    if (error) throw error;
    return data || [];
  }

  async getNormasByCategoria(categoria: string): Promise<NormaTecnica[]> {
    const { data, error } = await supabase
      .from('normas_tecnicas')
      .select('*')
      .eq('categoria', categoria)
      .eq('vigente', true)
      .order('codigo');

    if (error) throw error;
    return data || [];
  }

  async searchNormas(query: string): Promise<NormaTecnica[]> {
    const { data, error } = await supabase
      .from('normas_tecnicas')
      .select('*')
      .or(`codigo.ilike.%${query}%,titulo.ilike.%${query}%`)
      .eq('vigente', true)
      .order('codigo')
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  async createNorma(norma: Omit<NormaTecnica, 'id' | 'created_at' | 'updated_at'>): Promise<NormaTecnica> {
    const { data, error } = await supabase
      .from('normas_tecnicas')
      .insert(norma)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateNorma(id: string, norma: Partial<NormaTecnica>): Promise<NormaTecnica> {
    const { data, error } = await supabase
      .from('normas_tecnicas')
      .update(norma)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // =====================================================
  // UTILIDADES COMUNES
  // =====================================================

  calcularFechaVencimiento(fechaEmision: Date, vigenciaAnos: number): Date {
    const fecha = new Date(fechaEmision);
    fecha.setFullYear(fecha.getFullYear() + vigenciaAnos);
    return fecha;
  }

  calcularProximaVigilancia(fechaVencimiento: Date, frecuencia: 'ANUAL' | 'SEMESTRAL' | 'TRIMESTRAL'): Date {
    const fecha = new Date(fechaVencimiento);
    const mesesAntes = frecuencia === 'ANUAL' ? 12 : frecuencia === 'SEMESTRAL' ? 6 : 3;
    fecha.setMonth(fecha.getMonth() - mesesAntes);
    return fecha;
  }

  estaVencido(fechaVencimiento: Date): boolean {
    return new Date(fechaVencimiento) < new Date();
  }

  diasParaVencimiento(fechaVencimiento: Date): number {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diff = vencimiento.getTime() - hoy.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  requiereAlerta(fechaVencimiento: Date, diasAntes: number = 60): boolean {
    const dias = this.diasParaVencimiento(fechaVencimiento);
    return dias <= diasAntes && dias >= 0;
  }

  async getExpedientesProximosVencer(tabla: string, diasAntes: number = 60) {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + diasAntes);

    const { data, error } = await supabase
      .from(tabla)
      .select('*')
      .eq('is_active', true)
      .eq('estado', 'VIGENTE')
      .lte('fecha_vencimiento', fechaLimite.toISOString())
      .gte('fecha_vencimiento', new Date().toISOString())
      .order('fecha_vencimiento');

    if (error) throw error;
    return data || [];
  }

  async getExpedientesVencidos(tabla: string) {
    const { data, error } = await supabase
      .from(tabla)
      .select('*')
      .eq('is_active', true)
      .lt('fecha_vencimiento', new Date().toISOString())
      .order('fecha_vencimiento', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  generarCodigoQR(contenido: any): string {
    return `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generarCodigoAccesoPublico(): string {
    return `PUB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
}

export const moduloNormativoService = new ModuloNormativoService();
