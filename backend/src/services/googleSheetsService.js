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

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: process.env.GOOGLE_SHEETS_TIME_ZONE || "America/New_York",
});

const formatSheetDate = (value) => dateFormatter.format(new Date(value));

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

const getRowNumberFromUpdatedRange = (updatedRange) => {
    const match = updatedRange?.match(/![A-Z]+(\d+):/);
    return match ? Number(match[1]) : null;
};

const getSheetId = async (sheets) => {
    const response = await sheets.spreadsheets.get({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        fields: "sheets(properties(sheetId,title))",
    });
    const sheet = response.data.sheets?.find(({ properties }) => properties?.title === getSheetName());

    if (!sheet?.properties?.sheetId && sheet?.properties?.sheetId !== 0) {
        throw new Error(`Google Sheet tab "${getSheetName()}" was not found`);
    }

    return sheet.properties.sheetId;
};

const centerAlignRow = async (sheets, rowNumber) => {
    const sheetId = await getSheetId(sheets);

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        requestBody: {
            requests: [
                {
                    repeatCell: {
                        range: {
                            sheetId,
                            startRowIndex: rowNumber - 1,
                            endRowIndex: rowNumber,
                        },
                        cell: {
                            userEnteredFormat: {
                                horizontalAlignment: "CENTER",
                                verticalAlignment: "MIDDLE",
                            },
                        },
                        fields: "userEnteredFormat(horizontalAlignment,verticalAlignment)",
                    },
                },
            ],
        },
    });
};

const getSheetRow = (lead) => [
    formatSheetDate(lead.createdAt),
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

    const response = await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        range: getSheetRange(),
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values: [getSheetRow(lead)],
        },
    });
    const rowNumber = getRowNumberFromUpdatedRange(response.data.updates?.updatedRange);

    if (rowNumber) {
        await centerAlignRow(sheets, rowNumber);
    }
}
