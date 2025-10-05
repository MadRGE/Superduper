import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, CreditCard as Edit, Trash2, Search, Filter, Calendar, X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { Proveedor, CatalogoServicioProveedor, ListaPrecio } from '@/types/database';

export const ListasDePrecios: React.FC = () => {
  const { toast } = useToast();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [servicios, setServicios] = useState<CatalogoServicioProveedor[]>([]);
  const [precios, setPrecios] = useState<ListaPrecio[]>([]);
  const [selectedProveedor, setSelectedProveedor] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPrecio, setEditingPrecio] = useState<ListaPrecio | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    proveedor_id: '',
    servicio_id: '',
    precio_unitario: 0,
    moneda: 'ARS',
    vigencia_desde: new Date().toISOString().split('T')[0],
    vigencia_hasta: '',
    tiempo_pago_dias: 30,
    incluye_iva: false,
    condiciones_comerciales: '',
    observaciones: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [provRes, preciosRes] = await Promise.all([
        supabase.from('proveedores').select('*').eq('is_active', true).order('razon_social'),
        supabase.from('lista_precios').select(`
          *,
          proveedor:proveedores(*),
          servicio:catalogo_servicios_proveedor(*)
        `).eq('is_active', true)
      ]);

      if (provRes.error) throw provRes.error;
      if (preciosRes.error) throw preciosRes.error;

      setProveedores(provRes.data || []);
      setPrecios(preciosRes.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadServiciosProveedor = async (proveedorId: string) => {
    try {
      const { data, error } = await supabase
        .from('catalogo_servicios_proveedor')
        .select('*')
        .eq('proveedor_id', proveedorId)
        .eq('is_active', true)
        .order('nombre');

      if (error) throw error;
      setServicios(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleProveedorChange = (proveedorId: string) => {
    setFormData({ ...formData, proveedor_id: proveedorId, servicio_id: '' });
    if (proveedorId) {
      loadServiciosProveedor(proveedorId);
    } else {
      setServicios([]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.proveedor_id || !formData.servicio_id || formData.precio_unitario <= 0) {
      toast({
        title: 'Error',
        description: 'Complete todos los campos obligatorios',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingPrecio) {
        const { error } = await supabase
          .from('lista_precios')
          .update({
            precio_unitario: formData.precio_unitario,
            moneda: formData.moneda,
            vigencia_desde: formData.vigencia_desde || null,
            vigencia_hasta: formData.vigencia_hasta || null,
            tiempo_pago_dias: formData.tiempo_pago_dias,
            incluye_iva: formData.incluye_iva,
            condiciones_comerciales: formData.condiciones_comerciales || null,
            observaciones: formData.observaciones || null
          })
          .eq('id', editingPrecio.id);

        if (error) throw error;

        toast({
          title: 'Precio actualizado',
          description: 'El precio se actualizó correctamente'
        });
      } else {
        const { error } = await supabase
          .from('lista_precios')
          .insert([{
            proveedor_id: formData.proveedor_id,
            servicio_id: formData.servicio_id,
            precio_unitario: formData.precio_unitario,
            moneda: formData.moneda,
            vigencia_desde: formData.vigencia_desde || null,
            vigencia_hasta: formData.vigencia_hasta || null,
            tiempo_pago_dias: formData.tiempo_pago_dias,
            incluye_iva: formData.incluye_iva,
            condiciones_comerciales: formData.condiciones_comerciales || null,
            observaciones: formData.observaciones || null
          }]);

        if (error) throw error;

        toast({
          title: 'Precio agregado',
          description: 'El precio se agregó correctamente'
        });
      }

      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (precio: ListaPrecio) => {
    setEditingPrecio(precio);
    setFormData({
      proveedor_id: precio.proveedor_id,
      servicio_id: precio.servicio_id,
      precio_unitario: precio.precio_unitario,
      moneda: precio.moneda,
      vigencia_desde: precio.vigencia_desde ? new Date(precio.vigencia_desde).toISOString().split('T')[0] : '',
      vigencia_hasta: precio.vigencia_hasta ? new Date(precio.vigencia_hasta).toISOString().split('T')[0] : '',
      tiempo_pago_dias: precio.tiempo_pago_dias,
      incluye_iva: precio.incluye_iva,
      condiciones_comerciales: precio.condiciones_comerciales || '',
      observaciones: precio.observaciones || ''
    });
    loadServiciosProveedor(precio.proveedor_id);
    setShowModal(true);
  };

  const handleDelete = async (precioId: string) => {
    if (!confirm('¿Está seguro de eliminar este precio?')) return;

    try {
      const { error } = await supabase
        .from('lista_precios')
        .update({ is_active: false })
        .eq('id', precioId);

      if (error) throw error;

      toast({
        title: 'Precio eliminado',
        description: 'El precio se eliminó correctamente'
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      proveedor_id: '',
      servicio_id: '',
      precio_unitario: 0,
      moneda: 'ARS',
      vigencia_desde: new Date().toISOString().split('T')[0],
      vigencia_hasta: '',
      tiempo_pago_dias: 30,
      incluye_iva: false,
      condiciones_comerciales: '',
      observaciones: ''
    });
    setEditingPrecio(null);
    setServicios([]);
  };

  const filteredPrecios = precios.filter(precio => {
    const matchesProveedor = !selectedProveedor || precio.proveedor_id === selectedProveedor;
    const matchesSearch = !searchTerm ||
      precio.servicio?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      precio.proveedor?.razon_social.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProveedor && matchesSearch;
  });

  const isVigente = (precio: ListaPrecio) => {
    const hoy = new Date();
    const desde = precio.vigencia_desde ? new Date(precio.vigencia_desde) : null;
    const hasta = precio.vigencia_hasta ? new Date(precio.vigencia_hasta) : null;

    if (!desde) return true;
    if (hoy < desde) return false;
    if (hasta && hoy > hasta) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Listas de Precios</h1>
          <p className="text-gray-600">Gestión de precios de servicios de proveedores</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Precio
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Precios</p>
                <p className="text-2xl font-bold">{precios.length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Proveedores</p>
                <p className="text-2xl font-bold">{proveedores.length}</p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vigentes</p>
                <p className="text-2xl font-bold">
                  {precios.filter(isVigente).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vencidos</p>
                <p className="text-2xl font-bold">
                  {precios.filter(p => !isVigente(p)).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Precios Activos</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={selectedProveedor}
                onChange={(e) => setSelectedProveedor(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Todos los proveedores</option>
                {proveedores.map(prov => (
                  <option key={prov.id} value={prov.id}>
                    {prov.razon_social}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500 py-8">Cargando...</p>
          ) : filteredPrecios.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay precios registrados</p>
          ) : (
            <div className="space-y-2">
              {filteredPrecios.map((precio) => (
                <div key={precio.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-300">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium">{precio.servicio?.nombre}</h3>
                      {isVigente(precio) ? (
                        <Badge variant="default" className="bg-green-500">Vigente</Badge>
                      ) : (
                        <Badge variant="secondary">Vencido</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Proveedor: {precio.proveedor?.razon_social}
                    </p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>Código: {precio.servicio?.codigo}</span>
                      <span>Unidad: {precio.servicio?.unidad}</span>
                      {precio.vigencia_desde && (
                        <span>Desde: {new Date(precio.vigencia_desde).toLocaleDateString('es-AR')}</span>
                      )}
                      {precio.vigencia_hasta && (
                        <span>Hasta: {new Date(precio.vigencia_hasta).toLocaleDateString('es-AR')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        ${precio.precio_unitario.toLocaleString('es-AR')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {precio.incluye_iva ? 'IVA incluido' : 'Más IVA'}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(precio)}
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(precio.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {editingPrecio ? 'Editar Precio' : 'Nuevo Precio'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => {
                setShowModal(false);
                resetForm();
              }}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Proveedor *
                  </label>
                  <select
                    value={formData.proveedor_id}
                    onChange={(e) => handleProveedorChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    disabled={!!editingPrecio}
                  >
                    <option value="">Seleccionar...</option>
                    {proveedores.map(prov => (
                      <option key={prov.id} value={prov.id}>
                        {prov.razon_social}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Servicio *
                  </label>
                  <select
                    value={formData.servicio_id}
                    onChange={(e) => setFormData({...formData, servicio_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    disabled={!formData.proveedor_id || !!editingPrecio}
                  >
                    <option value="">Seleccionar...</option>
                    {servicios.map(serv => (
                      <option key={serv.id} value={serv.id}>
                        {serv.codigo} - {serv.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Precio Unitario *
                  </label>
                  <input
                    type="number"
                    value={formData.precio_unitario}
                    onChange={(e) => setFormData({...formData, precio_unitario: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Moneda
                  </label>
                  <select
                    value={formData.moneda}
                    onChange={(e) => setFormData({...formData, moneda: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="ARS">ARS</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Vigencia Desde
                  </label>
                  <input
                    type="date"
                    value={formData.vigencia_desde}
                    onChange={(e) => setFormData({...formData, vigencia_desde: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Vigencia Hasta
                  </label>
                  <input
                    type="date"
                    value={formData.vigencia_hasta}
                    onChange={(e) => setFormData({...formData, vigencia_hasta: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Plazo de Pago (días)
                  </label>
                  <input
                    type="number"
                    value={formData.tiempo_pago_dias}
                    onChange={(e) => setFormData({...formData, tiempo_pago_dias: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="incluye_iva"
                    checked={formData.incluye_iva}
                    onChange={(e) => setFormData({...formData, incluye_iva: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label htmlFor="incluye_iva" className="text-sm font-medium text-gray-900">
                    Precio incluye IVA
                  </label>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Condiciones Comerciales
                  </label>
                  <input
                    type="text"
                    value={formData.condiciones_comerciales}
                    onChange={(e) => setFormData({...formData, condiciones_comerciales: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Ej: Descuento 10% por volumen mayor a 10 unidades"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingPrecio ? 'Actualizar' : 'Guardar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
