const puppeteer = require('puppeteer');
const { saveToFile } = require('../utils/fileUtils');

const scrapeJobsDBJobListings = async (maxPages = 5) => { 
    let browser;
    let jobUrls = []; 
    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        let hasNextPage = true;
        let currentPage = 1;

        while (hasNextPage && currentPage <= maxPages) { // add check for maxPages
            await page.goto(`https://th.jobsdb.com/th/en/Search/FindJobs?JSRV=1&createdAt=1d&page=${currentPage}`);
            
            // Add URLs from the current page
            const newUrls = await page.evaluate(() => {
                const baseUrl = 'https://th.jobsdb.com';
                const links = [];
                document.querySelectorAll('a.jdlu992').forEach(element => {
                    const relativeUrl = element.getAttribute('href');
                    if (relativeUrl.includes('/th/en/job/')) {
                        links.push({ url: baseUrl + relativeUrl });
                    }
                });
                return links;
            });
            jobUrls = jobUrls.concat(newUrls);

            // Save the collected URLs periodically
            const filePath = './data/jobsDB/jobListings.json';
            saveToFile(filePath, jobUrls);
            console.log(`Job URLs saved to ${filePath} after page ${currentPage}`);

            // Check for 'Next' button
            const nextButton = await page.$('a._1hbhsw69q'); 
            hasNextPage = nextButton !== null;
            if (hasNextPage) {
                await Promise.all([
                    page.waitForNavigation(),
                    nextButton.click()
                ]);
                currentPage++;
            }
        }

    } catch (error) {
        console.error('An error occurred during scraping: ', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = { scrapeJobsDBJobListings };
