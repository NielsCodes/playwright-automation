"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const playwright_webkit_1 = require("playwright-webkit");
const googleapis_1 = require("googleapis");
const dayjs_1 = __importDefault(require("dayjs"));
const PORT = process.env.PORT || 8080;
const app = express_1.default();
app.get('/:url', async (request, response) => {
    const URL = request.params.url;
    // Get the title
    const title = await getTitleFromURL(URL);
    // Add the title to Google Sheets
    await logTitleToSheets(URL, title);
    response.send('OK');
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
/**
 * Get the title of a website by its URL
 * @param url URL of the website we want to get the title from
 * @returns The title as a string
 */
const getTitleFromURL = async (url) => {
    // Browser initializitation
    const browser = await playwright_webkit_1.webkit.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    // Go to page
    await page.goto(url);
    // Wait one second to ensure everything has loaded in
    await page.waitForTimeout(1000);
    // Get the title element by its CSS selector
    const titleElement = await page.$('title');
    // Extract the inner text from the element
    const title = await (titleElement === null || titleElement === void 0 ? void 0 : titleElement.innerText());
    await browser.close();
    return title;
};
/**
 * Append the URL and title to our Google Sheet with the current date
 * @param url The URL from which the title was fetched
 * @param title The title string
 */
const logTitleToSheets = async (url, title) => {
    const SHEET_ID = '10-jQHX8bUbxQTNOuHfY3mssKY0Pqqwtbg5L59kqY3z4';
    const auth = await googleapis_1.google.auth.getClient({
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const sheets = googleapis_1.google.sheets({ version: 'v4', auth });
    const date = dayjs_1.default().format('DD-MM-YYYY');
    await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        valueInputOption: 'USER_ENTERED',
        range: 'A1:A1',
        requestBody: {
            values: [
                [date, url, title]
            ]
        }
    });
};
//# sourceMappingURL=app.js.map