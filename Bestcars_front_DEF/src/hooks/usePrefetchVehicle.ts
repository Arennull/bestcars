/**
 * Hook para prefetch de vehículo con debounce.
 * Usar en onMouseEnter (desktop) y onTouchStart (móvil).
 */

import { useCallback, useRef } from 'react';
import { api } from '../services/api.js';

const DEBOUNCE_MS = 180;

export function usePrefetchVehicle() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetch = useCallback((vehicleId: string) => {
    if (!vehicleId) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      api.prefetchVehicle(vehicleId);
    }, DEBOUNCE_MS);
  }, []);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { prefetch, cancel };
}
