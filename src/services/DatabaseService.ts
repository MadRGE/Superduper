import { supabase } from '@/lib/supabase';
import type { 
  Expediente, 
  Cliente, 
  TramiteTipo, 
  Organismo, 
  Documento,
  Historial,
  Inserts,
  Updates 
} from '@/lib/supabase';

export class DatabaseService {
  // ==================== EXPEDIENTES ====================
  
  async getExpedientes() {
    const { data, error } = await supabase
      .from('expedientes')
      .select(`
        *,
        cliente:clientes(*),
        tramite_tipo:tramite_tipos(*),
        despachante:despachantes(*),
        documentos(count)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching expedientes:', error);
      throw error;
    }
    return data;
  }

  async getExpedienteById(id: string) {
    const { data, error } = await supabase
      .from('expedientes')
      .select(`
        *,
        cliente:clientes(*),
        tramite_tipo:tramite_tipos(*),
        despachante:despachantes(*),
        documentos(*),
        historial(*)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error('Error fetching expediente:', error);
      throw error;
    }
    return data;
  }

  async createExpediente(expediente: Inserts<'expedientes'>) {
    const { data, error } = await supabase
      .from('expedientes')
      .insert(expediente)
      .select(`
        *,
        cliente:clientes(*),
        tramite_tipo:tramite_tipos(*)
      `)
      .single();
    
    if (error) {
      console.error('Error creating expediente:', error);
      throw error;
    }
    return data;
  }

  async updateExpediente(id: string, updates: Updates<'expedientes'>) {
    const { data, error } = await supabase
      .from('expedientes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        cliente:clientes(*),
        tramite_tipo:tramite_tipos(*)
      `)
      .single();
    
    if (error) {
      console.error('Error updating expediente:', error);
      throw error;
    }
    return data;
  }

  async deleteExpediente(id: string) {
    const { error } = await supabase
      .from('expedientes')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting expediente:', error);
      throw error;
    }
  }

  // ==================== CLIENTES ====================

  async getClientes() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('is_active', true)
      .order('razon_social');
    
    if (error) {
      console.error('Error fetching clientes:', error);
      throw error;
    }
    return data;
  }

  async searchClienteByCuit(cuit: string) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('cuit', cuit)
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error searching cliente:', error);
      throw error;
    }
    return data;
  }

  async createCliente(cliente: Inserts<'clientes'>) {
    const { data, error } = await supabase
      .from('clientes')
      .insert(cliente)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating cliente:', error);
      throw error;
    }
    return data;
  }

  async updateCliente(id: string, updates: Updates<'clientes'>) {
    const { data, error } = await supabase
      .from('clientes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating cliente:', error);
      throw error;
    }
    return data;
  }

  // ==================== DOCUMENTOS ====================

  async getDocumentosByExpediente(expedienteId: string) {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .eq('expediente_id', expedienteId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching documentos:', error);
      throw error;
    }
    return data;
  }

  async uploadDocument(file: File, expedienteId: string, metadata?: any) {
    try {
      // 1. Subir archivo a Storage
      const fileName = `${expedienteId}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(fileName, file);
      
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }

      // 2. Guardar referencia en DB
      const { data, error } = await supabase
        .from('documentos')
        .insert({
          expediente_id: expedienteId,
          nombre: file.name,
          tipo: file.type,
          path: uploadData.path,
          formato: file.name.split('.').pop() || '',
          size_kb: Math.round(file.size / 1024),
          estado: 'pendiente',
          metadata: metadata || {},
          subido_por: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error saving document reference:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error in uploadDocument:', error);
      throw error;
    }
  }

  async updateDocumento(id: string, updates: Updates<'documentos'>) {
    const { data, error } = await supabase
      .from('documentos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating documento:', error);
      throw error;
    }
    return data;
  }

  async getDocumentUrl(path: string) {
    const { data } = supabase.storage
      .from('documentos')
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  // ==================== HISTORIAL ====================

  async getHistorialByExpediente(expedienteId: string) {
    const { data, error } = await supabase
      .from('historial')
      .select('*')
      .eq('expediente_id', expedienteId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching historial:', error);
      throw error;
    }
    return data;
  }

  async addHistorialEntry(entry: Inserts<'historial'>) {
    const { data, error } = await supabase
      .from('historial')
      .insert(entry)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding historial entry:', error);
      throw error;
    }
    return data;
  }

  // ==================== TRAMITE TIPOS ====================

  async getTramiteTipos() {
    const { data, error } = await supabase
      .from('tramite_tipos')
      .select(`
        *,
        organismo:organismos(*)
      `)
      .eq('is_active', true)
      .order('nombre');
    
    if (error) {
      console.error('Error fetching tramite tipos:', error);
      throw error;
    }
    return data;
  }

  async createTramiteTipo(tramiteTipo: Inserts<'tramite_tipos'>) {
    const { data, error } = await supabase
      .from('tramite_tipos')
      .insert(tramiteTipo)
      .select(`
        *,
        organismo:organismos(*)
      `)
      .single();
    
    if (error) {
      console.error('Error creating tramite tipo:', error);
      throw error;
    }
    return data;
  }

  // ==================== ORGANISMOS ====================

  async getOrganismos() {
    const { data, error } = await supabase
      .from('organismos')
      .select('*')
      .eq('activo', true)
      .order('sigla');
    
    if (error) {
      console.error('Error fetching organismos:', error);
      throw error;
    }
    return data;
  }

  async createOrganismo(organismo: Inserts<'organismos'>) {
    const { data, error } = await supabase
      .from('organismos')
      .insert(organismo)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating organismo:', error);
      throw error;
    }
    return data;
  }

  // ==================== DESPACHANTES ====================

  async getDespachantes() {
    const { data, error } = await supabase
      .from('despachantes')
      .select('*')
      .eq('is_active', true)
      .order('nombre');
    
    if (error) {
      console.error('Error fetching despachantes:', error);
      throw error;
    }
    return data;
  }

  async createDespachante(despachante: Inserts<'despachantes'>) {
    const { data, error } = await supabase
      .from('despachantes')
      .insert(despachante)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating despachante:', error);
      throw error;
    }
    return data;
  }

  // ==================== UTILITY METHODS ====================

  async generateExpedienteCodigo(organismoSigla: string): Promise<string> {
    const year = new Date().getFullYear();
    
    // Get the last expediente for this year and organismo
    const { data, error } = await supabase
      .from('expedientes')
      .select('codigo')
      .like('codigo', `SGT-${year}-${organismoSigla}-%`)
      .order('codigo', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error generating codigo:', error);
      // Fallback to random number
      const sequential = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
      return `SGT-${year}-${organismoSigla}-${sequential}`;
    }
    
    let nextNumber = 1;
    if (data && data.length > 0) {
      const lastCodigo = data[0].codigo;
      const lastNumber = parseInt(lastCodigo.split('-').pop() || '0');
      nextNumber = lastNumber + 1;
    }
    
    const sequential = nextNumber.toString().padStart(5, '0');
    return `SGT-${year}-${organismoSigla}-${sequential}`;
  }

  async calculateFechaLimite(slaDias: number): Promise<string> {
    const fecha = new Date();
    let diasAgregados = 0;
    
    while (diasAgregados < slaDias) {
      fecha.setDate(fecha.getDate() + 1);
      // Skip weekends
      if (fecha.getDay() !== 0 && fecha.getDay() !== 6) {
        diasAgregados++;
      }
    }
    
    return fecha.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();