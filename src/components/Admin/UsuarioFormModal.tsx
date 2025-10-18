import React, { useState, useEffect } from 'react';
import { X, Save, Mail, User, Shield, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { DatabaseService } from '@/services/DatabaseService';
import { Usuario, Cliente } from '@/types/database';
import { ROLES } from '@/types/roles';

const databaseService = new DatabaseService();

interface UsuarioFormModalProps {
  usuario: Usuario | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const UsuarioFormModal: React.FC<UsuarioFormModalProps> = ({
  usuario,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    rol: 'gestor',
    estado: 'activo',
    clientes_asignados: [] as string[],
    permisos_especiales: [] as string[],
    requiere_cambio_password: false
  });
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadClientes();
    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        apellido: usuario.apellido || '',
        email: usuario.email,
        rol: usuario.rol,
        estado: usuario.estado || 'activo',
        clientes_asignados: usuario.clientes_asignados || [],
        permisos_especiales: usuario.permisos_especiales || [],
        requiere_cambio_password: usuario.requiere_cambio_password || false
      });
    }
  }, [usuario]);

  const loadClientes = async () => {
    try {
      const data = await databaseService.getClientes();
      setClientes(data);
    } catch (error) {
      console.error('Error loading clientes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (usuario) {
        await databaseService.updateUsuario(usuario.id, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          rol: formData.rol,
          estado: formData.estado,
          clientes_asignados: formData.clientes_asignados,
          permisos_especiales: formData.permisos_especiales,
          requiere_cambio_password: formData.requiere_cambio_password
        });
        toast({
          title: 'Usuario actualizado',
          description: `${formData.nombre} ${formData.apellido} ha sido actualizado exitosamente`
        });
      } else {
        await databaseService.createUsuario({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          rol: formData.rol,
          estado: formData.estado,
          clientes_asignados: formData.clientes_asignados,
          permisos_especiales: formData.permisos_especiales,
          requiere_cambio_password: true,
          is_active: true
        });
        toast({
          title: 'Usuario creado',
          description: `${formData.nombre} ${formData.apellido} ha sido creado exitosamente`
        });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar el usuario',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClienteToggle = (clienteId: string) => {
    setFormData(prev => ({
      ...prev,
      clientes_asignados: prev.clientes_asignados.includes(clienteId)
        ? prev.clientes_asignados.filter(id => id !== clienteId)
        : [...prev.clientes_asignados, clienteId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{usuario ? 'Editar Usuario' : 'Nuevo Usuario'}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!!usuario}
                  required
                />
              </div>
              {usuario && (
                <p className="text-xs text-gray-500 mt-1">
                  El email no puede modificarse una vez creado el usuario
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="admin">Administrador</option>
                    <option value="gestor">Gestor</option>
                    <option value="despachante">Despachante</option>
                    <option value="cliente">Cliente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>
            </div>

            {(formData.rol === 'despachante' || formData.rol === 'gestor') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clientes Asignados
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                  {clientes.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay clientes disponibles</p>
                  ) : (
                    <div className="space-y-2">
                      {clientes.map(cliente => (
                        <label key={cliente.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.clientes_asignados.includes(cliente.id)}
                            onChange={() => handleClienteToggle(cliente.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{cliente.razon_social}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requiere_cambio_password"
                checked={formData.requiere_cambio_password}
                onChange={(e) => setFormData({ ...formData, requiere_cambio_password: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="requiere_cambio_password" className="text-sm text-gray-700">
                Requerir cambio de contraseña en próximo acceso
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {usuario ? 'Actualizar' : 'Crear'} Usuario
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
