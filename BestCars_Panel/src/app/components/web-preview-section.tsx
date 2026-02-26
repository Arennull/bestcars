/**
 * Vista previa de la web pública.
 * Dos modos: simulada (mockup) o real (iframe que carga la URL de tu web).
 * En modo real, envía los vehículos vía postMessage para que la web se actualice.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Eye, Phone, Heart, Share2, Gauge, Calendar, Fuel,
  Settings, MapPin, Mail, Menu, Search, Filter,
  ChevronRight, Zap, Shield, Award, Star,
  Facebook, Instagram, Twitter, Linkedin,
  Globe, Monitor, RefreshCw,
} from "lucide-react";
import { Vehicle } from "../data/mock-data";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useLocalStorageState } from "../hooks/use-local-storage-state";

// URL de la web para ver cambios en vivo (local o producción)
const DEFAULT_WEB_PREVIEW_URL =
  (typeof import.meta !== "undefined" && (import.meta as { env?: { VITE_WEB_PREVIEW_URL?: string } }).env?.VITE_WEB_PREVIEW_URL) ||
  "http://localhost:5173";

interface WebPreviewSectionProps {
  vehicles: Vehicle[];
  onVehiclePreview: (vehicle: Vehicle) => void;
}

export function WebPreviewSection({ vehicles, onVehiclePreview }: WebPreviewSectionProps) {
  const [filterType, setFilterType] = useState<"all" | "disponible" | "premium">("all");
  const [sortBy, setSortBy] = useState<"recent" | "price-low" | "price-high">("recent");
  const [previewMode, setPreviewMode] = useState<"simulada" | "real">("real");
  const [previewUrl, setPreviewUrl] = useLocalStorageState(
    "bestcars_web_preview_url",
    DEFAULT_WEB_PREVIEW_URL
  );
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const refreshIframe = () => {
    setIframeKey((k) => k + 1);
  };

  const availableVehicles = useMemo(
    () => vehicles.filter((v) => v.status === "disponible"),
    [vehicles]
  );

  // Vehículos filtrados y ordenados (memoizado)
  const sortedVehicles = useMemo(() => {
    const filtered =
      filterType === "disponible"
        ? vehicles.filter((v) => v.status === "disponible")
        : filterType === "premium"
          ? vehicles.filter((v) => v.price > 50000)
          : vehicles;

    return [...filtered].sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [vehicles, filterType, sortBy]);

  const effectiveUrl = previewUrl?.trim() || DEFAULT_WEB_PREVIEW_URL;

  // Envía los vehículos al iframe de la web real cuando está en modo "real"
  useEffect(() => {
    if (previewMode !== "real" || !effectiveUrl || !iframeRef.current?.contentWindow) return;

    const payload = {
      type: "BESTCARS_WEB_PREVIEW_VEHICLES",
      payload: {
        vehicles: sortedVehicles,
        filterType,
        sortBy,
      },
    };

    try {
      iframeRef.current.contentWindow.postMessage(payload, "*");
    } catch {
      // El iframe puede no estar cargado o tener restricciones CORS
    }
  }, [previewMode, effectiveUrl, sortedVehicles, filterType, sortBy]);

  // La web destino puede pedir el estado con este mensaje
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string };
      if (data?.type === "BESTCARS_WEB_PREVIEW_REQUEST_STATE") {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "BESTCARS_WEB_PREVIEW_VEHICLES",
            payload: { vehicles: sortedVehicles, filterType, sortBy },
          },
          "*"
        );
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sortedVehicles, filterType, sortBy]);

  const showIframe = previewMode === "real";

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Barra de estadísticas y controles de vista previa */}
      <div className="flex-shrink-0 px-8 pt-6 pb-4 border-b border-white/5 bg-black/40 backdrop-blur-xl space-y-4">
        {/* Selector de modo: simulada vs web real */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex rounded-xl border border-white/10 overflow-hidden">
            <button
              type="button"
              onClick={() => setPreviewMode("simulada")}
              className={`px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
                previewMode === "simulada"
                  ? "bg-blue-500/20 text-blue-400 border-r border-blue-500/30"
                  : "text-white/60 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <Monitor className="w-4 h-4" />
              Vista simulada
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("real")}
              className={`px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
                previewMode === "real"
                  ? "bg-blue-500/20 text-blue-400 border-l border-blue-500/30"
                  : "text-white/60 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <Globe className="w-4 h-4" />
              Web real (iframe)
            </button>
          </div>

          {previewMode === "real" && (
            <div className="flex-1 min-w-[200px] flex flex-wrap items-center gap-2">
              <input
                type="url"
                value={previewUrl}
                onChange={(e) => setPreviewUrl(e.target.value)}
                placeholder={DEFAULT_WEB_PREVIEW_URL}
                className="flex-1 min-w-[280px] px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/90 placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 text-sm"
              />
              <span className="text-xs text-white/40 max-w-xs">
                URL de la web (ej. http://localhost:5173 en local). Usa &quot;Actualizar vista&quot; tras cambiar datos para ver los cambios.
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl p-3"
          >
            <p className="text-xs text-white/50 mb-1">Publicados</p>
            <p className="text-xl text-white">{availableVehicles.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/[0.05] to-blue-500/[0.02] backdrop-blur-xl p-3"
          >
            <p className="text-xs text-white/50 mb-1">Vistas Web</p>
            <p className="text-xl text-white">{vehicles.reduce((acc, v) => acc + v.views, 0).toLocaleString()}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-white/10 bg-gradient-to-br from-green-500/[0.05] to-green-500/[0.02] backdrop-blur-xl p-3"
          >
            <p className="text-xs text-white/50 mb-1">Conversiones</p>
            <p className="text-xl text-white">{vehicles.reduce((acc, v) => acc + v.leads, 0)}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/[0.05] to-purple-500/[0.02] backdrop-blur-xl p-3"
          >
            <p className="text-xs text-white/50 mb-1">Tasa CVR</p>
            <p className="text-xl text-white">
              {vehicles.reduce((acc, v) => acc + v.views, 0) > 0 
                ? ((vehicles.reduce((acc, v) => acc + v.leads, 0) / vehicles.reduce((acc, v) => acc + v.views, 0)) * 100).toFixed(1)
                : '0'}%
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contenido: iframe de web real o vista simulada */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-black">
        {showIframe ? (
          <>
            <div className="flex-shrink-0 px-4 py-2 border-b border-white/5 flex items-center justify-between gap-2 text-sm text-white/50">
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {effectiveUrl}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refreshIframe}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-xs transition-colors"
                  title="Actualizar vista para ver los últimos cambios"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Actualizar vista
                </button>
                <a
                  href={effectiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-xs transition-colors"
                >
                  Abrir en nueva pestaña
                </a>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={effectiveUrl}
                title="Vista previa de la web enlazada"
                className="w-full h-full border-0 bg-white"
              />
            </div>
          </>
        ) : (
          <div className="h-full overflow-y-auto bg-gradient-to-b from-black via-gray-950 to-black">
            {/* Contenedor de la web simulada */}
            <div className="min-h-full">
          {/* Website Header */}
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm"
          >
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="Best Cars" className="h-8 w-auto" />
                </div>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                  <a href="#" className="text-sm text-gray-900 hover:text-blue-600 transition-colors">Stock</a>
                  <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Servicios</a>
                  <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Financiación</a>
                  <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Contacto</a>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm">
                    Contacto
                  </button>
                  <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                    <Menu className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </motion.header>

          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }} />
            </div>

            <div className="relative max-w-7xl mx-auto px-6 py-20">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-3xl"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                  <Award className="w-4 h-4" />
                  <span className="text-sm">Más de 500 vehículos premium vendidos</span>
                </div>
                <h1 className="text-5xl md:text-6xl mb-6 leading-tight">
                  Encuentra el coche de tus sueños
                </h1>
                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  Vehículos premium certificados con garantía extendida. Financiación flexible y entrega a domicilio.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="px-8 py-4 rounded-xl bg-white text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-xl">
                    <span>Ver Stock Completo</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors">
                    Solicitar Tasación
                  </button>
                </div>
              </motion.div>

              {/* Floating Stats */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4">
                <div className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
                  <p className="text-3xl mb-1">500+</p>
                  <p className="text-sm text-white/80">Vehículos Vendidos</p>
                </div>
                <div className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
                  <p className="text-3xl mb-1">4.9★</p>
                  <p className="text-sm text-white/80">Valoración Media</p>
                </div>
              </div>
            </div>

            {/* Wave Divider */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H0Z" fill="white"/>
              </svg>
            </div>
          </motion.section>

          {/* Features Bar */}
          <section className="bg-white py-8 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: Shield, title: 'Garantía Premium', desc: 'Hasta 3 años' },
                  { icon: Zap, title: 'Entrega Express', desc: 'En 48-72h' },
                  { icon: Award, title: 'Certificación', desc: 'Revisión 200 puntos' },
                  { icon: Phone, title: 'Asesoramiento', desc: '24/7 disponible' },
                ].map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="p-3 rounded-xl bg-blue-50">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{feature.title}</p>
                      <p className="text-xs text-gray-500">{feature.desc}</p>
                    </div>
                  </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Filter Bar */}
          <section className="bg-gray-50 py-6 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                {/* Search */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar marca, modelo..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as "all" | "disponible" | "premium")}
                      className="text-sm text-gray-700 bg-transparent border-none outline-none cursor-pointer"
                    >
                      <option value="all">Todos ({vehicles.length})</option>
                      <option value="disponible">Disponibles ({availableVehicles.length})</option>
                      <option value="premium">Premium ({vehicles.filter(v => v.price > 50000).length})</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200">
                    <Settings className="w-4 h-4 text-gray-600" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "recent" | "price-low" | "price-high")}
                      className="text-sm text-gray-700 bg-transparent border-none outline-none cursor-pointer"
                    >
                      <option value="recent">Más recientes</option>
                      <option value="price-low">Precio: Menor a Mayor</option>
                      <option value="price-high">Precio: Mayor a Menor</option>
                    </select>
                  </div>

                  <span className="text-sm text-gray-600 px-3">
                    {sortedVehicles.length} vehículos
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Vehicles Grid */}
          <section className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-6">
              {sortedVehicles.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-xl text-gray-900 mb-2">No se encontraron vehículos</p>
                  <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedVehicles.map((vehicle, index) => (
                    <motion.div
                      key={vehicle.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      whileHover={{ y: -8 }}
                      onClick={() => onVehiclePreview(vehicle)}
                      className="group cursor-pointer rounded-2xl overflow-hidden bg-white border border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="relative h-64 overflow-hidden bg-gray-100">
                        <ImageWithFallback
                          src={vehicle.image}
                          alt={vehicle.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        
                        {/* Status Badge */}
                        <div className="absolute top-4 left-4">
                          {vehicle.status === 'disponible' && (
                            <div className="px-3 py-1.5 rounded-full bg-green-500 text-white text-xs shadow-lg flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              <span>Disponible</span>
                            </div>
                          )}
                          {vehicle.status === 'reservado' && (
                            <div className="px-3 py-1.5 rounded-full bg-orange-500 text-white text-xs shadow-lg">
                              Reservado
                            </div>
                          )}
                          {vehicle.status === 'vendido' && (
                            <div className="px-3 py-1.5 rounded-full bg-gray-800 text-white text-xs shadow-lg">
                              Vendido
                            </div>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => e.stopPropagation()}
                            className="p-2.5 rounded-full bg-white hover:bg-gray-50 shadow-lg transition-colors"
                          >
                            <Heart className="w-4 h-4 text-gray-700" />
                          </button>
                          <button 
                            onClick={(e) => e.stopPropagation()}
                            className="p-2.5 rounded-full bg-white hover:bg-gray-50 shadow-lg transition-colors"
                          >
                            <Share2 className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-8">
                          <button className="px-6 py-3 rounded-xl bg-white text-gray-900 flex items-center gap-2 shadow-2xl hover:bg-gray-100 transition-all transform scale-95 group-hover:scale-100">
                            <Eye className="w-5 h-5" />
                            <span>Ver Detalles Completos</span>
                          </button>
                        </div>

                        {/* Price Tag */}
                        <div className="absolute bottom-4 left-4 px-4 py-2 rounded-xl bg-white/95 backdrop-blur-sm shadow-lg">
                          <p className="text-2xl text-gray-900">{vehicle.price.toLocaleString()}€</p>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {/* Title */}
                        <div className="mb-4">
                          <h3 className="text-xl text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                            {vehicle.name}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {vehicle.year} • {vehicle.specs.kilometros.toLocaleString()} km
                          </p>
                        </div>

                        {/* Specs */}
                        <div className="grid grid-cols-3 gap-3 mb-5 pb-5 border-b border-gray-100">
                          <div className="text-center">
                            <div className="inline-flex p-2 rounded-lg bg-blue-50 mb-2">
                              <Gauge className="w-4 h-4 text-blue-600" />
                            </div>
                            <p className="text-xs text-gray-500">Potencia</p>
                            <p className="text-sm text-gray-900 mt-0.5">{vehicle.specs.potencia}</p>
                          </div>
                          <div className="text-center">
                            <div className="inline-flex p-2 rounded-lg bg-green-50 mb-2">
                              <Fuel className="w-4 h-4 text-green-600" />
                            </div>
                            <p className="text-xs text-gray-500">Combustible</p>
                            <p className="text-sm text-gray-900 mt-0.5">{vehicle.specs.combustible}</p>
                          </div>
                          <div className="text-center">
                            <div className="inline-flex p-2 rounded-lg bg-purple-50 mb-2">
                              <Settings className="w-4 h-4 text-purple-600" />
                            </div>
                            <p className="text-xs text-gray-500">Transmisión</p>
                            <p className="text-sm text-gray-900 mt-0.5">{vehicle.specs.transmision}</p>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-5">
                          {vehicle.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* CTA */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onVehiclePreview(vehicle);
                          }}
                          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Solicitar Información</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
            <div className="max-w-7xl mx-auto px-6 text-center text-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl mb-4">
                  ¿No encuentras lo que buscas?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Cuéntanos qué vehículo te gustaría y lo buscaremos para ti
                </p>
                <button className="px-8 py-4 rounded-xl bg-white text-gray-900 hover:bg-gray-100 transition-colors shadow-xl">
                  Solicitar Búsqueda Personalizada
                </button>
              </motion.div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                {/* Company */}
                <div>
                  <img src="/logo.png" alt="Best Cars" className="h-8 w-auto mb-4 opacity-80" />
                  <p className="text-sm text-gray-400 mb-4">
                    Tu concesionario de vehículos premium de confianza desde 2010
                  </p>
                  <div className="flex gap-3">
                    <a href="#" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                      <Facebook className="w-4 h-4" />
                    </a>
                    <a href="#" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                      <Instagram className="w-4 h-4" />
                    </a>
                    <a href="#" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                      <Twitter className="w-4 h-4" />
                    </a>
                    <a href="#" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Links */}
                <div>
                  <h4 className="text-sm mb-4">Compañía</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Equipo</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm mb-4">Servicios</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li><a href="#" className="hover:text-white transition-colors">Comprar</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Vender</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Financiación</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Seguros</a></li>
                  </ul>
                </div>

                {/* Contact */}
                <div>
                  <h4 className="text-sm mb-4">Contacto</h4>
                  <ul className="space-y-3 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Calle Principal 123, Madrid</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>+34 900 123 456</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span>info@luxurymotors.com</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                <p>© 2024 Best Cars Ibérica. Todos los derechos reservados.</p>
                <div className="flex gap-6">
                  <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                  <a href="#" className="hover:text-white transition-colors">Términos</a>
                  <a href="#" className="hover:text-white transition-colors">Cookies</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
          </div>
        )}
      </div>
    </div>
  );
}