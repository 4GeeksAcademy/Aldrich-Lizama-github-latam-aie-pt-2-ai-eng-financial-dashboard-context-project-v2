# Tech Stack — Financial Metrics Dashboard

## Frontend

| Componente | Tecnología | Versión | Propósito |
|-----------|-----------|---------|-----------|
| **Framework UI** | React | 19.2.4 | Librería de componentes de interfaz de usuario |
| **Lenguaje** | TypeScript | ~6.0.2 | Tipado estático y seguridad en desarrollo |
| **Bundler / Dev Server** | Vite | 8.0.4 | Empaquetado rápido, HMR, proxy de desarrollo |
| **Estilos** | Tailwind CSS | 4.2.2 | Framework CSS utility-first con modo oscuro |
| **Gráficos** | Recharts | 3.8.1 | Biblioteca de gráficos para React (líneas) |
| **Iconos** | Lucide React | 1.8.0 | Conjunto de iconos SVG |

### Dependencias de UI
| Paquete | Versión | Uso |
|---------|---------|-----|
| `class-variance-authority` | 0.7.1 | Variantes de clases condicionales |
| `clsx` | 2.1.1 | Concatenación condicional de clases |
| `tailwind-merge` | 3.5.0 | Fusión inteligente de clases Tailwind |

### Rendimiento y SEO aplicado
| Aspecto | Técnica | Detalle |
|---------|---------|---------|
| **Code splitting** | `React.lazy()` + `Suspense` | Recharts (342 kB) se carga bajo demanda; los charts tienen su propio chunk |
| **Font loading** | `preconnect` + `preload` + `media="print" onload` | Inter se carga sin bloquear el renderizado inicial |
| **Prerenderizado** | Speculation Rules API (`eagerness: moderate`) | Prerenderiza navegaciones probables tras ~200ms de hover |
| **SEO** | Meta tags, Open Graph, JSON-LD, robots.txt | Datos estructurados Schema.org WebApplication |
| **Proxy API** | Vite proxy a `localhost:8000` + `dns-prefetch` | Resolución DNS anticipada del backend |

### Dev Dependencies (Frontend)
| Paquete | Versión | Uso |
|---------|---------|-----|
| `vite` | 8.0.4 | Dev server y build |
| `@vitejs/plugin-react` | 6.0.1 | Plugin React para Vite |
| `@tailwindcss/vite` | 4.2.2 | Plugin Tailwind para Vite |
| `typescript` | ~6.0.2 | Compilador TS |
| `vitest` | 4.1.4 | Framework de testing unitario |
| `@vitest/coverage-v8` | 4.1.4 | Reporte de covertura de tests |
| `eslint` | 9.39.4 | Linter |
| `typescript-eslint` | 8.58.0 | Reglas ESLint para TypeScript |

### Rutas y alias
- `@/` → `./src/` (configurado en `vite.config.ts` y `tsconfig.app.json`)
- Proxy: `/api` → `http://backend:8000` (solo desarrollo)

---

## Backend

| Componente | Tecnología | Versión | Propósito |
|-----------|-----------|---------|-----------|
| **Framework** | FastAPI | * (latest) | Framework web asíncrono Python |
| **Servidor ASGI** | Uvicorn | * (latest) | Servidor ASGI con recarga automática |
| **Lenguaje** | Python | 3.13-slim (Docker) | Runtime del backend |
| **Validación** | Pydantic | * (incluido en FastAPI) | Modelos y validación de datos |

### Dependencias (requirements.txt)
| Paquete | Propósito |
|---------|-----------|
| `fastapi` | Framework web |
| `uvicorn[standard]` | Servidor ASGI |
| `debugpy` | Debugger remoto (puerto 5678) |
| `pytest` | Testing |
| `pytest-cov` | Reporte de covertura |
| `httpx` | Cliente HTTP para tests de integración (TestClient) |

---

## Infraestructura / Tooling

| Componente | Tecnología | Detalle |
|-----------|-----------|---------|
| **Contenedores** | Docker Compose | 2 servicios: `frontend` y `backend` |
| **Base image frontend** | `node:24-alpine` | Imagen liviana de Node.js |
| **Base image backend** | `python:3.13-slim` | Imagen liviana de Python |
| **Volúmenes** | Bind mounts | Código en vivo dentro del contenedor (`hot reload`) |
| **Proxy dev** | Vite built-in | Redirige `/api/*` al backend sin CORS |
| **Debug backend** | debugpy | Puerto 5678 expuesto para debug remoto |

### Puertos expuestos
| Servicio | Puerto | Uso |
|----------|--------|-----|
| Frontend | 5173 | Dev server (Vite) |
| Backend API | 8000 | API REST + docs Swagger |
| Backend debug | 5678 | Debug remoto Python |

### Scripts disponibles (frontend/package.json)
| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Compila TS y empaqueta con Vite |
| `npm run lint` | Ejecuta ESLint |
| `npm test` | Ejecuta tests con Vitest |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:coverage` | Tests con reporte de covertura |

---

## Stack Visual

```
                    ┌──────────────────────┐
                    │    React 19 + TS 6   │
                    │    Recharts Charts   │
                    │  Tailwind CSS 4 Dark │
                    │       Vite 8         │
                    │   localhost:5173     │
                    └─────────┬────────────┘
                              │ Proxy /api
                              ▼
                    ┌──────────────────────┐
                    │   FastAPI + Uvicorn  │
                    │   Pydantic Models    │
                    │   Mock Data Gen      │
                    │   localhost:8000     │
                    └──────────────────────┘
```