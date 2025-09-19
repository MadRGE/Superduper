import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Building2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { databaseService } from '@/services/DatabaseService';

export const LoginCliente: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({
    cuit: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Buscar cliente por CUIT
      const cliente = await databaseService.searchClienteByCuit(credentials.cuit);
      
      if (!cliente) {
        toast({
          title: "Cliente no encontrado",
          description: "Verifique su CUIT o contacte al administrador",
          variant: "destructive"
        });
        return;
      }

      // Por ahora usamos una validación simple
      // En producción, esto debería usar Supabase Auth
      const mockPasswords: Record<string, string> = {
        '30-12345678-9': 'lacteos123',
        '30-98765432-1': 'techcorp123',
        '30-11223344-5': 'beauty123',
        '30-55667788-9': 'nutri123',
        '30-99887766-3': 'petcare123'
      };

      if (mockPasswords[credentials.cuit] === credentials.password) {
        // Guardar sesión del cliente
        localStorage.setItem('cliente_session', JSON.stringify({
          ...cliente,
          login_time: new Date().toISOString()
        }));
        
        toast({
          title: "Acceso autorizado",
          description: `Bienvenido ${cliente.razon_social}`,
        });
        
        navigate('/portal-cliente/dashboard');
      } else {
        toast({
          title: "Credenciales inválidas",
          description: "CUIT o contraseña incorrectos",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error en login:', error);
      toast({
        title: "Error de conexión",
        description: "No se pudo verificar las credenciales",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Portal Cliente
          </CardTitle>
          <CardDescription>
            Acceda a sus expedientes y documentación
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="cuit" className="block text-sm font-medium text-gray-700 mb-1">
                CUIT
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="cuit"
                  type="text"
                  value={credentials.cuit}
                  onChange={(e) => setCredentials({...credentials, cuit: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="XX-XXXXXXXX-X"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Verificando...' : 'Ingresar al Portal'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">Credenciales de prueba:</p>
              <div className="space-y-1 text-xs">
                <p><strong>Lácteos del Sur:</strong> 30-12345678-9 / lacteos123</p>
                <p><strong>TechCorp:</strong> 30-98765432-1 / techcorp123</p>
                <p><strong>BeautyTech:</strong> 30-11223344-5 / beauty123</p>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button 
              onClick={() => navigate('/')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Volver al sistema principal
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};