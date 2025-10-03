# 📘 Manual de Diseño y Funciones - SGT

## Sistema de Gestión de Trámites

**Versión:** 1.0
**Fecha:** Octubre 2025
**Plataforma:** Web Application (React + TypeScript)

---

## 📑 Tabla de Contenidos

1. [Visión General del Sistema](#1-visión-general-del-sistema)
2. [Arquitectura de Diseño](#2-arquitectura-de-diseño)
3. [Módulos Principales](#3-módulos-principales)
4. [Componentes UI](#4-componentes-ui)
5. [Sistema de Permisos y Roles](#5-sistema-de-permisos-y-roles)
6. [Flujos de Trabajo](#6-flujos-de-trabajo)
7. [Base de Datos](#7-base-de-datos)
8. [Guía de Estilo Visual](#8-guía-de-estilo-visual)

---

## 1. Visión General del Sistema

### 1.1 Propósito
SGT (Sistema de Gestión de Trámites) es una plataforma integral diseñada para gestionar trámites regulatorios en Argentina, abarcando múltiples organismos como ANMAT, SENASA, ANMaC, entre otros.

### 1.2 Usuarios del Sistema
- **Administradores**: Control total del sistema
- **Gerentes**: Supervisión y aprobaciones
- **Despachantes**: Gestión operativa de trámites
- **Clientes**: Consulta de estado de sus trámites
- **Consultores**: Acceso de solo lectura

### 1.3 Características Principales
- ✅ Gestión completa de expedientes
- ✅ Dashboard con métricas en tiempo real
- ✅ Sistema de notificaciones automáticas
- ✅ Control de vencimientos con semáforo
- ✅ Portal dedicado para clientes
- ✅ Gestión financiera integrada
- ✅ Sistema de roles y permisos

---

## 2. Arquitectura de Diseño

### 2.1 Stack Tecnológico

```
Frontend:
├── React 18.3.1
├── TypeScript 5.5.3
├── React Router 7.9.1
├── Tailwind CSS 3.4.1
└── Lucide React (iconos)

Backend/Database:
├── Supabase (PostgreSQL)
├── Row Level Security (RLS)
└── Real-time subscriptions

Build Tools:
├── Vite 5.4.2
├── PostCSS
└── Autoprefixer
```

### 2.2 Estructura de Carpetas

```
src/
├── components/          # Componentes reutilizables
│   ├── Layout/         # Header, Sidebar, Layout
│   ├── ui/             # Componentes base (Button, Card, etc.)
│   ├── Notifications/  # Sistema de notificaciones
│   ├── ProcessManagement/  # Gestión de procesos
│   └── [Módulo]/       # Componentes específicos
├── pages/              # Páginas de la aplicación
│   ├── Dashboard/      # Dashboard principal
│   ├── Expedientes/    # Gestión de expedientes
│   ├── Clientes/       # Gestión de clientes
│   ├── Comercial/      # Facturación y presupuestos
│   ├── Finanzas/       # Módulo financiero
│   └── [Otros módulos]/
├── context/            # Context API (Estado global)
│   ├── SGTContext.tsx  # Estado principal del sistema
│   ├── ThemeContext.tsx # Tema claro/oscuro
│   └── [Otros contexts]
├── hooks/              # Custom hooks
│   ├── use-auth.tsx    # Autenticación
│   ├── use-toast.ts    # Notificaciones toast
│   ├── usePermissions.ts # Control de permisos
│   └── useRobustNavigation.ts # Navegación robusta
├── services/           # Servicios de negocio
│   ├── ExpedienteService.ts
│   ├── NotificationService.ts
│   ├── AutomationService.ts
│   └── DatabaseService.ts
├── types/              # Tipos TypeScript
│   ├── database.ts     # Tipos de BD
│   └── roles.ts        # Tipos de roles
├── data/               # Datos estáticos
│   ├── catalogoTramitesCompleto.ts
│   ├── checklists.ts
│   └── mockData.ts
└── lib/                # Utilidades
    ├── supabase.ts     # Cliente Supabase
    └── utils.ts        # Funciones auxiliares
```

### 2.3 Patrones de Diseño Implementados

#### 2.3.1 Context Pattern
- **SGTContext**: Gestiona el estado global de expedientes, clientes y trámites
- **ThemeContext**: Maneja el tema oscuro/claro
- **NotificationProvider**: Gestiona las notificaciones del sistema

#### 2.3.2 Service Layer Pattern
- Separación de lógica de negocio en servicios dedicados
- `ExpedienteService`: CRUD de expedientes
- `NotificationService`: Gestión de notificaciones
- `AutomationService`: Automatizaciones y tareas programadas

#### 2.3.3 Component Composition
- Componentes pequeños y reutilizables
- Props con interfaces TypeScript bien definidas
- Separación clara de responsabilidades

---

## 3. Módulos Principales

### 3.1 Dashboard (/)

**Archivo:** `src/pages/Dashboard/Dashboard.tsx`

**Descripción:** Panel principal con métricas y resumen del sistema.

**Funcionalidades:**
- 📊 Métricas de expedientes (activos, vencidos, completados)
- 📈 Gráficos de vencimientos
- 📋 Lista de expedientes activos
- 🔔 Actividad reciente
- 📊 Estadísticas por organismo

**Componentes:**
- `MetricsCards`: Tarjetas con métricas principales
- `VencimientoChart`: Gráfico de vencimientos
- `ActiveExpedientes`: Lista de expedientes activos
- `RecentActivity`: Actividad reciente del sistema
- `OrganismoStats`: Estadísticas por organismo

**Permisos requeridos:** Ninguno (accesible para todos)

**Navegación:** `/`

---

### 3.2 Expedientes (/expedientes)

**Archivo:** `src/pages/Expedientes/Expedientes.tsx`

**Descripción:** Módulo central para gestión de expedientes.

**Funcionalidades:**
- 📝 Listado de expedientes con filtros avanzados
- 🔍 Búsqueda por código, cliente, organismo
- 🎨 Vista grid y lista
- 🚦 Indicador de semáforo (verde/amarillo/rojo)
- ⏰ Control de vencimientos
- ➕ Creación de nuevos expedientes

**Componentes:**
- `ExpedienteCard`: Tarjeta de expediente
- `ExpedienteFilters`: Panel de filtros
- `EstadoBadge`: Badge de estado
- `SemaforoIndicator`: Indicador visual de urgencia

**Estados posibles:**
- `iniciado`: Expediente recién creado
- `en_proceso`: En tramitación
- `observado`: Con observaciones pendientes
- `aprobado`: Aprobado por organismo
- `completado`: Finalizado exitosamente
- `cancelado`: Cancelado por el cliente

**Semáforo de vencimiento:**
- 🟢 **Verde**: Más de 7 días restantes
- 🟡 **Amarillo**: Entre 3 y 7 días
- 🔴 **Rojo**: Menos de 3 días o vencido

**Navegación:** `/expedientes`

---

### 3.3 Detalle de Expediente (/expedientes/:id)

**Archivo:** `src/pages/Expedientes/ExpedienteDetail.tsx`

**Descripción:** Vista detallada de un expediente específico.

**Funcionalidades:**
- 📋 Información general del expediente
- 🔄 Progreso del trámite por pasos
- 📎 Gestión de documentos
- 💬 Observaciones y notas
- 📊 Historial completo de cambios
- ✅ Checklist de documentación
- 📈 Resumen de estadísticas

**Secciones:**

#### 3.3.1 Información General
- Código de expediente
- Alias descriptivo
- Cliente asociado
- Tipo de trámite
- Organismo regulador
- Fecha de inicio y límite
- Estado actual
- Prioridad

#### 3.3.2 Progreso del Trámite
- Lista de pasos del proceso
- Paso actual en curso
- Pasos completados
- SLA por paso
- Responsable de cada paso
- Botón para avanzar paso

#### 3.3.3 Gestión de Documentos
- Lista de documentos requeridos
- Estado de cada documento:
  - Pendiente
  - En revisión
  - Aprobado
  - Rechazado
- Indicador de obligatoriedad
- Tipo de archivo
- Fecha de carga
- Acciones (descargar, cambiar estado)

#### 3.3.4 Historial de Eventos
- Todos los cambios registrados
- Timestamp preciso
- Usuario que realizó la acción
- Descripción del cambio
- Detalles adicionales

**Acciones disponibles:**
- Cambiar estado del expediente
- Avanzar paso en el proceso
- Agregar/modificar documentos
- Editar observaciones
- Enviar mensaje al cliente
- Generar presupuesto
- Descargar expediente completo

**Navegación:** `/expedientes/:id`

---

### 3.4 Nuevo Expediente (/expedientes/nuevo)

**Archivo:** `src/pages/Expedientes/NuevoExpediente.tsx`

**Descripción:** Formulario para crear un nuevo expediente.

**Campos del formulario:**
- Cliente (selección)
- Tipo de trámite (del catálogo)
- Alias descriptivo
- Código (generado automáticamente)
- Prioridad (baja, normal, alta, urgente)
- Fecha límite
- Observaciones iniciales

**Validaciones:**
- Cliente obligatorio
- Tipo de trámite obligatorio
- Fecha límite debe ser futura
- Código único en el sistema

**Proceso de creación:**
1. Seleccionar cliente y trámite
2. Completar datos básicos
3. Sistema genera checklist automático
4. Sistema calcula pasos del proceso
5. Expediente creado con estado "iniciado"

**Navegación:** `/expedientes/nuevo`

---

### 3.5 Clientes (/clientes)

**Archivo:** `src/pages/Clientes/Clientes.tsx`

**Descripción:** Gestión de clientes del sistema.

**Funcionalidades:**
- 👥 Listado de clientes
- 🔍 Búsqueda por razón social, CUIT
- ➕ Alta de nuevos clientes
- ✏️ Edición de datos
- 📊 Dashboard por cliente

**Datos de cliente:**
- Razón social
- CUIT
- Domicilio fiscal
- Email de contacto
- Teléfono
- Persona de contacto
- Estado (activo/inactivo)

**Permisos requeridos:** `ver_todos_clientes`

**Navegación:** `/clientes`

---

### 3.6 Detalle de Cliente (/clientes/:id)

**Archivo:** `src/pages/Clientes/ClienteDetailEnhanced.tsx`

**Descripción:** Vista detallada de un cliente específico.

**Tabs disponibles:**

#### 3.6.1 Información General
- Datos de la empresa
- Contactos
- Historial de modificaciones

#### 3.6.2 Expedientes Activos
- Lista de expedientes del cliente
- Estados y vencimientos
- Acceso rápido al detalle

#### 3.6.3 Casos Legales
- Casos legales asociados
- Estado de litigios
- Documentación legal

#### 3.6.4 Facturación
- Facturas emitidas
- Presupuestos pendientes
- Estado de pagos

**Navegación:** `/clientes/:id`

---

### 3.7 Catálogo de Trámites (/catalogo)

**Archivo:** `src/pages/Catalogo/Catalogo.tsx`

**Descripción:** Catálogo completo de trámites disponibles en Argentina.

**Organismos incluidos:**
- ANMAT/INAL (Alimentos y medicamentos)
- SENASA (Sanidad agropecuaria)
- ANMaC (Material controlado)
- SEDRONAR (Estupefacientes)
- AFIP (Impuestos y aduanas)
- Ministerio de Salud
- Y más...

**Información por trámite:**
- Código del trámite
- Nombre completo
- Descripción detallada
- Organismo responsable
- SLA (días de duración)
- Vigencia (años)
- Sistema online a utilizar
- Documentación obligatoria
- Documentación opcional
- Aranceles
- Normativa aplicable

**Funcionalidades:**
- 🔍 Búsqueda por nombre, código, organismo
- 🏷️ Filtros por categoría
- 📋 Vista detallada de cada trámite
- 📄 Checklist de documentos
- 🔗 Enlaces a sistemas oficiales

**Navegación:** `/catalogo`

---

### 3.8 Casos Legales (/casos-legales)

**Archivo:** `src/pages/CasosLegales/CasosLegalesList.tsx`

**Descripción:** Gestión de casos legales y litigios.

**Funcionalidades:**
- 📋 Listado de casos legales
- ➕ Creación de nuevos casos
- 🔗 Vinculación con expedientes
- 📎 Gestión de documentación legal
- 📅 Seguimiento de audiencias
- 💰 Control de costos legales

**Datos de caso legal:**
- Número de expediente judicial
- Carátula
- Juzgado/Tribunal
- Cliente involucrado
- Tipo de caso
- Estado procesal
- Abogado a cargo
- Vencimientos procesales

**Permisos requeridos:** `ver_casos_legales`

**Navegación:** `/casos-legales`

---

### 3.9 Reportes (/reportes)

**Archivo:** `src/pages/Reportes/Reportes.tsx`

**Descripción:** Generación de reportes y análisis.

**Tipos de reportes:**

#### 3.9.1 Reportes de Expedientes
- Expedientes por estado
- Expedientes por cliente
- Expedientes por organismo
- Vencimientos próximos
- Histórico de completados

#### 3.9.2 Reportes Financieros
- Facturación por período
- Presupuestos pendientes
- Cobranzas
- Rentabilidad por cliente

#### 3.9.3 Reportes de Productividad
- Expedientes por usuario
- Tiempo promedio de tramitación
- Tasa de aprobación
- Observaciones frecuentes

**Formatos de exportación:**
- PDF
- Excel
- CSV

**Permisos requeridos:** `ver_reportes`

**Navegación:** `/reportes`

---

### 3.10 Módulo Financiero (/finanzas)

**Archivo:** `src/pages/Finanzas/ModuloFinancieroContable.tsx`

**Descripción:** Control financiero y contable completo.

**Secciones:**

#### 3.10.1 Dashboard Financiero
- Ingresos del mes
- Gastos del mes
- Balance
- Gráficos de evolución

#### 3.10.2 Facturación
- Facturas emitidas
- Facturas pendientes de cobro
- Facturas vencidas
- Historial de facturación

#### 3.10.3 Presupuestos
- Presupuestos activos
- Presupuestos aprobados
- Presupuestos rechazados
- Conversión a factura

#### 3.10.4 Proveedores
- Listado de proveedores
- Facturas de proveedores
- Órdenes de pago
- Control de gastos

**Permisos requeridos:** `gestionar_facturacion`

**Navegación:** `/finanzas`

---

### 3.11 Notificaciones (/notificaciones)

**Archivo:** `src/pages/Notificaciones/Notificaciones.tsx`

**Descripción:** Centro de notificaciones del sistema.

**Tipos de notificaciones:**
- 🔔 Vencimientos próximos
- ✅ Cambios de estado
- 📎 Documentos cargados
- 💬 Mensajes de clientes
- ⚠️ Alertas del sistema

**Estados:**
- No leída (bold)
- Leída
- Archivada

**Acciones:**
- Marcar como leída
- Ir al expediente relacionado
- Archivar notificación

**Navegación:** `/notificaciones`

---

### 3.12 FAUNA/CITES (/fauna-cites)

**Archivo:** `src/pages/Fauna/FaunaCITES.tsx`

**Descripción:** Módulo especializado para trámites de fauna y CITES.

**Funcionalidades:**
- 🦜 Gestión de permisos CITES
- 📋 Registro de especies
- 🌍 Control de comercio internacional
- 📊 Reportes de movimientos

**Navegación:** `/fauna-cites`

---

### 3.13 RENPRE (/renpre)

**Archivo:** `src/pages/RENPRE/RENPREManager.tsx`

**Descripción:** Gestión del Registro Nacional de Precursores Químicos.

**Funcionalidades:**
- 📝 Solicitudes de registro
- 🔄 Renovaciones
- 📦 Control de stock
- 📊 Reportes SEDRONAR

**Navegación:** `/renpre`

---

### 3.14 ANMaC (/anmac)

**Archivo:** `src/pages/ANMaC/ANMaCManager.tsx`

**Descripción:** Gestión de trámites ante la Agencia Nacional de Materiales Controlados.

**Funcionalidades:**
- 🔫 Legítimo usuario de armas
- 📋 Inscripción en CLUSE
- 🔄 Renovaciones
- 📊 Seguimiento de trámites

**Navegación:** `/anmac`

---

### 3.15 Portal Cliente (/portal-cliente)

**Archivos:** `src/pages/PortalCliente/*`

**Descripción:** Portal exclusivo para clientes.

**Secciones:**

#### 3.15.1 Dashboard Cliente
- Resumen de expedientes activos
- Próximos vencimientos
- Documentos pendientes

#### 3.15.2 Mis Expedientes
- Listado de expedientes del cliente
- Estado actualizado en tiempo real
- Descarga de documentos

#### 3.15.3 Mis Documentos
- Repositorio de documentos
- Carga de documentación
- Historial de entregas

**Autenticación:** Login dedicado en `/portal-cliente/login`

**Navegación:** `/portal-cliente/*`

---

### 3.16 Portal Despachante (/despachantes/portal)

**Archivo:** `src/pages/Despachantes/PortalDespachante.tsx`

**Descripción:** Portal para despachantes externos.

**Funcionalidades:**
- 📋 Expedientes asignados
- 📎 Carga de documentación
- 💬 Comunicación con el equipo
- 📊 Reporte de avances

**Permisos requeridos:** `ver_clientes_asignados`

**Navegación:** `/despachantes/portal`

---

### 3.17 Configuración (/configuracion/tramites)

**Archivo:** `src/pages/Configuracion/GestionTramites.tsx`

**Descripción:** Configuración de tipos de trámites.

**Funcionalidades:**
- ➕ Alta de nuevos tipos de trámite
- ✏️ Edición de trámites existentes
- 🔄 Definición de pasos del proceso
- 📋 Configuración de checklists
- ⚙️ Parametrización de SLAs

**Permisos requeridos:** Administrador

**Navegación:** `/configuracion/tramites`

---

### 3.18 Gestión Integral (/admin/gestion-integral)

**Archivo:** `src/pages/Admin/GestionIntegral.tsx`

**Descripción:** Panel de administración completo.

**Funcionalidades:**
- 👥 Gestión de usuarios
- 🔐 Configuración de roles
- ⚙️ Configuración del sistema
- 📊 Logs y auditoría
- 🔧 Mantenimiento

**Permisos requeridos:** `*` (Administrador total)

**Navegación:** `/admin/gestion-integral`

---

## 4. Componentes UI

### 4.1 Componentes Base

#### 4.1.1 Button
**Archivo:** `src/components/ui/button.tsx`

**Variantes:**
- `default`: Botón primario (azul)
- `destructive`: Botón de acción destructiva (rojo)
- `outline`: Botón con borde
- `secondary`: Botón secundario (gris)
- `ghost`: Botón sin fondo
- `link`: Estilo de enlace

**Tamaños:**
- `sm`: Pequeño
- `default`: Normal
- `lg`: Grande
- `icon`: Solo icono

**Ejemplo de uso:**
```tsx
<Button variant="default" size="lg">
  Guardar
</Button>
```

---

#### 4.1.2 Card
**Archivo:** `src/components/ui/card.tsx`

**Subcomponentes:**
- `Card`: Contenedor principal
- `CardHeader`: Encabezado
- `CardTitle`: Título
- `CardDescription`: Descripción
- `CardContent`: Contenido
- `CardFooter`: Pie

**Ejemplo de uso:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>
    Contenido aquí
  </CardContent>
  <CardFooter>
    <Button>Acción</Button>
  </CardFooter>
</Card>
```

---

#### 4.1.3 Badge
**Archivo:** `src/components/ui/badge.tsx`

**Variantes:**
- `default`: Gris
- `secondary`: Gris claro
- `destructive`: Rojo
- `outline`: Con borde

**Ejemplo de uso:**
```tsx
<Badge variant="default">Activo</Badge>
<Badge variant="destructive">Vencido</Badge>
```

---

#### 4.1.4 Input
**Archivo:** `src/components/ui/input.tsx`

**Props:**
- `type`: text, email, password, number, date, etc.
- `placeholder`: Texto de ayuda
- `disabled`: Deshabilitado
- `value`: Valor controlado
- `onChange`: Handler de cambio

**Ejemplo de uso:**
```tsx
<Input
  type="text"
  placeholder="Ingrese el código"
  value={codigo}
  onChange={(e) => setCodigo(e.target.value)}
/>
```

---

#### 4.1.5 Textarea
**Archivo:** `src/components/ui/textarea.tsx`

**Props:**
- `rows`: Número de filas
- `placeholder`: Texto de ayuda
- `value`: Valor controlado
- `onChange`: Handler de cambio

---

#### 4.1.6 Select
**Archivo:** `src/components/ui/select.tsx`

**Ejemplo de uso:**
```tsx
<select className="...">
  <option value="iniciado">Iniciado</option>
  <option value="en_proceso">En Proceso</option>
</select>
```

---

#### 4.1.7 Toast (Notificaciones)
**Archivo:** `src/components/ui/toast.tsx`

**Uso a través del hook:**
```tsx
const { toast } = useToast();

toast({
  title: "Éxito",
  description: "Expediente creado correctamente",
});

toast({
  title: "Error",
  description: "No se pudo guardar",
  variant: "destructive"
});
```

---

#### 4.1.8 Tabs
**Archivo:** `src/components/ui/tabs.tsx`

**Subcomponentes:**
- `Tabs`: Contenedor
- `TabsList`: Lista de pestañas
- `TabsTrigger`: Botón de pestaña
- `TabsContent`: Contenido de pestaña

**Ejemplo de uso:**
```tsx
<Tabs defaultValue="general">
  <TabsList>
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="documentos">Documentos</TabsTrigger>
  </TabsList>
  <TabsContent value="general">
    Contenido general
  </TabsContent>
  <TabsContent value="documentos">
    Contenido documentos
  </TabsContent>
</Tabs>
```

---

### 4.2 Componentes Específicos

#### 4.2.1 BackButton
**Archivo:** `src/components/ui/BackButton.tsx`

**Descripción:** Botón de navegación hacia atrás robusto.

**Props:**
- `to`: URL destino
- `fallbackUrl`: URL de respaldo
- `variant`: 'button' | 'link'
- `children`: Texto del botón

**Ejemplo de uso:**
```tsx
<BackButton to="/expedientes" fallbackUrl="/expedientes">
  Volver
</BackButton>
```

---

#### 4.2.2 EstadoBadge
**Archivo:** `src/components/expedientes/EstadoBadge.tsx`

**Descripción:** Badge de estado con colores según el estado.

**Estados y colores:**
- `iniciado`: Azul
- `en_proceso`: Azul oscuro
- `observado`: Amarillo
- `aprobado`: Verde claro
- `completado`: Verde
- `cancelado`: Gris

---

#### 4.2.3 SemaforoIndicator
**Archivo:** `src/components/expedientes/SemaforoIndicator.tsx`

**Descripción:** Indicador visual de urgencia basado en días restantes.

**Props:**
- `diasRestantes`: Número de días hasta el vencimiento
- `size`: 'sm' | 'md' | 'lg'

**Colores:**
- Verde: > 7 días
- Amarillo: 3-7 días
- Rojo: < 3 días o vencido

---

#### 4.2.4 DocumentacionTramite
**Archivo:** `src/components/DocumentacionTramite.tsx`

**Descripción:** Componente para mostrar la documentación requerida de un trámite.

**Props:**
- `tramiteTipoId`: ID del tipo de trámite
- `expedienteId`: ID del expediente
- `onDocumentUpload`: Callback al subir documento

**Funcionalidades:**
- Muestra documentación obligatoria y opcional
- Permite marcar documentos como completados
- Carga de archivos

---

#### 4.2.5 NotificationToast
**Archivo:** `src/components/Notifications/NotificationToast.tsx`

**Descripción:** Toast de notificación personalizado.

**Tipos:**
- `info`: Información
- `success`: Éxito
- `warning`: Advertencia
- `error`: Error

---

### 4.3 Layout

#### 4.3.1 Sidebar
**Archivo:** `src/components/Layout/Sidebar.tsx`

**Descripción:** Barra lateral de navegación.

**Estructura:**
- Logo de la aplicación
- Items de nivel superior (Dashboard, Notificaciones)
- Módulos colapsables:
  - Gestión de Trámites
  - Gestión de Clientes
  - Finanzas y Contabilidad
  - Reportes y Análisis
  - Portales de Usuario
  - Administración
- Footer con información de usuario

**Funcionalidades:**
- Expansión/colapso de módulos
- Indicador visual de item activo
- Control de permisos por item
- Auto-expansión del módulo activo

---

#### 4.3.2 Header
**Archivo:** `src/components/Layout/Header.tsx`

**Descripción:** Encabezado de la aplicación.

**Elementos:**
- Título de la página actual
- Búsqueda global
- Notificaciones
- Selector de tema (claro/oscuro)
- Menú de usuario

---

#### 4.3.3 Layout
**Archivo:** `src/components/Layout/Layout.tsx`

**Descripción:** Layout principal de la aplicación.

**Estructura:**
```
┌─────────────────────────────────────┐
│ Header                              │
├──────────┬──────────────────────────┤
│          │                          │
│ Sidebar  │ Contenido principal     │
│          │                          │
│          │                          │
└──────────┴──────────────────────────┘
```

---

## 5. Sistema de Permisos y Roles

### 5.1 Roles Disponibles

**Archivo:** `src/types/roles.ts`

#### 5.1.1 Administrador
- **Clave:** `administrador`
- **Permisos:** `*` (todos)
- **Descripción:** Control total del sistema

#### 5.1.2 Gerente
- **Clave:** `gerente`
- **Permisos:**
  - `ver_todos_expedientes`
  - `editar_todos_expedientes`
  - `ver_todos_clientes`
  - `gestionar_facturacion`
  - `ver_reportes`
  - `aprobar_expedientes`
  - `ver_casos_legales`

#### 5.1.3 Despachante
- **Clave:** `despachante`
- **Permisos:**
  - `ver_expedientes_asignados`
  - `editar_expedientes_asignados`
  - `ver_clientes_asignados`
  - `cargar_documentos`

#### 5.1.4 Cliente
- **Clave:** `cliente`
- **Permisos:**
  - `ver_expedientes_propios`
  - `cargar_documentos_propios`

#### 5.1.5 Consultor
- **Clave:** `consultor`
- **Permisos:**
  - `ver_todos_expedientes` (solo lectura)
  - `ver_reportes`

---

### 5.2 Sistema de Control de Permisos

**Hook:** `usePermissions`
**Archivo:** `src/hooks/usePermissions.ts`

**Uso:**
```tsx
const { hasPermission } = usePermissions();

if (hasPermission('gestionar_facturacion')) {
  // Mostrar módulo financiero
}
```

**En componentes:**
```tsx
{hasPermission('ver_casos_legales') && (
  <Link to="/casos-legales">Casos Legales</Link>
)}
```

---

## 6. Flujos de Trabajo

### 6.1 Flujo de Creación de Expediente

```
1. Usuario hace clic en "Nuevo Expediente"
   ↓
2. Se muestra formulario /expedientes/nuevo
   ↓
3. Usuario selecciona cliente del dropdown
   ↓
4. Usuario selecciona tipo de trámite del catálogo
   ↓
5. Sistema carga datos del trámite:
   - SLA
   - Pasos del proceso
   - Checklist de documentos
   ↓
6. Usuario completa:
   - Alias
   - Prioridad
   - Fecha límite
   - Observaciones
   ↓
7. Usuario hace clic en "Crear Expediente"
   ↓
8. Sistema valida datos
   ↓
9. Sistema genera código único
   ↓
10. Sistema crea expediente en BD con estado "iniciado"
    ↓
11. Sistema genera checklist automático
    ↓
12. Sistema crea entrada en historial
    ↓
13. Sistema envía notificación
    ↓
14. Redirige a /expedientes/:id
```

---

### 6.2 Flujo de Gestión de Documentos

```
1. Usuario entra al detalle del expediente
   ↓
2. Ve lista de documentos requeridos
   ↓
3. Para cada documento:
   - Pendiente (rojo)
   - En revisión (amarillo)
   - Aprobado (verde)
   - Rechazado (rojo)
   ↓
4. Usuario hace clic en "Agregar Documento"
   ↓
5. Llena formulario:
   - Nombre del documento
   - Tipo de archivo
   - Obligatorio sí/no
   ↓
6. Usuario sube archivo
   ↓
7. Sistema guarda en storage
   ↓
8. Sistema actualiza estado a "en revisión"
   ↓
9. Sistema registra en historial
   ↓
10. Responsable revisa documento
    ↓
11. Cambia estado a "aprobado" o "rechazado"
    ↓
12. Sistema notifica al usuario
```

---

### 6.3 Flujo de Avance de Expediente

```
1. Expediente en paso N
   ↓
2. Usuario completa documentación del paso
   ↓
3. Usuario hace clic en "Avanzar Paso"
   ↓
4. Sistema valida documentación obligatoria
   ↓
5. Si falta documentación:
   - Muestra error
   - No avanza
   ↓
6. Si está completo:
   ↓
7. Sistema incrementa paso_actual
   ↓
8. Sistema actualiza progreso (%)
   ↓
9. Sistema registra en historial
   ↓
10. Sistema envía notificación
    ↓
11. Si es último paso:
    - Cambia estado a "completado"
    - Calcula fecha de finalización
```

---

### 6.4 Flujo de Control de Vencimientos

```
Servicio: AutomationService
Frecuencia: Cada 1 hora

1. Sistema busca expedientes activos
   ↓
2. Para cada expediente:
   ↓
3. Calcula días restantes = fecha_limite - hoy
   ↓
4. Si días_restantes < 0:
   - Estado = "vencido"
   - Semáforo = rojo
   - Notificación urgente
   ↓
5. Si días_restantes <= 3:
   - Semáforo = rojo
   - Notificación alta prioridad
   ↓
6. Si días_restantes <= 7:
   - Semáforo = amarillo
   - Notificación media prioridad
   ↓
7. Si días_restantes > 7:
   - Semáforo = verde
   ↓
8. Actualiza indicadores en BD
   ↓
9. Envía notificaciones acumuladas
```

---

### 6.5 Flujo de Notificaciones

```
Servicio: NotificationService

1. Evento sucede en el sistema:
   - Cambio de estado
   - Documento cargado
   - Vencimiento próximo
   - Mensaje de cliente
   ↓
2. Sistema identifica usuarios a notificar:
   - Por rol
   - Por asignación
   - Por cliente
   ↓
3. Para cada usuario:
   ↓
4. Sistema crea notificación en BD:
   - tipo
   - mensaje
   - prioridad
   - expediente_id
   - usuario_id
   - leida = false
   ↓
5. Sistema envía notificación en tiempo real
   ↓
6. Usuario ve notificación en header
   ↓
7. Usuario hace clic en notificación
   ↓
8. Sistema marca como leída
   ↓
9. Redirige a expediente relacionado
```

---

## 7. Base de Datos

### 7.1 Tablas Principales

#### 7.1.1 expedientes
```sql
CREATE TABLE expedientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  alias TEXT NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  tramite_tipo_id UUID REFERENCES tramite_tipos(id),
  estado TEXT NOT NULL DEFAULT 'iniciado',
  prioridad TEXT NOT NULL DEFAULT 'normal',
  fecha_inicio TIMESTAMPTZ DEFAULT now(),
  fecha_limite TIMESTAMPTZ NOT NULL,
  fecha_finalizacion TIMESTAMPTZ,
  paso_actual INTEGER DEFAULT 1,
  progreso INTEGER DEFAULT 0,
  semaforo TEXT DEFAULT 'verde',
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Índices:**
- `idx_expedientes_cliente` ON cliente_id
- `idx_expedientes_estado` ON estado
- `idx_expedientes_fecha_limite` ON fecha_limite

**RLS Policies:**
- Usuarios ven solo expedientes asignados o de sus clientes
- Administradores y gerentes ven todos

---

#### 7.1.2 clientes
```sql
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razon_social TEXT NOT NULL,
  cuit TEXT UNIQUE NOT NULL,
  domicilio_fiscal TEXT,
  email TEXT,
  telefono TEXT,
  persona_contacto TEXT,
  estado TEXT DEFAULT 'activo',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

#### 7.1.3 documentos
```sql
CREATE TABLE documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id UUID REFERENCES expedientes(id),
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,
  estado TEXT DEFAULT 'pendiente',
  obligatorio BOOLEAN DEFAULT false,
  url_archivo TEXT,
  size INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

#### 7.1.4 historial
```sql
CREATE TABLE historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id UUID REFERENCES expedientes(id),
  accion TEXT NOT NULL,
  descripcion TEXT,
  estado_anterior TEXT,
  estado_nuevo TEXT,
  usuario_id UUID REFERENCES usuarios(id),
  fecha TIMESTAMPTZ DEFAULT now(),
  detalles JSONB
);
```

---

#### 7.1.5 notificaciones
```sql
CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensaje TEXT,
  expediente_id UUID REFERENCES expedientes(id),
  leida BOOLEAN DEFAULT false,
  prioridad TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 7.2 Row Level Security (RLS)

**Política General:**
- Todos los usuarios solo ven sus propios datos
- Administradores y gerentes ven todo
- Clientes solo ven sus expedientes

**Ejemplo de política:**
```sql
CREATE POLICY "Usuarios ven expedientes asignados"
  ON expedientes FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT usuario_id
      FROM expedientes_usuarios
      WHERE expediente_id = expedientes.id
    )
    OR
    auth.uid() IN (
      SELECT id
      FROM usuarios
      WHERE rol IN ('administrador', 'gerente')
    )
  );
```

---

## 8. Guía de Estilo Visual

### 8.1 Paleta de Colores

#### Colores Principales
```
Primario (Azul):
- 50:  #eff6ff
- 100: #dbeafe
- 500: #3b82f6 (Principal)
- 600: #2563eb (Hover)
- 700: #1d4ed8 (Pressed)
- 900: #1e3a8a (Dark)

Secundario (Gris):
- 50:  #f9fafb
- 100: #f3f4f6
- 200: #e5e7eb
- 300: #d1d5db
- 400: #9ca3af
- 500: #6b7280
- 600: #4b5563
- 700: #374151
- 800: #1f2937
- 900: #111827
```

#### Colores de Estado
```
Éxito (Verde):
- 100: #dcfce7
- 500: #22c55e
- 800: #166534

Advertencia (Amarillo/Naranja):
- 100: #fef3c7
- 500: #f59e0b
- 800: #92400e

Error (Rojo):
- 100: #fee2e2
- 500: #ef4444
- 800: #991b1b

Info (Azul claro):
- 100: #dbeafe
- 500: #06b6d4
- 800: #155e75
```

---

### 8.2 Tipografía

**Fuente:** System Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
             Roboto, "Helvetica Neue", Arial, sans-serif;
```

**Escalas:**
- `text-xs`: 0.75rem (12px)
- `text-sm`: 0.875rem (14px)
- `text-base`: 1rem (16px)
- `text-lg`: 1.125rem (18px)
- `text-xl`: 1.25rem (20px)
- `text-2xl`: 1.5rem (24px)
- `text-3xl`: 1.875rem (30px)

**Pesos:**
- `font-normal`: 400
- `font-medium`: 500
- `font-semibold`: 600
- `font-bold`: 700

---

### 8.3 Espaciado

**Sistema de 8px:**
```
0: 0
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
5: 1.25rem (20px)
6: 1.5rem (24px)
8: 2rem (32px)
10: 2.5rem (40px)
12: 3rem (48px)
```

---

### 8.4 Bordes y Sombras

**Border Radius:**
```
rounded-sm: 0.125rem (2px)
rounded: 0.25rem (4px)
rounded-md: 0.375rem (6px)
rounded-lg: 0.5rem (8px)
rounded-xl: 0.75rem (12px)
rounded-2xl: 1rem (16px)
rounded-full: 9999px
```

**Shadows:**
```
shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
shadow: 0 1px 3px rgba(0,0,0,0.1)
shadow-md: 0 4px 6px rgba(0,0,0,0.1)
shadow-lg: 0 10px 15px rgba(0,0,0,0.1)
shadow-xl: 0 20px 25px rgba(0,0,0,0.1)
```

---

### 8.5 Iconos

**Librería:** Lucide React

**Tamaños estándar:**
- `w-4 h-4`: 16px (pequeño)
- `w-5 h-5`: 20px (normal)
- `w-6 h-6`: 24px (grande)
- `w-8 h-8`: 32px (extra grande)

**Iconos comunes:**
- `FileText`: Expedientes
- `Users`: Clientes
- `Calendar`: Fechas
- `Clock`: Tiempo/vencimientos
- `AlertTriangle`: Advertencias
- `CheckCircle`: Éxito/aprobado
- `XCircle`: Error/rechazado
- `Bell`: Notificaciones
- `Search`: Búsqueda
- `Filter`: Filtros
- `Download`: Descargar
- `Upload`: Subir
- `Edit`: Editar
- `Trash`: Eliminar

---

### 8.6 Estados Interactivos

**Hover:**
```css
hover:bg-gray-100
hover:text-blue-600
hover:shadow-md
```

**Focus:**
```css
focus:outline-none
focus:ring-2
focus:ring-blue-500
focus:ring-offset-2
```

**Active:**
```css
active:bg-blue-700
active:scale-95
```

**Disabled:**
```css
disabled:opacity-50
disabled:cursor-not-allowed
```

---

### 8.7 Animaciones

**Transiciones:**
```css
transition-all duration-200 ease-in-out
transition-colors duration-150
transition-transform duration-300
```

**Animaciones comunes:**
```css
animate-spin (loading)
animate-pulse (skeleton)
animate-bounce (alerts)
```

---

### 8.8 Modo Oscuro

**Clases dark mode:**
```css
dark:bg-gray-900
dark:text-gray-100
dark:border-gray-700
dark:hover:bg-gray-800
```

**Toggle en Header:**
- Botón sol/luna
- Persiste en localStorage
- Aplica clase 'dark' al root

---

## 9. Servicios y Lógica de Negocio

### 9.1 ExpedienteService

**Archivo:** `src/services/ExpedienteService.ts`

**Métodos principales:**

#### `crearExpediente(datos)`
- Valida datos del formulario
- Genera código único
- Calcula vencimientos
- Crea checklist automático
- Inserta en BD
- Crea entrada en historial

#### `cambiarEstado(id, nuevoEstado, motivo)`
- Valida transición de estado
- Actualiza expediente
- Registra en historial
- Envía notificaciones

#### `avanzarPaso(id)`
- Valida documentación
- Incrementa paso actual
- Actualiza progreso
- Registra cambio

#### `getPasosPorTramite(tramiteTipoId)`
- Obtiene pasos del proceso
- Ordena por secuencia
- Retorna con SLA y responsables

#### `generarChecklistAutomatico(tramiteTipoId)`
- Carga documentación obligatoria
- Carga documentación opcional
- Marca obligatoriedades
- Genera IDs únicos

---

### 9.2 NotificationService

**Archivo:** `src/services/NotificationService.ts`

**Métodos principales:**

#### `enviarNotificacion(datos)`
- Crea notificación en BD
- Determina usuarios destinatarios
- Envía en tiempo real
- Retorna confirmación

#### `marcarComoLeida(id)`
- Actualiza flag leida
- Actualiza timestamp

#### `obtenerNotificaciones(usuarioId)`
- Filtra por usuario
- Ordena por fecha
- Incluye datos de expediente

---

### 9.3 AutomationService

**Archivo:** `src/services/AutomationService.ts`

**Funciones:**

#### `startAutomations()`
- Inicia tareas programadas
- Control de vencimientos cada 1h
- Limpieza de notificaciones antiguas

#### `checkVencimientos()`
- Busca expedientes activos
- Calcula días restantes
- Actualiza semáforos
- Envía alertas

#### `limpiarNotificaciones()`
- Elimina notificaciones > 30 días
- Solo las leídas

---

### 9.4 DatabaseService

**Archivo:** `src/services/DatabaseService.ts`

**Métodos:**

#### CRUD genérico
- `get(tabla, id)`
- `getAll(tabla, filtros)`
- `create(tabla, datos)`
- `update(tabla, id, datos)`
- `delete(tabla, id)`

#### Consultas específicas
- `getExpedientesByCliente(clienteId)`
- `getExpedientesVencidos()`
- `getEstadisticas()`

---

## 10. Hooks Personalizados

### 10.1 useAuth

**Archivo:** `src/hooks/use-auth.tsx`

**Retorna:**
```typescript
{
  usuario: Usuario | null,
  loading: boolean,
  login: (email, password) => Promise<void>,
  logout: () => Promise<void>,
  actualizarPerfil: (datos) => Promise<void>
}
```

---

### 10.2 usePermissions

**Archivo:** `src/hooks/usePermissions.ts`

**Retorna:**
```typescript
{
  hasPermission: (permiso: string) => boolean,
  hasAnyPermission: (permisos: string[]) => boolean,
  hasAllPermissions: (permisos: string[]) => boolean
}
```

---

### 10.3 useToast

**Archivo:** `src/hooks/use-toast.ts`

**Retorna:**
```typescript
{
  toast: (opciones: ToastOptions) => void,
  dismiss: (id: string) => void
}
```

---

### 10.4 useRobustNavigation

**Archivo:** `src/hooks/useRobustNavigation.ts`

**Retorna:**
```typescript
{
  navigate: (to: string, opciones?) => void,
  goBack: (fallbackUrl: string) => void
}
```

**Funcionalidad:**
- Navegación con múltiples intentos
- Detección de fallos
- Fallback automático
- Logs de debugging

---

## 11. Context API

### 11.1 SGTContext

**Archivo:** `src/context/SGTContext.tsx`

**Estado global:**
```typescript
{
  expedientes: Expediente[],
  clientes: Cliente[],
  tramiteTipos: TramiteTipo[],
  organismos: Organismo[],
  loading: boolean,
  error: string | null
}
```

**Métodos:**
```typescript
{
  fetchExpedientes: () => Promise<void>,
  fetchClientes: () => Promise<void>,
  fetchTramiteTipos: () => Promise<void>,
  addExpediente: (expediente) => void,
  updateExpediente: (id, datos) => void,
  deleteExpediente: (id) => void
}
```

---

### 11.2 ThemeContext

**Archivo:** `src/context/ThemeContext.tsx`

**Estado:**
```typescript
{
  theme: 'light' | 'dark',
  toggleTheme: () => void
}
```

---

## 12. Datos Estáticos

### 12.1 Catálogo de Trámites

**Archivo:** `src/data/catalogoTramitesCompleto.ts`

**Organismos incluidos:**
- ANMAT/INAL (Alimentos y medicamentos)
- SENASA (Sanidad agropecuaria)
- ANMaC (Material controlado)
- SEDRONAR (Precursores químicos)
- AFIP (Aduanas)
- Ministerio de Salud
- Ministerio de Ambiente (CITES)

**Información por trámite:**
- Código único
- Nombre completo
- Descripción
- SLA (días)
- Vigencia (años)
- Sistema online
- Documentación obligatoria
- Documentación opcional
- Aranceles
- Normativa

---

### 12.2 Checklists

**Archivo:** `src/data/checklists.ts`

**Contiene:**
- Checklists predefinidos por tipo de trámite
- Agrupados por organismo
- Con indicadores de obligatoriedad
- Descripciones detalladas

---

## 13. Tipos TypeScript

### 13.1 database.ts

**Archivo:** `src/types/database.ts`

**Tipos principales:**

#### Expediente
```typescript
interface Expediente {
  id: string;
  codigo: string;
  alias: string;
  cliente_id: string;
  tramite_tipo_id: string;
  estado: EstadoExpediente;
  prioridad: Prioridad;
  fecha_inicio: string;
  fecha_limite: string;
  fecha_finalizacion?: string;
  paso_actual: number;
  progreso: number;
  semaforo: 'verde' | 'amarillo' | 'rojo';
  observaciones?: string;
  created_at: string;
  updated_at: string;
}
```

#### Cliente
```typescript
interface Cliente {
  id: string;
  razon_social: string;
  cuit: string;
  domicilio_fiscal?: string;
  email?: string;
  telefono?: string;
  persona_contacto?: string;
  estado: 'activo' | 'inactivo';
  created_at: string;
  updated_at: string;
}
```

#### Documento
```typescript
interface Documento {
  id: string;
  expediente_id: string;
  nombre: string;
  tipo: string;
  estado: 'pendiente' | 'revision' | 'aprobado' | 'rechazado';
  obligatorio: boolean;
  url_archivo?: string;
  size?: number;
  created_at: string;
  updated_at: string;
}
```

---

### 13.2 roles.ts

**Archivo:** `src/types/roles.ts`

**Enums:**
```typescript
enum Rol {
  ADMINISTRADOR = 'administrador',
  GERENTE = 'gerente',
  DESPACHANTE = 'despachante',
  CLIENTE = 'cliente',
  CONSULTOR = 'consultor'
}

enum Permiso {
  VER_TODOS_EXPEDIENTES = 'ver_todos_expedientes',
  EDITAR_TODOS_EXPEDIENTES = 'editar_todos_expedientes',
  VER_TODOS_CLIENTES = 'ver_todos_clientes',
  GESTIONAR_FACTURACION = 'gestionar_facturacion',
  VER_REPORTES = 'ver_reportes',
  APROBAR_EXPEDIENTES = 'aprobar_expedientes',
  // ... más permisos
}
```

---

## 14. Mejores Prácticas

### 14.1 Código

1. **Usar TypeScript**: Tipar todas las props y estados
2. **Componentes pequeños**: Máximo 300 líneas
3. **Hooks personalizados**: Para lógica reutilizable
4. **Lazy loading**: Para rutas no críticas
5. **Memoización**: useCallback y useMemo cuando corresponda

### 14.2 Estilos

1. **Tailwind CSS**: Clases utilitarias
2. **Componentes consistentes**: Usar librería UI
3. **Responsive design**: Mobile first
4. **Dark mode**: Soportar tema oscuro
5. **Accesibilidad**: Labels, ARIA, contraste

### 14.3 Performance

1. **Code splitting**: React.lazy()
2. **Optimistic updates**: UI instantánea
3. **Debouncing**: En búsquedas
4. **Virtualización**: Para listas largas
5. **Caching**: React Query o SWR

### 14.4 Seguridad

1. **RLS en Supabase**: Políticas estrictas
2. **Validación frontend**: Siempre validar
3. **Validación backend**: Nunca confiar en frontend
4. **Sanitización**: Evitar XSS
5. **HTTPS**: Siempre usar conexión segura

---

## 15. Comandos Útiles

### 15.1 Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

### 15.2 Base de Datos

```bash
# Conectar a Supabase
supabase login

# Ver migraciones
supabase db diff

# Aplicar migraciones
supabase db push

# Resetear BD local
supabase db reset
```

---

## 16. Roadmap Futuro

### 16.1 Funcionalidades Planificadas

- [ ] Integración con APIs oficiales (ANMAT, SENASA)
- [ ] Firma digital de documentos
- [ ] App móvil nativa
- [ ] Generación automática de formularios
- [ ] OCR para escaneo de documentos
- [ ] Chatbot de asistencia
- [ ] Integración con WhatsApp Business
- [ ] Sistema de tickets de soporte
- [ ] Analytics avanzado
- [ ] Exportación a ERP

### 16.2 Mejoras Técnicas

- [ ] PWA (Progressive Web App)
- [ ] Real-time collaboration
- [ ] Optimización de bundle size
- [ ] Tests automatizados (Jest, Cypress)
- [ ] CI/CD completo
- [ ] Monitoreo con Sentry
- [ ] Logs centralizados
- [ ] Backup automático
- [ ] Disaster recovery plan

---

## 17. Soporte y Contacto

### 17.1 Documentación

- **Manual de usuario**: [En desarrollo]
- **API Docs**: [En desarrollo]
- **Video tutoriales**: [En desarrollo]

### 17.2 Reporte de Bugs

Para reportar bugs o solicitar features:
1. Ir a la sección de Issues
2. Describir el problema detalladamente
3. Incluir screenshots si es posible
4. Especificar navegador y versión

---

## 18. Changelog

### Versión 1.0 - Octubre 2025

**Funcionalidades iniciales:**
- ✅ Dashboard con métricas
- ✅ Gestión de expedientes
- ✅ Gestión de clientes
- ✅ Sistema de notificaciones
- ✅ Control de vencimientos
- ✅ Portal de clientes
- ✅ Módulo financiero
- ✅ Reportes básicos
- ✅ Sistema de permisos
- ✅ Tema claro/oscuro

**Organismos soportados:**
- ✅ ANMAT/INAL
- ✅ SENASA
- ✅ ANMaC
- ✅ SEDRONAR
- ✅ AFIP
- ✅ Ministerio de Ambiente (CITES)

---

## 19. Glosario

- **SGT**: Sistema de Gestión de Trámites
- **ANMAT**: Administración Nacional de Medicamentos, Alimentos y Tecnología Médica
- **INAL**: Instituto Nacional de Alimentos
- **SENASA**: Servicio Nacional de Sanidad y Calidad Agroalimentaria
- **ANMaC**: Agencia Nacional de Materiales Controlados
- **SEDRONAR**: Secretaría de Políticas Integrales sobre Drogas
- **CITES**: Convención sobre el Comercio Internacional de Especies Amenazadas
- **RNPA**: Registro Nacional de Producto Alimenticio
- **RNE**: Registro Nacional de Establecimiento
- **RENPRE**: Registro Nacional de Precursores Químicos
- **SLA**: Service Level Agreement (Tiempo de respuesta)
- **RLS**: Row Level Security (Seguridad a nivel de fila)
- **CRUD**: Create, Read, Update, Delete

---

**Fin del Manual de Diseño SGT v1.0**

---

*Este documento es actualizado regularmente. Última actualización: Octubre 2025*
