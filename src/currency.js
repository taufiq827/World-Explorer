// Fetch country and currency information
async function fetchCountryAndExchangeRate() {
    const countryName = document.getElementById('country-input').value.trim();

    try {
        // Fetch country data
        const countryResponse = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`);
        if (!countryResponse.ok) {
            throw new Error("Country not found.");
        }
        const [country] = await countryResponse.json();

        // Get currency code
        const currencyCode = Object.keys(country.currencies)[0];

        // Fetch exchange rate data
        const exchangeResponse = await fetch(`https://v6.exchangerate-api.com/v6/8bbe0cef93eade1ba592afd9/latest/USD`);
        if (!exchangeResponse.ok) {
            throw new Error("Exchange rate data not available.");
        }
        const exchangeData = await exchangeResponse.json();

        // Get exchange rate for the specific currency
        const exchangeRate = exchangeData.conversion_rates[currencyCode];
        displayCountryAndExchangeRate(country, currencyCode, exchangeRate);
    } catch (error) {
        document.getElementById('country-details').innerHTML = `<p style="color: red;">${error.message}</p>`;
    } finally {
        document.getElementById('country-input').value = '';
    }
}

// Display country and exchange rate information on the webpage
function displayCountryAndExchangeRate(country, currencyCode, exchangeRate) {
    const countryDetails = document.getElementById('country-details');

    countryDetails.innerHTML = `
        <h3><img src="${country.flags.svg}" alt="Flag of ${country.name.common}" width="40" style="vertical-align: middle; margin-right: 10px;">${country.name.common}</h3>
        <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
        <p><strong>Currency:</strong> ${currencyCode}</p>
        <p><strong>Exchange Rate: </strong>1 USD =  ${exchangeRate ? exchangeRate.toFixed(2) : 'Not available'} ${currencyCode}</p>
    `;
}
