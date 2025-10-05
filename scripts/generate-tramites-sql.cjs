// Script para generar SQL de inserción de trámites desde el catálogo

const fs = require('fs');
const path = require('path');

// Importar el catálogo (simulado ya que no podemos usar import en Node sin configuración)
const catalogoText = fs.readFileSync(
  path.join(__dirname, '../src/data/catalogoTramitesCompleto.ts'),
  'utf-8'
);

// Función para generar UUID simulado (para ejemplo)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Mapeo de organismos
const organismos = {
  'ANMAT': { sigla: 'ANMAT', nombre: 'Administración Nacional de Medicamentos, Alimentos y Tecnología Médica' },
  'SENASA': { sigla: 'SENASA', nombre: 'Servicio Nacional de Sanidad y Calidad Agroalimentaria' },
  'ENACOM': { sigla: 'ENACOM', nombre: 'Ente Nacional de Comunicaciones' },
  'ANMaC': { sigla: 'ANMaC', nombre: 'Agencia Nacional de Materiales Controlados' },
  'SEDRONAR': { sigla: 'SEDRONAR', nombre: 'Secretaría de Políticas Integrales sobre Drogas' },
  'SIC': { sigla: 'SIC', nombre: 'Secretaría de Industria y Comercio' },
  'FAUNA': { sigla: 'FAUNA', nombre: 'Dirección Nacional de Fauna y Flora Silvestre' }
};

// Trámites principales del catálogo (versión simplificada)
const tramites = [
  // ANMAT - Alimentos
  {
    codigo: 'RNPA-001',
    nombre: 'Registro Nacional de Producto Alimenticio (RNPA)',
    descripcion: 'Registro de producto alimenticio nacional o importado',
    organismo: 'ANMAT',
    sla_dias: 45,
    vigencia_anos: 5,
    categoria: 'Alimentos'
  },
  {
    codigo: 'RNE-001',
    nombre: 'Registro Nacional de Establecimiento (RNE)',
    descripcion: 'Habilitación de establecimiento elaborador/fraccionador/importador',
    organismo: 'ANMAT',
    sla_dias: 60,
    vigencia_anos: 5,
    categoria: 'Alimentos'
  },
  {
    codigo: 'RNPA-MOD',
    nombre: 'Modificación RNPA',
    descripcion: 'Cambios en fórmula, rótulo o datos del producto',
    organismo: 'ANMAT',
    sla_dias: 30,
    vigencia_anos: null,
    categoria: 'Alimentos'
  },
  {
    codigo: 'RNPA-REN',
    nombre: 'Renovación RNPA',
    descripcion: 'Renovación de registro vencido o próximo a vencer',
    organismo: 'ANMAT',
    sla_dias: 45,
    vigencia_anos: 5,
    categoria: 'Alimentos'
  },

  // ANMAT - Cosméticos
  {
    codigo: 'COS-G1',
    nombre: 'Registro Producto Cosmético Grado I',
    descripcion: 'Productos de riesgo mínimo - Admisión automática',
    organismo: 'ANMAT',
    sla_dias: 15,
    vigencia_anos: 5,
    categoria: 'Cosméticos'
  },
  {
    codigo: 'COS-G2',
    nombre: 'Registro Producto Cosmético Grado II',
    descripcion: 'Productos riesgo moderado - Evaluación completa',
    organismo: 'ANMAT',
    sla_dias: 60,
    vigencia_anos: 5,
    categoria: 'Cosméticos'
  },

  // ANMAT - Dispositivos Médicos
  {
    codigo: 'DM-CLASE-I',
    nombre: 'Registro Dispositivo Médico Clase I',
    descripcion: 'Bajo riesgo - Notificación',
    organismo: 'ANMAT',
    sla_dias: 30,
    vigencia_anos: 5,
    categoria: 'Dispositivos Médicos'
  },
  {
    codigo: 'DM-CLASE-II',
    nombre: 'Registro Dispositivo Médico Clase II',
    descripcion: 'Riesgo moderado - Certificado',
    organismo: 'ANMAT',
    sla_dias: 90,
    vigencia_anos: 5,
    categoria: 'Dispositivos Médicos'
  },

  // SENASA
  {
    codigo: 'RENSPA',
    nombre: 'Registro Nacional Sanitario de Productores Agropecuarios',
    descripcion: 'Inscripción de establecimiento productivo',
    organismo: 'SENASA',
    sla_dias: 30,
    vigencia_anos: null,
    categoria: 'Producción Agropecuaria'
  },
  {
    codigo: 'CUA',
    nombre: 'Certificado Único de Aptitud',
    descripcion: 'Habilitación para exportación de productos',
    organismo: 'SENASA',
    sla_dias: 15,
    vigencia_anos: 1,
    categoria: 'Exportación'
  },
  {
    codigo: 'TRAZABILIDAD',
    nombre: 'Registro de Trazabilidad Animal',
    descripcion: 'Sistema de identificación y seguimiento',
    organismo: 'SENASA',
    sla_dias: 10,
    vigencia_anos: null,
    categoria: 'Trazabilidad'
  },

  // ENACOM
  {
    codigo: 'HOM-RF',
    nombre: 'Homologación de Equipos de RF',
    descripcion: 'Certificación de equipos de radiofrecuencia',
    organismo: 'ENACOM',
    sla_dias: 45,
    vigencia_anos: null,
    categoria: 'Telecomunicaciones'
  },
  {
    codigo: 'LICENCIA-COM',
    nombre: 'Licencia de Servicios de Comunicación',
    descripcion: 'Autorización para operar servicios',
    organismo: 'ENACOM',
    sla_dias: 90,
    vigencia_anos: 15,
    categoria: 'Telecomunicaciones'
  },

  // ANMaC
  {
    codigo: 'CLU',
    nombre: 'Credencial de Legítimo Usuario',
    descripcion: 'Autorización para uso de armas de fuego',
    organismo: 'ANMaC',
    sla_dias: 180,
    vigencia_anos: 5,
    categoria: 'Material Controlado'
  },
  {
    codigo: 'CLUSE',
    nombre: 'Inscripción en CLUSE',
    descripcion: 'Registro de usuarios de material bélico',
    organismo: 'ANMaC',
    sla_dias: 90,
    vigencia_anos: null,
    categoria: 'Material Controlado'
  },

  // SEDRONAR (RENPRE)
  {
    codigo: 'RENPRE-INS',
    nombre: 'Inscripción en RENPRE',
    descripcion: 'Registro de operadores de precursores químicos',
    organismo: 'SEDRONAR',
    sla_dias: 60,
    vigencia_anos: 2,
    categoria: 'Precursores Químicos'
  },
  {
    codigo: 'RENPRE-REN',
    nombre: 'Renovación RENPRE',
    descripcion: 'Actualización de registro',
    organismo: 'SEDRONAR',
    sla_dias: 45,
    vigencia_anos: 2,
    categoria: 'Precursores Químicos'
  },

  // SIC (Lealtad Comercial)
  {
    codigo: 'MAS',
    nombre: 'Marca Argentina de Servicios',
    descripcion: 'Certificación de origen argentino',
    organismo: 'SIC',
    sla_dias: 30,
    vigencia_anos: 2,
    categoria: 'Certificación'
  },

  // FAUNA/CITES
  {
    codigo: 'CITES-EXP',
    nombre: 'Permiso CITES de Exportación',
    descripcion: 'Autorización para exportar especies protegidas',
    organismo: 'FAUNA',
    sla_dias: 30,
    vigencia_anos: null,
    categoria: 'Fauna Silvestre'
  },
  {
    codigo: 'CITES-IMP',
    nombre: 'Permiso CITES de Importación',
    descripcion: 'Autorización para importar especies protegidas',
    organismo: 'FAUNA',
    sla_dias: 30,
    vigencia_anos: null,
    categoria: 'Fauna Silvestre'
  }
];

// Generar SQL
let sql = `/*
  # Catálogo de Trámites - Argentina

  Carga inicial de organismos y tipos de trámites desde el catálogo completo.

  Organismos incluidos:
  - ANMAT (Medicamentos, Alimentos, Cosméticos)
  - SENASA (Sanidad Agropecuaria)
  - ENACOM (Telecomunicaciones)
  - ANMaC (Material Controlado)
  - SEDRONAR (Precursores Químicos)
  - SIC (Lealtad Comercial)
  - FAUNA (Fauna y Flora Silvestre)
*/

-- Insertar Organismos
`;

const organismosInsertados = {};
Object.entries(organismos).forEach(([key, org]) => {
  const id = generateUUID();
  organismosInsertados[org.sigla] = id;
  sql += `INSERT INTO organismos (id, codigo, sigla, nombre, activo, created_at, updated_at)
VALUES ('${id}', '${key}', '${org.sigla}', '${org.nombre}', true, NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;

`;
});

sql += `\n-- Insertar Tipos de Trámites\n`;

tramites.forEach(tramite => {
  const id = generateUUID();
  const organismoId = organismosInsertados[tramite.organismo];
  const vigencia = tramite.vigencia_anos ? tramite.vigencia_anos : 'NULL';

  sql += `INSERT INTO tramite_tipos (id, codigo, nombre, descripcion, organismo_id, sla_dias, vigencia_anos, categoria, activo, created_at, updated_at)
VALUES (
  '${id}',
  '${tramite.codigo}',
  '${tramite.nombre.replace(/'/g, "''")}',
  '${tramite.descripcion.replace(/'/g, "''")}',
  '${organismoId}',
  ${tramite.sla_dias},
  ${vigencia},
  '${tramite.categoria}',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  sla_dias = EXCLUDED.sla_dias,
  vigencia_anos = EXCLUDED.vigencia_anos,
  categoria = EXCLUDED.categoria,
  updated_at = NOW();

`;
});

// Escribir archivo SQL
const outputPath = path.join(__dirname, '../supabase/migrations/20251005_catalogo_tramites.sql');
fs.writeFileSync(outputPath, sql);

console.log(`✅ SQL generado exitosamente en: ${outputPath}`);
console.log(`📊 Total organismos: ${Object.keys(organismos).length}`);
console.log(`📋 Total trámites: ${tramites.length}`);
