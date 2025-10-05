import React, { useState, useEffect } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { catalogoTramitesArgentina } from '@/data/catalogoTramitesCompleto';
import { supabase } from '@/lib/supabase';
import type { ListaPrecio } from '@/types/database';

interface ServiceSelectorModalProps {
  onClose: () => void;
  onSelectTramite: (tramite: any) => void;
  onSelectProveedorServicio: (precio: ListaPrecio) => void;
}

export const ServiceSelectorModal: React.FC<ServiceSelectorModalProps> = ({
  onClose,
  onSelectTramite,
  onSelectProveedorServicio
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrganismo, setSelectedOrganismo] = useState('');
  const [preciosProveedores, setPreciosProveedores] = useState<ListaPrecio[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [loading, setLoading] = useState(false);

  // Preparar todos los trámites del catálogo
  const allTramites = Object.values(catalogoTramitesArgentina).flatMap(org =>
    org.tramites.map(t => ({
      ...t,
      organismo: org.organismo,
      sigla: org.sigla,
      precio_estimado: 0
    }))
  );

  const organismos = [...new Set(allTramites.map(t => t.sigla))];

  useEffect(() => {
    loadPreciosProveedores();
  }, []);

  const loadPreciosProveedores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lista_precios')
        .select(`
          *,
          proveedor:proveedores(*),
          servicio:catalogo_servicios_proveedor(*)
        `)
        .eq('is_active', true);

      if (error) throw error;

      // Filtrar solo precios vigentes
      const hoy = new Date();
      const vigentes = (data || []).filter(precio => {
        const desde = precio.vigencia_desde ? new Date(precio.vigencia_desde) : null;
        const hasta = precio.vigencia_hasta ? new Date(precio.vigencia_hasta) : null;

        if (!desde) return true;
        if (hoy < desde) return false;
        if (hasta && hoy > hasta) return false;
        return true;
      });

      setPreciosProveedores(vigentes);
    } catch (error) {
      console.error('Error loading precios:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTramites = allTramites.filter(tramite => {
    const matchesSearch = !searchTerm ||
      tramite.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tramite.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrganismo = !selectedOrganismo || tramite.sigla === selectedOrganismo;
    return matchesSearch && matchesOrganismo;
  });

  const categorias = [...new Set(preciosProveedores.map(p => p.servicio?.categoria).filter(Boolean))];

  const filteredPrecios = preciosProveedores.filter(precio => {
    const matchesSearch = !searchTerm ||
      precio.servicio?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      precio.proveedor?.razon_social.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !selectedCategoria || precio.servicio?.categoria === selectedCategoria;
    return matchesSearch && matchesCategoria;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle>Agregar Servicios al Presupuesto</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <Tabs defaultValue="tramites" className="h-full flex flex-col">
            <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
              <TabsTrigger value="tramites">Trámites SGT ({allTramites.length})</TabsTrigger>
              <TabsTrigger value="proveedores">Servicios de Proveedores ({preciosProveedores.length})</TabsTrigger>
            </TabsList>

            {/* Tab: Trámites */}
            <TabsContent value="tramites" className="flex-1 overflow-hidden flex flex-col m-0 p-4">
              <div className="space-y-4 mb-4">
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar trámite por nombre o código..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    value={selectedOrganismo}
                    onChange={(e) => setSelectedOrganismo(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Todos los organismos</option>
                    {organismos.map(org => (
                      <option key={org} value={org}>{org}</option>
                    ))}
                  </select>
                </div>
                <p className="text-sm text-gray-500">
                  Mostrando {filteredTramites.length} de {allTramites.length} trámites
                </p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2">
                {filteredTramites.map((tramite, index) => (
                  <div
                    key={`${tramite.id}-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:border-blue-300 hover:bg-blue-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium text-blue-600">{tramite.codigo}</span>
                        <Badge variant="secondary" className="text-xs">{tramite.sigla}</Badge>
                      </div>
                      <h4 className="font-medium text-sm">{tramite.nombre}</h4>
                      <p className="text-xs text-gray-500 mt-1">{tramite.descripcion}</p>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                        {tramite.sla_dias && <span>SLA: {tramite.sla_dias} días</span>}
                        {tramite.sistema && <span>Sistema: {tramite.sistema}</span>}
                        {tramite.vigencia_anos && <span>Vigencia: {tramite.vigencia_anos} años</span>}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onSelectTramite(tramite)}
                      className="ml-4"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                ))}

                {filteredTramites.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p>No se encontraron trámites</p>
                    <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab: Servicios de Proveedores */}
            <TabsContent value="proveedores" className="flex-1 overflow-hidden flex flex-col m-0 p-4">
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500">Cargando servicios...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-4">
                    <div className="flex space-x-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Buscar servicio o proveedor..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <select
                        value={selectedCategoria}
                        onChange={(e) => setSelectedCategoria(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Todas las categorías</option>
                        {categorias.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <p className="text-sm text-gray-500">
                      Mostrando {filteredPrecios.length} de {preciosProveedores.length} servicios
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2">
                    {filteredPrecios.map((precio) => (
                      <div
                        key={precio.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:border-blue-300 hover:bg-blue-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-medium text-blue-600">
                              {precio.servicio?.codigo}
                            </span>
                            {precio.servicio?.categoria && (
                              <Badge variant="secondary" className="text-xs">
                                {precio.servicio.categoria}
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-medium text-sm">{precio.servicio?.nombre}</h4>
                          <p className="text-xs text-gray-600 mt-1">
                            Proveedor: {precio.proveedor?.razon_social}
                          </p>
                          <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                            <span>Unidad: {precio.servicio?.unidad}</span>
                            {precio.servicio?.tiempo_entrega_dias && (
                              <span>Entrega: {precio.servicio.tiempo_entrega_dias} días</span>
                            )}
                            {precio.condiciones_comerciales && (
                              <span title={precio.condiciones_comerciales}>Condiciones especiales</span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 text-right flex items-center space-x-3">
                          <div>
                            <p className="text-lg font-bold text-blue-600">
                              ${precio.precio_unitario.toLocaleString('es-AR')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {precio.incluye_iva ? 'IVA incluido' : 'Más IVA'}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => onSelectProveedorServicio(precio)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Agregar
                          </Button>
                        </div>
                      </div>
                    ))}

                    {filteredPrecios.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <p>No se encontraron servicios de proveedores</p>
                        <p className="text-sm mt-2">
                          {preciosProveedores.length === 0
                            ? 'Aún no hay listas de precios cargadas'
                            : 'Intenta ajustar los filtros de búsqueda'}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
