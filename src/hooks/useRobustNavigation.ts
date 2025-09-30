import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export const useRobustNavigation = () => {
  const navigate = useNavigate();

  const navigateWithFallback = useCallback((to: string, options?: { replace?: boolean; fallback?: string }) => {
    const { replace = false, fallback = '/' } = options || {};

    console.log(`useRobustNavigation: Intentando navegar a ${to}`);

    try {
      // Intentar navegación normal
      navigate(to, { replace });

      // Verificar si la navegación fue exitosa después de un breve delay
      setTimeout(() => {
        if (window.location.pathname === to) {
          console.log('useRobustNavigation: Navegación exitosa');
        } else {
          console.log('useRobustNavigation: Navegación falló, intentando fallback...');
          // Si no funcionó, intentar con replace
          navigate(to, { replace: true });

          // Si aún no funciona, usar window.location como último recurso
          setTimeout(() => {
            if (window.location.pathname !== to) {
              console.log('useRobustNavigation: Usando window.location como último recurso');
              window.location.href = to;
            }
          }, 500);
        }
      }, 100);
    } catch (error) {
      console.error('useRobustNavigation: Error en navegación', error);
      // Fallback directo
      try {
        window.location.href = fallback;
      } catch (fallbackError) {
        console.error('useRobustNavigation: Error en fallback', fallbackError);
      }
    }
  }, [navigate]);

  const goBack = useCallback((fallbackUrl: string = '/') => {
    console.log('useRobustNavigation: Intentando ir hacia atrás');

    try {
      if (window.history.length > 1) {
        window.history.back();

        // Verificar que el back funcionó
        setTimeout(() => {
          // Si después de ir atrás seguimos en la misma página, usar fallback
          const currentPath = window.location.pathname;
          console.log('useRobustNavigation: Ruta actual después del back:', currentPath);

          // Si no cambió la ruta, usar el fallback
          if (currentPath === window.location.pathname) {
            console.log('useRobustNavigation: Back no funcionó, usando fallback');
            navigateWithFallback(fallbackUrl);
          }
        }, 100);
      } else {
        console.log('useRobustNavigation: No hay historial, usando fallback');
        navigateWithFallback(fallbackUrl);
      }
    } catch (error) {
      console.error('useRobustNavigation: Error en goBack', error);
      navigateWithFallback(fallbackUrl);
    }
  }, [navigateWithFallback]);

  return {
    navigate: navigateWithFallback,
    goBack
  };
};