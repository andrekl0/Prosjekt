import express from 'express';
import wheelRoutes from './Wheelroutes.mjs';
import HTTP_CODES from './utils/httpCodes.mjs';
import cors from 'cors';

// Export spinWheel function
export const spinWheel = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Invalid wheel items');
    }
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
};

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

// Root route from script.mjs
app.get("/", (req, res) => {
    res.status(HTTP_CODES.SUCCESS.OK).send('Hello World').end();
});

// Wheel routes
app.use('/wheels', wheelRoutes);

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
