import { useState, useEffect } from 'react';
import { ROLES, getRoleById } from '@/types/roles';
import { useAuth } from './use-auth';

export const usePermissions = () => {
  const { usuario } = useAuth();
  
  const hasPermission = (permission: string): boolean => {
    if (!usuario?.rol) return false;
    
    const role = getRoleById(usuario.rol);
    if (!role) return false;
    
    // Admin tiene acceso a todo
    if (role.permisos.includes('*')) return true;
    
    return role.permisos.includes(permission);
  };
  
  const canViewCliente = (clienteId: string): boolean => {
    if (hasPermission('*')) return true;
    
    if (usuario?.rol === 'despachante') {
      // Verificar si el cliente está asignado al despachante
      const clientesAsignados = usuario.clientes_asignados || [];
      return clientesAsignados.includes(clienteId);
    }
    
    if (usuario?.rol === 'cliente') {
      // Solo puede ver su propia información
      return usuario.cliente_id === clienteId;
    }
    
    return hasPermission('ver_todos_clientes');
  };
  
  const canEditExpediente = (expediente: any): boolean => {
    if (hasPermission('*')) return true;
    
    if (usuario?.rol === 'despachante') {
      // Verificar si el expediente es de un cliente asignado
      return canViewCliente(expediente.cliente_id);
    }
    
    if (usuario?.rol === 'cliente') {
      // Los clientes no pueden editar expedientes
      return false;
    }
    
    return hasPermission('editar_expedientes');
  };

  const canCreateExpediente = (): boolean => {
    return hasPermission('*') || hasPermission('crear_expedientes');
  };

  const canViewCasoLegal = (casoLegal: any): boolean => {
    if (hasPermission('*') || hasPermission('ver_casos_legales')) return true;
    
    if (usuario?.rol === 'despachante') {
      return hasPermission('ver_casos_legales_asignados') && canViewCliente(casoLegal.cliente_id);
    }
    
    if (usuario?.rol === 'cliente') {
      return hasPermission('ver_casos_legales_propios') && casoLegal.cliente_id === usuario.cliente_id;
    }
    
    return false;
  };

  const canCreateCasoLegal = (): boolean => {
    return hasPermission('*') || hasPermission('crear_casos_legales');
  };

  const canEditCasoLegal = (casoLegal: any): boolean => {
    if (hasPermission('*') || hasPermission('editar_casos_legales')) return true;
    
    if (usuario?.rol === 'despachante') {
      return canViewCliente(casoLegal.cliente_id);
    }
    
    return false;
  };
  const canViewReportes = (): boolean => {
    return hasPermission('*') || hasPermission('ver_reportes') || hasPermission('ver_reportes_limitados');
  };

  const canManageUsers = (): boolean => {
    return hasPermission('*');
  };

  const canAccessFinancial = (): boolean => {
    return hasPermission('*') || hasPermission('gestionar_facturacion');
  };
  
  return {
    hasPermission,
    canViewCliente,
    canEditExpediente,
    canCreateExpediente,
    canViewCasoLegal,
    canCreateCasoLegal,
    canEditCasoLegal,
    canViewReportes,
    canManageUsers,
    canAccessFinancial,
    userRole: usuario?.rol,
    userId: usuario?.id,
    userName: usuario?.nombre
  };
};