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
    canViewReportes,
    canManageUsers,
    canAccessFinancial,
    userRole: usuario?.rol,
    userId: usuario?.id,
    userName: usuario?.nombre
  };
};