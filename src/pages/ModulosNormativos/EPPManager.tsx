import React, { useState, useEffect } from 'react';
import { Plus, Search, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { moduloEPPService } from '@/services/ModuloEPPService';
import { ExpedienteEPP, CategoriaRiesgo, TipoEPP, EstadoEPP } from '@/types/modulos-normativos';
import { Badge } from '@/components/ui/badge';
import { CategoriaRiesgoBadge } from '@/components/ModulosNormativos/CategoriaRiesgoBadge';

const TIPOS_EPP: { value: TipoEPP; label: string }[] = [
  { value: 'PROTECCION_CABEZA', label: 'Protección de Cabeza' },
  { value: 'PROTECCION_OJOS', label: 'Protección de Ojos' },
  { value: 'PROTECCION_AUDITIVA', label: 'Protección Auditiva' },
  { value: 'PROTECCION_RESPIRATORIA', label: 'Protección Respiratoria' },
  { value: 'PROTECCION_MANOS', label: 'Protección de Manos' },
  { value: 'PROTECCION_PIES', label: 'Protección de Pies' },
  { value: 'PROTECCION_CUERPO', label: 'Protección del Cuerpo' },
  { value: 'PROTECCION_CAIDAS', label: 'Protección contra Caídas' },
];

const ESTADOS: { value: EstadoEPP; label: string; color: string }[] = [
  { value: 'DOCUMENTACION', label: 'Documentación', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'EN_LABORATORIO', label: 'En Laboratorio', color: 'bg-blue-100 text-blue-800' },
  { value: 'APROBADO', label: 'Aprobado', color: 'bg-green-100 text-green-800' },
  { value: 'RECHAZADO', label: 'Rechazado', color: 'bg-red-100 text-red-800' },
  { value: 'VIGENTE', label: 'Vigente', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'VENCIDO', label: 'Vencido', color: 'bg-gray-100 text-gray-800' },
  { value: 'EN_VIGILANCIA', label: 'En Vigilancia', color: 'bg-purple-100 text-purple-800' },
];

export const EPPManager: React.FC = () => {
  const [expedientes, setExpedientes] = useState<ExpedienteEPP[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaRiesgo | 'ALL'>('ALL');
  const [selectedTipo, setSelectedTipo] = useState<TipoEPP | 'ALL'>('ALL');

  useEffect(() => {
    loadExpedientes();
  }, []);

  const loadExpedientes = async () => {
    try {
      setLoading(true);
      const data = await moduloEPPService.getExpedientesEPP();
      setExpedientes(data);
    } catch (error) {
      console.error('Error cargando expedientes EPP:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpedientes = expedientes.filter(exp => {
    const matchesSearch =
      exp.marca?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.modelo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.certificado_numero?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategoria = selectedCategoria === 'ALL' || exp.categoria_riesgo === selectedCategoria;
    const matchesTipo = selectedTipo === 'ALL' || exp.tipo_epp === selectedTipo;

    return matchesSearch && matchesCategoria && matchesTipo;
  });

  const getEstadoBadgeClass = (estado: EstadoEPP): string => {
    const estadoConfig = ESTADOS.find(e => e.value === estado);
    return estadoConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const getTipoLabel = (tipo: TipoEPP): string => {
    const tipoConfig = TIPOS_EPP.find(t => t.value === tipo);
    return tipoConfig?.label || tipo;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipos de Protección Personal</h1>
          <p className="text-gray-600 mt-2">Resolución 18/2025 - Gestión de certificaciones EPP</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Expediente EPP
        </Button>
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
            value={selectedCategoria}
            onChange={(e) => setSelectedCategoria(e.target.value as CategoriaRiesgo | 'ALL')}
            className="border border-gray-300 rounded-md px-4 py-2"
          >
            <option value="ALL">Todas las categorías</option>
            <option value="CATEGORIA_I">Categoría I</option>
            <option value="CATEGORIA_II">Categoría II</option>
            <option value="CATEGORIA_III">Categoría III</option>
          </select>

          <select
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value as TipoEPP | 'ALL')}
            className="border border-gray-300 rounded-md px-4 py-2"
          >
            <option value="ALL">Todos los tipos</option>
            {TIPOS_EPP.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
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
              <p className="text-gray-600">No se encontraron expedientes EPP</p>
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
                    <CategoriaRiesgoBadge categoria={expediente.categoria_riesgo} />
                    <Badge className={getEstadoBadgeClass(expediente.estado)}>
                      {expediente.estado}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium text-right ml-2">
                      {getTipoLabel(expediente.tipo_epp)}
                    </span>
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
                  {expediente.proxima_vigilancia && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Próx. Vigilancia:</span>
                      <span className="font-medium">
                        {new Date(expediente.proxima_vigilancia).toLocaleDateString()}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h4 className="font-medium text-gray-700 mb-2">Categoría I</h4>
          <p className="text-3xl font-bold text-green-600">
            {expedientes.filter(e => e.categoria_riesgo === 'CATEGORIA_I').length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Riesgo Mínimo</p>
        </Card>
        <Card className="p-4">
          <h4 className="font-medium text-gray-700 mb-2">Categoría II</h4>
          <p className="text-3xl font-bold text-yellow-600">
            {expedientes.filter(e => e.categoria_riesgo === 'CATEGORIA_II').length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Riesgo Medio</p>
        </Card>
        <Card className="p-4">
          <h4 className="font-medium text-gray-700 mb-2">Categoría III</h4>
          <p className="text-3xl font-bold text-red-600">
            {expedientes.filter(e => e.categoria_riesgo === 'CATEGORIA_III').length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Riesgo Alto</p>
        </Card>
      </div>
    </div>
  );
};
