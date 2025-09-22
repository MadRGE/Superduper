import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Package,
  DollarSign,
  Building2,
  User,
  ChevronDown,
  ChevronRight,
  Eye,
  Edit,
  Save,
  X,
  Plus,
  Printer,
  Mail,
  BarChart3,
  Search,
  RefreshCw,
  FileSpreadsheet,
  Target,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface ExpedienteRow {
  id: string;
  codigo: string;
  producto: string;
  marca: string;
  tipo_tramite: string;
  organismo: string;
  estado: string;
  fecha_inicio: string;
  fecha_ingreso_organismo: string;
  fecha_salida_estimada: string;
  fecha_salida_real?: string;
  dias_transcurridos: number;
  dias_restantes: number;
  progreso: number;
  responsable_interno: string;
  despachante?: string;
  observaciones?: string;
  documentos_pendientes: number;
  documentos_totales: number;
  ultimo_movimiento: string;
  fecha_ultimo_movimiento: string;
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  costo_estimado: number;
  costo_real?: number;
  facturado: number;
  cobrado: number;
  alertas: string[];
}

interface ClienteExpedientesDashboardProps {
  clienteId: string;
  clienteData: any;
}

export const ClienteExpedientesDashboard: React.FC<ClienteExpedientesDashboardProps> = ({ 
  clienteId, 
  clienteData 
}) => {
  const { toast } = useToast();
  
  const [cliente, setCliente] = useState<any>(clienteData);
  const [expedientes, setExpedientes] = useState<ExpedienteRow[]>([]);
  const [filtros, setFiltros] = useState({
    estado: '',
    organismo: '',
    prioridad: '',
    busqueda: '',
    año: new Date().getFullYear()
  });
  const [vistaActiva, setVistaActiva] = useState<'tabla' | 'kanban' | 'timeline'>('tabla');
  const [columnaOrden, setColumnaOrden] = useState<string>('fecha_inicio');
  const [ordenAsc, setOrdenAsc] = useState(false);
  const [editandoCelda, setEditandoCelda] = useState<{row: string, col: string} | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCliente(clienteData);
    cargarDatosCliente();
  }, [clienteId, clienteData]);

  const cargarDatosCliente = () => {
    // Simular expedientes con estructura similar a Excel
    const expedientesSimulados: ExpedienteRow[] = [
      {
        id: '1',
        codigo: 'SGT-2025-ANMAT-00123',
        producto: 'Yogur Natural 200g',
        marca: 'DelSur',
        tipo_tramite: 'Registro RNPA',
        organismo: 'ANMAT/INAL',
        estado: 'en_proceso',
        fecha_inicio: '2025-01-15',
        fecha_ingreso_organismo: '2025-01-20',
        fecha_salida_estimada: '2025-03-01',
        fecha_salida_real: undefined,
        dias_transcurridos: 12,
        dias_restantes: 12,
        progreso: 50,
        responsable_interno: 'María González',
        despachante: 'Juan Pérez',
        observaciones: 'Documentación en revisión',
        documentos_pendientes: 2,
        documentos_totales: 10,
        ultimo_movimiento: 'Análisis de laboratorio completado',
        fecha_ultimo_movimiento: '2025-01-25',
        prioridad: 'alta',
        costo_estimado: 150000,
        costo_real: 145000,
        facturado: 75000,
        cobrado: 75000,
        alertas: ['Documentos pendientes']
      },
      {
        id: '2',
        codigo: 'SGT-2025-ANMAT-00134',
        producto: 'Cereal Integral 500g',
        marca: 'NutriLife',
        tipo_tramite: 'Registro RNPA',
        organismo: 'ANMAT/INAL',
        estado: 'iniciado',
        fecha_inicio: '2025-01-20',
        fecha_ingreso_organismo: '2025-01-22',
        fecha_salida_estimada: '2025-03-06',
        fecha_salida_real: undefined,
        dias_transcurridos: 7,
        dias_restantes: 45,
        progreso: 12,
        responsable_interno: 'Carlos Rodríguez',
        observaciones: 'Preparando documentación inicial',
        documentos_pendientes: 4,
        documentos_totales: 10,
        ultimo_movimiento: 'Expediente creado',
        fecha_ultimo_movimiento: '2025-01-20',
        prioridad: 'urgente',
        costo_estimado: 150000,
        costo_real: undefined,
        facturado: 0,
        cobrado: 0,
        alertas: ['Urgente', 'Documentos faltantes']
      },
      {
        id: '3',
        codigo: 'SGT-2024-ENACOM-00087',
        producto: 'Router WiFi 6 Dual Band',
        marca: 'TechCorp',
        tipo_tramite: 'Homologación ENACOM',
        organismo: 'ENACOM',
        estado: 'observado',
        fecha_inicio: '2024-12-08',
        fecha_ingreso_organismo: '2024-12-15',
        fecha_salida_estimada: '2025-02-22',
        fecha_salida_real: undefined,
        dias_transcurridos: 50,
        dias_restantes: 8,
        progreso: 85,
        responsable_interno: 'Ana Martínez',
        despachante: 'Despachos García',
        observaciones: 'Documentación técnica incompleta',
        documentos_pendientes: 1,
        documentos_totales: 8,
        ultimo_movimiento: 'Respuesta a observaciones',
        fecha_ultimo_movimiento: '2025-01-24',
        prioridad: 'alta',
        costo_estimado: 180000,
        costo_real: 175000,
        facturado: 90000,
        cobrado: 90000,
        alertas: ['Observaciones pendientes', 'Próximo a vencer']
      },
      {
        id: '4',
        codigo: 'SGT-2024-SIC-00156',
        producto: 'Plancha de Pelo Cerámica',
        marca: 'BeautyTech',
        tipo_tramite: 'Certificación Seguridad Eléctrica',
        organismo: 'SIC',
        estado: 'completado',
        fecha_inicio: '2024-12-01',
        fecha_ingreso_organismo: '2024-12-05',
        fecha_salida_estimada: '2025-01-05',
        fecha_salida_real: '2025-01-03',
        dias_transcurridos: 33,
        dias_restantes: 0,
        progreso: 100,
        responsable_interno: 'Pedro López',
        observaciones: 'Certificado emitido',
        documentos_pendientes: 0,
        documentos_totales: 7,
        ultimo_movimiento: 'Certificado entregado al cliente',
        fecha_ultimo_movimiento: '2025-01-03',
        prioridad: 'normal',
        costo_estimado: 65000,
        costo_real: 65000,
        facturado: 65000,
        cobrado: 65000,
        alertas: []
      },
      {
        id: '5',
        codigo: 'SGT-2024-SENASA-00089',
        producto: 'Pet Food Premium 15kg',
        marca: 'PetCare',
        tipo_tramite: 'Registro Alimentos Animales',
        organismo: 'SENASA',
        estado: 'vencido',
        fecha_inicio: '2024-11-15',
        fecha_ingreso_organismo: '2024-11-20',
        fecha_salida_estimada: '2025-01-10',
        fecha_salida_real: undefined,
        dias_transcurridos: 72,
        dias_restantes: -15,
        progreso: 40,
        responsable_interno: 'Laura Díaz',
        observaciones: 'Falta respuesta del cliente',
        documentos_pendientes: 3,
        documentos_totales: 8,
        ultimo_movimiento: 'Solicitud de documentos adicionales',
        fecha_ultimo_movimiento: '2024-12-20',
        prioridad: 'alta',
        costo_estimado: 180000,
        costo_real: undefined,
        facturado: 90000,
        cobrado: 0,
        alertas: ['Vencido', 'Falta respuesta cliente', 'Pago pendiente']
      },
      {
        id: '6',
        codigo: 'SGT-2025-ENACOM-00045',
        producto: 'Smartphone 5G',
        marca: 'TechCorp',
        tipo_tramite: 'Homologación ENACOM',
        organismo: 'ENACOM',
        estado: 'en_proceso',
        fecha_inicio: '2025-01-10',
        fecha_ingreso_organismo: '2025-01-15',
        fecha_salida_estimada: '2025-03-15',
        fecha_salida_real: undefined,
        dias_transcurridos: 17,
        dias_restantes: 43,
        progreso: 30,
        responsable_interno: 'Roberto Silva',
        despachante: 'Despachos Técnicos SA',
        observaciones: 'Ensayos de laboratorio en curso',
        documentos_pendientes: 2,
        documentos_totales: 9,
        ultimo_movimiento: 'Inicio ensayos EMC',
        fecha_ultimo_movimiento: '2025-01-22',
        prioridad: 'normal',
        costo_estimado: 200000,
        costo_real: undefined,
        facturado: 100000,
        cobrado: 0,
        alertas: ['Ensayos en curso']
      },
      {
        id: '7',
        codigo: 'SGT-2025-SIC-00078',
        producto: 'Cargador USB-C 65W',
        marca: 'TechCorp',
        tipo_tramite: 'Certificación Seguridad Eléctrica',
        organismo: 'SIC',
        estado: 'en_proceso',
        fecha_inicio: '2025-01-05',
        fecha_ingreso_organismo: '2025-01-08',
        fecha_salida_estimada: '2025-02-12',
        fecha_salida_real: undefined,
        dias_transcurridos: 22,
        dias_restantes: 13,
        progreso: 65,
        responsable_interno: 'Ana Fernández',
        observaciones: 'Certificado de conformidad aprobado',
        documentos_pendientes: 1,
        documentos_totales: 7,
        ultimo_movimiento: 'Revisión final documentación',
        fecha_ultimo_movimiento: '2025-01-26',
        prioridad: 'normal',
        costo_estimado: 85000,
        costo_real: 80000,
        facturado: 42500,
        cobrado: 42500,
        alertas: []
      },
      {
        id: '8',
        codigo: 'SGT-2025-ANMAT-00167',
        producto: 'Suplemento Vitamínico',
        marca: 'NutriLife',
        tipo_tramite: 'Registro RNPA',
        organismo: 'ANMAT/INAL',
        estado: 'iniciado',
        fecha_inicio: '2025-01-25',
        fecha_ingreso_organismo: '',
        fecha_salida_estimada: '2025-03-11',
        fecha_salida_real: undefined,
        dias_transcurridos: 2,
        dias_restantes: 45,
        progreso: 5,
        responsable_interno: 'María González',
        observaciones: 'Preparando carpeta técnica',
        documentos_pendientes: 8,
        documentos_totales: 10,
        ultimo_movimiento: 'Expediente creado',
        fecha_ultimo_movimiento: '2025-01-25',
        prioridad: 'normal',
        costo_estimado: 150000,
        costo_real: undefined,
        facturado: 0,
        cobrado: 0,
        alertas: ['Recién iniciado']
      }
    ];

    setExpedientes(expedientesSimulados);
  };

  const handleOrdenar = (columna: string) => {
    if (columnaOrden === columna) {
      setOrdenAsc(!ordenAsc);
    } else {
      setColumnaOrden(columna);
      setOrdenAsc(true);
    }
  };

  const expedientesFiltrados = expedientes.filter(exp => {
    if (filtros.estado && exp.estado !== filtros.estado) return false;
    if (filtros.organismo && exp.organismo !== filtros.organismo) return false;
    if (filtros.prioridad && exp.prioridad !== filtros.prioridad) return false;
    if (filtros.busqueda && !JSON.stringify(exp).toLowerCase().includes(filtros.busqueda.toLowerCase())) return false;
    return true;
  });

  const expedientesOrdenados = [...expedientesFiltrados].sort((a, b) => {
    const aVal = a[columnaOrden as keyof ExpedienteRow];
    const bVal = b[columnaOrden as keyof ExpedienteRow];
    
    if (aVal < bVal) return ordenAsc ? -1 : 1;
    if (aVal > bVal) return ordenAsc ? 1 : -1;
    return 0;
  });

  const calcularEstadisticas = () => {
    const total = expedientes.length;
    const completados = expedientes.filter(e => e.estado === 'completado').length;
    const enProceso = expedientes.filter(e => e.estado === 'en_proceso').length;
    const observados = expedientes.filter(e => e.estado === 'observado').length;
    const vencidos = expedientes.filter(e => e.dias_restantes < 0).length;
    
    const costoTotal = expedientes.reduce((sum, e) => sum + e.costo_estimado, 0);
    const facturadoTotal = expedientes.reduce((sum, e) => sum + e.facturado, 0);
    const cobradoTotal = expedientes.reduce((sum, e) => sum + e.cobrado, 0);
    
    const eficiencia = total > 0 ? Math.round((completados / total) * 100) : 0;
    const tiempoPromedio = Math.round(
      expedientes.reduce((sum, e) => sum + e.dias_transcurridos, 0) / total
    );

    return {
      total,
      completados,
      enProceso,
      observados,
      vencidos,
      costoTotal,
      facturadoTotal,
      cobradoTotal,
      eficiencia,
      tiempoPromedio,
      documentosPendientes: expedientes.reduce((sum, e) => sum + e.documentos_pendientes, 0)
    };
  };

  const stats = calcularEstadisticas();

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(expedientesOrdenados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expedientes");
    
    // Agregar hoja de resumen
    const resumen = [
      ['RESUMEN CLIENTE - ' + cliente?.razon_social],
      [''],
      ['Total Expedientes', stats.total],
      ['Completados', stats.completados],
      ['En Proceso', stats.enProceso],
      ['Observados', stats.observados],
      [''],
      ['Costo Total', `$${stats.costoTotal.toLocaleString('es-AR')}`],
      ['Facturado', `$${stats.facturadoTotal.toLocaleString('es-AR')}`],
      ['Cobrado', `$${stats.cobradoTotal.toLocaleString('es-AR')}`],
      [''],
      ['Eficiencia', `${stats.eficiencia}%`],
      ['Tiempo Promedio', `${stats.tiempoPromedio} días`]
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(resumen);
    XLSX.utils.book_append_sheet(wb, ws2, "Resumen");
    
    XLSX.writeFile(wb, `${cliente?.razon_social}_expedientes_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Excel exportado",
      description: "El archivo se descargó correctamente",
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completado': return 'bg-green-100 text-green-800';
      case 'en_proceso': return 'bg-blue-100 text-blue-800';
      case 'observado': return 'bg-yellow-100 text-yellow-800';
      case 'iniciado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'bg-red-100 text-red-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'baja': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleRowExpansion = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Header de acciones */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Dashboard de Expedientes</h3>
          <p className="text-sm text-gray-600">Vista detallada de todos los expedientes del cliente</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Button size="sm" onClick={exportarExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Estadísticas Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">En Proceso</p>
                <p className="text-xl font-bold text-blue-600">{stats.enProceso}</p>
              </div>
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Observados</p>
                <p className="text-xl font-bold text-yellow-600">{stats.observados}</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Completados</p>
                <p className="text-xl font-bold text-green-600">{stats.completados}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Eficiencia</p>
                <p className="text-xl font-bold">{stats.eficiencia}%</p>
              </div>
              <Target className="w-6 h-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Pendiente Cobro</p>
                <p className="text-lg font-bold text-red-600">
                  ${((stats.facturadoTotal - stats.cobradoTotal) / 1000).toFixed(0)}K
                </p>
              </div>
              <DollarSign className="w-6 h-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por producto, código, marca..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Todos los estados</option>
              <option value="iniciado">Iniciado</option>
              <option value="en_proceso">En Proceso</option>
              <option value="observado">Observado</option>
              <option value="completado">Completado</option>
            </select>
            
            <select
              value={filtros.organismo}
              onChange={(e) => setFiltros({...filtros, organismo: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Todos los organismos</option>
              <option value="ENACOM">ENACOM</option>
              <option value="SIC">SIC</option>
              <option value="ANMAT/INAL">ANMAT/INAL</option>
              <option value="SENASA">SENASA</option>
            </select>
            
            <select
              value={filtros.prioridad}
              onChange={(e) => setFiltros({...filtros, prioridad: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Todas las prioridades</option>
              <option value="urgente">Urgente</option>
              <option value="alta">Alta</option>
              <option value="normal">Normal</option>
              <option value="baja">Baja</option>
            </select>

            <Button variant="outline" size="sm" onClick={() => setFiltros({
              estado: '', organismo: '', prioridad: '', busqueda: '', año: new Date().getFullYear()
            })}>
              <X className="w-4 h-4 mr-1" />
              Limpiar
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => cargarDatosCliente()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selector de Vista */}
      <div className="flex space-x-2">
        <Button
          variant={vistaActiva === 'tabla' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setVistaActiva('tabla')}
        >
          <FileText className="w-4 h-4 mr-2" />
          Tabla
        </Button>
        <Button
          variant={vistaActiva === 'kanban' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setVistaActiva('kanban')}
        >
          <Package className="w-4 h-4 mr-2" />
          Kanban
        </Button>
        <Button
          variant={vistaActiva === 'timeline' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setVistaActiva('timeline')}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Timeline
        </Button>
      </div>

      {/* Vista Tabla (Principal - Estilo Excel) */}
      {vistaActiva === 'tabla' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="p-2 text-left sticky left-0 bg-gray-50"></th>
                    <th 
                      className="p-2 text-left cursor-pointer hover:bg-gray-100"
                      onClick={() => handleOrdenar('codigo')}
                    >
                      Código {columnaOrden === 'codigo' && (ordenAsc ? '↑' : '↓')}
                    </th>
                    <th 
                      className="p-2 text-left cursor-pointer hover:bg-gray-100"
                      onClick={() => handleOrdenar('producto')}
                    >
                      Producto {columnaOrden === 'producto' && (ordenAsc ? '↑' : '↓')}
                    </th>
                    <th className="p-2 text-left">Marca</th>
                    <th className="p-2 text-left">Tipo Trámite</th>
                    <th className="p-2 text-left">Organismo</th>
                    <th className="p-2 text-center">Estado</th>
                    <th className="p-2 text-center">Prioridad</th>
                    <th 
                      className="p-2 text-center cursor-pointer hover:bg-gray-100"
                      onClick={() => handleOrdenar('progreso')}
                    >
                      Progreso {columnaOrden === 'progreso' && (ordenAsc ? '↑' : '↓')}
                    </th>
                    <th className="p-2 text-center">Días Trans.</th>
                    <th className="p-2 text-center">Días Rest.</th>
                    <th className="p-2 text-center">Docs</th>
                    <th className="p-2 text-right">Costo Est.</th>
                    <th className="p-2 text-right">Facturado</th>
                    <th className="p-2 text-right">Cobrado</th>
                    <th className="p-2 text-center">Alertas</th>
                    <th className="p-2 text-center sticky right-0 bg-gray-50">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {expedientesOrdenados.map((exp, index) => (
                    <React.Fragment key={exp.id}>
                      <tr 
                        className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                      >
                        <td className="p-2 sticky left-0 bg-inherit">
                          <button
                            onClick={() => toggleRowExpansion(exp.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {expandedRows.has(exp.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="p-2 font-mono text-xs">{exp.codigo}</td>
                        <td className="p-2 font-medium">{exp.producto}</td>
                        <td className="p-2">{exp.marca}</td>
                        <td className="p-2 text-xs">{exp.tipo_tramite}</td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-xs">
                            {exp.organismo}
                          </Badge>
                        </td>
                        <td className="p-2 text-center">
                          <Badge className={`text-xs ${getEstadoColor(exp.estado)}`}>
                            {exp.estado.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-2 text-center">
                          <Badge className={`text-xs ${getPrioridadColor(exp.prioridad)}`}>
                            {exp.prioridad}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center justify-center space-x-1">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  exp.progreso < 30 ? 'bg-red-500' :
                                  exp.progreso < 70 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${exp.progreso}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{exp.progreso}%</span>
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <span className={`font-medium ${exp.dias_transcurridos > 30 ? 'text-orange-600' : ''}`}>
                            {exp.dias_transcurridos}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <span className={`font-medium ${
                            exp.dias_restantes < 0 ? 'text-red-600' :
                            exp.dias_restantes < 7 ? 'text-orange-600' : ''
                          }`}>
                            {exp.dias_restantes}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <span className={`text-xs ${exp.documentos_pendientes > 0 ? 'text-orange-600 font-medium' : 'text-green-600'}`}>
                            {exp.documentos_pendientes}/{exp.documentos_totales}
                          </span>
                        </td>
                        <td className="p-2 text-right text-xs">
                          ${(exp.costo_estimado / 1000).toFixed(0)}K
                        </td>
                        <td className="p-2 text-right text-xs">
                          <span className={exp.facturado < exp.costo_estimado ? 'text-orange-600' : 'text-green-600'}>
                            ${(exp.facturado / 1000).toFixed(0)}K
                          </span>
                        </td>
                        <td className="p-2 text-right text-xs">
                          <span className={exp.cobrado < exp.facturado ? 'text-red-600' : 'text-green-600'}>
                            ${(exp.cobrado / 1000).toFixed(0)}K
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          {exp.alertas.length > 0 && (
                            <div className="flex items-center justify-center">
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                              <span className="ml-1 text-xs font-medium">{exp.alertas.length}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-2 sticky right-0 bg-inherit">
                          <div className="flex space-x-1 justify-center">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Fila expandible con detalles */}
                      {expandedRows.has(exp.id) && (
                        <tr className="bg-blue-50/50">
                          <td colSpan={17} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-medium text-sm mb-2">Información del Trámite</h4>
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Responsable:</span>
                                    <span className="font-medium">{exp.responsable_interno}</span>
                                  </div>
                                  {exp.despachante && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Despachante:</span>
                                      <span className="font-medium">{exp.despachante}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Ingreso organismo:</span>
                                    <span>{new Date(exp.fecha_ingreso_organismo).toLocaleDateString('es-AR')}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Salida estimada:</span>
                                    <span>{new Date(exp.fecha_salida_estimada).toLocaleDateString('es-AR')}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-sm mb-2">Último Movimiento</h4>
                                <div className="bg-white p-2 rounded text-xs">
                                  <p className="font-medium">{exp.ultimo_movimiento}</p>
                                  <p className="text-gray-500 mt-1">
                                    {new Date(exp.fecha_ultimo_movimiento).toLocaleDateString('es-AR')}
                                  </p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-sm mb-2">Observaciones</h4>
                                <div className="bg-white p-2 rounded">
                                  <p className="text-xs">{exp.observaciones || 'Sin observaciones'}</p>
                                  {exp.alertas.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                      {exp.alertas.map((alerta, idx) => (
                                        <div key={idx} className="flex items-center text-xs text-orange-600">
                                          <AlertTriangle className="w-3 h-3 mr-1" />
                                          {alerta}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2 mt-4">
                              <Button size="sm" variant="outline">
                                <FileText className="w-4 h-4 mr-2" />
                                Ver documentos
                              </Button>
                              <Button size="sm" variant="outline">
                                <Activity className="w-4 h-4 mr-2" />
                                Ver historial
                              </Button>
                              <Button size="sm" variant="outline">
                                <Mail className="w-4 h-4 mr-2" />
                                Enviar actualización
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
                
                {/* Fila de totales */}
                <tfoot className="bg-gray-100 font-medium">
                  <tr>
                    <td colSpan={12} className="p-2 text-right">Totales:</td>
                    <td className="p-2 text-right">
                      ${(stats.costoTotal / 1000).toFixed(0)}K
                    </td>
                    <td className="p-2 text-right">
                      ${(stats.facturadoTotal / 1000).toFixed(0)}K
                    </td>
                    <td className="p-2 text-right">
                      ${(stats.cobradoTotal / 1000).toFixed(0)}K
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vista Kanban */}
      {vistaActiva === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['iniciado', 'en_proceso', 'observado', 'completado'].map(estado => (
            <div key={estado} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium capitalize">{estado.replace('_', ' ')}</h3>
                <Badge variant="secondary">
                  {expedientesFiltrados.filter(e => e.estado === estado).length}
                </Badge>
              </div>
              <div className="space-y-2">
                {expedientesFiltrados
                  .filter(e => e.estado === estado)
                  .map(exp => (
                    <Card key={exp.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-medium truncate">{exp.producto}</p>
                          <Badge className={`text-xs ${getPrioridadColor(exp.prioridad)}`}>
                            {exp.prioridad}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{exp.codigo}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {exp.organismo}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {exp.progreso}%
                          </span>
                        </div>
                        {exp.alertas.length > 0 && (
                          <div className="mt-2 flex items-center text-xs text-orange-600">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {exp.alertas.length} alertas
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vista Timeline */}
      {vistaActiva === 'timeline' && (
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              {expedientesOrdenados.map((exp, index) => (
                <div key={exp.id} className="flex items-start space-x-4 mb-6">
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      exp.estado === 'completado' ? 'bg-green-100 text-green-600' :
                      exp.estado === 'observado' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {index + 1}
                    </div>
                    {index < expedientesOrdenados.length - 1 && (
                      <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="bg-white border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{exp.producto}</h4>
                          <p className="text-sm text-gray-600">{exp.codigo}</p>
                        </div>
                        <Badge className={getEstadoColor(exp.estado)}>
                          {exp.estado.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                        <div>
                          <span className="text-gray-500">Inicio:</span>
                          <span className="ml-2 font-medium">
                            {new Date(exp.fecha_inicio).toLocaleDateString('es-AR')}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Estimado:</span>
                          <span className="ml-2 font-medium">
                            {new Date(exp.fecha_salida_estimada).toLocaleDateString('es-AR')}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Progreso:</span>
                          <span className="ml-2 font-medium">{exp.progreso}%</span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div 
                          className="h-2 rounded-full bg-blue-500 transition-all"
                          style={{ width: `${exp.progreso}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de tendencias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Análisis de Tendencias - {cliente?.razon_social}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Expedientes por Mes</h4>
              <div className="space-y-2">
                {['Noviembre', 'Diciembre', 'Enero'].map((mes, idx) => {
                  const cantidad = idx === 0 ? 1 : idx === 1 ? 2 : 4;
                  return (
                  <div key={mes} className="flex items-center">
                    <span className="text-sm w-20">{mes}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6">
                      <div 
                        className="h-6 bg-blue-500 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${cantidad * 25}%` }}
                      >
                        <span className="text-xs text-white font-medium">{cantidad}</span>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-3">Distribución por Organismo</h4>
              <div className="space-y-2">
                {['ANMAT/INAL', 'ENACOM', 'SIC', 'SENASA'].map((org, idx) => {
                  const count = expedientes.filter(e => e.organismo === org).length;
                  const percentage = expedientes.length > 0 ? (count / expedientes.length * 100).toFixed(0) : '0';
                  return count > 0 ? (
                    <div key={org} className="flex items-center">
                      <span className="text-sm w-20">{org}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-6">
                        <div 
                          className="h-6 bg-green-500 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="text-xs text-white font-medium">{count}</span>
                        </div>
                      </div>
                      <span className="text-sm ml-2">{percentage}%</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};