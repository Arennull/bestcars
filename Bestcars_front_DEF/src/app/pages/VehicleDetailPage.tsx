import React from 'react';
import { useEffect, useMemo, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '../components/ui/breadcrumb';
import { Header } from '../components/Header';
import { VehicleDetailSkeleton } from '../components/VehicleDetailSkeleton';
import { HeroGallery } from '../components/HeroGallery';
import { ProductHeader } from '../components/ProductHeader';
import { StatsRow } from '../components/StatsRow';
import { DescriptionSection } from '../components/DescriptionSection';
import { SpecificationsSection } from '../components/SpecificationsSection';
import { ContactForm, type ContactFormRef } from '../components/ContactForm';
import { QuizForm } from '../components/QuizForm';
import { api, getVehicleImageUrl } from '../../services/api.js';
import { vehicleToStats } from '../../utils/vehicleUtils.js';
import type { Vehicle } from '../../types/vehicle.js';

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contactFormRef = useRef<ContactFormRef>(null);

  const hasTrackedView = useRef(false);
  const hasTrackedClick = useRef(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('Vehicle ID is required');
      setLoading(false);
      return;
    }

    const fetchVehicle = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getVehicleById(id);
        setVehicle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vehicle');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  // Registrar vista cuando se muestra la ficha (una vez por carga)
  useEffect(() => {
    if (!vehicle?.id || hasTrackedView.current) return;
    hasTrackedView.current = true;
    api.trackVehicleView(vehicle.id);
  }, [vehicle?.id]);

  const seoData = useMemo(() => {
    const suffix = ' | Best Cars Ibérica';
    const maxTitleLen = 60;
    if (!vehicle?.title) {
      return { title: `Vehículo${suffix}`, description: 'Ficha de vehículo de lujo en Best Cars Ibérica, Ibiza.' };
    }
    let vehicleTitle = vehicle.title;
    if ((vehicleTitle + suffix).length > maxTitleLen) {
      vehicleTitle = vehicleTitle.slice(0, maxTitleLen - suffix.length - 1) + '…';
    }
    const year = vehicle.year ? ` (${vehicle.year})` : '';
    const desc = `${vehicle.title}${year}. Disponible en Best Cars Ibérica, concesionario de lujo en Ibiza.`;
    return {
      title: vehicleTitle + suffix,
      description: desc.length > 155 ? desc.slice(0, 152) + '…' : desc,
    };
  }, [vehicle?.title, vehicle?.year]);

  if (loading) {
    return <VehicleDetailSkeleton />;
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen">
        <Helmet>
          <title>Vehículo no encontrado — Best Cars Ibérica</title>
          <meta name="description" content="No se pudo cargar el vehículo. Vuelve a explorar nuestro catálogo de coches de lujo en Ibiza." />
        </Helmet>
        <Header />
        <main className="max-w-[1280px] mx-auto my-6 mb-24 px-6">
          <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-black text-white mb-2">Error al cargar el vehículo</h1>
            <p className="text-white/70">{error || 'Vehículo no encontrado'}</p>
          </div>
        </main>
      </div>
    );
  }

  const stats = vehicleToStats(vehicle);
  const images = Array.isArray(vehicle.images) ? vehicle.images : [];
  const mappedImages = images.map(getVehicleImageUrl);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        {mappedImages[0] && <meta property="og:image" content={mappedImages[0]} />}
        <meta property="og:type" content="product" />
      </Helmet>
      <Header hideCloseButton={true} />

      <main className="max-w-[1280px] mx-auto my-6 mb-32 pb-12 px-6">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList className="text-white/60">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <span className="text-white/30">/</span>
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/garage" className="hover:text-white transition-colors">Stock</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <span className="text-white/30">/</span>
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white truncate max-w-[200px]">{vehicle.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Gallery */}
        <HeroGallery images={mappedImages} />

        {/* Main Grid */}
        <section className="mt-6 grid grid-cols-1 lg:grid-cols-[1.65fr_.85fr] gap-6 items-start">
          {/* Left Column */}
          <div>
            <ProductHeader
              title={vehicle.title ?? vehicle.id}
              year={Number(vehicle.year) || new Date().getFullYear()}
              mileage={vehicle.mileage ?? ''}
              price={vehicle.price ?? ''}
              priceSubtext={vehicle.priceSubtext ?? ''}
              tags={Array.isArray(vehicle.tags) ? vehicle.tags : []}
              onRequestTestDrive={() => {
                if (!hasTrackedClick.current) {
                  hasTrackedClick.current = true;
                  api.trackVehicleClick(vehicle.id);
                }
                setIsQuizOpen(true);
              }}
              vehicleId={vehicle.id}
              vehicleTitle={vehicle.title ?? vehicle.id}
            />

            <StatsRow stats={stats} />

            <DescriptionSection description={vehicle.description || undefined} />

            <SpecificationsSection specifications={vehicle.specifications || undefined} />
          </div>

          {/* Right Column (Sidebar) */}
          <ContactForm
            ref={contactFormRef}
            vehicleId={vehicle.id}
            vehicleTitle={vehicle.title}
            onFirstInteraction={() => {
              if (!hasTrackedClick.current) {
                hasTrackedClick.current = true;
                api.trackVehicleClick(vehicle.id);
              }
            }}
          />
        </section>
      </main>

      <QuizForm
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        vehicleId={vehicle.id}
        vehicleTitle={vehicle.title ?? vehicle.id}
      />
    </div>
  );
}

export default VehicleDetailPage;
