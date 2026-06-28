import express from "express";
import { createValuationLead } from "../controllers/valuationController.js";

const router = express.Router();

router.post("/", createValuationLead);

export default router;
