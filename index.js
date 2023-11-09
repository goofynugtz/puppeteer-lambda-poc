const join = require("path").join;
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const data = require("./sale.json")
const store = require("./store.json")

var execPath;

let browser = null;
chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

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
  try {
    let startTime = performance.now();
    // Phase 2
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await getPath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    
    let endTime = performance.now();
    let executionTime = endTime - startTime;
    console.log(`Phase 2 [Browser Invoke]: ${executionTime} ms`)

    
    startTime = performance.now();
    // Phase 3
    const page = await browser.newPage();
    endTime = performance.now();
    executionTime = endTime - startTime;
    console.log(`Phase 3 [New Page]: ${executionTime} ms`)

    startTime = performance.now();
    // Phase 4
    await page.goto("file:///home/goofynugtz/Work/HomeDrop/pupp-poc/templates/gst-invoice.html");
    endTime = performance.now();
    executionTime = endTime - startTime;
    console.log(`Phase 4 [Access HTML]: ${executionTime} ms`)

    startTime = performance.now();
    // Phase 5
    await page.evaluate(new Function('store', 'data', 'loadData(store, data)'), store, data)
    endTime = performance.now();
    executionTime = endTime - startTime;
    console.log(`Phase 5 [Data Injection]: ${executionTime} ms`)
    
    startTime = performance.now();
    // Phase 6
    let path = join(__dirname, `invoice.pdf`)
    await page.screenshot({ path: 'screenshot.png' })
    await page.pdf({
      path: path,
      format: 'A4',
      margin: { top: "0.5in", bottom: "1.5in", left: "1in", right: "1in", },
  });
    endTime = performance.now();
    executionTime = endTime - startTime;
    console.log(`Phase 6 [PDF Save to File System]: ${executionTime} ms`)
    
    return 'PDF Created'

  } catch (error) {
    console.error('Error:', error);
    throw error;

  } finally {
    if (browser !== null) await browser.close();
  }
};
