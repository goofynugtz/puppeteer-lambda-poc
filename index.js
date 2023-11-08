const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium-min");

exports.handler = async (event, context) => {
    // Phase 1
  let startTime = performance.now();

  let browser = null;
  chromium.setHeadlessMode = true;
  chromium.setGraphicsMode = false;
  
  let endTime = performance.now();
  let executionTime = endTime - startTime;
  console.log(`Phase 1 [Init]: ${executionTime} ms`)
  
  try {
    // Phase 2
    startTime = performance.now();

    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath("/opt/chromium"),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    
    endTime = performance.now();
    executionTime = endTime - startTime;
    console.log(`Phase 2 [Browser Invoke]: ${executionTime} ms`)
    
    // Phase 3
    startTime = performance.now();
    
    const page = await browser.newPage();
    
    endTime = performance.now();
    executionTime = endTime - startTime;
    console.log(`Phase 3 [Create new page]: ${executionTime} ms`)

    // Phase 4
    startTime = performance.now();
    
    await page.goto('https://example.com');
    
    endTime = performance.now();
    executionTime = endTime - startTime;
    console.log(`Phase 4 [URL fetch]: ${executionTime} ms`)

    // Phase 5
    startTime = performance.now();
    
    await page.screenshot({ path: '/tmp/screenshot.png' });
    
    endTime = performance.now();
    executionTime = endTime - startTime;
    console.log(`Phase 5 [Screen Capture]: ${executionTime} ms`)

    return 'Screenshot captured';

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    if (browser !== null) {
      // Phase 6
      startTime = performance.now();
      
      await browser.close();
      
      endTime = performance.now();
      executionTime = endTime - startTime;
      console.log(`Phase 6 [Browser Dealloc]: ${executionTime} ms`)
    }
  }
};
