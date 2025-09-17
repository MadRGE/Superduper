import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'

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
      { email: 'admin@sgt.gov.ar', password: 'admin123', nombre: 'Admin', apellido: 'SGT', rol: 'admin' },
      { email: 'gestor@sgt.gov.ar', password: 'gestor123', nombre: 'Gestor', apellido: 'Principal', rol: 'gestor' },
      { email: 'cliente@empresa.com', password: 'cliente123', nombre: 'Cliente', apellido: 'Empresa', rol: 'cliente' }
    ]

    const mockUser = mockUsers.find(u => u.email === email && u.password === password)
    
    if (mockUser) {
      setUsuario({
        id: '1',
        nombre: mockUser.nombre,
        apellido: mockUser.apellido,
        rol: mockUser.rol,
        email: mockUser.email
      })
      return { error: null }
    }
    return { error: { message: 'Credenciales inválidas' } }
  }

  const signOut = async () => {
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