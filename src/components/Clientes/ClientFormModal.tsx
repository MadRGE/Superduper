import React, { useState, useEffect } from 'react';
import { X, Save, Building2, User, Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { databaseService } from '@/services/DatabaseService';
import type { Cliente } from '@/lib/supabase';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente?: Cliente | null;
  onSuccess: () => void;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  cliente,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    razon_social: '',
    cuit: '',
    email: '',
    telefono: '',
    direccion: '',
    contacto_nombre: '',
    contacto_email: '',
    contacto_telefono: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (cliente) {
      setFormData({
        razon_social: cliente.razon_social || '',
        cuit: cliente.cuit || '',
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || '',
        contacto_nombre: cliente.contacto_nombre || '',
        contacto_email: cliente.contacto_email || '',
        contacto_telefono: cliente.contacto_telefono || ''
      });
    } else {
      setFormData({
        razon_social: '',
        cuit: '',
        email: '',
        telefono: '',
        direccion: '',
        contacto_nombre: '',
        contacto_email: '',
        contacto_telefono: ''
      });
    }
    setErrors({});
  }, [cliente, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.razon_social.trim()) {
      newErrors.razon_social = 'La razón social es obligatoria';
    }

    if (!formData.cuit.trim()) {
      newErrors.cuit = 'El CUIT es obligatorio';
    } else if (!/^\d{2}-\d{8}-\d{1}$/.test(formData.cuit)) {
      newErrors.cuit = 'Formato de CUIT inválido (XX-XXXXXXXX-X)';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (cliente) {
        // Actualizar cliente existente
        await databaseService.updateCliente(cliente.id, {
          ...formData,
          updated_at: new Date().toISOString()
        });
        
        toast({
          title: "Cliente actualizado",
          description: `${formData.razon_social} se actualizó correctamente`,
        });
      } else {
        // Crear nuevo cliente
        await databaseService.createCliente({
          ...formData,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        toast({
          title: "Cliente creado",
          description: `${formData.razon_social} se creó exitosamente`,
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving cliente:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el cliente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>{cliente ? 'Editar Cliente' : 'Nuevo Cliente'}</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClose} disabled={loading}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información de la Empresa */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-gray-600" />
                Información de la Empresa
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Razón Social *
                  </label>
                  <Input
                    type="text"
                    value={formData.razon_social}
                    onChange={(e) => setFormData({...formData, razon_social: e.target.value})}
                    className={errors.razon_social ? 'border-red-300' : ''}
                    placeholder="Ej: Empresa S.A."
                  />
                  {errors.razon_social && (
                    <p className="text-sm text-red-600 mt-1">{errors.razon_social}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CUIT *
                  </label>
                  <Input
                    type="text"
                    value={formData.cuit}
                    onChange={(e) => setFormData({...formData, cuit: e.target.value})}
                    className={errors.cuit ? 'border-red-300' : ''}
                    placeholder="XX-XXXXXXXX-X"
                  />
                  {errors.cuit && (
                    <p className="text-sm text-red-600 mt-1">{errors.cuit}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={errors.email ? 'border-red-300' : ''}
                    placeholder="contacto@empresa.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <Input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    placeholder="+54 11 XXXX-XXXX"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <Textarea
                    value={formData.direccion}
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                    rows={2}
                    placeholder="Dirección completa de la empresa"
                  />
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                Contacto Principal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Contacto
                  </label>
                  <Input
                    type="text"
                    value={formData.contacto_nombre}
                    onChange={(e) => setFormData({...formData, contacto_nombre: e.target.value})}
                    placeholder="Nombre y apellido"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email del Contacto
                  </label>
                  <Input
                    type="email"
                    value={formData.contacto_email}
                    onChange={(e) => setFormData({...formData, contacto_email: e.target.value})}
                    placeholder="contacto@empresa.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono del Contacto
                  </label>
                  <Input
                    type="tel"
                    value={formData.contacto_telefono}
                    onChange={(e) => setFormData({...formData, contacto_telefono: e.target.value})}
                    placeholder="+54 11 XXXX-XXXX"
                  />
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {cliente ? 'Actualizar' : 'Crear Cliente'}
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