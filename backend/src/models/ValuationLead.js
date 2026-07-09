import mongoose from "mongoose";

const optionalAddBackField = {
    type: Number,
    default: null,
    min: 0,
};

const valuationLeadSchema = new mongoose.Schema({
    businessName: {
        type: String,
        required: true,
        trim: true,
    },
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
    netIncome: {
        type: Number,
        required: true,
    },
    yearsOperating: {
        type: Number,
        required: true,
        min: 0,
    },
    ownerInvolvement: {
        type: String,
        required: true,
        trim: true,
    },
    employees: {
        type: Number,
        required: true,
        min: 0,
    },
    revenueTrend: {
        type: String,
        required: true,
        trim: true,
    },
    ownsRealEstate: {
        type: String,
        required: true,
        trim: true,
    },
    ownerSalary: optionalAddBackField,
    personalExpenses: optionalAddBackField,
    oneTimeExpenses: optionalAddBackField,
    healthInsurance: optionalAddBackField,
    retirementContributions: optionalAddBackField,
    depreciation: optionalAddBackField,
    amortization: optionalAddBackField,
    interestExpense: optionalAddBackField,
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        default: "",
        trim: true,
        lowercase: true,
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
    valuationSde: {
        type: Number,
        required: true,
        min: 0,
    },
    valuationAdjustments: {
        years: {
            type: Number,
            default: 0,
        },
        revenueTrend: {
            type: Number,
            default: 0,
        },
        ownerInvolvement: {
            type: Number,
            default: 0,
        },
        employees: {
            type: Number,
            default: 0,
        },
    },
}, { timestamps: true });

const ValuationLead = mongoose.model("ValuationLead", valuationLeadSchema);

export default ValuationLead;
