const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

async function uploadToAzureBlobStorage(localFilePath, containerName, blobName) {
    try {
        // Retrieve the connection string from environment variables
        const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING; 
        if (!AZURE_STORAGE_CONNECTION_STRING) {
            throw new Error("Azure Storage Connection string not found");
        }

        // Create a BlobServiceClient
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

        // Get a reference to a container
        const containerClient = blobServiceClient.getContainerClient(containerName);

        // Create the container if it does not exist
        await containerClient.createIfNotExists();

        // Get a block blob client
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Upload file
        await blockBlobClient.uploadFile(localFilePath);

        console.log(`File "${localFilePath}" is uploaded to Azure Blob Storage container "${containerName}" as blob "${blobName}"`);
    } catch (error) {
        console.error("Error uploading to Azure Blob Storage: ", error);
        throw error;
    }
}

module.exports = { uploadToAzureBlobStorage };