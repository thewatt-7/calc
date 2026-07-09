import ValuationLead from "../models/ValuationLead.js";
import { appendValuationLeadToSheet } from "../services/googleSheetsService.js";

const toNumber = (value) => Number(value || 0);
const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== "";
const toOptionalNumber = (value) => (hasValue(value) ? Number(value) : null);

export async function createValuationLead(req, res) {
    try {
        const {
            businessName,
            businessType,
            annualRevenue,
            netIncome,
            yearsOperating,
            ownerInvolvement,
            employees,
            revenueTrend,
            ownsRealEstate,
            ownerSalary,
            healthInsurance,
            retirementContributions,
            depreciation,
            amortization,
            interestExpense,
            personalExpenses,
            oneTimeExpenses,
            name,
            email = "",
            valuation,
        } = req.body;

        const requiredValues = {
            businessName,
            businessType,
            annualRevenue,
            netIncome,
            yearsOperating,
            ownerInvolvement,
            employees,
            revenueTrend,
            ownsRealEstate,
            name,
        };
        const missingFields = Object.entries(requiredValues)
            .filter(([, value]) => !hasValue(value))
            .map(([field]) => field);

        if (missingFields.length || !valuation) {
            return res.status(400).json({
                message: "Missing required valuation information",
                missingFields: !valuation ? [...missingFields, "valuation"] : missingFields,
            });
        }

        const lead = await ValuationLead.create({
            businessName,
            businessType,
            annualRevenue: toNumber(annualRevenue),
            netIncome: toNumber(netIncome),
            yearsOperating: toNumber(yearsOperating),
            ownerInvolvement,
            employees: toNumber(employees),
            revenueTrend,
            ownsRealEstate,
            ownerSalary: toOptionalNumber(ownerSalary),
            healthInsurance: toOptionalNumber(healthInsurance),
            retirementContributions: toOptionalNumber(retirementContributions),
            depreciation: toOptionalNumber(depreciation),
            amortization: toOptionalNumber(amortization),
            interestExpense: toOptionalNumber(interestExpense),
            personalExpenses: toOptionalNumber(personalExpenses),
            oneTimeExpenses: toOptionalNumber(oneTimeExpenses),
            name,
            email,
            valuationLow: toNumber(valuation.low),
            valuationHigh: toNumber(valuation.high),
            valuationMidpoint: toNumber(valuation.midpoint),
            valuationMultiple: toNumber(valuation.multiple),
            valuationSde: toNumber(valuation.sde),
            valuationAdjustments: {
                years: toNumber(valuation.adjustments?.years),
                revenueTrend: toNumber(valuation.adjustments?.revenueTrend),
                ownerInvolvement: toNumber(valuation.adjustments?.ownerInvolvement),
                employees: toNumber(valuation.adjustments?.employees),
            },
        });

        try {
            await appendValuationLeadToSheet(lead);
            console.info(`Google Sheets append completed for valuation lead ${lead._id}`);
        } catch (error) {
            console.error("Failed to append valuation lead to Google Sheets", error);
        }

        return res.status(201).json({
            message: "Valuation lead saved successfully",
            leadId: lead._id,
        });
    } catch (error) {
        console.error("Error in createValuationLead controller", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
