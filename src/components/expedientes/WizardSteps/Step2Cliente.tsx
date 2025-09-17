import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Building, Mail, Phone, Check } from 'lucide-react';
import { useSGT } from '../../../context/SGTContext';
import { Cliente } from '../../../types/database';

interface Step2ClienteProps {
  selectedClienteId: string;
  alias: string;
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  despachante_id?: string;
  observaciones?: string;
  onUpdate: (data: {
    cliente_id: string;
    alias: string;
    prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
    despachante_id?: string;
    observaciones?: string;
  }) => void;
}

interface NuevoClienteData {
  razon_social: string;
  cuit: string;
  email: string;
  telefono: string;
  contacto_nombre: string;
  contacto_email: string;
  contacto_telefono: string;
  direccion: string;
}

export const Step2Cliente: React.FC<Step2ClienteProps> = ({
  selectedClienteId,
  alias,
  prioridad,
  despachante_id,
  observaciones,
  onUpdate
}) => {
  const { state, addCliente } = useSGT();
  const [modo, setModo] = useState<'existente' | 'nuevo'>('existente');
  const [searchTerm, setSearchTerm] = useState('');
  const [nuevoCliente, setNuevoCliente] = useState<NuevoClienteData>({
    razon_social: '',
    cuit: '',
    email: '',
    telefono: '',
    contacto_nombre: '',
    contacto_email: '',
    contacto_telefono: '',
    direccion: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filtrar clientes existentes
  const filteredClientes = state.clientes.filter(cliente =>
    !searchTerm ||
    cliente.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cuit.includes(searchTerm) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Validar CUIT
  const validarCUIT = (cuit: string): boolean => {
    const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
    return cuitRegex.test(cuit);
  };

  // Validar email
  const validarEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Manejar selección de cliente existente
  const handleSelectCliente = (clienteId: string) => {
    onUpdate({
      cliente_id: clienteId,
      alias,
      prioridad,
      despachante_id,
      observaciones
    });
  };

  // Manejar cambios en datos del expediente
  const handleExpedienteDataChange = (field: string, value: any) => {
    onUpdate({
      cliente_id: selectedClienteId,
      alias: field === 'alias' ? value : alias,
      prioridad: field === 'prioridad' ? value : prioridad,
      despachante_id: field === 'despachante_id' ? value : despachante_id,
      observaciones: field === 'observaciones' ? value : observaciones
    });
  };

  // Manejar cambios en nuevo cliente
  const handleNuevoClienteChange = (field: keyof NuevoClienteData, value: string) => {
    setNuevoCliente(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Crear nuevo cliente
  const handleCrearCliente = () => {
    const newErrors: Record<string, string> = {};

    // Validaciones
    if (!nuevoCliente.razon_social.trim()) {
      newErrors.razon_social = 'La razón social es obligatoria';
    }

    if (!nuevoCliente.cuit.trim()) {
      newErrors.cuit = 'El CUIT es obligatorio';
    } else if (!validarCUIT(nuevoCliente.cuit)) {
      newErrors.cuit = 'Formato de CUIT inválido (XX-XXXXXXXX-X)';
    }

    if (!nuevoCliente.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!validarEmail(nuevoCliente.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    // Verificar CUIT duplicado
    const cuitExiste = state.clientes.some(cliente => cliente.cuit === nuevoCliente.cuit);
    if (cuitExiste) {
      newErrors.cuit = 'Ya existe un cliente con este CUIT';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Crear cliente
      const cliente: Cliente = {
        id: crypto.randomUUID(),
        razon_social: nuevoCliente.razon_social.trim(),
        cuit: nuevoCliente.cuit.trim(),
        email: nuevoCliente.email.trim(),
        telefono: nuevoCliente.telefono.trim() || undefined,
        direccion: nuevoCliente.direccion.trim() || undefined,
        contacto_nombre: nuevoCliente.contacto_nombre.trim() || undefined,
        contacto_email: nuevoCliente.contacto_email.trim() || undefined,
        contacto_telefono: nuevoCliente.contacto_telefono.trim() || undefined,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      addCliente(cliente);
      
      // Seleccionar el cliente recién creado
      onUpdate({
        cliente_id: cliente.id,
        alias,
        prioridad,
        despachante_id,
        observaciones
      });

      // Cambiar a modo existente
      setModo('existente');
      
      // Limpiar formulario
      setNuevoCliente({
        razon_social: '',
        cuit: '',
        email: '',
        telefono: '',
        contacto_nombre: '',
        contacto_email: '',
        contacto_telefono: '',
        direccion: ''
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Datos del Cliente y Expediente
        </h2>
        <p className="text-gray-600">
          Selecciona un cliente existente o crea uno nuevo, y completa los datos del expediente.
        </p>
      </div>

      {/* Selector de modo */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setModo('existente')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            modo === 'existente'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Cliente Existente
        </button>
        <button
          onClick={() => setModo('nuevo')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            modo === 'nuevo'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Nuevo Cliente
        </button>
      </div>

      {/* Cliente existente */}
      {modo === 'existente' && (
        <div className="space-y-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por razón social, CUIT o email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Lista de clientes */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredClientes.map((cliente) => (
              <div
                key={cliente.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-sm ${
                  selectedClienteId === cliente.id
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSelectCliente(cliente.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{cliente.razon_social}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>CUIT: {cliente.cuit}</span>
                        <span>•</span>
                        <span>{cliente.email}</span>
                      </div>
                    </div>
                  </div>
                  {selectedClienteId === cliente.id && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredClientes.length === 0 && (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron clientes
              </h3>
              <p className="text-gray-500 mb-4">
                Intenta ajustar la búsqueda o crea un nuevo cliente
              </p>
              <button
                onClick={() => setModo('nuevo')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Nuevo Cliente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Nuevo cliente */}
      {modo === 'nuevo' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razón Social *
              </label>
              <input
                type="text"
                value={nuevoCliente.razon_social}
                onChange={(e) => handleNuevoClienteChange('razon_social', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.razon_social ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nombre de la empresa"
              />
              {errors.razon_social && (
                <p className="text-red-600 text-sm mt-1">{errors.razon_social}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CUIT *
              </label>
              <input
                type="text"
                value={nuevoCliente.cuit}
                onChange={(e) => handleNuevoClienteChange('cuit', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.cuit ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="30-12345678-9"
              />
              {errors.cuit && (
                <p className="text-red-600 text-sm mt-1">{errors.cuit}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={nuevoCliente.email}
                onChange={(e) => handleNuevoClienteChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="contacto@empresa.com"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={nuevoCliente.telefono}
                onChange={(e) => handleNuevoClienteChange('telefono', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+54 11 1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Contacto
              </label>
              <input
                type="text"
                value={nuevoCliente.contacto_nombre}
                onChange={(e) => handleNuevoClienteChange('contacto_nombre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email del Contacto
              </label>
              <input
                type="email"
                value={nuevoCliente.contacto_email}
                onChange={(e) => handleNuevoClienteChange('contacto_email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="juan.perez@empresa.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <textarea
              value={nuevoCliente.direccion}
              onChange={(e) => handleNuevoClienteChange('direccion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Dirección completa de la empresa"
            />
          </div>

          <button
            onClick={handleCrearCliente}
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Cliente
          </button>
        </div>
      )}

      {/* Datos del expediente */}
      {selectedClienteId && (
        <div className="border-t pt-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Datos del Expediente</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alias del Expediente *
              </label>
              <input
                type="text"
                value={alias}
                onChange={(e) => handleExpedienteDataChange('alias', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre descriptivo del expediente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad
              </label>
              <select
                value={prioridad}
                onChange={(e) => handleExpedienteDataChange('prioridad', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="baja">Baja</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              value={observaciones || ''}
              onChange={(e) => handleExpedienteDataChange('observaciones', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Observaciones adicionales sobre el expediente"
            />
          </div>
        </div>
      )}
    </div>
  );
};