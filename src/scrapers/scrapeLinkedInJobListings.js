const puppeteer = require('puppeteer');
const { saveToFile } = require('../utils/fileUtils');

const scrapeLinkedInJobListings = async () => {
    let browser;
    let jobListings = [];
    try {
        browser = await puppeteer.launch({
            args: [`--proxy-server:pr.oxylabs.io:7777`]
        });

        const page = await browser.newPage();
        await page.authenticate({
            username: 'airascraper',
            password: 'Blockchainlabs123'
        });

        await page.goto('https://www.linkedin.com/jobs/jobs-in-thailand?keywords=&location=Thailand&locationId=&geoId=105146118&f_TPR=r86400&position=1&pageNum=0', { waitUntil: 'networkidle0' });
        await page.waitForSelector('.job-search-card', { timeout: 60000 });

        let totalListings = 0;
        const maxListings = 100;

        while (totalListings < maxListings) {
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.waitForTimeout(3000);

            const loadMoreVisible = await page.evaluate(() => {
                const loadMoreButton = document.querySelector('button[aria-label="See more jobs"]');
                if (loadMoreButton) {
                    loadMoreButton.click();
                    return true;
                }
                return false;
            });

            if (loadMoreVisible) {
                await page.waitForSelector('.job-search-card', { timeout: 60000 });
            } else {
                break; // Exit the loop if no "Load More" button is found
            }

            const newJobListings = await page.evaluate(() => {
                const listings = [];
                const jobCards = document.querySelectorAll('.job-search-card');
                jobCards.forEach(card => {
                    const url = card.querySelector('.base-card__full-link')?.getAttribute('href');
                    listings.push({ url: url });
                });
                return listings;
            });

            jobListings = [...jobListings, ...newJobListings];
            totalListings = jobListings.length;

            saveToFile('./data/linkedIn/jobListings.json', jobListings);
            console.log(`${totalListings} Job URLs saved to ./data/linkedIn/jobListings.json `); // Console log after saving

            if (totalListings >= maxListings) {
                break; // Exit the loop if maximum listings are reached
            }
        }

    } catch (error) {
        console.error('An error occurred during scraping:', error);
        saveToFile('./data/linkedIn/jobListings.json', jobListings);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

module.exports = { scrapeLinkedInJobListings };
