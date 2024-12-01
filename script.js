const API_URL = "https://api.coingecko.com/api/v3/coins/markets";
const CURRENCIES = ["usd"];
const cryptoContainer = document.getElementById("crypto-container");
const comparisonContainer = document.getElementById("comparison-container");
const sortSelect = document.getElementById("sort-select"); // Dropdown for sorting

let selectedCryptos = JSON.parse(localStorage.getItem("selectedCryptos")) || [];
let cryptoData = []; // To hold the fetched data
let isFetching = false; // Flag to prevent multiple fetch requests

// Fetch data from API
async function fetchCryptos() {
  if (isFetching) return; // Prevent multiple fetch requests
  isFetching = true; // Set fetching flag

  try {
    const res = await fetch(`${API_URL}?vs_currency=${CURRENCIES[0]}&order=market_cap_desc&per_page=10&page=1`);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch data, status: ${res.status}`);
    }

    const data = await res.json();
    cryptoData = data; // Store the fetched data

    displayCryptos(data);
    updateComparison();
  } catch (error) {
    console.error("Error fetching cryptocurrency data:", error);
    cryptoContainer.innerHTML = "Failed to fetch data. Please try again later.";
  } finally {
    isFetching = false; // Reset fetching flag
  }
}

// Display cryptocurrency list
function displayCryptos(data) {
  cryptoContainer.innerHTML = ""; // Clear previous content

  // Sort data based on selected criteria
  sortCryptos(data);

  data.forEach((crypto) => {
    const cryptoItem = document.createElement("div");
    cryptoItem.className = "crypto-item";
    cryptoItem.innerHTML = `
      <h3>${crypto.name} (${crypto.symbol.toUpperCase()})</h3>
      <p>Price: $${crypto.current_price}</p>
      <p>Market Cap: $${crypto.market_cap.toLocaleString()}</p>
      <p>24h Change: ${crypto.price_change_percentage_24h.toFixed(2)}%</p>
      <button class="compare-btn">Compare</button> <!-- Compare Button -->
    `;
    
    const compareButton = cryptoItem.querySelector('.compare-btn');
    compareButton.addEventListener("click", () => addToComparison(crypto));

    cryptoContainer.appendChild(cryptoItem);
  });
}

// Sort cryptocurrencies based on selected criteria
function sortCryptos(data) {
  const sortBy = sortSelect.value;

  if (sortBy === "market_cap_high") {
    data.sort((a, b) => b.market_cap - a.market_cap);
  } else if (sortBy === "market_cap_low") {
    data.sort((a, b) => a.market_cap - b.market_cap);
  } else if (sortBy === "price_high") {
    data.sort((a, b) => b.current_price - a.current_price);
  } else if (sortBy === "price_low") {
    data.sort((a, b) => a.current_price - b.current_price);
  } else if (sortBy === "change_high") {
    data.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
  } else if (sortBy === "change_low") {
    data.sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
  }
}

// Add selected cryptocurrency to comparison
function addToComparison(crypto) {
  // Check if already in comparison
  if (selectedCryptos.some((item) => item.id === crypto.id)) {
    alert("You already added this cryptocurrency to the comparison.");
    return;
  }

  // Limit to 5 cryptocurrencies
  if (selectedCryptos.length >= 5) {
    alert("You can only compare up to 5 cryptocurrencies.");
    return;
  }

  // Add to comparison
  selectedCryptos.push(crypto);
  localStorage.setItem("selectedCryptos", JSON.stringify(selectedCryptos));
  updateComparison();
}

// Update comparison section
function updateComparison() {
  comparisonContainer.innerHTML = ""; // Clear previous content

  selectedCryptos.forEach((crypto) => {
    const comparisonItem = document.createElement("div");
    comparisonItem.className = "comparison-item";
    comparisonItem.innerHTML = `
      <h4>${crypto.name} (${crypto.symbol.toUpperCase()})</h4>
      <p>Price: $${crypto.current_price}</p>
      <p>Market Cap: $${crypto.market_cap.toLocaleString()}</p>
      <p>24h Change: ${crypto.price_change_percentage_24h.toFixed(2)}%</p>
      <button class="remove-btn">Remove</button> <!-- Remove Button -->
    `;

    const removeButton = comparisonItem.querySelector('.remove-btn');
    removeButton.addEventListener("click", () => removeFromComparison(crypto.id));

    comparisonContainer.appendChild(comparisonItem);
  });
}

// Remove cryptocurrency from comparison
function removeFromComparison(cryptoId) {
  selectedCryptos = selectedCryptos.filter((crypto) => crypto.id !== cryptoId);
  localStorage.setItem("selectedCryptos", JSON.stringify(selectedCryptos));
  updateComparison();
}

// Event listeners
document.addEventListener("DOMContentLoaded", fetchCryptos);
sortSelect.addEventListener("change", () => displayCryptos(cryptoData)); // Re-display on sort change
