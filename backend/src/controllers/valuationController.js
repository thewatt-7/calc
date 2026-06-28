import ValuationLead from "../models/ValuationLead.js";

const toNumber = (value) => Number(value || 0);

export async function createValuationLead(req, res) {
    try {
        const {
            businessType,
            annualRevenue,
            annualProfit,
            yearsOperating,
            ownerHours,
            revenueTrend,
            assets,
            name,
            email,
            valuation,
        } = req.body;

        if (!businessType || !ownerHours || !revenueTrend || !valuation) {
            return res.status(400).json({ message: "Missing required valuation information" });
        }

        const lead = await ValuationLead.create({
            businessType,
            annualRevenue: toNumber(annualRevenue),
            annualProfit: toNumber(annualProfit),
            yearsOperating: toNumber(yearsOperating),
            ownerHours,
            revenueTrend,
            assets: toNumber(assets),
            name,
            email,
            valuationLow: toNumber(valuation.low),
            valuationHigh: toNumber(valuation.high),
            valuationMidpoint: toNumber(valuation.midpoint),
            valuationMultiple: toNumber(valuation.multiple),
        });

        return res.status(201).json({
            message: "Valuation lead saved successfully",
            leadId: lead._id,
        });
    } catch (error) {
        console.error("Error in createValuationLead controller", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
