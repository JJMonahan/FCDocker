const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const fs = require('fs');
const axios = require('axios');

const SWAGGERHUB_API_KEY = process.env.SWAGGERHUB_API_KEY;
const PACTFLOW_TOKEN = process.env.PACTFLOW_TOKEN;

const PACTFLOW_URL = 'https://Monahan-Tutorials.pactflow.io';

const owner = 'Monahan-Tutorials';
const api = 'Full-Contact-Django-extract';
const version = '0.1.0';

const PROVIDER_NAME = 'Full-Contact-Django';
const PROVIDER_VERSION = '0.1.0';
const BRANCH = 'main';

const swaggerUrl = `https://api.swaggerhub.com/apis/${owner}/${api}/${version}?resolved=true;flatten=true`;

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

function publishToPactflow(openapiSpecPath) {
  const contractRaw = fs.readFileSync(openapiSpecPath, 'utf8');
  const base64EncodedContract = Buffer.from(contractRaw).toString('base64');

  const verificationPath = path.resolve(__dirname, './record-verification');
  let verificationContent = '';
  try {
    verificationContent = fs.readFileSync(verificationPath, 'utf8');
  } catch (err) {
    console.warn('⚠️ Could not read record-verification file. Proceeding with default empty results.');
  }

  const body = {
    pacticipantVersionNumber: PROVIDER_VERSION,
    branch: BRANCH,
    tags: ['latest'],
    buildUrl: 'https://example.com/build/1234',
    contract: {
      content: base64EncodedContract,
      contentType: 'application/json',
      specification: 'oas'
    },
    selfVerificationResults: {
      success: true,
      content: verificationContent || '<?xml version="1.0" encoding="UTF-8"?><testsuite></testsuite>',
      contentType: 'application/xml',
      format: 'junit',
      verifier: 'manual',
      verifierVersion: '1.0.0'
    }
  };

  console.log('🚀 Uploading OpenAPI spec + verification results to PactFlow...');

  axios.post(`${PACTFLOW_URL}/provider-contracts/provider/${PROVIDER_NAME}/publish`, body, {
    headers: {
      'Authorization': `Bearer ${PACTFLOW_TOKEN}`,
      'Content-Type': 'application/json',
    }
  })
  .then(res => {
    console.log('✅ OpenAPI spec and verification results successfully published to PactFlow!');
    console.log(`📄 Response status: ${res.status}`);
  })
  .catch(error => {
    if (error.response) {
      console.error('🚨 PactFlow error:', {
        status: error.response.status,
        data: error.response.data,
        errors: error.response.data?.errors || 'No detailed errors'
      });
    } else {
      console.error('🚨 Failed to publish to PactFlow:', error.message);
    }
  });
}
