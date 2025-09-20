import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Building, User, Mail, Phone } from 'lucide-react';

const mockClientes = [
  {
    id: 1,
    razon_social: 'Lácteos del Sur S.A.',
    cuit: '30-12345678-9',
    email: 'contacto@lacteosdelsur.com.ar',
    telefono: '+54 11 4567-8900',
    contacto_nombre: 'María González',
    expedientes_activos: 3,
    ultimo_tramite: 'RNPA Yogur Natural'
  },
  {
    id: 2,
    razon_social: 'TechCorp Argentina',
    cuit: '30-98765432-1',
    email: 'info@techcorp.com.ar',
    telefono: '+54 11 9876-5432',
    contacto_nombre: 'Carlos Rodríguez',
    expedientes_activos: 1,
    ultimo_tramite: 'Homologación Router WiFi'
  },
  {
    id: 3,
    razon_social: 'BeautyTech Imports',
    cuit: '30-11223344-5',
    email: 'ventas@beautytech.com.ar',
    telefono: '+54 11 2233-4455',
    contacto_nombre: 'Laura Martínez',
    expedientes_activos: 0,
    ultimo_tramite: 'Certificación Plancha'
  },
  {
    id: 4,
    razon_social: 'NutriLife S.A.',
    cuit: '30-55667788-9',
    email: 'contacto@nutrilife.com.ar',
    telefono: '+54 11 5566-7788',
    contacto_nombre: 'Roberto Silva',
    expedientes_activos: 2,
    ultimo_tramite: 'RNPA Cereal Integral'
  },
  {
    id: 5,
    razon_social: 'PetCare Argentina',
    cuit: '30-99887766-3',
    email: 'info@petcare.com.ar',
    telefono: '+54 11 9988-7766',
    contacto_nombre: 'Ana Fernández',
    expedientes_activos: 1,
    ultimo_tramite: 'Registro Pet Food'
  }
];

export const Clientes: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gestión de clientes y contactos</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar clientes por razón social, CUIT o contacto..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Clientes List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Clientes</h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {mockClientes.map((cliente) => (
            <div
              key={cliente.id} 
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{cliente.razon_social}</h3>
                    <p className="text-sm text-gray-500">CUIT: {cliente.cuit}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{cliente.expedientes_activos}</p>
                    <p className="text-sm text-gray-500">Activos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Último trámite:</p>
                    <p className="text-sm text-gray-600">{cliente.ultimo_tramite}</p>
                    <div className="mt-2">
                      <Link 
                        to={`/clientes/${cliente.id}`}
                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Vista 360°
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{cliente.contacto_nombre}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{cliente.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{cliente.telefono}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};