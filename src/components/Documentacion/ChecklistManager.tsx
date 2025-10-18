import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Circle,
  AlertCircle,
  Upload,
  Download,
  Calendar,
  User,
  MessageSquare,
  Plus,
  X,
  Clock,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ChecklistItem {
  id: string;
  documento_nombre: string;
  documento_tipo: string;
  es_obligatorio: boolean;
  descripcion?: string;
  formato_esperado?: string;
  vigencia_dias?: number;
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'aprobado' | 'rechazado';
  responsable_id?: string;
  responsable_nombre?: string;
  fecha_limite?: string;
  notas?: string;
  archivo_subido?: boolean;
  fecha_subida?: string;
}

interface ChecklistManagerProps {
  expedienteId: string;
  tramiteTipoId: string;
  onChecklistUpdate?: (checklist: ChecklistItem[]) => void;
  readOnly?: boolean;
}

export const ChecklistManager: React.FC<ChecklistManagerProps> = ({
  expedienteId,
  tramiteTipoId,
  onChecklistUpdate,
  readOnly = false
}) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'pendientes' | 'completados'>('todos');
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    cargarChecklist();
  }, [expedienteId, tramiteTipoId]);

  const cargarChecklist = () => {
    const stored = localStorage.getItem(`checklist_${expedienteId}`);
    if (stored) {
      setChecklist(JSON.parse(stored));
    } else {
      generarChecklistInicial();
    }
  };

  const generarChecklistInicial = () => {
    const checklistBase: ChecklistItem[] = [
      {
        id: `item-1`,
        documento_nombre: 'Certificado de origen',
        documento_tipo: 'pdf',
        es_obligatorio: true,
        descripcion: 'Certificado original emitido por el organismo competente',
        formato_esperado: 'PDF',
        vigencia_dias: 180,
        estado: 'pendiente',
        archivo_subido: false
      },
      {
        id: `item-2`,
        documento_nombre: 'Factura comercial',
        documento_tipo: 'pdf',
        es_obligatorio: true,
        descripcion: 'Factura comercial con todos los datos fiscales',
        formato_esperado: 'PDF',
        estado: 'pendiente',
        archivo_subido: false
      },
      {
        id: `item-3`,
        documento_nombre: 'Análisis de laboratorio',
        documento_tipo: 'pdf',
        es_obligatorio: true,
        descripcion: 'Análisis fisicoquímico y microbiológico actualizado',
        formato_esperado: 'PDF',
        vigencia_dias: 90,
        estado: 'pendiente',
        archivo_subido: false
      }
    ];

    setChecklist(checklistBase);
    localStorage.setItem(`checklist_${expedienteId}`, JSON.stringify(checklistBase));
  };

  const guardarChecklist = (nuevaChecklist: ChecklistItem[]) => {
    localStorage.setItem(`checklist_${expedienteId}`, JSON.stringify(nuevaChecklist));
    setChecklist(nuevaChecklist);
    if (onChecklistUpdate) {
      onChecklistUpdate(nuevaChecklist);
    }
  };

  const toggleItemEstado = (itemId: string) => {
    const nuevaChecklist = checklist.map(item => {
      if (item.id === itemId) {
        const nuevoEstado = item.estado === 'completado' ? 'pendiente' : 'completado';
        return { ...item, estado: nuevoEstado };
      }
      return item;
    });
    guardarChecklist(nuevaChecklist);

    toast({
      title: 'Estado actualizado',
      description: 'El estado del documento ha sido actualizado',
    });
  };

  const actualizarNotas = (itemId: string, notas: string) => {
    const nuevaChecklist = checklist.map(item =>
      item.id === itemId ? { ...item, notas } : item
    );
    guardarChecklist(nuevaChecklist);
    setShowNotesModal(false);
    setSelectedItem(null);

    toast({
      title: 'Notas guardadas',
      description: 'Las notas han sido guardadas exitosamente',
    });
  };

  const asignarResponsable = (itemId: string, responsableId: string, responsableNombre: string) => {
    const nuevaChecklist = checklist.map(item =>
      item.id === itemId ? { ...item, responsable_id: responsableId, responsable_nombre: responsableNombre } : item
    );
    guardarChecklist(nuevaChecklist);

    toast({
      title: 'Responsable asignado',
      description: `${responsableNombre} ha sido asignado al documento`,
    });
  };

  const establecerFechaLimite = (itemId: string, fechaLimite: string) => {
    const nuevaChecklist = checklist.map(item =>
      item.id === itemId ? { ...item, fecha_limite: fechaLimite } : item
    );
    guardarChecklist(nuevaChecklist);

    toast({
      title: 'Fecha límite establecida',
      description: 'La fecha límite ha sido actualizada',
    });
  };

  const agregarDocumento = (nuevoDoc: Partial<ChecklistItem>) => {
    const item: ChecklistItem = {
      id: `item-${Date.now()}`,
      documento_nombre: nuevoDoc.documento_nombre || '',
      documento_tipo: nuevoDoc.documento_tipo || 'pdf',
      es_obligatorio: nuevoDoc.es_obligatorio || false,
      descripcion: nuevoDoc.descripcion,
      formato_esperado: nuevoDoc.formato_esperado,
      estado: 'pendiente',
      archivo_subido: false
    };

    const nuevaChecklist = [...checklist, item];
    guardarChecklist(nuevaChecklist);
    setShowAddItem(false);

    toast({
      title: 'Documento agregado',
      description: 'El documento ha sido agregado al checklist',
    });
  };

  const eliminarDocumento = (itemId: string) => {
    const nuevaChecklist = checklist.filter(item => item.id !== itemId);
    guardarChecklist(nuevaChecklist);

    toast({
      title: 'Documento eliminado',
      description: 'El documento ha sido eliminado del checklist',
    });
  };

  const checklistFiltrada = checklist.filter(item => {
    if (filtro === 'pendientes') return item.estado === 'pendiente' || item.estado === 'en_proceso';
    if (filtro === 'completados') return item.estado === 'completado' || item.estado === 'aprobado';
    return true;
  });

  const calcularProgreso = () => {
    const completados = checklist.filter(item => item.estado === 'completado' || item.estado === 'aprobado').length;
    return checklist.length > 0 ? Math.round((completados / checklist.length) * 100) : 0;
  };

  const getDiasRestantes = (fechaLimite?: string): number | null => {
    if (!fechaLimite) return null;
    const limite = new Date(fechaLimite);
    const hoy = new Date();
    const diff = limite.getTime() - hoy.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'completado':
      case 'aprobado':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'en_proceso':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'rechazado':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 dark:text-gray-100">
            <FileText className="w-5 h-5" />
            <span>Checklist de Documentación</span>
            <Badge variant="outline">{calcularProgreso()}% completo</Badge>
          </CardTitle>
          {!readOnly && (
            <Button size="sm" onClick={() => setShowAddItem(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar documento
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mt-4">
          <Button
            size="sm"
            variant={filtro === 'todos' ? 'default' : 'outline'}
            onClick={() => setFiltro('todos')}
          >
            Todos ({checklist.length})
          </Button>
          <Button
            size="sm"
            variant={filtro === 'pendientes' ? 'default' : 'outline'}
            onClick={() => setFiltro('pendientes')}
          >
            Pendientes ({checklist.filter(i => i.estado === 'pendiente' || i.estado === 'en_proceso').length})
          </Button>
          <Button
            size="sm"
            variant={filtro === 'completados' ? 'default' : 'outline'}
            onClick={() => setFiltro('completados')}
          >
            Completados ({checklist.filter(i => i.estado === 'completado' || i.estado === 'aprobado').length})
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {checklistFiltrada.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>No hay documentos en este filtro</p>
          </div>
        ) : (
          checklistFiltrada.map((item) => {
            const diasRestantes = getDiasRestantes(item.fecha_limite);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-lg border-l-4 transition-all ${
                  item.estado === 'completado' || item.estado === 'aprobado'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                    : item.es_obligatorio
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Checkbox */}
                  {!readOnly && (
                    <button
                      onClick={() => toggleItemEstado(item.id)}
                      className="mt-1 focus:outline-none"
                    >
                      {getEstadoIcon(item.estado)}
                    </button>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.documento_nombre}</h4>
                          {item.es_obligatorio && (
                            <Badge variant="destructive" className="text-xs">Obligatorio</Badge>
                          )}
                          {item.archivo_subido && (
                            <Badge variant="default" className="text-xs bg-green-500">Subido</Badge>
                          )}
                        </div>

                        {item.descripcion && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{item.descripcion}</p>
                        )}

                        <div className="flex flex-wrap gap-2 text-xs">
                          {item.formato_esperado && (
                            <Badge variant="outline">{item.formato_esperado}</Badge>
                          )}
                          {item.vigencia_dias && (
                            <Badge variant="outline">Vigencia: {item.vigencia_dias} días</Badge>
                          )}
                          {item.responsable_nombre && (
                            <Badge variant="secondary" className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{item.responsable_nombre}</span>
                            </Badge>
                          )}
                          {item.fecha_limite && (
                            <Badge
                              variant="outline"
                              className={
                                diasRestantes !== null && diasRestantes < 0
                                  ? 'bg-red-100 text-red-700 border-red-300'
                                  : diasRestantes !== null && diasRestantes <= 7
                                  ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                                  : ''
                              }
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(item.fecha_limite).toLocaleDateString('es-AR')}
                              {diasRestantes !== null && (
                                <span className="ml-1">
                                  ({diasRestantes < 0 ? 'vencido' : `${diasRestantes}d restantes`})
                                </span>
                              )}
                            </Badge>
                          )}
                        </div>

                        {item.notas && (
                          <div className="mt-2 p-2 bg-white dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-start space-x-1">
                              <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span>{item.notas}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {!readOnly && (
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowNotesModal(true);
                            }}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Upload className="w-4 h-4" />
                          </Button>
                          {item.archivo_subido && (
                            <Button size="sm" variant="ghost">
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          {!item.es_obligatorio && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => eliminarDocumento(item.id)}
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      {/* Modal para agregar notas */}
      {showNotesModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="dark:text-gray-100">Notas - {selectedItem.documento_nombre}</span>
                <Button variant="ghost" size="sm" onClick={() => setShowNotesModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                defaultValue={selectedItem.notas || ''}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Agregar notas o comentarios sobre este documento..."
                id="notas-textarea"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowNotesModal(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    const textarea = document.getElementById('notas-textarea') as HTMLTextAreaElement;
                    actualizarNotas(selectedItem.id, textarea.value);
                  }}
                >
                  Guardar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
};
