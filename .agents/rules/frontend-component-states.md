# Estados Completos en Componentes Asíncronos

**Nombre:** `frontend-component-states`

## Alcance
Todo componente de React en `frontend/src/components/` que consuma datos de la API o reciba props asíncronas.

## Razón
Actualmente el proyecto maneja bien los estados básicos:
- ✅ `KPICard` tiene estado `loading` con Skeleton
- ✅ `App.tsx` maneja `error` con mensaje visual
- ✅ `IncomeOutcomeChart` y `ProfitPercentChart` manejan `loading` y `empty`

Sin embargo, hay carencias:
- ❌ El estado `error` no tiene botón de **reintento**
- ❌ El estado `empty` en los charts no existe como prop explícita (se infiere de `data.length === 0`)
- ❌ `KPIRow` no tiene estado `error` propio (depende de App.tsx)

## Regla
Todo componente que reciba datos asíncronos debe implementar **4 estados explícitos**:

```tsx
interface AsyncProps<T> {
  data: T | null
  loading: boolean
  error: string | null
  onRetry?: () => void  // ← función de reintento
}

function MyComponent({ data, loading, error, onRetry }: AsyncProps<Data>) {
  if (loading) return <Skeleton />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!data || (Array.isArray(data) && data.length === 0)) return <EmptyState />;
  return <NormalState data={data} />;
}
```

## Patrones aprobados

| Estado | Visualización | Componente ejemplo |
|--------|--------------|-------------------|
| **Loading** | Skeleton que imita la forma del contenido real | `<Skeleton className="h-[280px] w-full rounded-lg" />` |
| **Error** | Card con icono, mensaje y botón "Reintentar" | Card + AlertCircle + retry button |
| **Empty** | Mensaje informativo centrado | "No data available to display" |
| **Success** | Renderizado normal de datos | Charts, KPIs, etc. |

## Validación
- [ ] KPIRow acepta prop `error` y muestra estado de error
- [ ] Los componentes tienen botón de reintento en estado error
- [ ] El estado empty se verifica explícitamente (no solo `!data`)
- [ ] Los tests cubren los 4 estados para cada componente