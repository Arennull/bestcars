import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { SceneEditorStorage, Scene, Hotspot } from "../app/types/scene-editor";
import { createEmptyScene } from "../app/types/scene-editor";
import {
  getScenes,
  getActiveScene,
  createScene as apiCreateScene,
  updateScene as apiUpdateScene,
  deleteScene as apiDeleteScene,
  setActiveScene as apiSetActiveScene,
  duplicateScene as apiDuplicateScene,
} from "../services/api";
import type { ApiScene } from "../services/api";

/** Convierte escena del API (hotspots[] o positions legacy) a escena del editor */
export function apiSceneToEditorScene(api: ApiScene): Scene {
  let hotspots: Hotspot[] = [];
  if (Array.isArray(api.hotspots) && api.hotspots.length > 0) {
    hotspots = api.hotspots.map((h) => ({
      id: h.id,
      vehicleId: h.vehicleId,
      x: Number(h.x) || 0,
      y: Number(h.y) || 0,
      createdAt: h.createdAt,
    }));
  } else if (api.positions && typeof api.positions === "object" && !Array.isArray(api.positions)) {
    for (const [slotId, slot] of Object.entries(api.positions)) {
      const s = slot as { vehicleId: string | null; transform?: { x: number; y: number }; updatedAt?: string };
      if (!s?.vehicleId) continue;
      const t = s.transform ?? { x: 0, y: 0 };
      hotspots.push({
        id: slotId,
        vehicleId: s.vehicleId,
        x: Number(t.x) || 0,
        y: Number(t.y) || 0,
        createdAt: s.updatedAt,
      });
    }
  }
  return {
    id: api.id,
    name: api.name,
    backgroundUrl: api.backgroundUrl ?? "",
    hotspots,
    createdAt: api.createdAt ?? new Date().toISOString(),
    updatedAt: api.updatedAt ?? new Date().toISOString(),
  };
}

export function useSceneEditorApi(
  apiMode: boolean,
  isAuthenticated: boolean,
  storage: SceneEditorStorage,
  setStorage: React.Dispatch<React.SetStateAction<SceneEditorStorage>>
) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!apiMode || !isAuthenticated) return;

    let cancelled = false;
    setLoading(true);

    Promise.all([getScenes(), getActiveScene()])
      .then(([scenes, activeSceneFromWeb]) => {
        if (cancelled) return;
        if (scenes.length === 0) return;

        const editorScenes = scenes.map(apiSceneToEditorScene);
        const activeId = activeSceneFromWeb?.id ?? scenes.find((s) => s.isActive)?.id ?? scenes[0]?.id;
        const ordered =
          activeId != null && editorScenes.length > 1
            ? [
                ...editorScenes.filter((s) => s.id === activeId),
                ...editorScenes.filter((s) => s.id !== activeId),
              ]
            : editorScenes;
        const firstId = ordered[0]?.id;
        setStorage((prev) => ({
          ...prev,
          scenes: ordered,
          activeSceneId: firstId ?? prev.activeSceneId,
          activeHotspotId: prev.activeHotspotId,
          previewUrl: prev.previewUrl,
          webActiveSceneId: activeId ?? null,
        }));
      })
      .catch((err) => {
        if (!cancelled) toast.error(err instanceof Error ? err.message : "Error al cargar escenas");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiMode, isAuthenticated, setStorage]);

  type PersistOptions = { silentSuccess?: boolean };
  const persistScene = useCallback(
    async (scene: Scene, options?: PersistOptions): Promise<{ ok: true; sceneId: string } | { ok: false }> => {
      if (!apiMode || !isAuthenticated) return { ok: false };

      const payload = {
        name: scene.name,
        backgroundUrl: scene.backgroundUrl,
        hotspots: scene.hotspots ?? [],
      };

      const successToast =
        (scene.hotspots?.length ?? 0) === 0
          ? "Escena guardada sin hotspots"
          : "Escena guardada";
      const silent = options?.silentSuccess === true;

      // 1) Intentar actualizar siempre
      try {
        const updated = await apiUpdateScene(scene.id, payload);
        const editorScene = apiSceneToEditorScene(updated);
        setStorage((prev) => ({
          ...prev,
          scenes: prev.scenes.map((s) => (s.id === scene.id ? editorScene : s)),
        }));
        if (!silent) toast.success(successToast);
        return { ok: true, sceneId: updated.id };
      } catch (err) {
        const msg = err instanceof Error ? err.message || "" : String(err ?? "");
        // Si es NOT_FOUND / no existe, probamos a crearla
        if (msg.toLowerCase().includes("not found")) {
          try {
            const created = await apiCreateScene(payload);
            const editorScene = apiSceneToEditorScene(created);
            setStorage((prev) => ({
              ...prev,
              scenes: prev.scenes.map((s) =>
                s.id === scene.id ? editorScene : s
              ),
              activeSceneId:
                prev.activeSceneId === scene.id ? created.id : prev.activeSceneId,
            }));
            if (!silent) toast.success(successToast);
            return { ok: true, sceneId: created.id };
          } catch (err2) {
            toast.error(
              err2 instanceof Error
                ? err2.message || "No se pudo guardar la escena. Reintenta."
                : "No se pudo guardar la escena. Reintenta."
            );
            return { ok: false };
          }
        }
        toast.error(
          msg || "No se pudo guardar la escena. Reintenta."
        );
        return { ok: false };
      }
    },
    [apiMode, isAuthenticated, setStorage]
  );

  const deleteSceneApi = useCallback(
    async (sceneId: string) => {
      if (!apiMode || !isAuthenticated) return;
      if (sceneId.startsWith("scene_")) return;

      try {
        await apiDeleteScene(sceneId);
        setStorage((prev) => {
          const next = prev.scenes.filter((s) => s.id !== sceneId);
          if (next.length === 0) {
            const fallback = createEmptyScene({ name: "Escena 1", backgroundUrl: "" });
            return {
              ...prev,
              scenes: [fallback],
              activeSceneId: fallback.id,
              activeHotspotId: null,
            };
          }
          return {
            ...prev,
            scenes: next,
            activeSceneId: prev.activeSceneId === sceneId ? next[0].id : prev.activeSceneId,
            activeHotspotId: prev.activeHotspotId,
          };
        });
        toast.success("Escena eliminada");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al eliminar");
      }
    },
    [apiMode, isAuthenticated, setStorage]
  );

  const setActiveSceneApi = useCallback(
    async (sceneId: string, options?: { silentSuccess?: boolean }): Promise<boolean> => {
      if (!apiMode || !isAuthenticated) return false;
      try {
        await apiSetActiveScene(sceneId);
        if (options?.silentSuccess !== true) toast.success("Escena activada en la web");
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al activar");
        return false;
      }
    },
    [apiMode, isAuthenticated]
  );

  const duplicateSceneApi = useCallback(
    async (sceneId: string) => {
      if (!apiMode || !isAuthenticated) return;
      if (sceneId.startsWith("scene_")) {
        toast.error("Guarda la escena primero para poder duplicarla");
        return;
      }
      try {
        const created = await apiDuplicateScene(sceneId);
        const editorScene = apiSceneToEditorScene(created);
        setStorage((prev) => ({
          ...prev,
          scenes: [...prev.scenes, editorScene],
          activeSceneId: editorScene.id,
          activeHotspotId: null,
        }));
        toast.success("Escena duplicada");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al duplicar");
      }
    },
    [apiMode, isAuthenticated, setStorage]
  );

  /** Refresca cache local: GET /api/scenes y GET /api/scenes/active (tras Guardar y publicar). */
  const refreshScenesFromApi = useCallback(async () => {
    if (!apiMode || !isAuthenticated) return;
    try {
      const [scenes, activeSceneFromWeb] = await Promise.all([getScenes(), getActiveScene()]);
      const editorScenes = scenes.map(apiSceneToEditorScene);
      const activeId = activeSceneFromWeb?.id ?? scenes.find((s: ApiScene) => s.isActive)?.id ?? scenes[0]?.id;
      const ordered =
        activeId != null && editorScenes.length > 1
          ? [
              ...editorScenes.filter((s) => s.id === activeId),
              ...editorScenes.filter((s) => s.id !== activeId),
            ]
          : editorScenes;
      setStorage((prev) => ({
        ...prev,
        scenes: ordered,
        webActiveSceneId: activeId ?? null,
      }));
    } catch {
      // silenciar; el toast ya se mostró en activate
    }
  }, [apiMode, isAuthenticated, setStorage]);

  return { loading, persistScene, deleteSceneApi, setActiveSceneApi, duplicateSceneApi, refreshScenesFromApi };
}
