import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js'; // Fontos: a .js kiterjesztés kiírása kötelező!

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Teszt route
app.get('/', (req, res) => res.send('A szerver fut (ESM módban)!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Szerver: http://localhost:${PORT}`));