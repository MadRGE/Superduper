import React from 'react';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/use-auth.tsx';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Expedientes } from './pages/Expedientes/Expedientes';
import { ExpedienteDetail } from './pages/Expedientes/ExpedienteDetail';
import { NuevoExpediente } from './pages/Expedientes/NuevoExpediente';
import { NuevoExpediente } from './pages/Expedientes/NuevoExpediente';
import { Catalogo } from './pages/Catalogo/Catalogo';
import { Clientes } from './pages/Clientes/Clientes';
import { Reportes } from './pages/Reportes/Reportes';
import { Notificaciones } from './pages/Notificaciones/Notificaciones';
import { Login } from './pages/Login/Login';
import { SGTProvider } from './context/SGTContext';
import { startAutomations } from './services/AutomationService';
import { Toaster } from '@/components/ui/toaster';

const AppContent: React.FC = () => {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return <Login />;
  }

  // Iniciar automatizaciones cuando el usuario esté logueado
  useEffect(() => {
    startAutomations();
    return () => {}; // Las automatizaciones se mantienen corriendo
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/expedientes" element={<Expedientes />} />
          <Route path="/expedientes/nuevo" element={<NuevoExpediente />} />
          <Route path="/expedientes/nuevo" element={<NuevoExpediente />} />
          <Route path="/expedientes/:id" element={<ExpedienteDetail />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/notificaciones" element={<Notificaciones />} />
        </Routes>
      </Layout>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <SGTProvider>
        <AppContent />
        <Toaster />
      </SGTProvider>
    </AuthProvider>
  );
}

export default App;