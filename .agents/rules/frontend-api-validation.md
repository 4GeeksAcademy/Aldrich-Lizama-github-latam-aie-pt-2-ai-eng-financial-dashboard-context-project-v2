# Validación de Contratos API en Frontend

**Nombre:** `frontend-api-validation`

## Alcance
`frontend/src/App.tsx` — función `fetchFinancialData()` y cualquier otro llamado a la API del backend.

## Razón
La función `fetchFinancialData()` hace `response.json()` y lo castea como `FinancialMovement[]`, pero **no valida** que la respuesta realmente coincida con esa estructura:

```typescript
async function fetchFinancialData(): Promise<FinancialMovement[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json(); // ❌ Sin validación — si el backend cambia, esto falla silenciosamente
}
```

Si el backend renombra un campo, cambia un tipo, o devuelve un error con estructura diferente, el frontend recibe `undefined` que se propaga como `NaN` en los KPIs y charts sin mensaje claro.

## Regla
Toda respuesta de API debe validarse en runtime con un schema. Opciones por orden de preferencia:

1. **Zod** (recomendado) — liviano, tipado inferido automático
2. **Type guards** manuales — sin dependencias extra

### Con Zod
```typescript
import { z } from 'zod';

const FinancialMovementSchema = z.object({
  create_date: z.string(),
  amount: z.number(),
  operation_type: z.enum(['income', 'outcome']),
  category: z.enum(['suppliers', 'sales', 'operational', 'administrative', 'others']),
  business_type: z.enum(['B2B', 'B2C']),
});

const MovementsResponseSchema = z.array(FinancialMovementSchema);

async function fetchFinancialData(): Promise<FinancialMovement[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  const raw = await response.json();
  return MovementsResponseSchema.parse(raw); // ✅ Lanza error claro si hay discrepancia
}
```

### Sin Zod (type guard manual)
```typescript
function isFinancialMovement(obj: unknown): obj is FinancialMovement {
  if (typeof obj !== 'object' || obj === null) return false;
  const m = obj as Record<string, unknown>;
  return (
    typeof m.create_date === 'string' &&
    typeof m.amount === 'number' &&
    (m.operation_type === 'income' || m.operation_type === 'outcome')
  );
}

function validateMovements(data: unknown): FinancialMovement[] {
  if (!Array.isArray(data) || !data.every(isFinancialMovement)) {
    throw new Error('Invalid API response structure');
  }
  return data;
}
```

## Validación
- [ ] `fetchFinancialData()` (o equivalente) valida la respuesta antes de usarla
- [ ] Los schemas de validación están sincronizados con los modelos del backend (`financial-types.ts`)
- [ ] Se agregó Zod a `package.json` (si se eligió esa opción)
- [ ] Los tests mockean respuestas inválidas y verifican que se lance error