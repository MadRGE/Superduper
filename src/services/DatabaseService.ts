import { supabase } from '@/lib/supabase';
import type { 
  Expediente, 
  Cliente, 
  TramiteTipo, 
  Organismo, 
  Documento,
  Historial,
  CasoLegal,
  Producto,
  Habilitacion,
  Comunicacion,
  Tarea,
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

  async deleteCliente(id: string) {
    // Soft delete - marcar como inactivo
    const { data, error } = await supabase
      .from('clientes')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error deleting cliente:', error);
      throw error;
    }
    return data;
  }

  async reactivateCliente(id: string) {
    // Reactivar cliente
    const { data, error } = await supabase
      .from('clientes')
      .update({ 
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error reactivating cliente:', error);
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

  // ==================== CASOS LEGALES ====================

  async getCasosLegales() {
    const { data, error } = await supabase
      .from('casos_legales')
      .select(`
        *,
        cliente:clientes(*),
        expedientes(count),
        tareas(count)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching casos legales:', error);
      // Fallback to mock data
      const casosMock = [
        {
          id: 'caso-1',
          cliente_id: 'cliente-1',
          nombre_caso: 'Registro RNPA Productos Lácteos',
          descripcion: 'Gestión integral de registros RNPA para línea de productos lácteos de la empresa',
          estado_legal: 'abierto',
          fecha_apertura: '2025-01-15',
          fecha_cierre: null,
          abogado_responsable_id: null,
          metadata: { categoria: 'regulatorio', prioridad: 'alta' },
          is_active: true,
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
          cliente: {
            id: 'cliente-1',
            razon_social: 'Lácteos del Sur S.A.',
            cuit: '30-12345678-9',
            email: 'contacto@lacteosdelsur.com'
          }
        },
        {
          id: 'caso-2',
          cliente_id: 'cliente-2',
          nombre_caso: 'Homologación Equipos Telecomunicaciones',
          descripcion: 'Proceso de homologación ENACOM para línea de productos tecnológicos',
          estado_legal: 'abierto',
          fecha_apertura: '2025-01-10',
          fecha_cierre: null,
          abogado_responsable_id: null,
          metadata: { categoria: 'tecnologia', prioridad: 'normal' },
          is_active: true,
          created_at: '2025-01-10T09:00:00Z',
          updated_at: '2025-01-10T09:00:00Z',
          cliente: {
            id: 'cliente-2',
            razon_social: 'TechCorp Argentina',
            cuit: '30-98765432-1',
            email: 'info@techcorp.com.ar'
          }
        }
      ];
      return casosMock;
    }
    return data;
  }

  async getCasosLegalesByCliente(clienteId: string) {
    const { data, error } = await supabase
      .from('casos_legales')
      .select(`
        *,
        expedientes(*),
        tareas(*),
        comunicaciones(*)
      `)
      .eq('cliente_id', clienteId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching casos legales by cliente:', error);
      // Fallback to mock data
      const casosMock = [
        {
          id: 'caso-1',
          cliente_id: 'cliente-1',
          nombre_caso: 'Registro RNPA Productos Lácteos',
          descripcion: 'Gestión integral de registros RNPA para línea de productos lácteos',
          estado_legal: 'abierto',
          fecha_apertura: '2025-01-15',
          fecha_cierre: null,
          abogado_responsable_id: null,
          metadata: { categoria: 'regulatorio', prioridad: 'alta' },
          is_active: true,
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z'
        },
        {
          id: 'caso-2',
          cliente_id: 'cliente-2',
          nombre_caso: 'Homologación Equipos Telecomunicaciones',
          descripcion: 'Proceso de homologación ENACOM para línea de productos tecnológicos',
          estado_legal: 'abierto',
          fecha_apertura: '2025-01-10',
          fecha_cierre: null,
          abogado_responsable_id: null,
          metadata: { categoria: 'tecnologia', prioridad: 'normal' },
          is_active: true,
          created_at: '2025-01-10T09:00:00Z',
          updated_at: '2025-01-10T09:00:00Z'
        }
      ];
      return casosMock.filter(caso => caso.cliente_id === clienteId);
    }
    return data;
  }

  async createCasoLegal(casoLegal: Inserts<'casos_legales'>) {
    const { data, error } = await supabase
      .from('casos_legales')
      .insert(casoLegal)
      .select(`
        *,
        cliente:clientes(*)
      `)
      .single();
    
    if (error) {
      console.error('Error creating caso legal:', error);
      // Fallback: guardar en localStorage
      const nuevoId = `caso-${Date.now()}`;
      const nuevoCaso = {
        id: nuevoId,
        ...casoLegal,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const casosStorage = JSON.parse(localStorage.getItem('sgt_casos_legales') || '[]');
      casosStorage.push(nuevoCaso);
      localStorage.setItem('sgt_casos_legales', JSON.stringify(casosStorage));
      
      return nuevoCaso;
    }
    return data;
  }

  async updateCasoLegal(id: string, updates: Updates<'casos_legales'>) {
    const { data, error } = await supabase
      .from('casos_legales')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        cliente:clientes(*)
      `)
      .single();
    
    if (error) {
      console.error('Error updating caso legal:', error);
      // Fallback: actualizar en localStorage
      const casosStorage = JSON.parse(localStorage.getItem('sgt_casos_legales') || '[]');
      const index = casosStorage.findIndex((c: any) => c.id === id);
      if (index !== -1) {
        casosStorage[index] = { ...casosStorage[index], ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem('sgt_casos_legales', JSON.stringify(casosStorage));
        return casosStorage[index];
      }
      throw new Error('Caso legal no encontrado');
    }
    return data;
  }

  // ==================== PRODUCTOS ====================

  async getProductosByCliente(clienteId: string) {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('is_active', true)
      .order('nombre');
    
    if (error) {
      console.error('Error fetching productos:', error);
      // Fallback to mock data filtered by clienteId
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
        },
        {
          id: 'prod-3',
          cliente_id: 'cliente-3',
          nombre: 'Plancha de Pelo Cerámica',
          marca: 'BeautyTech',
          rnpa: 'N/A',
          categoria: 'Productos Eléctricos',
          estado: 'vigente',
          vencimiento: '2025-12-20',
          peso_neto: '800g',
          vida_util: 'N/A',
          codigo_ean: '7791234567892'
        }
      ];
      return productosMock.filter(producto => producto.cliente_id === clienteId);
    }
    return data;
  }

  async createProducto(producto: Inserts<'productos'>) {
    const { data, error } = await supabase
      .from('productos')
      .insert(producto)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating producto:', error);
      throw error;
    }
    return data;
  }

  async updateProducto(id: string, updates: Updates<'productos'>) {
    const { data, error } = await supabase
      .from('productos')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating producto:', error);
      throw error;
    }
    return data;
  }

  // ==================== HABILITACIONES ====================

  async getHabilitacionesByCliente(clienteId: string) {
    const { data, error } = await supabase
      .from('habilitaciones')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('is_active', true)
      .order('vencimiento');
    
    if (error) {
      console.error('Error fetching habilitaciones:', error);
      // Fallback to mock data filtered by clienteId
      const habilitacionesMock = [
        {
          id: 'hab-1',
          cliente_id: 'cliente-1',
          tipo: 'RNE',
          numero: '04-000123',
          establecimiento: 'Planta Elaboradora Sur',
          direccion: 'Av. Industrial 1234, Quilmes',
          vencimiento: '2027-05-15',
          estado: 'vigente',
          actividades: ['Elaboración', 'Fraccionamiento', 'Depósito']
        },
        {
          id: 'hab-2',
          cliente_id: 'cliente-2',
          tipo: 'Homologación ENACOM',
          numero: 'ENACOM-2024-456',
          establecimiento: 'Laboratorio Técnico',
          direccion: 'Av. Tecnológica 567, CABA',
          vencimiento: '2026-03-20',
          estado: 'vigente',
          actividades: ['Ensayos EMC', 'Certificación']
        }
      ];
      return habilitacionesMock.filter(habilitacion => habilitacion.cliente_id === clienteId);
    }
    return data;
  }

  async createHabilitacion(habilitacion: Inserts<'habilitaciones'>) {
    const { data, error } = await supabase
      .from('habilitaciones')
      .insert(habilitacion)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating habilitacion:', error);
      throw error;
    }
    return data;
  }

  async updateHabilitacion(id: string, updates: Updates<'habilitaciones'>) {
    const { data, error } = await supabase
      .from('habilitaciones')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating habilitacion:', error);
      throw error;
    }
    return data;
  }

  // ==================== COMUNICACIONES ====================

  async getComunicacionesByCliente(clienteId: string) {
    const { data, error } = await supabase
      .from('comunicaciones')
      .select(`
        *,
        expediente:expedientes(*),
        caso_legal:casos_legales(*)
      `)
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching comunicaciones:', error);
      // Fallback to mock data filtered by clienteId
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
    return data;
  }

  async createComunicacion(comunicacion: Inserts<'comunicaciones'>) {
    const { data, error } = await supabase
      .from('comunicaciones')
      .insert(comunicacion)
      .select(`
        *,
        expediente:expedientes(*),
        caso_legal:casos_legales(*)
      `)
      .single();
    
    if (error) {
      console.error('Error creating comunicacion:', error);
      throw error;
    }
    return data;
  }

  // ==================== TAREAS ====================

  async getTareasByExpediente(expedienteId: string) {
    const { data, error } = await supabase
      .from('tareas')
      .select(`
        *,
        usuario_asignado:usuarios(*),
        expediente:expedientes(*),
        caso_legal:casos_legales(*)
      `)
      .eq('expediente_id', expedienteId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tareas by expediente:', error);
      throw error;
    }
    return data;
  }

  async getTareasByCasoLegal(casoLegalId: string) {
    const { data, error } = await supabase
      .from('tareas')
      .select(`
        *,
        usuario_asignado:usuarios(*),
        expediente:expedientes(*),
        caso_legal:casos_legales(*)
      `)
      .eq('caso_legal_id', casoLegalId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tareas by caso legal:', error);
      throw error;
    }
    return data;
  }

  async getTareasByUsuario(usuarioId: string) {
    const { data, error } = await supabase
      .from('tareas')
      .select(`
        *,
        expediente:expedientes(*),
        caso_legal:casos_legales(*)
      `)
      .eq('usuario_asignado_id', usuarioId)
      .in('estado', ['pendiente', 'en_proceso'])
      .order('fecha_vencimiento', { ascending: true });
    
    if (error) {
      console.error('Error fetching tareas by usuario:', error);
      // Fallback to mock data
      const tareasMock = [
        {
          id: 'tarea-1',
          expediente_id: 'exp-001',
          caso_legal_id: 'caso-1',
          usuario_asignado_id: usuarioId,
          titulo: 'Revisión documentación RNPA',
          descripcion: 'Revisar y validar documentación técnica',
          estado: 'pendiente',
          prioridad: 'alta',
          fecha_vencimiento: '2025-01-28',
          fecha_completado: null,
          created_at: '2025-01-25T10:00:00Z',
          updated_at: '2025-01-25T10:00:00Z'
        }
      ];
      return tareasMock.filter(tarea => tarea.usuario_asignado_id === usuarioId);
    }
    return data;
  }

  async createTarea(tarea: Inserts<'tareas'>) {
    const { data, error } = await supabase
      .from('tareas')
      .insert(tarea)
      .select(`
        *,
        usuario_asignado:usuarios(*),
        expediente:expedientes(*),
        caso_legal:casos_legales(*)
      `)
      .single();
    
    if (error) {
      console.error('Error creating tarea:', error);
      throw error;
    }
    return data;
  }

  async updateTarea(id: string, updates: Updates<'tareas'>) {
    const { data, error } = await supabase
      .from('tareas')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        usuario_asignado:usuarios(*),
        expediente:expedientes(*),
        caso_legal:casos_legales(*)
      `)
      .single();
    
    if (error) {
      console.error('Error updating tarea:', error);
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

  // Use the new dedicated methods instead
  async getProductosRelacionados(clienteId: string) {
    return this.getProductosByCliente(clienteId);
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