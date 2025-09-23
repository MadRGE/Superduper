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
  Crown
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<any>;
  subItems?: { name: string; href: string }[];
  permission?: string;
  adminOnly?: boolean;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Expedientes', href: '/expedientes', icon: FileText },
  { name: 'Catálogo', href: '/catalogo', icon: BookOpen },
  { name: 'Clientes', href: '/clientes', icon: Users, permission: 'ver_todos_clientes' },
  { name: 'Reportes', href: '/reportes', icon: BarChart3, permission: 'ver_reportes' },
  { name: 'Notificaciones', href: '/notificaciones', icon: Bell },
  { name: 'FAUNA/CITES', href: '/fauna-cites', icon: Shield },
  { name: 'RENPRE', href: '/renpre', icon: Beaker },
  { name: 'ANMaC', href: '/anmac', icon: Shield },
  { 
    name: 'Finanzas', 
    href: '/finanzas', 
    icon: DollarSign,
    permission: 'gestionar_facturacion'
  },
  { 
    name: 'Administración', 
    icon: Crown,
    adminOnly: true,
    subItems: [
      { name: 'Gestión Integral', href: '/admin/gestion-integral' },
      { name: 'Gestión Usuarios', href: '/admin/usuarios' }
    ]
  },
  { 
    name: 'Portal Despachante', 
    href: '/despachantes/portal',
    icon: UserCheck,
    permission: 'ver_clientes_asignados'
  },
  { 
    name: 'Comercial', 
    icon: DollarSign,
    permission: 'gestionar_facturacion',
    subItems: [
      { name: 'Presupuestos', href: '/presupuestos' },
      { name: 'Facturación', href: '/facturacion' },
      { name: 'Proveedores', href: '/proveedores' }
    ]
  },
  { 
    name: 'Configuración', 
    icon: Settings,
    adminOnly: true,
    subItems: [
      { name: 'Gestión Trámites', href: '/configuracion/tramites' }
    ]
  },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { hasPermission, userRole } = usePermissions();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isSubItemActive = (subItems: { name: string; href: string }[]) => {
    return subItems.some(subItem => location.pathname === subItem.href);
  };

  const shouldShowItem = (item: NavigationItem): boolean => {
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

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SGT</h1>
            <p className="text-sm text-gray-500">Gestión de Trámites</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.filter(shouldShowItem).map((item) => {
          if (item.subItems) {
            const isExpanded = expandedItems.includes(item.name);
            const hasActiveSubItem = isSubItemActive(item.subItems);
            
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleExpanded(item.name)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    hasActiveSubItem
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className={`mr-3 w-5 h-5 ${hasActiveSubItem ? 'text-blue-600' : 'text-gray-400'}`} />
                    {item.name}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                {isExpanded && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.subItems.filter(subItem => {
                      // Filtrar sub-items según permisos si es necesario
                      return true; // Por ahora mostrar todos los sub-items
                    }).map((subItem) => {
                      const isSubActive = location.pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.href}
                          to={subItem.href}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                            isSubActive
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          } else {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href!}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className={`mr-3 w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          }
        })}
      </nav>

    </div>
  );
};