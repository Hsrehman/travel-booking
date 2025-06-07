import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load processed data
const airportsData = require('../../src/data/airports.json');
const countriesData = require('../../src/data/countries.json');

const searchAirports = (query) => {
  const searchTerm = query.toLowerCase();
  const results = airportsData.filter(airport => 
    (airport.iata && airport.iata.toLowerCase().includes(searchTerm)) ||
    airport.name.toLowerCase().includes(searchTerm) ||
    (airport.city && airport.city.toLowerCase().includes(searchTerm))
  ).slice(0, 15); // Limit to 15 results

  return results.map(airport => ({
    id: airport.id,
    iataCode: airport.iata,
    name: airport.name,
    cityName: airport.city || '',
    countryName: airport.countryName,
    mainLine: `${airport.city || airport.name} (${airport.iata})`,
    subLine: `${airport.name}${airport.city ? '' : ''}, ${airport.countryName}`
  }));
};

const getAirportById = (id) => {
  return airportsData.find(airport => airport.id === id || airport.iata_code === id);
};

const getCountries = () => {
  return Object.entries(countriesData).map(([code, name]) => ({
    code,
    name
  }));
};

export { searchAirports, getAirportById, getCountries };
