const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

exports.handler = async (event, context) => {
  let browser = null;
  chromium.setHeadlessMode = true;
  chromium.setGraphicsMode = false;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.goto('https://example.com');

    await page.screenshot({ path: '/tmp/screenshot.png' });
    return 'Screenshot captured';

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};
