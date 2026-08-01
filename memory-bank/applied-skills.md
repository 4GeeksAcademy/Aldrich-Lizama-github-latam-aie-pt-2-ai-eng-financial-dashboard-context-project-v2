# Applied Skills

## Skills instaladas y aplicadas

### 1. `addyosmani/web-quality-skills@accessibility` (ya instalada anteriormente)
Aplicada: WCAG 2.2 — skip link, aria-label, role, focus-visible, prefers-reduced-motion, etc.

### 2. `addyosmani/web-quality-skills@performance` (instalada ahora)
**¿Por qué es valiosa para el dashboard?** El dashboard carga Recharts (342 kB gzip: 100 kB), una fuente externa (Inter) y hace fetch de datos. La skill de performance identifica reglas para minimizar el tiempo de carga percibido y optimizar Core Web Vitals (LCP, FID, CLS).

**Reglas aplicadas:**
| Regla | Cambio | Impacto |
|-------|--------|---------|
| **Preconnect a orígenes críticos** | `preconnect` a fonts.googleapis.com + fonts.gstatic.com | Reduce tiempo de negociación TLS para fuentes |
| **Preload de CSS de fuentes** | `<link rel="preload" as="style">` con `fetchpriority="high"` | La hoja de fuentes comienza a descargarse inmediatamente |
| **Font loading no bloqueante** | `media="print" onload="this.media='all'"` | Evita que la fuente sea render-blocking; el texto se muestra con fallback mientras carga |
| **Speculation Rules API** | `<script type="speculationrules">` con `eagerness: "moderate"` | Prerenderizado predictivo de navegaciones; mejora percepción de velocidad |
| **dns-prefetch a la API** | `dns-prefetch` a `http://localhost:8000` | Resolución DNS anticipada del backend |

### 3. `addyosmani/web-quality-skills@seo` (instalada ahora)
**¿Por qué es valiosa para el dashboard?** Aunque es una SPA interna, tener meta tags correctos, structured data y robots.txt mejora la indexación en buscadores, la previsualización en redes sociales (Open Graph) y la compatibilidad con motores de IA.

**Reglas aplicadas:**
| Regla | Cambio | Impacto |
|-------|--------|---------|
| **Meta description** | `<meta name="description">` con texto descriptivo de 158 caracteres | Mejora snippet en resultados de búsqueda |
| **Open Graph tags** | `og:title`, `og:description`, `og:type`, `og:image` | Previsualización rica al compartir en redes sociales |
| **Meta robots** | `<meta name="robots" content="index, follow">` | Instrucción explícita para crawlers |
| **Canonical URL** | `<link rel="canonical">` | Previene contenido duplicado |
| **JSON-LD Structured Data** | Schema.org `WebApplication` con nombre, descripción, categoría | Datos estructurados para motores de búsqueda y asistentes de IA |
| **robots.txt** | `public/robots.txt` con Allow/Disallow + Sitemap | Control de crawling |

### 4. `vercel-labs/agent-skills@vercel-react-best-practices` (ya instalada)
Aplicada: bundle-dynamic-imports (React.lazy para recharts), js-combine-iterations (single loop en computeKPIs), server-hoist-static-io (ChartSkeleton fuera de App), rendering-resource-hints (preconnect), bundle-defer-third-party (font loading diferido).

---

## Skill creada en memory-bank: `progress.md`

Como parte del proceso de documentación, se creó el archivo `memory-bank/progress.md` que funciona como una **skill de seguimiento de proyecto** que documenta:

- **Cronología** de todos los cambios aplicados (skills, archivos modificados, reglas aplicadas)
- **Decisiones técnicas** (por qué se eligió SEO sobre TypeScript, por qué no se usó Next.js, balance Speculation Rules)
- **Impacto en bundle** antes/después de optimizaciones
- **Referencias cruzadas** entre skills instaladas, archivos modificados y reglas aplicadas

Esta "skill de progreso" permite a cualquier agente futuro entender rápidamente qué se ha hecho, por qué, y qué queda pendiente, sin tener que leer todo el historial de la conversación.