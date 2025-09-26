import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, CreditCard, Building2, Receipt, FileText, Download, Plus, CreditCard as Edit, Trash2, AlertTriangle, CheckCircle, Clock, PiggyBank, Calculator, BarChart3, ArrowUpRight, ArrowDownRight, Wallet, Home, Car, ShoppingCart, Coffee, Briefcase, Heart, Fuel, Smartphone, Users, Target, Eye, Filter, X, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

// Tipos de datos
interface Gasto {
  id: string;
  fecha: string;
  categoria: string;
  subcategoria?: string;
  descripcion: string;
  monto: number;
  tipo: 'fijo' | 'variable';
  metodo_pago: string;
  proveedor?: string;
  comprobante?: string;
  estado: 'pendiente' | 'pagado' | 'vencido';
  recurrente?: boolean;
  frecuencia?: 'mensual' | 'quincenal' | 'semanal' | 'anual';
  expediente_relacionado?: string;
  observaciones?: string;
}

interface Ingreso {
  id: string;
  fecha: string;
  concepto: string;
  cliente?: string;
  expediente?: string;
  monto: number;
  tipo: 'facturacion' | 'honorarios' | 'otros';
  estado: 'pendiente' | 'cobrado' | 'parcial';
  metodo_cobro?: string;
  comprobante?: string;
}

interface Prestamo {
  id: string;
  entidad: string;
  tipo: 'bancario' | 'personal' | 'tarjeta';
  monto_original: number;
  saldo_actual: number;
  tasa_interes: number;
  cuotas_totales: number;
  cuotas_pagadas: number;
  monto_cuota: number;
  fecha_inicio: string;
  fecha_vencimiento: string;
  dia_vencimiento: number;
  estado: 'activo' | 'cancelado' | 'moroso';
  garantia?: string;
}

interface CuentaBancaria {
  id: string;
  banco: string;
  tipo: 'caja_ahorro' | 'cuenta_corriente' | 'plazo_fijo';
  numero: string;
  cbu?: string;
  alias?: string;
  saldo: number;
  moneda: 'ARS' | 'USD';
  titular: string;
}

const ModuloFinancieroContable: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Estados para los datos
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
  
  // Filtros
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth());
  const [filtroAño, setFiltroAño] = useState(new Date().getFullYear());
  const [filtroCategoria, setFiltroCategoria] = useState('');
  
  // Modales
  const [showNuevoGasto, setShowNuevoGasto] = useState(false);
  const [showNuevoIngreso, setShowNuevoIngreso] = useState(false);
  const [showNuevoPrestamo, setShowNuevoPrestamo] = useState(false);
  
  // Formularios
  const [nuevoGasto, setNuevoGasto] = useState<Partial<Gasto>>({
    fecha: new Date().toISOString().split('T')[0],
    tipo: 'variable',
    estado: 'pendiente'
  });

  // Categorías de gastos predefinidas con iconos
  const categoriasGastos = [
    { nombre: 'Alquiler/Oficina', icono: Home, color: 'bg-blue-500' },
    { nombre: 'Servicios', icono: Briefcase, color: 'bg-purple-500' },
    { nombre: 'Transporte', icono: Car, color: 'bg-green-500' },
    { nombre: 'Combustible', icono: Fuel, color: 'bg-red-500' },
    { nombre: 'Proveedores', icono: ShoppingCart, color: 'bg-orange-500' },
    { nombre: 'Sueldos', icono: Users, color: 'bg-indigo-500' },
    { nombre: 'Impuestos', icono: Receipt, color: 'bg-gray-500' },
    { nombre: 'Marketing', icono: Target, color: 'bg-pink-500' },
    { nombre: 'Tecnología', icono: Smartphone, color: 'bg-cyan-500' },
    { nombre: 'Comidas/Viáticos', icono: Coffee, color: 'bg-yellow-500' },
    { nombre: 'Salud/Seguros', icono: Heart, color: 'bg-red-400' },
    { nombre: 'Otros', icono: DollarSign, color: 'bg-gray-400' }
  ];

  // Datos de ejemplo
  useEffect(() => {
    cargarDatosEjemplo();
  }, []);

  const cargarDatosEjemplo = () => {
    // Gastos de ejemplo
    const gastosEjemplo: Gasto[] = [
      {
        id: '1',
        fecha: '2025-01-01',
        categoria: 'Alquiler/Oficina',
        descripcion: 'Alquiler oficina Enero',
        monto: 180000,
        tipo: 'fijo',
        metodo_pago: 'Transferencia',
        estado: 'pagado',
        recurrente: true,
        frecuencia: 'mensual'
      },
      {
        id: '2',
        fecha: '2025-01-05',
        categoria: 'Servicios',
        subcategoria: 'Internet',
        descripcion: 'Fibertel 100MB',
        monto: 15000,
        tipo: 'fijo',
        metodo_pago: 'Débito automático',
        estado: 'pagado',
        recurrente: true,
        frecuencia: 'mensual'
      },
      {
        id: '3',
        fecha: '2025-01-10',
        categoria: 'Proveedores',
        descripcion: 'Laboratorio INTI - Ensayos',
        monto: 95000,
        tipo: 'variable',
        metodo_pago: 'Transferencia',
        estado: 'pendiente',
        expediente_relacionado: 'SGT-2025-ENACOM-00234'
      },
      {
        id: '4',
        fecha: '2025-01-15',
        categoria: 'Combustible',
        descripcion: 'YPF - Nafta Premium',
        monto: 25000,
        tipo: 'variable',
        metodo_pago: 'Tarjeta crédito',
        estado: 'pagado'
      },
      {
        id: '5',
        fecha: '2025-01-20',
        categoria: 'Sueldos',
        descripcion: 'Sueldo empleados - Enero',
        monto: 850000,
        tipo: 'fijo',
        metodo_pago: 'Transferencia',
        estado: 'pagado',
        recurrente: true,
        frecuencia: 'mensual'
      },
      {
        id: '6',
        fecha: '2025-01-25',
        categoria: 'Impuestos',
        subcategoria: 'IIBB',
        descripcion: 'Ingresos Brutos Enero',
        monto: 45000,
        tipo: 'fijo',
        metodo_pago: 'Transferencia',
        estado: 'pendiente',
        recurrente: true,
        frecuencia: 'mensual'
      }
    ];

    // Ingresos de ejemplo
    const ingresosEjemplo: Ingreso[] = [
      {
        id: '1',
        fecha: '2025-01-10',
        concepto: 'Facturación servicios regulatorios',
        cliente: 'Luminatec SRL',
        expediente: 'SGT-2025-ENACOM-00234',
        monto: 450000,
        tipo: 'facturacion',
        estado: 'cobrado',
        metodo_cobro: 'Transferencia'
      },
      {
        id: '2',
        fecha: '2025-01-15',
        concepto: 'Honorarios consultoría',
        cliente: 'TechImport SA',
        monto: 180000,
        tipo: 'honorarios',
        estado: 'pendiente'
      },
      {
        id: '3',
        fecha: '2025-01-20',
        concepto: 'Anticipo expediente ANMAT',
        cliente: 'Alimentos del Sur SA',
        expediente: 'SGT-2025-ANMAT-00123',
        monto: 225000,
        tipo: 'facturacion',
        estado: 'cobrado',
        metodo_cobro: 'Cheque'
      }
    ];

    // Préstamos de ejemplo
    const prestamosEjemplo: Prestamo[] = [
      {
        id: '1',
        entidad: 'Banco Galicia',
        tipo: 'bancario',
        monto_original: 2000000,
        saldo_actual: 1200000,
        tasa_interes: 45,
        cuotas_totales: 36,
        cuotas_pagadas: 14,
        monto_cuota: 85000,
        fecha_inicio: '2024-01-15',
        fecha_vencimiento: '2027-01-15',
        dia_vencimiento: 15,
        estado: 'activo'
      },
      {
        id: '2',
        entidad: 'Visa Crédito',
        tipo: 'tarjeta',
        monto_original: 350000,
        saldo_actual: 125000,
        tasa_interes: 55,
        cuotas_totales: 12,
        cuotas_pagadas: 8,
        monto_cuota: 35000,
        fecha_inicio: '2024-05-01',
        fecha_vencimiento: '2025-05-01',
        dia_vencimiento: 10,
        estado: 'activo'
      }
    ];

    // Cuentas bancarias de ejemplo
    const cuentasEjemplo: CuentaBancaria[] = [
      {
        id: '1',
        banco: 'Banco Galicia',
        tipo: 'cuenta_corriente',
        numero: '0070-1234-5678',
        cbu: '00701234567890123456',
        alias: 'SGT.CUENTA.PRINCIPAL',
        saldo: 2450000,
        moneda: 'ARS',
        titular: 'SGT Consultores SRL'
      },
      {
        id: '2',
        banco: 'Banco Santander',
        tipo: 'caja_ahorro',
        numero: '0072-5678-9012',
        saldo: 125000,
        moneda: 'USD',
        titular: 'SGT Consultores SRL'
      }
    ];

    setGastos(gastosEjemplo);
    setIngresos(ingresosEjemplo);
    setPrestamos(prestamosEjemplo);
    setCuentas(cuentasEjemplo);
  };

  // Cálculos
  const calcularTotales = () => {
    const gastosMes = gastos.filter(g => {
      const fecha = new Date(g.fecha);
      return fecha.getMonth() === filtroMes && fecha.getFullYear() === filtroAño;
    });

    const ingresosMes = ingresos.filter(i => {
      const fecha = new Date(i.fecha);
      return fecha.getMonth() === filtroMes && fecha.getFullYear() === filtroAño;
    });

    const totalGastos = gastosMes.reduce((sum, g) => sum + g.monto, 0);
    const totalIngresos = ingresosMes.reduce((sum, i) => sum + i.monto, 0);
    const gastosFijos = gastosMes.filter(g => g.tipo === 'fijo').reduce((sum, g) => sum + g.monto, 0);
    const gastosVariables = gastosMes.filter(g => g.tipo === 'variable').reduce((sum, g) => sum + g.monto, 0);
    const balance = totalIngresos - totalGastos;
    const saldoBancos = cuentas.reduce((sum, c) => sum + (c.moneda === 'ARS' ? c.saldo : c.saldo * 1000), 0);
    const deudaPrestamos = prestamos.filter(p => p.estado === 'activo').reduce((sum, p) => sum + p.saldo_actual, 0);

    return {
      totalGastos,
      totalIngresos,
      gastosFijos,
      gastosVariables,
      balance,
      saldoBancos,
      deudaPrestamos,
      gastosPorCategoria: categoriasGastos.map(cat => ({
        categoria: cat.nombre,
        monto: gastosMes.filter(g => g.categoria === cat.nombre).reduce((sum, g) => sum + g.monto, 0),
        icono: cat.icono,
        color: cat.color
      }))
    };
  };

  const totales = calcularTotales();

  const guardarGasto = () => {
    if (!nuevoGasto.descripcion || !nuevoGasto.monto || !nuevoGasto.categoria) {
      toast({
        title: "Error",
        description: "Complete los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    const gasto: Gasto = {
      id: `gasto-${Date.now()}`,
      fecha: nuevoGasto.fecha || new Date().toISOString().split('T')[0],
      categoria: nuevoGasto.categoria,
      descripcion: nuevoGasto.descripcion,
      monto: nuevoGasto.monto,
      tipo: nuevoGasto.tipo || 'variable',
      metodo_pago: nuevoGasto.metodo_pago || 'Efectivo',
      estado: nuevoGasto.estado || 'pendiente',
      observaciones: nuevoGasto.observaciones
    };

    setGastos([...gastos, gasto]);
    
    toast({
      title: "Gasto registrado",
      description: `${gasto.descripcion} - $${gasto.monto.toLocaleString('es-AR')}`,
    });

    setNuevoGasto({
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'variable',
      estado: 'pendiente'
    });
    setShowNuevoGasto(false);
  };

  const exportarExcel = () => {
    const datosExportar = {
      gastos: gastos,
      ingresos: ingresos,
      prestamos: prestamos,
      resumen: [
        { concepto: 'Total Ingresos', monto: totales.totalIngresos },
        { concepto: 'Total Gastos', monto: totales.totalGastos },
        { concepto: 'Balance', monto: totales.balance },
        { concepto: 'Saldo Bancos', monto: totales.saldoBancos },
        { concepto: 'Deuda Préstamos', monto: totales.deudaPrestamos }
      ]
    };

    const wb = XLSX.utils.book_new();
    
    // Hoja de resumen
    const wsResumen = XLSX.utils.json_to_sheet(datosExportar.resumen);
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");
    
    // Hoja de gastos
    const wsGastos = XLSX.utils.json_to_sheet(datosExportar.gastos);
    XLSX.utils.book_append_sheet(wb, wsGastos, "Gastos");
    
    // Hoja de ingresos
    const wsIngresos = XLSX.utils.json_to_sheet(datosExportar.ingresos);
    XLSX.utils.book_append_sheet(wb, wsIngresos, "Ingresos");
    
    // Hoja de préstamos
    const wsPrestamos = XLSX.utils.json_to_sheet(datosExportar.prestamos);
    XLSX.utils.book_append_sheet(wb, wsPrestamos, "Préstamos");
    
    XLSX.writeFile(wb, `finanzas_${filtroAño}_${filtroMes + 1}.xlsx`);
    
    toast({
      title: "Excel exportado",
      description: "El archivo se descargó correctamente",
    });
  };

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Control Financiero y Contable</h1>
          <p className="text-gray-600 dark:text-gray-300">Gestión integral de finanzas empresariales</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportarExcel}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <Button onClick={() => setShowNuevoGasto(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Gasto
          </Button>
        </div>
      </div>

      {/* Filtros de período */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Período:</span>
            </div>
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              {meses.map((mes, index) => (
                <option key={index} value={index}>{mes}</option>
              ))}
            </select>
            <select
              value={filtroAño}
              onChange={(e) => setFiltroAño(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              {[2024, 2025, 2026].map(año => (
                <option key={año} value={año}>{año}</option>
              ))}
            </select>
            <div className="flex-1"></div>
            <Badge variant={totales.balance >= 0 ? 'default' : 'destructive'} className="text-lg px-4 py-2">
              Balance: ${totales.balance.toLocaleString('es-AR')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Ingresos</p>
                <p className="text-xl font-bold text-green-600">
                  ${(totales.totalIngresos / 1000).toFixed(0)}K
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Gastos</p>
                <p className="text-xl font-bold text-red-600">
                  ${(totales.totalGastos / 1000).toFixed(0)}K
                </p>
              </div>
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">G. Fijos</p>
                <p className="text-xl font-bold">
                  ${(totales.gastosFijos / 1000).toFixed(0)}K
                </p>
              </div>
              <Home className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">G. Variables</p>
                <p className="text-xl font-bold">
                  ${(totales.gastosVariables / 1000).toFixed(0)}K
                </p>
              </div>
              <ShoppingCart className="w-6 h-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Saldo Bancos</p>
                <p className="text-xl font-bold text-blue-600">
                  ${(totales.saldoBancos / 1000).toFixed(0)}K
                </p>
              </div>
              <PiggyBank className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Préstamos</p>
                <p className="text-xl font-bold text-purple-600">
                  ${(totales.deudaPrestamos / 1000).toFixed(0)}K
                </p>
              </div>
              <CreditCard className="w-6 h-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="gastos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="gastos">Gastos</TabsTrigger>
          <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
          <TabsTrigger value="prestamos">Préstamos</TabsTrigger>
          <TabsTrigger value="cuentas">Cuentas</TabsTrigger>
          <TabsTrigger value="flujo">Flujo de Caja</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
        </TabsList>

        {/* Tab Gastos */}
        <TabsContent value="gastos">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de gastos */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Registro de Gastos</CardTitle>
                    <Button size="sm" onClick={() => setShowNuevoGasto(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {gastos
                      .filter(g => {
                        const fecha = new Date(g.fecha);
                        return fecha.getMonth() === filtroMes && fecha.getFullYear() === filtroAño;
                      })
                      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                      .map(gasto => {
                        const categoria = categoriasGastos.find(c => c.nombre === gasto.categoria);
                        const IconoCategoria = categoria?.icono || DollarSign;
                        
                        return (
                          <div key={gasto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${categoria?.color || 'bg-gray-500'}`}>
                                <IconoCategoria className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{gasto.descripcion}</p>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <span>{new Date(gasto.fecha).toLocaleDateString('es-AR')}</span>
                                  <span>•</span>
                                  <span>{gasto.categoria}</span>
                                  {gasto.expediente_relacionado && (
                                    <>
                                      <span>•</span>
                                      <span className="text-blue-600">{gasto.expediente_relacionado}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <p className="font-bold text-red-600">
                                  -${gasto.monto.toLocaleString('es-AR')}
                                </p>
                                <p className="text-xs text-gray-500">{gasto.metodo_pago}</p>
                              </div>
                              <Badge variant={
                                gasto.estado === 'pagado' ? 'default' :
                                gasto.estado === 'vencido' ? 'destructive' :
                                'secondary'
                              } className="text-xs">
                                {gasto.estado}
                              </Badge>
                              <div className="flex space-x-1">
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-3 h-3 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gastos por categoría */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Gastos por Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {totales.gastosPorCategoria
                      .filter(cat => cat.monto > 0)
                      .sort((a, b) => b.monto - a.monto)
                      .map(cat => {
                        const porcentaje = (cat.monto / totales.totalGastos * 100).toFixed(1);
                        const IconoCat = cat.icono;
                        
                        return (
                          <div key={cat.categoria} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <div className={`p-1 rounded ${cat.color}`}>
                                  <IconoCat className="w-3 h-3 text-white" />
                                </div>
                                <span className="font-medium">{cat.categoria}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">{porcentaje}%</span>
                                <span className="font-bold">${(cat.monto / 1000).toFixed(0)}K</span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${cat.color}`}
                                style={{ width: `${porcentaje}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              {/* Gastos recurrentes */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">Gastos Fijos Mensuales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {gastos
                      .filter(g => g.tipo === 'fijo' && g.recurrente)
                      .map(gasto => (
                        <div key={gasto.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{gasto.descripcion}</span>
                          <span className="font-medium">${gasto.monto.toLocaleString('es-AR')}</span>
                        </div>
                      ))}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Fijos:</span>
                      <span className="font-bold text-lg">${totales.gastosFijos.toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab Ingresos */}
        <TabsContent value="ingresos">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Registro de Ingresos</CardTitle>
                <Button size="sm" onClick={() => setShowNuevoIngreso(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Ingreso
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ingresos
                  .filter(i => {
                    const fecha = new Date(i.fecha);
                    return fecha.getMonth() === filtroMes && fecha.getFullYear() === filtroAño;
                  })
                  .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                  .map(ingreso => (
                    <div key={ingreso.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                          <ArrowUpRight className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{ingreso.concepto}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>{new Date(ingreso.fecha).toLocaleDateString('es-AR')}</span>
                            {ingreso.cliente && (
                              <>
                                <span>•</span>
                                <span>{ingreso.cliente}</span>
                              </>
                            )}
                            {ingreso.expediente && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600">{ingreso.expediente}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="font-bold text-green-600 text-lg">
                            +${ingreso.monto.toLocaleString('es-AR')}
                          </p>
                          {ingreso.metodo_cobro && (
                            <p className="text-xs text-gray-500">{ingreso.metodo_cobro}</p>
                          )}
                        </div>
                        <Badge variant={
                          ingreso.estado === 'cobrado' ? 'default' :
                          ingreso.estado === 'parcial' ? 'secondary' :
                          'outline'
                        }>
                          {ingreso.estado}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Préstamos */}
        <TabsContent value="prestamos">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {prestamos.map(prestamo => (
              <Card key={prestamo.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{prestamo.entidad}</CardTitle>
                    <Badge variant={prestamo.estado === 'activo' ? 'default' : 'secondary'}>
                      {prestamo.estado}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Monto original:</span>
                        <p className="font-medium">${prestamo.monto_original.toLocaleString('es-AR')}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Saldo actual:</span>
                        <p className="font-bold text-red-600">${prestamo.saldo_actual.toLocaleString('es-AR')}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Cuota mensual:</span>
                        <p className="font-medium">${prestamo.monto_cuota.toLocaleString('es-AR')}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Tasa:</span>
                        <p className="font-medium">{prestamo.tasa_interes}% anual</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progreso:</span>
                        <span>{prestamo.cuotas_pagadas}/{prestamo.cuotas_totales} cuotas</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${(prestamo.cuotas_pagadas / prestamo.cuotas_totales) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="text-sm">
                        <span className="text-gray-600">Vence el día </span>
                        <span className="font-medium">{prestamo.dia_vencimiento}</span>
                        <span className="text-gray-600"> de cada mes</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Pagar cuota
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab Cuentas Bancarias */}
        <TabsContent value="cuentas">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cuentas.map(cuenta => (
              <Card key={cuenta.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-lg">{cuenta.banco}</CardTitle>
                    </div>
                    <Badge>{cuenta.moneda}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-900">
                        {cuenta.moneda === 'ARS' ? '$' : 'USD '}
                        {cuenta.saldo.toLocaleString('es-AR')}
                      </p>
                      <p className="text-sm text-blue-700">Saldo disponible</p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium capitalize">{cuenta.tipo.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Número:</span>
                        <span className="font-mono">{cuenta.numero}</span>
                      </div>
                      {cuenta.cbu && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">CBU:</span>
                          <span className="font-mono text-xs">{cuenta.cbu}</span>
                        </div>
                      )}
                      {cuenta.alias && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Alias:</span>
                          <span className="font-medium">{cuenta.alias}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 pt-3 border-t">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        Movimientos
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <ArrowUpRight className="w-4 h-4 mr-2" />
                        Transferir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab Flujo de Caja */}
        <TabsContent value="flujo">
          <Card>
            <CardHeader>
              <CardTitle>Flujo de Caja - {meses[filtroMes]} {filtroAño}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Proyección mensual */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Saldo Inicial</p>
                    <p className="text-2xl font-bold">${totales.saldoBancos.toLocaleString('es-AR')}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Proyección 30 días</p>
                    <p className="text-2xl font-bold">
                      ${((totales.saldoBancos + totales.balance) / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Proyección 90 días</p>
                    <p className="text-2xl font-bold">
                      ${((totales.saldoBancos + (totales.balance * 3)) / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>

                {/* Gráfico de flujo */}
                <div>
                  <h4 className="font-medium mb-3">Evolución mensual</h4>
                  <div className="space-y-2">
                    {['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'].map((semana, idx) => {
                      const ingresosSemana = totales.totalIngresos / 4;
                      const gastosSemana = totales.totalGastos / 4;
                      const balanceSemana = ingresosSemana - gastosSemana;
                      
                      return (
                        <div key={semana}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>{semana}</span>
                            <span className={balanceSemana >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {balanceSemana >= 0 ? '+' : ''}{(balanceSemana / 1000).toFixed(0)}K
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <div className="flex-1 bg-green-500 h-4 rounded" 
                                 style={{ width: `${(ingresosSemana / totales.totalIngresos) * 50}%` }} />
                            <div className="flex-1 bg-red-500 h-4 rounded" 
                                 style={{ width: `${(gastosSemana / totales.totalGastos) * 50}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Alertas de flujo */}
                {totales.balance < 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-900">Flujo de caja negativo</p>
                        <p className="text-sm text-red-700">
                          Los gastos superan los ingresos en ${Math.abs(totales.balance).toLocaleString('es-AR')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Reportes */}
        <TabsContent value="reportes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Resultados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Ingresos</span>
                    <span className="font-bold text-green-600">
                      ${totales.totalIngresos.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Gastos Fijos</span>
                      <span>-${totales.gastosFijos.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Gastos Variables</span>
                      <span>-${totales.gastosVariables.toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                  <div className="flex justify-between py-2 border-t border-b">
                    <span className="font-medium">Total Gastos</span>
                    <span className="font-bold text-red-600">
                      -${totales.totalGastos.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 bg-gray-50 px-3 rounded">
                    <span className="font-bold">Resultado Neto</span>
                    <span className={`font-bold text-lg ${totales.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${totales.balance.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Margen</span>
                    <span>{totales.totalIngresos > 0 ? ((totales.balance / totales.totalIngresos) * 100).toFixed(1) : 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Indicadores Clave</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Ratio de Liquidez</span>
                      <Badge variant={totales.saldoBancos > totales.totalGastos ? 'default' : 'destructive'}>
                        {(totales.saldoBancos / totales.totalGastos).toFixed(2)}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${Math.min((totales.saldoBancos / totales.totalGastos) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Nivel de Endeudamiento</span>
                      <Badge variant={totales.deudaPrestamos / totales.totalIngresos > 0.5 ? 'destructive' : 'secondary'}>
                        {((totales.deudaPrestamos / totales.totalIngresos) * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-purple-500"
                        style={{ width: `${Math.min((totales.deudaPrestamos / totales.totalIngresos) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Eficiencia de Gastos</span>
                      <Badge variant={totales.gastosFijos / totales.totalGastos > 0.7 ? 'destructive' : 'default'}>
                        {((totales.gastosFijos / totales.totalGastos) * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-orange-500"
                        style={{ width: `${(totales.gastosFijos / totales.totalGastos) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <Button className="w-full" variant="outline">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Generar Reporte Completo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal Nuevo Gasto */}
      {showNuevoGasto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Registrar Nuevo Gasto</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowNuevoGasto(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={nuevoGasto.fecha}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, fecha: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Gasto *
                  </label>
                  <select
                    value={nuevoGasto.tipo}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, tipo: e.target.value as 'fijo' | 'variable'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="variable">Variable</option>
                    <option value="fijo">Fijo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={nuevoGasto.categoria}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, categoria: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Seleccionar...</option>
                    {categoriasGastos.map(cat => (
                      <option key={cat.nombre} value={cat.nombre}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto *
                  </label>
                  <input
                    type="number"
                    value={nuevoGasto.monto}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, monto: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <input
                    type="text"
                    value={nuevoGasto.descripcion}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, descripcion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Descripción del gasto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={nuevoGasto.metodo_pago}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, metodo_pago: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Tarjeta crédito">Tarjeta crédito</option>
                    <option value="Tarjeta débito">Tarjeta débito</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={nuevoGasto.estado}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, estado: e.target.value as 'pendiente' | 'pagado' | 'vencido'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="pagado">Pagado</option>
                    <option value="vencido">Vencido</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    value={nuevoGasto.observaciones}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, observaciones: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {nuevoGasto.tipo === 'fijo' && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={nuevoGasto.recurrente}
                      onChange={(e) => setNuevoGasto({...nuevoGasto, recurrente: e.target.checked})}
                    />
                    <span className="text-sm font-medium">Gasto recurrente</span>
                  </label>
                  {nuevoGasto.recurrente && (
                    <select
                      value={nuevoGasto.frecuencia}
                      onChange={(e) => setNuevoGasto({...nuevoGasto, frecuencia: e.target.value as any})}
                      className="mt-2 px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="mensual">Mensual</option>
                      <option value="quincenal">Quincenal</option>
                      <option value="semanal">Semanal</option>
                      <option value="anual">Anual</option>
                    </select>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowNuevoGasto(false)}>
                  Cancelar
                </Button>
                <Button onClick={guardarGasto}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Gasto
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ModuloFinancieroContable;