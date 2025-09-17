export const mockOrganismos = [
  {
    id: "ORG-ANMAT-INAL",
    sigla: "ANMAT/INAL",
    nombre: "Administración Nacional de Medicamentos, Alimentos y Tecnología Médica - Instituto Nacional de Alimentos",
    jurisdiccion: "Nacional",
    canal: "SIFeGA"
  },
  {
    id: "ORG-ENACOM",
    sigla: "ENACOM",
    nombre: "Ente Nacional de Comunicaciones",
    jurisdiccion: "Nacional",
    canal: "RAMATEL"
  },
  {
    id: "ORG-SIC",
    sigla: "SIC",
    nombre: "Secretaría de Industria y Comercio",
    jurisdiccion: "Nacional",
    canal: "TAD"
  },
  {
    id: "ORG-SENASA",
    sigla: "SENASA",
    nombre: "Servicio Nacional de Sanidad y Calidad Agroalimentaria",
    jurisdiccion: "Nacional",
    canal: "SIGSA"
  }
];

export const mockTramiteTipos = [
  {
    id: "TT-INAL-002",
    codigo: "RNPA",
    nombre: "Registro Nacional de Producto Alimenticio",
    organismo_id: "ORG-ANMAT-INAL",
    rubro: "Alimentos",
    alcance: "Producto alimenticio envasado (por SKU)",
    sla_total_dias: 45,
    tags: ["CAA", "SIFeGA", "alimentos", "producto"]
  },
  {
    id: "TT-ENACOM-001",
    codigo: "HOMOLOG-ENACOM",
    nombre: "Homologación de Equipos de Telecomunicaciones",
    organismo_id: "ORG-ENACOM",
    rubro: "Telecomunicaciones",
    alcance: "Equipos con radiofrecuencia",
    sla_total_dias: 45,
    tags: ["telecomunicaciones", "RAMATEL", "radio"]
  },
  {
    id: "TT-SIC-001",
    codigo: "SEG-ELECTRICA",
    nombre: "Certificación Seguridad Eléctrica BT",
    organismo_id: "ORG-SIC",
    rubro: "Seguridad de Productos",
    alcance: "Productos eléctricos de baja tensión",
    sla_total_dias: 35,
    tags: ["seguridad", "electrico", "BT"]
  }
];

export const mockExpedientes = [
  {
    id: "exp-001",
    codigo: "SGT-2025-ANMAT-00123",
    alias: "RNPA Yogur Natural - Lácteos del Sur",
    tramite_tipo_id: "TT-INAL-002",
    tramite_nombre: "Registro Nacional de Producto Alimenticio",
    organismo: "ANMAT/INAL",
    cliente_nombre: "Lácteos del Sur S.A.",
    estado: "en_proceso",
    prioridad: "normal",
    fecha_inicio: "2025-01-15",
    fecha_limite: "2025-03-01",
    paso_actual: 4,
    total_pasos: 8,
    dias_restantes: 12,
    progreso: 50,
    semaforo: "verde",
    observaciones: "",
    documentos_pendientes: 2,
    notificaciones_pendientes: 0
  },
  {
    id: "exp-002",
    codigo: "SGT-2025-ENACOM-00087",
    alias: "Homologación Router WiFi 6 - TechCorp",
    tramite_tipo_id: "TT-ENACOM-001",
    tramite_nombre: "Homologación de Equipos de Telecomunicaciones",
    organismo: "ENACOM",
    cliente_nombre: "TechCorp Argentina",
    estado: "observado",
    prioridad: "alta",
    fecha_inicio: "2025-01-08",
    fecha_limite: "2025-02-22",
    paso_actual: 6,
    total_pasos: 7,
    dias_restantes: 8,
    progreso: 85,
    semaforo: "amarillo",
    observaciones: "Documentación técnica incompleta",
    documentos_pendientes: 1,
    notificaciones_pendientes: 1
  },
  {
    id: "exp-003",
    codigo: "SGT-2025-SIC-00156",
    alias: "Certificación Plancha de Pelo - BeautyTech",
    tramite_tipo_id: "TT-SIC-001",
    tramite_nombre: "Certificación Seguridad Eléctrica BT",
    organismo: "SIC",
    cliente_nombre: "BeautyTech Imports",
    estado: "completado",
    prioridad: "normal",
    fecha_inicio: "2024-12-01",
    fecha_limite: "2025-01-05",
    paso_actual: 5,
    total_pasos: 5,
    dias_restantes: 0,
    progreso: 100,
    semaforo: "verde",
    observaciones: "",
    documentos_pendientes: 0,
    notificaciones_pendientes: 0
  },
  {
    id: "exp-004",
    codigo: "SGT-2025-ANMAT-00134",
    alias: "RNPA Cereal Integral - NutriLife",
    tramite_tipo_id: "TT-INAL-002",
    tramite_nombre: "Registro Nacional de Producto Alimenticio",
    organismo: "ANMAT/INAL",
    cliente_nombre: "NutriLife S.A.",
    estado: "iniciado",
    prioridad: "urgente",
    fecha_inicio: "2025-01-20",
    fecha_limite: "2025-03-06",
    paso_actual: 1,
    total_pasos: 8,
    dias_restantes: 45,
    progreso: 12,
    semaforo: "verde",
    observaciones: "",
    documentos_pendientes: 4,
    notificaciones_pendientes: 0
  },
  {
    id: "exp-005",
    codigo: "SGT-2025-SENASA-00089",
    alias: "Registro Pet Food Premium - PetCare",
    tramite_tipo_id: "TT-SENASA-001",
    tramite_nombre: "Registro Alimentos para Animales",
    organismo: "SENASA",
    cliente_nombre: "PetCare Argentina",
    estado: "vencido",
    prioridad: "alta",
    fecha_inicio: "2024-11-15",
    fecha_limite: "2025-01-10",
    paso_actual: 3,
    total_pasos: 6,
    dias_restantes: -15,
    progreso: 40,
    semaforo: "rojo",
    observaciones: "Falta respuesta del cliente",
    documentos_pendientes: 3,
    notificaciones_pendientes: 2
  }
];