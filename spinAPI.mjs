import express from 'express';
import wheelRoutes from './Wheelroutes.js';
import HTTP_CODES from './utils/httpCodes.mjs';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

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

app.get("/index", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/spin", (req, res) => {
    const wheelItems = ["🎉 Gevinst!", "💰 Jackpot!", "🍀 Prøv igjen", "🎁 Overraskelse!", "❌ Ingen gevinst"];
    const result = spinWheel(wheelItems);
    res.json({ result });
});

app.use('/wheels', wheelRoutes);

app.listen(port, () => {
  console.log(`Server kjører på http://localhost:${port}`);
});
