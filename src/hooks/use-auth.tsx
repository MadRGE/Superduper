import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { getRoleById } from '@/types/roles'

interface AuthContextType {
  user: User | null
  usuario: any
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [usuario, setUsuario] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock user para desarrollo
    setUsuario({
      id: '1',
      nombre: 'Admin',
      apellido: 'SGT',
      rol: 'gestor',
      email: 'admin@sgt.gov.ar'
    })
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    // Mock login para desarrollo
    const mockUsers = [
      { 
        email: 'admin@sgt.gov.ar', 
        password: 'admin123', 
        nombre: 'Admin', 
        apellido: 'SGT', 
        rol: 'admin',
        clientes_asignados: [],
        permisos_especiales: []
      },
      { 
        email: 'gestor@sgt.gov.ar', 
        password: 'gestor123', 
        nombre: 'Gestor', 
        apellido: 'Principal', 
        rol: 'gestor',
        clientes_asignados: [],
        permisos_especiales: []
      },
      { 
        email: 'despachante@sgt.gov.ar', 
        password: 'despachante123', 
        nombre: 'Juan', 
        apellido: 'Pérez', 
        rol: 'despachante',
        clientes_asignados: ['cliente-1', 'cliente-2'],
        permisos_especiales: []
      },
      { 
        email: 'cliente@empresa.com', 
        password: 'cliente123', 
        nombre: 'Cliente', 
        apellido: 'Empresa', 
        rol: 'cliente',
        cliente_id: 'cliente-1',
        clientes_asignados: [],
        permisos_especiales: []
      }
    ]

    const mockUser = mockUsers.find(u => u.email === email && u.password === password)
    
    if (mockUser) {
      // Guardar información completa del usuario en localStorage
      localStorage.setItem('user_session', JSON.stringify({
        id: mockUser.email.split('@')[0],
        email: mockUser.email,
        nombre: mockUser.nombre,
        apellido: mockUser.apellido,
        rol: mockUser.rol,
        clientes_asignados: mockUser.clientes_asignados,
        cliente_id: mockUser.cliente_id,
        permisos_especiales: mockUser.permisos_especiales,
        login_time: new Date().toISOString()
      }));
      
      setUsuario({
        id: mockUser.email.split('@')[0],
        nombre: mockUser.nombre,
        apellido: mockUser.apellido,
        rol: mockUser.rol,
        email: mockUser.email,
        clientes_asignados: mockUser.clientes_asignados,
        cliente_id: mockUser.cliente_id
      })
      return { error: null }
    }
    return { error: { message: 'Credenciales inválidas' } }
  }

  const signOut = async () => {
    localStorage.removeItem('user_session')
    setUser(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ user, usuario, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}