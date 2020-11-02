import express, { Request, Response } from 'express';
import { webkit } from 'playwright-webkit';
import { google } from 'googleapis';
import dayjs from 'dayjs';

const PORT = process.env.PORT || 8080;
const app = express();

app.get('/:url', async(request: Request, response: Response) => {

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
const getTitleFromURL = async (url: string): Promise<string> => {
  // Browser initializitation
  const browser = await webkit.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Go to page
  await page.goto(url);
  // Wait one second to ensure everything has loaded in
  await page.waitForTimeout(1000);

  // Get the title element by its CSS selector
  const titleElement = await page.$('title');
  // Extract the inner text from the element
  const title = await titleElement?.innerText()!;
  await browser.close();
  return title;

};

/**
 * Append the URL and title to our Google Sheet with the current date
 * @param url The URL from which the title was fetched
 * @param title The title string
 */
const logTitleToSheets = async (url: string, title: string) => {
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
        [date, url, title]
      ]
    }
  });

}

