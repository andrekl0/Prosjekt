import express from 'express';
import cors from 'cors';
import session from 'express-session';
import Redis from 'ioredis';
import { default as connectRedis } from 'connect-redis';
import dotenv from 'dotenv';

// Last miljøvariabler
dotenv.config();

const app = express();
const port = process.env.PORT || 8002;

// Redis klient oppsett
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
});

// Opprett Redis session store
const RedisStore = connectRedis(session);

// Middleware oppsett
app.use(cors());
app.use(session({
    store: new RedisStore({ client: redis }),
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 timer
    }
}));

app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', req.session);
    next();
});


// Lagring av kortstokker i Redis istedenfor minnet
async function saveDeck(deckId, deck) {
    await redis.set(`deck:${deckId}`, JSON.stringify(deck));
}

async function getDeck(deckId) {
    const deck = await redis.get(`deck:${deckId}`);
    return deck ? JSON.parse(deck) : null;
}

async function deleteDeck(deckId) {
    await redis.del(`deck:${deckId}`);
}

// Funksjon for å generere en ny kortstokk
function createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    suits.forEach(suit => {
        ranks.forEach(rank => {
            deck.push({ suit, rank });
        });
    });
    return deck;
}

// POST /temp/deck - Opprett en ny kortstokk
app.post('/temp/deck', async (req, res) => {
    try {
        const deckId = `deck_${Date.now()}`;
        const newDeck = createDeck();
        await saveDeck(deckId, newDeck);
        res.status(201).json({ deck_id: deckId });
    } catch (error) {
        console.error('Feil ved opprettelse av kortstokk:', error);
        res.status(500).json({ error: 'Kunne ikke opprette kortstokk' });
    }
});

// PATCH /temp/deck/shuffle/:deck_id - Stokk kortstokken
app.patch('/temp/deck/shuffle/:deck_id', async (req, res) => {
    try {
        const { deck_id } = req.params;
        const deck = await getDeck(deck_id);

        if (!deck) {
            return res.status(404).json({ error: 'Kortstokken finnes ikke' });
        }

        // Stokker kortstokken med Fisher-Yates-algoritmen
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); 
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        await saveDeck(deck_id, deck);
        res.json({ message: 'Kortstokken er stokket', deck_id });
    } catch (error) {
        console.error('Feil ved stokking av kort:', error);
        res.status(500).json({ error: 'Kunne ikke stokke kortstokken' });
    }
});

// GET /temp/deck/:deck_id - Hent hele kortstokken
app.get('/temp/deck/:deck_id', async (req, res) => {
    try {
        const { deck_id } = req.params;
        const deck = await getDeck(deck_id);

        if (!deck) {
            return res.status(404).json({ error: 'Kortstokken finnes ikke' });
        }

        res.json({ deck });
    } catch (error) {
        console.error('Feil ved henting av kortstokk:', error);
        res.status(500).json({ error: 'Kunne ikke hente kortstokken' });
    }
});

// GET /temp/deck/:deck_id/card - Trekk et kort
app.get('/temp/deck/:deck_id/card', async (req, res) => {
    try {
        const { deck_id } = req.params;
        const deck = await getDeck(deck_id);

        if (!deck) {
            return res.status(404).json({ error: 'Kortstokken finnes ikke' });
        }

        if (deck.length === 0) {
            return res.status(400).json({ error: 'Kortstokken er tom' });
        }

        const randomIndex = Math.floor(Math.random() * deck.length);
        const drawnCard = deck.splice(randomIndex, 1)[0];
        
        await saveDeck(deck_id, deck);
        res.json({ card: drawnCard });
    } catch (error) {
        console.error('Feil ved trekking av kort:', error);
        res.status(500).json({ error: 'Kunne ikke trekke kort' });
    }
});

app.use(express.static('public'));

// Håndter graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Mottak SIGTERM signal. Lukker tilkoblinger...');
    await redis.quit();
    process.exit(0);
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});