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
import fs from 'fs';



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

// --- SWAGGER KONFIGURÁCIÓ ---

const docsDir = path.join(__dirname, "./docs");
let combinedPaths = {};
let combinedSchemas = {};

// Beolvassuk az összes .yaml fájlt a docs mappából
if (fs.existsSync(docsDir)) {
    const files = fs.readdirSync(docsDir);
    
    files.forEach(file => {
        if (file.endsWith('.yaml')) {
            const filePath = path.join(docsDir, file);
            const doc = YAML.load(filePath);
            
            // Path-ek (végpontok) összefűzése
            if (doc.paths) {
                combinedPaths = { ...combinedPaths, ...doc.paths };
            }
            
            // Sémák (modellek) összefűzése a components alatt
            if (doc.components && doc.components.schemas) {
                combinedSchemas = { ...combinedSchemas, ...doc.components.schemas };
            }
        }
    });
}

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
        paths: combinedPaths,
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: combinedSchemas // Itt jelennek meg az összes fájlból begyűjtött modellek
        },
    },
    apis: [], // Mivel manuálisan fűztük össze a YAML-eket, ez maradhat üres
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