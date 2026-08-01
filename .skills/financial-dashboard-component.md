---
name: financial-dashboard-component
description: >
  Crea y audita componentes del dashboard financiero siguiendo los patrones
  establecidos del proyecto: KPI cards, gráficos Recharts, layout responsivo,
  y formatos de moneda/porcentaje. Específico para el stack Vite+React+Tailwind+Recharts.
metadata:
  author: project-team
  version: "1.0"
  project: financial-dashboard
---

# Skill de Componentes del Dashboard Financiero

Guía específica del proyecto para crear y mantener componentes del dashboard
financiero, asegurando consistencia visual, de datos y accesibilidad.

## 📋 Objetivo

Garantizar que todos los componentes del dashboard sigan los patrones existentes
en cuanto a:
- Estructura de componentes y props
- Manejo de estados (loading, error, empty, data)
- Formateo de datos financieros
- Accesibilidad WCAG 2.2 AA
- Code splitting con React.lazy + Suspense

## 📥 Inputs Requeridos

Al crear un componente de dashboard, se debe recibir:

1. **Tipo de dato financiero a mostrar** (ingreso, egreso, margen, KPI, etc.)
2. **Endpoint de API relacionado** (o fuente de datos mock)
3. **Período de tiempo** (mensual, trimestral, anual)
4. **Modo de visualización** (chart, KPI card, tabla, etc.)

## 📤 Outputs Esperados

1. Archivo `.tsx` del componente en `src/components/dashboard/`
2. Actualización del `kpi-row.tsx` o `App.tsx` según corresponda
3. Pruebas unitarias en `financial-utils.test.ts` si aplica
4. Actualización de `memory-bank/current-status.md`

## 🔍 Patrones Específicos del Proyecto

### 1. Estructura de KPI Card

```tsx
// src/components/dashboard/kpi-card.tsx
// Props existentes: { label, value, trend, icon: LucideIcon, variant }
// Usar siempre cn() para clases condicionales
// aria-label con `${label}: ${value}` en el Card
// Icono badge con aria-hidden="true"
```

### 2. Gráfico Recharts (lazy loaded)

```tsx
// En App.tsx:
// const IncomeOutcomeChart = React.lazy(() => import(...))
// Envolver en <Suspense fallback={<ChartSkeleton />}>
//
// role="figure" en el contenedor Card
// aria-labelledby en el chart apuntando al título
// <span className="visually-hidden"> con descripción textual
// color dots en tooltips con aria-hidden="true"
```

### 3. Formateo de Datos

```typescript
// Usar siempre financial-utils.ts:
// formatCurrency(value, currency?) → Intl.NumberFormat
// formatPercent(value) → "XX.X%"
// computeKPIs(data) → { totalIncome, totalOutcome, netBalance, profitPercent }
```

### 4. Estados del Componente

| Estado | Implementación |
|--------|---------------|
| **Loading** | `<Skeleton className="..." />` de `src/components/ui/skeleton.tsx` |
| **Error** | `<div role="alert">` con mensaje (ver App.tsx) |
| **Empty** | `<div role="status">` con texto "No hay datos disponibles" |
| **Data** | Renderizado normal del contenido |

### 5. Accesibilidad del Dashboard

- `<section aria-label="Key performance indicators">` para KPIs
- `<section aria-label="Financial charts">` para gráficos
- Cada KPI Card: `aria-label={`${label}: ${value}`}`
- Cada Chart: `role="figure"` + `aria-label` descriptivo
- Color dots en tooltip: `aria-hidden="true"`
- Skip link en `index.html` → `#main-content`

### 6. Code Splitting

- Solo `recharts` se carga con `React.lazy()` (es ~530kB)
- Componentes simples (KPI cards, header) se importan normalmente
- El ChartSkeleton pertenece al mismo archivo que hace el lazy import

## ✅ Criterios de Aceptación

1. **Build**: `npm run build` pasa sin errores ni nuevas advertencias (actual: 0 errors, ~1.35s)
2. **TypeScript**: `tsc --noEmit` pasa con 0 errores
3. **Accesibilidad**: componentes con `role`, `aria-label`, `aria-hidden` correctos
4. **Formato**: Usa `formatCurrency` / `formatPercent` existentes, no reinventa
5. **Estado**: Implementa mínimo los estados loading y data (usando Skeleton)
6. **Commits**: Mensaje con prefijo `feat:` o `fix:` + descripción clara en español
7. **Documentación**: Actualiza `memory-bank/current-status.md` con cambios relevantes

## 📊 Dataset de API Disponible

Los componentes reciben datos del endpoint `GET /api/metrics` con estructura:

```typescript
interface MetricsResponse {
  period: string;
  income: number;
  outcome: number;
  net_balance: number;
  // Historial mensual
  monthly_history: Array<{
    month: string;
    income: number;
    outcome: number;
    profit_percent: number;
  }>;
}
```

## 🧪 Mock Data

Usar `src/lib/mock-data.ts` para desarrollo sin backend activo.
La data mock debe reflejar la estructura exacta de `MetricsResponse`.