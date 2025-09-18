import React, { useState } from 'react';
import { 
  Shield, 
  Search, 
  FileText, 
  Package, 
  AlertCircle,
  CheckCircle,
  Download,
  Eye,
  Plus,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Base de datos de especies CITES
const especiesCITES = [
  { 
    nombre_cientifico: 'Panthera leo', 
    nombre_comun: 'León',
    apendice: 'II',
    pais_origen: ['Sudáfrica', 'Zimbabwe', 'Namibia'],
    tipo_permiso: ['Trofeo de caza', 'Zoo', 'Circo'],
    documentacion_requerida: ['Permiso CITES origen', 'Certificado caza', 'Guía tránsito provincial']
  },
  { 
    nombre_cientifico: 'Loxodonta africana', 
    nombre_comun: 'Elefante africano',
    apendice: 'I',
    pais_origen: ['Botswana', 'Namibia', 'Zimbabwe'],
    tipo_permiso: ['Trofeo de caza', 'Marfil trabajado pre-convenio'],
    documentacion_requerida: ['Permiso CITES origen', 'Certificado pre-convenio', 'Resolución provincial']
  },
  { 
    nombre_cientifico: 'Amazona aestiva', 
    nombre_comun: 'Loro hablador',
    apendice: 'II',
    pais_origen: ['Argentina', 'Brasil', 'Paraguay'],
    tipo_permiso: ['Mascota', 'Cría en cautiverio', 'Exportación'],
    documentacion_requerida: ['Certificado cría', 'Anillo identificatorio', 'Permiso provincial']
  },
  {
    nombre_cientifico: 'Salvator merianae',
    nombre_comun: 'Lagarto overo',
    apendice: 'II',
    pais_origen: ['Argentina'],
    tipo_permiso: ['Cuero curtido', 'Exportación comercial'],
    documentacion_requerida: ['Permiso extracción', 'Certificado curtiembre', 'Cupo anual']
  },
  {
    nombre_cientifico: 'Vicugna vicugna',
    nombre_comun: 'Vicuña',
    apendice: 'II',
    pais_origen: ['Argentina', 'Perú', 'Bolivia'],
    tipo_permiso: ['Fibra', 'Textil'],
    documentacion_requerida: ['Certificado origen', 'Plan manejo', 'Autorización comunidad']
  }
];

// Sistema de custodia de etiquetas
const etiquetasCustodia = [
  { id: 'CITES-2025-001', especie: 'Panthera leo', tipo: 'Trofeo', estado: 'disponible' },
  { id: 'CITES-2025-002', especie: 'Panthera leo', tipo: 'Trofeo', estado: 'asignada' },
  { id: 'CITES-2025-003', especie: 'Amazona aestiva', tipo: 'Mascota', estado: 'disponible' },
  { id: 'CITES-2025-004', especie: 'Salvator merianae', tipo: 'Cuero', estado: 'disponible' }
];

export const FaunaCITES: React.FC = () => {
  const [selectedEspecie, setSelectedEspecie] = useState<any>(null);
  const [searchEspecie, setSearchEspecie] = useState('');
  const [etiquetas, setEtiquetas] = useState(etiquetasCustodia);
  const [showGenerarPermiso, setShowGenerarPermiso] = useState(false);
  const { toast } = useToast();

  const [permisoData, setPermisoData] = useState({
    especie: '',
    cantidad: 1,
    tipo_operacion: '',
    pais_destino: '',
    importador: '',
    provincia_origen: '',
    establecimiento: '',
    observaciones: ''
  });

  const provinciasAutorizadas = [
    'Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán',
    'Salta', 'Jujuy', 'Catamarca', 'La Rioja', 'San Juan'
  ];

  const handleValidarEspecie = () => {
    const especie = especiesCITES.find(
      e => e.nombre_cientifico.toLowerCase().includes(searchEspecie.toLowerCase()) ||
           e.nombre_comun.toLowerCase().includes(searchEspecie.toLowerCase())
    );

    if (especie) {
      setSelectedEspecie(especie);
      toast({
        title: "Especie encontrada",
        description: `${especie.nombre_comun} - Apéndice ${especie.apendice}`,
      });
    } else {
      toast({
        title: "Especie no encontrada",
        description: "Verifique el nombre científico o común",
        variant: "destructive"
      });
    }
  };

  const handleGenerarPermiso = () => {
    // Validaciones
    if (!permisoData.especie || !permisoData.tipo_operacion) {
      toast({
        title: "Error",
        description: "Complete los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    // Generar código de permiso
    const codigoPermiso = `CITES-ARG-${new Date().getFullYear()}-${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`;
    
    // Crear PDF simulado
    const permisoHTML = `
      <div style="font-family: Arial; padding: 20px;">
        <h2>PERMISO CITES ARGENTINA</h2>
        <p><strong>Código:</strong> ${codigoPermiso}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-AR')}</p>
        <p><strong>Especie:</strong> ${permisoData.especie}</p>
        <p><strong>Cantidad:</strong> ${permisoData.cantidad}</p>
        <p><strong>Operación:</strong> ${permisoData.tipo_operacion}</p>
        <p><strong>Destino:</strong> ${permisoData.pais_destino || 'Nacional'}</p>
        <hr>
        <p>Autoridad Administrativa CITES Argentina</p>
        <p>Dirección Nacional de Biodiversidad</p>
      </div>
    `;

    // Guardar en localStorage
    const permisos = JSON.parse(localStorage.getItem('sgt_permisos_cites') || '[]');
    permisos.push({
      id: codigoPermiso,
      ...permisoData,
      fecha_emision: new Date().toISOString(),
      html: permisoHTML
    });
    localStorage.setItem('sgt_permisos_cites', JSON.stringify(permisos));

    toast({
      title: "Permiso generado",
      description: `Código: ${codigoPermiso}`,
    });

    // Resetear formulario
    setPermisoData({
      especie: '',
      cantidad: 1,
      tipo_operacion: '',
      pais_destino: '',
      importador: '',
      provincia_origen: '',
      establecimiento: '',
      observaciones: ''
    });
    setShowGenerarPermiso(false);
  };

  const handleAsignarEtiqueta = (etiquetaId: string) => {
    const nuevasEtiquetas = etiquetas.map(e => 
      e.id === etiquetaId ? { ...e, estado: 'asignada' } : e
    );
    setEtiquetas(nuevasEtiquetas);
    
    toast({
      title: "Etiqueta asignada",
      description: `Etiqueta ${etiquetaId} asignada correctamente`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Módulo FAUNA/CITES</h1>
          <p className="text-gray-600">Gestión de permisos CITES y fauna silvestre</p>
        </div>
        <Button 
          onClick={() => setShowGenerarPermiso(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Permiso
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Permisos Activos</p>
                <p className="text-2xl font-bold">47</p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Etiquetas Disponibles</p>
                <p className="text-2xl font-bold">
                  {etiquetas.filter(e => e.estado === 'disponible').length}
                </p>
              </div>
              <Tag className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Especies Apéndice I</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Shield className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cupo Anual Usado</p>
                <p className="text-2xl font-bold">68%</p>
              </div>
              <Package className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="validador" className="space-y-4">
        <TabsList>
          <TabsTrigger value="validador">Validador Especies</TabsTrigger>
          <TabsTrigger value="etiquetas">Custodia Etiquetas</TabsTrigger>
          <TabsTrigger value="permisos">Permisos Provinciales</TabsTrigger>
          <TabsTrigger value="cupos">Cupos Anuales</TabsTrigger>
        </TabsList>

        {/* Tab 1: Validador de Especies */}
        <TabsContent value="validador">
          <Card>
            <CardHeader>
              <CardTitle>Validador de Especies CITES</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchEspecie}
                  onChange={(e) => setSearchEspecie(e.target.value)}
                  placeholder="Ingrese nombre científico o común..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <Button onClick={handleValidarEspecie}>
                  <Search className="w-4 h-4 mr-2" />
                  Validar
                </Button>
              </div>

              {selectedEspecie && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">
                    {selectedEspecie.nombre_comun}
                  </h3>
                  <p className="text-sm text-blue-700 italic mb-2">
                    {selectedEspecie.nombre_cientifico}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Apéndice CITES:</span>
                      <Badge className="ml-2" variant={
                        selectedEspecie.apendice === 'I' ? 'destructive' : 'default'
                      }>
                        {selectedEspecie.apendice}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">País origen permitido:</span>
                      <span className="ml-2">{selectedEspecie.pais_origen.join(', ')}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Documentación requerida:
                    </p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {selectedEspecie.documentacion_requerida.map((doc: string, idx: number) => (
                        <li key={idx}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Lista de especies frecuentes */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Especies frecuentes:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {especiesCITES.slice(0, 4).map((esp, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setSearchEspecie(esp.nombre_cientifico);
                        setSelectedEspecie(esp);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{esp.nombre_comun}</p>
                          <p className="text-xs text-gray-500 italic">{esp.nombre_cientifico}</p>
                        </div>
                        <Badge variant="outline">Ap. {esp.apendice}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Custodia de Etiquetas */}
        <TabsContent value="etiquetas">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Custodia de Etiquetas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {etiquetas.map((etiqueta) => (
                  <div key={etiqueta.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Tag className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{etiqueta.id}</p>
                        <p className="text-sm text-gray-600">
                          {etiqueta.especie} - {etiqueta.tipo}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={etiqueta.estado === 'disponible' ? 'default' : 'secondary'}>
                        {etiqueta.estado}
                      </Badge>
                      {etiqueta.estado === 'disponible' && (
                        <Button 
                          size="sm"
                          onClick={() => handleAsignarEtiqueta(etiqueta.id)}
                        >
                          Asignar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Permisos Provinciales */}
        <TabsContent value="permisos">
          <Card>
            <CardHeader>
              <CardTitle>Permisos Provinciales de Fauna</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {provinciasAutorizadas.map((provincia) => (
                  <div key={provincia} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{provincia}</p>
                        <p className="text-sm text-gray-600">
                          Autoridad: Dir. de Fauna Provincial
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Cupos Anuales */}
        <TabsContent value="cupos">
          <Card>
            <CardHeader>
              <CardTitle>Control de Cupos Anuales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium mb-2">Salvator merianae (Lagarto overo)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cupo anual:</span>
                      <span className="font-medium">500,000 cueros</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Utilizado:</span>
                      <span className="font-medium">342,150 (68.4%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '68.4%' }} />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-2">Amazona aestiva (Loro hablador)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cupo anual:</span>
                      <span className="font-medium">5,000 ejemplares</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Utilizado:</span>
                      <span className="font-medium">2,100 (42%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '42%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Generar Permiso */}
      {showGenerarPermiso && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Generar Nuevo Permiso CITES</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Especie *
                  </label>
                  <select
                    value={permisoData.especie}
                    onChange={(e) => setPermisoData({ ...permisoData, especie: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Seleccionar...</option>
                    {especiesCITES.map(esp => (
                      <option key={esp.nombre_cientifico} value={esp.nombre_cientifico}>
                        {esp.nombre_comun} - {esp.nombre_cientifico}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    value={permisoData.cantidad}
                    onChange={(e) => setPermisoData({ ...permisoData, cantidad: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Tipo de Operación *
                  </label>
                  <select
                    value={permisoData.tipo_operacion}
                    onChange={(e) => setPermisoData({ ...permisoData, tipo_operacion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="importacion">Importación</option>
                    <option value="exportacion">Exportación</option>
                    <option value="reexportacion">Reexportación</option>
                    <option value="transito">Tránsito</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    País Destino/Origen
                  </label>
                  <input
                    type="text"
                    value={permisoData.pais_destino}
                    onChange={(e) => setPermisoData({ ...permisoData, pais_destino: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Provincia Origen
                  </label>
                  <select
                    value={permisoData.provincia_origen}
                    onChange={(e) => setPermisoData({ ...permisoData, provincia_origen: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Seleccionar...</option>
                    {provinciasAutorizadas.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Establecimiento
                  </label>
                  <input
                    type="text"
                    value={permisoData.establecimiento}
                    onChange={(e) => setPermisoData({ ...permisoData, establecimiento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Observaciones
                </label>
                <textarea
                  value={permisoData.observaciones}
                  onChange={(e) => setPermisoData({ ...permisoData, observaciones: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowGenerarPermiso(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleGenerarPermiso}>
                  Generar Permiso
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};