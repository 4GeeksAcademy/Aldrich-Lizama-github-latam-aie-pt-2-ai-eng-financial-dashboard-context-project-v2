# Progress — Dashboard Financiero

> Registro cronológico de cambios aplicados, skills usadas y decisiones tomadas.

---

## 2026-08-01 — Skills de Performance y SEO aplicadas

### Skills instaladas
| Skill | Fuente | Razón |
|-------|--------|-------|
| `performance` | addyosmani/web-quality-skills | Optimizar carga del dashboard: Recharts (342 kB), fuentes externas, fetch de datos |
| `seo` | addyosmani/web-quality-skills | Meta tags, Open Graph, structured data para buscadores y asistentes IA |

### Cambios realizados

| Archivo | Cambio | Skill asociada |
|---------|--------|----------------|
| `frontend/index.html` | Añadido `<meta name="description">` con texto descriptivo | seo |
| `frontend/index.html` | Añadidas Open Graph tags (`og:title`, `og:description`, `og:type`, `og:image`) | seo |
| `frontend/index.html` | Añadido `<meta name="robots" content="index, follow">` | seo |
| `frontend/index.html` | Añadido `<link rel="canonical">` | seo |
| `frontend/index.html` | Añadido JSON-LD structured data (Schema.org WebApplication) | seo |
| `frontend/public/robots.txt` | **Nuevo archivo** — control de crawling con Allow/Disallow + Sitemap | seo |
| `frontend/index.html` | Añadido `<link rel="preconnect">` a fonts.googleapis.com + fonts.gstatic.com | performance |
| `frontend/index.html` | Añadido `<link rel="dns-prefetch">` al backend (`localhost:8000`) | performance |
| `frontend/index.html` | Añadido `<link rel="preload">` con `fetchpriority="high"` para CSS de Inter | performance |
| `frontend/index.html` | Font loading optimizado: `media="print" onload="this.media='all'"` + fallback `<noscript>` | performance |
| `frontend/index.html` | Añadida Speculation Rules API para prerenderizado predictivo | performance |

### Decisiones técnicas
- **No se usó `next/image`** porque el proyecto es Vite+React, no Next.js
- **SEO elegido sobre TypeScript** porque las reglas de TypeScript eran genéricas; SEO aporta structured data que mejora visibilidad en buscadores y herramientas IA
- **Speculation Rules API** con `eagerness: "moderate"` (prerenderiza tras ~200ms de hover) — balance entre utilidad y desperdicio de recursos

### Build verificado
```
npm run build → tsc -b && vite build ✓ (0 errores, 1.35s)
```

---

## 2026-07-31 — WCAG 2.2 Accessibility + Vercel React Best Practices

### Skills aplicadas
- `addyosmani/web-quality-skills@accessibility` — WCAG 2.2 completa
- `vercel-labs/agent-skills@vercel-react-best-practices` — Optimizaciones de rendimiento React

### Cambios de accesibilidad

| Archivo | Cambio | Criterio WCAG |
|---------|--------|---------------|
| `frontend/index.html` | Skip link `<a href="#main-content">` + título descriptivo | 2.4.1, 2.4.2 |
| `frontend/src/index.css` | Estilos `.skip-link`, `:focus-visible`, `.visually-hidden`, `prefers-reduced-motion` | 2.4.7, 2.3, 1.4.3 |
| `frontend/src/App.tsx` | `id="main-content"` en `<main>`, `role="alert"` en error | 4.1.2, 4.1.3 |
| `frontend/src/components/dashboard/dashboard-header.tsx` | `aria-hidden="true"` en icono, `aria-label` en badge de período | 4.1.2, 1.1.1 |
| `frontend/src/components/dashboard/kpi-card.tsx` | `aria-hidden="true"` en icono, `aria-label` en Card | 4.1.2, 1.1.1 |
| `frontend/src/components/dashboard/income-outcome-chart.tsx` | `role="figure"`, `aria-labelledby`, descripción oculta, tooltip dots `aria-hidden`, `role="status"` | 4.1.2, 1.1.1 |
| `frontend/src/components/dashboard/profit-percent-chart.tsx` | Mismo patrón + `aria-labelledby`, descripción oculta, `role="status"` | 4.1.2, 1.1.1 |

### Cambios de rendimiento React

| Archivo | Cambio | Regla Vercel |
|---------|--------|--------------|
| `frontend/src/App.tsx` | `React.lazy()` + `Suspense` para IncomeOutcomeChart y ProfitPercentChart | `bundle-dynamic-imports` |
| `frontend/src/App.tsx` | `ChartSkeleton` extraído fuera de `App` como componente estático | `server-hoist-static-io` |
| `frontend/src/lib/financial-utils.ts` | `computeKPIs` optimizado de 4 iteraciones a 1 solo loop | `js-combine-iterations` |

### Build verificado
```
npm run build → tsc -b && vite build ✓ (0 errores)
```

---

## 2026-07-XX — Configuración inicial del proyecto

### Infraestructura
- Docker Compose con frontend (Vite + React) y backend (FastAPI)
- Vite proxy configurado para `/api` → backend
- Hot reload en ambos contenedores

### Backend
- 9 endpoints REST implementados
- Generación de datos mock (360 movimientos)
- Documentación automática en `/docs`

### Frontend
- Dashboard con 4 KPIs y 2 gráficos (Recharts)
- Modo oscuro, responsive design
- Estados de carga (skeleton), error y vacío

---

## Impacto en bundle (post-optimización)

| Chunk | Tamaño | Carga |
|-------|--------|-------|
| `index-*.js` (bundle principal) | 187 kB (gzip: 60 kB) | ✅ Inmediata |
| `skeleton-*.js` | 39 kB (gzip: 13 kB) | ✅ Inmediata |
| `income-outcome-chart-*.js` | 10 kB (gzip: 3.5 kB) | ⏳ Lazy |
| `profit-percent-chart-*.js` | 7 kB (gzip: 2.7 kB) | ⏳ Lazy |
| `LineChart-*.js` (recharts) | 342 kB (gzip: 100 kB) | ⏳ Lazy (antes inline) |

Antes de la optimización, recharts (342 kB) estaba incluido en el bundle principal. Con `React.lazy()`, se carga bajo demanda solo cuando el usuario ve los gráficos.