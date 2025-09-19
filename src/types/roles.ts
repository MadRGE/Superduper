export interface UserRole {
  id: string;
  nombre: string;
  permisos: string[];
  nivel: number;
}

export const ROLES = {
  ADMIN: {
    id: 'admin',
    nombre: 'Administrador',
    nivel: 0,
    permisos: ['*'] // Acceso total
  },
  GESTOR: {
    id: 'gestor',
    nombre: 'Gestor',
    nivel: 1,
    permisos: [
      'ver_todos_expedientes',
      'crear_expedientes',
      'editar_expedientes',
      'ver_todos_clientes',
      'crear_clientes',
      'editar_clientes',
      'subir_documentos',
      'ver_documentos',
      'gestionar_tareas',
      'ver_reportes',
      'generar_presupuestos',
      'gestionar_facturacion'
    ]
  },
  DESPACHANTE: {
    id: 'despachante',
    nombre: 'Despachante',
    nivel: 2,
    permisos: [
      'ver_clientes_asignados',
      'ver_expedientes_asignados',
      'editar_expedientes_asignados',
      'subir_documentos',
      'ver_documentos',
      'agregar_notas',
      'ver_calendario',
      'gestionar_tareas_propias',
      'ver_reportes_limitados'
    ]
  },
  CLIENTE: {
    id: 'cliente',
    nombre: 'Cliente',
    nivel: 3,
    permisos: [
      'ver_expedientes_propios',
      'ver_documentos_propios',
      'subir_documentos_basicos',
      'ver_estado',
      'ver_notificaciones'
    ]
  },
  COLABORADOR: {
    id: 'colaborador',
    nombre: 'Colaborador',
    nivel: 4,
    permisos: [
      'ver_expedientes_asignados',
      'ejecutar_tareas_asignadas',
      'subir_documentos_tarea'
    ]
  }
};

export type RoleId = keyof typeof ROLES;

export const getRoleById = (roleId: string): UserRole | null => {
  const role = ROLES[roleId.toUpperCase() as RoleId];
  return role || null;
};

export const hasHigherLevel = (userRole: string, targetRole: string): boolean => {
  const user = getRoleById(userRole);
  const target = getRoleById(targetRole);
  
  if (!user || !target) return false;
  
  return user.nivel < target.nivel;
};