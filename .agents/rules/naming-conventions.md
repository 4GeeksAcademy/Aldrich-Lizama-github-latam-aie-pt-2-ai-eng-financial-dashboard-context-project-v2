# Nomenclatura Consistente

**Nombre:** `naming-conventions`

## Alcance
Todo el código fuente en `backend/` y `frontend/src/`.

## Razón
El proyecto actual es consistente pero tiene excepciones que confunden:
- ✅ Backend usa `snake_case` (`generate_mock_movements`, `filter_movements_by_date`)
- ✅ Frontend usa `camelCase` (`computeKPIs`, `formatCurrency`)
- ✅ Componentes React usan PascalCase (`KPICard`, `DashboardHeader`)
- ✅ Archivos usan kebab-case (`income-outcome-chart.tsx`, `kpi-card.tsx`)
- ❌ `IncomeOutcomeChart` es muy largo; el naming de variantes en `kpi-card.tsx` usa `'income' | 'outcome' | 'profit' | 'profitPercent'` — mezcla camelCase con un estilo

## Regla

### Backend (Python)
| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Funciones | `snake_case`, verbo + sustantivo | `generate_mock_movements()`, `filter_movements()` |
| Clases | `PascalCase` | `FinancialMovement`, `MetricsFacets` |
| Variables | `snake_case` | `income_probability`, `movement_day` |
| Archivos | `snake_case.py` | `data_service.py`, `test_routes.py` |
| Constantes | `UPPER_SNAKE_CASE` | `OUTCOME_CATEGORIES` ✅ ya cumple |

### Frontend (TypeScript/React)
| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Funciones | `camelCase`, verbo + sustantivo | `computeKPIs()`, `formatCurrency()` |
| Componentes | `PascalCase` | `KPICard`, `DashboardHeader` |
| Tipos/Interfaces | `PascalCase` | `FinancialMovement`, `KPIMetrics` |
| Variables | `camelCase` | `totalIncome`, `monthlyData` |
| Archivos | `kebab-case.tsx` | `income-outcome-chart.tsx`, `kpi-card.tsx` |
| Archivos .ts (no React) | `kebab-case.ts` | `financial-utils.ts`, `financial-types.ts` |
| Enums / Union types | `PascalCase` o `snake_case` consistente | `'income' | 'outcome'` ✅ |

### Casos especiales
| Contexto | Convención | Ejemplo |
|----------|-----------|---------|
| Props de variante visual | `camelCase` | `'profitPercent'` (no `'profit_percent'`) |
| Query params en FastAPI | `snake_case` | `start_date`, `operation_type` |
| Keys en JSON (API) | `snake_case` | `create_date`, `business_type` |

## Validación
- [ ] No hay nombres de archivos con PascalCase o camelCase en el sistema de archivos
- [ ] Las props de variante en componentes usan el mismo estilo (camelCase)
- [ ] Backend y frontend mantienen convenciones separadas (snake_case vs camelCase)
- [ ] La API JSON usa snake_case (coincide con modelos Pydantic)