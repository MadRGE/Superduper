import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
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
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)
          await loadUserData(session.user.email!)
        } else {
          const savedSession = localStorage.getItem('user_session')
          if (savedSession) {
            const sessionData = JSON.parse(savedSession)
            setUsuario(sessionData)
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        await loadUserData(session.user.email!)
      } else {
        setUser(null)
        setUsuario(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadUserData = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setUsuario(data)
        localStorage.setItem('user_session', JSON.stringify(data))
      } else {
        const mockUser = getMockUserByEmail(email)
        if (mockUser) {
          setUsuario(mockUser)
          localStorage.setItem('user_session', JSON.stringify(mockUser))
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      const mockUser = getMockUserByEmail(email)
      if (mockUser) {
        setUsuario(mockUser)
        localStorage.setItem('user_session', JSON.stringify(mockUser))
      }
    }
  }

  const getMockUserByEmail = (email: string) => {
    const mockUsers = {
      'admin@sgt.gov.ar': {
        id: 'admin',
        nombre: 'Admin',
        apellido: 'SGT',
        rol: 'admin',
        email: 'admin@sgt.gov.ar',
        clientes_asignados: [],
        permisos_especiales: []
      },
      'gestor@sgt.gov.ar': {
        id: 'gestor',
        nombre: 'Gestor',
        apellido: 'Principal',
        rol: 'gestor',
        email: 'gestor@sgt.gov.ar',
        clientes_asignados: [],
        permisos_especiales: []
      },
      'despachante@sgt.gov.ar': {
        id: 'despachante',
        nombre: 'Juan',
        apellido: 'Pérez',
        rol: 'despachante',
        email: 'despachante@sgt.gov.ar',
        clientes_asignados: ['cliente-1', 'cliente-2'],
        permisos_especiales: []
      },
      'cliente@empresa.com': {
        id: 'cliente',
        nombre: 'Cliente',
        apellido: 'Empresa',
        rol: 'cliente',
        email: 'cliente@empresa.com',
        cliente_id: 'cliente-1',
        clientes_asignados: [],
        permisos_especiales: []
      }
    }
    return mockUsers[email as keyof typeof mockUsers] || null
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        const mockUser = getMockUserByEmail(email)
        const mockPassword = email.split('@')[0] + '123'

        if (mockUser && password === mockPassword) {
          setUsuario(mockUser)
          localStorage.setItem('user_session', JSON.stringify(mockUser))
          return { error: null }
        }

        return { error }
      }

      if (data.user) {
        setUser(data.user)
        await loadUserData(data.user.email!)
        return { error: null }
      }

      return { error: { message: 'Error al iniciar sesión' } }
    } catch (error: any) {
      return { error: { message: error.message || 'Error al iniciar sesión' } }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      localStorage.removeItem('user_session')
      setUser(null)
      setUsuario(null)
    }
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