// Pure HTTP helpers for stats API
const BASE_URL = 'http://localhost:3001/api/stats';

/**
 * Stats interface structure:
 * {
 *   total: number,
 *   averagePrice: number
 * }
 */

/**
 * Fetch statistics data
 * @returns {Promise<Object>} Promise resolving to stats object
 */
export async function fetchStats() {
  const response = await fetch(BASE_URL);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
} 