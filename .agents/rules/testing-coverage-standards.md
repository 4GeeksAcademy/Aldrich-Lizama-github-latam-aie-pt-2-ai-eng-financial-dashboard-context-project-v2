# Cobertura Mínima de Tests

**Nombre:** `testing-coverage-standards`

## Alcance
`backend/tests/` y `frontend/src/` — todos los archivos de test.

## Razón
El proyecto actual tiene:
- **Backend**: 7 tests de integración que cubren solo 3 de 9 endpoints. Faltan `/facets`, `/summary`, `/top-categories`, `/comparison`, `/alerts`. Tampoco hay tests para `filter_movements_by_date` con rangos vacíos, `build_metrics_facets` con lista vacía, o `detect_outcome_alerts` sin alertas.
- **Frontend**: 4 tests unitarios solo para `financial-utils.ts`. No hay tests de componentes (KPIRow, charts), ni de estados loading/error/empty, ni de integración con API mockeada.
- **Sin CI**: No hay pipeline que ejecute tests automáticamente.

## Regla

### Backend
1. **Cada endpoint** debe tener al menos un test de integración que verifique:
   - `status_code` correcto (200, 422, etc.)
   - Estructura del JSON de respuesta (campos esperados)
   - Filtros aplicados correctamente
2. **Cada función pública** en `services/` debe tener test unitario con casos:
   - Normal (datos típicos)
   - Borde (lista vacía, valores extremos)
   - Error (inputs inválidos)
3. Meta de covertura: **≥ 70%** (`pytest --cov=app --cov-fail-under=70`)

### Frontend
1. **Toda función exportada** en `lib/` debe tener test unitario.
2. **Cada componente** debe tener al menos un test de renderizado con:
   - Datos reales (success)
   - Prop `loading=true` (skeleton visible)
   - Props nulas o vacías (empty state)
3. Meta de covertura: **≥ 60%** (`vitest run --coverage`)

### CI (GitHub Actions)
```yaml
# .github/workflows/test.yml — estructura base
name: Tests
on: [pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install -r backend/requirements.txt
      - run: pytest --cov=app --cov-fail-under=70 backend/tests/
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci --prefix frontend
      - run: npm test --prefix frontend
```

## Tests faltantes identificados (acción inmediata)

| Endpoint / Función | Tests existentes | Tests faltantes |
|--------------------|-----------------|-----------------|
| `GET /health` | ✅ 1 test | — |
| `GET /api/metrics` | ✅ 3 tests | Filtros combinados, lista vacía |
| `GET /api/metrics/b2b` | ✅ 2 tests | — |
| `GET /api/metrics/b2c` | ✅ 1 test | — |
| `GET /api/metrics/facets` | ❌ 0 tests | Test básico + estructura |
| `GET /api/metrics/summary` | ❌ 0 tests | group_by, filtros |
| `GET /api/metrics/categories/top` | ❌ 0 tests | limit, operation_type |
| `GET /api/metrics/comparison` | ❌ 0 tests | períodos, delta |
| `GET /api/metrics/alerts` | ❌ 0 tests | threshold, sin alertas |
| `filter_movements_by_date()` | ✅ 1 test | Sin filtros, ambos None |
| `build_metrics_facets()` | ❌ 0 tests | Lista vacía |
| `detect_outcome_alerts()` | ❌ 0 tests | Sin alertas, threshold alto |
| Componente `KPIRow` | ❌ 0 tests | Loading, null metrics |
| Componente `IncomeOutcomeChart` | ❌ 0 tests | Loading, empty data |

## Validación
- [ ] Todos los endpoints tienen al menos 1 test de integración
- [ ] `pytest --cov=app` reporta ≥ 70%
- [ ] `vitest run --coverage` reporta ≥ 60%
- [ ] Existe `.github/workflows/test.yml`
- [ ] Los tests se ejecutan en cada PR automáticamente