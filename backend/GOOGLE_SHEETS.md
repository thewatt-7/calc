# Google Sheets Lead Capture

The backend can append each completed valuation lead to a Google Sheet through an Apps Script webhook.

## 1. Create the Google Sheet

Create a sheet with a tab named `Leads`.

Add this header row in row 1:

```text
Submitted At,Lead ID,Business Name,Industry,Annual Revenue,Net Income,Years In Business,Owner Involvement,Employees,Revenue Trend,Owns Real Estate,Owner Salary,Health Insurance,Retirement Contributions,Depreciation,Amortization,Interest Expense,Personal Expenses,One-Time Expenses,Name,Email,Valuation Low,Valuation High,Estimated Business Value,Final Multiple,Calculated SDE,Years Adjustment,Revenue Trend Adjustment,Owner Involvement Adjustment,Employees Adjustment
```

## 2. Add the Apps Script

In Google Sheets, go to `Extensions > Apps Script` and paste this code:

Paste only the code below. Do not paste the word `javascript` or any backticks into Apps Script.

```javascript
const SHEET_NAME = 'Leads';

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return jsonResponse({ ok: true, message: 'Business Value Estimator webhook is live.' });
}

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents);
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return jsonResponse({ ok: false, error: 'Missing sheet tab named Leads.' });
    }

    sheet.appendRow([
      payload.submittedAt,
      payload.leadId,
      payload.businessName,
      payload.businessType,
      payload.annualRevenue,
      payload.netIncome,
      payload.yearsOperating,
      payload.ownerInvolvement,
      payload.employees,
      payload.revenueTrend,
      payload.ownsRealEstate,
      payload.ownerSalary,
      payload.healthInsurance,
      payload.retirementContributions,
      payload.depreciation,
      payload.amortization,
      payload.interestExpense,
      payload.personalExpenses,
      payload.oneTimeExpenses,
      payload.name,
      payload.email,
      payload.valuationLow,
      payload.valuationHigh,
      payload.valuationMidpoint,
      payload.valuationMultiple,
      payload.valuationSde,
      payload.yearsAdjustment,
      payload.revenueTrendAdjustment,
      payload.ownerInvolvementAdjustment,
      payload.employeesAdjustment,
    ]);

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message });
  }
}
```

## 3. Deploy the webhook

1. Click `Deploy > New deployment`.
2. Choose `Web app`.
3. Set `Execute as` to `Me`.
4. Set `Who has access` to `Anyone`.
5. Deploy and copy the Web app URL ending in `/exec`.

If you edit the script later, click `Deploy > Manage deployments`, edit the active deployment, choose a new version,
and deploy again. Apps Script does not always run your latest code until you update the deployment version.

## 4. Add the URL to the backend environment

Set this in `backend/.env` and in your deployed backend environment:

```text
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

If this environment variable is blank, leads still save to MongoDB but will not be sent to Google Sheets.

## Troubleshooting

The backend expects the Apps Script to return JSON like this:

```json
{"ok":true}
```

If the backend logs that the webhook returned HTML, Google is not running the `doPost` handler. Check that:

- The URL is the deployed Web app URL ending in `/exec`, not the editor URL or `/dev` URL.
- `Who has access` is set to `Anyone`.
- The script was deployed from the Google Sheet through `Extensions > Apps Script`.
- The deployment was updated after the latest script changes.
- The sheet tab is named exactly `Leads`.
