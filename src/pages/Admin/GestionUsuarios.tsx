import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  UserCheck,
  UserX,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';
import { DatabaseService } from '@/services/DatabaseService';
import { Usuario } from '@/types/database';
import { ROLES } from '@/types/roles';
import { UsuarioFormModal } from '@/components/Admin/UsuarioFormModal';

const databaseService = new DatabaseService();

export const GestionUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const data = await databaseService.getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error('Error loading usuarios:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (usuario: Usuario) => {
    if (!confirm(`¿Está seguro que desea desactivar a ${usuario.nombre} ${usuario.apellido}?`)) {
      return;
    }

    try {
      await databaseService.deactivateUsuario(usuario.id);
      toast({
        title: 'Usuario desactivado',
        description: `${usuario.nombre} ${usuario.apellido} ha sido desactivado exitosamente`
      });
      loadUsuarios();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo desactivar el usuario',
        variant: 'destructive'
      });
    }
  };

  const handleReactivate = async (usuario: Usuario) => {
    try {
      await databaseService.reactivateUsuario(usuario.id);
      toast({
        title: 'Usuario reactivado',
        description: `${usuario.nombre} ${usuario.apellido} ha sido reactivado exitosamente`
      });
      loadUsuarios();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo reactivar el usuario',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedUsuario(null);
    setShowModal(true);
  };

  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch =
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRol = !filterRol || usuario.rol === filterRol;
    const matchesEstado = !filterEstado || usuario.estado === filterEstado;

    return matchesSearch && matchesRol && matchesEstado;
  });

  const getRolBadgeColor = (rol: string) => {
    switch (rol) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'gestor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'despachante': return 'bg-green-100 text-green-800 border-green-200';
      case 'cliente': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoBadge = (estado: string, isActive: boolean) => {
    if (!isActive || estado === 'inactivo') {
      return <Badge variant="destructive" className="text-xs"><UserX className="w-3 h-3 mr-1" /> Inactivo</Badge>;
    }
    if (estado === 'suspendido') {
      return <Badge variant="secondary" className="text-xs"><AlertCircle className="w-3 h-3 mr-1" /> Suspendido</Badge>;
    }
    return <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200"><UserCheck className="w-3 h-3 mr-1" /> Activo</Badge>;
  };

  if (!hasPermission('*')) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
        <p className="text-gray-600">Solo los administradores pueden acceder a este módulo</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administración completa de usuarios del sistema</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterRol}
              onChange={(e) => setFilterRol(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="gestor">Gestor</option>
              <option value="despachante">Despachante</option>
              <option value="cliente">Cliente</option>
            </select>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 mb-4">
            Mostrando {filteredUsuarios.length} de {usuarios.length} usuarios
          </div>

          <div className="space-y-3">
            {filteredUsuarios.map((usuario) => (
              <div
                key={usuario.id}
                className="border rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {usuario.nombre.charAt(0)}{usuario.apellido?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">
                          {usuario.nombre} {usuario.apellido}
                        </h3>
                        <Badge className={getRolBadgeColor(usuario.rol)}>
                          {ROLES[usuario.rol.toUpperCase() as keyof typeof ROLES]?.nombre || usuario.rol}
                        </Badge>
                        {getEstadoBadge(usuario.estado || 'activo', usuario.is_active ?? true)}
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {usuario.email}
                        </span>
                        {usuario.ultimo_acceso && (
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Último acceso: {new Date(usuario.ultimo_acceso).toLocaleDateString('es-AR')}
                          </span>
                        )}
                      </div>
                      {usuario.clientes_asignados && usuario.clientes_asignados.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          {usuario.clientes_asignados.length} cliente(s) asignado(s)
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(usuario)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {usuario.is_active ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeactivate(usuario)}
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReactivate(usuario)}
                      >
                        <UserCheck className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredUsuarios.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No se encontraron usuarios con los filtros aplicados</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <UsuarioFormModal
          usuario={selectedUsuario}
          onClose={() => setShowModal(false)}
          onSuccess={loadUsuarios}
        />
      )}
    </div>
  );
};
