import express from "express";
import { spinWheel } from "./spinAPI.mjs";

const router = express.Router();

// Midlertidig lagring av hjul i minnet
let wheels = [];

// Hent alle hjul
router.get("/", (req, res) => {
  res.json(wheels);
});

// Hent et spesifikt hjul basert på ID
router.get("/:id", (req, res) => {
  const wheel = wheels.find((w) => w.id === parseInt(req.params.id));
  if (!wheel) return res.status(404).json({ message: "Wheel not found" });
  res.json(wheel);
});

// Opprett et nytt hjul
router.post("/", (req, res) => {
  const newWheel = { id: wheels.length + 1, ...req.body };
  wheels.push(newWheel);
  res.status(201).json(newWheel);
});

// Oppdater et eksisterende hjul
router.put("/:id", (req, res) => {
  const wheel = wheels.find((w) => w.id === parseInt(req.params.id));
  if (!wheel) return res.status(404).json({ message: "Wheel not found" });

  Object.assign(wheel, req.body);
  res.json(wheel);
});

// Slett et hjul
router.delete("/:id", (req, res) => {
  wheels = wheels.filter((w) => w.id !== parseInt(req.params.id));
  res.status(204).send();
});

// Spinne et spesifikt hjul
router.post("/:id/spin", (req, res) => {
  const wheelId = parseInt(req.params.id);
  const wheel = wheels.find((w) => w.id === wheelId);

  if (!wheel) {
    return res.status(404).json({ message: "Wheel not found" });
  }

  try {
    const result = spinWheel(wheel.items);
    res.json({ result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
