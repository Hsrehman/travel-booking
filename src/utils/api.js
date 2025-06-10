const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
import { XMLParser } from 'fast-xml-parser';

// Configure XML parser
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: 'text',
  isArray: (name, jpath, isLeafNode, isAttribute) => {
    // Define elements that should always be treated as arrays even when they have only one child
    const arrayElements = ['Flight', 'Result', 'Leg', 'Bag', 'Passenger'];
    return arrayElements.includes(name);
  }
});

/**
 * Search for flights
 * @param {Object} params Search parameters
 * @param {string} params.departureCode IATA code for departure airport
 * @param {string} params.destinationCode IATA code for destination airport
 * @param {string} params.departureDate Departure date (YYYY-MM-DD)
 * @param {string} params.returnDate Return date for round trips (YYYY-MM-DD)
 * @param {string} params.cabinClass Cabin class (E, P, B, F)
 * @param {Array} params.passengers List of passenger objects with type and age
 * @returns {Promise<Object>} Flight search results
 */
export const searchFlights = async (params) => {
  try {
    // Safely handle parameters that might be undefined
    const departureCode = params.departureCode ? params.departureCode.toUpperCase() : ''; 
    const destinationCode = params.destinationCode ? params.destinationCode.toUpperCase() : '';
    const cabinClass = params.cabinClass?.toUpperCase() || 'E';
    
    // Process passenger data for our backend API
    // Handle passenger data as an object with counts (from BookingSection.vue)
    let processedPassengers = { adults: 1, children: 0, infants: 0 };
    
    // Check if we have passenger data in the expected format
    if (params.adults !== undefined || params.children !== undefined || params.infants !== undefined) {
      // Direct adult, child, infant parameters
      processedPassengers = {
        adults: parseInt(params.adults || 1),
        children: parseInt(params.children || 0),
        infants: parseInt(params.infants || 0)
      };
    } else if (params.passengers) {
      // Check if passengers is already in the right format
      if (params.passengers.adults !== undefined) {
        processedPassengers = {
          adults: parseInt(params.passengers.adults || 1),
          children: parseInt(params.passengers.children || 0),
          infants: parseInt(params.passengers.infants || 0)
        };
      } else if (Array.isArray(params.passengers)) {
        // Legacy format: convert array to counts
        const types = { adult: 0, child: 0, infant: 0 };
        
        params.passengers.forEach(passenger => {
          const type = passenger.type?.toLowerCase() || 'adult';
          const count = passenger.count || 1;
          
          if (type === 'adult') types.adult += count;
          else if (type === 'child') types.child += count;
          else if (type === 'infant') types.infant += count;
        });
        
        processedPassengers = {
          adults: types.adult || 1,  // Ensure at least 1 adult
          children: types.child || 0,
          infants: types.infant || 0
        };
      }
    }
    
    // Create JSON payload for our backend API
    const requestData = {
      departureCode,
      destinationCode,
      departureDate: params.departureDate || '',
      returnDate: params.returnDate || '',
      cabinClass,
      passengers: processedPassengers
    };
    
    console.log('Sending flight search request:', requestData);
    
    // Send JSON request to our backend API
    const response = await fetch(`${API_BASE_URL}/flights/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    // Check if response is OK
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    // Get the response text - it could be XML or JSON
    const responseText = await response.text();
    console.log('Received response:', responseText);
    
    // Try to parse as JSON first
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(responseText);
      
      // If we got a valid JSON response, return it
      if (jsonResponse) {
        return jsonResponse;
      }
    } catch (e) {
      console.log('Response is not JSON, trying XML parsing');
    }
    
    // If not JSON or empty JSON, try parsing as XML
    try {
      const parsedXml = parser.parse(responseText);
      
      // Check if we have a valid response with flight options
      if (parsedXml.FlightSearchRsp) {
        const flightResponse = parsedXml.FlightSearchRsp;
        const totalBookingOptions = parseInt(flightResponse.TotalBookingOptions || '0');
        
        if (totalBookingOptions === 0) {
          // No flights found
          return {
            flights: [],
            message: 'No flights found for these search criteria'
          };
        }
        
        // Process flights if they exist
        if (flightResponse.Flight) {
          const flights = Array.isArray(flightResponse.Flight) 
            ? flightResponse.Flight 
            : [flightResponse.Flight];
            
          // Transform the XML structure into a more usable format for our app
          const transformedFlights = flights.map(flight => {
            const outboundLegs = Array.isArray(flight.OutboundLegs?.Leg) 
              ? flight.OutboundLegs.Leg 
              : flight.OutboundLegs?.Leg ? [flight.OutboundLegs.Leg] : [];
              
            const inboundLegs = Array.isArray(flight.InboundLegs?.Leg) 
              ? flight.InboundLegs.Leg 
              : flight.InboundLegs?.Leg ? [flight.InboundLegs.Leg] : [];
            
            // Extract pricing information
            let totalPrice = 0;
            let currency = 'USD'; // Default currency
            
            // First check for price details at the OutboundLegs level (XML structure)
            if (flight.OutboundLegs && flight.OutboundLegs.PriceDetails) {
              // Price is at the OutboundLegs level
              currency = flight.OutboundLegs.PriceDetails.Currency || currency;
              
              if (flight.OutboundLegs.PriceDetails.PriceBreakdown) {
                const breakdowns = Array.isArray(flight.OutboundLegs.PriceDetails.PriceBreakdown)
                  ? flight.OutboundLegs.PriceDetails.PriceBreakdown
                  : [flight.OutboundLegs.PriceDetails.PriceBreakdown];
                
                breakdowns.forEach(breakdown => {
                  if (breakdown.Passenger) {
                    const passengers = Array.isArray(breakdown.Passenger)
                      ? breakdown.Passenger
                      : [breakdown.Passenger];
                    
                    passengers.forEach(passenger => {
                      // Use TotalPriceBeforeDiscount as it has the complete price including tax
                      const quantity = parseInt(passenger.Quantity || '1');
                      const totalPassengerPrice = parseFloat(passenger.TotalPriceBeforeDiscount || '0');
                      totalPrice += totalPassengerPrice * quantity;
                    });
                  }
                });
              }
            } 
            // Fallback to checking individual legs (older code path)
            else if (outboundLegs.length > 0 && outboundLegs[0].PriceDetails) {
              currency = outboundLegs[0].PriceDetails.Currency || currency;
              
              // Calculate total price from all passengers and legs
              const addPrices = (legs) => {
                legs.forEach(leg => {
                  if (leg.PriceDetails && leg.PriceDetails.PriceBreakdown) {
                    const breakdowns = Array.isArray(leg.PriceDetails.PriceBreakdown) 
                      ? leg.PriceDetails.PriceBreakdown 
                      : [leg.PriceDetails.PriceBreakdown];
                      
                    breakdowns.forEach(breakdown => {
                      if (breakdown.Passenger) {
                        const passengers = Array.isArray(breakdown.Passenger) 
                          ? breakdown.Passenger 
                          : [breakdown.Passenger];
                          
                        passengers.forEach(passenger => {
                          const quantity = parseInt(passenger.Quantity || '1');
                          const basePrice = parseFloat(passenger.BasePrice || '0');
                          const tax = parseFloat(passenger.Tax || '0');
                          
                          totalPrice += (basePrice + tax) * quantity;
                        });
                      }
                    });
                  }
                });
              };
              
              addPrices(outboundLegs);
              addPrices(inboundLegs);
            }
            
            // Helper function to process baggage allowance information
            const processBaggageInfo = (leg) => {
              // Check if BaggageAllowance exists and is not empty
              if (!leg.BaggageAllowance || !leg.BaggageAllowance.Bag) {
                // Return a default object for flights with no baggage info
                return { type: 'default', value: 'Contact airline', units: '', included: false };
              }
              
              const bags = Array.isArray(leg.BaggageAllowance.Bag) ? leg.BaggageAllowance.Bag : [leg.BaggageAllowance.Bag];
              
              // If bags array is empty, return default message
              if (bags.length === 0) {
                return { type: 'default', value: 'Contact airline', units: '', included: false };
              }
              
              // Try to find adult bag first
              const adultBag = bags.find(bag => bag.PaxType && bag.PaxType.toLowerCase() === 'adult');
              const bagToUse = adultBag || bags[0];
              
              if (bagToUse) {
                // The baggage value is in the text content of the Bag element
                const baggageValue = typeof bagToUse === 'string' ? bagToUse : 
                                   (bagToUse.text || bagToUse.textContent || bagToUse['#text'] || '');
                
                return { 
                  type: bagToUse.Type || 'weight', // Default to 'weight' if type not specified
                  value: baggageValue,
                  units: bagToUse.Units || 'kg', // Default to 'kg' if units not specified
                  included: true
                };
              }
              
              return { type: 'default', value: 'Contact airline', units: '', included: false };
            };
            
            // Helper function to calculate flight duration in minutes
            const calculateDuration = (departureDate, departureTime, arrivalDate, arrivalTime) => {
              if (!departureDate || !departureTime || !arrivalDate || !arrivalTime) {
                return 0;
              }
              
              const depDateTime = new Date(`${departureDate}T${departureTime}:00`);
              const arrDateTime = new Date(`${arrivalDate}T${arrivalTime}:00`);
              const durationMs = arrDateTime - depDateTime;
              return Math.round(durationMs / (1000 * 60)); // Convert to minutes
            };
            
            // Process outbound legs and calculate durations
            const processedOutboundLegs = outboundLegs.map((leg, index) => {
              const legDuration = calculateDuration(
                leg.DepartureDate, 
                leg.DepartureTime, 
                leg.ArrivalDate, 
                leg.ArrivalTime
              );
              
              return {
                id: leg.ID || `leg-${Math.random().toString(36).substr(2, 9)}`,
                departureCode: leg.DepartureAirportCode,
                departureAirport: leg.DepartureAirportName,
                destinationCode: leg.DestinationAirportCode,
                destinationAirport: leg.DestinationAirportName,
                departureDate: leg.DepartureDate,
                departureTime: leg.DepartureTime,
                arrivalDate: leg.ArrivalDate,
                arrivalTime: leg.ArrivalTime,
                airlineCode: leg.AirlineCode,
                airlineName: leg.AirlineName,
                flightNumber: leg.FlightNumber,
                cabinClass: leg.CabinClass,
                stops: parseInt(leg.NumberOfStops || '0'),
                duration: legDuration, // Flight duration in minutes
                connectionTime: 0, // Will be calculated below for multi-leg journeys
                baggageAllowance: processBaggageInfo(leg) // Extract baggage allowance info
              };
            });
            
            // Calculate connection times for multi-leg journeys
            for (let i = 0; i < processedOutboundLegs.length - 1; i++) {
              const currentLeg = processedOutboundLegs[i];
              const nextLeg = processedOutboundLegs[i + 1];
              
              const currentArrival = new Date(`${currentLeg.arrivalDate}T${currentLeg.arrivalTime}:00`);
              const nextDeparture = new Date(`${nextLeg.departureDate}T${nextLeg.departureTime}:00`);
              
              const connectionMs = nextDeparture - currentArrival;
              nextLeg.connectionTime = Math.round(connectionMs / (1000 * 60)); // Connection time in minutes
            }
            
            return {
              id: flight.ID || `flight-${Math.random().toString(36).substr(2, 9)}`,
              outboundFlights: processedOutboundLegs,
              // Process inbound legs same way as outbound
              inboundFlights: (() => {
                const processedInboundLegs = inboundLegs.map((leg, index) => {
                  const legDuration = calculateDuration(
                    leg.DepartureDate, 
                    leg.DepartureTime, 
                    leg.ArrivalDate, 
                    leg.ArrivalTime
                  );
                  
                  return {
                    id: leg.ID || `leg-${Math.random().toString(36).substr(2, 9)}`,
                    departureCode: leg.DepartureAirportCode,
                    departureAirport: leg.DepartureAirportName,
                    destinationCode: leg.DestinationAirportCode,
                    destinationAirport: leg.DestinationAirportName,
                    departureDate: leg.DepartureDate,
                    departureTime: leg.DepartureTime,
                    arrivalDate: leg.ArrivalDate,
                    arrivalTime: leg.ArrivalTime,
                    airlineCode: leg.AirlineCode,
                    airlineName: leg.AirlineName,
                    flightNumber: leg.FlightNumber,
                    cabinClass: leg.CabinClass,
                    stops: parseInt(leg.NumberOfStops || '0'),
                    duration: legDuration, // Flight duration in minutes
                    connectionTime: 0, // Will be calculated below for multi-leg journeys
                    baggageAllowance: processBaggageInfo(leg) // Extract baggage allowance info
                  };
                });
                
                // Calculate connection times for multi-leg journeys
                for (let i = 0; i < processedInboundLegs.length - 1; i++) {
                  const currentLeg = processedInboundLegs[i];
                  const nextLeg = processedInboundLegs[i + 1];
                  
                  const currentArrival = new Date(`${currentLeg.arrivalDate}T${currentLeg.arrivalTime}:00`);
                  const nextDeparture = new Date(`${nextLeg.departureDate}T${nextLeg.departureTime}:00`);
                  
                  const connectionMs = nextDeparture - currentArrival;
                  nextLeg.connectionTime = Math.round(connectionMs / (1000 * 60)); // Connection time in minutes
                }
                
                return processedInboundLegs;
              })(),
              price: totalPrice,
              currency: currency,
              deepLink: flight.DeepLink,
              rawData: flight // Keep raw data for debugging
            };
          });
          
          return {
            flights: transformedFlights,
            currency: flightResponse.Currency || 'USD',
            count: transformedFlights.length
          };
        }
      }
      
      // Fallback for empty or unrecognized XML
      return {
        flights: [],
        message: 'No flight data found in the response'
      };
    } catch (xmlError) {
      console.error('Error parsing response as XML:', xmlError);
      throw new Error('Unable to parse the API response as either JSON or XML');
    }
  } catch (error) {
    console.error('Flight search error:', error);
    throw error;
  }
};

export const searchAirports = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/airports/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search airports');
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching airports:', error);
    throw error;
  }
};

export const getAirportById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/airports/${id}`);
    if (!response.ok) {
      throw new Error('Failed to get airport');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting airport:', error);
    throw error;
  }
};

export const getCountries = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/airports/countries`);
    if (!response.ok) {
      throw new Error('Failed to get countries');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting countries:', error);
    throw error;
  }
};
