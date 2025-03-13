import express from 'express';
import wheelRoutes from './Wheelroutes.js';
import HTTP_CODES from './utils/httpCodes.mjs';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const spinWheel = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Invalid wheel items');
    }
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
};

const app = express();
const port = process.env.WHEEL_PORT || 3000; 

app.use(express.json());
app.use(cors());


app.use(express.static(path.join(__dirname, 'public')));


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'app.html'));
});


app.get("/spin", async (req, res) => {
    try {
        // Get first wheel from database (or you could specify an ID)
        const result = await pool.query("SELECT items FROM wheels LIMIT 1");
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No wheels found" });
        }

        const wheelItems = result.rows[0].items;
        const spinResult = spinWheel(wheelItems);
        res.json({ result: spinResult });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.use('/wheels', wheelRoutes);


app.listen(port, () => {
  console.log(`Server kjører på http://localhost:${port}`);
});
