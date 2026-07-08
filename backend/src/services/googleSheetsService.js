import { google } from "googleapis";

const toNumber = (value) => Number(value || 0);

let sheetsClient = null;

const requiredConfigKeys = [
    "GOOGLE_SHEETS_SPREADSHEET_ID",
    "GOOGLE_SHEETS_CLIENT_EMAIL",
    "GOOGLE_SHEETS_PRIVATE_KEY",
];

const getMissingConfigKeys = () => requiredConfigKeys.filter((key) => !process.env[key]);

const getSheetName = () => process.env.GOOGLE_SHEETS_SHEET_NAME || "Leads";

const getPrivateKey = () => process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");

const getSheetsClient = () => {
    if (sheetsClient) {
        return sheetsClient;
    }

    const auth = new google.auth.JWT({
        email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        key: getPrivateKey(),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    sheetsClient = google.sheets({ version: "v4", auth });
    return sheetsClient;
};

const getSheetRange = () => {
    const escapedSheetName = getSheetName().replace(/'/g, "''");
    return `'${escapedSheetName}'!A1`;
};

const getSheetRow = (lead) => [
    lead.createdAt,
    lead._id.toString(),
    lead.businessName,
    lead.name,
    lead.businessType,
    lead.annualRevenue,
    lead.netIncome,
    lead.yearsOperating,
    lead.ownerInvolvement,
    lead.employees,
    lead.revenueTrend,
    lead.ownsRealEstate,
    lead.ownerSalary,
    lead.healthInsurance,
    lead.retirementContributions,
    lead.depreciation,
    lead.amortization,
    lead.interestExpense,
    lead.personalExpenses,
    lead.oneTimeExpenses,
    lead.email,
    lead.valuationLow,
    lead.valuationHigh,
    lead.valuationMidpoint,
    lead.valuationMultiple,
    lead.valuationSde,
    toNumber(lead.valuationAdjustments?.years),
    toNumber(lead.valuationAdjustments?.revenueTrend),
    toNumber(lead.valuationAdjustments?.ownerInvolvement),
    toNumber(lead.valuationAdjustments?.employees),
];

export async function appendValuationLeadToSheet(lead) {
    const missingConfigKeys = getMissingConfigKeys();

    if (missingConfigKeys.length) {
        console.warn(`Skipping Google Sheets append because these env vars are missing: ${missingConfigKeys.join(", ")}`);
        return;
    }

    const sheets = getSheetsClient();

    await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        range: getSheetRange(),
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values: [getSheetRow(lead)],
        },
    });
}
