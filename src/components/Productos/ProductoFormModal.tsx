import React, { useState, useEffect } from 'react';
import { X, Save, Package, Calendar, Tag, FileText, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { databaseService } from '@/services/DatabaseService';
import type { Producto } from '@/lib/supabase';

interface ProductoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  producto?: Producto | null;
  clienteId: string;
  onSuccess: () => void;
}

export const ProductoFormModal: React.FC<ProductoFormModalProps> = ({
  isOpen,
  onClose,
  producto,
  clienteId,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    marca: '',
    rnpa: '',
    categoria: '',
    estado: 'vigente',
    vencimiento: '',
    peso_neto: '',
    vida_util: '',
    codigo_ean: '',
    metadata: {
      descripcion: '',
      ingredientes: '',
      presentacion: '',
      notas: ''
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categorias = [
    'Productos Lácteos',
    'Productos de Panadería',
    'Aceites y Grasas',
    'Conservas Dulces',
    'Bebidas',
    'Suplementos Dietarios',
    'Productos Cárnicos',
    'Productos Pesqueros',
    'Condimentos y Especias',
    'Productos Orgánicos',
    'Alimentos para Animales',
    'Equipos de Telecomunicaciones',
    'Productos Eléctricos',
    'Dispositivos Médicos',
    'Cosméticos',
    'Productos Químicos',
    'Otros'
  ];

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre || '',
        marca: producto.marca || '',
        rnpa: producto.rnpa || '',
        categoria: producto.categoria || '',
        estado: producto.estado || 'vigente',
        vencimiento: producto.vencimiento ? new Date(producto.vencimiento).toISOString().split('T')[0] : '',
        peso_neto: producto.peso_neto || '',
        vida_util: producto.vida_util || '',
        codigo_ean: producto.codigo_ean || '',
        metadata: {
          descripcion: producto.metadata?.descripcion || '',
          ingredientes: producto.metadata?.ingredientes || '',
          presentacion: producto.metadata?.presentacion || '',
          notas: producto.metadata?.notas || ''
        }
      });
    } else {
      setFormData({
        nombre: '',
        marca: '',
        rnpa: '',
        categoria: '',
        estado: 'vigente',
        vencimiento: '',
        peso_neto: '',
        vida_util: '',
        codigo_ean: '',
        metadata: {
          descripcion: '',
          ingredientes: '',
          presentacion: '',
          notas: ''
        }
      });
    }
    setErrors({});
  }, [producto, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del producto es obligatorio';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'La categoría es obligatoria';
    }

    if (formData.codigo_ean && !/^\d{13}$/.test(formData.codigo_ean.replace(/\D/g, ''))) {
      newErrors.codigo_ean = 'El código EAN debe tener 13 dígitos';
    }

    if (formData.vencimiento) {
      const vencimiento = new Date(formData.vencimiento);
      const hoy = new Date();
      if (vencimiento <= hoy) {
        newErrors.vencimiento = 'La fecha de vencimiento debe ser futura';
      }
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
      const productoData = {
        cliente_id: clienteId,
        nombre: formData.nombre,
        marca: formData.marca || null,
        rnpa: formData.rnpa || null,
        categoria: formData.categoria || null,
        estado: formData.estado || 'vigente',
        vencimiento: formData.vencimiento || null,
        peso_neto: formData.peso_neto || null,
        vida_util: formData.vida_util || null,
        codigo_ean: formData.codigo_ean || null,
        metadata: formData.metadata,
        is_active: true
      };

      if (producto) {
        // Actualizar producto existente
        await databaseService.updateProducto(producto.id, {
          ...productoData,
          updated_at: new Date().toISOString()
        });
        
        toast({
          title: "Producto actualizado",
          description: `${formData.nombre} se actualizó correctamente`,
        });
      } else {
        // Crear nuevo producto
        await databaseService.createProducto({
          ...productoData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        toast({
          title: "Producto creado",
          description: `${formData.nombre} se creó exitosamente`,
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving producto:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el producto",
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
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span>{producto ? 'Editar Producto' : 'Nuevo Producto'}</span>
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
                <Package className="w-5 h-5 mr-2 text-gray-600" />
                Información Básica del Producto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Producto *
                  </label>
                  <Input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className={errors.nombre ? 'border-red-300' : ''}
                    placeholder="Ej: Yogur Natural 200g"
                  />
                  {errors.nombre && (
                    <p className="text-sm text-red-600 mt-1">{errors.nombre}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca
                  </label>
                  <Input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => setFormData({...formData, marca: e.target.value})}
                    placeholder="Ej: DelSur"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.categoria ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar categoría...</option>
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.categoria && (
                    <p className="text-sm text-red-600 mt-1">{errors.categoria}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="vigente">Vigente</option>
                    <option value="por_renovar">Por Renovar</option>
                    <option value="vencido">Vencido</option>
                    <option value="suspendido">Suspendido</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Información Regulatoria */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                Información Regulatoria
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RNPA / Número de Registro
                  </label>
                  <Input
                    type="text"
                    value={formData.rnpa}
                    onChange={(e) => setFormData({...formData, rnpa: e.target.value})}
                    placeholder="Ej: RNPA 04-123456"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Vencimiento
                  </label>
                  <Input
                    type="date"
                    value={formData.vencimiento}
                    onChange={(e) => setFormData({...formData, vencimiento: e.target.value})}
                    className={errors.vencimiento ? 'border-red-300' : ''}
                  />
                  {errors.vencimiento && (
                    <p className="text-sm text-red-600 mt-1">{errors.vencimiento}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Características del Producto */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-gray-600" />
                Características del Producto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso Neto
                  </label>
                  <Input
                    type="text"
                    value={formData.peso_neto}
                    onChange={(e) => setFormData({...formData, peso_neto: e.target.value})}
                    placeholder="Ej: 200g, 1kg, 500ml"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vida Útil
                  </label>
                  <Input
                    type="text"
                    value={formData.vida_util}
                    onChange={(e) => setFormData({...formData, vida_util: e.target.value})}
                    placeholder="Ej: 6 meses, 2 años"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código EAN
                  </label>
                  <Input
                    type="text"
                    value={formData.codigo_ean}
                    onChange={(e) => setFormData({...formData, codigo_ean: e.target.value})}
                    className={errors.codigo_ean ? 'border-red-300' : ''}
                    placeholder="7791234567890"
                  />
                  {errors.codigo_ean && (
                    <p className="text-sm text-red-600 mt-1">{errors.codigo_ean}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                Información Adicional
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <Textarea
                    value={formData.metadata.descripcion}
                    onChange={(e) => setFormData({
                      ...formData, 
                      metadata: { ...formData.metadata, descripcion: e.target.value }
                    })}
                    rows={2}
                    placeholder="Descripción detallada del producto"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ingredientes Principales
                    </label>
                    <Textarea
                      value={formData.metadata.ingredientes}
                      onChange={(e) => setFormData({
                        ...formData, 
                        metadata: { ...formData.metadata, ingredientes: e.target.value }
                      })}
                      rows={2}
                      placeholder="Lista de ingredientes principales"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Presentación
                    </label>
                    <Textarea
                      value={formData.metadata.presentacion}
                      onChange={(e) => setFormData({
                        ...formData, 
                        metadata: { ...formData.metadata, presentacion: e.target.value }
                      })}
                      rows={2}
                      placeholder="Tipo de envase y presentación"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas Internas
                  </label>
                  <Textarea
                    value={formData.metadata.notas}
                    onChange={(e) => setFormData({
                      ...formData, 
                      metadata: { ...formData.metadata, notas: e.target.value }
                    })}
                    rows={2}
                    placeholder="Notas internas (no visibles para el cliente)"
                  />
                </div>
              </div>
            </div>

            {/* Alerta de vencimiento próximo */}
            {formData.vencimiento && (
              (() => {
                const diasHastaVencimiento = Math.ceil(
                  (new Date(formData.vencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                
                if (diasHastaVencimiento <= 90 && diasHastaVencimiento > 0) {
                  return (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-900">
                            Vencimiento Próximo
                          </p>
                          <p className="text-sm text-yellow-700">
                            Este producto vence en {diasHastaVencimiento} días. Considere iniciar el proceso de renovación.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()
            )}

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
                    {producto ? 'Actualizar' : 'Crear Producto'}
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