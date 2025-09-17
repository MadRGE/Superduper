import React, { useState } from 'react';
import { 
  Receipt, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Download,
  Send,
  Check,
  Clock,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export const Facturacion: React.FC = () => {
  const { toast } = useToast();
  const [filtroEstado, setFiltroEstado] = useState('todas');

  // Facturas de ejemplo
  const facturas = [
    {
      numero: 'FC-A-00001-00000234',
      fecha: '2025-01-20',
      cliente: 'Alimentos del Sur SA',
      cuit: '30-71234567-8',
      expediente: 'SGT-2025-ANMAT-00045',
      concepto: 'Registro RNPA - 3 productos',
      subtotal: 450000,
      iva: 94500,
      total: 544500,
      estado: 'pagada',
      fecha_pago: '2025-01-25',
      medio_pago: 'Transferencia'
    },
    {
      numero: 'FC-A-00001-00000233',
      fecha: '2025-01-18',
      cliente: 'TechImport SRL',
      cuit: '30-70987654-3',
      expediente: 'SGT-2025-ENACOM-00032',
      concepto: 'Homologación ENACOM + Ensayos',
      subtotal: 275000,
      iva: 57750,
      total: 332750,
      estado: 'pendiente',
      vencimiento: '2025-02-18'
    },
    {
      numero: 'FC-A-00001-00000232',
      fecha: '2025-01-15',
      cliente: 'Seguridad Integral SRL',
      cuit: '33-69876543-9',
      expediente: 'SGT-2025-ANMAC-00021',
      concepto: 'Importación armas - Generación SIGIMAC x50',
      subtotal: 275000,
      iva: 57750,
      total: 332750,
      estado: 'vencida',
      vencimiento: '2025-01-15',
      dias_vencida: 11
    }
  ];

  const calcularTotales = () => {
    const pagadas = facturas.filter(f => f.estado === 'pagada')
      .reduce((acc, f) => acc + f.total, 0);
    const pendientes = facturas.filter(f => f.estado === 'pendiente')
      .reduce((acc, f) => acc + f.total, 0);
    const vencidas = facturas.filter(f => f.estado === 'vencida')
      .reduce((acc, f) => acc + f.total, 0);
    
    return { pagadas, pendientes, vencidas, total: pagadas + pendientes + vencidas };
  };

  const totales = calcularTotales();

  const generarFactura = (expedienteId: string) => {
    // Simulación de generación de factura
    const nuevaFactura = {
      numero: `FC-A-00001-${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`,
      fecha: new Date().toISOString().split('T')[0],
      expediente: expedienteId,
      estado: 'pendiente'
    };

    toast({
      title: "Factura generada",
      description: `Número: ${nuevaFactura.numero}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>
        <p className="text-gray-600">Control de facturación y cobranzas</p>
      </div>

      {/* Stats de facturación */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Facturado Mes</p>
                <p className="text-2xl font-bold">
                  ${(totales.total / 1000000).toFixed(1)}M
                </p>
              </div>
              <Receipt className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cobrado</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(totales.pagadas / 1000000).toFixed(1)}M
                </p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendiente</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${(totales.pendientes / 1000).toFixed(0)}K
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vencidas</p>
                <p className="text-2xl font-bold text-red-600">
                  ${(totales.vencidas / 1000).toFixed(0)}K
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex space-x-2">
        <Button
          variant={filtroEstado === 'todas' ? 'default' : 'outline'}
          onClick={() => setFiltroEstado('todas')}
        >
          Todas
        </Button>
        <Button
          variant={filtroEstado === 'pagadas' ? 'default' : 'outline'}
          onClick={() => setFiltroEstado('pagadas')}
        >
          Pagadas
        </Button>
        <Button
          variant={filtroEstado === 'pendientes' ? 'default' : 'outline'}
          onClick={() => setFiltroEstado('pendientes')}
        >
          Pendientes
        </Button>
        <Button
          variant={filtroEstado === 'vencidas' ? 'default' : 'outline'}
          onClick={() => setFiltroEstado('vencidas')}
        >
          Vencidas
        </Button>
      </div>

      {/* Lista de facturas */}
      <Card>
        <CardHeader>
          <CardTitle>Facturas Emitidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {facturas
              .filter(f => filtroEstado === 'todas' || f.estado === filtroEstado)
              .map((factura) => (
                <div key={factura.numero} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Receipt className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{factura.numero}</p>
                      <p className="text-sm text-gray-600">
                        {factura.cliente} • CUIT: {factura.cuit}
                      </p>
                      <p className="text-xs text-gray-500">
                        {factura.concepto}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-bold">
                        ${factura.total.toLocaleString('es-AR')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(factura.fecha).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                    <Badge variant={
                      factura.estado === 'pagada' ? 'default' :
                      factura.estado === 'pendiente' ? 'secondary' :
                      'destructive'
                    }>
                      {factura.estado}
                      {factura.estado === 'vencida' && ` (${factura.dias_vencida}d)`}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      {factura.estado === 'pendiente' && (
                        <Button variant="ghost" size="sm">
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};