const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

var execPath;

async function getPath(){
  let startTime = performance.now();
  
  if (execPath) return execPath;
  execPath = await chromium.executablePath()
  console.log("Path: ", execPath)
  
  let endTime = performance.now();
  let executionTime = endTime - startTime;
  console.log(`Phase 1 [GetPath]: ${executionTime} ms`)
  return execPath;
}

exports.handler = async (event, context) => {
  
  let browser = null;
  chromium.setHeadlessMode = true;
  chromium.setGraphicsMode = false;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await getPath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    await page.goto('file://home/goofynugtz/Work/HomeDrop/pupp-poc/template/gst-invoice.html');
    await page.screenshot({ path: 'screenshot.png' });
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
