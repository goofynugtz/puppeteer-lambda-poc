const join = require("path").join;
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const AWS = require('aws-sdk');

const data = require("./sale.json")
const store = require("./store.json")

var execPath;
const s3 = new AWS.S3();

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
    await page.goto("file://"+ __dirname +"/templates/gst-invoice.html");
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
    let buffer = await page.pdf({
      format: 'A4',
      margin: { top: "0.5in", bottom: "1.5in", left: "1in", right: "1in", },
    });
    const params = {
      Bucket: 'puppeteer-test-bucket-1',
      Key: 'invoice.pdf',
      Body: buffer,
      ContentType: 'application/pdf',
    };
  
    await s3.upload(params).promise();
    endTime = performance.now();
    executionTime = endTime - startTime;
    console.log(`Phase 6 [Upload PDF to S3]: ${executionTime} ms`)
    
    return 'PDF Uploaded'

  } catch (error) {
    console.error('Error:', error);
    throw error;

  } finally {
    if (browser !== null) await browser.close();
  }
};
