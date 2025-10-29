import React, { useState, useEffect } from 'react';
import { Plus, Search, Download, AlertCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { moduloElectromecanicoService } from '@/services/ModuloElectromecanicoService';
import { ExpedienteElectromecanico, TipoRegulacion, EstadoElectromecanico } from '@/types/modulos-normativos';
import { Badge } from '@/components/ui/badge';

const TIPOS_REGULACION: { value: TipoRegulacion; label: string }[] = [
  { value: 'RES_16_2025', label: 'Res. 16/2025' },
  { value: 'RES_17_2025', label: 'Res. 17/2025' },
];

const ESTADOS: { value: EstadoElectromecanico; label: string; color: string }[] = [
  { value: 'DOCUMENTACION', label: 'Documentación', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'EN_LABORATORIO', label: 'En Laboratorio', color: 'bg-blue-100 text-blue-800' },
  { value: 'APROBADO', label: 'Aprobado', color: 'bg-green-100 text-green-800' },
  { value: 'RECHAZADO', label: 'Rechazado', color: 'bg-red-100 text-red-800' },
  { value: 'VIGENTE', label: 'Vigente', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'VENCIDO', label: 'Vencido', color: 'bg-gray-100 text-gray-800' },
  { value: 'TRANSICION', label: 'En Transición', color: 'bg-orange-100 text-orange-800' },
];

export const ElectromecanicoManager: React.FC = () => {
  const [expedientes, setExpedientes] = useState<ExpedienteElectromecanico[]>([]);
  const [certificadosTransicion, setCertificadosTransicion] = useState<ExpedienteElectromecanico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<TipoRegulacion | 'ALL'>('ALL');
  const [selectedEstado, setSelectedEstado] = useState<EstadoElectromecanico | 'ALL'>('ALL');

  useEffect(() => {
    loadExpedientes();
  }, []);

  const loadExpedientes = async () => {
    try {
      setLoading(true);
      const [data, transicion] = await Promise.all([
        moduloElectromecanicoService.getExpedientesElectromecanico(),
        moduloElectromecanicoService.getCertificadosTransicion(),
      ]);
      setExpedientes(data);
      setCertificadosTransicion(transicion);
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

    const matchesTipo = selectedTipo === 'ALL' || exp.tipo_regulacion === selectedTipo;
    const matchesEstado = selectedEstado === 'ALL' || exp.estado === selectedEstado;

    return matchesSearch && matchesTipo && matchesEstado;
  });

  const getEstadoBadgeClass = (estado: EstadoElectromecanico): string => {
    const estadoConfig = ESTADOS.find(e => e.value === estado);
    return estadoConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const getTipoLabel = (tipo: TipoRegulacion): string => {
    const tipoConfig = TIPOS_REGULACION.find(t => t.value === tipo);
    return tipoConfig?.label || tipo;
  };

  const repuestos = expedientes.filter(e => e.es_repuesto_insumo);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos Electromecánicos</h1>
          <p className="text-gray-600 mt-2">Resoluciones 16-17/2025 - Certificaciones de seguridad</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Expediente
        </Button>
      </div>

      {certificadosTransicion.length > 0 && (
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900">
                Certificados en Período de Transición
              </h3>
              <p className="text-sm text-orange-800 mt-1">
                Hay {certificadosTransicion.length} certificado(s) anterior(es) que vencen antes del 26/02/2026.
                Se requiere gestionar su actualización bajo las nuevas resoluciones.
              </p>
            </div>
          </div>
        </Card>
      )}

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
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value as TipoRegulacion | 'ALL')}
            className="border border-gray-300 rounded-md px-4 py-2"
          >
            <option value="ALL">Todas las resoluciones</option>
            {TIPOS_REGULACION.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>

          <select
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value as EstadoElectromecanico | 'ALL')}
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
                    <Badge className="bg-blue-100 text-blue-800">
                      {getTipoLabel(expediente.tipo_regulacion)}
                    </Badge>
                    <Badge className={getEstadoBadgeClass(expediente.estado)}>
                      {expediente.estado}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {expediente.es_repuesto_insumo && (
                    <div className="flex items-center gap-2 text-purple-600">
                      <Badge className="bg-purple-100 text-purple-800">Repuesto/Insumo</Badge>
                    </div>
                  )}
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
                  {expediente.es_certificado_anterior && (
                    <div className="flex items-center gap-2 text-orange-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs font-medium">Requiere actualización</span>
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
        <Card className="p-4">
          <h4 className="font-medium text-gray-700 mb-2">Res. 16/2025</h4>
          <p className="text-3xl font-bold text-blue-600">
            {expedientes.filter(e => e.tipo_regulacion === 'RES_16_2025').length}
          </p>
        </Card>
        <Card className="p-4">
          <h4 className="font-medium text-gray-700 mb-2">Res. 17/2025</h4>
          <p className="text-3xl font-bold text-blue-600">
            {expedientes.filter(e => e.tipo_regulacion === 'RES_17_2025').length}
          </p>
        </Card>
        <Card className="p-4">
          <h4 className="font-medium text-gray-700 mb-2">Repuestos/Insumos</h4>
          <p className="text-3xl font-bold text-purple-600">{repuestos.length}</p>
        </Card>
        <Card className="p-4">
          <h4 className="font-medium text-gray-700 mb-2">En Transición</h4>
          <p className="text-3xl font-bold text-orange-600">{certificadosTransicion.length}</p>
        </Card>
      </div>
    </div>
  );
};
