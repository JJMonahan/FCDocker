const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const fs = require('fs');
const axios = require('axios');
const { Console } = require('console');

const SWAGGERHUB_API_KEY = process.env.SWAGGERHUB_API_KEY;
const PACTFLOW_TOKEN = process.env.PACTFLOW_TOKEN;

const PACTFLOW_URL = 'https://Monahan-Tutorials.pactflow.io';

const OWNER = process.env.OWNER;
const API = process.env.API;

const PROVIDER_NAME = process.env.PROVIDER_NAME;
const PROVIDER_VERSION = process.env.PROVIDER_VERSION;
const BRANCH = 'main';

const swaggerUrl = `https://api.swaggerhub.com/apis/${OWNER}/${API}/${PROVIDER_VERSION}?resolved=true;flatten=true`;

// DEBUG
console.log(`SWAGGERHUB_API_KEY: ${SWAGGERHUB_API_KEY}`);
console.log(`PACTFLOW_TOKEN: ${PACTFLOW_TOKEN}`);
console.log(`PACTFLOW_URL: ${PACTFLOW_URL}`);
console.log(`OWNER: ${OWNER}`);
console.log(`API: ${API}`);
console.log(`PROVIDER_NAME: ${PROVIDER_NAME}`);
console.log(`PROVIDER_VERSION: ${PROVIDER_VERSION}`);
console.log(`BRANCH: ${BRANCH}`);


console.log(`📥 Downloading OpenAPI spec from SwaggerHub: ${swaggerUrl}`);

axios.get(swaggerUrl, {
  headers: {
    Authorization: `Bearer ${SWAGGERHUB_API_KEY}`,
  },
})
  .then(response => {
    const openapiSpecPath = path.resolve(__dirname, './openapi.json');
    fs.writeFileSync(openapiSpecPath, JSON.stringify(response.data, null, 2));
    console.log(`✅ OpenAPI spec saved to ${openapiSpecPath}`);
    publishToPactflow(openapiSpecPath);
  })
  .catch(error => {
    console.error('🚨 Error downloading from SwaggerHub:', error.response?.data || error.message);
  });

async function publishToPactflow(openapiSpecPath) {
  const contractRaw = fs.readFileSync(openapiSpecPath, 'utf8');
  const base64EncodedContract = Buffer.from(contractRaw).toString('base64');

  // Dummy success flag and verification report (replace with real data when available)
  const SUCCESS = true;  // Assuming the verification was successful
  const dummyReport = "Dummy verification report"; // Replace with actual report
  const base64EncodedReport = Buffer.from(dummyReport).toString('base64');

  const contractBody = {
    pacticipantVersionNumber: PROVIDER_VERSION,
    branch: BRANCH,
    tags: ['latest'],
    buildUrl: 'https://example.com/build/1234',

    contractType: 'oas', // ✅ ADD THIS

    contract: {
      content: base64EncodedContract,
      contentType: 'application/json',
      specification: 'oas', // still keep this
    },

    // Add verification results here
    verificationResults: {
      success: true,
      content: base64EncodedReport,
      contentType: 'text/plain',
      verifier: 'verifier',
    }
  };

  console.log('🚀 Uploading OpenAPI spec to PactFlow with verification results...');

  try {
    const res = await axios.post(
      `${PACTFLOW_URL}/provider-contracts/provider/${PROVIDER_NAME}/publish`,
      contractBody,
      {
        headers: {
          'Authorization': `Bearer ${PACTFLOW_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );
    console.log('✅ OpenAPI spec and verification results successfully published to PactFlow!');
    console.log(`📄 Response status: ${res.status}`);

  } catch (error) {
    if (error.response) {
      console.error('🚨 PactFlow error:', {
        status: error.response.status,
        data: error.response.data,
        errors: error.response.data?.errors || 'No detailed errors'
      });
    } else {
      console.error('🚨 Failed to publish to PactFlow:', error.message);
    }
  }
}


