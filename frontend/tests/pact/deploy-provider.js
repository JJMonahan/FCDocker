// deploy-to-production.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const axios = require('axios');
const { execSync } = require('child_process');

// 🔧 Configuration
const PACTFLOW_URL = process.env.PACTFLOW_URL;
const PACTFLOW_TOKEN = process.env.PACTFLOW_TOKEN;
const PROVIDER_NAME = process.env.PROVIDER_NAME;
const PROVIDER_VERSION = process.env.PROVIDER_VERSION;
const ENVIRONMENT = 'production';

// 📦 Log configuration values
console.log('🔐 PactFlow Deployment Configuration');
console.log(`PACTFLOW_URL: ${PACTFLOW_URL}`);
console.log(`PACTFLOW_TOKEN: ${PACTFLOW_TOKEN ? '✅ Loaded' : '❌ Not Loaded'}`);
console.log(`PROVIDER_NAME (Pacticipant): ${PROVIDER_NAME}`);
console.log(`PROVIDER_VERSION: ${PROVIDER_VERSION}`);
console.log(`ENVIRONMENT: ${ENVIRONMENT}`);
console.log('--------------------------------------------');

// 🔍 Get the environment UUID
async function getEnvironmentUUID(envName) {
  const url = `${PACTFLOW_URL}/environments`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${PACTFLOW_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const environment = response.data._embedded.environments.find(
      (env) => env.name === envName
    );

    if (!environment) {
      throw new Error(`Environment "${envName}" not found in PactFlow.`);
    }

    return environment.uuid;
  } catch (error) {
    console.error('❌ Failed to fetch environments:', error.response?.data || error.message);
    process.exit(1);
  }
}

// ✅ Run can-i-deploy
function canIDeploy() {
  const cmd = `npx pact-broker can-i-deploy \
    --pacticipant "${PROVIDER_NAME}" \
    --version "${PROVIDER_VERSION}" \
    --to-environment "${ENVIRONMENT}" \
    --broker-base-url "${PACTFLOW_URL}" \
    --broker-token "${PACTFLOW_TOKEN}"`;

  console.log(`🚦 Running can-i-deploy check...`);
  console.log(`Command: ${cmd}`);

  try {
    const result = execSync(cmd, { stdio: 'pipe' }).toString();
    console.log('✅ can-i-deploy passed:\n', result);
    return true;
  } catch (error) {
    console.error('❌ can-i-deploy failed:\n', error.stdout?.toString() || error.message);
    return false;
  }
}

// 🚀 Record the deployment
async function deployAppToProduction() {
  const environmentUUID = await getEnvironmentUUID(ENVIRONMENT);

  const url = `${PACTFLOW_URL}/pacticipants/${PROVIDER_NAME}/versions/${PROVIDER_VERSION}/deployed-versions/environment/${environmentUUID}`;
  
  console.log(`🚀 Recording deployment to: ${url}`);

  try {
    const response = await axios.post(url, {}, {
      headers: {
        Authorization: `Bearer ${PACTFLOW_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`✅ Successfully recorded deployment: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.error('❌ Failed to record deployment:', error.response?.data || error.message);
  }
}

// 🔁 Full flow
(async () => {
  if (canIDeploy()) {
    await deployAppToProduction();
  } else {
    console.error('🚫 Aborting deployment: can-i-deploy failed.');
    process.exit(1);
  }
})();
