const { ipcRenderer } = require('electron');

async function displayCountry(country) {
    const countryDetails = document.getElementById('country-details');
    const currencies = Object.keys(country.currencies).join(', ');
    
    // Fetch border countries
    let borderCountries = await fetchBorderCountries(country.borders);
    const borderCountriesList = borderCountries.map(c => 
      `<li onclick="searchCountry('${c.name.common}')">
          <img src="${c.flags.svg}" alt="Flag of ${c.name.common}">
          ${c.name.common}
       </li>`
    ).join('');
  
    // Create the container for side-by-side layout
    countryDetails.innerHTML = `
      <div class="country-container">
        <div class="main-country-info">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
            <h3>
                <img src="${country.flags.svg}" 
                     alt="Flag of ${country.name.common}" 
                     width="40" 
                     style="vertical-align: middle; margin-right: 10px;">
                ${country.name.common}
            </h3>
          </div>
          <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
          <p><strong>Region:</strong> ${country.region}</p>
          <p><strong>Subregion:</strong> ${country.subregion || 'N/A'}</p>
          <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
          <p><strong>Area:</strong> ${country.area.toLocaleString()} km²</p>
          <p><strong>Languages:</strong> ${Object.values(country.languages).join(', ')}</p>
          <p><strong>Time Zones:</strong> ${country.timezones.join(', ')}</p>
          <p><strong>Continents:</strong> ${country.continents.join(', ')}</p>
          <p><strong>Currencies:</strong> ${currencies}</p>
          <p><strong>Coat of Arms:</strong> ${country.coatOfArms && country.coatOfArms.svg ? 
              `<img src="${country.coatOfArms.svg}" alt="Coat of Arms" width="80">` : 'N/A'}</p>
          <p><strong>Location:</strong> Latitude ${country.latlng[0]}, Longitude ${country.latlng[1]}</p>
          <p><strong>Maps:</strong> <a href="${country.maps.googleMaps}" target="_blank">View on Google Maps</a></p>
        </div>
        
        <div class="nearby-countries">
          <h4>Nearby Countries</h4>
          <ul>
            ${borderCountries.length ? borderCountriesList : '<li>No nearby countries</li>'}
          </ul>
        </div>
      </div>
    `;
  
    // Store country data globally for saving
    window.currentCountryData = country;
  }
  
  // Function to fetch nea countries
  async function fetchBorderCountries(borders) {
    if (!borders || borders.length === 0) {
      return [];
    }
  
    try {
      // Convert border codes to a comma-separated string
      const borderCodes = borders.join(',');
      const response = await fetch(`https://restcountries.com/v3.1/alpha?codes=${borderCodes}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch border countries");
      }
      
      const countries = await response.json();
      return countries;
    } catch (error) {
      console.error('Error fetching border countries:', error);
      return [];
    }
  }
  
  // Function to search country when clicking on nearby country
  async function searchCountry(countryName) {
    document.getElementById('country-input').value = countryName;
    await fetchCountry();
  }
  
  // Function to fetch country information from API
  async function fetchCountry() {
    const countryName = document.getElementById('country-input').value.trim();
    const countryDetails = document.getElementById('country-details');
  
    try {
      // Show loading state
      countryDetails.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <p>Loading country information...</p>
        </div>
      `;
  
      const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`);
      
      if (!response.ok) {
        throw new Error("Country not found. Please check the spelling and try again.");
      }
  
      const [country] = await response.json();
      await displayCountry(country);
    } catch (error) {
      countryDetails.innerHTML = `
        <div style="color: red; padding: 20px; text-align: center;">
          <p>${error.message}</p>
        </div>
      `;
    } finally {
      document.getElementById('country-input').value = '';
    }
  }
  
  // Add event listener for Enter key
  document.getElementById('country-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      fetchCountry();
    }
  });