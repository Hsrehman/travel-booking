import * as airportService from '../services/airportService.js';

const searchAirports = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters long' });
    }
    const results = await airportService.searchAirports(query);
    res.json(results);
  } catch (error) {
    console.error('Error searching airports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAirportById = async (req, res) => {
  try {
    const { id } = req.params;
    const airport = await airportService.getAirportById(id);
    if (!airport) {
      return res.status(404).json({ error: 'Airport not found' });
    }
    res.json(airport);
  } catch (error) {
    console.error('Error getting airport:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCountries = async (req, res) => {
  try {
    const countries = await airportService.getCountries();
    res.json(countries);
  } catch (error) {
    console.error('Error getting countries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { searchAirports, getAirportById, getCountries };
