# Mock Data Singleton

**Nombre:** `backend-mock-cache`

## Alcance
`backend/app/routes.py` — funciones `generate_mock_movements()` y todos los endpoints que la invocan.

## Razón
Cada endpoint (10 en total) ejecuta `generate_mock_movements(seed=42)` generando 360 objetos FinancialMovement **en cada request**. Un solo load del frontend dispara 3,600 objetos creados innecesariamente. Esto mata la escalabilidad y el rendimiento incluso en desarrollo.

## Regla
Los datos mock deben generarse **una sola vez** y cachearse. Usar `functools.lru_cache` para memoizar la función.

## Código actual (violación)
```python
# routes.py — todos los endpoints hacen esto individualmente:
@router.get("/api/metrics")
def get_metrics(...):
    movements = generate_mock_movements(seed=42)  # ❌ Se regenera en cada llamada
    ...

@router.get("/api/metrics/facets")
def get_metrics_facets():
    movements = generate_mock_movements(seed=42)  # ❌ Ídem
    ...
```

## Código deseado
```python
from functools import lru_cache

@lru_cache(maxsize=1)
def get_cached_movements(seed: int = 42) -> tuple[FinancialMovement, ...]:
    return tuple(generate_mock_movements(seed=seed))

# En cada endpoint:
movements = list(get_cached_movements())  # ✅ Se genera UNA vez, luego siempre del cache
```

## Validación
- [ ] `generate_mock_movements` no se llama directamente en endpoints
- [ ] Existe una función con `@lru_cache` o equivalente que provee los movimientos
- [ ] Los tests usan `generate_mock_movements` directamente (no requieren cache)