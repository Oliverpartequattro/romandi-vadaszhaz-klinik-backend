import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path"; // Új import!
import { fileURLToPath } from 'url'; // Új import!
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

dotenv.config();
connectDB();

// ES moduloknál így kapjuk meg a könyvtárnevet
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.get("/", (req, res) => res.send("A szerver fut!"));

// --- SWAGGER BEÁLLÍTÁSOK ---

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Klinik Rendszer API",
      version: "1.0.0",
      description: "A szakdolgozatomhoz készült orvosi rendszer API dokumentációja",
    },
    servers: [
      {
        url: "https://romandi-vadaszhaz-klinik-backend.vercel.app",
      },
      {
        url: "http://localhost:3000",
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // Dinamikus elérési út a YAML fájlokhoz
  apis: [path.join(__dirname, "./docs/*.yaml")],
};

// 1. ELŐBB generáljuk le a dokumentációt
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// 2. CDN beállítások a Vercel hiba elkerülésére
const swaggerOptionsUI = {
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
  ],
};

// 3. UTÁNA állítjuk be az útvonalat
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerOptionsUI));

// --- SZERVER INDÍTÁSA ---

const PORT = process.env.PORT || 3000;
// Csak akkor indítjuk el a listen-t, ha nem Vercel környezetben vagyunk (opcionális, de stabilabb)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Szerver: http://localhost:${PORT}`));
}

export default app;