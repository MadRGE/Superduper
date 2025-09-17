import React, { useState } from 'react';
import { 
  Beaker, 
  AlertTriangle, 
  Calendar, 
  FileText,
  Plus,
  TrendingUp,
  Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Base de datos de sustancias controladas
const sustanciasControladas = [
  { 
    nombre: 'Ácido Sulfúrico', 
    cas: '7664-93-9',
    lista: 'I',
    cupo_mensual: 1000,
    unidad: 'kg',
    uso_actual: 450,
    alerta: false
  },
  { 
    nombre: 'Tolueno', 
    cas: '108-88-3',
    lista: 'II',
    cupo_mensual: 5000,
    unidad: 'L',
    uso_actual: 4200,
    alerta: true
  },
  { 
    nombre: 'Acetona', 
    cas: '67-64-1',
    lista: 'II',
    cupo_mensual: 3000,
    unidad: 'L',
    uso_actual: 1500,
    alerta: false
  },
  { 
    nombre: 'Ácido Clorhídrico', 
    cas: '7647-01-0',
    lista: 'I',
    cupo_mensual: 800,
    unidad: 'kg',
    uso_actual: 750,
    alerta: true
  }
];

export const RENPREManager: React.FC = () => {
  const [activeForm, setActiveForm] = useState('');
  const [cupos, setCupos] = useState(sustanciasControladas);
  const { toast } = useToast();

  const [formF01, setFormF01] = useState({
    razon_social: '',
    cuit: '',
    domicilio: '',
    actividad: '',
    sustancias: [] as string[]
  });

  const [formF02, setFormF02] = useState({
    periodo: '',
    sustancia: '',
    cantidad_comprada: 0,
    proveedor_cuit: '',
    cantidad_utilizada: 0,
    stock_final: 0
  });

  const [formF05, setFormF05] = useState({
    sustancia: '',
    cantidad: 0,
    proveedor: '',
    fecha_operacion: '',
    numero_factura: ''
  });

  const calcularPorcentajeCupo = (uso: number, limite: number) => {
    return (uso / limite * 100).toFixed(1);
  };

  const handleSubmitF01 = () => {
    toast({
      title: "Inscripción F01 enviada",
      description: "Se generó el expediente de inscripción RENPRE",
    });
    setActiveForm('');
  };

  const handleSubmitF02 = () => {
    // Actualizar cupo usado
    const sustanciaIndex = cupos.findIndex(s => s.nombre === formF02.sustancia);
    if (sustanciaIndex !== -1) {
      const nuevosCupos = [...cupos];
      nuevosCupos[sustanciaIndex].uso_actual += formF02.cantidad_utilizada;
      setCupos(nuevosCupos);
    }

    toast({
      title: "Declaración F02 registrada",
      description: `Período ${formF02.periodo} declarado correctamente`,
    });
    setActiveForm('');
  };

  const handleSubmitF05 = () => {
    // Actualizar cupo
    const sustanciaIndex = cupos.findIndex(s => s.nombre === formF05.sustancia);
    if (sustanciaIndex !== -1) {
      const nuevosCupos = [...cupos];
      nuevosCupos[sustanciaIndex].uso_actual += formF05.cantidad;
      
      // Verificar si supera el 80%
      const porcentaje = calcularPorcentajeCupo(
        nuevosCupos[sustanciaIndex].uso_actual,
        nuevosCupos[sustanciaIndex].cupo_mensual
      );
      
      if (parseFloat(porcentaje) > 80) {
        nuevosCupos[sustanciaIndex].alerta = true;
        toast({
          title: "⚠️ Alerta de cupo",
          description: `Ha superado el 80% del cupo mensual de ${formF05.sustancia}`,
          variant: "destructive"
        });
      }
      
      setCupos(nuevosCupos);
    }

    toast({
      title: "Formulario F05 registrado",
      description: "Movimiento registrado en el sistema",
    });
    setActiveForm('');
  };

  const checkReinscripcionAnual = () => {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    
    // La reinscripción es en marzo (mes 2)
    if (mesActual === 2) {
      toast({
        title: "⚠️ Recordatorio",
        description: "La reinscripción anual RENPRE vence el 31 de marzo",
        variant: "destructive"
      });
    }
  };

  React.useEffect(() => {
    checkReinscripcionAnual();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Módulo RENPRE</h1>
          <p className="text-gray-600">Registro Nacional de Precursores Químicos</p>
        </div>
        <Badge className="bg-red-100 text-red-800">
          Reinscripción: Marzo 2025
        </Badge>
      </div>

      {/* Alertas */}
      {cupos.some(c => c.alerta) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium text-orange-900">Alerta de Cupos</p>
                <p className="text-sm text-orange-700">
                  Algunas sustancias están próximas a superar el cupo mensual permitido
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="cupos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cupos">Control de Cupos</TabsTrigger>
          <TabsTrigger value="f01">Formulario F01</TabsTrigger>
          <TabsTrigger value="f02">Formulario F02</TabsTrigger>
          <TabsTrigger value="f05">Formulario F05</TabsTrigger>
        </TabsList>

        {/* Tab 1: Control de Cupos */}
        <TabsContent value="cupos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cupos.map((sustancia, index) => (
              <Card key={index} className={sustancia.alerta ? 'border-orange-300' : ''}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{sustancia.nombre}</h3>
                        <p className="text-sm text-gray-500">CAS: {sustancia.cas}</p>
                      </div>
                      <Badge variant={sustancia.lista === 'I' ? 'destructive' : 'default'}>
                        Lista {sustancia.lista}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Cupo mensual:</span>
                        <span className="font-medium">
                          {sustancia.cupo_mensual} {sustancia.unidad}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Consumo actual:</span>
                        <span className={`font-medium ${sustancia.alerta ? 'text-orange-600' : ''}`}>
                          {sustancia.uso_actual} {sustancia.unidad} 
                          ({calcularPorcentajeCupo(sustancia.uso_actual, sustancia.cupo_mensual)}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          sustancia.alerta ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ 
                          width: `${calcularPorcentajeCupo(sustancia.uso_actual, sustancia.cupo_mensual)}%` 
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Formulario F01 - Inscripción */}
        <TabsContent value="f01">
          <Card>
            <CardHeader>
              <CardTitle>F01 - Solicitud de Inscripción/Reinscripción</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Razón Social *
                    </label>
                    <input
                      type="text"
                      value={formF01.razon_social}
                      onChange={(e) => setFormF01({...formF01, razon_social: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CUIT *
                    </label>
                    <input
                      type="text"
                      value={formF01.cuit}
                      onChange={(e) => setFormF01({...formF01, cuit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Domicilio *
                    </label>
                    <input
                      type="text"
                      value={formF01.domicilio}
                      onChange={(e) => setFormF01({...formF01, domicilio: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actividad *
                    </label>
                    <select
                      value={formF01.actividad}
                      onChange={(e) => setFormF01({...formF01, actividad: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="fabricacion">Fabricación</option>
                      <option value="fraccionamiento">Fraccionamiento</option>
                      <option value="distribucion">Distribución</option>
                      <option value="comercializacion">Comercialización</option>
                      <option value="almacenamiento">Almacenamiento</option>
                      <option value="transporte">Transporte</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sustancias a operar *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {sustanciasControladas.map((sust) => (
                      <label key={sust.cas} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formF01.sustancias.includes(sust.nombre)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormF01({
                                ...formF01, 
                                sustancias: [...formF01.sustancias, sust.nombre]
                              });
                            } else {
                              setFormF01({
                                ...formF01,
                                sustancias: formF01.sustancias.filter(s => s !== sust.nombre)
                              });
                            }
                          }}
                        />
                        <span className="text-sm">{sust.nombre}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSubmitF01}>
                    Enviar Inscripción
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Formulario F02 - Declaración Trimestral */}
        <TabsContent value="f02">
          <Card>
            <CardHeader>
              <CardTitle>F02 - Declaración Jurada Trimestral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Período *
                    </label>
                    <select
                      value={formF02.periodo}
                      onChange={(e) => setFormF02({...formF02, periodo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Q1-2025">1er Trimestre 2025</option>
                      <option value="Q2-2025">2do Trimestre 2025</option>
                      <option value="Q3-2025">3er Trimestre 2025</option>
                      <option value="Q4-2025">4to Trimestre 2025</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sustancia *
                    </label>
                    <select
                      value={formF02.sustancia}
                      onChange={(e) => setFormF02({...formF02, sustancia: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Seleccionar...</option>
                      {sustanciasControladas.map(s => (
                        <option key={s.cas} value={s.nombre}>{s.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad Comprada (kg/L)
                    </label>
                    <input
                      type="number"
                      value={formF02.cantidad_comprada}
                      onChange={(e) => setFormF02({...formF02, cantidad_comprada: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CUIT Proveedor
                    </label>
                    <input
                      type="text"
                      value={formF02.proveedor_cuit}
                      onChange={(e) => setFormF02({...formF02, proveedor_cuit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad Utilizada (kg/L)
                    </label>
                    <input
                      type="number"
                      value={formF02.cantidad_utilizada}
                      onChange={(e) => setFormF02({...formF02, cantidad_utilizada: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Final (kg/L)
                    </label>
                    <input
                      type="number"
                      value={formF02.stock_final}
                      onChange={(e) => setFormF02({...formF02, stock_final: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSubmitF02}>
                    Enviar Declaración
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Formulario F05 - Movimiento Individual */}
        <TabsContent value="f05">
          <Card>
            <CardHeader>
              <CardTitle>F05 - Registro de Movimiento Individual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Use este formulario para registrar cada operación con sustancias controladas
                    en tiempo real.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sustancia *
                    </label>
                    <select
                      value={formF05.sustancia}
                      onChange={(e) => setFormF05({...formF05, sustancia: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Seleccionar...</option>
                      {sustanciasControladas.map(s => (
                        <option key={s.cas} value={s.nombre}>{s.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad (kg/L) *
                    </label>
                    <input
                      type="number"
                      value={formF05.cantidad}
                      onChange={(e) => setFormF05({...formF05, cantidad: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proveedor/Cliente *
                    </label>
                    <input
                      type="text"
                      value={formF05.proveedor}
                      onChange={(e) => setFormF05({...formF05, proveedor: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha Operación *
                    </label>
                    <input
                      type="date"
                      value={formF05.fecha_operacion}
                      onChange={(e) => setFormF05({...formF05, fecha_operacion: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      N° Factura/Remito *
                    </label>
                    <input
                      type="text"
                      value={formF05.numero_factura}
                      onChange={(e) => setFormF05({...formF05, numero_factura: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSubmitF05}>
                    Registrar Movimiento
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};