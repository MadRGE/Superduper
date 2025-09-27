import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Star, 
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export const Proveedores: React.FC = () => {
  const { toast } = useToast();
  const [showNuevoProveedor, setShowNuevoProveedor] = useState(false);

  const proveedores = [
    {
      id: 1,
      razon_social: 'Laboratorio Ensayos INTI',
      cuit: '30-54667744-9',
      categoria: 'Laboratorio',
      especialidades: ['Seguridad Eléctrica', 'EMC', 'Telecomunicaciones'],
      calificacion: 5,
      ubicacion: 'Buenos Aires',
      telefono: '011-4724-6200',
      email: 'ensayos@inti.gob.ar',
      web: 'www.inti.gob.ar',
      certificaciones: ['ISO 17025', 'OCP ENACOM'],
      servicios_completados: 45,
      monto_facturado: 4500000,
      estado: 'activo'
    },
    {
      id: 2,
      razon_social: 'Despachos Aduaneros García',
      cuit: '20-28765432-1',
      categoria: 'Despachante',
      especialidades: ['Importación', 'Exportación', 'Tránsito'],
      calificacion: 4,
      ubicacion: 'CABA',
      telefono: '011-4345-6789',
      email: 'info@despachosgarcia.com',
      servicios_completados: 128,
      monto_facturado: 2800000,
      estado: 'activo'
    },
    {
      id: 3,
      razon_social: 'Consultoría Regulatoria Pharma',
      cuit: '30-70123456-7',
      categoria: 'Consultor',
      especialidades: ['ANMAT', 'Productos Médicos', 'Cosméticos'],
      calificacion: 5,
      ubicacion: 'Córdoba',
      telefono: '0351-4567890',
      email: 'contacto@pharmaconsult.com.ar',
      servicios_completados: 22,
      monto_facturado: 1650000,
      estado: 'activo'
    },
    {
      id: 4,
      razon_social: 'Testing Lab International',
      cuit: '30-69876543-2',
      categoria: 'Laboratorio',
      especialidades: ['Alimentos', 'Microbiología', 'Físico-químico'],
      calificacion: 4,
      ubicacion: 'Rosario',
      telefono: '0341-4123456',
      email: 'lab@testinglab.com',
      certificaciones: ['ISO 17025', 'SENASA'],
      servicios_completados: 67,
      monto_facturado: 3200000,
      estado: 'activo'
    }
  ];

  const categorias = [
    { nombre: 'Laboratorio', cantidad: 12 },
    { nombre: 'Despachante', cantidad: 5 },
    { nombre: 'Consultor', cantidad: 8 },
    { nombre: 'Traductor', cantidad: 3 },
    { nombre: 'Legalizaciones', cantidad: 2 }
  ];

  const [nuevoProveedor, setNuevoProveedor] = useState({
    razon_social: '',
    cuit: '',
    categoria: '',
    especialidades: '',
    ubicacion: '',
    telefono: '',
    email: '',
    web: '',
    observaciones: ''
  });

  const handleGuardarProveedor = () => {
    if (!nuevoProveedor.razon_social || !nuevoProveedor.cuit) {
      toast({
        title: "Error",
        description: "Complete los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    // Guardar en localStorage
    const proveedoresGuardados = JSON.parse(localStorage.getItem('sgt_proveedores') || '[]');
    proveedoresGuardados.push({
      id: Date.now(),
      ...nuevoProveedor,
      calificacion: 0,
      servicios_completados: 0,
      monto_facturado: 0,
      estado: 'activo',
      created_at: new Date().toISOString()
    });
    localStorage.setItem('sgt_proveedores', JSON.stringify(proveedoresGuardados));

    toast({
      title: "Proveedor agregado",
      description: nuevoProveedor.razon_social,
      variant: "default"
    });

    setShowNuevoProveedor(false);
    setNuevoProveedor({
      razon_social: '',
      cuit: '',
      categoria: '',
      especialidades: '',
      ubicacion: '',
      telefono: '',
      email: '',
      web: '',
      observaciones: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-gray-600">Gestión de proveedores y subcontratistas</p>
        </div>
        <Button 
          onClick={() => setShowNuevoProveedor(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Proveedores</p>
                <p className="text-2xl font-bold">30</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold">28</p>
              </div>
              <Star className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Servicios Mes</p>
                <p className="text-2xl font-bold">47</p>
              </div>
              <FileText className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Facturado Mes</p>
                <p className="text-2xl font-bold">$1.8M</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categorías */}
      <div className="grid grid-cols-5 gap-2">
        {categorias.map((cat) => (
          <Card key={cat.nombre} className="cursor-pointer hover:border-blue-300">
            <CardContent className="p-4 text-center">
              <p className="font-medium">{cat.nombre}</p>
              <p className="text-2xl font-bold text-blue-600">{cat.cantidad}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista de proveedores */}
      <Card>
        <CardHeader>
          <CardTitle>Proveedores Activos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {proveedores.map((proveedor) => (
              <div key={proveedor.id} className="p-4 border rounded-lg hover:border-blue-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium">{proveedor.razon_social}</h3>
                      <Badge>{proveedor.categoria}</Badge>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < proveedor.calificacion 
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      CUIT: {proveedor.cuit}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {proveedor.especialidades.map((esp) => (
                        <Badge key={esp} variant="secondary" className="text-xs">
                          {esp}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{proveedor.ubicacion}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3" />
                        <span>{proveedor.telefono}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span>{proveedor.email}</span>
                      </div>
                    </div>

                    {proveedor.certificaciones && (
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Certificaciones:</span>
                        {proveedor.certificaciones.map((cert) => (
                          <Badge key={cert} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-500">Servicios</p>
                    <p className="text-xl font-bold">{proveedor.servicios_completados}</p>
                    <p className="text-sm text-gray-500 mt-2">Facturado</p>
                    <p className="font-medium">
                      ${(proveedor.monto_facturado / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal Nuevo Proveedor */}
      {showNuevoProveedor && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Agregar Nuevo Proveedor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Razón Social *
                  </label>
                  <input
                    type="text"
                    value={nuevoProveedor.razon_social}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, razon_social: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    CUIT *
                  </label>
                  <input
                    type="text"
                    value={nuevoProveedor.cuit}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, cuit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Categoría
                  </label>
                  <select
                    value={nuevoProveedor.categoria}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, categoria: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Laboratorio">Laboratorio</option>
                    <option value="Despachante">Despachante</option>
                    <option value="Consultor">Consultor</option>
                    <option value="Traductor">Traductor</option>
                    <option value="Legalizaciones">Legalizaciones</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={nuevoProveedor.ubicacion}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, ubicacion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={nuevoProveedor.telefono}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, telefono: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={nuevoProveedor.email}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Especialidades (separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={nuevoProveedor.especialidades}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, especialidades: e.target.value})}
                    placeholder="Ej: ANMAT, Alimentos, Cosméticos"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    value={nuevoProveedor.observaciones}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, observaciones: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowNuevoProveedor(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleGuardarProveedor}>
                  Guardar Proveedor
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};