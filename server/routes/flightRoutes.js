import express from 'express';
import * as flightController from '../controllers/flightController.js';

const router = express.Router();

// POST /api/flights/search
router.post('/search', flightController.searchFlights);

export default router;
