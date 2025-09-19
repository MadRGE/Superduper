import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Building2, LogOut, Home, FileText, Upload, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const ClienteLayout: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const clienteSession = localStorage.getItem('cliente_session');
  const cliente = clienteSession ? JSON.parse(clienteSession) : null;

  const handleLogout = () => {
    localStorage.removeItem('cliente_session');
    navigate('/portal-cliente/login');
    toast({
      title: "Sesión cerrada",
      description: "Ha cerrado sesión exitosamente",
    });
  };

  if (!cliente) {
    navigate('/portal-cliente/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Portal Cliente</h1>
                <p className="text-sm text-gray-600">{cliente.razon_social}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">CUIT: {cliente.cuit}</p>
                <p className="text-xs text-gray-500">
                  Último acceso: {new Date().toLocaleString('es-AR')}
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => navigate('/portal-cliente/dashboard')}
              className="flex items-center space-x-2 py-4 border-b-2 border-blue-500 text-blue-600"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => navigate('/portal-cliente/expedientes')}
              className="flex items-center space-x-2 py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700"
            >
              <FileText className="w-4 h-4" />
              <span>Mis Expedientes</span>
            </button>
            <button
              onClick={() => navigate('/portal-cliente/documentos')}
              className="flex items-center space-x-2 py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700"
            >
              <Upload className="w-4 h-4" />
              <span>Documentos</span>
            </button>
            <button
              onClick={() => navigate('/portal-cliente/notificaciones')}
              className="flex items-center space-x-2 py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700"
            >
              <Bell className="w-4 h-4" />
              <span>Notificaciones</span>
            </button>
            <button
              onClick={() => navigate('/portal-cliente/perfil')}
              className="flex items-center space-x-2 py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700"
            >
              <User className="w-4 h-4" />
              <span>Mi Perfil</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};