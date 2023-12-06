const puppeteer = require('puppeteer');
const { chunkArray } = require('../utils/chunkArray');
const { saveToFile, readFromFile } = require('../utils/fileUtils');

const getJobIDFromURL = (url) => {
    const match = url.match(/job\/[^\/]*-(\d+)/);
    return match ? match[1] : null;
};

const getJobsDBHTML = async () => {
    const jsonFile = './data/JobsDB/jobListings.json';
    const jobListings = readFromFile(jsonFile);

    const chunkSize = 5;
    const chunks = chunkArray(jobListings, chunkSize);

    try {
        const browser = await puppeteer.launch({
            args: [`--proxy-server:pr.oxylabs.io:7777`]
        });
        const page = await browser.newPage();
        await page.authenticate({
            username: 'airascraper',
            password: 'Blockchainlabs123'
        });

        const extractedContents = [];

        for (let chunk of chunks) {
            for (let job of chunk) {
                const url = job.url;
                const jobId = getJobIDFromURL(url);

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
                        extractedContents.push({id: jobId, url: url, content: textContent});
                    }

            } catch (error) {
                console.error(`Error scraping ${url}: `, error)
            }
        }

        saveToFile('./data/jobsDB/extractedContent.json', extractedContents);
        console.log(`Saved ${extractedContents.length} jobs to JobsDB file.`)
    }

    } catch (error) {
        console.log(error)
    } finally {
        await browser.close();
        saveToFile('./data/jobsDB/extractedContent.json', extractedContents);
    }
}

module.exports = { getJobsDBHTML };