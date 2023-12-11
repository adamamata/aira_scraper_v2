require('dotenv').config();
const { scrapeLinkedInJobListings } = require('./scrapers/scrapeLinkedInJobListings');
const { getLinkedInHTML } = require('./scrapers/getLinkedInHTML');
const { scrapeJobsDBJobListings } = require('./scrapers/scrapeJobsDBJobListings');
const { getJobsDBHTML } = require('./scrapers/getJobsDBHTML');
const { uploadToAzureBlobStorage } = require('./utils/uploadToAzureBlobStorage');
const cron = require('node-cron');

// Main function to run the application
const runLinkedIn = async () => {
  try {
    console.log('Starting job listings scraping (LinkedIn)...');
    await scrapeLinkedInJobListings();
    console.log('Scraping complete. Now starting to get HTML content (LinkedIn)...');
    await getLinkedInHTML();
    console.log('HTML content retrieval complete (LinkedIn). Now uploading to blob storage');
    const localFilePath = './data/linkedIn/LinkedIn_extractedContent.json';
    const containerName = 'data';
    const blobName = 'linkedInListings.json';
    await uploadToAzureBlobStorage(localFilePath, containerName, blobName);
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
    console.log('HTML content retrieval complete (JobsDB). Now uploading to blob storage');
    const localFilePath = './data/jobsDB/JobsDB_extractedContent.json';
    const containerName = 'data';
    const blobName = 'jobsDBListings.json';
    await uploadToAzureBlobStorage(localFilePath, containerName, blobName);
  } catch (error) {
    console.error('An error occurred during run:', error);
  }
};

// runLinkedIn();
// runJobsDB();
//Test

//Schedule to run once a day at midnight
cron.schedule('0 0 * * *', runLinkedIn);
cron.schedule('0 0 * * *', runJobsDB);