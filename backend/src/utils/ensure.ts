/**
 * Проверяет обязательное значение переменной.
 *
 * В production выбрасывает ошибку, если переменная отсутствует (undefined, null) или пуста.
 * В остальных окружениях возвращает fallback.
 *
 * @param name - Имя переменной окружения.
 * @param fallback - Значение по умолчанию для dev-окружения.
 * @param errorMsg - Сообщение об ошибке.
 * @returns Значение переменной окружения или fallback.
 * @throws Error в production при невалидном значении.
 */

export function ensureValue<T>(
  value: T | undefined | null,
  fallback: T,
  errorMsg: string,
): T {
  if (value !== undefined && value !== '' && value !== null) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(errorMsg);
  }
  return fallback;
}
