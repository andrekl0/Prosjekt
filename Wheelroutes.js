import express from "express";
import pool from "./db.js"; 
import { spinWheel } from "./spinAPI.mjs"; 

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM wheels");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM wheels WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Wheel not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/", async (req, res) => {
  try {
    const { name, items } = req.body;
    const result = await pool.query(
      "INSERT INTO wheels (name, items) VALUES ($1, $2) RETURNING *",
      [name, JSON.stringify(items)] 
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, items } = req.body;
    const result = await pool.query(
      "UPDATE wheels SET name = $1, items = $2 WHERE id = $3 RETURNING *",
      [name, JSON.stringify(items), req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Wheel not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM wheels WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Wheel not found" });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/spin", async (req, res) => {
  try {
    const result = await pool.query("SELECT items FROM wheels WHERE id = $1", [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Wheel not found" });
    }

    const wheelItems = JSON.parse(result.rows[0].items);

    if (!Array.isArray(wheelItems) || wheelItems.length === 0) {
      return res.status(400).json({ message: "Wheel has no items to spin" });
    }

    const spinResult = spinWheel(wheelItems);
    res.json({ result: spinResult });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
