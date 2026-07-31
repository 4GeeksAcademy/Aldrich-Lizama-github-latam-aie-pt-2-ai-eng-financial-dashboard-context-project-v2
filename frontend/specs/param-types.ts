import type { OperationType } from '../src/lib/financial-types'

/**
 * Filtro compartido de rango de fechas.
 * Todos los campos son opcionales; cuando se omiten no se aplica filtro temporal.
 */
export interface DateRangeFilter {
  /**
   * Fecha de inicio del filtro (inclusive).
   * Formato: YYYY-MM-DD (ISO 8601).
   * @example "2026-01-01"
   */
  startDate?: string

  /**
   * Fecha de fin del filtro (inclusive).
   * Formato: YYYY-MM-DD (ISO 8601).
   * @example "2026-06-30"
   */
  endDate?: string
}

/**
 * Parámetros de consulta para el endpoint de alertas (/api/metrics/alerts).
 * Extiende el filtro de rango de fechas con el umbral de detección.
 */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Umbral mínimo de incremento relativo del gasto sobre el promedio histórico
   * para disparar una alerta. Se expresa como fracción decimal (ej. 0.3 = 30 %).
   * @default 0.3
   * @minimum 0
   */
  threshold: number
}

/**
 * Parámetros de consulta para el endpoint de categorías principales
 * (/api/metrics/categories/top).
 * Extiende el filtro de rango de fechas con el tipo de operación y el límite
 * de resultados.
 */
export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Tipo de operación a filtrar.
   * - "income":  solo movimientos de ingreso
   * - "outcome": solo movimientos de egreso
   */
  operationType: OperationType

  /**
   * Número máximo de categorías a retornar.
   * @default 5
   * @minimum 1
   * @maximum 20
   */
  limit: number
}