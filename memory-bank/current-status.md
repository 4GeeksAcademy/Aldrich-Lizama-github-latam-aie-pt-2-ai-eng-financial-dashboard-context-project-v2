# Current Status — Financial Metrics Dashboard

_Fecha: 2026-07-31_

---

## ✅ Features Implementadas

### Backend (FastAPI)
- [x] **API REST completa** con 9 endpoints funcionales
- [x] **Generación de datos mock** — 360 movimientos financieros (30/mes × 12 meses) con seed determinista (`seed=42`)
- [x] **Filtros combinados** por fecha, categoría, tipo de operación y tipo de negocio
- [x] **Endpoints especializados:**
  - `/api/metrics/b2b` y `/api/metrics/b2c` — filtrados por tipo de negocio
  - `/api/metrics/facets` — facetas disponibles (tipos, categorías, rango de fechas)
  - `/api/metrics/summary` — resumen agrupado por día/semana/mes
  - `/api/metrics/categories/top` — top categorías por tipo de operación
  - `/api/metrics/comparison` — comparación entre períodos con delta absoluto y porcentual
  - `/api/metrics/alerts` — detección de gastos anómalos sobre el promedio histórico
- [x] **Health check** (`GET /health`)
- [x] **Documentación automática** en `/docs` (Swagger UI / OpenAPI)
- [x] **CORS habilitado** (abierto para desarrollo)
- [x] **Debug remoto** con debugpy en puerto 5678

### Frontend (React + TypeScript)
- [x] **Dashboard funcional** con 4 KPIs: Total Income, Total Outcome, Profit, Profit Margin
- [x] **Gráfico Income vs Outcome** — línea doble mensual con tooltips personalizados
- [x] **Gráfico Profit Margin %** — línea mensual con referencia en 0%
- [x] **Modo oscuro** (clase `dark` fija en `<main>`)
- [x] **Estados de carga** — Skeleton loaders en todos los componentes
- [x] **Estado de error** — mensaje visual cuando la API falla
- [x] **Estado vacío** — mensaje "No data available" cuando no hay datos
- [x] **Responsive design** — Tailwind grid adaptativo (`sm:`, `xl:`, `lg:`)
- [x] **Proxy Vite** para `/api` en desarrollo (sin CORS)

### Testing
- [x] **7 tests de integración** en backend (FastAPI TestClient)
- [x] **4 tests unitarios** en frontend (Vitest) para `financial-utils.ts`
- [x] Tests de filtros por fecha, categoría, tipo de operación, tipo de negocio

### Infraestructura
- [x] **Docker Compose** con 2 servicios (frontend + backend)
- [x] **Hot reload** en ambos contenedores (bind mounts)
- [x] **Node 24 Alpine** para frontend (imagen liviana)
- [x] **Python 3.13 Slim** para backend (imagen liviana)

---

## ❌ Gaps Conocidos

### Funcionales
- [ ] **Endpoint `/alerts` no consumido** por el frontend — la funcionalidad de alertas de gastos anómalos existe pero no se muestra en la UI
- [ ] **Solo 1 de 9 endpoints usado** por el frontend — el resto son llamables pero no se integran en la interfaz
- [ ] **Sin modo claro** — el modo oscuro está hardcodeado, no hay toggle ni preferencia del sistema
- [ ] **Sin selector de período** — el dashboard siempre muestra el año completo
- [ ] **Sin filtros interactivos** — no se puede filtrar por categoría, tipo de negocio, o rango de fechas desde la UI

### Técnicos
- [ ] **Datos mock regenerados en cada request** — 8 llamadas a `generate_mock_movements(seed=42)` por carga de página
- [ ] **CORS abierto (`*`)** sin variable de entorno para producción
- [ ] **Sin validación runtime** de respuestas API en el frontend (solo casteo TypeScript)
- [ ] **`routes.py` con ~391 líneas** mezclando modelos, lógica de negocio y endpoints
- [ ] **Sin CI/CD** — no hay GitHub Actions, los tests solo se ejecutan localmente
- [ ] **Sin manejo de reintento** en estado de error del frontend

### Testing
- [ ] **Tests faltantes para 5 endpoints:** `/facets`, `/summary`, `/top-categories`, `/comparison`, `/alerts`
- [ ] **Sin tests de componentes** del frontend (solo unitarios de utilidades)
- [ ] **Sin tests de casos borde:** listas vacías, filtros sin resultados, valores extremos
- [ ] **Sin covertura mínima configurada** ni reporte automatizado

### Documentación
- [ ] **Sin guía de despliegue** para producción
- [ ] **Sin documentación de endpoints** en README (solo Swagger)
- [ ] **Sin `.env.example`** para variables de entorno del backend
- [ ] **Sin changelog** o historial de versiones

---

## 🎯 Siguientes Prioridades

### Prioridad 1 (Inmediata — Impacto alto)
1. **Cachear datos mock** con `@lru_cache` — elimina la regeneración en cada request
2. **Agregar tests faltantes** para endpoints sin covertura (5 endpoints)
3. **Configurar CORS por entorno** — variable `ALLOWED_ORIGINS` para producción

### Prioridad 2 (Corto plazo — Mejora DX)
4. **Separar backend en capas:** `models.py`, `services/`, `routes.py` más delgado
5. **Agregar validación Zod** en el frontend para contratos API
6. **Mejorar estados de error** con botón de reintento

### Prioridad 3 (Mediano plazo — Features)
7. **Integrar endpoint `/alerts`** en el frontend (sección de alertas o notificaciones)
8. **Agregar filtros interactivos** (selector de rango de fechas, categorías)
9. **Toggle de modo claro/oscuro** con preferencia del sistema
10. **Configurar GitHub Actions** con `pytest` y `vitest` en cada PR

---

## 📊 Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| Archivos totales | ~30 |
| Líneas backend (routes.py) | 391 |
| Líneas frontend (src/) | ~633 |
| Tests backend | 7 (3 endpoints cubiertos) |
| Tests frontend | 4 (solo utilidades) |
| Endpoints API | 9 |
| Contenedores Docker | 2 |
| Dependencias frontend | 7 prod + 12 dev |
| Dependencias backend | 6 |