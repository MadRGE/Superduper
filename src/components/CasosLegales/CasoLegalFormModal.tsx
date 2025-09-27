import React, { useState, useEffect } from 'react';
import { X, Save, Briefcase, User, Calendar, FileText, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { databaseService } from '@/services/DatabaseService';
import { useSGT } from '@/context/SGTContext';
import type { CasoLegal } from '@/lib/supabase';

interface CasoLegalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  casoLegal?: CasoLegal | null;
  clienteId?: string;
  onSuccess: () => void;
}

export const CasoLegalFormModal: React.FC<CasoLegalFormModalProps> = ({
  isOpen,
  onClose,
  casoLegal,
  clienteId,
  onSuccess
}) => {
  const { toast } = useToast();
  const { state } = useSGT();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cliente_id: clienteId || '',
    nombre_caso: '',
    descripcion: '',
    estado_legal: 'abierto',
    fecha_apertura: new Date().toISOString().split('T')[0],
    fecha_cierre: '',
    abogado_responsable_id: '',
    metadata: {
      categoria: '',
      prioridad: 'normal',
      notas_internas: ''
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (casoLegal) {
      setFormData({
        cliente_id: casoLegal.cliente_id || '',
        nombre_caso: casoLegal.nombre_caso || '',
        descripcion: casoLegal.descripcion || '',
        estado_legal: casoLegal.estado_legal || 'abierto',
        fecha_apertura: casoLegal.fecha_apertura ? new Date(casoLegal.fecha_apertura).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        fecha_cierre: casoLegal.fecha_cierre ? new Date(casoLegal.fecha_cierre).toISOString().split('T')[0] : '',
        abogado_responsable_id: casoLegal.abogado_responsable_id || '',
        metadata: {
          categoria: casoLegal.metadata?.categoria || '',
          prioridad: casoLegal.metadata?.prioridad || 'normal',
          notas_internas: casoLegal.metadata?.notas_internas || ''
        }
      });
    } else {
      setFormData({
        cliente_id: clienteId || '',
        nombre_caso: '',
        descripcion: '',
        estado_legal: 'abierto',
        fecha_apertura: new Date().toISOString().split('T')[0],
        fecha_cierre: '',
        abogado_responsable_id: '',
        metadata: {
          categoria: '',
          prioridad: 'normal',
          notas_internas: ''
        }
      });
    }
    setErrors({});
  }, [casoLegal, clienteId, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cliente_id) {
      newErrors.cliente_id = 'Debe seleccionar un cliente';
    }

    if (!formData.nombre_caso.trim()) {
      newErrors.nombre_caso = 'El nombre del caso es obligatorio';
    }

    if (!formData.fecha_apertura) {
      newErrors.fecha_apertura = 'La fecha de apertura es obligatoria';
    }

    if (formData.estado_legal === 'cerrado' && !formData.fecha_cierre) {
      newErrors.fecha_cierre = 'La fecha de cierre es obligatoria para casos cerrados';
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
      const casoData = {
        cliente_id: formData.cliente_id,
        nombre_caso: formData.nombre_caso,
        descripcion: formData.descripcion || null,
        estado_legal: formData.estado_legal,
        fecha_apertura: formData.fecha_apertura,
        fecha_cierre: formData.fecha_cierre || null,
        abogado_responsable_id: formData.abogado_responsable_id || null,
        metadata: formData.metadata,
        is_active: true
      };

      if (casoLegal) {
        // Actualizar caso existente
        await databaseService.updateCasoLegal(casoLegal.id, casoData);
        
        toast({
          title: "Caso legal actualizado",
          description: `${formData.nombre_caso} se actualizó correctamente`,
        });
      } else {
        // Crear nuevo caso
        await databaseService.createCasoLegal(casoData);
        
        toast({
          title: "Caso legal creado",
          description: `${formData.nombre_caso} se creó exitosamente`,
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving caso legal:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el caso legal",
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
              <Briefcase className="w-5 h-5 text-blue-600" />
              <span>{casoLegal ? 'Editar Caso Legal' : 'Nuevo Caso Legal'}</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClose} disabled={loading}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-gray-600" />
                Información del Caso
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente *
                  </label>
                  <select
                    value={formData.cliente_id}
                    onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.cliente_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={!!clienteId} // Deshabilitar si viene preseleccionado
                  >
                    <option value="">Seleccionar cliente...</option>
                    {state.clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.razon_social} - {cliente.cuit}
                      </option>
                    ))}
                  </select>
                  {errors.cliente_id && (
                    <p className="text-sm text-red-600 mt-1">{errors.cliente_id}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Caso *
                  </label>
                  <Input
                    type="text"
                    value={formData.nombre_caso}
                    onChange={(e) => setFormData({...formData, nombre_caso: e.target.value})}
                    className={errors.nombre_caso ? 'border-red-300' : ''}
                    placeholder="Ej: Registro RNPA Productos Lácteos"
                  />
                  {errors.nombre_caso && (
                    <p className="text-sm text-red-600 mt-1">{errors.nombre_caso}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <Textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    rows={3}
                    placeholder="Descripción detallada del caso legal..."
                  />
                </div>
              </div>
            </div>

            {/* Estado y Fechas */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                Estado y Fechas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado Legal *
                  </label>
                  <select
                    value={formData.estado_legal}
                    onChange={(e) => setFormData({...formData, estado_legal: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="abierto">Abierto</option>
                    <option value="en_litigio">En Litigio</option>
                    <option value="cerrado">Cerrado</option>
                    <option value="archivado">Archivado</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Apertura *
                  </label>
                  <Input
                    type="date"
                    value={formData.fecha_apertura}
                    onChange={(e) => setFormData({...formData, fecha_apertura: e.target.value})}
                    className={errors.fecha_apertura ? 'border-red-300' : ''}
                  />
                  {errors.fecha_apertura && (
                    <p className="text-sm text-red-600 mt-1">{errors.fecha_apertura}</p>
                  )}
                </div>
                
                {formData.estado_legal === 'cerrado' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Cierre *
                    </label>
                    <Input
                      type="date"
                      value={formData.fecha_cierre}
                      onChange={(e) => setFormData({...formData, fecha_cierre: e.target.value})}
                      className={errors.fecha_cierre ? 'border-red-300' : ''}
                    />
                    {errors.fecha_cierre && (
                      <p className="text-sm text-red-600 mt-1">{errors.fecha_cierre}</p>
                    )}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Abogado Responsable
                  </label>
                  <select
                    value={formData.abogado_responsable_id}
                    onChange={(e) => setFormData({...formData, abogado_responsable_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sin asignar</option>
                    <option value="abogado-1">Dr. Juan Pérez</option>
                    <option value="abogado-2">Dra. María González</option>
                    <option value="abogado-3">Dr. Carlos Rodríguez</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Metadata Adicional */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                Información Adicional
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.metadata.categoria}
                    onChange={(e) => setFormData({
                      ...formData, 
                      metadata: { ...formData.metadata, categoria: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="regulatorio">Regulatorio</option>
                    <option value="comercial">Comercial</option>
                    <option value="laboral">Laboral</option>
                    <option value="tributario">Tributario</option>
                    <option value="penal">Penal</option>
                    <option value="civil">Civil</option>
                    <option value="administrativo">Administrativo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={formData.metadata.prioridad}
                    onChange={(e) => setFormData({
                      ...formData, 
                      metadata: { ...formData.metadata, prioridad: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="baja">Baja</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas Internas
                  </label>
                  <Textarea
                    value={formData.metadata.notas_internas}
                    onChange={(e) => setFormData({
                      ...formData, 
                      metadata: { ...formData.metadata, notas_internas: e.target.value }
                    })}
                    rows={3}
                    placeholder="Notas internas del caso (no visibles para el cliente)"
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
                    {casoLegal ? 'Actualizar Caso' : 'Crear Caso Legal'}
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