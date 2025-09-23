import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  Home, 
  FileText, 
  BookOpen, 
  Users, 
  BarChart3, 
  Bell,
  Settings,
  Building2,
  Shield,
  Beaker,
  DollarSign,
  ChevronDown,
  UserCheck,
  Crown,
  Calculator,
  Receipt,
  Briefcase,
  ChevronRight
} from 'lucide-react';

interface NavigationSubItem {
  name: string;
  href: string;
  permission?: string;
  adminOnly?: boolean;
}

interface NavigationModule {
  name: string;
  icon: React.ComponentType<any>;
  items: NavigationSubItem[];
  permission?: string;
  adminOnly?: boolean;
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<any>;
  permission?: string;
  adminOnly?: boolean;
}

// Elementos de navegación de nivel superior (acceso frecuente)
const topLevelNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Notificaciones', href: '/notificaciones', icon: Bell },
];

// Módulos agrupados
const navigationModules: NavigationModule[] = [
  {
    name: 'Gestión de Trámites',
    icon: FileText,
    items: [
      { name: 'Expedientes', href: '/expedientes' },
      { name: 'Catálogo', href: '/catalogo' },
      { name: 'FAUNA/CITES', href: '/fauna-cites' },
      { name: 'RENPRE', href: '/renpre' },
      { name: 'ANMaC', href: '/anmac' },
    ]
  },
  {
    name: 'Gestión de Clientes',
    icon: Users,
    permission: 'ver_todos_clientes',
    items: [
      { name: 'Clientes', href: '/clientes', permission: 'ver_todos_clientes' },
    ]
  },
  {
    name: 'Finanzas y Contabilidad',
    icon: Calculator,
    permission: 'gestionar_facturacion',
    items: [
      { name: 'Control Financiero', href: '/finanzas', permission: 'gestionar_facturacion' },
      { name: 'Presupuestos', href: '/presupuestos', permission: 'gestionar_facturacion' },
      { name: 'Facturación', href: '/facturacion', permission: 'gestionar_facturacion' },
      { name: 'Proveedores', href: '/proveedores', permission: 'gestionar_facturacion' },
    ]
  },
  {
    name: 'Reportes y Análisis',
    icon: BarChart3,
    permission: 'ver_reportes',
    items: [
      { name: 'Reportes', href: '/reportes', permission: 'ver_reportes' },
    ]
  },
  {
    name: 'Portales de Usuario',
    icon: UserCheck,
    items: [
      { name: 'Portal Despachante', href: '/despachantes/portal', permission: 'ver_clientes_asignados' },
    ]
  },
  {
    name: 'Administración',
    icon: Crown,
    adminOnly: true,
    items: [
      { name: 'Gestión Integral', href: '/admin/gestion-integral', adminOnly: true },
      { name: 'Gestión Usuarios', href: '/admin/usuarios', adminOnly: true },
      { name: 'Configuración Trámites', href: '/configuracion/tramites', adminOnly: true },
    ]
  },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { hasPermission, userRole } = usePermissions();
  const [expandedModules, setExpandedModules] = React.useState<string[]>([]);

  const toggleModuleExpanded = (moduleName: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleName) 
        ? prev.filter(name => name !== moduleName)
        : [...prev, moduleName]
    );
  };

  const shouldShowModule = (module: NavigationModule): boolean => {
    // Si es solo para admin y el usuario no es admin
    if (module.adminOnly && !hasPermission('*')) {
      return false;
    }
    
    // Si tiene permiso específico requerido
    if (module.permission && !hasPermission(module.permission)) {
      return false;
    }
    
    // Verificar si al menos un item del módulo es visible
    return module.items.some(item => shouldShowItem(item));
  };

  const shouldShowItem = (item: NavigationSubItem): boolean => {
    // Si es solo para admin y el usuario no es admin
    if (item.adminOnly && !hasPermission('*')) {
      return false;
    }
    
    // Si tiene permiso específico requerido
    if (item.permission && !hasPermission(item.permission)) {
      return false;
    }
    
    return true;
  };

  const shouldShowTopLevelItem = (item: NavigationItem): boolean => {
    // Si es solo para admin y el usuario no es admin
    if (item.adminOnly && !hasPermission('*')) {
      return false;
    }
    
    // Si tiene permiso específico requerido
    if (item.permission && !hasPermission(item.permission)) {
      return false;
    }
    
    return true;
  };

  const isModuleActive = (module: NavigationModule): boolean => {
    return module.items.some(item => location.pathname === item.href);
  };

  const isItemActive = (href: string): boolean => {
    return location.pathname === href;
  };

  // Auto-expandir módulos que tienen items activos
  React.useEffect(() => {
    navigationModules.forEach(module => {
      if (isModuleActive(module) && !expandedModules.includes(module.name)) {
        setExpandedModules(prev => [...prev, module.name]);
      }
    });
  }, [location.pathname]);

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">SGT</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gestión de Trámites</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Elementos de nivel superior */}
        {topLevelNavigation.filter(shouldShowTopLevelItem).map((item) => {
          const isActive = isItemActive(item.href!);
          return (
            <Link
              key={item.name}
              to={item.href!}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className={`mr-3 w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
              {item.name}
            </Link>
          );
        })}

        {/* Separador */}
        <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>

        {/* Módulos agrupados */}
        {navigationModules.filter(shouldShowModule).map((module) => {
          const isExpanded = expandedModules.includes(module.name);
          const hasActiveItem = isModuleActive(module);
          const visibleItems = module.items.filter(shouldShowItem);
          
          return (
            <div key={module.name}>
              <button
                onClick={() => toggleModuleExpanded(module.name)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  hasActiveItem
                    ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <module.icon className={`mr-3 w-5 h-5 ${hasActiveItem ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                  <span>{module.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {visibleItems.length > 0 && (
                    <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full">
                      {visibleItems.length}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>
              
              {isExpanded && visibleItems.length > 0 && (
                <div className="ml-8 mt-1 space-y-1">
                  {visibleItems.map((item) => {
                    const isSubActive = isItemActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                          isSubActive
                            ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer con información del usuario */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <p>Rol: <span className="font-medium capitalize">{userRole}</span></p>
          <p className="mt-1">SGT v2.0</p>
        </div>
      </div>
    </div>
  );
};