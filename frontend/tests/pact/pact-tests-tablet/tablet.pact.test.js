const path = require('path');
const axios = require('axios');
const { Pact, MatchersV3 } = require('@pact-foundation/pact');
const { like } = MatchersV3;

// Setup Pact mock provider
const provider = new Pact({
  consumer: 'Tablet',
  provider: 'Full-Contact-Django-extract',
  logLevel: 'info',
  dir: path.resolve(__dirname, '../../pacts'),
  spec: 4,
  pactfileWriteMode: 'merge',
});

const companyBody = {
  name: like("Acme Inc"),
  address: like("123 Example St"),
  description: like("Example company"),
  url: like("https://acme.com"),
  mapurl: like("https://maps.example.com/acme"),
  category: like("1"),
  realm: like("2"),
  size: like("3"),
  priority: like("1"),
  id: like(1),
  created: like("2024-01-01T00:00:00Z"),
  updated: like("2024-01-01T12:00:00Z"),
};

describe('Minimal Pact Test - POST /api/companies/', () => {
  beforeAll(() => provider.setup());
  afterAll(async () => {
    console.log("👋 Finalizing Pact and writing file...");
    await provider.finalize();
    console.log("✅ Pact written to:", path.join(provider.opts.dir, `${provider.opts.consumer}-${provider.opts.provider}.json`));
  });

  test('POST /api/companies/ should return 201 with created company', async () => {
    await provider.addInteraction({
      state: 'data exists',
      uponReceiving: 'POST request to /api/companies/',
      withRequest: {
        method: 'post',
        path: '/api/companies/',
        body: companyBody,
        headers: { 'Content-Type': 'application/json' },
      },
      willRespondWith: {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
        body: companyBody,
      },
    });

    const mockUrl = provider.mockService.baseUrl;
    const response = await axios.post(`${mockUrl}/api/companies/`, {
      name: "Acme Inc",
      address: "123 Example St",
      description: "Example company",
      url: "https://acme.com",
      mapurl: "https://maps.example.com/acme",
      category: "1",
      realm: "2",
      size: "3",
      priority: "1",
      id: 1,
      created: "2024-01-01T00:00:00Z",
      updated: "2024-01-01T12:00:00Z",
    });

    expect(response.status).toBe(201);
    await provider.verify();
  });
});
