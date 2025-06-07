/**
 * Airport data utility functions
 * Uses local airport data instead of Amadeus API
 */

import airportData from '../data/airports.json';
import countryNames from '../data/countries.json';


/**
 * Search airports by keyword
 * @param {string} query - Search query (city, airport name, or IATA code)
 * @returns {Promise<Array>} - Promise resolving to matching airports
 */
export async function searchAirports(query) {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // Filter airports based on the query
  let results = airportData
    .filter(airport => {
      return (
        (airport.name && airport.name.toLowerCase().includes(normalizedQuery)) ||
        (airport.city && airport.city.toLowerCase().includes(normalizedQuery)) ||
        (airport.iata && airport.iata.toLowerCase().includes(normalizedQuery))
      );
    });
  
  // Sort results to prioritize exact IATA code matches, then city matches
  results = results.sort((a, b) => {
    // Exact IATA match gets highest priority
    if (a.iata && a.iata.toLowerCase() === normalizedQuery) return -1;
    if (b.iata && b.iata.toLowerCase() === normalizedQuery) return 1;
    
    // City name exact match gets second priority
    if (a.city && a.city.toLowerCase() === normalizedQuery) return -1;
    if (b.city && b.city.toLowerCase() === normalizedQuery) return 1;
    
    // Then prioritize by city name starts with query
    if (a.city && a.city.toLowerCase().startsWith(normalizedQuery)) return -1;
    if (b.city && b.city.toLowerCase().startsWith(normalizedQuery)) return 1;
    
    return 0;
  })
  .slice(0, 15); // Limit results to 15 for better performance
  
  // Format results to match the expected format in the UI
  return results.map(airport => {
    return {
      id: airport.id,
      iataCode: airport.iata,
      name: airport.name,
      cityName: airport.city || '',
      countryName: airport.countryName,
      // Format the display strings for the UI
      mainLine: `${airport.city || airport.name} (${airport.iata})`,
      subLine: `${airport.name}${airport.city ? '' : ''}, ${airport.countryName}`
    };
  });
}

/**
 * Get detailed information about a specific airport
 * @param {string} locationId - Airport ID
 * @returns {Promise<Object>} - Promise resolving to airport details
 */
export async function getAirportDetails(locationId) {
  // Find the airport by ID
  const airport = airportData.find(a => a.id === locationId);
  
  if (!airport) {
    throw new Error(`Airport with ID ${locationId} not found`);
  }
  
  // Return formatted airport details
  return {
    id: airport.id,
    iataCode: airport.iata,
    name: airport.name,
    cityName: airport.city || '',
    countryName: airport.countryName,
    geoCode: {
      latitude: airport.latitude,
      longitude: airport.longitude
    }
  };
}
