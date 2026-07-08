import express from "express";

import notesRoutes from "./routes/notesRoutes.js";
import valuationRoutes from "./routes/valuationRoutes.js";

const app = express();

const getAllowedOrigins = () => [
    ...(process.env.ALLOWED_ORIGINS || "").split(","),
    process.env.CLIENT_URL,
    "https://business-value-estimator.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
].filter(Boolean).map((origin) => origin.trim());

app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = getAllowedOrigins();

    if (!origin || allowedOrigins.includes(origin)) {
        if (origin) {
            res.header("Access-Control-Allow-Origin", origin);
        }
        res.header("Vary", "Origin");
    }

    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.use(express.json());

const healthHandler = (_req, res) => {
    res.status(200).json({ ok: true });
};

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

app.use("/notes", notesRoutes);
app.use("/api/notes", notesRoutes);

app.use("/valuations", valuationRoutes);
app.use("/api/valuations", valuationRoutes);

export default app;
