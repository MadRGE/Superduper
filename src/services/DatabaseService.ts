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

  async getClienteCompleto(clienteId: string) {
    try {
      const { data: cliente, error } = await supabase
        .from('clientes')
        .select(`
          *,
          expedientes(*),
          contactos(*),
          habilitaciones(*)
        `)
        .eq('id', clienteId)
        .single();
      
      if (error) {
        console.error('Error fetching cliente completo:', error);
        throw error;
      }
      return cliente;
    } catch (error) {
      // Fallback to localStorage for now
      const clientes = JSON.parse(localStorage.getItem('sgt_clientes') || '[]');
      return clientes.find((c: any) => c.id === clienteId) || null;
    }
  }

  async getProductosRelacionados(clienteId: string) {
    try {
      const { data: productos, error } = await supabase
        .from('productos')
        .select('*')
        .eq('cliente_id', clienteId);
      
      if (error) {
        console.error('Error fetching productos relacionados:', error);
        throw error;
      }
      return productos;
    } catch (error) {
      // Return mock data filtrada por clienteId como fallback
      const productosMock = [
        {
          id: 'prod-1',
          cliente_id: 'cliente-1',
          nombre: 'Yogur Natural 200g',
          marca: 'DelSur',
          rnpa: 'RNPA 04-123456',
          categoria: 'Productos Lácteos',
          estado: 'vigente',
          vencimiento: '2026-03-15',
          peso_neto: '200g',
          vida_util: '30 días',
          codigo_ean: '7791234567890'
        },
        {
          id: 'prod-2',
          cliente_id: 'cliente-2',
          nombre: 'Router WiFi 6 Pro',
          marca: 'TechCorp',
          rnpa: 'N/A',
          categoria: 'Equipos de Telecomunicaciones',
          estado: 'vigente',
          vencimiento: '2026-08-15',
          peso_neto: '450g',
          vida_util: 'N/A',
          codigo_ean: '7791234567891'
        }
      ];
      return productosMock.filter(producto => producto.cliente_id === clienteId);
    }
  }

  async getComunicacionesByCliente(clienteId: string) {
    try {
      const { data: comunicaciones, error } = await supabase
        .from('comunicaciones')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching comunicaciones:', error);
        throw error;
      }
      return comunicaciones;
    } catch (error) {
      // Return mock data filtrada por clienteId como fallback
      const comunicacionesMock = [
        {
          id: 'com-1',
          cliente_id: 'cliente-1',
          fecha: '2025-01-25 10:30',
          tipo: 'email',
          asunto: 'Documentación pendiente',
          destinatario: 'contacto@lacteosdelsur.com',
          estado: 'enviado',
          mensaje: 'Estimado cliente, necesitamos que complete la documentación...',
          expediente_relacionado: 'SGT-2025-ANMAT-00123'
        },
        {
          id: 'com-2',
          cliente_id: 'cliente-2',
          fecha: '2025-01-24 14:15',
          tipo: 'whatsapp',
          asunto: 'Actualización de estado',
          destinatario: '+54 11 9876-5432',
          estado: 'enviado',
          mensaje: 'Su expediente de homologación avanzó al siguiente paso...',
          expediente_relacionado: 'SGT-2025-ENACOM-00087'
        }
      ];
      return comunicacionesMock.filter(comunicacion => comunicacion.cliente_id === clienteId);
    }
  }

  async getFacturasByCliente(clienteId: string) {
    try {
      const { data: facturas, error } = await supabase
        .from('facturas')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('fecha', { ascending: false });
      
      if (error) {
        console.error('Error fetching facturas:', error);
        throw error;
      }
      return facturas;
    } catch (error) {
      // Return mock data filtrada por clienteId como fallback
      const facturasMock = [
        {
          id: 'fact-1',
          cliente_id: 'cliente-1',
          numero: 'FC-A-00001-00000234',
          fecha: '2025-01-20',
          concepto: 'RNPA Yogur Natural',
          total: 544500,
          estado: 'pagada',
          fecha_pago: '2025-01-25'
        },
        {
          id: 'fact-2',
          cliente_id: 'cliente-2',
          numero: 'FC-A-00001-00000235',
          fecha: '2025-01-18',
          concepto: 'Homologación ENACOM Router WiFi',
          total: 332750,
          estado: 'pendiente',
          fecha_pago: null
        }
      ];
      return facturasMock.filter(factura => factura.cliente_id === clienteId);
    }
  }

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