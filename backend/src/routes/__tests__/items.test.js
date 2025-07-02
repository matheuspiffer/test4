const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');
const itemsRouter = require('../items');
const { errorHandler } = require('../../middleware/errorHandler');
const { invalidateStatsCache } = require('../stats');

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

// Mock invalidateStatsCache function
jest.mock('../stats', () => ({
  invalidateStatsCache: jest.fn(),
}));

// Create express app for testing
const app = express();
app.use(express.json());
app.use('/api/items', itemsRouter);
app.use(errorHandler);

// Mock data
const mockItems = [
  { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
  { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 },
  { id: 3, name: 'Ultra‑Wide Monitor', category: 'Electronics', price: 999 },
  { id: 4, name: 'Ergonomic Chair', category: 'Furniture', price: 799 },
  { id: 5, name: 'Standing Desk', category: 'Furniture', price: 1199 },
];

describe('Items API Routes', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/items', () => {
    it('should return all items when no query parameters', async () => {
      // Mock successful file read
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get('/api/items')
        .expect(200);

      expect(response.body).toEqual(mockItems);
      expect(fs.promises.readFile).toHaveBeenCalledWith(
        expect.stringContaining('items.json'),
        'utf8'
      );
    });

    it('should filter items by search query (case insensitive)', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get('/api/items?q=laptop')
        .expect(200);

      expect(response.body).toEqual([
        { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 }
      ]);
    });

    it('should limit number of results', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get('/api/items?limit=2')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(mockItems.slice(0, 2));
    });

    it('should apply both search and limit filters', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get('/api/items?q=noise&limit=1')
        .expect(200);

      // Should filter by name containing 'noise' first, then limit to 1
      const filteredItems = mockItems.filter(item => 
        item.name.toLowerCase().includes('noise')
      );
      expect(response.body).toEqual([filteredItems[0]]);
    });

    it('should return empty array when no items match search', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get('/api/items?q=nonexistent')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should handle file read errors', async () => {
      fs.promises.readFile.mockRejectedValue(new Error('File not found'));

      const response = await request(app)
        .get('/api/items')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid JSON in file', async () => {
      fs.promises.readFile.mockResolvedValue('invalid json');

      const response = await request(app)
        .get('/api/items')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return specific item by id', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get('/api/items/1')
        .expect(200);

      expect(response.body).toEqual(mockItems[0]);
    });

    it('should return 404 for non-existent item', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get('/api/items/999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item not found');
    });

    it('should handle file read errors', async () => {
      fs.promises.readFile.mockRejectedValue(new Error('File not found'));

      const response = await request(app)
        .get('/api/items/1')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid JSON in file', async () => {
      fs.promises.readFile.mockResolvedValue('invalid json');

      const response = await request(app)
        .get('/api/items/1')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle string id parameter correctly', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get('/api/items/2')
        .expect(200);

      expect(response.body).toEqual(mockItems[1]);
    });
  });

  describe('POST /api/items', () => {
    it('should create new item successfully', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.promises.writeFile.mockResolvedValue();

      const newItem = {
        name: 'Gaming Mouse',
        category: 'Electronics',
        price: 89
      };

      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newItem.name);
      expect(response.body.category).toBe(newItem.category);
      expect(response.body.price).toBe(newItem.price);
      expect(typeof response.body.id).toBe('number');

      // Verify file operations were called
      expect(fs.promises.readFile).toHaveBeenCalled();
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('items.json'),
        expect.stringContaining(newItem.name),
        'utf8'
      );
    });

    it('should handle missing request body', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.promises.writeFile.mockResolvedValue();

      const response = await request(app)
        .post('/api/items')
        .send({})
        .expect(201);

      // Should still create item even with empty body (basic validation not implemented)
      expect(response.body).toHaveProperty('id');
    });

    it('should handle file read errors', async () => {
      fs.promises.readFile.mockRejectedValue(new Error('File not found'));

      const newItem = {
        name: 'Gaming Mouse',
        category: 'Electronics',
        price: 89
      };

      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle file write errors', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.promises.writeFile.mockRejectedValue(new Error('Write permission denied'));

      const newItem = {
        name: 'Gaming Mouse',
        category: 'Electronics',
        price: 89
      };

      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid JSON in existing file', async () => {
      fs.promises.readFile.mockResolvedValue('invalid json');

      const newItem = {
        name: 'Gaming Mouse',
        category: 'Electronics',
        price: 89
      };

      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should generate unique timestamp-based IDs', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.promises.writeFile.mockResolvedValue();

      const newItem1 = { name: 'Item 1', category: 'Test', price: 100 };
      const newItem2 = { name: 'Item 2', category: 'Test', price: 200 };

      const response1 = await request(app)
        .post('/api/items')
        .send(newItem1)
        .expect(201);

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const response2 = await request(app)
        .post('/api/items')
        .send(newItem2)
        .expect(201);

      expect(response1.body.id).not.toBe(response2.body.id);
      expect(response2.body.id).toBeGreaterThan(response1.body.id);
    });

    it('should invalidate stats cache when creating item', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.promises.writeFile.mockResolvedValue();
      invalidateStatsCache.mockResolvedValue();

      const newItem = {
        name: 'Gaming Mouse',
        category: 'Electronics',
        price: 89
      };

      await request(app)
        .post('/api/items')
        .send(newItem)
        .expect(201);

      expect(invalidateStatsCache).toHaveBeenCalled();
    });
  });

  describe('PUT /api/items/:id', () => {
    it('should update existing item successfully', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.promises.writeFile.mockResolvedValue();
      invalidateStatsCache.mockResolvedValue();

      const updatedItem = {
        name: 'Updated Laptop Pro',
        category: 'Electronics',
        price: 2699
      };

      const response = await request(app)
        .put('/api/items/1')
        .send(updatedItem)
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe(updatedItem.name);
      expect(response.body.category).toBe(updatedItem.category);
      expect(response.body.price).toBe(updatedItem.price);

      // Verify file operations were called
      expect(fs.promises.readFile).toHaveBeenCalled();
      expect(fs.promises.writeFile).toHaveBeenCalled();
    });

    it('should preserve original ID when updating', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.promises.writeFile.mockResolvedValue();
      invalidateStatsCache.mockResolvedValue();

      const updatedItem = {
        id: 999, // This should be ignored
        name: 'Updated Item',
        category: 'Test',
        price: 500
      };

      const response = await request(app)
        .put('/api/items/2')
        .send(updatedItem)
        .expect(200);

      expect(response.body.id).toBe(2); // Should keep original ID
      expect(response.body.name).toBe(updatedItem.name);
    });

    it('should return 404 for non-existent item', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const updatedItem = {
        name: 'Updated Item',
        category: 'Test',
        price: 500
      };

      const response = await request(app)
        .put('/api/items/999')
        .send(updatedItem)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item not found');
    });

    it('should handle file read errors', async () => {
      fs.promises.readFile.mockRejectedValue(new Error('File not found'));

      const updatedItem = {
        name: 'Updated Item',
        category: 'Test',
        price: 500
      };

      const response = await request(app)
        .put('/api/items/1')
        .send(updatedItem)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle file write errors', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.promises.writeFile.mockRejectedValue(new Error('Write permission denied'));

      const updatedItem = {
        name: 'Updated Item',
        category: 'Test',
        price: 500
      };

      const response = await request(app)
        .put('/api/items/1')
        .send(updatedItem)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid JSON in file', async () => {
      fs.promises.readFile.mockResolvedValue('invalid json');

      const updatedItem = {
        name: 'Updated Item',
        category: 'Test',
        price: 500
      };

      const response = await request(app)
        .put('/api/items/1')
        .send(updatedItem)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should invalidate stats cache when updating item', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.promises.writeFile.mockResolvedValue();
      invalidateStatsCache.mockResolvedValue();

      const updatedItem = {
        name: 'Updated Item',
        category: 'Test',
        price: 500
      };

      await request(app)
        .put('/api/items/1')
        .send(updatedItem)
        .expect(200);

      expect(invalidateStatsCache).toHaveBeenCalled();
    });

    it('should handle empty request body', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.promises.writeFile.mockResolvedValue();
      invalidateStatsCache.mockResolvedValue();

      const response = await request(app)
        .put('/api/items/1')
        .send({})
        .expect(200);

      expect(response.body.id).toBe(1);
      // Should still preserve the ID even with empty body
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete existing item successfully', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.promises.writeFile.mockResolvedValue();
      invalidateStatsCache.mockResolvedValue();

      const response = await request(app)
        .delete('/api/items/1')
        .expect(200);

      expect(response.body).toEqual(mockItems[0]);

      // Verify file operations were called
      expect(fs.promises.readFile).toHaveBeenCalled();
      expect(fs.promises.writeFile).toHaveBeenCalled();
    });

    it('should return 404 for non-existent item', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .delete('/api/items/999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item not found');
    });

    it('should handle file read errors', async () => {
      fs.promises.readFile.mockRejectedValue(new Error('File not found'));

      const response = await request(app)
        .delete('/api/items/1')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle file write errors', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.promises.writeFile.mockRejectedValue(new Error('Write permission denied'));

      const response = await request(app)
        .delete('/api/items/1')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid JSON in file', async () => {
      fs.promises.readFile.mockResolvedValue('invalid json');

      const response = await request(app)
        .delete('/api/items/1')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should invalidate stats cache when deleting item', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.promises.writeFile.mockResolvedValue();
      invalidateStatsCache.mockResolvedValue();

      await request(app)
        .delete('/api/items/1')
        .expect(200);

      expect(invalidateStatsCache).toHaveBeenCalled();
    });

    it('should return the deleted item in response', async () => {
      const testItems = [
        { id: 1, name: 'Test Item', category: 'Test', price: 100 },
        { id: 2, name: 'Another Item', category: 'Test', price: 200 }
      ];

      fs.promises.readFile.mockResolvedValue(JSON.stringify(testItems));
      fs.promises.writeFile.mockResolvedValue();
      invalidateStatsCache.mockResolvedValue();

      const response = await request(app)
        .delete('/api/items/2')
        .expect(200);

      expect(response.body).toEqual(testItems[1]);
    });

    it('should handle string id parameter correctly', async () => {
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.promises.writeFile.mockResolvedValue();
      invalidateStatsCache.mockResolvedValue();

      const response = await request(app)
        .delete('/api/items/3')
        .expect(200);

      expect(response.body).toEqual(mockItems[2]);
    });
  });
}); 