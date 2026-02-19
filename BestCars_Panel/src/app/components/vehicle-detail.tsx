/**
 * Modal de detalle completo de un vehículo.
 * Permite editar descripción, estado, reordenar imágenes y ver métricas.
 */
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { X, Pencil, Save, Calendar, TrendingDown, TrendingUp, Video, Play, Eye } from 'lucide-react';
import { Vehicle } from '../data/mock-data';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VehicleDetailProps {
  vehicle: Vehicle;
  onClose: () => void;
  onUpdate: (vehicleId: string, updates: Partial<Vehicle>) => void;
  onWebPreview: (vehicle: Vehicle) => void;
}

/** Imagen arrastrable para reordenar en la galería */
interface DraggableImageProps {
  image: string;
  index: number;
  moveImage: (dragIndex: number, hoverIndex: number) => void;
}

function DraggableImage({ image, index, moveImage }: DraggableImageProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'image',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'image',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveImage(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <motion.div
      ref={(node) => {
        if (node) {
          drag(drop(node));
        }
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className="relative aspect-video rounded-xl overflow-hidden border border-white/10 cursor-move group"
    >
      <img src={image} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
        <span className="text-xs text-white/80">Arrastra para reordenar</span>
      </div>
    </motion.div>
  );
}

export function VehicleDetail({ vehicle, onClose, onUpdate, onWebPreview }: VehicleDetailProps) {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(vehicle.description);
  const [status, setStatus] = useState(vehicle.status);
  const [images, setImages] = useState(vehicle.images);

  // Sincroniza estado local cuando cambia el vehículo (ej. tras actualización desde fuera)
  useEffect(() => {
    setDescription(vehicle.description);
    setStatus(vehicle.status);
    setImages(vehicle.images?.length ? vehicle.images : [vehicle.image]);
  }, [vehicle]);

  /** Reordena las imágenes de la galería */
  const moveImage = (dragIndex: number, hoverIndex: number) => {
    const updatedImages = [...images];
    const [draggedItem] = updatedImages.splice(dragIndex, 1);
    updatedImages.splice(hoverIndex, 0, draggedItem);
    setImages(updatedImages);
    onUpdate(vehicle.id, { images: updatedImages });
  };

  const handleSaveDescription = () => {
    onUpdate(vehicle.id, { description });
    setIsEditingDescription(false);
  };

  const handleStatusChange = (newStatus: Vehicle['status']) => {
    setStatus(newStatus);
    onUpdate(vehicle.id, { status: newStatus });
  };

  const statusOptions: Vehicle["status"][] = ["disponible", "reservado", "vendido"];
  const statusLabels: Record<Vehicle["status"], string> = {
    disponible: 'Disponible',
    reservado: 'Reservado',
    vendido: "Vendido",
  };

  // Datos formateados para el gráfico de histórico de precios
  const chartData = useMemo(
    () =>
      vehicle.priceHistory.map((entry) => ({
        date: new Date(entry.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
        precio: entry.price,
      })),
    [vehicle.priceHistory]
  );

  const conversionRate = vehicle.views > 0
    ? ((vehicle.leads / vehicle.views) * 100).toFixed(2)
    : "0";

  return (
    <DndProvider backend={HTML5Backend}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-gradient-to-br from-black via-black/95 to-black backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-white/10 bg-black/80 backdrop-blur-xl p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl text-white mb-1">{vehicle.name}</h2>
              <p className="text-sm text-white/50">{vehicle.brand} • {vehicle.model} • {vehicle.year}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6 text-white/70" />
            </button>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-3 gap-8">
              {/* Left Column - Images */}
              <div className="col-span-2 space-y-6">
                {/* Main Image */}
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10">
                  <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
                </div>

                {/* Gallery */}
                <div>
                  <h3 className="text-sm text-white/70 mb-3">Galería de imágenes (arrastra para reordenar)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <DraggableImage
                        key={index}
                        image={image}
                        index={index}
                        moveImage={moveImage}
                      />
                    ))}
                  </div>
                </div>

                {/* Price History Chart */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
                  <h3 className="text-lg text-white mb-4">Histórico de Precio</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" style={{ fontSize: 12 }} />
                      <YAxis stroke="rgba(255,255,255,0.4)" style={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.9)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: 'white',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="precio"
                        stroke="#60a5fa"
                        strokeWidth={2}
                        dot={{ fill: '#60a5fa', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Description */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg text-white">Descripción Comercial</h3>
                    {!isEditingDescription && (
                      <button
                        onClick={() => setIsEditingDescription(true)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-white/50" />
                      </button>
                    )}
                  </div>
                  {isEditingDescription ? (
                    <div className="space-y-3">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/90 placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 resize-none"
                      />
                      <button
                        onClick={handleSaveDescription}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 hover:border-white/20 text-white/90 transition-all flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Guardar cambios
                      </button>
                    </div>
                  ) : (
                    <p className="text-white/70 leading-relaxed">{description}</p>
                  )}
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                {/* Price */}
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/[0.08] to-purple-500/[0.08] backdrop-blur-xl p-6">
                  <p className="text-sm text-white/50 mb-2">Precio Actual</p>
                  <p className="text-4xl text-white mb-2">{vehicle.price.toLocaleString()}€</p>
                  {vehicle.priceHistory.length >= 2 && (
                    <div className="flex items-center gap-2">
                      {vehicle.price < vehicle.priceHistory[vehicle.priceHistory.length - 2].price ? (
                        <>
                          <TrendingDown className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-400">
                            -{(vehicle.priceHistory[vehicle.priceHistory.length - 2].price - vehicle.price).toLocaleString()}€
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-red-400">
                            +{(vehicle.price - vehicle.priceHistory[vehicle.priceHistory.length - 2].price).toLocaleString()}€
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
                  <p className="text-sm text-white/50 mb-3">Estado del vehículo</p>
                  <div className="space-y-2">
                    {statusOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleStatusChange(option)}
                        className={`w-full px-4 py-2.5 rounded-xl border transition-all text-left ${
                          status === option
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-white/20'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="text-white/90">{statusLabels[option]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specs */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
                  <h3 className="text-lg text-white mb-4">Especificaciones</h3>
                  <div className="space-y-3">
                    {Object.entries(vehicle.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm text-white/50 capitalize">{key}</span>
                        <span className="text-sm text-white/90">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video */}
                {vehicle.videoUrl && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
                    <h3 className="text-lg text-white mb-4">Vídeo</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                          <Video className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white/90">{vehicle.videoUrl}</p>
                          <p className="text-xs text-white/50">{vehicle.videoDuration}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/50">Reproducciones</span>
                        <span className="text-white/90">{vehicle.videoViews?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Metrics */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
                  <h3 className="text-lg text-white mb-4">Rendimiento</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-white/50">Vistas</span>
                        <span className="text-sm text-white/90">{vehicle.views.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: '75%' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-white/50">Clics</span>
                        <span className="text-sm text-white/90">{vehicle.clicks.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: '45%' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-white/50">Leads</span>
                        <span className="text-sm text-white/90">{vehicle.leads}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                          style={{ width: '30%' }}
                        />
                      </div>
                    </div>
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/50">Tasa de conversión</span>
                        <span className="text-lg text-green-400">{conversionRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
                  <h3 className="text-lg text-white mb-4">Etiquetas</h3>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Metadata */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
                  <h3 className="text-lg text-white mb-4">Información</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-white/40" />
                      <div className="flex-1">
                        <p className="text-xs text-white/40">Creado</p>
                        <p className="text-sm text-white/70">
                          {new Date(vehicle.createdAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-white/40" />
                      <div className="flex-1">
                        <p className="text-xs text-white/40">Última actualización</p>
                        <p className="text-sm text-white/70">
                          {new Date(vehicle.updatedAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Web Preview Button */}
                <button
                  onClick={() => onWebPreview(vehicle)}
                  className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-white/10 hover:border-green-500/30 text-white transition-all backdrop-blur-sm flex items-center justify-center gap-3 hover:scale-105"
                >
                  <Eye className="w-5 h-5 text-green-400" />
                  <span className="text-lg">Vista Previa Web</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DndProvider>
  );
}