# Best Cars Backend API

TypeScript + Express.js backend API for Best Cars landing page, using Supabase (PostgreSQL) with Prisma ORM.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase Connection

1. Create a `.env` file in the root directory (copy from `.env.example`)
2. Get your Supabase connection string from:
   - Supabase Dashboard → Settings → Database → Connection string
   - Use the "Connection pooling" connection string (recommended for serverless)
3. Update `DATABASE_URL` in `.env`:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
```

### 3. Initialize Prisma

Generate Prisma Client:

```bash
npm run db:generate
```

### 3.5. Build TypeScript (Optional)

If you want to build the TypeScript code:

```bash
npm run build
```

### 4. Push Database Schema to Supabase

This will create the tables in your Supabase database:

```bash
npm run db:push
```

Alternatively, you can use migrations:

```bash
npm run db:migrate
```

### 5. Seed Database (Optional)

Populate the database with sample vehicles:

```bash
npm run db:seed
```

### 6. Start the Server

Development mode (with auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will run on `http://localhost:3001` by default.

## API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get a single vehicle by ID

### Contact Form
- `POST /api/contact` - Submit a contact form (sends email via SendGrid)
  ```json
  {
    "vehicleId": "car-1", // optional
    "vehicleTitle": "Audi RS6 Avant", // optional
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+34 600 000 000", // optional
    "message": "I'm interested in this vehicle" // optional
  }
  ```
- `GET /api/contact` - Get all contact submissions (admin)

## Database Schema

### Vehicle
- `id` (String, UUID) - Primary key
- `title` (String) - Vehicle name
- `year` (Int) - Manufacturing year
- `mileage` (String) - Vehicle mileage
- `price` (String) - Vehicle price
- `priceSubtext` (String, optional) - Price additional info
- `fuelType` (String, optional) - Fuel type
- `seats` (String, optional) - Number of seats
- `description` (Text, optional) - Vehicle description
- `images` (String[]) - Array of image URLs
- `tags` (String[]) - Array of tags
- `stats` (JSON) - Statistics object
- `specifications` (JSON) - Specifications object
- `createdAt` (DateTime) - Creation timestamp
- `updatedAt` (DateTime) - Last update timestamp

### ContactSubmission
- `id` (Int) - Primary key
- `vehicleId` (String, optional) - Related vehicle ID
- `name` (String) - Contact name
- `email` (String) - Contact email
- `phone` (String, optional) - Contact phone
- `message` (Text, optional) - Contact message
- `createdAt` (DateTime) - Creation timestamp

## Available Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start the production server (requires build first)
- `npm run dev` - Start development server with hot reload (using tsx)
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database (dev)
- `npm run db:migrate` - Create and apply migrations (production)
- `npm run db:seed` - Seed database with sample data

## Environment Variables

- `DATABASE_URL` - Supabase PostgreSQL connection string (required)
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `SENDGRID_API_KEY` - SendGrid API key for sending emails (required for contact form)
- `RECIPIENT_EMAIL` - Email address to receive contact form submissions (default: ventas@bestcars.com)
- `FROM_EMAIL` - Email address to send emails from (default: noreply@bestcars.com)

### SendGrid Setup

1. Create a SendGrid account at https://sendgrid.com
2. Generate an API key:
   - Go to Settings → API Keys
   - Create a new API key with "Mail Send" permissions
3. Add the API key to your `.env` file:
   ```env
   SENDGRID_API_KEY="SG.your-api-key-here"
   RECIPIENT_EMAIL="your-email@example.com"
   FROM_EMAIL="noreply@yourdomain.com"
   ```
4. Verify your sender email in SendGrid (Settings → Sender Authentication)