import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { mockExpedientes, mockOrganismos, mockTramiteTipos } from '../data/mockData';
import { expedienteService } from '../services/ExpedienteService';
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
  | { type: 'ADD_EXPEDIENTE'; payload: Expediente }
  | { type: 'SET_TRAMITE_TIPOS'; payload: TramiteTipo[] }
  | { type: 'SET_ORGANISMOS'; payload: Organismo[] }
  | { type: 'SET_CLIENTES'; payload: Cliente[] }
  | { type: 'ADD_CLIENTE'; payload: Cliente }
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
    case 'ADD_EXPEDIENTE':
      return { ...state, expedientes: [...state.expedientes, action.payload] };
    case 'SET_TRAMITE_TIPOS':
      return { ...state, tramiteTipos: action.payload };
    case 'SET_ORGANISMOS':
      return { ...state, organismos: action.payload };
    case 'SET_CLIENTES':
      return { ...state, clientes: action.payload };
    case 'ADD_CLIENTE':
      return { ...state, clientes: [...state.clientes, action.payload] };
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
  addExpediente: (expediente: Expediente) => void;
  addCliente: (cliente: Cliente) => void;
  fetchExpedientes: () => Promise<void>;
  fetchTramiteTipos: () => Promise<void>;
  fetchOrganismos: () => Promise<void>;
  fetchClientes: () => Promise<void>;
} | null>(null);

export const SGTProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(sgtReducer, initialState);
  const { usuario } = useAuth();

  const addExpediente = (expediente: Expediente) => {
    dispatch({ type: 'ADD_EXPEDIENTE', payload: expediente });
  };

  const addCliente = (cliente: Cliente) => {
    dispatch({ type: 'ADD_CLIENTE', payload: cliente });
    fetchClientes();
  };

  const fetchExpedientes = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Intentar cargar desde localStorage primero
      const expedientesGuardados = expedienteService.obtenerExpedientes();
      
      if (expedientesGuardados.length > 0) {
        dispatch({ type: 'SET_EXPEDIENTES', payload: expedientesGuardados });
      } else {
        // Si no hay datos guardados, usar mock data
        dispatch({ type: 'SET_EXPEDIENTES', payload: mockExpedientes });
        // Guardar mock data en localStorage para futuras sesiones
        expedienteService.guardarExpedientes(mockExpedientes);
      }
    } catch (error) {
      console.error('Error fetching expedientes:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchTramiteTipos = async () => {
    try {
      // Usar mock data por ahora
      dispatch({ type: 'SET_TRAMITE_TIPOS', payload: mockTramiteTipos });
    } catch (error) {
      console.error('Error fetching tramite tipos:', error);
    }
  };

  const fetchOrganismos = async () => {
    try {
      // Usar mock data por ahora
      dispatch({ type: 'SET_ORGANISMOS', payload: mockOrganismos });
    } catch (error) {
      console.error('Error fetching organismos:', error);
    }
  };

  const fetchClientes = async () => {
    try {
      // Intentar cargar desde localStorage primero
      const clientesGuardados = localStorage.getItem('sgt_clientes');
      
      if (clientesGuardados) {
        dispatch({ type: 'SET_CLIENTES', payload: JSON.parse(clientesGuardados) });
      } else {
        // Si no hay datos guardados, usar mock data
        const mockClientes = [
          {
            id: 'cliente-1',
            razon_social: 'Lácteos del Sur S.A.',
            cuit: '30-12345678-9',
            email: 'contacto@lacteosdelsur.com.ar',
            telefono: '+54 11 4567-8900',
            contacto_nombre: 'María González',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: 'cliente-2',
            razon_social: 'TechCorp Argentina',
            cuit: '30-98765432-1',
            email: 'info@techcorp.com.ar',
            telefono: '+54 11 9876-5432',
            contacto_nombre: 'Carlos Rodríguez',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: 'cliente-3',
            razon_social: 'BeautyTech Imports',
            cuit: '30-11223344-5',
            email: 'ventas@beautytech.com.ar',
            telefono: '+54 11 2233-4455',
            contacto_nombre: 'Laura Martínez',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: 'cliente-4',
            razon_social: 'NutriLife S.A.',
            cuit: '30-55667788-9',
            email: 'contacto@nutrilife.com.ar',
            telefono: '+54 11 5566-7788',
            contacto_nombre: 'Roberto Silva',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: 'cliente-5',
            razon_social: 'PetCare Argentina',
            cuit: '30-99887766-3',
            email: 'info@petcare.com.ar',
            telefono: '+54 11 9988-7766',
            contacto_nombre: 'Ana Fernández',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          }
        ];
        
        dispatch({ type: 'SET_CLIENTES', payload: mockClientes });
        // Guardar mock data en localStorage
        localStorage.setItem('sgt_clientes', JSON.stringify(mockClientes));
      }
    } catch (error) {
      console.error('Error fetching clientes:', error);
    }
  };

  // Función para guardar clientes en localStorage
  const guardarClientes = (clientes: Cliente[]) => {
    try {
      localStorage.setItem('sgt_clientes', JSON.stringify(clientes));
    } catch (error) {
      console.error('Error al guardar clientes:', error);
    }
  };

  // Sobrescribir addCliente para persistir en localStorage
  const addClienteWithPersistence = (cliente: Cliente) => {
    dispatch({ type: 'ADD_CLIENTE', payload: cliente });
    
    // Guardar en localStorage
    const clientesActualizados = [...state.clientes, cliente];
    guardarClientes(clientesActualizados);
  };

  // Función para inicializar datos
  const initializeData = async () => {
    await fetchOrganismos();
    await fetchTramiteTipos();
    await fetchClientes();
    await fetchExpedientes();
  };

  // Inicializar datos al montar el componente
  React.useEffect(() => {
    initializeData();
  }, []);

  return (
    <SGTContext.Provider value={{ 
      state, 
      dispatch, 
      addExpediente,
      addCliente: addClienteWithPersistence,
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