const path = require('path');
const { execSync } = require('child_process');
const { Verifier } = require('@pact-foundation/pact');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const {
  PACTFLOW_URL,
  PACTFLOW_TOKEN,
  PROVIDER_NAME,
  PROVIDER_VERSION,
  PROVIDER_BASE_URL,
  PACT_ENVIRONMENT
} = process.env;

// Print env vars
console.log('\n🔧 Loaded Environment Variables:');
console.log(`PACTFLOW_URL: ${PACTFLOW_URL}`);
console.log(`PROVIDER_NAME: ${PROVIDER_NAME}`);
console.log(`PROVIDER_VERSION: ${PROVIDER_VERSION}`);
console.log(`PROVIDER_BASE_URL: ${PROVIDER_BASE_URL}`);
console.log(`PACT_ENVIRONMENT: ${PACT_ENVIRONMENT}\n`);

// Fail fast if anything critical is missing
if (!PACTFLOW_URL || !PACTFLOW_TOKEN || !PROVIDER_NAME || !PROVIDER_VERSION || !PROVIDER_BASE_URL || !PACT_ENVIRONMENT) {
  console.error('❌ One or more required environment variables are missing. Check your .env file.');
  process.exit(1);
}

// Run verifier and can-i-deploy
(async () => {
  try {
    console.log('🔍 Verifying provider against PactFlow...');

    const verifier = new Verifier({
      provider: PROVIDER_NAME,
      providerBaseUrl: PROVIDER_BASE_URL,
      pactBrokerUrl: PACTFLOW_URL,
      pactBrokerToken: PACTFLOW_TOKEN,
      publishVerificationResult: true,
      providerVersion: PROVIDER_VERSION,
      consumerVersionSelectors: [{ latest: true }]
    });

    await verifier.verifyProvider();
    console.log('\n✅ Pact verification successful and results published.');

    console.log('\n🔍 Running can-i-deploy check...');
    const command = `pact-broker can-i-deploy ` +
                    `--pacticipant ${PROVIDER_NAME} ` +
                    `--version ${PROVIDER_VERSION} ` +
                    `--to-environment ${PACT_ENVIRONMENT} ` +
                    `--broker-base-url ${PACTFLOW_URL} ` +
                    `--broker-token ${PACTFLOW_TOKEN}`;

    execSync(command, { stdio: 'inherit' });
    console.log(`\n🚀 Can deploy ${PROVIDER_NAME}@${PROVIDER_VERSION} to ${PACT_ENVIRONMENT}`);
  } catch (err) {
    console.error('\n❌ Error during provider verification or can-i-deploy check:');
    console.error(err.message || err);
    process.exit(1);
  }
})();
