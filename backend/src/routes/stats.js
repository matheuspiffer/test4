const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const { createCache } = require("cache-manager");
const { mean } = require("../utils/stats");

const router = express.Router();
const DATA_PATH = path.join(__dirname, "../../../data/items.json");

const cache = createCache({ ttl: 300000 }); // 5 minutos
const KEY = "stats";

async function rebuildStats() {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  const items = JSON.parse(raw);

  const total = items.length;
  const averagePrice = total ? mean(items.map((item) => item.price)) : 0;

  const stats = { total, averagePrice };
  await cache.set(KEY, stats);
  return stats;
}

router.get("/", async (req, res, next) => {
  try {
    const cached = await cache.get(KEY); // undefined se não existir
    if (cached) return res.json(cached);

    res.json(await rebuildStats());
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// Função para invalidar o cache
async function invalidateStatsCache() {
  await cache.del(KEY);
}

module.exports = { router, invalidateStatsCache };
