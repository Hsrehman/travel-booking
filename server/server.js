import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import airportRoutes from './routes/airportRoutes.js';
import flightRoutes from './routes/flightRoutes.js';

// Debug: Log environment variables (masked)
console.log('Environment Variables Check:', {
  hasVibeClientId: !!process.env.VIBE_CLIENT_ID,
  hasVibeClientSecret: !!process.env.VIBE_CLIENT_SECRET,
  hasVibeStorefrontUrl: !!process.env.VIBE_STOREFRONT_URL
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Routes
app.use('/api/airports', airportRoutes);
app.use('/api/flights', flightRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('dist'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
