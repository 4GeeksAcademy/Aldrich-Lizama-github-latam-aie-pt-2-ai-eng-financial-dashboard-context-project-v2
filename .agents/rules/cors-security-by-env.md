# CORS Seguro según Entorno

**Nombre:** `cors-security-by-env`

## Alcance
`backend/app/main.py` — configuración de CORS middleware.

## Razón
Actualmente `allow_origins=["*"]` permite que **cualquier sitio web** haga peticiones a la API. En desarrollo local con Vite proxy esto es irrelevante (el proxy oculta el backend), pero si alguien despliega el backend directamente o alguien consume la API desde otro origen, es un riesgo de seguridad.

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ❌ Abierto a cualquier origen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Regla
Usar una variable de entorno `ALLOWED_ORIGINS` que en desarrollo permita `*` y en producción restrinja a orígenes específicos.

```python
import os

origins_env = os.getenv("ALLOWED_ORIGINS", "*")
# En desarrollo: ALLOWED_ORIGINS=*
# En producción: ALLOWED_ORIGINS=https://mydashboard.com,https://admin.mydashboard.com
allowed_origins = origins_env.split(",") if origins_env != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Comportamiento

| Entorno | `ALLOWED_ORIGINS` | Resultado |
|---------|------------------|-----------|
| Desarrollo (local) | no definido → `"*"` | `["*"]` — sin restricción |
| Producción | `"https://app.example.com"` | `["https://app.example.com"]` |
| Producción multi-origen | `"https://a.com,https://b.com"` | `["https://a.com", "https://b.com"]` |

## Nota
En desarrollo con Docker Compose + Vite proxy, el frontend nunca toca el backend directamente, por lo que CORS es irrelevante. Esta regla es principalmente para despliegues donde frontend y backend están en dominios separados.

## Validación
- [ ] `main.py` lee `ALLOWED_ORIGINS` de variable de entorno
- [ ] `docker-compose.yml` no define `ALLOWED_ORIGINS` (hereda el default `"*"`)
- [ ] Existe documentación sobre cómo configurar CORS en producción