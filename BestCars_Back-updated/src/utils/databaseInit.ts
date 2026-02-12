import { seedDatabase } from '../../scripts/seed.js';


export async function initializeDatabase(): Promise<void> {
  try {
    // Database initialization disabled - app uses mock data
    console.log('⚠️  Database initialization skipped - application is running in MOCK mode');
    await seedDatabase();
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}
