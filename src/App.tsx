import React from 'react';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/use-auth.tsx';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Expedientes } from './pages/Expedientes/Expedientes';
import { ExpedienteDetail } from './pages/Expedientes/ExpedienteDetail';
import { NuevoExpediente } from './pages/Expedientes/NuevoExpediente';
import { Catalogo } from './pages/Catalogo/Catalogo';
import { Clientes } from './pages/Clientes/Clientes';
import { ClienteDetailEnhanced } from './pages/Clientes/ClienteDetailEnhanced';
import { Reportes } from './pages/Reportes/Reportes';
import { Notificaciones } from './pages/Notificaciones/Notificaciones';
import { Login } from './pages/Login/Login';
import { LoginCliente } from './pages/PortalCliente/LoginCliente';
import { ClienteLayout } from './pages/PortalCliente/ClienteLayout';
import { DashboardClienteContent } from './pages/PortalCliente/DashboardClienteContent';
import { ExpedientesClienteContent } from './pages/PortalCliente/ExpedientesClienteContent';
import { DocumentosClienteContent } from './pages/PortalCliente/DocumentosClienteContent';
import { FaunaCITES } from './pages/Fauna/FaunaCITES';
import { RENPREManager } from './pages/RENPRE/RENPREManager';
import { ANMaCManager } from './pages/ANMaC/ANMaCManager';
import { GestionTramites } from './pages/Configuracion/GestionTramites';
import { Presupuestos } from './pages/Comercial/Presupuestos';
import { Facturacion } from './pages/Comercial/Facturacion';
import { Proveedores } from './pages/Comercial/Proveedores';
import { GestionIntegral } from './pages/Admin/GestionIntegral';
import { PortalDespachante } from './pages/Despachantes/PortalDespachante';
import { ClienteExpedientesDashboard } from './pages/Clientes/ClienteDashboardExcel';
import { CasosLegalesList } from './pages/CasosLegales/CasosLegalesList';
import { CasoLegalDetail } from './pages/CasosLegales/CasoLegalDetail';
import ModuloFinancieroContable from './pages/Finanzas/ModuloFinancieroContable';
import { SGTProvider } from './context/SGTContext';
import { startAutomations } from './services/AutomationService';
import { Toaster } from '@/components/ui/toaster';

const AppContent: React.FC = () => {
  const { usuario, loading } = useAuth();

  // Iniciar automatizaciones cuando el usuario esté logueado
  useEffect(() => {
    if (usuario) {
      startAutomations();
    }
    return () => {}; // Las automatizaciones se mantienen corriendo
  }, [usuario]);

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

  return (
    <Router>
      <Routes>
        {/* Portal Cliente Routes - Sin Layout principal */}
        <Route path="/portal-cliente/login" element={<LoginCliente />} />
        <Route path="/portal-cliente/*" element={<ClienteLayout />}>
          <Route path="dashboard" element={<DashboardClienteContent />} />
          <Route path="expedientes" element={<ExpedientesClienteContent />} />
          <Route path="documentos" element={<DocumentosClienteContent />} />
        </Route>

        {/* Main Application Routes - Con Layout */}
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/expedientes" element={<Layout><Expedientes /></Layout>} />
        <Route path="/expedientes/nuevo" element={<Layout><NuevoExpediente /></Layout>} />
        <Route path="/expedientes/:id" element={<Layout><ExpedienteDetail /></Layout>} />
        <Route path="/catalogo" element={<Layout><Catalogo /></Layout>} />
        <Route path="/clientes" element={<Layout><Clientes /></Layout>} />
        <Route path="/clientes/:id" element={<Layout><ClienteDetailEnhanced /></Layout>} />
        <Route path="/clientes/:id/dashboard" element={<Layout><ClienteExpedientesDashboard /></Layout>} />
        <Route path="/casos-legales" element={<Layout><CasosLegalesList /></Layout>} />
        <Route path="/casos-legales/:id" element={<Layout><CasoLegalDetail /></Layout>} />
        <Route path="/reportes" element={<Layout><Reportes /></Layout>} />
        <Route path="/notificaciones" element={<Layout><Notificaciones /></Layout>} />
        <Route path="/fauna-cites" element={<Layout><FaunaCITES /></Layout>} />
        <Route path="/renpre" element={<Layout><RENPREManager /></Layout>} />
        <Route path="/anmac" element={<Layout><ANMaCManager /></Layout>} />
        <Route path="/configuracion/tramites" element={<Layout><GestionTramites /></Layout>} />
        <Route path="/presupuestos" element={<Layout><Presupuestos /></Layout>} />
        <Route path="/facturacion" element={<Layout><Facturacion /></Layout>} />
        <Route path="/proveedores" element={<Layout><Proveedores /></Layout>} />
        <Route path="/admin/gestion-integral" element={<Layout><GestionIntegral /></Layout>} />
        <Route path="/despachantes/portal" element={<Layout><PortalDespachante /></Layout>} />
        <Route path="/finanzas" element={<Layout><ModuloFinancieroContable /></Layout>} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SGTProvider>
          <AppContent />
          <Toaster />
        </SGTProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;