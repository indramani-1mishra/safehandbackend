const puppeteer = require("puppeteer");

const generatePdf = async (htmlContent) => {
    try {
        const launchOptions = {
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        };

        if (process.platform !== 'win32') {
            launchOptions.executablePath = '/usr/bin/google-chrome';
        }

        const browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();
        return pdfBuffer;
    } catch (error) {
        console.error(" Failed to generate PDF:", error);
        throw error;
    }
};

module.exports = {
    generatePdf
};

