import React, { useState } from 'react';
import { 
  Calculator, 
  FileText, 
  Send, 
  DollarSign,
  Plus,
  Copy,
  Check,
  X,
  Download,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export const Presupuestos: React.FC = () => {
  const { toast } = useToast();
  const [showNuevoPresupuesto, setShowNuevoPresupuesto] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  const [presupuesto, setPresupuesto] = useState({
    cliente_id: '',
    numero: `PRES-${new Date().getFullYear()}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
    fecha: new Date().toISOString().split('T')[0],
    validez_dias: 30,
    moneda: 'ARS',
    tipo_cambio: 1,
    items: [] as any[],
    descuento_porcentaje: 0,
    observaciones: '',
    condiciones_pago: '50% anticipo, 50% contra entrega',
    tiempo_entrega: '30 días hábiles',
    incluye_iva: true
  });

  // Catálogo de servicios predefinidos
  const catalogoServicios = [
    {
      codigo: 'RNPA-01',
      descripcion: 'Registro RNPA producto alimenticio nacional',
      precio_unitario: 150000,
      unidad: 'servicio',
      categoria: 'ANMAT/INAL'
    },
    {
      codigo: 'RNPA-02',
      descripcion: 'Renovación RNPA',
      precio_unitario: 75000,
      unidad: 'servicio',
      categoria: 'ANMAT/INAL'
    },
    {
      codigo: 'RNE-01',
      descripcion: 'Registro RNE establecimiento elaborador',
      precio_unitario: 200000,
      unidad: 'servicio',
      categoria: 'ANMAT/INAL'
    },
    {
      codigo: 'ENACOM-01',
      descripcion: 'Homologación ENACOM equipo telecomunicaciones',
      precio_unitario: 180000,
      unidad: 'servicio',
      categoria: 'ENACOM'
    },
    {
      codigo: 'ENACOM-LAB',
      descripcion: 'Ensayos laboratorio homologado ENACOM',
      precio_unitario: 95000,
      unidad: 'ensayo',
      categoria: 'ENACOM'
    },
    {
      codigo: 'CITES-01',
      descripcion: 'Permiso CITES importación trofeo caza',
      precio_unitario: 120000,
      unidad: 'servicio',
      categoria: 'FAUNA'
    },
    {
      codigo: 'CITES-02',
      descripcion: 'Permiso CITES exportación fauna viva',
      precio_unitario: 85000,
      unidad: 'servicio',
      categoria: 'FAUNA'
    },
    {
      codigo: 'ANMAC-01',
      descripcion: 'Gestión importación armas y municiones',
      precio_unitario: 250000,
      unidad: 'servicio',
      categoria: 'ANMaC'
    },
    {
      codigo: 'ANMAC-02',
      descripcion: 'Generación códigos SIGIMAC',
      precio_unitario: 500,
      unidad: 'código',
      categoria: 'ANMaC'
    },
    {
      codigo: 'SEG-01',
      descripcion: 'Certificación seguridad eléctrica',
      precio_unitario: 65000,
      unidad: 'producto',
      categoria: 'SIC'
    },
    {
      codigo: 'SENASA-01',
      descripcion: 'Registro producto veterinario',
      precio_unitario: 180000,
      unidad: 'servicio',
      categoria: 'SENASA'
    },
    {
      codigo: 'DESP-01',
      descripcion: 'Despacho aduanero importación',
      precio_unitario: 45000,
      unidad: 'despacho',
      categoria: 'ADUANA'
    },
    {
      codigo: 'CONS-01',
      descripcion: 'Consultoría regulatoria hora',
      precio_unitario: 15000,
      unidad: 'hora',
      categoria: 'CONSULTORÍA'
    }
  ];

  const agregarItem = (servicio: any) => {
    const nuevoItem = {
      ...servicio,
      cantidad: 1,
      subtotal: servicio.precio_unitario
    };
    
    setPresupuesto({
      ...presupuesto,
      items: [...presupuesto.items, nuevoItem]
    });
    
    toast({
      title: "Item agregado",
      description: servicio.descripcion,
    });
  };

  const quitarItem = (index: number) => {
    const nuevosItems = presupuesto.items.filter((_, i) => i !== index);
    setPresupuesto({
      ...presupuesto,
      items: nuevosItems
    });
  };

  const actualizarCantidad = (index: number, cantidad: number) => {
    const nuevosItems = [...presupuesto.items];
    nuevosItems[index].cantidad = cantidad;
    nuevosItems[index].subtotal = cantidad * nuevosItems[index].precio_unitario;
    setPresupuesto({
      ...presupuesto,
      items: nuevosItems
    });
  };

  const calcularSubtotal = () => {
    return presupuesto.items.reduce((acc, item) => acc + item.subtotal, 0);
  };

  const calcularDescuento = () => {
    return calcularSubtotal() * (presupuesto.descuento_porcentaje / 100);
  };

  const calcularIVA = () => {
    if (!presupuesto.incluye_iva) return 0;
    const subtotalConDescuento = calcularSubtotal() - calcularDescuento();
    return subtotalConDescuento * 0.21;
  };

  const calcularTotal = () => {
    return calcularSubtotal() - calcularDescuento() + calcularIVA();
  };

  const guardarPresupuesto = () => {
    if (presupuesto.items.length === 0) {
      toast({
        title: "Error",
        description: "Agregue al menos un item al presupuesto",
        variant: "destructive"
      });
      return;
    }

    const presupuestoCompleto = {
      ...presupuesto,
      subtotal: calcularSubtotal(),
      descuento: calcularDescuento(),
      iva: calcularIVA(),
      total: calcularTotal(),
      estado: 'borrador',
      created_at: new Date().toISOString()
    };

    // Guardar en localStorage
    const presupuestos = JSON.parse(localStorage.getItem('sgt_presupuestos') || '[]');
    presupuestos.push(presupuestoCompleto);
    localStorage.setItem('sgt_presupuestos', JSON.stringify(presupuestos));

    toast({
      title: "Presupuesto guardado",
      description: `Número: ${presupuesto.numero}`,
    });

    setShowNuevoPresupuesto(false);
  };

  const enviarPresupuesto = () => {
    guardarPresupuesto();
    
    // Cambiar estado a enviado
    const presupuestos = JSON.parse(localStorage.getItem('sgt_presupuestos') || '[]');
    const ultimo = presupuestos[presupuestos.length - 1];
    ultimo.estado = 'enviado';
    ultimo.fecha_envio = new Date().toISOString();
    localStorage.setItem('sgt_presupuestos', JSON.stringify(presupuestos));

    toast({
      title: "Presupuesto enviado",
      description: "Se envió el presupuesto al cliente",
    });
  };

  // Presupuestos de ejemplo
  const presupuestosEjemplo = [
    {
      numero: 'PRES-2025-0045',
      cliente: 'Alimentos del Sur SA',
      fecha: '2025-01-15',
      total: 425000,
      estado: 'aprobado',
      items: 3
    },
    {
      numero: 'PRES-2025-0044',
      cliente: 'TechImport SRL',
      fecha: '2025-01-14',
      total: 275000,
      estado: 'enviado',
      items: 2
    },
    {
      numero: 'PRES-2025-0043',
      cliente: 'Laboratorios Pharma',
      fecha: '2025-01-12',
      total: 890000,
      estado: 'borrador',
      items: 5
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Presupuestos</h1>
          <p className="text-gray-600">Gestión de presupuestos y cotizaciones</p>
        </div>
        <Button 
          onClick={() => setShowNuevoPresupuesto(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Presupuesto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Presupuestos Mes</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monto Total</p>
                <p className="text-2xl font-bold">$3.2M</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasa Aprobación</p>
                <p className="text-2xl font-bold">68%</p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold">7</p>
              </div>
              <Calculator className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de presupuestos */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos Presupuestos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {presupuestosEjemplo.map((pres) => (
              <div key={pres.numero} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{pres.numero}</p>
                    <p className="text-sm text-gray-600">
                      {pres.cliente} • {pres.items} items
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    {new Date(pres.fecha).toLocaleDateString('es-AR')}
                  </span>
                  <span className="font-medium">
                    ${pres.total.toLocaleString('es-AR')}
                  </span>
                  <Badge variant={
                    pres.estado === 'aprobado' ? 'default' :
                    pres.estado === 'enviado' ? 'secondary' :
                    'outline'
                  }>
                    {pres.estado}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal Nuevo Presupuesto */}
      {showNuevoPresupuesto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Nuevo Presupuesto - {presupuesto.numero}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowNuevoPresupuesto(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Datos básicos */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Cliente
                  </label>
                  <select
                    value={presupuesto.cliente_id}
                    onChange={(e) => setPresupuesto({...presupuesto, cliente_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="1">Alimentos del Sur SA</option>
                    <option value="2">TechImport SRL</option>
                    <option value="3">Laboratorios Pharma</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={presupuesto.fecha}
                    onChange={(e) => setPresupuesto({...presupuesto, fecha: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Validez (días)
                  </label>
                  <input
                    type="number"
                    value={presupuesto.validez_dias}
                    onChange={(e) => setPresupuesto({...presupuesto, validez_dias: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Catálogo de servicios */}
              <div>
                <h3 className="font-medium mb-2">Agregar Servicios</h3>
                <div className="max-h-60 overflow-y-auto border rounded-lg p-2">
                  <div className="grid grid-cols-1 gap-2">
                    {catalogoServicios.map((servicio, index) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{servicio.descripcion}</p>
                          <p className="text-xs text-gray-500">
                            {servicio.codigo} • {servicio.categoria}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            ${servicio.precio_unitario.toLocaleString('es-AR')}
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => agregarItem(servicio)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Items del presupuesto */}
              {presupuesto.items.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Items del Presupuesto</h3>
                  <div className="border rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2 text-sm">Descripción</th>
                          <th className="text-center p-2 text-sm">Cantidad</th>
                          <th className="text-right p-2 text-sm">P. Unitario</th>
                          <th className="text-right p-2 text-sm">Subtotal</th>
                          <th className="text-center p-2 text-sm"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {presupuesto.items.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">
                              <p className="text-sm">{item.descripcion}</p>
                              <p className="text-xs text-gray-500">{item.codigo}</p>
                            </td>
                            <td className="p-2 text-center">
                              <input
                                type="number"
                                value={item.cantidad}
                                onChange={(e) => actualizarCantidad(index, parseInt(e.target.value))}
                                className="w-16 px-2 py-1 border rounded text-center"
                              />
                            </td>
                            <td className="p-2 text-right text-sm">
                              ${item.precio_unitario.toLocaleString('es-AR')}
                            </td>
                            <td className="p-2 text-right text-sm font-medium">
                              ${item.subtotal.toLocaleString('es-AR')}
                            </td>
                            <td className="p-2 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => quitarItem(index)}
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Totales */}
              <div className="flex justify-end">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">
                      ${calcularSubtotal().toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span>Descuento:</span>
                      <input
                        type="number"
                        value={presupuesto.descuento_porcentaje}
                        onChange={(e) => setPresupuesto({...presupuesto, descuento_porcentaje: parseFloat(e.target.value)})}
                        className="w-12 px-1 py-0.5 border rounded text-center"
                      />
                      <span>%</span>
                    </div>
                    <span className="font-medium text-red-600">
                      -${calcularDescuento().toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={presupuesto.incluye_iva}
                        onChange={(e) => setPresupuesto({...presupuesto, incluye_iva: e.target.checked})}
                      />
                      <span>IVA (21%):</span>
                    </div>
                    <span className="font-medium">
                      ${calcularIVA().toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium">TOTAL:</span>
                      <span className="text-xl font-bold text-blue-600">
                        ${calcularTotal().toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Condiciones */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Condiciones de Pago
                  </label>
                  <input
                    type="text"
                    value={presupuesto.condiciones_pago}
                    onChange={(e) => setPresupuesto({...presupuesto, condiciones_pago: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Tiempo de Entrega
                  </label>
                  <input
                    type="text"
                    value={presupuesto.tiempo_entrega}
                    onChange={(e) => setPresupuesto({...presupuesto, tiempo_entrega: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Observaciones
                </label>
                <textarea
                  value={presupuesto.observaciones}
                  onChange={(e) => setPresupuesto({...presupuesto, observaciones: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Botones */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setShowNuevoPresupuesto(false)}>
                  Cancelar
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" onClick={guardarPresupuesto}>
                    Guardar Borrador
                  </Button>
                  <Button onClick={enviarPresupuesto}>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar al Cliente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};