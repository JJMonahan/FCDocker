const { Pact, MatchersV3 } = require("@pact-foundation/pact");
const axios = require("axios");

const { like, eachLike } = MatchersV3;

describe("Pact V4 Test - Get a List of Companies", () => {
  const provider = new Pact({
    consumer: "Website",
    provider: "Full-Contact-Django-extract",
    logLevel: "info",
    pactfileWriteMode: "merge",
    dir: "./pacts",
    spec: 4,
  });

  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());

  test("should return a list of companies", async () => {
    // ✅ Define pagination flags here
    const hasNext = false;
    const hasPrevious = false;

    await provider.addInteraction({
      state: "There are multiple companies",
      uponReceiving: "A request for all companies",
      withRequest: {
        method: "GET",
        path: "/api/companies",
      },
      willRespondWith: {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          count: like(1),
          results: eachLike({
            id: like(123),
            name: like("Example Corp"),
            address: like("456 Example St"),
            url: like("https://example.com"),
            category: like("1"),
            created: like("2024-03-17T12:00:00Z"),
            description: like("A sample company"),
            mapurl: like("https://maps.example.com/examplecorp"),
            priority: like("0"),
            realm: like("0"),
            size: like("0"),
            updated: like("2024-03-17T12:30:00Z")
          }, 1)
        }
      },
    });

    const mockUrl = provider.mockService.baseUrl;
    const response = await axios.get(`${mockUrl}/api/companies`);

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("results");
    expect(Array.isArray(response.data.results)).toBe(true);
    expect(response.data.results.length).toBeGreaterThan(0);
    expect(response.data.results[0]).toHaveProperty("id");
    expect(response.data.results[0]).toHaveProperty("name");

    await provider.verify();
  });
});
