import React, { useState } from 'react';
import { 
  Shield, 
  Package, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Truck,
  Hash,
  Calendar,
  Download,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Base de datos de LUCs válidos
const lucsValidos = [
  { numero: 'LUC-001-2025', titular: 'Armería San Martín', vencimiento: '2025-12-31', estado: 'vigente' },
  { numero: 'LUC-002-2025', titular: 'Tiro Federal Argentino', vencimiento: '2025-10-15', estado: 'vigente' },
  { numero: 'LUC-003-2024', titular: 'Caza y Pesca SA', vencimiento: '2024-08-30', estado: 'vencido' },
  { numero: 'LUC-004-2025', titular: 'Seguridad Integral SRL', vencimiento: '2025-11-20', estado: 'vigente' }
];

// Tipos de material controlado
const tiposMaterial = [
  { codigo: 'A1', descripcion: 'Armas de fuego cortas', requiere_sigimac: true },
  { codigo: 'A2', descripcion: 'Armas de fuego largas', requiere_sigimac: true },
  { codigo: 'M1', descripcion: 'Municiones cal. menor', requiere_sigimac: false },
  { codigo: 'M2', descripcion: 'Municiones cal. mayor', requiere_sigimac: true },
  { codigo: 'E1', descripcion: 'Explosivos', requiere_sigimac: true }
];

export const ANMaCManager: React.FC = () => {
  const [lucBuscado, setLucBuscado] = useState('');
  const [lucValidado, setLucValidado] = useState<any>(null);
  const [codigosSIGIMAC, setCodigosSIGIMAC] = useState<string[]>([]);
  const [showGenerarSIGIMAC, setShowGenerarSIGIMAC] = useState(false);
  const { toast } = useToast();

  const [importacionData, setImportacionData] = useState({
    tipo_material: '',
    cantidad: 1,
    marca: '',
    modelo: '',
    calibre: '',
    pais_origen: '',
    exportador: '',
    puerto_ingreso: '',
    fecha_embarque: '',
    requiere_sigimac: false
  });

  const [preEmbarque, setPreEmbarque] = useState({
    expediente_id: '',
    fecha_inspeccion: '',
    inspector: '',
    observaciones: '',
    checklist: {
      documentacion_completa: false,
      luc_vigente: false,
      autorizacion_anmac: false,
      certificado_origen: false,
      factura_comercial: false,
      packing_list: false
    }
  });

  const validarLUC = () => {
    const luc = lucsValidos.find(l => l.numero === lucBuscado);
    
    if (luc) {
      setLucValidado(luc);
      
      if (luc.estado === 'vencido') {
        toast({
          title: "LUC Vencido",
          description: `El LUC ${luc.numero} venció el ${new Date(luc.vencimiento).toLocaleDateString('es-AR')}`,
          variant: "destructive"
        });
      } else {
        const diasRestantes = Math.ceil(
          (new Date(luc.vencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        
        toast({
          title: "LUC Válido",
          description: `${luc.titular} - Vence en ${diasRestantes} días`,
        });
      }
    } else {
      toast({
        title: "LUC No Encontrado",
        description: "Verifique el número de LUC ingresado",
        variant: "destructive"
      });
    }
  };

  const generarCodigosSIGIMAC = (cantidad: number): string[] => {
    const year = new Date().getFullYear();
    const codigos = [];
    
    for (let i = 0; i < cantidad; i++) {
      const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
      codigos.push(`SIGIMAC-${year}-${random}`);
    }
    
    return codigos;
  };

  const handleGenerarSIGIMAC = () => {
    if (!importacionData.tipo_material || importacionData.cantidad < 1) {
      toast({
        title: "Error",
        description: "Complete los datos de importación",
        variant: "destructive"
      });
      return;
    }

    const tipo = tiposMaterial.find(t => t.codigo === importacionData.tipo_material);
    
    if (tipo?.requiere_sigimac) {
      const nuevosCodigosSIGIMAC = generarCodigosSIGIMAC(importacionData.cantidad);
      setCodigosSIGIMAC(nuevosCodigosSIGIMAC);
      
      // Guardar en localStorage
      const sigimacStorage = JSON.parse(localStorage.getItem('sgt_sigimac') || '[]');
      nuevosCodigosSIGIMAC.forEach(codigo => {
        sigimacStorage.push({
          codigo,
          tipo_material: importacionData.tipo_material,
          marca: importacionData.marca,
          modelo: importacionData.modelo,
          calibre: importacionData.calibre,
          fecha_generacion: new Date().toISOString(),
          estado: 'activo'
        });
      });
      localStorage.setItem('sgt_sigimac', JSON.stringify(sigimacStorage));
      
      toast({
        title: "Códigos SIGIMAC Generados",
        description: `Se generaron ${nuevosCodigosSIGIMAC.length} códigos de trazabilidad`,
      });
    } else {
      toast({
        title: "Sin SIGIMAC",
        description: "Este tipo de material no requiere códigos SIGIMAC",
      });
    }
    
    setShowGenerarSIGIMAC(false);
  };

  const handlePreEmbarque = () => {
    const checksPendientes = Object.values(preEmbarque.checklist).filter(v => !v).length;
    
    if (checksPendientes > 0) {
      toast({
        title: "Control Pre-Embarque Incompleto",
        description: `Faltan ${checksPendientes} items por verificar`,
        variant: "destructive"
      });
      return;
    }
    
    // Guardar control pre-embarque
    const controles = JSON.parse(localStorage.getItem('sgt_preembarque') || '[]');
    controles.push({
      id: `PE-${Date.now()}`,
      ...preEmbarque,
      fecha_control: new Date().toISOString()
    });
    localStorage.setItem('sgt_preembarque', JSON.stringify(controles));
    
    toast({
      title: "Control Pre-Embarque Aprobado",
      description: "Autorización de embarque otorgada",
    });
    
    // Reset formulario
    setPreEmbarque({
      expediente_id: '',
      fecha_inspeccion: '',
      inspector: '',
      observaciones: '',
      checklist: {
        documentacion_completa: false,
        luc_vigente: false,
        autorizacion_anmac: false,
        certificado_origen: false,
        factura_comercial: false,
        packing_list: false
      }
    });
  };

  const exportarSIGIMAC = () => {
    const content = codigosSIGIMAC.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SIGIMAC_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Módulo ANMaC</h1>
          <p className="text-gray-600">Agencia Nacional de Materiales Controlados</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setShowGenerarSIGIMAC(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Hash className="w-4 h-4 mr-2" />
            Generar SIGIMAC
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">LUCs Activos</p>
                <p className="text-2xl font-bold">
                  {lucsValidos.filter(l => l.estado === 'vigente').length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Importaciones Mes</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pre-embarques</p>
                <p className="text-2xl font-bold">7</p>
              </div>
              <Truck className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Códigos SIGIMAC</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
              <Hash className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="validar-luc" className="space-y-4">
        <TabsList>
          <TabsTrigger value="validar-luc">Validar LUC</TabsTrigger>
          <TabsTrigger value="sigimac">Códigos SIGIMAC</TabsTrigger>
          <TabsTrigger value="pre-embarque">Control Pre-Embarque</TabsTrigger>
          <TabsTrigger value="trazabilidad">Trazabilidad</TabsTrigger>
        </TabsList>

        {/* Tab 1: Validar LUC */}
        <TabsContent value="validar-luc">
          <Card>
            <CardHeader>
              <CardTitle>Validación de Legítimo Usuario Colectivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={lucBuscado}
                  onChange={(e) => setLucBuscado(e.target.value)}
                  placeholder="Ingrese número de LUC..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <Button onClick={validarLUC}>
                  Validar LUC
                </Button>
              </div>

              {lucValidado && (
                <div className={`p-4 rounded-lg border ${
                  lucValidado.estado === 'vigente' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {lucValidado.titular}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        LUC: {lucValidado.numero}
                      </p>
                      <p className="text-sm text-gray-600">
                        Vencimiento: {new Date(lucValidado.vencimiento).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                    <Badge variant={lucValidado.estado === 'vigente' ? 'default' : 'destructive'}>
                      {lucValidado.estado}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Lista de LUCs */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Registro de LUCs</h4>
                <div className="space-y-2">
                  {lucsValidos.map((luc) => (
                    <div key={luc.numero} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{luc.titular}</p>
                        <p className="text-xs text-gray-500">{luc.numero}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          Vence: {new Date(luc.vencimiento).toLocaleDateString('es-AR')}
                        </span>
                        <Badge variant={luc.estado === 'vigente' ? 'default' : 'destructive'} className="text-xs">
                          {luc.estado}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: SIGIMAC */}
        <TabsContent value="sigimac">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Identificación de Materiales Controlados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {codigosSIGIMAC.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-blue-900">
                        Últimos códigos generados
                      </h4>
                      <p className="text-sm text-blue-700">
                        {codigosSIGIMAC.length} códigos disponibles
                      </p>
                    </div>
                    <Button size="sm" onClick={exportarSIGIMAC}>
                      <Download className="w-4 h-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {codigosSIGIMAC.map((codigo, index) => (
                      <div key={index} className="font-mono text-sm text-blue-800">
                        {codigo}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tipos de Material</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {tiposMaterial.map((tipo) => (
                    <div key={tipo.codigo} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{tipo.descripcion}</p>
                          <p className="text-xs text-gray-500">Código: {tipo.codigo}</p>
                        </div>
                        {tipo.requiere_sigimac && (
                          <Badge variant="secondary" className="text-xs">
                            Requiere SIGIMAC
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Control Pre-Embarque */}
        <TabsContent value="pre-embarque">
          <Card>
            <CardHeader>
              <CardTitle>Control Pre-Embarque</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expediente
                  </label>
                  <input
                    type="text"
                    value={preEmbarque.expediente_id}
                    onChange={(e) => setPreEmbarque({...preEmbarque, expediente_id: e.target.value})}
                    placeholder="SGT-2025-ANMAC-00001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Inspección
                  </label>
                  <input
                    type="date"
                    value={preEmbarque.fecha_inspeccion}
                    onChange={(e) => setPreEmbarque({...preEmbarque, fecha_inspeccion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Checklist de Control
                </label>
                <div className="space-y-2">
                  {Object.entries(preEmbarque.checklist).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setPreEmbarque({
                          ...preEmbarque,
                          checklist: {
                            ...preEmbarque.checklist,
                            [key]: e.target.checked
                          }
                        })}
                      />
                      <span className="text-sm">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      {value && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  value={preEmbarque.observaciones}
                  onChange={(e) => setPreEmbarque({...preEmbarque, observaciones: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handlePreEmbarque}>
                  Aprobar Pre-Embarque
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Trazabilidad */}
        <TabsContent value="trazabilidad">
          <Card>
            <CardHeader>
              <CardTitle>Trazabilidad Unitaria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">
                        Sistema de Trazabilidad Activo
                      </p>
                      <p className="text-sm text-yellow-700">
                        Cada unidad importada debe tener su código SIGIMAC único para seguimiento.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ejemplo de trazabilidad */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Últimos movimientos</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-sm">SIGIMAC-2025-123456</p>
                          <p className="text-xs text-gray-500">Pistola 9mm - Importada 15/01/2025</p>
                        </div>
                        <Badge variant="default">En Aduana</Badge>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-sm">SIGIMAC-2025-123457</p>
                          <p className="text-xs text-gray-500">Rifle .22 - Entregado 10/01/2025</p>
                        </div>
                        <Badge variant="secondary">Entregado</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Generar SIGIMAC */}
      {showGenerarSIGIMAC && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Generar Códigos SIGIMAC</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Material *
                  </label>
                  <select
                    value={importacionData.tipo_material}
                    onChange={(e) => {
                      const tipo = tiposMaterial.find(t => t.codigo === e.target.value);
                      setImportacionData({
                        ...importacionData,
                        tipo_material: e.target.value,
                        requiere_sigimac: tipo?.requiere_sigimac || false
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Seleccionar...</option>
                    {tiposMaterial.map(tipo => (
                      <option key={tipo.codigo} value={tipo.codigo}>
                        {tipo.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    value={importacionData.cantidad}
                    onChange={(e) => setImportacionData({
                      ...importacionData,
                      cantidad: parseInt(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={importacionData.marca}
                    onChange={(e) => setImportacionData({...importacionData, marca: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo
                  </label>
                  <input
                    type="text"
                    value={importacionData.modelo}
                    onChange={(e) => setImportacionData({...importacionData, modelo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calibre
                  </label>
                  <input
                    type="text"
                    value={importacionData.calibre}
                    onChange={(e) => setImportacionData({...importacionData, calibre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    País Origen
                  </label>
                  <input
                    type="text"
                    value={importacionData.pais_origen}
                    onChange={(e) => setImportacionData({...importacionData, pais_origen: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {importacionData.requiere_sigimac && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Se generarán {importacionData.cantidad} códigos SIGIMAC únicos para trazabilidad unitaria.
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowGenerarSIGIMAC(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleGenerarSIGIMAC}>
                  Generar Códigos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};