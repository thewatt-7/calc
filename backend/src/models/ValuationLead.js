import mongoose from "mongoose";

const valuationLeadSchema = new mongoose.Schema({
    businessType: {
        type: String,
        required: true,
        trim: true,
    },
    annualRevenue: {
        type: Number,
        required: true,
        min: 0,
    },
    annualProfit: {
        type: Number,
        required: true,
        min: 0,
    },
    yearsOperating: {
        type: Number,
        required: true,
        min: 0,
    },
    ownerHours: {
        type: String,
        required: true,
        trim: true,
    },
    revenueTrend: {
        type: String,
        required: true,
        trim: true,
    },
    assets: {
        type: Number,
        default: 0,
        min: 0,
    },
    name: {
        type: String,
        trim: true,
        default: "",
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: "",
    },
    valuationLow: {
        type: Number,
        required: true,
        min: 0,
    },
    valuationHigh: {
        type: Number,
        required: true,
        min: 0,
    },
    valuationMidpoint: {
        type: Number,
        required: true,
        min: 0,
    },
    valuationMultiple: {
        type: Number,
        required: true,
        min: 0,
    },
}, { timestamps: true });

const ValuationLead = mongoose.model("ValuationLead", valuationLeadSchema);

export default ValuationLead;
