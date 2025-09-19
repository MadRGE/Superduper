export const catalogoTramitesArgentina = {
  // ============= ANMAT/INAL - ALIMENTOS =============
  'ANMAT_INAL': {
    organismo: 'ANMAT/INAL',
    sigla: 'ANMAT',
    tramites: [
      {
        id: 'TT-ANMAT-RNPA-001',
        codigo: 'RNPA-001',
        nombre: 'Registro Nacional de Producto Alimenticio (RNPA)',
        descripcion: 'Registro de producto alimenticio nacional o importado',
        sla_dias: 45,
        vigencia_anos: 5,
        sistema: 'SIFeGA',
        documentacion_obligatoria: [
          { documento: 'Certificado RNE vigente del establecimiento', formato: 'PDF', vigencia_maxima: '5 años' },
          { documento: 'Composición cuali-cuantitativa completa', formato: 'PDF/Excel', detalle: 'Con porcentajes exactos' },
          { documento: 'Técnicas de elaboración detalladas', formato: 'PDF', detalle: 'Paso a paso del proceso' },
          { documento: 'Proyecto de rótulo CAA', formato: 'PDF/JPG', detalle: 'Según Capítulo V CAA' },
          { documento: 'Declaración Jurada ingredientes', formato: 'PDF', firma: 'Director Técnico' }
        ],
        documentacion_opcional: [
          { documento: 'Certificado libre de gluten', formato: 'PDF', cuando: 'Productos sin TACC' },
          { documento: 'Certificación orgánica SENASA', formato: 'PDF', cuando: 'Productos orgánicos' },
          { documento: 'Análisis microbiológico', formato: 'PDF', cuando: 'Según categoría' },
          { documento: 'Análisis fisicoquímico', formato: 'PDF', cuando: 'Según producto' }
        ],
        arancel: 'Código 0011 - Sistema Pago Electrónico ANMAT'
      },
      {
        id: 'TT-ANMAT-RNE-001',
        codigo: 'RNE-001',
        nombre: 'Registro Nacional de Establecimiento (RNE)',
        descripcion: 'Habilitación de establecimiento elaborador/fraccionador/importador',
        sla_dias: 60,
        vigencia_anos: 5,
        sistema: 'SIFeGA',
        documentacion_obligatoria: [
          { documento: 'Nota solicitud con DDJJ', formato: 'PDF', firma: 'Titular/Apoderado' },
          { documento: 'Plano esquemático del establecimiento', formato: 'PDF/DWG', detalle: 'Escala 1:100' },
          { documento: 'Memoria descriptiva detallada', formato: 'PDF', incluye: 'Equipos, procesos, capacidad' },
          { documento: 'Habilitación municipal/provincial', formato: 'PDF', vigencia: 'Vigente' },
          { documento: 'Título y matrícula Director Técnico', formato: 'PDF', detalle: 'Certificado por colegio' },
          { documento: 'Constancia CUIT', formato: 'PDF', fuente: 'AFIP' },
          { documento: 'Georreferenciación', formato: 'KML/KMZ', detalle: 'Coordenadas GPS' }
        ],
        documentacion_opcional: [
          { documento: 'Manual BPM', formato: 'PDF', cuando: 'Exportadores' },
          { documento: 'Certificación HACCP', formato: 'PDF', cuando: 'Productos críticos' },
          { documento: 'Habilitación SENASA', formato: 'PDF', cuando: 'Productos cárnicos/lácteos' }
        ],
        arancel: 'Variable según categoría'
      },
      {
        id: 'TT-ANMAT-RNPA-MOD',
        codigo: 'RNPA-MOD',
        nombre: 'Modificación RNPA',
        descripcion: 'Cambios en fórmula, rótulo o datos del producto',
        sla_dias: 30,
        vigencia_anos: 'Mantiene original',
        sistema: 'SIFeGA',
        documentacion_obligatoria: [
          { documento: 'Certificado RNPA original', formato: 'PDF' },
          { documento: 'Detalle de modificaciones', formato: 'PDF', firma: 'Director Técnico' },
          { documento: 'Nueva documentación según cambio', formato: 'Varios' }
        ]
      }
    ]
  },

  // ============= ANMAT - COSMÉTICOS =============
  'ANMAT_COSMETICOS': {
    organismo: 'ANMAT',
    sigla: 'ANMAT',
    tramites: [
      {
        id: 'TT-ANMAT-COS-G1',
        codigo: 'COS-G1',
        nombre: 'Registro Producto Cosmético Grado I',
        descripcion: 'Productos de riesgo mínimo - Admisión automática',
        sla_dias: 15,
        vigencia_anos: 5,
        sistema: 'Sistema Cosméticos ANMAT',
        documentacion_obligatoria: [
          { documento: 'Formulario R-155', formato: 'PDF', firma: 'Digital ANMAT o certificada' },
          { documento: 'Fórmula cualicuantitativa', formato: 'PDF', detalle: 'INCI nomenclature' },
          { documento: 'Arte de envase y rótulos', formato: 'PDF/JPG', resolucion: '300 DPI mínimo' },
          { documento: 'Certificado establecimiento', formato: 'PDF', vigencia: 'Vigente' },
          { documento: 'Comprobante pago arancel', formato: 'PDF', monto: '$3.544.200 (importador)' }
        ],
        documentacion_opcional: [
          { documento: 'Certificado venta libre origen', formato: 'PDF', cuando: 'Importados' },
          { documento: 'Test de estabilidad', formato: 'PDF', cuando: 'Fórmulas innovadoras' },
          { documento: 'Contrato tercerización', formato: 'PDF', cuando: 'Elaboración terceros' }
        ],
        arancel: 'Disposición 11421/2024'
      },
      {
        id: 'TT-ANMAT-COS-G2',
        codigo: 'COS-G2',
        nombre: 'Registro Producto Cosmético Grado II',
        descripcion: 'Productos con ingredientes especiales o claims específicos',
        sla_dias: 45,
        vigencia_anos: 5,
        sistema: 'TAD',
        documentacion_obligatoria: [
          { documento: 'Toda documentación Grado I', formato: 'Varios' },
          { documento: 'Estudios de seguridad', formato: 'PDF', detalle: 'Irritación, sensibilización' },
          { documento: 'Comprobación de eficacia', formato: 'PDF', cuando: 'Claims cosméticos' },
          { documento: 'Información toxicológica', formato: 'PDF', detalle: 'Por ingrediente activo' },
          { documento: 'Restricciones de uso', formato: 'PDF' }
        ]
      }
    ]
  },

  // ============= ANMAT - PRODUCTOS MÉDICOS =============
  'ANMAT_MEDICOS': {
    organismo: 'ANMAT',
    sigla: 'ANMAT',
    tramites: [
      {
        id: 'TT-ANMAT-PM-CI',
        codigo: 'PM-CI',
        nombre: 'Registro Producto Médico Clase I',
        descripcion: 'Riesgo bajo - Declaración Jurada',
        sla_dias: 15,
        vigencia_anos: 5,
        sistema: 'Sistema Helena',
        documentacion_obligatoria: [
          { documento: 'Declaración Jurada Conformidad', formato: 'PDF', responsable: 'INPM' },
          { documento: 'Descripción del producto', formato: 'PDF' },
          { documento: 'Indicaciones de uso', formato: 'PDF' },
          { documento: 'Instrucciones de uso', formato: 'PDF', idioma: 'Español' },
          { documento: 'Proyecto de rótulo', formato: 'PDF' }
        ],
        arancel: '$282.700'
      },
      {
        id: 'TT-ANMAT-PM-CIII',
        codigo: 'PM-CIII',
        nombre: 'Registro Producto Médico Clase III',
        descripcion: 'Riesgo moderado-alto',
        sla_dias: 75,
        vigencia_anos: 5,
        sistema: 'Sistema Helena',
        documentacion_obligatoria: [
          { documento: 'Expediente técnico completo', formato: 'PDF' },
          { documento: 'Estudios preclínicos', formato: 'PDF', cuando: 'Innovadores' },
          { documento: 'Estudios clínicos', formato: 'PDF', detalle: 'Según complejidad' },
          { documento: 'Análisis de riesgo ISO 14971', formato: 'PDF' },
          { documento: 'Certificado CE o FDA', formato: 'PDF', cuando: 'Importados' },
          { documento: 'Manual técnico completo', formato: 'PDF' }
        ],
        arancel: '$3.923.300'
      }
    ]
  },

  // ============= SENASA =============
  'SENASA': {
    organismo: 'SENASA',
    sigla: 'SENASA',
    tramites: [
      {
        id: 'TT-SENASA-PV-001',
        codigo: 'PV-001',
        nombre: 'Registro Producto Veterinario',
        descripcion: 'Medicamentos y productos de uso veterinario',
        sla_dias: 180,
        vigencia_anos: 10,
        sistema: 'SIGTRÁMITES',
        documentacion_obligatoria: [
          { documento: 'Formulario de solicitud', formato: 'PDF', sistema: 'SIGTRÁMITES' },
          { documento: 'Fórmula cuali-cuantitativa', formato: 'PDF' },
          { documento: 'Método de elaboración', formato: 'PDF' },
          { documento: 'Estudios de estabilidad', formato: 'PDF', duracion: '2 años mínimo' },
          { documento: 'Estudios de eficacia', formato: 'PDF', cuando: 'Productos innovadores' },
          { documento: 'Proyecto de marbete', formato: 'PDF' }
        ],
        documentacion_opcional: [
          { documento: 'Certificado GMP', formato: 'PDF', cuando: 'Importados' },
          { documento: 'Estudios de bioequivalencia', formato: 'PDF', cuando: 'Genéricos' }
        ],
        arancel: 'Según categoría - Res. 11/2025'
      },
      {
        id: 'TT-SENASA-FIT-001',
        codigo: 'FIT-001',
        nombre: 'Registro Producto Fitosanitario',
        descripcion: 'Agroquímicos y productos fitosanitarios',
        sla_dias: 'Variable',
        vigencia_anos: 'Indefinido',
        sistema: 'SIGTRÁMITES',
        documentacion_obligatoria: [
          { documento: 'Declaración Jurada composición', formato: 'PDF' },
          { documento: 'Certificado de análisis', formato: 'PDF' },
          { documento: 'Estudios toxicológicos', formato: 'PDF', detalle: 'Aguda, crónica, eco-tox' },
          { documento: 'Estudios de residuos', formato: 'PDF', cuando: 'Uso en cultivos' },
          { documento: 'Estudios de eficacia agronómica', formato: 'PDF', detalle: '2 campañas mínimo' }
        ]
      }
    ]
  },

  // ============= ENACOM =============
  'ENACOM': {
    organismo: 'ENACOM',
    sigla: 'ENACOM',
    tramites: [
      {
        id: 'TT-ENACOM-HOM-001',
        codigo: 'HOM-001',
        nombre: 'Homologación Equipo Telecomunicaciones',
        descripcion: 'Certificación para comercialización de equipos',
        sla_dias: 60,
        vigencia_anos: 3,
        sistema: 'GDE',
        documentacion_obligatoria: [
          { documento: 'Inscripción RAMATEL', formato: 'PDF' },
          { documento: 'Manual técnico', formato: 'PDF', idioma: 'Español' },
          { documento: 'Esquema circuital', formato: 'PDF' },
          { documento: 'Informe SAR', formato: 'PDF', cuando: 'Equipos con antena' },
          { documento: 'Ensayos EMC', formato: 'PDF', lab: 'OCP reconocido' },
          { documento: 'Declaración de conformidad', formato: 'PDF' },
          { documento: 'Fotos del equipo', formato: 'JPG', cantidad: '6 vistas' }
        ],
        arancel: '5 UTR ($4.815)'
      }
    ]
  },

  // ============= ANMaC =============
  'ANMAC': {
    organismo: 'ANMaC',
    sigla: 'ANMAC',
    tramites: [
      {
        id: 'TT-ANMAC-IMP-001',
        codigo: 'IMP-ARM',
        nombre: 'Importación de Armas',
        descripcion: 'Autorización importación armas de fuego',
        sla_dias: 45,
        vigencia_anos: 'Por operación',
        sistema: 'SIGIMAC',
        documentacion_obligatoria: [
          { documento: 'CLUSE vigente', formato: 'PDF' },
          { documento: 'Factura proforma', formato: 'PDF' },
          { documento: 'Catálogo técnico', formato: 'PDF' },
          { documento: 'Certificado origen', formato: 'PDF' },
          { documento: 'Seguro responsabilidad civil', formato: 'PDF' },
          { documento: 'Constancia CUIT', formato: 'PDF' }
        ]
      }
    ]
  },

  // ============= RENPRE =============
  'RENPRE': {
    organismo: 'SEDRONAR',
    sigla: 'RENPRE',
    tramites: [
      {
        id: 'TT-RENPRE-INS-001',
        codigo: 'RENPRE-INS',
        nombre: 'Inscripción RENPRE',
        descripcion: 'Registro operadores precursores químicos',
        sla_dias: 30,
        vigencia_anos: 1,
        sistema: 'TAD',
        documentacion_obligatoria: [
          { documento: 'Formulario inscripción', formato: 'PDF' },
          { documento: 'Estatuto societario', formato: 'PDF' },
          { documento: 'Acta designación autoridades', formato: 'PDF' },
          { documento: 'Habilitación municipal', formato: 'PDF' },
          { documento: 'Plano del establecimiento', formato: 'PDF' },
          { documento: 'Listado sustancias a operar', formato: 'Excel' }
        ],
        arancel: '$104.000'
      }
    ]
  },

  // ============= SIC - SEGURIDAD DE PRODUCTOS =============
  'SIC': {
    organismo: 'SIC',
    sigla: 'SIC',
    tramites: [
      {
        id: 'TT-SIC-SEG-001',
        codigo: 'SEG-ELEC',
        nombre: 'Certificación Seguridad Eléctrica',
        descripcion: 'Productos eléctricos de baja tensión',
        sla_dias: 35,
        vigencia_anos: 3,
        sistema: 'TAD',
        documentacion_obligatoria: [
          { documento: 'Certificado de conformidad', formato: 'PDF', lab: 'OCP acreditado' },
          { documento: 'Manual de instrucciones', formato: 'PDF', idioma: 'Español' },
          { documento: 'Esquema eléctrico', formato: 'PDF' },
          { documento: 'Fotos del producto', formato: 'JPG', detalle: 'Producto y marcado CE' },
          { documento: 'Declaración de conformidad', formato: 'PDF', firma: 'Fabricante' }
        ],
        arancel: 'Según Resolución SIC'
      }
    ]
  },

  // ============= FAUNA/CITES =============
  'FAUNA_CITES': {
    organismo: 'Dirección Nacional de Biodiversidad',
    sigla: 'FAUNA',
    tramites: [
      {
        id: 'TT-FAUNA-CITES-001',
        codigo: 'CITES-IMP',
        nombre: 'Permiso CITES Importación',
        descripcion: 'Importación de especies CITES',
        sla_dias: 30,
        vigencia_anos: 'Por operación',
        sistema: 'TAD',
        documentacion_obligatoria: [
          { documento: 'Permiso CITES país origen', formato: 'PDF' },
          { documento: 'Factura comercial', formato: 'PDF' },
          { documento: 'Certificado sanitario', formato: 'PDF', cuando: 'Fauna viva' },
          { documento: 'Autorización provincial', formato: 'PDF' },
          { documento: 'Declaración destino final', formato: 'PDF' }
        ]
      },
      {
        id: 'TT-FAUNA-CITES-002',
        codigo: 'CITES-EXP',
        nombre: 'Permiso CITES Exportación',
        descripcion: 'Exportación de especies nativas',
        sla_dias: 45,
        vigencia_anos: 'Por operación',
        sistema: 'TAD',
        documentacion_obligatoria: [
          { documento: 'Autorización provincial extracción', formato: 'PDF' },
          { documento: 'Plan de manejo', formato: 'PDF', cuando: 'Especies comerciales' },
          { documento: 'Certificado origen legal', formato: 'PDF' },
          { documento: 'Autorización CITES destino', formato: 'PDF' }
        ]
      }
    ]
  }
};

// Función para buscar trámite por ID
export const buscarTramitePorId = (tramiteId: string) => {
  for (const org of Object.values(catalogoTramitesArgentina)) {
    const tramite = org.tramites.find(t => t.id === tramiteId);
    if (tramite) return tramite;
  }
  return null;
};

// Función para buscar trámite por código
export const buscarTramitePorCodigo = (codigo: string) => {
  for (const org of Object.values(catalogoTramitesArgentina)) {
    const tramite = org.tramites.find(t => t.codigo === codigo);
    if (tramite) return tramite;
  }
  return null;
};

// Función para obtener todos los trámites de un organismo
export const obtenerTramitesPorOrganismo = (sigla: string) => {
  for (const org of Object.values(catalogoTramitesArgentina)) {
    if (org.sigla === sigla) {
      return org.tramites;
    }
  }
  return [];
};

// Función para obtener todos los organismos
export const obtenerOrganismos = () => {
  return Object.values(catalogoTramitesArgentina).map(org => ({
    sigla: org.sigla,
    nombre: org.organismo
  }));
};