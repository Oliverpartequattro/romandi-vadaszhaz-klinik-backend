import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import YAML from 'yamljs'; // Új import a YAML fájlok fix betöltéséhez
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import recordRoutes from "./routes/recordRoutes.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";



dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.use("/api/users", userRoutes);
app.use('/api/records', recordRoutes);
app.get("/", (req, res) => res.send("A szerver fut!"));

// --- SWAGGER KONFIGURÁCIÓ (MANUÁLIS ÖSSZEFŰZÉS) ---

// 1. Fájlok beolvasása külön-külön
const userDocs = YAML.load(path.join(__dirname, "./docs/user.swagger.yaml"));
const recordDocs = YAML.load(path.join(__dirname, "./docs/record.swagger.yaml"));

// 2. Swagger beállítások összeállítása
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
        description: "Éles szerver"
      },
      {
        url: "http://localhost:3000",
        description: "Helyi fejlesztői szerver"
      }
    ],
    // Összefűzzük a végpontokat (paths)
    paths: {
      ...userDocs.paths,
      ...recordDocs.paths
    },
    // Összefűzzük a komponenseket (schemas és securitySchemes)
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ...(userDocs.components?.schemas || {}),
        ...(recordDocs.components?.schemas || {})
      },
    },
  },
  apis: [], // Üresen hagyjuk, mert manuálisan adtuk meg a definíciókat
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// CDN beállítások a Vercel statikus fájl hiba ellen
const swaggerOptionsUI = {
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
  ],
  customSiteTitle: "Klinik API Docs"
};

// Swagger UI beállítása
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerOptionsUI));

// --- SZERVER INDÍTÁSA ---
const PORT = process.env.PORT || 3000;

// Vercel-nél nem szabad fix porton listen-elni, de helyi teszteléshez kell
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Szerver: http://localhost:${PORT}`));
}

export default app;