// 1:11:23

import express from "express";
import notesRoutes from "./routes/notesRoutes.js";
import valuationRoutes from "./routes/valuationRoutes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
].filter(Boolean);

connectDB();

// middleware
app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
    }

    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.use(express.json());

app.use("/api/notes", notesRoutes)
app.use("/api/valuations", valuationRoutes)

app.listen(PORT, () => {
    console.log("Server started on PORT:", PORT)
});
