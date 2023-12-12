//Imports
require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cron = require('node-cron');

//Function imports 
const { scrapeLinkedInJobListings } = require('./scrapers/scrapeLinkedInJobListings');
const { getLinkedInHTML } = require('./scrapers/getLinkedInHTML');
const { scrapeJobsDBJobListings } = require('./scrapers/scrapeJobsDBJobListings');
const { getJobsDBHTML } = require('./scrapers/getJobsDBHTML');
const { uploadToAzureBlobStorage } = require('./utils/uploadToAzureBlobStorage');

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

//Express routes
app.get('/runLinkedIn', async (req, res) => {
  try {
      await runLinkedIn();
      res.send('LinkedIn scraping and uploading process completed successfully.');
  } catch (error) {
      console.error('Error in /runLinkedIn endpoint:', error);
      res.status(500).send('Error occurred while running LinkedIn process.');
  }
});

app.get('/runJobsDB', async (req, res) => {
  try {
      await runJobsDB();
      res.send('JobsDB scraping and uploading process completed successfully.');
  } catch (error) {
      console.error('Error in /runJobsDB endpoint:', error);
      res.status(500).send('Error occurred while running JobsDB process.');
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

//Schedule to run once a day at midnight
cron.schedule('0 0 * * *', runLinkedIn);
cron.schedule('0 0 * * *', runJobsDB);