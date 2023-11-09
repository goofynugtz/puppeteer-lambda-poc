const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const store = require("./store.json")
const data = require("./sale.json")

var execPath;

async function getPath(){
  let startTime = performance.now();
  
  if (execPath) return execPath;
  execPath = await chromium.executablePath()
  console.log("Path:", execPath)
  
  let endTime = performance.now();
  let executionTime = endTime - startTime;
  console.log(`Phase 1 [GetPath]: ${executionTime} ms`)
  return execPath;
}

async function func() {

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
    
    const page = await browser.newPage();
    await page.goto("file:///home/goofynugtz/Work/HomeDrop/pupp-poc/templates/gst-invoice.html");
    await page.evaluate(new Function('store', 'data', 'loadData(store, data)'), store, data)
    
    await page.screenshot({ path: 'screenshot.png' });
    return 'Screenshot captured';

  } catch (error) {
    console.error('Error:', error);
    throw error;

  } finally {
    if (browser !== null) await browser.close();
  }
};

func()
