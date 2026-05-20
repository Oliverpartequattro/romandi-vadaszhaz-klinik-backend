// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import path from "path";
// import { fileURLToPath } from 'url';
// import YAML from 'yamljs';
// import helmet from "helmet"; 
// import { rateLimit } from "express-rate-limit"; 
// import connectDB from "./config/db.js";
// import userRoutes from "./routes/userRoutes.js";
// import recordRoutes from "./routes/recordRoutes.js";
// import appointmentRoutes from "./routes/appointmentRoutes.js";
// import serviceRoutes from "./routes/serviceRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";
// import availabilityRoutes from './routes/availabilityRoutes.js';
// import swaggerJsdoc from "swagger-jsdoc";
// import swaggerUi from "swagger-ui-express";
// import { errorHandler } from './middleware/errorMiddleware.js';



// dotenv.config();
// connectDB();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();

// // // --- BIZTONSÁGI MIDDLEWARE-EK ---

// // // 1. Helmet: Beállítja a megfelelő biztonsági HTTP fejléceket (XSS védelem, stb.)
// // app.use(helmet({
// //     contentSecurityPolicy: false, // Swagger UI miatt ki kell kapcsolni vagy konfigurálni
// // }));

// // // 2. Rate Limit: Megakadályozza a brute-force támadásokat és a túlterhelést
// // const limiter = rateLimit({
// //     windowMs: 15 * 60 * 1000, // 15 perc
// //     max: 100, // IP-nként maximum 100 kérés a megadott időablakban
// //     message: {
// //         message: "Túl sok kérés érkezett erről az IP címről, kérjük próbálja meg később (15 perc múlva)."
// //     },
// //     standardHeaders: true, // Visszaküldi a RateLimit-Limit fejlécet
// //     legacyHeaders: false, // Kikapcsolja a régi X-RateLimit-* fejléceket
// // });

// // // Alkalmazzuk a limitert minden API hívásra
// // app.use("/api", limiter);

// app.use(cors());
// app.use(express.json());

// // --- ROUTES ---
// app.use("/api/users", userRoutes);
// app.use('/api/records', recordRoutes);
// app.use('/api/appointments', appointmentRoutes);
// app.use('/api/services', serviceRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/availability', availabilityRoutes);

// app.get("/", (req, res) => res.send("A szerver fut!"));
// app.use(errorHandler);
// // --- SWAGGER KONFIGURÁCIÓ (MANUÁLIS ÖSSZEFŰZÉS) ---

// // 1. Fájlok beolvasása külön-külön
// const userDocs = YAML.load(path.join(__dirname, "./docs/user.swagger.yaml"));
// const recordDocs = YAML.load(path.join(__dirname, "./docs/record.swagger.yaml"));
// const appointmentDocs = YAML.load(path.join(__dirname, "./docs/appointment.swagger.yaml"));
// const serviceDocs = YAML.load(path.join(__dirname, "./docs/service.swagger.yaml"));
// const availabilityDocs = YAML.load(path.join(__dirname, "./docs/availability.swagger.yaml"));

// // 2. Swagger beállítások összeállítása
// const swaggerOptions = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Klinik Rendszer API",
//       version: "1.0.0",
//       description: "A szakdolgozatomhoz készült orvosi rendszer API dokumentációja",
//     },
//     servers: [
//       {
//         url: "https://romandi-vadaszhaz-klinik-backend.vercel.app",
//         description: "Éles szerver"
//       }
//     ],
//     // Összefűzzük a végpontokat (paths)
//     paths: {
//       ...userDocs.paths,
//       ...recordDocs.paths,
//       ...appointmentDocs.paths,
//       ...serviceDocs.paths,
//       ...availabilityDocs.paths,
//     },
//     // Összefűzzük a komponenseket (schemas és securitySchemes)
//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: "http",
//           scheme: "bearer",
//           bearerFormat: "JWT",
//         },
//       },
//       schemas: {
//         ...(userDocs.components?.schemas || {}),
//         ...(recordDocs.components?.schemas || {}),
//         ...(appointmentDocs.components?.schemas || {}),
//         ...(serviceDocs.components?.schemas || {}),
//         ...(availabilityDocs.components?.schemas || {})
//       },
//     },
//   },
//   apis: [], // Üresen hagyjuk, mert manuálisan adtuk meg a definíciókat
// };

// const swaggerDocs = swaggerJsdoc(swaggerOptions);

// // CDN beállítások a Vercel statikus fájl hiba ellen
// const swaggerOptionsUI = {
//   customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
//   customJs: [
//     'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
//     'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
//   ],
//   customSiteTitle: "Klinik API Docs"
// };

// // Swagger UI beállítása
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerOptionsUI));

// // --- SZERVER INDÍTÁSA ---
// const PORT = process.env.PORT || 3000;

// // Vercel-nél nem szabad fix porton listen-elni, de helyi teszteléshez kell
// if (process.env.NODE_ENV !== 'production') {
//     app.listen(PORT, () => console.log(`Szerver: http://localhost:${PORT}`));
// }

// export default app;