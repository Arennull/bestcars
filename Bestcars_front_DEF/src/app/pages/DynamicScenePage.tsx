import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, type Scene, sceneHotspots } from "../../services/api.js";
import type { Vehicle } from "../../types/vehicle.js";
import SceneHotspots from "../components/SceneHotspots";
import NextSceneButton from "../components/NextSceneButton";
// @ts-expect-error - Imagen con espacios en el nombre (fallback de fondo)
import fallbackImage from "../../assets/Ilustración_sin_título 103.jpg";
import "./DynamicScenePage.css";

/**
 * Página de escena dinámica (escena 2+). No modifica Home ni CarHotspots.
 * Carga escena activa del backend (o primera del listado) y renderiza background + hotspots.
 */
export default function DynamicScenePage() {
  const [searchParams] = useSearchParams();
  const indexParam = searchParams.get("index");

  const [scenes, setScenes] = useState<Scene[]>([]);
  const [activeScene, setActiveScene] = useState<Scene | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadSceneData = () => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    Promise.all([api.getScenes(), api.getAllVehicles()])
      .then(([list, vList]) => {
        if (cancelled) return;
        const sceneList = Array.isArray(list) ? (list as Scene[]) : [];
        setScenes(sceneList);
        setVehicles(Array.isArray(vList) ? vList : []);

        const byIndex =
          indexParam !== null && indexParam !== ""
            ? Math.max(0, parseInt(indexParam, 10) || 0)
            : null;

        let chosen: Scene | null = null;
        if (byIndex !== null && sceneList[byIndex]) {
          chosen = sceneList[byIndex];
        } else {
          chosen = sceneList[0] ?? null;
        }
        setActiveScene(chosen);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  };

  useEffect(() => {
    const cancel = loadSceneData();
    return cancel;
  }, [indexParam]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") loadSceneData();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [indexParam]);

  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  const hotspots = sceneHotspots(activeScene);
  const safeHotspots = Array.isArray(hotspots) ? hotspots : [];

  const background =
    activeScene?.backgroundUrl?.trim()
      ? activeScene.backgroundUrl
      : fallbackImage;

  if (loading) {
    return (
      <div className="dynamic-scene-page dynamic-scene-page--loading">
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !activeScene) {
    return (
      <div className="dynamic-scene-page dynamic-scene-page--empty">
        <p className="text-white/60">
          {error ? "Error al cargar la escena." : "No hay escena disponible."}
        </p>
        <Link
          to="/"
          className="mt-4 px-4 py-2 border border-white/30 text-white rounded-sm hover:bg-white/10 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  const currentIndex = indexParam !== null ? Math.max(0, parseInt(indexParam, 10) || 0) : 0;

  return (
    <div className="dynamic-scene-page">
      <div
        className="dynamic-scene-page__canvas"
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <SceneHotspots hotspots={safeHotspots} vehicles={safeVehicles} />
      </div>
      <Link
        to="/garage"
        className="dynamic-scene-page__home-link"
        aria-label="Volver al garaje"
      >
        Volver al garaje
      </Link>
      {scenes.length >= 2 && (
        <NextSceneButton
          sceneIndex={currentIndex}
          totalScenes={scenes.length}
        />
      )}
    </div>
  );
}
