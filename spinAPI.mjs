import express from 'express';
import wheelRoutes from './Wheelroutes.mjs'; // Importer ruter for hjulene

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.static('public'));
app.use(express.json()); // Legg til JSON-middleware for å håndtere JSON-data

// Bruk Wheelroutes for å håndtere hjul-relaterte API-er
app.use('/wheels', wheelRoutes);

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
