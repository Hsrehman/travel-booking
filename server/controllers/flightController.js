import * as flightService from '../services/flightService.js';

/**
 * Search for flights
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const searchFlights = async (req, res) => {
  try {
    const {
      departureCode,
      destinationCode,
      departureDate,
      returnDate,
      cabinClass,
      passengers
    } = req.body;

    // Basic validation
    if (!departureCode || !destinationCode || !departureDate) {
      return res.status(400).json({
        error: 'Missing required fields: departureCode, destinationCode, and departureDate are required'
      });
    }

    // Validate IATA codes (3 uppercase letters)
    const iataRegex = /^[A-Z]{3}$/;
    if (!iataRegex.test(departureCode) || !iataRegex.test(destinationCode)) {
      return res.status(400).json({
        error: 'Invalid airport code format. IATA codes must be 3 uppercase letters'
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(departureDate) || (returnDate && !dateRegex.test(returnDate))) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    const results = await flightService.searchFlights({
      departureCode,
      destinationCode,
      departureDate,
      returnDate,
      cabinClass,
      passengers
    });

    // Set XML content type if the response is XML
    if (typeof results === 'string' && results.startsWith('<?xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(results);
    }

    // Otherwise send as JSON
    res.json(results);
  } catch (error) {
    console.error('Error in flight search controller:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
