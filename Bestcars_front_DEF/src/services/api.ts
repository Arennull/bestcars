import type { Vehicle, ContactFormData, ContactSubmissionResponse, TestDriveFormData, TestDriveSubmissionResponse } from '../types/vehicle.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_VEHICLES_IMAGES = `${API_BASE_URL}/api/vehicles/images`;

/**
 * URL de imagen de vehículo (sincronizado con el panel y el backend).
 * Si ya es URL (http/https/data) se devuelve tal cual; si no, se usa el endpoint del API.
 */
export function getVehicleImageUrl(filenameOrUrl: string): string {
  if (!filenameOrUrl || typeof filenameOrUrl !== 'string') return '';
  const s = filenameOrUrl.trim();
  if (/^https?:\/\//i.test(s) || s.startsWith('data:')) return s;
  return `${API_VEHICLES_IMAGES}/${encodeURIComponent(s)}`;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(response.status, errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const api = {
  /**
   * Get all vehicles.
   * Acepta respuesta como array o como { data: Vehicle[] }.
   */
  async getAllVehicles(): Promise<Vehicle[]> {
    const raw = await fetchApi<Vehicle[] | { data: Vehicle[] }>('/api/vehicles');
    return Array.isArray(raw) ? raw : (raw?.data && Array.isArray(raw.data) ? raw.data : []);
  },

  /**
   * Get a single vehicle by ID.
   * Normaliza la respuesta para que images y tags sean siempre arrays.
   */
  async getVehicleById(id: string): Promise<Vehicle> {
    const raw = await fetchApi<Vehicle>(`/api/vehicles/${id}`);
    return {
      ...raw,
      images: Array.isArray(raw.images) ? raw.images : [],
      tags: Array.isArray(raw.tags) ? raw.tags : [],
    };
  },

  /**
   * Submit contact form
   */
  async submitContact(data: ContactFormData): Promise<ContactSubmissionResponse> {
    return fetchApi<ContactSubmissionResponse>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Submit test drive request
   */
  async submitTestDrive(data: TestDriveFormData): Promise<TestDriveSubmissionResponse> {
    return fetchApi<TestDriveSubmissionResponse>('/api/test-drive', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get active scene (for homepage/garage composition)
   */
  async getActiveScene(): Promise<Scene | null> {
    return fetchApi<Scene | null>('/api/scenes/active');
  },
};

export interface Scene {
  id: string;
  name: string;
  backgroundUrl: string;
  positions: Record<string, ScenePosition>;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScenePosition {
  vehicleId: string | null;
  transform: { x: number; y: number; scale: number; rotation: number };
  updatedAt: string;
}
