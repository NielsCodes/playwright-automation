import express, { Request, Response } from 'express';
import { webkit } from 'playwright-webkit';
import { google } from 'googleapis';
import dayjs from 'dayjs';

const PORT = process.env.PORT || 8080;
const app = express();

app.get('/', async(request: Request, response: Response) => {

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
const getWordFromTarget = async (): Promise<string> => {
  // Browser initializitation
  const browser = await webkit.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Go to page
  await page.goto('https://scraping-target.niels.codes');
  // Wait one second to ensure everything has loaded in
  await page.waitForTimeout(1000);

  // Get the title element by its CSS selector
  const wordElement = await page.$('#output-element');
  // Extract the inner text from the element
  const word = await wordElement?.innerText()!;
  await browser.close();
  return word;

};

/**
 * Append the URL and title to our Google Sheet with the current date
 * @param url The URL from which the title was fetched
 * @param title The title string
 */
const logWordToSheets = async (word: string) => {
  const SHEET_ID = '10-jQHX8bUbxQTNOuHfY3mssKY0Pqqwtbg5L59kqY3z4';

  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const date = dayjs().format('DD-MM-YYYY');

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

}

