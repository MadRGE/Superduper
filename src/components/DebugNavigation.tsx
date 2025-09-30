import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const DebugNavigation: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    console.log('🔥 DebugNavigation: Cambio de ubicación detectado:', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      state: location.state,
      timestamp: new Date().toISOString()
    });

    // También mostrar en el DOM para debugging visual
    const debugElement = document.getElementById('debug-navigation');
    if (debugElement) {
      debugElement.textContent = `Ruta actual: ${location.pathname}`;
    }
  }, [location]);

  // Solo mostrar en modo desarrollo
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div
      id="debug-navigation"
      className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-50"
      style={{ fontSize: '10px' }}
    >
      Ruta: {location.pathname}
    </div>
  );
};