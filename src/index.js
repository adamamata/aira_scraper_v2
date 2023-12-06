const { scrapeLinkedInJobListings } = require('./scrapers/scrapeLinkedInJobListings');
const { getLinkedInHTML } = require('./scrapers/getLinkedInHTML');
const { scrapeJobsDBJobListings } = require('./scrapers/scrapeJobsDBJobListings');
const { getJobsDBHTML } = require('./scrapers/getJobsDBHTML');
const cron = require('node-cron');

// Main function to run the application
const runLinkedIn = async () => {
  try {
    // console.log('Starting job listings scraping...');
    // await scrapeLinkedInJobListings();
    // console.log('Scraping complete. Now starting to get HTML content...');
    // await getLinkedInHTML();
    // console.log('HTML content retrieval complete.');
  } catch (error) {
    console.error('An error occurred during run:', error);
  }
};

const runJobsDB = async () => {
  try {
    // await scrapeJobsDBJobListings();
    await getJobsDBHTML();
  } catch (error) {
    console.error('An error occurred during run:', error);
  }
};

runLinkedIn();
runJobsDB();

//Schedule to run once a day at midnight
// cron.schedule('0 0 * * *', run);