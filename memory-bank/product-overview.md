# Product Overview — Financial Metrics Dashboard

## Propósito

Dashboard financiero full-stack que visualiza métricas de ingresos (`income`) y gastos (`outcome`) de una empresa comercial. El proyecto está diseñado como un **ejemplo educativo** para el programa AI Engineering de 4Geeks Academy, donde los estudiantes analizan, documentan y proponen mejoras sobre un código base real.

## Funcionalidad Principal

El sistema genera **360 movimientos financieros simulados** (30 por mes × 12 meses) que representan un año completo de operaciones. Cada movimiento incluye:

- **Tipo de operación:** `income` (ingreso) o `outcome` (gasto)
- **Categoría:** `sales`, `suppliers`, `operational`, `administrative`, `others`
- **Tipo de negocio:** `B2B` o `B2C`
- **Monto:** valor numérico en USD
- **Fecha:** día específico dentro del mes

El frontend consume estos datos y presenta:

1. **4 indicadores clave (KPIs):** Total Income, Total Outcome, Profit, Profit Margin (%)
2. **Gráfico de líneas:** Income vs. Outcome (evolución mensual)
3. **Gráfico de margen de ganancia:** Profit Margin % mensual

## Audiencia

- **Estudiantes** de AI Engineering que aprenden sobre revisión de código, arquitectura full-stack y calidad de software.
- **Desarrolladores** que quieren entender un stack moderno (FastAPI + React + TypeScript + Vite).

## Estado del Proyecto

Proyecto funcional en etapa de **análisis y mejora continua**. El backend y frontend se comunican correctamente, la UI es responsive con modo oscuro, y existe una base de tests tanto en backend como frontend. Se han identificado áreas de mejora documentadas en `.agents/rules/` y `memory-bank/`.

## Enlaces

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Documentación interactiva:** http://localhost:8000/docs
- **Repositorio original:** [4GeeksAcademy/ai-eng-financial-dashboard-context-project](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project)

## Creadores

Proyecto creado por [@marcogonzalo](https://github.com/marcogonzalo) y otros contribuidores como parte de los Career Programs de [4Geeks Academy](https://4geeksacademy.com/).