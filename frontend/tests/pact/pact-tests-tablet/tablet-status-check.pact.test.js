const path = require('path');
const axios = require('axios');
const { Pact, MatchersV3 } = require('@pact-foundation/pact');
const { like } = MatchersV3;

describe('Tablet - GET /api/tablet/', () => {
  let provider;

  beforeAll(() => {
    provider = new Pact({
      consumer: 'Tablet',
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

  test('should return 200 with tablet status', async () => {
    await provider.addInteraction({
      state: 'data exists',
      uponReceiving: 'GET request to /api/tablet/',
      withRequest: {
        method: 'GET',
        path: '/api/tablet/',
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { status: like("Running") },
      },
    });

    const mockUrl = provider.mockService.baseUrl;
    const response = await axios.get(`${mockUrl}/api/tablet/`);

    expect(response.status).toBe(200);
    expect(response.data.status).toBe("Running");
  });
});
