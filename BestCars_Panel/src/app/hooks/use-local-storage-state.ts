import { Dispatch, SetStateAction, useEffect, useState } from "react";

/**
 * Hook pequeño para persistir estado en localStorage.
 *
 * Por qué existe:
 * - Evita repetir el mismo useEffect de "cargar" y "guardar" para cada estado.
 * - Centraliza el try/catch del JSON.parse (localStorage se puede corromper).
 * - Deja el componente App más limpio.
 */
export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  // Inicialización “perezosa”: solo lee localStorage una vez.
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return initialValue;
      return JSON.parse(raw) as T;
    } catch {
      // Si el JSON está roto, no rompemos la app: volvemos a initialValue.
      return initialValue;
    }
  });

  // Persistimos cualquier cambio.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // En modo privado o con storage lleno, localStorage puede fallar.
      // No hacemos nada: la app seguirá funcionando sin persistencia.
    }
  }, [key, value]);

  return [value, setValue];
}
