# Separación en Capas del Backend

**Nombre:** `backend-layer-separation`

## Alcance
`backend/app/` — estructura de directorios y archivos dentro del paquete Python.

## Razón
`routes.py` tiene ~400 líneas mezclando modelos Pydantic, lógica de dominio (generación de datos, filtros, cálculos) y definiciones de endpoints HTTP. Esto dificulta:
- **Testing unitario**: no se pueden probar `summarize_movements()` o `detect_outcome_alerts()` sin importar el router.
- **Reutilización**: otras apps no pueden importar la lógica de negocio sin arrastrar dependencias HTTP.
- **Mantenimiento**: un solo archivo crece sin control.

## Regla
Separar el backend en tres capas físicas:

```
backend/app/
├── main.py              # Configuración de la app (FastAPI, CORS, middlewares)
├── routes.py            # SOLO endpoints HTTP (capa delgada, < 50 líneas ideales)
├── models.py            # Modelos Pydantic (FinancialMovement, MetricsSummaryItem, etc.)
├── services/
│   └── data_service.py  # Lógica de negocio (generate_mock_movements, filter, summarize, alerts)
```

## Responsabilidades

| Archivo | Contiene | Prohibido |
|---------|----------|-----------|
| `main.py` | App factory, middlewares | Lógica de negocio |
| `routes.py` | Endpoints, Query params, inyección de servicios | Modelos Pydantic, lógica de dominio |
| `models.py` | Clases Pydantic (`FinancialMovement`, `MetricsFacets`, etc.) | Endpoints, lógica de negocio |
| `services/data_service.py` | `generate_mock_movements()`, `filter_movements()`, `summarize_movements()`, `detect_outcome_alerts()`, etc. | Importaciones de FastAPI, decoradores `@router` |

## Validación
- [ ] `routes.py` no define clases Pydantic (importa de `models.py`)
- [ ] `routes.py` no contiene funciones de dominio (importa de `services/data_service.py`)
- [ ] `services/data_service.py` no importa nada de `fastapi`
- [ ] Cada capa se puede importar y testear independientemente