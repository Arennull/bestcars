/** Vehículo del stock con especificaciones, métricas e historial de precios */
export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  priceHistory: { date: string; price: number }[];
  status: 'disponible' | 'reservado' | 'vendido';
  image: string;
  images: string[];
  specs: {
    motor: string;
    potencia: string;
    combustible: string;
    transmision: string;
    kilometros: number;
    color: string;
  };
  description: string;
  tags: string[];
  views: number;
  clicks: number;
  leads: number;
  videoUrl?: string;
  videoDuration?: string;
  videoViews?: number;
  clips?: {
    title: string;
    duration: number;
    views: number;
    leads: number;
  }[];
  createdAt: string;
  updatedAt: string;
  priority: number;
}

/** Lead: contacto interesado en un vehículo */
export interface Lead {
  id: string;
  vehicleId: string;
  name: string;
  email: string;
  phone: string;
  origin: 'web' | 'instagram' | 'portal' | 'anuncio' | 'referido';
  status: 'nuevo' | 'contactado' | 'seguimiento' | 'convertido' | 'perdido';
  notes: string;
  date: string;
  assignedTo?: string;
}


/** Datos de ejemplo de vehículos para desarrollo y demos */
export const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    name: 'Porsche 911 Carrera S',
    brand: 'Porsche',
    model: '911 Carrera S',
    year: 2023,
    price: 125000,
    priceHistory: [
      { date: '2024-12-01', price: 135000 },
      { date: '2024-12-10', price: 130000 },
      { date: '2024-12-20', price: 125000 },
    ],
    status: 'disponible',
    image: 'https://images.unsplash.com/photo-1696581084306-591db2e1af14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3JzY2hlJTIwc3BvcnRzJTIwY2FyfGVufDF8fHx8MTc2Njk5MTEzNHww&ixlib=rb-4.1.0&q=80&w=1080',
    images: [
      'https://images.unsplash.com/photo-1696581084306-591db2e1af14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3JzY2hlJTIwc3BvcnRzJTIwY2FyfGVufDF8fHx8MTc2Njk5MTEzNHww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1742056024244-02a093dae0b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcG9ydHMlMjBjYXJ8ZW58MXx8fHwxNzY2ODk3OTIwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1654855383027-bf642d7ead4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdWRpJTIwY291cGV8ZW58MXx8fHwxNzY2OTk1NTEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    specs: {
      motor: '3.0L Twin-Turbo',
      potencia: '450 CV',
      combustible: 'Gasolina',
      transmision: 'Automática PDK',
      kilometros: 5200,
      color: 'Negro Metálico',
    },
    description: 'Porsche 911 Carrera S en estado impecable. Mantenimiento oficial completo. Equipamiento premium con sistema deportivo de escape y llantas de 20 pulgadas.',
    tags: ['Premium', 'Deportivo', 'Impecable'],
    views: 2845,
    clicks: 456,
    leads: 28,
    videoUrl: 'video_porsche.mp4',
    videoDuration: '2:34',
    videoViews: 1240,
    createdAt: '2024-11-15',
    updatedAt: '2024-12-20',
    priority: 1,
  },
  {
    id: 'v2',
    name: 'Mercedes-Benz S-Class 2024',
    brand: 'Mercedes-Benz',
    model: 'S-Class',
    year: 2024,
    price: 98000,
    priceHistory: [
      { date: '2024-12-05', price: 102000 },
      { date: '2024-12-15', price: 98000 },
    ],
    status: 'reservado',
    image: 'https://images.unsplash.com/photo-1722088354078-89415751076c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXJjZWRlcyUyMHNlZGFufGVufDF8fHx8MTc2Njk5NTUwOXww&ixlib=rb-4.1.0&q=80&w=1080',
    images: [
      'https://images.unsplash.com/photo-1722088354078-89415751076c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXJjZWRlcyUyMHNlZGFufGVufDF8fHx8MTc2Njk5NTUwOXww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1742056024244-02a093dae0b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcG9ydHMlMjBjYXJ8ZW58MXx8fHwxNzY2ODk3OTIwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    specs: {
      motor: '3.0L Inline-6',
      potencia: '429 CV',
      combustible: 'Híbrido',
      transmision: 'Automática 9G-TRONIC',
      kilometros: 1200,
      color: 'Blanco Diamante',
    },
    description: 'Mercedes-Benz S-Class última generación. Tecnología MBUX avanzada, interior Nappa, sistema Burmester 4D.',
    tags: ['Lujo', 'Híbrido', 'Nuevo'],
    views: 3120,
    clicks: 578,
    leads: 34,
    videoUrl: 'video_mercedes.mp4',
    videoDuration: '3:12',
    videoViews: 1856,
    createdAt: '2024-11-20',
    updatedAt: '2024-12-22',
    priority: 2,
  },
  {
    id: 'v3',
    name: 'BMW X5 M Competition',
    brand: 'BMW',
    model: 'X5 M Competition',
    year: 2023,
    price: 115000,
    priceHistory: [
      { date: '2024-11-25', price: 118000 },
      { date: '2024-12-18', price: 115000 },
    ],
    status: 'disponible',
    image: 'https://images.unsplash.com/photo-1615908397724-6dc711db34a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibXclMjBzdXZ8ZW58MXx8fHwxNzY2OTk1NTEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    images: [
      'https://images.unsplash.com/photo-1615908397724-6dc711db34a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibXclMjBzdXZ8ZW58MXx8fHwxNzY2OTk1NTEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1742056024244-02a093dae0b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcG9ydHMlMjBjYXJ8ZW58MXx8fHwxNzY2ODk3OTIwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    specs: {
      motor: '4.4L V8 BiTurbo',
      potencia: '625 CV',
      combustible: 'Gasolina',
      transmision: 'Automática 8 vel.',
      kilometros: 8500,
      color: 'Gris Toronto',
    },
    description: 'BMW X5 M Competition. Máximo rendimiento y versatilidad SUV. Pack M Driver, escape deportivo, suspensión adaptativa.',
    tags: ['SUV', 'Alto Rendimiento', 'Premium'],
    views: 1920,
    clicks: 312,
    leads: 19,
    createdAt: '2024-11-10',
    updatedAt: '2024-12-18',
    priority: 3,
  },
  {
    id: 'v4',
    name: 'Audi RS6 Avant',
    brand: 'Audi',
    model: 'RS6 Avant',
    year: 2023,
    price: 135000,
    priceHistory: [
      { date: '2024-12-01', price: 140000 },
      { date: '2024-12-12', price: 135000 },
    ],
    status: 'disponible',
    image: 'https://images.unsplash.com/photo-1654855383027-bf642d7ead4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdWRpJTIwY291cGV8ZW58MXx8fHwxNzY2OTk1NTEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    images: [
      'https://images.unsplash.com/photo-1654855383027-bf642d7ead4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdWRpJTIwY291cGV8ZW58MXx8fHwxNzY2OTk1NTEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1742056024244-02a093dae0b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcG9ydHMlMjBjYXJ8ZW58MXx8fHwxNzY2ODk3OTIwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    specs: {
      motor: '4.0L V8 TFSI',
      potencia: '600 CV',
      combustible: 'Gasolina',
      transmision: 'Automática Tiptronic',
      kilometros: 6800,
      color: 'Negro Mythos',
    },
    description: 'Audi RS6 Avant, el familiar deportivo definitivo. Quattro, Matrix LED, Bang & Olufsen, pack Carbono.',
    tags: ['Familiar', 'Deportivo', 'Exclusivo'],
    views: 2560,
    clicks: 421,
    leads: 25,
    videoUrl: 'video_audi.mp4',
    videoDuration: '2:48',
    videoViews: 1420,
    createdAt: '2024-11-18',
    updatedAt: '2024-12-12',
    priority: 4,
  },
  {
    id: 'v5',
    name: 'Tesla Model S Plaid',
    brand: 'Tesla',
    model: 'Model S Plaid',
    year: 2024,
    price: 105000,
    priceHistory: [
      { date: '2024-12-08', price: 108000 },
      { date: '2024-12-23', price: 105000 },
    ],
    status: 'disponible',
    image: 'https://images.unsplash.com/photo-1719772692993-933047b8ea4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXNsYSUyMGVsZWN0cmljJTIwY2FyfGVufDF8fHx8MTc2NjkzNjk3OXww&ixlib=rb-4.1.0&q=80&w=1080',
    images: [
      'https://images.unsplash.com/photo-1719772692993-933047b8ea4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXNsYSUyMGVsZWN0cmljJTIwY2FyfGVufDF8fHx8MTc2NjkzNjk3OXww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1742056024244-02a093dae0b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcG9ydHMlMjBjYXJ8ZW58MXx8fHwxNzY2ODk3OTIwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    specs: {
      motor: 'Tri-Motor Eléctrico',
      potencia: '1020 CV',
      combustible: 'Eléctrico',
      transmision: 'Directa',
      kilometros: 2100,
      color: 'Blanco Perla',
    },
    description: 'Tesla Model S Plaid. 0-100 en 2.1s. Autonomía 637 km. Piloto automático FSD, interior premium.',
    tags: ['Eléctrico', 'Alto Rendimiento', 'Tecnología'],
    views: 3450,
    clicks: 623,
    leads: 42,
    videoUrl: 'video_tesla.mp4',
    videoDuration: '3:05',
    videoViews: 2134,
    createdAt: '2024-11-22',
    updatedAt: '2024-12-23',
    priority: 5,
  },
  {
    id: 'v6',
    name: 'Ferrari 488 GTB',
    brand: 'Ferrari',
    model: '488 GTB',
    year: 2022,
    price: 245000,
    priceHistory: [
      { date: '2024-11-28', price: 255000 },
      { date: '2024-12-15', price: 245000 },
    ],
    status: 'vendido',
    image: 'https://images.unsplash.com/photo-1742056024244-02a093dae0b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcG9ydHMlMjBjYXJ8ZW58MXx8fHwxNzY2ODk3OTIwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    images: [
      'https://images.unsplash.com/photo-1742056024244-02a093dae0b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcG9ydHMlMjBjYXJ8ZW58MXx8fHwxNzY2ODk3OTIwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    specs: {
      motor: '3.9L V8 Biturbo',
      potencia: '670 CV',
      combustible: 'Gasolina',
      transmision: 'Automática F1 DCT',
      kilometros: 12000,
      color: 'Rosso Corsa',
    },
    description: 'Ferrari 488 GTB icónico. Certificación Ferrari Approved. Libro de revisiones completo.',
    tags: ['Supercar', 'Exclusivo', 'Vendido'],
    views: 4820,
    clicks: 892,
    leads: 56,
    createdAt: '2024-11-05',
    updatedAt: '2024-12-27',
    priority: 6,
  },
];

/** Datos de ejemplo de leads para desarrollo y demos */
export const mockLeads: Lead[] = [
  {
    id: 'l1',
    vehicleId: 'v1',
    name: 'Carlos Martínez',
    email: 'carlos.m@email.com',
    phone: '+34 612 345 678',
    origin: 'web',
    status: 'seguimiento',
    notes: 'Interesado en prueba de conducción. Contactar el martes.',
    date: '2024-12-27T10:30:00',
    assignedTo: 'Juan Pérez',
  },
  {
    id: 'l2',
    vehicleId: 'v2',
    name: 'Ana López',
    email: 'ana.lopez@email.com',
    phone: '+34 623 456 789',
    origin: 'instagram',
    status: 'convertido',
    notes: 'Reserva confirmada. Entrega prevista 15 enero.',
    date: '2024-12-26T14:15:00',
    assignedTo: 'María García',
  },
  {
    id: 'l3',
    vehicleId: 'v5',
    name: 'Roberto Sánchez',
    email: 'r.sanchez@email.com',
    phone: '+34 634 567 890',
    origin: 'portal',
    status: 'nuevo',
    notes: 'Pregunta por opciones de financiación.',
    date: '2024-12-28T09:20:00',
    assignedTo: 'Juan Pérez',
  },
  {
    id: 'l4',
    vehicleId: 'v1',
    name: 'Laura Fernández',
    email: 'laura.f@email.com',
    phone: '+34 645 678 901',
    origin: 'anuncio',
    status: 'contactado',
    notes: 'Llamada realizada. Pendiente de respuesta.',
    date: '2024-12-27T16:45:00',
    assignedTo: 'María García',
  },
  {
    id: 'l5',
    vehicleId: 'v3',
    name: 'Miguel Torres',
    email: 'miguel.t@email.com',
    phone: '+34 656 789 012',
    origin: 'web',
    status: 'perdido',
    notes: 'Optó por otra marca. Precio fuera de presupuesto.',
    date: '2024-12-25T11:30:00',
    assignedTo: 'Juan Pérez',
  },
  {
    id: 'l6',
    vehicleId: 'v4',
    name: 'Isabel Ramírez',
    email: 'isabel.r@email.com',
    phone: '+34 667 890 123',
    origin: 'referido',
    status: 'seguimiento',
    notes: 'Cliente referido por Sr. García. Alta probabilidad.',
    date: '2024-12-28T13:00:00',
    assignedTo: 'María García',
  },
  {
    id: 'l7',
    vehicleId: 'v5',
    name: 'David Moreno',
    email: 'david.m@email.com',
    phone: '+34 678 901 234',
    origin: 'instagram',
    status: 'nuevo',
    notes: 'Consulta desde Instagram Stories.',
    date: '2024-12-28T17:30:00',
    assignedTo: 'Juan Pérez',
  },
];

