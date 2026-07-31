# Code Review & Quality Rules — Financial Dashboard

## Hallazgos de la Revisión de Código

---

### ✅ Buenas Prácticas Identificadas

#### 1. [Arquitectura] Separación clara de responsabilidades
- **Backend**: `main.py` solo configura la app, `routes.py` contiene toda la lógica de negocio y endpoints.
- **Frontend**: Componentes divididos en `dashboard/` (KPI, charts) y `ui/` (card, skeleton genéricos).
- **Utilidades**: `financial-utils.ts` aísla la lógica de transformación de datos del renderizado.
- **Regla**: Mantener `main.py` libre de lógica de negocio. Los componentes de UI deben ser puramente visuales; la lógica computacional va en módulos `lib/` o hooks.

#### 2. [Testing] Tests tanto en backend como frontend
- Backend: Tests de integración con `TestClient` de FastAPI (7 tests, cubren filtros, endpoints B2B/B2C, health).
- Frontend: Tests unitarios con Vitest para `computeKPIs()`, `computeMonthlyData()`, `formatCurrency()`, `formatPercent()`.
- **Regla**: Todo archivo `*utils.ts` o `*helpers.ts` debe tener su correspondiente `*.test.ts`. Todo endpoint nuevo debe tener al menos un test de integración.

#### 3. [DX] Configuración moderna y eficiente
- Uso de **TypeScript 6** con `verbatimModuleSyntax` y `erasableSyntaxOnly` (aprovecha características modernas del lenguaje).
- **Vite 8** con proxy embebido para `/api` → elimina necesidad de CORS en desarrollo.
- **Tailwind CSS 4** con `@theme inline` — diseño tokens semánticos y modo oscuro nativo.
- **Regla**: Usar Vite proxy para desarrollo (evitar CORS). Preferir Tailwind `@theme` sobre variables CSS sueltas. Mantener `tsconfig` strict.

#### 4. [Documentación] README completo y multi-idioma
- README principal en inglés + `README.es.md` en español.
- Incluye: propósito, instrucciones de setup, puertos, enlaces a documentación de API.
- `AGENTS.md` guía a los agentes sobre dónde encontrar reglas y memory-bank.
- **Regla**: Todo cambio significativo (nuevo endpoint, componente, configuración) debe documentarse en README. Mantener `AGENTS.md` sincronizado con la estructura real de `.agents/`.

#### 5. [Naming] Nomenclatura consistente y descriptiva
- Backend: `build_metrics_facets()`, `summarize_movements()`, `calculate_net_value()` — verbos que describen acción.
- Frontend: `computeKPIs()`, `formatCurrency()`, `formatPercent()` — prefijo `compute`/`format` consistente.
- Tipos TypeScript: `FinancialMovement`, `KPIMetrics`, `MonthlyDataPoint` — nombres autodescriptivos.
- **Regla**: Funciones deben nombrarse con verbo + sustantivo. Tipos con PascalCase descriptivo. Evitar abreviaturas crípticas.

#### 6. [DX] Manejo de estados loading/error/empty en UI
- `KPICard` y `IncomeOutcomeChart` tienen estado `loading` con Skeleton loader.
- `App.tsx` maneja `error` con mensaje visual en la UI (no solo console.error).
- `IncomeOutcomeChart` tiene estado `empty` ("No data available to display").
- **Regla**: Todo componente que consuma datos asíncronos debe manejar al menos 3 estados: loading, error, y empty.

---

### ❌ Malas Prácticas y Riesgos Identificados

#### 1. [Rendimiento / Riesgo] `generate_mock_movements()` se ejecuta en CADA request
- **Problema**: Cada endpoint llama `generate_mock_movements(seed=42)` generando 360 objetos en memoria por request.
- **Impacto**: 10 endpoints × 360 objetos = 3,600 objetos creados por página cargada. Escalabilidad pésima.
- **Archivos**: `backend/app/routes.py` — todos los endpoints.
```python
# MAL — generado en cada request
movements = generate_mock_movements(seed=42)
```
- **Solución**: Usar `lru_cache` o un singleton que genere los datos una sola vez.

#### 2. [Arquitectura] Lógica de negocio mezclada con endpoints en `routes.py`
- **Problema**: `routes.py` tiene ~400 líneas con funciones de dominio (`generate_mock_movements`, `summarize_movements`, `detect_outcome_alerts`) y definiciones de endpoints en el mismo archivo.
- **Impacto**: Dificulta testing unitario, reutilización y mantenimiento.
- **Sugerencia**: Separar en `services/` (lógica de negocio) y mantener routes como capa delgada de presentación HTTP.

#### 3. [Testing] Tests insuficientes y sin covertura de casos borde
- **Problema**: Solo 7 tests de integración en backend, y 4 tests en frontend. Faltan:
  - Tests para endpoints `/facets`, `/summary`, `/top-categories`, `/comparison`, `/alerts`.
  - Tests de errores HTTP (404, 422, 500).
  - Tests de frontend para componentes (renderizado con datos reales, estados loading/error).
  - Tests para `filter_movements()` con combinaciones de filtros vacíos.
  - Tests con listas vacías (edge case).
- **Sugerencia**: Agregar tests faltantes; buscar al menos 80% de covertura en backend y frontend.

#### 4. [Documentación / DX] Endpoint `/alerts` no consumido por el frontend
- **Problema**: El backend expone un endpoint `/api/metrics/alerts` completamente funcional, pero el frontend nunca lo llama. Es código muerto del lado del backend (desde la perspectiva del frontend).
- **Impacto**: Confusión para nuevos desarrolladores, código no utilizado que hay que mantener.
- **Sugerencia**: Integrar alerts en el frontend (badge de notificación o sección de alertas) o eliminar el endpoint si no es necesario.

#### 5. [Configuración] CORS abierto en producción
- **Problema**: `allow_origins=["*"]` en `main.py`.
- **Impacto**: Cualquier sitio web puede hacer peticiones a la API en producción (riesgo de seguridad).
- **Sugerencia**: Usar `allow_origins` específico en producción (ej: dominio del frontend). Mantener `["*"]` solo para desarrollo local.

#### 6. [DX] Sin tipado estricto en frontend para respuesta de API
- **Problema**: `fetchFinancialData()` en `App.tsx` usa `response.json()` sin validar que la respuesta coincida con `FinancialMovement[]`.
- **Impacto**: Si el backend cambia el contrato, el frontend falla silenciosamente (undefined, NaN en UI).
- **Sugerencia**: Usar validación de runtime (Zod, io-ts) o al menos un type guard en el fetch.

```typescript
// MAL — sin validación
const data: FinancialMovement[] = await response.json();

// MEJOR
import { z } from 'zod';
const FinancialMovementSchema = z.object({...});
const data = z.array(FinancialMovementSchema).parse(await response.json());
```

#### 7. [Testing] Sin CI pipeline ni coverage mínimo
- **Problema**: No hay archivo de configuración de CI (GitHub Actions, etc.). Los tests solo se ejecutan localmente.
- **Impacto**: Código roto puede llegar a `main` sin que nadie lo note.
- **Sugerencia**: Agregar GitHub Actions que ejecute `pytest` y `vitest run` en cada PR.

---

## Reglas Propuestas

### Regla 1: Datos Mock como Singleton (Rendimiento)
```markdown
Los datos mock NO deben regenerarse en cada request.
Usar `functools.lru_cache` o variable global para generar los movimientos UNA SOLA VEZ.
```

### Regla 2: Separación Backend en Capas (Arquitectura)
```markdown
- `routes.py` = SOLO definición de endpoints (capa HTTP delgada).
- `services/` = Lógica de negocio (`generate_mock_movements`, `summarize_movements`, etc.).
- `models/` = Modelos Pydantic (actualmente bien ubicados en routes, pero deben separarse).
```

### Regla 3: Cobertura Mínima de Tests
```markdown
- Backend: Todo endpoint debe tener test de integración (status code + estructura respuesta).
- Frontend: Toda función en `lib/` debe tener test unitario.
- Meta mínima: 70% de covertura en backend, 60% en frontend.
- Incluir casos borde: listas vacías, filtros sin resultados, datos nulos.
```

### Regla 4: Validación de Contratos API (Frontend)
```markdown
Toda respuesta de API debe validarse en runtime.
Usar Zod (preferido) o type guards para asegurar que el backend devuelve lo esperado.
```

### Regla 5: CORS Restrictivo en Producción
```markdown
- Desarrollo: `allow_origins=["*"]` (como está).
- Producción: Configurar orígenes específicos vía variable de entorno `ALLOWED_ORIGINS`.
```

### Regla 6: Estados UI Completos
```markdown
Todo componente que consuma datos asíncronos debe manejar:
1. **Loading**: Skeleton o spinner.
2. **Error**: Mensaje visible con opción de reintento.
3. **Empty**: Mensaje informativo cuando no hay datos.
4. **Success**: Renderizado normal de datos.
```

### Regla 7: Documentación y CI
```markdown
- Setup de GitHub Actions con `pytest` + `vitest` en cada PR.
- README debe reflejar cambios en endpoints y componentes.
- Código no utilizado (ej: endpoint sin consumir) debe documentarse con `TODO` o eliminarse.
```

### Regla 8: Naming Consistente
```markdown
- Backend (Python): `snake_case` — verbos descriptivos: `generate_`, `filter_`, `build_`, `calculate_`.
- Frontend (TypeScript): `camelCase` — `compute`, `format`, `fetch` como prefijos.
- Componentes React: PascalCase, sufijo descriptivo: `KPICard`, `DashboardHeader`.
- Archivos: `kebab-case`, ej: `income-outcome-chart.tsx`.
```