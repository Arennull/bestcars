import React from "react";
import { Link } from "react-router-dom";
import type { ScenePosition } from "../../services/api.js";
import type { Vehicle } from "../../types/vehicle.js";
import "./SceneHotspots.css";

interface SceneHotspotsProps {
  positions: Record<string, ScenePosition>;
  vehicles: Vehicle[];
  positionIds: string[];
}

export default function SceneHotspots({
  positions,
  vehicles,
  positionIds,
}: SceneHotspotsProps) {
  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));

  return (
    <>
      {positionIds.map((posId) => {
        const slot = positions[posId];
        if (!slot?.vehicleId) return null;

        const vehicle = vehicleMap.get(slot.vehicleId);
        if (!vehicle) return null;

        const t = slot.transform ?? { x: 0, y: 0, scale: 1, rotation: 0 };

        return (
          <Link
            key={posId}
            to={`/vehicle/${vehicle.id}`}
            className="scene-hotspot"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) translate(${t.x}px, ${t.y}px)`,
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

