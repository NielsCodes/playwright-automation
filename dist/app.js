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
app.get('/', async (request, response) => {
    // Get the word using Playwright
    const word = await getWordFromTarget();
    console.log(word);
    // Add the word to Google Sheets
    await logWordToSheets(word);
    response.send('OK');
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
/**
 * Get the title of a website by its URL
 * @param url URL of the website we want to get the title from
 * @returns The title as a string
 */
const getWordFromTarget = async () => {
    // Browser initializitation
    const browser = await playwright_webkit_1.webkit.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    // Go to page
    await page.goto('https://scraping-target.niels.codes');
    // Wait one second to ensure everything has loaded in
    await page.waitForTimeout(1000);
    // Get the title element by its CSS selector
    const wordElement = await page.$('#output-element');
    // Extract the inner text from the element
    const word = await (wordElement === null || wordElement === void 0 ? void 0 : wordElement.innerText());
    await browser.close();
    return word;
};
/**
 * Append the URL and title to our Google Sheet with the current date
 * @param url The URL from which the title was fetched
 * @param title The title string
 */
const logWordToSheets = async (word) => {
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
                [date, word]
            ]
        }
    });
};
//# sourceMappingURL=app.js.map