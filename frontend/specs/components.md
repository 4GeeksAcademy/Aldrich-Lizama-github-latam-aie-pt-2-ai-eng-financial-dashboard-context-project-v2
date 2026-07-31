# Componentes del Dashboard Financiero

> Especificaciones de componentes para las nuevas funcionalidades del panel
> financiero. Todos los componentes deben escribirse en TypeScript estricto y
> usar los tipos definidos en `specs/param-types.ts` y
> `src/lib/financial-types.ts`.

---

## Funcionalidad 1 — Filtro de rango de fechas

### Componente principal: `DateRangeFilter`

Barra de filtro temporal que permite acotar los datos mostrados en el dashboard
a un intervalo de fechas.

#### Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `startDate` | `string \| undefined` | No | Fecha de inicio actual (formato `YYYY-MM-DD`). |
| `endDate` | `string \| undefined` | No | Fecha de fin actual (formato `YYYY-MM-DD`). |
| `minDate` | `string` | **Sí** | Fecha mínima disponible en el dataset (del `facets` de la API). Sirve para fijar el atributo `min` del `<input type="date">`. |
| `maxDate` | `string` | **Sí** | Fecha máxima disponible en el dataset (del `facets` de la API). Sirve para fijar el atributo `max` del `<input type="date">`. |
| `onStartDateChange` | `(value: string \| undefined) => void` | **Sí** | Callback cuando el usuario cambia la fecha de inicio. Si el input se limpia se emite `undefined`. |
| `onEndDateChange` | `(value: string \| undefined) => void` | **Sí** | Callback cuando el usuario cambia la fecha de fin. Si el input se limpia se emite `undefined`. |

#### Layout

```
┌──────────────────────────────────────────────────────┐
│  📅 Date Range                                       │
│                                                      │
│  [From ⏷ yyyy-mm-dd ]    [To ⏷ yyyy-mm-dd ]        │
│                                                      │
│  ─── hint: "Available: 2025-07-04 — 2026-06-27"     │
└──────────────────────────────────────────────────────┘
```

- Los dos `<input type="date">` se colocan en fila.
- Debajo de los inputs se muestra una pista visual con el rango completo de
  fechas disponible (ver sección "Pista del rango disponible").
- El contenedor puede ser un `<Card>` o un `<fieldset>` con un `<legend>`.

#### Comportamiento: solo uno de los dos inputs relleno

| Estado | Comportamiento |
|--------|----------------|
| Solo `startDate` tiene valor | El filtro envía el `startDate` al backend y omite `endDate`. El backend devuelve todos los movimientos desde esa fecha en adelante. |
| Solo `endDate` tiene valor | El filtro envía el `endDate` al backend y omite `startDate`. El backend devuelve todos los movimientos hasta esa fecha. |
| Ambos vacíos | No se envía ningún filtro de fecha. El backend devuelve la serie completa. |

No se debe mostrar un error ni bloquear la interacción cuando solo uno de los
dos campos está relleno; la API lo soporta de forma natural.

#### Pista del rango disponible

Debajo de los inputs de fecha se renderiza un texto de ayuda con el rango
completo de datos, obtenido de la propiedad `facets` del endpoint
`GET /api/metrics/facets`:

```
Available: 2025-07-04 — 2026-06-27
```

**Reglas de visualización:**

- La pista solo se muestra cuando el componente ha recibido `minDate` y `maxDate`.
- Mientras no se haya resuelto la consulta de facets (valores `undefined`), se
  renderiza un `<Skeleton>` de 120 px de ancho en lugar del texto.
- Los valores se muestran en formato `YYYY-MM-DD`, que coincide con el `format`
  del `<input type="date">` nativo.

---

## Funcionalidad 2 — Tabla de alertas de anomalías

### Componente principal: `AlertsTable`

Tabla que lista los períodos donde el gasto superó un umbral respecto al
promedio histórico.

#### Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `alerts` | `MetricsAlert[]` | **Sí** | Lista de alertas devueltas por `GET /api/metrics/alerts`. Puede ser un array vacío. |
| `loading` | `boolean` | No | Si es `true` se renderizan filas esqueleto. |

#### Tipo de datos de cada fila (`MetricsAlert`)

```
interface MetricsAlert {
  period: string          // "2025-12"  (YYYY-MM)
  outcome_total: number   // 103378.98
  baseline_average: number // 64281.84
  increase_ratio: number  // 0.6082
}
```

#### Columnas de la tabla

| Columna | Tipo de dato | Formato |
|---------|-------------|---------|
| **Period** | `string` (YYYY-MM) | Mostrar como "Dec 2025" (formato legible con `toLocaleDateString`). |
| **Outcome Total** | `number` | Moneda USD: `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })`. |
| **Baseline Avg** | `number` | Moneda USD (mismo formato que Outcome Total). |
| **Increase Ratio** | `number` | Porcentaje: `(value * 100).toFixed(1) + "%"`. Si la alerta muestra `0.6082`, se pinta `"+60.8%"` con color rojo (`text-destructive`). |

#### Estado vacío

Cuando `alerts` es un array vacío (y `loading` es `false`), se renderiza un
mensaje informativo en lugar de la tabla:

```
┌──────────────────────────────────────────────────┐
│  ✅ No anomalies detected                         │
│                                                   │
│  All periods are within the configured threshold. │
│  Try lowering the threshold value to surface      │
│  smaller deviations.                              │
└──────────────────────────────────────────────────┘
```

- El icono `✅` es un círculo verde con un check (usar `CheckCircle2` de
  `lucide-react` con clase `text-green-500`).
- El mensaje se centra dentro de un `<Card>` con el mismo ancho que tendría
  la tabla.

#### Componente auxiliar: `ThresholdInput`

Input numérico para ajustar el umbral de detección de alertas.

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `value` | `number` | **Sí** | Valor actual del umbral. |
| `onChange` | `(value: number) => void` | **Sí** | Callback cuando el usuario cambia el valor. |
| `min` | `number` | No | Mínimo permitido. Por defecto `0`. |
| `max` | `number` | No | Máximo permitido. Por defecto `1`. |
| `step` | `number` | No | Incremento del input. Por defecto `0.05`. |

**Comportamiento con valor fuera de rango:**

- Se valida en el `onChange` **antes** de emitir el callback. Si el valor
  introducido es menor que `min`, se redondea a `min`. Si es mayor que `max`,
  se redondea a `max`.
- El input HTML se renderiza como `<input type="number">` con los atributos
  `min`, `max` y `step` para que el navegador también aplique su validación
  nativa.
- Se muestra un texto de ayuda debajo del input: `"Threshold: 0.30 (30%)"` que
  refleja el valor actual tanto en fracción como en porcentaje.
- Si el usuario escribe un valor no numérico (ej. cadenas vacías o texto), el
  input nativo dispara el evento `onChange` con `event.target.valueAsNumber`
  igual a `NaN`. En ese caso **no se emite** el callback `onChange` y se
  muestra un mensaje de error en rojo: `"Please enter a valid number"`.

---

## Funcionalidad 3 — Vista comparativa B2B vs B2C

### Estructura de layout

```
┌─────────────────────────────────────────────────────┐
│  📊 B2B vs B2C Comparison                            │
│                                                      │
│  ┌─────────────────────┐  ┌─────────────────────┐    │
│  │     B2B Panel       │  │     B2C Panel       │    │
│  │                     │  │                     │    │
│  │  Top categories     │  │  Top categories     │    │
│  │  ┌───┬──────────┐   │  │  ┌───┬──────────┐   │    │
│  │  │ # │  Amount  │   │  │  │ # │  Amount  │   │    │
│  │  ├───┼──────────┤   │  │  ├───┼──────────┤   │    │
│  │  │ 1 │ $XX,XXX │   │  │  │ 1 │ $XX,XXX │   │    │
│  │  │ 2 │ $XX,XXX │   │  │  │ 2 │ $XX,XXX │   │    │
│  │  │ 3 │ $XX,XXX │   │  │  │ 3 │ $XX,XXX │   │    │
│  │  │ 4 │ $XX,XXX │   │  │  │ 4 │ $XX,XXX │   │    │
│  │  │ 5 │ $XX,XXX │   │  │  │ 5 │ $XX,XXX │   │    │
│  │  └───┴──────────┘   │  │  └───┴──────────┘   │    │
│  └─────────────────────┘  └─────────────────────┘    │
│                                                      │
│  ┌─────────────────────────────────────────────┐     │
│  │         Comparison Chart                     │     │
│  │   💰 Income        📉 Outcome                │     │
│  │   ┌────┐           ┌────┐                    │     │
│  │   │ ██ │           │ ██ │                    │     │
│  │   │ ██ │           │ ██ │                    │     │
│  │   │ ██ │           │ ██ │                    │     │
│  │   └────┘           └────┘                    │     │
│  │   B2B   B2C        B2B   B2C                 │     │
│  └─────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
```

### Componente contenedor: `B2BvB2CView`

Renderiza los dos paneles laterales y el gráfico comparativo inferior en un
grid de dos columnas (los paneles) más una fila completa (el gráfico).

#### Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `startDate` | `string \| undefined` | No | Fecha de inicio para filtrar los datos. |
| `endDate` | `string \| undefined` | No | Fecha de fin para filtrar los datos. |

El componente se encarga de orquestar las 3 llamadas a la API internamente:

1. `GET /api/metrics/b2b` → lista de movimientos B2B
2. `GET /api/metrics/b2c` → lista de movimientos B2C
3. `GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B`
4. `GET /api/metrics/categories/top?operation_type=outcome&limit=5&business_type=B2B`
5. (Ídem para B2C)

También gestiona el estado de carga común y lo propaga a sus hijos.

### Componente de panel: `BusinessTypePanel`

Panel individual que muestra las top categorías para un tipo de negocio.

#### Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `businessType` | `'B2B' \| 'B2C'` | **Sí** | Tipo de negocio que representa este panel. |
| `topIncome` | `TopCategoryItem[]` | **Sí** | Top-5 categorías de ingreso. |
| `topOutcome` | `TopCategoryItem[]` | **Sí** | Top-5 categorías de egreso. |
| `loading` | `boolean` | No | Si es `true` se muestran esqueletos de carga. |

#### Estado vacío por panel

Cuando **ambas** listas (`topIncome` y `topOutcome`) están vacías y `loading`
es `false`, se renderiza dentro del panel:

```
  ┌─────────────────────────────┐
  │  📭 No data for {B2B|B2C}   │
  │                             │
  │  No financial movements     │
  │  found for the selected     │
  │  date range.                │
  └─────────────────────────────┘
```

- Usar `Inbox` de `lucide-react` con clase `text-muted-foreground`.
- El mensaje se centra vertical y horizontalmente dentro del panel.

Si solo **una** de las dos listas está vacía (ej. `topIncome` vacío pero
`topOutcome` con datos), se omite el mensaje de "no data" y simplemente no se
renderiza la sección correspondiente dentro del panel; la otra sección se
muestra con normalidad.

### Componente de gráfico: `ComparisonChart`

Gráfico de barras agrupadas que compara ingresos y egresos totales entre B2B y
B2C.

#### Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `b2bMetrics` | `{ income: number; outcome: number } \| undefined` | **Sí** | Totales de ingresos y egresos para B2B. |
| `b2cMetrics` | `{ income: number; outcome: number } \| undefined` | **Sí** | Totales de ingresos y egresos para B2C. |
| `loading` | `boolean` | No | Si es `true` se muestra un esqueleto. |

#### Puntos de datos representados

El gráfico contiene **4 barras** (2 grupos de 2), donde cada grupo es un tipo
de negocio:

| Barra | Grupo | Significado |
|-------|-------|-------------|
| Income B2B | B2B | Total de ingresos del segmento B2B en el período. |
| Outcome B2B | B2B | Total de egresos del segmento B2B en el período. |
| Income B2C | B2C | Total de ingresos del segmento B2C en el período. |
| Outcome B2C | B2C | Total de egresos del segmento B2C en el período. |

- Las barras de **income** usan el color de la variable CSS `--income-badge` o
  un tono verde (`#22c55e`).
- Las barras de **outcome** usan el color de la variable CSS `--outcome-badge` o
  un tono rojo (`#ef4444`).
- El eje Y muestra montos en formato de moneda abreviada (K para miles).
- La leyenda identifica "Income" y "Outcome".
- Si se pasa el ratón sobre una barra, un tooltip muestra el valor exacto
  formateado como moneda USD.

#### Estados del gráfico

| `loading` | `b2bMetrics` y `b2cMetrics` | Renderizado |
|-----------|----------------------------|-------------|
| `true` | — | `<Skeleton className="h-64 w-full" />` |
| `false` | Ambos `undefined` | Mensaje: "No data available for comparison" centrado en un área gris. |
| `false` | Uno `undefined` | Se renderizan solo las barras del grupo que tiene datos; el otro grupo aparece con altura cero y la leyenda deshabilitada para ese grupo. |
| `false` | Ambos con datos | Gráfico completo con 4 barras. |

---

## Convenciones generales

1. **Loading state**: Todo componente que reciba `loading` debe renderizar
   `<Skeleton>` del componente `@/components/ui/skeleton` mientras carga.
2. **Empty state**: Todo componente que reciba un array debe contemplar el caso
   de array vacío con un mensaje descriptivo y un icono.
3. **Error state**: Los componentes que orquesten datos (como `B2BvB2CView`)
   deben atrapar errores de red con un `try/catch` y mostrar un mensaje de
   error con estilo `destructive`.
4. **Separación de responsabilidades**: Los componentes presentacionales solo
   reciben datos por props; la lógica de fetching y transformación vive en el
   componente contenedor o en hooks personalizados.
5. **Unidades monetarias**: Todos los montos se formatean con
   `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })`.
6. **Tipos estrictos**: Queda prohibido el uso de `any` y `object`. Donde un
   valor pueda ser `undefined` se usa el tipo union con `| undefined`.