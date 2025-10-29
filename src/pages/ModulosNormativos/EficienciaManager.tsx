import React, { useState, useEffect } from 'react';
import { Plus, Search, Download, AlertCircle, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { moduloEficienciaService } from '@/services/ModuloEficienciaService';
import { ExpedienteEficiencia, ClaseEnergetica, EstadoEficiencia } from '@/types/modulos-normativos';
import { Badge } from '@/components/ui/badge';
import { ClaseEnergeticaBadge } from '@/components/ModulosNormativos/ClaseEnergeticaBadge';

const ESTADOS: { value: EstadoEficiencia; label: string; color: string }[] = [
  { value: 'DOCUMENTACION', label: 'Documentación', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'EN_LABORATORIO', label: 'En Laboratorio', color: 'bg-blue-100 text-blue-800' },
  { value: 'APROBADO', label: 'Aprobado', color: 'bg-green-100 text-green-800' },
  { value: 'RECHAZADO', label: 'Rechazado', color: 'bg-red-100 text-red-800' },
  { value: 'VIGENTE', label: 'Vigente', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'VENCIDO', label: 'Vencido', color: 'bg-gray-100 text-gray-800' },
];

export const EficienciaManager: React.FC = () => {
  const [expedientes, setExpedientes] = useState<ExpedienteEficiencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClase, setSelectedClase] = useState<ClaseEnergetica | 'ALL'>('ALL');
  const [selectedEstado, setSelectedEstado] = useState<EstadoEficiencia | 'ALL'>('ALL');

  useEffect(() => {
    loadExpedientes();
  }, []);

  const loadExpedientes = async () => {
    try {
      setLoading(true);
      const data = await moduloEficienciaService.getExpedientesEficiencia();
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

    const matchesClase = selectedClase === 'ALL' || exp.clase_energetica === selectedClase;
    const matchesEstado = selectedEstado === 'ALL' || exp.estado === selectedEstado;

    return matchesSearch && matchesClase && matchesEstado;
  });

  const getEstadoBadgeClass = (estado: EstadoEficiencia): string => {
    const estadoConfig = ESTADOS.find(e => e.value === estado);
    return estadoConfig?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Eficiencia Energética</h1>
          <p className="text-gray-600 mt-2">Resolución 438/2024 - Etiquetado energético</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Base de Datos Pública
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nuevo Expediente
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar por marca, modelo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={selectedClase}
            onChange={(e) => setSelectedClase(e.target.value as ClaseEnergetica | 'ALL')}
            className="border border-gray-300 rounded-md px-4 py-2"
          >
            <option value="ALL">Todas las clases</option>
            <option value="A">Clase A</option>
            <option value="B">Clase B</option>
            <option value="C">Clase C</option>
            <option value="D">Clase D</option>
            <option value="E">Clase E</option>
            <option value="F">Clase F</option>
            <option value="G">Clase G</option>
          </select>

          <select
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value as EstadoEficiencia | 'ALL')}
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
                  <div className="flex flex-col gap-1">
                    <ClaseEnergeticaBadge clase={expediente.clase_energetica} />
                    <Badge className={getEstadoBadgeClass(expediente.estado)}>
                      {expediente.estado}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium">{expediente.tipo_producto}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Certificado:</span>
                    <span className="font-medium">{expediente.certificado_numero || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consumo:</span>
                    <span className="font-medium">
                      {expediente.consumo_kwh_anual} kWh/año
                    </span>
                  </div>
                  {expediente.etiqueta_generada && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-medium">Etiqueta generada</span>
                    </div>
                  )}
                  {expediente.en_base_datos_publica && (
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-600 font-medium">En DB pública</span>
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

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {(['A', 'B', 'C', 'D', 'E', 'F', 'G'] as ClaseEnergetica[]).map(clase => {
          const count = expedientes.filter(e => e.clase_energetica === clase).length;
          return (
            <Card key={clase} className="p-4 text-center">
              <ClaseEnergeticaBadge clase={clase} size="lg" />
              <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
