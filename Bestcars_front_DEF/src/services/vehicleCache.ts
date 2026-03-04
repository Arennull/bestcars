/**
 * Caché en memoria para datos de vehículos prefetched.
 * Máximo 10 entradas (LRU). Usado para navegación instantánea desde Garage/Home.
 */

import type { Vehicle } from '../types/vehicle.js';

const MAX_SIZE = 10;

/** Map id -> { vehicle, timestamp } para orden LRU */
const cache = new Map<string, { vehicle: Vehicle; at: number }>();

/** IDs en orden de acceso (el primero es el más antiguo) */
const accessOrder: string[] = [];

function evictIfNeeded() {
  while (cache.size >= MAX_SIZE && accessOrder.length > 0) {
    const oldest = accessOrder.shift();
    if (oldest) cache.delete(oldest);
  }
}

function touch(id: string) {
  const idx = accessOrder.indexOf(id);
  if (idx >= 0) accessOrder.splice(idx, 1);
  accessOrder.push(id);
}

/**
 * Obtiene un vehículo del caché si existe.
 */
export function getCachedVehicle(id: string): Vehicle | null {
  const entry = cache.get(id);
  if (!entry) return null;
  touch(id);
  return entry.vehicle;
}

/**
 * Guarda un vehículo en el caché.
 */
export function setCachedVehicle(vehicle: Vehicle): void {
  evictIfNeeded();
  cache.set(vehicle.id, { vehicle, at: Date.now() });
  touch(vehicle.id);
}

/**
 * Comprueba si un vehículo está en caché.
 */
export function hasCachedVehicle(id: string): boolean {
  return cache.has(id);
}
