const { scrapeLinkedInJobListings } = require('./scrapers/scrapeLinkedInJobListings');
const { getLinkedInHTML } = require('./scrapers/getLinkedInHTML');
const { scrapeJobsDBJobListings } = require('./scrapers/scrapeJobsDBJobListings');
const { getJobsDBHTML } = require('./scrapers/getJobsDBHTML');
const cron = require('node-cron');

// Main function to run the application
const runLinkedIn = async () => {
  try {
    console.log('Starting job listings scraping (LinkedIn)...');
    await scrapeLinkedInJobListings();
    console.log('Scraping complete. Now starting to get HTML content (LinkedIn)...');
    await getLinkedInHTML();
    console.log('HTML content retrieval complete (LinkedIn).');
  } catch (error) {
    console.error('An error occurred during run:', error);
  }
};

const runJobsDB = async () => {
  try {
    console.log('Starting job listings scraping (JobsDB)...');
    await scrapeJobsDBJobListings();
    console.log('Scraping complete. Now starting to get HTML content (JobsDB)...');
    await getJobsDBHTML();
    console.log('HTML content retrieval complete (JobsDB).');
  } catch (error) {
    console.error('An error occurred during run:', error);
  }
};

runLinkedIn();
runJobsDB();

//Schedule to run once a day at midnight
// cron.schedule('0 0 * * *', runLinkedIn);
// cron.schedule('0 0 * * *', runJobsDB);