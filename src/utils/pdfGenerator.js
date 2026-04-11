const puppeteer = require("puppeteer");

const generatePdf = async (htmlContent) => {
    try {
        const browser = await puppeteer.launch({
            headless: 'new', // Use the latest headless mode
            executablePath: '/usr/bin/google-chrome', // Use system installed chrome
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf();
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

