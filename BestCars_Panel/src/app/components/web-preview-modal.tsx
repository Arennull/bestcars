/**
 * Modal de vista previa web de un vehículo concreto.
 * Galería de imágenes, especificaciones, equipamiento y formulario de contacto.
 */
import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Phone, Mail, MapPin, Calendar, Gauge, Fuel, Settings, Heart, Share2, 
  MessageCircle, ChevronLeft, ChevronRight, Maximize2, Download, 
  CheckCircle, Star, Award, Shield, Zap, TrendingUp, Users, Eye,
  Clock, Navigation, Droplet, Wind, Volume2, Bluetooth, Wifi,
  Camera, ParkingCircle, Sun
} from 'lucide-react';
import { Vehicle } from '../data/mock-data';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface WebPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}

export function WebPreviewModal({ isOpen, onClose, vehicle }: WebPreviewModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"specs" | "features" | "history" | "videos">("specs");

  // Imágenes del vehículo (array o fallback a la principal). Hooks antes del early return.
  const images = useMemo(
    () => (vehicle?.images?.length ? vehicle.images : vehicle ? [vehicle.image] : []),
    [vehicle]
  );

  const nextImage = useCallback(() => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  if (!isOpen || !vehicle) return null;

  // Datos mock de equipamiento adicional
  const additionalFeatures = {
    exterior: [
      'Faros LED automáticos',
      'Llantas de aleación 19"',
      'Pintura metalizada',
      'Techo panorámico',
      'Espejos eléctricos con memoria',
      'Sensores de aparcamiento delanteros y traseros',
    ],
    interior: [
      'Asientos de cuero premium',
      'Climatizador automático bi-zona',
      'Sistema de navegación GPS',
      'Pantalla táctil 12.3"',
      'Cargador inalámbrico',
      'Iluminación ambiental configurable',
    ],
    safety: [
      'Control de crucero adaptativo',
      'Asistente de mantenimiento de carril',
      'Frenado automático de emergencia',
      'Sistema de detección de ángulo muerto',
      'Cámara 360°',
      '8 airbags',
    ],
    technology: [
      'Apple CarPlay y Android Auto',
      'Sistema de audio premium 12 altavoces',
      'Bluetooth y USB-C',
      'Control por voz',
      'Head-up display',
      'Keyless entry',
    ],
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/95 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full h-full overflow-hidden bg-black"
        >
          {/* Sticky Header */}
          <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <img src="/logo.png" alt="Best Cars" className="h-10 w-auto" />
                <div className="h-6 w-px bg-white/20" />
                <div className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <span className="text-xs text-blue-400">Vista Previa Web</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm flex items-center gap-2 border border-white/10"
                >
                  Volver al Dashboard
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="h-[calc(100%-73px)] overflow-y-auto bg-black">
            {/* Image Gallery Section */}
            <div className="bg-gradient-to-b from-gray-900 to-black">
              <div className="max-w-7xl mx-auto">
                {/* Main Image */}
                <div className="relative aspect-[21/9] bg-gray-900 overflow-hidden group">
                  <ImageWithFallback
                    src={images[selectedImageIndex]}
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  
                  {/* Navegación de imágenes */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl transition-all opacity-0 group-hover:opacity-100 border border-white/20"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl transition-all opacity-0 group-hover:opacity-100 border border-white/20"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Contador de imágenes */}
                  <div className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-xl text-white border border-white/20">
                    <span className="text-sm">{selectedImageIndex + 1} / {images.length}</span>
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl transition-colors border border-white/20">
                      <Maximize2 className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl transition-colors border border-white/20">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    {vehicle.status === 'disponible' && (
                      <div className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 backdrop-blur-xl shadow-lg flex items-center gap-2 border border-green-500/30">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span>Disponible Ahora</span>
                      </div>
                    )}
                    {vehicle.status === 'reservado' && (
                      <div className="px-4 py-2 rounded-xl bg-orange-500/20 text-orange-400 backdrop-blur-xl shadow-lg border border-orange-500/30">
                        Reservado
                      </div>
                    )}
                  </div>
                </div>

                {/* Galería de miniaturas */}
                <div className="p-6 bg-black/50 backdrop-blur-sm border-b border-white/5">
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                          selectedImageIndex === idx
                            ? 'border-blue-500 shadow-lg shadow-blue-500/50 scale-105'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        <ImageWithFallback
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Title and Price */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl p-8 shadow-2xl"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h1 className="text-4xl text-white mb-3">{vehicle.name}</h1>
                        <div className="flex items-center gap-4 text-white/60 mb-4">
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {vehicle.year}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-white/30" />
                          <span className="flex items-center gap-2">
                            <Gauge className="w-4 h-4" />
                            {vehicle.specs.kilometros.toLocaleString()} km
                          </span>
                          <span className="w-1 h-1 rounded-full bg-white/30" />
                          <span className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            {vehicle.views} vistas
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {vehicle.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm border border-blue-500/20"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/50 mb-1">Precio</p>
                        <p className="text-4xl text-blue-400">{vehicle.price.toLocaleString()}€</p>
                        <p className="text-sm text-white/50 mt-2">IVA incluido</p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-3">
                      <button className="flex-1 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2">
                        <Phone className="w-5 h-5" />
                        <span>Llamar Ahora</span>
                      </button>
                      <button className="flex-1 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center justify-center gap-2 border border-white/10">
                        <MessageCircle className="w-5 h-5" />
                        <span>Enviar WhatsApp</span>
                      </button>
                      <button className="px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10">
                        <Heart className="w-5 h-5" />
                      </button>
                      <button className="px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>

                  {/* Key Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { icon: Gauge, label: 'Potencia', value: vehicle.specs.potencia, color: 'blue' },
                      { icon: Fuel, label: 'Combustible', value: vehicle.specs.combustible, color: 'green' },
                      { icon: Settings, label: 'Transmisión', value: vehicle.specs.transmision, color: 'purple' },
                      { icon: Calendar, label: 'Año', value: vehicle.year.toString(), color: 'orange' },
                    ].map((stat, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl p-5 text-center"
                      >
                        <div className={`inline-flex p-3 rounded-xl bg-${stat.color}-500/10 mb-3 border border-${stat.color}-500/20`}>
                          <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                        </div>
                        <p className="text-sm text-white/50 mb-1">{stat.label}</p>
                        <p className="text-lg text-white">{stat.value}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Description */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl p-8"
                  >
                    <h2 className="text-2xl text-white mb-4">Descripción</h2>
                    <p className="text-white/70 leading-relaxed">{vehicle.description}</p>
                  </motion.div>

                  {/* Tabs Section */}
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl overflow-hidden">
                    {/* Tab Headers */}
                    <div className="border-b border-white/10">
                      <div className="flex">
                        {([
                          { id: 'specs', label: 'Especificaciones', icon: Settings },
                          { id: 'features', label: 'Equipamiento', icon: CheckCircle },
                          { id: 'history', label: 'Historial', icon: Clock },
                          { id: 'videos', label: 'Videos y Clips', icon: Eye },
                        ] as const).map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 transition-colors relative ${
                              activeTab === tab.id
                                ? 'text-blue-400'
                                : 'text-white/60 hover:text-white/80'
                            }`}
                          >
                            <tab.icon className="w-5 h-5" />
                            <span>{tab.label}</span>
                            {activeTab === tab.id && (
                              <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-8">
                      {activeTab === 'specs' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-6"
                        >
                          <h3 className="text-xl text-white mb-4">Especificaciones Técnicas</h3>
                          <div className="grid grid-cols-2 gap-6">
                            {[
                              { label: 'Motor', value: vehicle.specs.motor, icon: Settings },
                              { label: 'Potencia', value: vehicle.specs.potencia, icon: Gauge },
                              { label: 'Combustible', value: vehicle.specs.combustible, icon: Fuel },
                              { label: 'Transmisión', value: vehicle.specs.transmision, icon: Settings },
                              { label: 'Kilómetros', value: `${vehicle.specs.kilometros.toLocaleString()} km`, icon: Navigation },
                              { label: 'Color', value: vehicle.specs.color, icon: Droplet },
                              { label: 'Año', value: vehicle.year.toString(), icon: Calendar },
                              { label: 'Puertas', value: '5 puertas', icon: Settings },
                            ].map((spec, idx) => (
                              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="p-3 rounded-lg bg-white/5">
                                  <spec.icon className="w-5 h-5 text-white/60" />
                                </div>
                                <div>
                                  <p className="text-sm text-white/50">{spec.label}</p>
                                  <p className="text-base text-white">{spec.value}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'features' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-6"
                        >
                          {/* Exterior */}
                          <div>
                            <h3 className="text-lg text-white mb-4 flex items-center gap-2">
                              <Sun className="w-5 h-5 text-blue-400" />
                              Exterior
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                              {additionalFeatures.exterior.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-white/70">
                                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Interior */}
                          <div className="pt-6 border-t border-white/10">
                            <h3 className="text-lg text-white mb-4 flex items-center gap-2">
                              <Settings className="w-5 h-5 text-purple-400" />
                              Interior
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                              {additionalFeatures.interior.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-white/70">
                                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Safety */}
                          <div className="pt-6 border-t border-white/10">
                            <h3 className="text-lg text-white mb-4 flex items-center gap-2">
                              <Shield className="w-5 h-5 text-green-400" />
                              Seguridad
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                              {additionalFeatures.safety.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-white/70">
                                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Technology */}
                          <div className="pt-6 border-t border-white/10">
                            <h3 className="text-lg text-white mb-4 flex items-center gap-2">
                              <Wifi className="w-5 h-5 text-blue-400" />
                              Tecnología
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                              {additionalFeatures.technology.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-white/70">
                                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'history' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <h3 className="text-xl text-white mb-6">Historial del Vehículo</h3>
                          
                          {/* Timeline */}
                          <div className="space-y-4">
                            {[
                              {
                                date: '15 Dic 2024',
                                title: 'Vehículo disponible para venta',
                                desc: 'Publicado en nuestra plataforma',
                                icon: TrendingUp,
                                color: 'blue',
                              },
                              {
                                date: '10 Dic 2024',
                                title: 'Revisión completa 200 puntos',
                                desc: 'Certificación mecánica y estética',
                                icon: CheckCircle,
                                color: 'green',
                              },
                              {
                                date: '05 Dic 2024',
                                title: 'Adquisición del vehículo',
                                desc: 'Incorporado a nuestro stock',
                                icon: Award,
                                color: 'purple',
                              },
                            ].map((event, idx) => (
                              <div key={idx} className="flex gap-4">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${event.color}-500/10 flex items-center justify-center border border-${event.color}-500/20`}>
                                  <event.icon className={`w-5 h-5 text-${event.color}-400`} />
                                </div>
                                <div className="flex-1 pb-4 border-b border-white/10 last:border-0">
                                  <p className="text-xs text-white/50 mb-1">{event.date}</p>
                                  <p className="text-base text-white mb-1">{event.title}</p>
                                  <p className="text-sm text-white/60">{event.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Guarantees */}
                          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
                            <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                              <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                              <p className="text-sm text-white mb-1">Garantía Oficial</p>
                              <p className="text-xs text-white/60">Hasta 3 años</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                              <Award className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                              <p className="text-sm text-white mb-1">Certificado</p>
                              <p className="text-xs text-white/60">200 puntos</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                              <CheckCircle className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                              <p className="text-sm text-white mb-1">Historial</p>
                              <p className="text-xs text-white/60">Verificado</p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'videos' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-6"
                        >
                          <h3 className="text-xl text-white mb-4">Videos y Clips del Vehículo</h3>
                          
                          {/* Video Stats */}
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                              <div className="flex items-center gap-3">
                                <Eye className="w-5 h-5 text-blue-400" />
                                <div>
                                  <p className="text-sm text-white/60">Vistas</p>
                                  <p className="text-xl text-white">{vehicle.views.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                              <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-green-400" />
                                <div>
                                  <p className="text-sm text-white/60">Leads</p>
                                  <p className="text-xl text-white">{vehicle.leads}</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                              <div className="flex items-center gap-3">
                                <TrendingUp className="w-5 h-5 text-purple-400" />
                                <div>
                                  <p className="text-sm text-white/60">Conversión</p>
                                  <p className="text-xl text-white">
                                    {vehicle.views > 0 ? ((vehicle.leads / vehicle.views) * 100).toFixed(1) : '0'}%
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Video Clips */}
                          <div className="space-y-4">
                            {vehicle.clips?.map((clip, idx) => (
                              <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                                      <Volume2 className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                      <p className="text-sm text-white">{clip.title}</p>
                                      <p className="text-xs text-white/50">Duración: {clip.duration}s</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg text-white">{clip.views.toLocaleString()}</p>
                                    <p className="text-xs text-white/50">vistas</p>
                                  </div>
                                </div>
                                
                                {/* Performance Metrics */}
                                <div className="grid grid-cols-3 gap-3 text-xs">
                                  <div className="flex items-center gap-1.5 text-white/60">
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>{clip.views} vistas</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-white/60">
                                    <Users className="w-3.5 h-3.5" />
                                    <span>{clip.leads} leads</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-green-400">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    <span>{((clip.leads / clip.views) * 100).toFixed(1)}% CVR</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Contact Form */}
                <div className="space-y-6">
                  {/* Sticky Contact Card */}
                  <div className="sticky top-24">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl p-6 shadow-2xl"
                    >
                      <h3 className="text-xl text-white mb-6">¿Interesado en este vehículo?</h3>
                      
                      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div>
                          <label className="block text-sm text-white/60 mb-2">Nombre completo*</label>
                          <input
                            type="text"
                            placeholder="Tu nombre"
                            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-2">Email*</label>
                          <input
                            type="email"
                            placeholder="tu@email.com"
                            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-2">Teléfono*</label>
                          <input
                            type="tel"
                            placeholder="+34 600 000 000"
                            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-2">Mensaje</label>
                          <textarea
                            rows={4}
                            placeholder="Estoy interesado en este vehículo..."
                            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                          />
                        </div>
                        
                        <button
                          type="submit"
                          className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span>Enviar Consulta</span>
                        </button>
                      </form>

                      <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                        <p className="text-sm text-white/60 mb-3">O contáctanos directamente:</p>
                        <a href="tel:+34900123456" className="flex items-center gap-3 text-white/70 hover:text-blue-400 transition-colors">
                          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <Phone className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="text-sm">+34 900 123 456</span>
                        </a>
                        <a href="mailto:ventas@bestcarsiberica.com" className="flex items-center gap-3 text-white/70 hover:text-blue-400 transition-colors">
                          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <Mail className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="text-sm">ventas@bestcarsiberica.com</span>
                        </a>
                        <div className="flex items-center gap-3 text-white/70">
                          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <MapPin className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="text-sm">Madrid, España</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Features Card */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="mt-6 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl p-6 shadow-2xl"
                    >
                      <h3 className="text-lg text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-blue-400" />
                        Incluido en el precio
                      </h3>
                      <ul className="space-y-3">
                        {[
                          'Garantía oficial hasta 3 años',
                          'Historial completo verificado',
                          'Prueba de conducción gratuita',
                          'Financiación desde 3.9% TIN',
                          'Entrega a domicilio incluida',
                          'Soporte post-venta 24/7',
                        ].map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-white/70">
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="bg-black border-t border-white/10 py-8 mt-12">
              <div className="max-w-7xl mx-auto px-6 text-center">
                <img src="/logo.png" alt="Best Cars" className="h-8 w-auto mx-auto mb-4 opacity-60" />
                <p className="text-white/40 text-sm">
                  © 2024 Best Cars Ibérica. Todos los derechos reservados.
                </p>
              </div>
            </footer>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
