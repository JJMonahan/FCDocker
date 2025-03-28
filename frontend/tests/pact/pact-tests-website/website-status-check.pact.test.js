// tests/pact/website-status-check.pact.test.js

const path = require('path');
const axios = require('axios');
const { Pact, MatchersV3 } = require('@pact-foundation/pact');
const { like } = MatchersV3;

describe('Website - GET /api/website/', () => {
  let provider;

  beforeAll(() => {
    provider = new Pact({
      consumer: 'Website',
      provider: 'Full-Contact-Django-extract',
      logLevel: 'info',
      dir: "./pacts",
      spec: 4,
      pactfileWriteMode: 'merge',
    });
    return provider.setup();
  });

  afterAll(async () => {
    await provider.verify();
    await provider.finalize();
    console.log("✅ Pact written to:", path.join(provider.opts.dir, `${provider.opts.consumer}-${provider.opts.provider}.json`));
  });

  test('should return 200 with website status', async () => {
    await provider.addInteraction({
      state: 'data exists',
      uponReceiving: 'GET request to /api/website/',
      withRequest: {
        method: 'GET',
        path: '/api/website/',
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { status: like("Running") },
      },
    });

    const mockUrl = provider.mockService.baseUrl;
    const response = await axios.get(`${mockUrl}/api/website/`);

    expect(response.status).toBe(200);
    expect(response.data.status).toBe("Running");
  });
});
