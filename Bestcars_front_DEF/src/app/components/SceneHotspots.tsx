import React from "react";
import { Link } from "react-router-dom";
import type { Hotspot } from "../../services/api.js";
import type { Vehicle } from "../../types/vehicle.js";
import "./SceneHotspots.css";

interface SceneHotspotsProps {
  hotspots: Hotspot[];
  vehicles: Vehicle[];
}

export default function SceneHotspots({ hotspots = [], vehicles = [] }: SceneHotspotsProps) {
  const safeHotspots = Array.isArray(hotspots) ? hotspots : [];
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  const vehicleMap = new Map(safeVehicles.map((v) => [v.id, v]));

  return (
    <>
      {safeHotspots.map((h) => {
        const vehicle = vehicleMap.get(h.vehicleId);
        if (!vehicle) return null;
        return (
          <Link
            key={h.id}
            to={`/vehicle/${vehicle.id}`}
            className="scene-hotspot"
            style={{
              left: `${(0.5 + h.x) * 100}%`,
              top: `${(0.5 + h.y) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
            aria-label={vehicle.title ?? vehicle.id}
          >
            <span className="scene-hotspot-hitarea" aria-hidden="true" />
            <span className="scene-hotspot-label" aria-hidden="true">
              {vehicle.title ?? vehicle.id}
            </span>
            <span className="scene-hotspot-dot" />
            <span className="scene-hotspot-ring" />
          </Link>
        );
      })}
    </>
  );
}

