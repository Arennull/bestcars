import { Dispatch, SetStateAction, useEffect, useState } from "react";

export interface UseLocalStorageStateOptions<T> {
  /**
   * Migra/valida el valor leído de localStorage antes de usarlo.
   * Si migrate lanza o devuelve un valor inválido, se borra la key y se usa initialValue.
   */
  migrate?: (raw: unknown) => T;
}

/**
 * Hook para persistir estado en localStorage.
 *
 * - Inicialización: lee key → parse JSON → si opts.migrate existe, aplica migrate(parsed);
 *   si parse o migrate fallan, removeItem(key) y return initialValue.
 * - Cualquier cambio se persiste en useEffect.
 */
export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
  opts?: UseLocalStorageStateOptions<T>
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return initialValue;
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        localStorage.removeItem(key);
        return initialValue;
      }
      if (opts?.migrate) {
        try {
          const migrated = opts.migrate(parsed);
          if (migrated === undefined || migrated === null) {
            localStorage.removeItem(key);
            return initialValue;
          }
          return migrated;
        } catch {
          localStorage.removeItem(key);
          return initialValue;
        }
      }
      return parsed as T;
    } catch {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Modo privado o storage lleno: la app sigue sin persistencia.
    }
  }, [key, value]);

  return [value, setValue];
}
