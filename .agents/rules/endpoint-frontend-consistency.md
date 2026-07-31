# Consistencia entre Endpoints y Frontend

**Nombre:** `endpoint-frontend-consistency`

## Alcance
Backend (`backend/app/routes.py`) y frontend (`frontend/src/`) — todo endpoint expuesto debe ser consumido o justificado.

## Razón
El backend expone 9 endpoints pero el frontend solo consume 1 (`GET /api/metrics`). En particular:
- `GET /api/metrics/alerts` — Endpoint funcional, **nunca llamado** desde el frontend. Es código muerto.
- `GET /api/metrics/summary` — No usado (el frontend hace el resumen mensual en `financial-utils.ts`).
- `GET /api/metrics/comparison` — No usado.
- `GET /api/metrics/facets` — No usado.
- `GET /api/metrics/categories/top` — No usado.
- `GET /api/metrics/b2c` — No usado.

Esto genera confusión: un desarrollador nuevo invierte tiempo entendiendo endpoints que no tienen utilidad real en la app.

## Regla
1. **Endpoint nuevo → debe tener un consumidor.** Si se agrega un endpoint, debe agregarse también el consumo en el frontend (o documentar explícitamente que es para uso externo/API pública).
2. **Endpoints no consumidos** deben marcarse con `# TODO: Unused — remove or integrate` en el código.
3. **Alternativa**: Si el endpoint tiene valor como API pública, documentarlo en README como "API pública" y agregar un test que lo verifique.

## Acción recomendada para este proyecto

| Endpoint | Estado | Acción |
|----------|--------|--------|
| `/api/metrics` | ✅ Usado | Mantener |
| `/api/metrics/b2b` | ✅ Usado en tests | Mantener (útil para filtros futuros) |
| `/api/metrics/b2c` | ❌ No usado | Marcar con TODO o integrar |
| `/api/metrics/facets` | ❌ No usado | Marcar con TODO o integrar (útil para filtros UI) |
| `/api/metrics/summary` | ❌ No usado | Marcar con TODO (el frontend tiene su propio summary) |
| `/api/metrics/categories/top` | ❌ No usado | Marcar con TODO o integrar |
| `/api/metrics/comparison` | ❌ No usado | Marcar con TODO o integrar |
| `/api/metrics/alerts` | ❌ No usado | **Integrar prioritariamente** (tiene valor para el dashboard) |

## Validación
- [ ] No hay endpoints sin consumir ni documentados como "API pública"
- [ ] Los endpoints no consumidos tienen `# TODO` explícito
- [ ] Si se integra alerts en el frontend, hay un componente o sección que lo muestra
- [ ] README.md lista los endpoints y su estado (usado / API pública)