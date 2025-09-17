import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Expediente, TramiteTipo, Organismo, Cliente } from '../types/database';
import { useAuth } from '../hooks/use-auth';

interface SGTState {
  expedientes: Expediente[];
  tramiteTipos: TramiteTipo[];
  organismos: Organismo[];
  clientes: Cliente[];
  selectedExpediente: Expediente | null;
  loading: boolean;
  filters: {
    estado: string;
    organismo: string;
    prioridad: string;
    search: string;
  };
  notifications: any[];
}

type SGTAction = 
  | { type: 'SET_EXPEDIENTES'; payload: Expediente[] }
  | { type: 'SET_TRAMITE_TIPOS'; payload: TramiteTipo[] }
  | { type: 'SET_ORGANISMOS'; payload: Organismo[] }
  | { type: 'SET_CLIENTES'; payload: Cliente[] }
  | { type: 'SET_SELECTED_EXPEDIENTE'; payload: Expediente | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_FILTERS'; payload: Partial<SGTState['filters']> }
  | { type: 'ADD_NOTIFICATION'; payload: any }
  | { type: 'REMOVE_NOTIFICATION'; payload: string };

const initialState: SGTState = {
  expedientes: [],
  tramiteTipos: [],
  organismos: [],
  clientes: [],
  selectedExpediente: null,
  loading: false,
  filters: {
    estado: '',
    organismo: '',
    prioridad: '',
    search: ''
  },
  notifications: []
};

const sgtReducer = (state: SGTState, action: SGTAction): SGTState => {
  switch (action.type) {
    case 'SET_EXPEDIENTES':
      return { ...state, expedientes: action.payload };
    case 'SET_TRAMITE_TIPOS':
      return { ...state, tramiteTipos: action.payload };
    case 'SET_ORGANISMOS':
      return { ...state, organismos: action.payload };
    case 'SET_CLIENTES':
      return { ...state, clientes: action.payload };
    case 'SET_SELECTED_EXPEDIENTE':
      return { ...state, selectedExpediente: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'UPDATE_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'REMOVE_NOTIFICATION':
      return { 
        ...state, 
        notifications: state.notifications.filter(n => n.id !== action.payload) 
      };
    default:
      return state;
  }
};

const SGTContext = createContext<{
  state: SGTState;
  dispatch: React.Dispatch<SGTAction>;
  fetchExpedientes: () => Promise<void>;
  fetchTramiteTipos: () => Promise<void>;
  fetchOrganismos: () => Promise<void>;
  fetchClientes: () => Promise<void>;
} | null>(null);

export const SGTProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(sgtReducer, initialState);
  const { usuario } = useAuth();

  const fetchExpedientes = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      let query = supabase
        .from('expedientes')
        .select(`
          *,
          tramite_tipo:tramite_tipos(*,
            organismo:organismos(*)
          ),
          cliente:clientes(*),
          despachante:despachantes(*)
        `)
        .eq('is_active', true);

      // Apply role-based filtering
      if (usuario?.rol === 'cliente') {
        query = query.eq('cliente_id', usuario.entidad_id);
      } else if (usuario?.rol === 'despachante') {
        query = query.eq('despachante_id', usuario.entidad_id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      dispatch({ type: 'SET_EXPEDIENTES', payload: data || [] });
    } catch (error) {
      console.error('Error fetching expedientes:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchTramiteTipos = async () => {
    try {
      const { data, error } = await supabase
        .from('tramite_tipos')
        .select('*, organismo:organismos(*)')
        .eq('is_active', true);
      
      if (error) throw error;
      dispatch({ type: 'SET_TRAMITE_TIPOS', payload: data || [] });
    } catch (error) {
      console.error('Error fetching tramite tipos:', error);
    }
  };

  const fetchOrganismos = async () => {
    try {
      const { data, error } = await supabase
        .from('organismos')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      dispatch({ type: 'SET_ORGANISMOS', payload: data || [] });
    } catch (error) {
      console.error('Error fetching organismos:', error);
    }
  };

  const fetchClientes = async () => {
    try {
      let query = supabase
        .from('clientes')
        .select('*')
        .eq('is_active', true);

      // Apply role-based filtering for despachantes
      if (usuario?.rol === 'despachante') {
        // Assuming there's a relationship between despachantes and clientes
        // This would need to be implemented based on your business logic
      }

      const { data, error } = await query;
      
      if (error) throw error;
      dispatch({ type: 'SET_CLIENTES', payload: data || [] });
    } catch (error) {
      console.error('Error fetching clientes:', error);
    }
  };

  return (
    <SGTContext.Provider value={{ 
      state, 
      dispatch, 
      fetchExpedientes,
      fetchTramiteTipos,
      fetchOrganismos,
      fetchClientes
    }}>
      {children}
    </SGTContext.Provider>
  );
};

export const useSGT = () => {
  const context = useContext(SGTContext);
  if (!context) {
    throw new Error('useSGT must be used within a SGTProvider');
  }
  return context;
};