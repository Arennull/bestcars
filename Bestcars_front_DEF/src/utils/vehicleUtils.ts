import { Fuel, Gauge, Users, Calendar, type LucideProps } from 'lucide-react';
import { type ComponentType } from 'react';
import type { Vehicle } from '../types/vehicle.js';

/**
 * Check if the current device is mobile
 */
export function isMobileDevice(): boolean {
  return window.innerWidth <= 768; // Standard mobile breakpoint
}

/**
 * Check if an image is vertical (portrait) orientation
 */
export function isImageVertical(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(img.naturalHeight > img.naturalWidth);
    };
    img.onerror = () => {
      // Default to horizontal if can't load
      resolve(false);
    };
    img.src = src;
  });
}

/**
 * Group images by orientation for gallery display
 */
export async function groupImagesByOrientation(imageUrls: string[], isMobile: boolean = false): Promise<{
  horizontal: string[];
  verticalGroups: string[][];
}> {
  const orientations = await Promise.all(
    imageUrls.map(url => isImageVertical(url))
  );

  const horizontal: string[] = [];
  const vertical: string[] = [];

  imageUrls.forEach((url, index) => {
    if (orientations[index]) {
      vertical.push(url);
    } else {
      horizontal.push(url);
    }
  });

  // On mobile, don't group vertical images - treat them as individual horizontal images
  if (isMobile) {
    return { horizontal: [...horizontal, ...vertical], verticalGroups: [] };
  }

  // Group vertical images in sets of 3 for desktop
  const verticalGroups: string[][] = [];
  for (let i = 0; i < vertical.length; i += 3) {
    verticalGroups.push(vertical.slice(i, i + 3));
  }

  return { horizontal, verticalGroups };
}

type LucideIcon = ComponentType<LucideProps>;

export interface StatItem {
  icon: LucideIcon;
  label: string;
  value: string;
}

/**
 * Convert vehicle data to StatsRow format
 */
export function vehicleToStats(vehicle: Vehicle): StatItem[] {
  const stats: StatItem[] = [];

  if (vehicle.fuelType != null && String(vehicle.fuelType).trim()) {
    stats.push({
      icon: Fuel,
      label: 'Combustible',
      value: String(vehicle.fuelType).trim(),
    });
  }

  if (vehicle.mileage != null && String(vehicle.mileage).trim()) {
    stats.push({
      icon: Gauge,
      label: 'Kilometraje',
      value: String(vehicle.mileage).trim(),
    });
  }

  if (vehicle.seats != null && String(vehicle.seats).trim()) {
    stats.push({
      icon: Users,
      label: 'Asientos',
      value: String(vehicle.seats).trim(),
    });
  }

  if (vehicle.year != null) {
    stats.push({
      icon: Calendar,
      label: 'Año',
      value: String(vehicle.year),
    });
  }

  return stats;
}
