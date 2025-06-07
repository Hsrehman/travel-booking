import express from 'express';
import { 
  searchAirports, 
  getAirportById, 
  getCountries 
} from '../controllers/airportController.js';

const router = express.Router();

// Search airports by query
router.get('/search', searchAirports);

// Get airport by ID
router.get('/:id', getAirportById);

// Get all countries
router.get('/countries', getCountries);

export default router;
