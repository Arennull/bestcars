import { useCallback, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Toaster, toast } from "sonner";

import { DashboardLayout } from "./components/dashboard-layout";
import { Header } from "./components/header";
import { StockSection } from "./components/stock-section";
import { VehicleDetail } from "./components/vehicle-detail";
import { CreateVehicleModal } from "./components/create-vehicle-modal";
import { WebPreviewModal } from "./components/web-preview-modal";
import { WebPreviewSection } from "./components/web-preview-section";
import { LeadsSection } from "./components/leads-section";
import { StatsSection } from "./components/stats-section";
import { SettingsSection } from "./components/settings-section";
import { SceneEditorSection } from "./components/scene-editor-section";

import { mockVehicles, mockLeads, Vehicle, Lead } from "./data/mock-data";
import { useLocalStorageState } from "./hooks/use-local-storage-state";

/**
 * Secciones disponibles del panel.
 *
 * Tener un tipo "cerrado" evita bugs típicos (typos) y hace que TypeScript
 * te avise si te dejas algo sin renderizar.
 */
type SectionId = "stock" | "leads" | "stats" | "scene" | "settings" | "webpreview";

export default function App() {
  // Sección que se está mostrando en el panel.
  const [activeSection, setActiveSection] = useState<SectionId>("stock");

  // Datos principales del panel. Persisten en localStorage para que el usuario
  // no pierda cambios al refrescar la página.
  const [vehicles, setVehicles] = useLocalStorageState<Vehicle[]>(
    "autopanel_vehicles",
    mockVehicles,
  );
  const [leads, setLeads] = useLocalStorageState<Lead[]>("autopanel_leads", mockLeads);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isWebPreviewOpen, setIsWebPreviewOpen] = useState(false);
  const [previewVehicle, setPreviewVehicle] = useState<Vehicle | null>(null);

  /** Actualiza un vehículo por ID y sincroniza el detalle si está abierto */
  const handleVehicleUpdate = useCallback((vehicleId: string, updates: Partial<Vehicle>) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          return { ...v, ...updates, updatedAt: new Date().toISOString() };
        }
        return v;
      }),
    );

    // Si el detalle está abierto, mantenemos la vista sincronizada.
    if (selectedVehicle?.id === vehicleId) {
      setSelectedVehicle((prev) => (prev ? { ...prev, ...updates } : null));
    }

    toast.success("Vehículo actualizado correctamente");
  }, [selectedVehicle?.id, setVehicles]);

  /** Reordena la lista de vehículos actualizando prioridades */
  const handleVehicleReorder = useCallback((reorderedVehicles: Vehicle[]) => {
    const updatedVehicles = reorderedVehicles.map((v, index) => ({
      ...v,
      priority: index + 1,
    }));
    setVehicles(updatedVehicles);
  }, [setVehicles]);

  /** Actualiza el precio de un vehículo y registra el historial */
  const handlePriceUpdate = useCallback((vehicleId: string, newPrice: number) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          const priceHistory = [
            ...v.priceHistory,
            { date: new Date().toISOString(), price: newPrice },
          ];
          return {
            ...v,
            price: newPrice,
            priceHistory,
            updatedAt: new Date().toISOString(),
          };
        }
        return v;
      }),
    );

    toast.success("Precio actualizado correctamente");
  }, [setVehicles]);

  /** Actualiza un lead por ID */
  const handleLeadUpdate = useCallback((leadId: string, updates: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          return { ...l, ...updates };
        }
        return l;
      }),
    );

    toast.success("Lead actualizado correctamente");
  }, [setLeads]);

  const handleVehicleClick = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedVehicle(null);
  }, []);

  const handleCreateVehicle = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  /** Crea un nuevo vehículo con ID, fechas y prioridad auto-generados */
  const handleSaveNewVehicle = useCallback((
    vehicle: Omit<Vehicle, "id" | "createdAt" | "updatedAt" | "priority">,
  ) => {
    const now = new Date().toISOString();
    setVehicles((prev) => {
      const newVehicle: Vehicle = {
        ...vehicle,
        id: `v${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        priority: prev.length + 1,
      };
      return [...prev, newVehicle];
    });
    toast.success(`Vehículo "${vehicle.name}" creado correctamente`);
  }, [setVehicles]);

  const handleWebPreview = useCallback((vehicle: Vehicle) => {
    setPreviewVehicle(vehicle);
    setIsWebPreviewOpen(true);
  }, []);
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredVehicles = useMemo(() => {
    if (!normalizedQuery) return vehicles;
    return vehicles.filter(
      (v) =>
        v.name.toLowerCase().includes(normalizedQuery) ||
        v.brand.toLowerCase().includes(normalizedQuery) ||
        v.model.toLowerCase().includes(normalizedQuery),
    );
  }, [vehicles, normalizedQuery]);

  /**
   * Filtra leads por texto libre (nombre, email, teléfono).
   *
   * Nota: LeadsSection además aplica filtros propios por status/origen.
   */
  const filteredLeads = useMemo(() => {
    if (!normalizedQuery) return leads;
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(normalizedQuery) ||
        l.email.toLowerCase().includes(normalizedQuery) ||
        l.phone.toLowerCase().includes(normalizedQuery),
    );
  }, [leads, normalizedQuery]);

  const sectionTitles: Record<SectionId, string> = {
    stock: "Gestión de Stock",
    leads: "Gestión de Leads",
    stats: "Estadísticas y Rendimiento",
    scene: "Editor de Escena",
    settings: "Configuración",
    webpreview: "Vista Previa Web",
  };

  const searchPlaceholders: Record<SectionId, string> = {
    stock: "Buscar vehículos por marca, modelo...",
    leads: "Buscar leads por nombre, email...",
    stats: "Filtrar estadísticas...",
    scene: "Buscar vehículos para colocar...",
    settings: "Buscar configuración...",
    webpreview: "Buscar en vista web...",
  };

  return (
    <div className="min-h-screen bg-black">
      <DashboardLayout activeSection={activeSection} onSectionChange={setActiveSection}>
        <Header
          title={sectionTitles[activeSection]}
          searchPlaceholder={searchPlaceholders[activeSection]}
          searchValue={searchQuery}
          onSearch={setSearchQuery}
        />

        <div
          className={
            activeSection === "webpreview"
              ? "flex-1 flex flex-col min-h-0 overflow-hidden"
              : "flex-1 overflow-y-auto"
          }
        >
          {activeSection === "stock" && (
            <StockSection
              vehicles={filteredVehicles}
              onVehicleClick={handleVehicleClick}
              onReorder={handleVehicleReorder}
              onPriceUpdate={handlePriceUpdate}
              onCreateVehicle={handleCreateVehicle}
            />
          )}

          {activeSection === "leads" && (
            <LeadsSection leads={filteredLeads} vehicles={vehicles} onLeadUpdate={handleLeadUpdate} />
          )}

          {activeSection === "stats" && <StatsSection vehicles={filteredVehicles} />}

          {activeSection === "scene" && (
            <SceneEditorSection vehicles={vehicles} searchQuery={searchQuery} />
          )}

          {activeSection === "settings" && <SettingsSection />}

          {activeSection === "webpreview" && (
            <WebPreviewSection vehicles={filteredVehicles} onVehiclePreview={handleWebPreview} />
          )}
        </div>
      </DashboardLayout>

      <AnimatePresence>
        {selectedVehicle && (
          <VehicleDetail
            vehicle={selectedVehicle}
            onClose={handleCloseDetail}
            onUpdate={handleVehicleUpdate}
            onWebPreview={handleWebPreview}
          />
        )}
      </AnimatePresence>

      <CreateVehicleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveNewVehicle}
      />

      <WebPreviewModal
        isOpen={isWebPreviewOpen}
        onClose={() => setIsWebPreviewOpen(false)}
        vehicle={previewVehicle}
      />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(0, 0, 0, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "white",
            backdropFilter: "blur(20px)",
          },
        }}
      />
    </div>
  );
}
