
import { Config } from 'drizzle-orm';

export const config = {
  database: {
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/app'
  },
  session: {
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    cookie: {
      secure: process.env.NODE_ENV === 'production'
    }
  }
};
