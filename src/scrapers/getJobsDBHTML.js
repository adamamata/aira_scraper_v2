const puppeteer = require('puppeteer');
const { chunkArray } = require('../utils/chunkArray');
const { saveToFile, readFromFile } = require('../utils/fileUtils');

const getJobsDBHTML = async () => {
    const jsonFile = './data/JobsDB/jobListings.json';
    const jobListings = readFromFile(jsonFile);

    const chunkSize = 5;
    const chunks = chunkArray(jobListings, chunkSize);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const extractedContents = [];

    for (let chunk of chunks) {
        for (let job of chunk) {
            const url = job.url;

            try {
                await page.goto(url, { waitUntil: 'networkidle2' });

                const textContent = await page.evaluate(() => {
                    const element1 = document.querySelector('div[data-automation="detailsTitle"] h1');
                    const element2 = document.querySelector('div[data-automation="detailsTitle"] span');
                    const highlightsElement = document.querySelector('div[data-automation="job-details-job-highlights"]');
                    const descriptionElement = document.querySelector('div[data-automation="jobDescription"]');
                    const infoElements = document.querySelectorAll('div[data-automation="job-details-additional-information"] span');

                    if (element1 && element2) {
                        let textContentFinal = element1.innerText + element2.innerText + highlightsElement.innerText + descriptionElement.innerText + infoElements.innerText;
                        return textContentFinal;
                    } else {
                        return null;
                    }
                });

                if (textContent) {
                    extractedContents.push({content: textContent});
                }

            } catch (error) {
                console.error(`Error scraping ${url}: `, error)
            }
        }

        saveToFile('./data/jobsDB/extractedContent.json', extractedContents);
    }

    await browser.close();
    saveToFile('./data/jobsDB/extractedContent.json', extractedContents);
}

module.exports = { getJobsDBHTML };