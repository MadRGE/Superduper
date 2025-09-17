export interface ChecklistItem {
  item: string;
  obligatorio: boolean;
  tipo: 'pdf' | 'imagen' | 'excel' | 'word';
  descripcion?: string;
}

export const checklistsPorTramite: Record<string, ChecklistItem[]> = {
  'TT-INAL-002': [ // RNPA
    { item: 'Certificado RNE vigente', obligatorio: true, tipo: 'pdf', descripcion: 'Registro Nacional de Establecimientos actualizado' },
    { item: 'Fórmula cualicuantitativa', obligatorio: true, tipo: 'pdf', descripcion: 'Composición detallada del producto' },
    { item: 'Proyecto de rótulo', obligatorio: true, tipo: 'pdf', descripcion: 'Diseño del etiquetado según CAA' },
    { item: 'Análisis de laboratorio', obligatorio: false, tipo: 'pdf', descripcion: 'Análisis fisicoquímico y microbiológico' },
    { item: 'Certificado de libre venta', obligatorio: false, tipo: 'pdf', descripcion: 'Si es producto importado' }
  ],
  'TT-ENACOM-001': [ // ENACOM
    { item: 'Manual técnico', obligatorio: true, tipo: 'pdf', descripcion: 'Manual de usuario en español' },
    { item: 'Esquema circuital', obligatorio: true, tipo: 'pdf', descripcion: 'Diagrama de bloques del equipo' },
    { item: 'Fotos del equipo', obligatorio: true, tipo: 'imagen', descripcion: 'Imágenes del producto y etiquetas' },
    { item: 'Certificado de conformidad', obligatorio: true, tipo: 'pdf', descripcion: 'Ensayos de laboratorio acreditado' },
    { item: 'Declaración jurada', obligatorio: true, tipo: 'pdf', descripcion: 'Cumplimiento normativa técnica' }
  ],
  'TT-SIC-001': [ // Seguridad Eléctrica
    { item: 'Certificado de conformidad', obligatorio: true, tipo: 'pdf', descripcion: 'Ensayos según normas IRAM' },
    { item: 'Manual de instrucciones', obligatorio: true, tipo: 'pdf', descripcion: 'Manual en español' },
    { item: 'Esquema eléctrico', obligatorio: true, tipo: 'pdf', descripcion: 'Diagrama del circuito' },
    { item: 'Fotos del producto', obligatorio: true, tipo: 'imagen', descripcion: 'Producto y marcado CE' },
    { item: 'Declaración de conformidad', obligatorio: true, tipo: 'pdf', descripcion: 'Declaración del fabricante' }
  ],
  'TT-FAUNA-004': [ // CITES Trofeo
    { item: 'Permiso caza país origen', obligatorio: true, tipo: 'pdf', descripcion: 'Autorización de caza legal' },
    { item: 'CITES exportación', obligatorio: true, tipo: 'pdf', descripcion: 'Permiso CITES del país de origen' },
    { item: 'Fotos del trofeo', obligatorio: true, tipo: 'imagen', descripcion: 'Imágenes detalladas del espécimen' },
    { item: 'Identificación especie', obligatorio: true, tipo: 'pdf', descripcion: 'Certificado taxonómico' },
    { item: 'Factura de compra', obligatorio: false, tipo: 'pdf', descripcion: 'Comprobante de adquisición legal' }
  ],
  'TT-RENPRE-001': [ // RENPRE
    { item: 'Estatuto societario', obligatorio: true, tipo: 'pdf', descripcion: 'Estatuto vigente de la empresa' },
    { item: 'Acta designación', obligatorio: true, tipo: 'pdf', descripcion: 'Designación de representantes' },
    { item: 'Habilitación municipal', obligatorio: true, tipo: 'pdf', descripcion: 'Habilitación comercial vigente' },
    { item: 'Listado sustancias', obligatorio: true, tipo: 'excel', descripcion: 'Planilla de sustancias a manejar' },
    { item: 'Plano del establecimiento', obligatorio: true, tipo: 'pdf', descripcion: 'Layout de instalaciones' }
  ],
  'TT-ANMAC-004': [ // ANMaC
    { item: 'LUC vigente', obligatorio: true, tipo: 'pdf', descripcion: 'Licencia de Usuario de Armas vigente' },
    { item: 'Registro importador', obligatorio: true, tipo: 'pdf', descripción: 'Registro como importador ANMaC' },
    { item: 'Factura proforma', obligatorio: true, tipo: 'pdf', descripcion: 'Factura del proveedor exterior' },
    { item: 'Catálogo técnico', obligatorio: true, tipo: 'pdf', descripcion: 'Especificaciones técnicas del producto' },
    { item: 'Certificado origen', obligatorio: true, tipo: 'pdf', descripcion: 'Certificado del país fabricante' }
  ]
};

export const getChecklistByTramiteId = (tramiteId: string): ChecklistItem[] => {
  return checklistsPorTramite[tramiteId] || [];
};

export const getObligatoriosCount = (tramiteId: string): number => {
  const checklist = getChecklistByTramiteId(tramiteId);
  return checklist.filter(item => item.obligatorio).length;
};

export const getOpcionalesCount = (tramiteId: string): number => {
  const checklist = getChecklistByTramiteId(tramiteId);
  return checklist.filter(item => !item.obligatorio).length;
};