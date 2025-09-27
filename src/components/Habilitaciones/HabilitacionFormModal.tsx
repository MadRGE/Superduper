import React, { useState, useEffect } from 'react';
import { X, Save, Shield, Calendar, Building2, MapPin, FileText, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { databaseService } from '@/services/DatabaseService';
import type { Habilitacion } from '@/lib/supabase';

interface HabilitacionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  habilitacion?: Habilitacion | null;
  clienteId: string;
  onSuccess: () => void;
}

export const HabilitacionFormModal: React.FC<HabilitacionFormModalProps> = ({
  isOpen,
  onClose,
  habilitacion,
  clienteId,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: '',
    numero: '',
    establecimiento: '',
    direccion: '',
    vencimiento: '',
    estado: 'vigente',
    actividades: [] as string[],
    metadata: {
      observaciones: '',
      contacto_organismo: '',
      renovacion_automatica: false,
      notas_internas: ''
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nuevaActividad, setNuevaActividad] = useState('');

  const tiposHabilitacion = [
    'RNE - Registro Nacional de Establecimientos',
    'Habilitación Municipal',
    'Habilitación Provincial',
    'Certificación HACCP',
    'Certificación ISO',
    'Homologación ENACOM',
    'Certificación CE',
    'Habilitación ANMAT',
    'Registro SENASA',
    'Licencia ANMaC',
    'Certificación Orgánica',
    'Certificación Kosher',
    'Certificación Halal',
    'Otros'
  ];

  const actividadesPredefinidas = [
    'Elaboración',
    'Fraccionamiento',
    'Depósito',
    'Distribución',
    'Comercialización',
    'Importación',
    'Exportación',
    'Almacenamiento',
    'Control de Calidad',
    'Ensayos EMC',
    'Certificación',
    'Seguridad Eléctrica',
    'Sistema HACCP'
  ];

  useEffect(() => {
    if (habilitacion) {
      setFormData({
        tipo: habilitacion.tipo || '',
        numero: habilitacion.numero || '',
        establecimiento: habilitacion.establecimiento || '',
        direccion: habilitacion.direccion || '',
        vencimiento: habilitacion.vencimiento ? new Date(habilitacion.vencimiento).toISOString().split('T')[0] : '',
        estado: habilitacion.estado || 'vigente',
        actividades: habilitacion.actividades || [],
        metadata: {
          observaciones: habilitacion.metadata?.observaciones || '',
          contacto_organismo: habilitacion.metadata?.contacto_organismo || '',
          renovacion_automatica: habilitacion.metadata?.renovacion_automatica || false,
          notas_internas: habilitacion.metadata?.notas_internas || ''
        }
      });
    } else {
      setFormData({
        tipo: '',
        numero: '',
        establecimiento: '',
        direccion: '',
        vencimiento: '',
        estado: 'vigente',
        actividades: [],
        metadata: {
          observaciones: '',
          contacto_organismo: '',
          renovacion_automatica: false,
          notas_internas: ''
        }
      });
    }
    setErrors({});
  }, [habilitacion, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.tipo.trim()) {
      newErrors.tipo = 'El tipo de habilitación es obligatorio';
    }

    if (!formData.numero.trim()) {
      newErrors.numero = 'El número de habilitación es obligatorio';
    }

    if (!formData.vencimiento) {
      newErrors.vencimiento = 'La fecha de vencimiento es obligatoria';
    } else {
      const vencimiento = new Date(formData.vencimiento);
      const hoy = new Date();
      if (vencimiento <= hoy) {
        newErrors.vencimiento = 'La fecha de vencimiento debe ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const agregarActividad = () => {
    if (nuevaActividad.trim() && !formData.actividades.includes(nuevaActividad.trim())) {
      setFormData({
        ...formData,
        actividades: [...formData.actividades, nuevaActividad.trim()]
      });
      setNuevaActividad('');
    }
  };

  const quitarActividad = (actividad: string) => {
    setFormData({
      ...formData,
      actividades: formData.actividades.filter(a => a !== actividad)
    });
  };

  const agregarActividadPredefinida = (actividad: string) => {
    if (!formData.actividades.includes(actividad)) {
      setFormData({
        ...formData,
        actividades: [...formData.actividades, actividad]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const habilitacionData = {
        cliente_id: clienteId,
        tipo: formData.tipo,
        numero: formData.numero,
        establecimiento: formData.establecimiento || null,
        direccion: formData.direccion || null,
        vencimiento: formData.vencimiento,
        estado: formData.estado || 'vigente',
        actividades: formData.actividades.length > 0 ? formData.actividades : null,
        metadata: formData.metadata,
        is_active: true
      };

      if (habilitacion) {
        // Actualizar habilitación existente
        await databaseService.updateHabilitacion(habilitacion.id, {
          ...habilitacionData,
          updated_at: new Date().toISOString()
        });
        
        toast({
          title: "Habilitación actualizada",
          description: `${formData.tipo} se actualizó correctamente`,
        });
      } else {
        // Crear nueva habilitación
        await databaseService.createHabilitacion({
          ...habilitacionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        toast({
          title: "Habilitación creada",
          description: `${formData.tipo} se creó exitosamente`,
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving habilitacion:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la habilitación",
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

  // Calcular días hasta vencimiento
  const diasHastaVencimiento = formData.vencimiento 
    ? Math.ceil((new Date(formData.vencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>{habilitacion ? 'Editar Habilitación' : 'Nueva Habilitación'}</span>
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
                <Shield className="w-5 h-5 mr-2 text-gray-600" />
                Información de la Habilitación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Habilitación *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.tipo ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar tipo...</option>
                    {tiposHabilitacion.map((tipo) => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                  {errors.tipo && (
                    <p className="text-sm text-red-600 mt-1">{errors.tipo}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Habilitación *
                  </label>
                  <Input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => setFormData({...formData, numero: e.target.value})}
                    className={errors.numero ? 'border-red-300' : ''}
                    placeholder="Ej: 04-000123, HM-2024-0456"
                  />
                  {errors.numero && (
                    <p className="text-sm text-red-600 mt-1">{errors.numero}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Vencimiento *
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
                    <option value="en_tramite">En Trámite</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Información del Establecimiento */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-gray-600" />
                Información del Establecimiento
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Establecimiento
                  </label>
                  <Input
                    type="text"
                    value={formData.establecimiento}
                    onChange={(e) => setFormData({...formData, establecimiento: e.target.value})}
                    placeholder="Ej: Planta Elaboradora Sur"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección del Establecimiento
                  </label>
                  <Textarea
                    value={formData.direccion}
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                    rows={2}
                    placeholder="Dirección completa del establecimiento habilitado"
                  />
                </div>
              </div>
            </div>

            {/* Actividades Autorizadas */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                Actividades Autorizadas
              </h3>
              
              {/* Actividades seleccionadas */}
              {formData.actividades.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Actividades seleccionadas:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.actividades.map((actividad) => (
                      <div key={actividad} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        <span>{actividad}</span>
                        <button
                          type="button"
                          onClick={() => quitarActividad(actividad)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Agregar actividad personalizada */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agregar Actividad Personalizada
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    value={nuevaActividad}
                    onChange={(e) => setNuevaActividad(e.target.value)}
                    placeholder="Escriba una actividad..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarActividad())}
                  />
                  <Button type="button" onClick={agregarActividad} disabled={!nuevaActividad.trim()}>
                    Agregar
                  </Button>
                </div>
              </div>
              
              {/* Actividades predefinidas */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Actividades predefinidas:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {actividadesPredefinidas.map((actividad) => (
                    <button
                      key={actividad}
                      type="button"
                      onClick={() => agregarActividadPredefinida(actividad)}
                      disabled={formData.actividades.includes(actividad)}
                      className={`text-left px-3 py-2 text-sm border rounded-lg transition-colors ${
                        formData.actividades.includes(actividad)
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      {actividad}
                    </button>
                  ))}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contacto del Organismo
                    </label>
                    <Input
                      type="text"
                      value={formData.metadata.contacto_organismo}
                      onChange={(e) => setFormData({
                        ...formData, 
                        metadata: { ...formData.metadata, contacto_organismo: e.target.value }
                      })}
                      placeholder="Email o teléfono del organismo"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="renovacion_automatica"
                      checked={formData.metadata.renovacion_automatica}
                      onChange={(e) => setFormData({
                        ...formData, 
                        metadata: { ...formData.metadata, renovacion_automatica: e.target.checked }
                      })}
                    />
                    <label htmlFor="renovacion_automatica" className="text-sm text-gray-700">
                      Renovación automática
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones
                  </label>
                  <Textarea
                    value={formData.metadata.observaciones}
                    onChange={(e) => setFormData({
                      ...formData, 
                      metadata: { ...formData.metadata, observaciones: e.target.value }
                    })}
                    rows={2}
                    placeholder="Observaciones sobre la habilitación"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas Internas
                  </label>
                  <Textarea
                    value={formData.metadata.notas_internas}
                    onChange={(e) => setFormData({
                      ...formData, 
                      metadata: { ...formData.metadata, notas_internas: e.target.value }
                    })}
                    rows={2}
                    placeholder="Notas internas (no visibles para el cliente)"
                  />
                </div>
              </div>
            </div>

            {/* Alerta de vencimiento próximo */}
            {diasHastaVencimiento !== null && diasHastaVencimiento <= 90 && diasHastaVencimiento > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">
                      Vencimiento Próximo
                    </p>
                    <p className="text-sm text-yellow-700">
                      Esta habilitación vence en {diasHastaVencimiento} días. Considere iniciar el proceso de renovación.
                    </p>
                  </div>
                </div>
              </div>
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
                    {habilitacion ? 'Actualizar' : 'Crear Habilitación'}
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