import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { moduloConsumoService } from '@/services/ModuloConsumoService';
import { ExpedienteConsumo, TipoProductoConsumo, EstadoConsumo } from '@/types/modulos-normativos';
import { Badge } from '@/components/ui/badge';

const TIPOS_PRODUCTO: { value: TipoProductoConsumo; label: string }[] = [
  { value: 'ENCENDEDOR', label: 'Encendedores' },
  { value: 'ANTEOJO_SOL', label: 'Anteojos de Sol' },
  { value: 'JUGUETE', label: 'Juguetes' },
  { value: 'BICICLETA', label: 'Bicicletas' },
  { value: 'PANEL_MADERA', label: 'Paneles de Madera' },
  { value: 'MUEBLE', label: 'Muebles' },
];

const ESTADOS: { value: EstadoConsumo; label: string; color: string }[] = [
  { value: 'DOCUMENTACION', label: 'Documentación', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'EN_LABORATORIO', label: 'En Laboratorio', color: 'bg-blue-100 text-blue-800' },
  { value: 'APROBADO', label: 'Aprobado', color: 'bg-green-100 text-green-800' },
  { value: 'RECHAZADO', label: 'Rechazado', color: 'bg-red-100 text-red-800' },
  { value: 'VIGENTE', label: 'Vigente', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'VENCIDO', label: 'Vencido', color: 'bg-gray-100 text-gray-800' },
  { value: 'RENOVACION', label: 'Renovación', color: 'bg-orange-100 text-orange-800' },
];

export const ConsumoManager: React.FC = () => {
  const [expedientes, setExpedientes] = useState<ExpedienteConsumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<TipoProductoConsumo | 'ALL'>('ALL');
  const [selectedEstado, setSelectedEstado] = useState<EstadoConsumo | 'ALL'>('ALL');

  useEffect(() => {
    loadExpedientes();
  }, []);

  const loadExpedientes = async () => {
    try {
      setLoading(true);
      const data = await moduloConsumoService.getExpedientesConsumo();
      setExpedientes(data);
    } catch (error) {
      console.error('Error cargando expedientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpedientes = expedientes.filter(exp => {
    const matchesSearch =
      exp.marca?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.modelo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.certificado_numero?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTipo = selectedTipo === 'ALL' || exp.tipo_producto === selectedTipo;
    const matchesEstado = selectedEstado === 'ALL' || exp.estado === selectedEstado;

    return matchesSearch && matchesTipo && matchesEstado;
  });

  const getEstadoBadgeClass = (estado: EstadoConsumo): string => {
    const estadoConfig = ESTADOS.find(e => e.value === estado);
    return estadoConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const getTipoLabel = (tipo: TipoProductoConsumo): string => {
    const tipoConfig = TIPOS_PRODUCTO.find(t => t.value === tipo);
    return tipoConfig?.label || tipo;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos de Consumo</h1>
          <p className="text-gray-600 mt-2">Resolución 313/2025 - Gestión de certificaciones</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Expediente
        </Button>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar por marca, modelo o certificado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value as TipoProductoConsumo | 'ALL')}
            className="border border-gray-300 rounded-md px-4 py-2"
          >
            <option value="ALL">Todos los productos</option>
            {TIPOS_PRODUCTO.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>

          <select
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value as EstadoConsumo | 'ALL')}
            className="border border-gray-300 rounded-md px-4 py-2"
          >
            <option value="ALL">Todos los estados</option>
            {ESTADOS.map(estado => (
              <option key={estado.value} value={estado.value}>{estado.label}</option>
            ))}
          </select>

          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {loading ? (
            <div className="col-span-3 text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando expedientes...</p>
            </div>
          ) : filteredExpedientes.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron expedientes</p>
            </div>
          ) : (
            filteredExpedientes.map(expediente => (
              <Card key={expediente.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{expediente.marca}</h3>
                    <p className="text-sm text-gray-600">{expediente.modelo}</p>
                  </div>
                  <Badge className={getEstadoBadgeClass(expediente.estado)}>
                    {expediente.estado}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium">{getTipoLabel(expediente.tipo_producto)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Certificado:</span>
                    <span className="font-medium">{expediente.certificado_numero || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Laboratorio:</span>
                    <span className="font-medium truncate ml-2">
                      {expediente.laboratorio?.nombre || 'N/A'}
                    </span>
                  </div>
                  {expediente.fecha_vencimiento && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vencimiento:</span>
                      <span className="font-medium">
                        {new Date(expediente.fecha_vencimiento).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Ver Detalle
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {TIPOS_PRODUCTO.map(tipo => {
          const count = expedientes.filter(e => e.tipo_producto === tipo.value).length;
          return (
            <Card key={tipo.value} className="p-4">
              <h4 className="font-medium text-gray-700 mb-2">{tipo.label}</h4>
              <p className="text-3xl font-bold text-blue-600">{count}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
