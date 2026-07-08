# Google Sheets Lead Capture

The backend appends valuation leads directly to Google Sheets with the official Google Sheets API. There is no Apps
Script webhook in this setup.

## 1. Create The Sheet

Create a Google Sheet with a tab named `Leads`.

Add this header row in row 1:

```text
Submitted At,Lead ID,Business Name,Name,Industry,Annual Revenue,Net Income,Years In Business,Owner Involvement,Employees,Revenue Trend,Owns Real Estate,Owner Salary,Health Insurance,Retirement Contributions,Depreciation,Amortization,Interest Expense,Personal Expenses,One-Time Expenses,Email,Valuation Low,Valuation High,Estimated Business Value,Final Multiple,Calculated SDE,Years Adjustment,Revenue Trend Adjustment,Owner Involvement Adjustment,Employees Adjustment
```

## 2. Create Google Credentials

1. In Google Cloud, create or select a project.
2. Enable the Google Sheets API for that project.
3. Create a service account.
4. Create a JSON key for the service account.
5. Share the target Google Sheet with the service account email and give it Editor access.

## 3. Configure The Backend

Set these env vars in `backend/.env` locally and in the deployed backend environment:

```text
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SHEETS_SHEET_NAME=Leads
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

The spreadsheet ID is the long ID in the Google Sheet URL:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

For Vercel production, set these on the backend project and redeploy after changing them.

## Troubleshooting

Check backend logs after submitting a valuation:

- `Skipping Google Sheets append because these env vars are missing...` means production is missing one or more
  required backend env vars.
- `Google Sheets append completed...` means the row was added.
- `The caller does not have permission` usually means the spreadsheet was not shared with the service account email.
- `Unable to parse range` usually means `GOOGLE_SHEETS_SHEET_NAME` does not match the tab name exactly.
- `invalid_grant` or private key errors usually mean `GOOGLE_SHEETS_PRIVATE_KEY` was pasted without preserving `\n`
  newline escapes.
