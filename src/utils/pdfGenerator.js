const puppeteer = require("puppeteer");

const generatePdf = async (htmlContent) => {
    try {
        const browser = await puppeteer.launch({
            headless: 'new', // Use the latest headless mode
            executablePath: '/usr/bin/google-chrome', // Use system installed chrome
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
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

