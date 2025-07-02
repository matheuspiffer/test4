// Pure HTTP helpers for items API
const BASE_URL = 'http://localhost:3001/api/items';

/**
 * Item interface structure:
 * {
 *   id: number,
 *   name: string,
 *   category: string,
 *   price: number
 * }
 */

/**
 * List items with optional filtering and pagination
 * @param {Object} params - Query parameters
 * @param {string} [params.q] - Search query
 * @param {number} [params.limit] - Limit results
 * @param {number} [params.page] - Page number for pagination
 * @returns {Promise<Array>} Promise resolving to array of items
 */
export async function listItems({ q, limit, page } = {}) {
  const url = new URL(BASE_URL);
  
  if (q) {
    url.searchParams.set('q', q);
  }
  if (limit) {
    url.searchParams.set('limit', limit.toString());
  }
  if (page) {
    url.searchParams.set('page', page.toString());
  }

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get a single item by ID
 * @param {number} id - Item ID
 * @returns {Promise<Object>} Promise resolving to item
 */
export async function getItem(id) {
  const response = await fetch(`${BASE_URL}/${id}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Create a new item
 * @param {Object} itemData - Item data to create
 * @param {string} itemData.name - Item name
 * @param {string} itemData.category - Item category
 * @param {number} itemData.price - Item price
 * @returns {Promise<Object>} Promise resolving to created item
 */
export async function createItem(itemData) {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(itemData),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Update an existing item
 * @param {number} id - Item ID
 * @param {Object} itemData - Updated item data
 * @returns {Promise<Object>} Promise resolving to updated item
 */
export async function updateItem(id, itemData) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(itemData),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Delete an item
 * @param {number} id - Item ID
 * @returns {Promise<Object>} Promise resolving to deletion result
 */
export async function deleteItem(id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
} 