import express from 'express';
import HTTP_CODES from './utils/httpCodes.mjs'; // Sørg for at denne filen eksisterer
import { spinWheel } from './spinAPI.mjs';


const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.static('public'));
app.use(express.json()); // Legg til JSON-middleware for å håndtere JSON-data

// Midlertidig lagring av hjul i minnet
let wheels = [];

// Root route (Hello World)
app.get("/", (req, res) => {
    res.status(HTTP_CODES?.SUCCESS?.OK || 200).send('Hello World').end();
});

// "/tmp/poem" route
app.get('/tmp/poem', (req, res) => {
    const poem = `
    Roses are red,
    Violets are blue,
    Express.js is cool,
    And so are you.
    `;
    res.send(poem);
});

// "/tmp/quote" route
const quotes = [
    "The only limit to our realization of tomorrow is our doubts of today.",
    "In the middle of every difficulty lies opportunity.",
    "The best way to predict the future is to invent it.",
    "Success is not the key to happiness. Happiness is the key to success.",
    "Do one thing every day that scares you."
];

app.get('/tmp/quote', (req, res) => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    res.send(randomQuote);
});

// "/tmp/sum/a/b" route
app.post('/tmp/sum/:a/:b', (req, res) => {
    const a = parseFloat(req.params.a);
    const b = parseFloat(req.params.b);

    if (isNaN(a) || isNaN(b)) {
        return res.status(400).send('Both parameters must be valid numbers.');
    }

    const sum = a + b;
    res.send(`The sum of ${a} and ${b} is ${sum}`);
});

app.get('/temp/session', (req, res) => {
    res.json({ session: req.session });
});

// --------------------------
// Spin the Wheel API-routes
// --------------------------

// Hent alle hjul
app.get("/wheels", (req, res) => {
    res.json(wheels);
});

// Hent et spesifikt hjul basert på ID
app.get("/wheels/:id", (req, res) => {
    const wheel = wheels.find((w) => w.id === parseInt(req.params.id));
    if (!wheel) return res.status(404).json({ message: "Wheel not found" });
    res.json(wheel);
});

// Opprett et nytt hjul
app.post("/wheels", (req, res) => {
    const newWheel = { id: wheels.length + 1, ...req.body };
    wheels.push(newWheel);
    res.status(201).json(newWheel);
});

// Oppdater et eksisterende hjul
app.put("/wheels/:id", (req, res) => {
    const wheel = wheels.find((w) => w.id === parseInt(req.params.id));
    if (!wheel) return res.status(404).json({ message: "Wheel not found" });

    Object.assign(wheel, req.body);
    res.json(wheel);
});

// Slett et hjul
app.delete("/wheels/:id", (req, res) => {
    wheels = wheels.filter((w) => w.id !== parseInt(req.params.id));
    res.status(204).send();
});

// Spinne et spesifikt hjul
app.post("/wheels/:id/spin", (req, res) => {
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

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});