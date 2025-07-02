const express = require("express");
const fs = require("fs");
const path = require("path");
const { invalidateStatsCache } = require("./stats");
const router = express.Router();
const DATA_PATH = path.join(__dirname, "../../../data/items.json");

async function readData() {
  const raw = await fs.promises.readFile(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

async function writeData(data) {
  await fs.promises.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

// GET /api/items
router.get("/", async (req, res, next) => {
  try {
    const data = await readData();
    const { limit, q } = req.query;

    let results = data;

    if (q) {
      results = results.filter((item) =>
        item.name.toLowerCase().includes(q.toLowerCase())
      );
    }

    if (limit) {
      results = results.slice(0, parseInt(limit));
    }

    res.json(results);
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get("/:id", async (req, res, next) => {
  try {
    console.log("get item", req.params.id);
    const data = await readData();
    const item = data.find((i) => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error("Item not found");
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post("/", async (req, res, next) => {
  try {
    const item = req.body;
    const data = await readData();
    item.id = Date.now();
    data.push(item);
    await writeData(data);

    await invalidateStatsCache();

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// PUT /api/items/:id
router.put("/:id", async (req, res, next) => {
  try {
    const itemId = parseInt(req.params.id);
    const updatedData = req.body;
    const data = await readData();
    
    const itemIndex = data.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) {
      const err = new Error("Item not found");
      err.status = 404;
      throw err;
    }

    // Manter o ID original
    const updatedItem = { ...updatedData, id: itemId };
    data[itemIndex] = updatedItem;
    
    await writeData(data);
    await invalidateStatsCache();

    res.json(updatedItem);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/items/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const itemId = parseInt(req.params.id);
    const data = await readData();
    
    const itemIndex = data.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) {
      const err = new Error("Item not found");
      err.status = 404;
      throw err;
    }

    const deletedItem = data[itemIndex];
    data.splice(itemIndex, 1);
    
    await writeData(data);
    await invalidateStatsCache();

    res.json(deletedItem);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
