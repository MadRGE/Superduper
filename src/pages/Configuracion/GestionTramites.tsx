import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  FileText,
  Building2,
  Clock,
  ListChecks
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSGT } from '@/context/SGTContext';

export const GestionTramites: React.FC = () => {
  const { state, dispatch } = useSGT();
  const { toast } = useToast();
  const [showNuevoTramite, setShowNuevoTramite] = useState(false);
  const [editingTramite, setEditingTramite] = useState<any>(null);

  const [nuevoTramite, setNuevoTramite] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    organismo_id: '',
    sla_total_dias: 30,
    requiere_tasa: false,
    monto_tasa: 0,
    tags: [] as string[],
    activo: true
  });

  const [nuevoPaso, setNuevoPaso] = useState({
    tramite_tipo_id: '',
    orden: 1,
    nombre: '',
    descripcion: '',
    sla_dias: 5,
    rol_responsable: 'gestor',
    validaciones: [] as string[]
  });

  const [nuevoDocumento, setNuevoDocumento] = useState({
    tramite_tipo_id: '',
    nombre: '',
    obligatorio: true,
    tipo: 'pdf',
    descripcion: ''
  });

  // Ejemplos de trámites adicionales para alimentos y cosméticos
  const ejemplosTramites = [
    {
      codigo: 'TT-ANMAT-RPA',
      nombre: 'Registro de Producto Alimenticio',
      organismo: 'ANMAT/INAL',
      descripcion: 'Registro nacional de producto alimenticio',
      sla_dias: 90,
      documentos: [
        'Fórmula cualicuantitativa',
        'Análisis de laboratorio oficial',
        'Proyecto de rótulo',
        'Diagrama de flujo del proceso',
        'RNPA del establecimiento',
        'Certificado de libre venta (si corresponde)'
      ]
    },
    {
      codigo: 'TT-ANMAT-COS',
      nombre: 'Registro de Producto Cosmético',
      organismo: 'ANMAT',
      descripcion: 'Registro de cosmético grado I',
      sla_dias: 60,
      documentos: [
        'Fórmula cualicuantitativa completa',
        'Especificaciones microbiológicas',
        'Test de irritación',
        'Arte de envase',
        'Certificado GMP establecimiento'
      ]
    },
    {
      codigo: 'TT-ANMAT-MED',
      nombre: 'Registro de Producto Médico',
      organismo: 'ANMAT',
      descripcion: 'Registro de dispositivo médico Clase I',
      sla_dias: 120,
      documentos: [
        'Manual de uso',
        'Certificado CE o FDA',
        'Análisis de riesgo ISO 14971',
        'Certificado de esterilización (si aplica)'
      ]
    },
    {
      codigo: 'TT-SENASA-FIT',
      nombre: 'Registro de Producto Fitosanitario',
      organismo: 'SENASA',
      descripcion: 'Registro de agroquímico',
      sla_dias: 180,
      documentos: [
        'Estudios toxicológicos',
        'Estudios ecotoxicológicos',
        'Certificado de composición',
        'Estudios de eficacia agronómica'
      ]
    }
  ];

  const handleGuardarTramite = () => {
    if (!nuevoTramite.codigo || !nuevoTramite.nombre) {
      toast({
        title: "Error",
        description: "Complete los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    // Generar ID único
    const nuevoId = `TT-${Date.now()}`;
    
    // Crear el trámite
    const tramiteCompleto = {
      id: nuevoId,
      ...nuevoTramite,
      created_at: new Date().toISOString()
    };

    // Guardar en localStorage
    const tramitesGuardados = JSON.parse(localStorage.getItem('sgt_tramite_tipos_custom') || '[]');
    tramitesGuardados.push(tramiteCompleto);
    localStorage.setItem('sgt_tramite_tipos_custom', JSON.stringify(tramitesGuardados));

    // Actualizar contexto
    dispatch({
      type: 'ADD_TRAMITE_TIPO',
      payload: tramiteCompleto
    });

    toast({
      title: "Trámite creado",
      description: `Se creó el trámite ${nuevoTramite.nombre}`,
    });

    // Resetear formulario
    setNuevoTramite({
      codigo: '',
      nombre: '',
      descripcion: '',
      organismo_id: '',
      sla_total_dias: 30,
      requiere_tasa: false,
      monto_tasa: 0,
      tags: [],
      activo: true
    });
    setShowNuevoTramite(false);
  };

  const handleImportarEjemplo = (ejemplo: any) => {
    const organismo = state.organismos.find(o => 
      o.nombre.includes(ejemplo.organismo.split('/')[0])
    );

    setNuevoTramite({
      codigo: ejemplo.codigo,
      nombre: ejemplo.nombre,
      descripcion: ejemplo.descripcion,
      organismo_id: organismo?.id || '',
      sla_total_dias: ejemplo.sla_dias,
      requiere_tasa: true,
      monto_tasa: 5000,
      tags: ['nuevo', 'importado'],
      activo: true
    });

    setShowNuevoTramite(true);
  };

  const handleGuardarPaso = () => {
    if (!nuevoPaso.tramite_tipo_id || !nuevoPaso.nombre) {
      toast({
        title: "Error",
        description: "Complete los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    const pasos = JSON.parse(localStorage.getItem('sgt_tramite_pasos_custom') || '[]');
    pasos.push({
      id: `PASO-${Date.now()}`,
      ...nuevoPaso,
      created_at: new Date().toISOString()
    });
    localStorage.setItem('sgt_tramite_pasos_custom', JSON.stringify(pasos));

    toast({
      title: "Paso agregado",
      description: "Se agregó el paso al flujo del trámite",
    });

    setNuevoPaso({
      tramite_tipo_id: '',
      orden: 1,
      nombre: '',
      descripcion: '',
      sla_dias: 5,
      rol_responsable: 'gestor',
      validaciones: []
    });
  };

  const handleGuardarDocumento = () => {
    if (!nuevoDocumento.tramite_tipo_id || !nuevoDocumento.nombre) {
      toast({
        title: "Error",
        description: "Complete los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    const documentos = JSON.parse(localStorage.getItem('sgt_tramite_docs_custom') || '[]');
    documentos.push({
      id: `DOC-${Date.now()}`,
      ...nuevoDocumento,
      created_at: new Date().toISOString()
    });
    localStorage.setItem('sgt_tramite_docs_custom', JSON.stringify(documentos));

    toast({
      title: "Documento agregado",
      description: "Se agregó el documento al checklist",
    });

    setNuevoDocumento({
      tramite_tipo_id: '',
      nombre: '',
      obligatorio: true,
      tipo: 'pdf',
      descripcion: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Trámites</h1>
          <p className="text-gray-600">Configure nuevos tipos de trámites y sus requisitos</p>
        </div>
        <Button 
          onClick={() => setShowNuevoTramite(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Tipo de Trámite
        </Button>
      </div>

      <Tabs defaultValue="tipos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tipos">Tipos de Trámite</TabsTrigger>
          <TabsTrigger value="pasos">Flujos de Trabajo</TabsTrigger>
          <TabsTrigger value="documentos">Documentación</TabsTrigger>
          <TabsTrigger value="ejemplos">Ejemplos Predefinidos</TabsTrigger>
        </TabsList>

        {/* Tab 1: Tipos de Trámite */}
        <TabsContent value="tipos">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Trámite Configurados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {state.tramiteTipos.slice(0, 10).map((tramite) => (
                  <div key={tramite.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{tramite.nombre}</p>
                        <p className="text-sm text-gray-500">
                          {tramite.codigo} • {state.organismos.find(o => o.id === tramite.organismo_id)?.sigla} • {tramite.sla_total_dias} días
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">
                        Activo
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Flujos de Trabajo */}
        <TabsContent value="pasos">
          <Card>
            <CardHeader>
              <CardTitle>Configurar Flujo de Trabajo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Trámite *
                  </label>
                  <select
                    value={nuevoPaso.tramite_tipo_id}
                    onChange={(e) => setNuevoPaso({...nuevoPaso, tramite_tipo_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Seleccionar...</option>
                    {state.tramiteTipos.map(t => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orden *
                  </label>
                  <input
                    type="number"
                    value={nuevoPaso.orden}
                    onChange={(e) => setNuevoPaso({...nuevoPaso, orden: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Paso *
                  </label>
                  <input
                    type="text"
                    value={nuevoPaso.nombre}
                    onChange={(e) => setNuevoPaso({...nuevoPaso, nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SLA (días)
                  </label>
                  <input
                    type="number"
                    value={nuevoPaso.sla_dias}
                    onChange={(e) => setNuevoPaso({...nuevoPaso, sla_dias: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={nuevoPaso.descripcion}
                    onChange={(e) => setNuevoPaso({...nuevoPaso, descripcion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleGuardarPaso}>
                  Agregar Paso
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Documentación */}
        <TabsContent value="documentos">
          <Card>
            <CardHeader>
              <CardTitle>Configurar Documentación Requerida</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Trámite *
                  </label>
                  <select
                    value={nuevoDocumento.tramite_tipo_id}
                    onChange={(e) => setNuevoDocumento({...nuevoDocumento, tramite_tipo_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Seleccionar...</option>
                    {state.tramiteTipos.map(t => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Documento *
                  </label>
                  <input
                    type="text"
                    value={nuevoDocumento.nombre}
                    onChange={(e) => setNuevoDocumento({...nuevoDocumento, nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Archivo
                  </label>
                  <select
                    value={nuevoDocumento.tipo}
                    onChange={(e) => setNuevoDocumento({...nuevoDocumento, tipo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="pdf">PDF</option>
                    <option value="imagen">Imagen</option>
                    <option value="excel">Excel</option>
                    <option value="word">Word</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Obligatorio
                  </label>
                  <select
                    value={nuevoDocumento.obligatorio ? 'si' : 'no'}
                    onChange={(e) => setNuevoDocumento({...nuevoDocumento, obligatorio: e.target.value === 'si'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleGuardarDocumento}>
                  Agregar Documento
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Ejemplos Predefinidos */}
        <TabsContent value="ejemplos">
          <Card>
            <CardHeader>
              <CardTitle>Trámites Predefinidos para Importar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ejemplosTramites.map((ejemplo, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:border-blue-300">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{ejemplo.nombre}</h3>
                        <p className="text-sm text-gray-500">{ejemplo.codigo}</p>
                      </div>
                      <Badge>{ejemplo.organismo}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{ejemplo.descripcion}</p>
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Documentación requerida:</p>
                      <ul className="text-xs text-gray-600 list-disc list-inside">
                        {ejemplo.documentos.slice(0, 3).map((doc, idx) => (
                          <li key={idx}>{doc}</li>
                        ))}
                        {ejemplo.documentos.length > 3 && (
                          <li>...y {ejemplo.documentos.length - 3} más</li>
                        )}
                      </ul>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleImportarEjemplo(ejemplo)}
                      className="w-full"
                    >
                      Importar este trámite
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Nuevo Trámite */}
      {showNuevoTramite && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Crear Nuevo Tipo de Trámite</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowNuevoTramite(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código *
                  </label>
                  <input
                    type="text"
                    value={nuevoTramite.codigo}
                    onChange={(e) => setNuevoTramite({...nuevoTramite, codigo: e.target.value})}
                    placeholder="TT-ORG-XXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organismo *
                  </label>
                  <select
                    value={nuevoTramite.organismo_id}
                    onChange={(e) => setNuevoTramite({...nuevoTramite, organismo_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Seleccionar...</option>
                    {state.organismos.map(org => (
                      <option key={org.id} value={org.id}>
                        {org.sigla} - {org.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Trámite *
                  </label>
                  <input
                    type="text"
                    value={nuevoTramite.nombre}
                    onChange={(e) => setNuevoTramite({...nuevoTramite, nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={nuevoTramite.descripcion}
                    onChange={(e) => setNuevoTramite({...nuevoTramite, descripcion: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SLA Total (días)
                  </label>
                  <input
                    type="number"
                    value={nuevoTramite.sla_total_dias}
                    onChange={(e) => setNuevoTramite({...nuevoTramite, sla_total_dias: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto Tasa (AR$)
                  </label>
                  <input
                    type="number"
                    value={nuevoTramite.monto_tasa}
                    onChange={(e) => setNuevoTramite({...nuevoTramite, monto_tasa: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={nuevoTramite.requiere_tasa}
                    onChange={(e) => setNuevoTramite({...nuevoTramite, requiere_tasa: e.target.checked})}
                  />
                  <span className="text-sm">Requiere pago de tasa</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={nuevoTramite.activo}
                    onChange={(e) => setNuevoTramite({...nuevoTramite, activo: e.target.checked})}
                  />
                  <span className="text-sm">Trámite activo</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowNuevoTramite(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleGuardarTramite}>
                  Crear Trámite
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};