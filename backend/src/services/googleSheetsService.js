const toNumber = (value) => Number(value || 0);

const getSheetPayload = (lead) => ({
    submittedAt: lead.createdAt,
    leadId: lead._id.toString(),
    businessName: lead.businessName,
    businessType: lead.businessType,
    annualRevenue: lead.annualRevenue,
    netIncome: lead.netIncome,
    yearsOperating: lead.yearsOperating,
    ownerInvolvement: lead.ownerInvolvement,
    employees: lead.employees,
    revenueTrend: lead.revenueTrend,
    ownsRealEstate: lead.ownsRealEstate,
    ownerSalary: lead.ownerSalary,
    healthInsurance: lead.healthInsurance,
    retirementContributions: lead.retirementContributions,
    depreciation: lead.depreciation,
    amortization: lead.amortization,
    interestExpense: lead.interestExpense,
    personalExpenses: lead.personalExpenses,
    oneTimeExpenses: lead.oneTimeExpenses,
    name: lead.name,
    email: lead.email,
    valuationLow: lead.valuationLow,
    valuationHigh: lead.valuationHigh,
    valuationMidpoint: lead.valuationMidpoint,
    valuationMultiple: lead.valuationMultiple,
    valuationSde: lead.valuationSde,
    yearsAdjustment: toNumber(lead.valuationAdjustments?.years),
    revenueTrendAdjustment: toNumber(lead.valuationAdjustments?.revenueTrend),
    ownerInvolvementAdjustment: toNumber(lead.valuationAdjustments?.ownerInvolvement),
    employeesAdjustment: toNumber(lead.valuationAdjustments?.employees),
});

export async function appendValuationLeadToSheet(lead) {
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn("Skipping Google Sheets append because GOOGLE_SHEETS_WEBHOOK_URL is not set.");
        return;
    }

    const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(getSheetPayload(lead)),
    });
    const responseText = await response.text();

    if (!response.ok) {
        throw new Error(`Google Sheets webhook failed with status ${response.status}: ${responseText.slice(0, 300)}`);
    }

    let responseBody;

    try {
        responseBody = JSON.parse(responseText);
    } catch {
        throw new Error(`Google Sheets webhook returned non-JSON response: ${responseText.slice(0, 1500)}`);
    }

    if (!responseBody.ok) {
        throw new Error(`Google Sheets webhook returned unsuccessful response: ${responseText.slice(0, 300)}`);
    }
}
