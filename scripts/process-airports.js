const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Paths to the CSV files
const airportsCsvPath = path.join(__dirname, '../../airports.csv');
const countriesCsvPath = path.join(__dirname, '../../countries.csv');

// Output paths for the processed JSON
const airportsOutputPath = path.join(__dirname, '../src/data/airports.json');
const countriesOutputPath = path.join(__dirname, '../src/data/countries.json');

// Create the output directory if it doesn't exist
const outputDir = path.dirname(airportsOutputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Process countries first to get the country mappings
const countries = {};
const processCountries = () => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(countriesCsvPath)
      .pipe(csv())
      .on('data', (data) => {
        // Map country code to country name
        countries[data.code] = data.name;
      })
      .on('end', () => {
        console.log(`Processed ${Object.keys(countries).length} countries`);
        fs.writeFileSync(countriesOutputPath, JSON.stringify(countries, null, 2));
        resolve(countries);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Process airports after countries are processed
const processAirports = () => {
  return new Promise((resolve, reject) => {
    const airports = [];
    
    fs.createReadStream(airportsCsvPath)
      .pipe(csv())
      .on('data', (data) => {
        // Only include airports with IATA codes (most commercial airports have these)
        // Include all airports with IATA codes, regardless of size
        if (
          data.iata_code && 
          data.iata_code.trim() !== ''
        ) {
          // Get the country name from our mapping
          const countryName = countries[data.iso_country] || data.iso_country;
          
          airports.push({
            id: data.id,
            name: data.name,
            city: data.municipality || '',
            country: data.iso_country,
            countryName: countryName,
            iata: data.iata_code,
            type: data.type,
            latitude: parseFloat(data.latitude_deg) || 0,
            longitude: parseFloat(data.longitude_deg) || 0
          });
        }
      })
      .on('end', () => {
        // Sort airports by city name for better browsing
        airports.sort((a, b) => {
          if (a.city && b.city) {
            return a.city.localeCompare(b.city);
          }
          return a.name.localeCompare(b.name);
        });
        
        // Write the processed data to a JSON file
        fs.writeFileSync(airportsOutputPath, JSON.stringify(airports, null, 2));
        console.log(`Processed ${airports.length} airports and saved to ${airportsOutputPath}`);
        resolve(airports);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Run the processing pipeline
async function processData() {
  try {
    await processCountries();
    await processAirports();
    console.log('All data processed successfully!');
  } catch (error) {
    console.error('Error processing data:', error);
  }
}

processData();
