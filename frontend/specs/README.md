# Financial Dashboard — Especificaciones de funcionalidades

> Documento técnico que describe los tres módulos del dashboard financiero,
> sus endpoints, tipos, restricciones y casos edge.

---

## Índice

1. [Funcionalidad 1 — Filtro de rango de fechas](#funcionalidad-1--filtro-de-rango-de-fechas)
2. [Funcionalidad 2 — Alertas de anomalías](#funcionalidad-2--alertas-de-anomalías)
3. [Funcionalidad 3 — Vista comparativa B2B vs B2C](#funcionalidad-3--vista-comparativa-b2b-vs-b2c)
4. [Respuestas HTTP y manejo de errores global](#respuestas-http-y-manejo-de-errores-global)

---

## Funcionalidad 1 — Filtro de rango de fechas

Componente reutilizable que permite acotar los datos mostrados en cualquier
funcionalidad del dashboard a un intervalo temporal.

### Endpoints que consume

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `GET /api/metrics/facets` | `GET` | Obtener las fechas mínima y máxima del dataset, además de los facets (operation_types, business_types, categories). Sin parámetros. |

**Respuesta — `MetricsFacets`:**

```typescript
interface MetricsFacets {
  operation_types: OperationType[]  // ["income", "outcome"]
  business_types: BusinessType[]    // ["B2B", "B2C"]
  categories: Category[]            // ["administrative", "operational", "others", "sales", "suppliers"]
  min_date: string                  // "2025-07-04" (formato ISO date)
  max_date: string                  // "2026-06-27" (formato ISO date)
}
```

### Tipos TypeScript usados

**Petición** — No requiere parámetros de consulta.

**Respuesta** — `MetricsFacets` (definido en `src/lib/financial-types.ts` o
equivalente en el fetch).

**Filtro propio** — `DateRangeFilter` (definido en `specs/param-types.ts`):

```typescript
interface DateRangeFilter {
  startDate?: string  // YYYY-MM-DD, opcional
  endDate?: string    // YYYY-MM-DD, opcional
}
```

### Valores válidos y restricciones

| Parámetro | Valores válidos | Restricción |
|-----------|----------------|-------------|
| `min_date` (respuesta) | `string` ISO 8601 `YYYY-MM-DD` | Coincide con `format: date` de OpenAPI |
| `max_date` (respuesta) | `string` ISO 8601 `YYYY-MM-DD` | Siempre posterior o igual a `min_date` |
| `startDate` (filtro) | `string` ISO 8601 `YYYY-MM-DD` | Debe ser ≥ `min_date`; si se envía menor, la API devuelve 0 resultados |
| `endDate` (filtro) | `string` ISO 8601 `YYYY-MM-DD` | Debe ser ≤ `max_date`; si se envía mayor, la API devuelve 0 resultados |

### Casos edge

| # | Escenario | Entrada | Comportamiento esperado de la UI |
|---|-----------|---------|----------------------------------|
| 1 | **Facets aún no cargados** | El fetch a `/api/metrics/facets` está en curso | Los inputs de fecha se renderizan deshabilitados (`disabled`) y se muestra un `<Skeleton>` de 120 px de ancho donde irá la pista "Available: —". El usuario no puede seleccionar fechas hasta que se conozcan los límites. |
| 2 | **Error al cargar facets** | El fetch a `/api/metrics/facets` falla (red, 500, etc.) | Se muestra un mensaje de error destructivo: "Failed to load available date range. Please try again later." Los inputs se mantienen deshabilitados. Un botón "Retry" permite reintentar la llamada. |
| 3 | **Rango de fechas sin datos** | `startDate = "2025-01-01"`, `endDate = "2025-01-31"` — fuera del rango real del dataset | La UI oculta el filtro del componente (se considera un estado normal de "sin resultados"), pero **no** muestra un error. El mensaje "No data available for the selected period" se delega al componente hijo que recibe el array vacío. |
| 4 | **startDate posterior a endDate** | Usuario selecciona `startDate = "2026-06-01"` y `endDate = "2026-01-01"` | No se impide esta selección a nivel de inputs individuales. Sin embargo, el filtro se envía a la API tal cual y esta devolverá un array vacío. La UI debe mostrar el mensaje genérico de "sin datos" sin indicar error. |

---

## Funcionalidad 2 — Alertas de anomalías

Tabla que lista los períodos donde el gasto superó un umbral configurable
respecto al promedio histórico.

### Endpoint que consume

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `GET /api/metrics/alerts` | `GET` | Obtener alertas para períodos con gasto anómalo. |

**Parámetros de consulta:**

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `threshold` | `float` | No | `0.3` | Umbral mínimo de incremento relativo (fracción decimal). `ge=0`. |
| `group_by` | `string` | No | `"month"` | Agrupación temporal: `"day"`, `"week"` o `"month"`. |
| `start_date` | `date` | No | `null` | Fecha de inicio del filtro (inclusive), formato `YYYY-MM-DD`. |
| `end_date` | `date` | No | `null` | Fecha de fin del filtro (inclusive), formato `YYYY-MM-DD`. |
| `business_type` | `string` | No | `null` | Filtrar por segmento: `"B2B"` o `"B2C"`. |

**Respuesta — `MetricsAlert[]`:**

```typescript
interface MetricsAlert {
  period: string          // "2025-12" — clave del período (YYYY-MM para group_by=month)
  outcome_total: number   // 103378.98 — gasto total del período
  baseline_average: number // 64281.84 — promedio de gasto de períodos anteriores
  increase_ratio: number  // 0.6082 — incremento relativo (outcome_total - baseline) / baseline
}
```

### Tipos TypeScript usados

**Petición** — `AlertsParams` (definido en `specs/param-types.ts`):

```typescript
interface AlertsParams extends DateRangeFilter {
  threshold: number   // ≥ 0, default 0.3
}
```

**Respuesta** — `MetricsAlert[]` (definir en `src/lib/financial-types.ts` o
inline). Cada `MetricsAlert` tiene:

```typescript
interface MetricsAlert {
  period: string
  outcome_total: number
  baseline_average: number
  increase_ratio: number
}
```

### Valores válidos y restricciones

| Parámetro | Valores válidos | Restricción |
|-----------|----------------|-------------|
| `threshold` | `number` ≥ 0 | Si es `0`, cualquier desviación positiva dispara una alerta |
| `group_by` | `"day"` \| `"week"` \| `"month"` | Enum estricto; cualquier otro valor produce error 422 |
| `start_date` | `string` ISO date | Opcional |
| `end_date` | `string` ISO date | Opcional |
| `business_type` | `"B2B"` \| `"B2C"` | Opcional |

**Cálculo de alertas (lógica del backend):**
1. Se obtienen los movimientos mock seed=42.
2. Se filtran por fecha, categoría y tipo de operación.
3. Se agrupan por `group_by` y se calcula income/outcome/net por período.
4. Para cada período (empezando desde el segundo), se calcula el promedio de
   gasto de todos los períodos anteriores.
5. Si `(outcome - baseline) / baseline > threshold`, se genera una alerta.

### Casos edge

| # | Escenario | Entrada | Comportamiento esperado de la UI |
|---|-----------|---------|----------------------------------|
| 1 | **Sin alertas** | `threshold = 1.0` (100 %) — umbral tan alto que ningún período lo supera | La tabla no se renderiza. En su lugar se muestra un mensaje de "estado vacío": icono `CheckCircle2` (verde) + "No anomalies detected" + sugerencia de bajar el umbral. |
| 2 | **threshold = 0** | `threshold = 0` — cualquier gasto que supere el promedio histórico | Se disparan alertas para todos los períodos donde el gasto sea mayor que cero y superior al promedio. La tabla puede contener muchas filas. La UI renderiza todas sin paginación (el backend nunca devuelve más de 11 filas para 12 meses). |
| 3 | **Error 422 por group_by inválido** | La UI envía `group_by = "year"` (no soportado) | El backend responde con HTTP 422 (Validation Error). La UI captura el error y muestra: "Invalid filter value. Please check your selection." El estado anterior de la tabla se conserva. |
| 4 | **Red lenta / timeout** | La petición tarda más de lo normal | Se muestra un spinner o `<Skeleton>` en la tabla mientras carga. Si falla por timeout, se muestra un mensaje destructivo: "Failed to load alerts. Check your connection." con botón "Retry". |
| 5 | **Rango de fechas sin datos** | `start_date = "2024-01-01"`, `end_date = "2024-01-31"` — sin movimientos en ese rango | La API devuelve `[]`. La UI muestra el mismo estado vacío que en el caso #1 (sin alertas). El mensaje debe ser coherente: "No anomalies detected for the selected period." |

---

## Funcionalidad 3 — Vista comparativa B2B vs B2C

Panel partido que muestra las top categorías de ingresos y egresos para cada
segmento de negocio, más un gráfico comparativo de barras.

### Endpoints que consume

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `GET /api/metrics/facets` | `GET` | Obtener las fechas mín/máx y los facets disponibles (business_types, categories). |
| `GET /api/metrics/categories/top` | `GET` | Top N categorías por tipo de operación y segmento de negocio. |
| `GET /api/metrics/b2b` | `GET` | Todos los movimientos B2B (sin filtro de categoría). |
| `GET /api/metrics/b2c` | `GET` | Todos los movimientos B2C (sin filtro de categoría). |

**Endpoint `GET /api/metrics/categories/top` — parámetros:**

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `operation_type` | `string` | No | `"outcome"` | Tipo de operación: `"income"` o `"outcome"`. |
| `limit` | `integer` | No | `5` | Nº máximo de categorías. Rango: 1–20 (`ge=1, le=20`). |
| `start_date` | `date` | No | `null` | Fecha de inicio del filtro. |
| `end_date` | `date` | No | `null` | Fecha de fin del filtro. |
| `business_type` | `string` | No | `null` | Segmento: `"B2B"` o `"B2C"`. |

**Respuesta — `TopCategoryItem[]`:**

```typescript
interface TopCategoryItem {
  category: Category        // "suppliers" | "sales" | "operational" | "administrative" | "others"
  operation_type: OperationType  // "income" | "outcome"
  total_amount: number      // 224428.44 — suma total de la categoría
}
```

### Tipos TypeScript usados

**Petición (categories/top):** — `TopCategoriesParams` (definido en `specs/param-types.ts`):

```typescript
interface TopCategoriesParams extends DateRangeFilter {
  operationType: OperationType  // "income" | "outcome"
  limit: number                 // 1–20, default 5
}
```

**Petición (b2b / b2c):** — `DateRangeFilter` + `Category` + `OperationType`
opcionales (todos los parámetros son opcionales).

**Respuesta:** — `TopCategoryItem[]` para categories/top; `FinancialMovement[]`
para b2b / b2c.

```typescript
interface FinancialMovement {
  create_date: string       // ISO date
  amount: number
  operation_type: OperationType
  category: Category
  business_type: BusinessType
}
```

### Valores válidos y restricciones

| Parámetro | Valores válidos | Restricción |
|-----------|----------------|-------------|
| `operation_type` | `"income"` \| `"outcome"` | Enum estricto |
| `limit` | Entero ≥ 1 y ≤ 20 | Default 5 |
| `business_type` (filtro) | `"B2B"` \| `"B2C"` | Opcional |
| `category` (filtro) | `"suppliers"` \| `"sales"` \| `"operational"` \| `"administrative"` \| `"others"` | Opcional |
| `start_date` / `end_date` | ISO 8601 `YYYY-MM-DD` | Opcional |

### Llamadas necesarias para la vista completa

La vista `B2BvB2CView` debe realizar **5 llamadas** (idealmente en paralelo
con `Promise.all`):

```
1. GET /api/metrics/facets                                              → facets
2. GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B   → topIncomeB2B
3. GET /api/metrics/categories/top?operation_type=outcome&limit=5&business_type=B2B  → topOutcomeB2B
4. GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2C   → topIncomeB2C
5. GET /api/metrics/categories/top?operation_type=outcome&limit=5&business_type=B2C  → topOutcomeB2C
```

Además, para calcular los totales del gráfico comparativo:

```
6. GET /api/metrics/b2b  → movimientos B2B (se computan income/outcome total)
7. GET /api/metrics/b2c  → movimientos B2C (se computan income/outcome total)
```

### Casos edge

| # | Escenario | Entrada | Comportamiento esperado de la UI |
|---|-----------|---------|----------------------------------|
| 1 | **Un segmento no tiene movimientos** | B2C devuelve `[]` pero B2B tiene datos | El panel de B2C muestra el mensaje vacío "No data for B2C". El panel B2B funciona con normalidad. El gráfico comparativo solo renderiza las barras del grupo B2B; el grupo B2C aparece con altura cero y su entrada en la leyenda se muestra en gris (`text-muted-foreground`). |
| 2 | **Solo una categoría en top** | `limit = 5` pero solo hay 1 categoría de income para B2B | La tabla del panel muestra solo 1 fila. No se renderizan filas vacías ni placeholders. El estado de carga previo muestra 5 skeletons; al resolver, se muestran solo las filas existentes. |
| 3 | **Rango de fechas sin datos para un segmento** | `start_date = "2026-06-01"`, `end_date = "2026-06-30"` — B2C no tiene movimientos en ese mes | El panel B2C muestra "No data for B2C". El panel B2B se renderiza normal. El gráfico comparativo muestra solo barras B2B. |
| 4 | **Error en una de las 5 llamadas** | La llamada a categories/top para B2B/income falla con 500 | Se muestra un mensaje de error destructivo general en el contenedor `B2BvB2CView`: "Failed to load comparison data." El resto de paneles que sí se cargaron se ocultan para evitar datos inconsistentes. Un botón "Retry" reintenta **todas** las llamadas. |
| 5 | **limit = 1** | `limit = 1` — solo la categoría principal | La tabla del panel correspondiente muestra una única fila con el ranking #1. El título de la tabla sigue siendo "Top Categories" (sin número). |
| 6 | **Todas las categorías tienen el mismo total** | Varias categorías empatadas en monto | El backend ordena alfabéticamente en caso de empate (porque `sorted()` es estable y se ordena por `total_amount` descendente, y Python preserva el orden de inserción para montos iguales). La UI muestra los rankings correlativos (1, 2, 3…) sin indicar el empate. |

---

## Respuestas HTTP y manejo de errores global

### Códigos de estado posibles

| Código | Significado | Causa común |
|--------|-------------|-------------|
| `200` | OK | Respuesta exitosa con datos |
| `422` | Validation Error | Parámetro de consulta con valor no válido (ej. `group_by = "year"`, `limit = 0`) |
| `500` | Internal Server Error | Error inesperado en el backend |

### Formato de error 422

```json
{
  "detail": [
    {
      "loc": ["query", "group_by"],
      "msg": "Input should be 'day', 'week' or 'month'",
      "type": "enum"
    }
  ]
}
```

### Estrategia global de manejo de errores en la UI

1. **Errores 422**: Mostrar "Invalid filter value. Please check your selection."
   cerca del control que originó el error (input de threshold, selector de
   grupo, etc.).
2. **Errores 500**: Mostrar "Something went wrong on the server. Please try
   again later." con botón "Retry".
3. **Errores de red** (fetch falla sin respuesta HTTP): Mostrar "Unable to
   connect to the server. Check your connection." con botón "Retry".
4. **Timeout**: Si una petición excede los 10 segundos, abortar con
   `AbortController` y mostrar "Request timed out. Please try again."