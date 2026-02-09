import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js"; // Fontos: a .js kiterjesztés kiírása kötelező!
import userRoutes from "./routes/userRoutes.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);

// Teszt route
app.get("/", (req, res) => res.send("A szerver fut!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Szerver: http://localhost:${PORT}`));

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Klinik Rendszer API",
      version: "1.0.0",
      description:
        "A szakdolgozatomhoz készült orvosi rendszer API dokumentációja",
    },
    servers: [
      {
        url: "https://romandi-vadaszhaz-klinik-backend.vercel.app", // Vagy a Vercel-es URL-ed
      },
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
  apis: ["./docs/*.yaml"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Swagger UI útvonala
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

export default app;
