const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
/**
 * Centralized API service for StockSense AI backend communications
 */

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (!res.ok) throw new Error(`Health check failed with status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("API Health Error:", err);
    throw err;
  }
}

export async function fetchMarketSummary() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/market/summary`);
    if (!res.ok) throw new Error(`Market summary failed with status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("API Market Summary Error:", err);
    throw err;
  }
}

export async function fetchStocksUniverse(searchQuery = "") {
  try {
    const url = searchQuery 
      ? `${API_BASE_URL}/api/market/stocks?search=${encodeURIComponent(searchQuery)}`
      : `${API_BASE_URL}/api/market/stocks`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Stocks universe fetch failed with status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("API Stocks Universe Error:", err);
    throw err;
  }
}

export async function fetchStockHistory(symbol, limit = 30) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/market/history/${encodeURIComponent(symbol)}?limit=${limit}`);
    if (!res.ok) throw new Error(`Stock history failed for ${symbol} with status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("API Stock History Error:", err);
    throw err;
  }
}

export async function predictStockPrice(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: "Unknown backend error" }));
      throw new Error(errorData.detail || `Prediction failed with status ${res.status}`);
    }
    
    return await res.json();
  } catch (err) {
    console.error("API Prediction Error:", err);
    throw err;
  }
}
