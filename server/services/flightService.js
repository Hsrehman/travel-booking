import axios from 'axios';
import { vibeConfig } from '../config/vibe.js';

/**
 * Convert passenger type to Vibe API format
 * @param {string} type - Passenger type (adult, child, infant)
 * @returns {string} Vibe API passenger type
 */
const getPassengerType = (type) => {
  const types = {
    'adult': 'ADT',
    'child': 'CHD',
    'infant': 'INF'
  };
  return types[type.toLowerCase()] || 'ADT';
};

/**
 * Convert search params to XML format
 * @param {Object} params - Search parameters
 * @returns {string} XML string
 */
const buildXmlRequest = (params) => {
  const {
    departureCode,
    destinationCode,
    departureDate,
    returnDate,
    cabinClass,
    passengers
  } = params;

  // Build individual passenger elements
  const passengerElements = passengers.map(p => 
    `<Passenger Age="${p.age}" />`
  ).join('\n  ');

  const xml = `<?xml version="1.0" encoding="utf-8" ?>
<FlightSearchReq xmlns="http://vibe.travel">
  <OutboundFlight>
    <Departure>${departureCode}</Departure>
    <Destination>${destinationCode}</Destination>
    <Date>${departureDate}</Date>
  </OutboundFlight>${returnDate ? `
  <InboundFlight>
    <Departure>${destinationCode}</Departure>
    <Destination>${departureCode}</Destination>
    <Date>${returnDate}</Date>
  </InboundFlight>` : ''}
  <Passengers>
    ${passengerElements}
  </Passengers>
  <JourneyType>${returnDate ? 'R' : 'O'}</JourneyType>
  <CabinClass>${cabinClass}</CabinClass>
</FlightSearchReq>`;

  return xml.trim();
};

/**
 * Search for flights using the Vibe API
 * @param {Object} searchParams - Flight search parameters
 * @param {string} searchParams.departureCode - IATA code for departure airport
 * @param {string} searchParams.destinationCode - IATA code for destination airport
 * @param {string} searchParams.departureDate - Departure date in YYYY-MM-DD format
 * @param {string} searchParams.returnDate - Optional return date for round trips
 * @param {string} searchParams.cabinClass - Cabin class (E, P, B, F)
 * @param {Array} searchParams.passengers - Array of passenger objects with type and age
 * @returns {Promise<Object>} Flight search results
 */
export const searchFlights = async (searchParams) => {
  try {
    const {
      departureCode,
      destinationCode,
      departureDate,
      returnDate,
      cabinClass = 'E',
      passengers = [{ type: 'adult', age: 30 }]
    } = searchParams;

    // Debug: Log configuration
    console.log('Vibe Config:', {
      storefrontUrl: vibeConfig.storefrontUrl,
      hasClientId: !!vibeConfig.clientId,
      hasClientSecret: !!vibeConfig.clientSecret
    });

    // Validate credentials
    if (!vibeConfig.clientId || !vibeConfig.clientSecret || !vibeConfig.storefrontUrl) {
      throw new Error('Missing Vibe API credentials. Please check environment variables.');
    }

    // Build XML request body
    const xmlRequest = buildXmlRequest({
      departureCode,
      destinationCode,
      departureDate,
      returnDate,
      cabinClass,
      passengers
    });

    console.log('Making API request to:', `${vibeConfig.storefrontUrl}/api/v16/search/flight`);
    console.log('Request XML:', xmlRequest);

    // Try with different content types as per documentation
    const response = await axios.post(
      `${vibeConfig.storefrontUrl}/api/v16/search/flight`,
      xmlRequest,
      {
        headers: {
          'Authorization': vibeConfig.getAuthHeader(),
          'Content-Type': 'application/xml',
          'Accept': 'application/xml'
        },
        // Increase timeout for the API call
        timeout: 30000,
        // Handle non-2xx responses
        validateStatus: status => status < 500
      }
    );

    if (response.status >= 400) {
      throw new Error(`API returned ${response.status}: ${response.data}`);
    }

    return response.data;
  } catch (error) {
    console.error('Flight search error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method
      }
    });
    throw new Error('Failed to search flights');
  }
};
