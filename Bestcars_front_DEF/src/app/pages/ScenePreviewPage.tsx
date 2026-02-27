import React, { useEffect, useState } from "react";
import { type Scene, sceneHotspots } from "../../services/api.js";
import type { Vehicle } from "../../types/vehicle.js";
import SceneHotspots from "../components/SceneHotspots";
import homeImage from "../../assets/Bestcars-home.png";

interface SceneState {
  scene: Scene | null;
  vehicles: Vehicle[];
}

export default function ScenePreviewPage() {
  const [state, setState] = useState<SceneState>({ scene: null, vehicles: [] });
  const [loading, setLoading] = useState(true);

  // Solo escucha datos del editor vía postMessage (no carga del API)
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.type !== "BESTCARS_SCENE_EDITOR_STATE") return;

      const { scene, vehicles: payloadVehicles } = data.payload ?? {};
      if (scene) {
        setLoading(false);
        setState({
          scene: scene as Scene,
          vehicles: Array.isArray(payloadVehicles) ? payloadVehicles as Vehicle[] : [],
        });
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Tell parent we're ready (panel can send state)
  useEffect(() => {
    window.parent?.postMessage({ type: "BESTCARS_SCENE_EDITOR_REQUEST_STATE" }, "*");
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const { scene, vehicles } = state;
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  const hotspots = sceneHotspots(scene);
  const safeHotspots = Array.isArray(hotspots) ? hotspots : [];

  const background =
    scene?.backgroundUrl && scene.backgroundUrl.trim().length > 0
      ? scene.backgroundUrl
      : homeImage;

  if (!scene) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white/50">
        <p>No hay escena activa. Configura una en el panel.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <div
        className="relative w-full"
        style={{
          aspectRatio: "5803 / 3264",
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <SceneHotspots hotspots={safeHotspots} vehicles={safeVehicles} />
      </div>
    </div>
  );
}
