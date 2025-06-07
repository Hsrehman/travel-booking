import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import airportRoutes from './routes/airportRoutes.js';
import flightRoutes from './routes/flightRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/airports', airportRoutes);
app.use('/api/flights', flightRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
