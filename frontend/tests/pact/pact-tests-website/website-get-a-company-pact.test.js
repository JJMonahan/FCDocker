const { Pact, MatchersV3 } = require("@pact-foundation/pact");
const axios = require("axios");

const { like } = MatchersV3;

describe("Pact V4 Test - Get a Single Company", () => {
  const provider = new Pact({
    consumer: "Website",
    provider: "Full-Contact-Django-extract",
    logLevel: "info",
    pactfileWriteMode: "merge",
    dir: "./pacts",
    spec: 4, // ✅ tells Pact to use v4 spec
  });

  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());

  test("should return company details for a given ID", async () => {
    await provider.addInteraction({
      state: "Company with ID 1 exists",
      uponReceiving: "A request for company 1",
      withRequest: {
        method: "GET",
        path: "/api/companies/1",
      },
      willRespondWith: {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
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
          updated: like("2024-03-17T12:30:00Z"),
        },
      },
    });

    const mockUrl = provider.mockService.baseUrl;
    const response = await axios.get(`${mockUrl}/api/companies/1`);

    expect(response.status).toBe(200);
    expect(response.data).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        address: expect.any(String),
        url: expect.any(String),
        category: expect.any(String),
        created: expect.any(String),
        description: expect.any(String),
        mapurl: expect.any(String),
        priority: expect.any(String),
        realm: expect.any(String),
        size: expect.any(String),
        updated: expect.any(String),
      })
    );

    await provider.verify();
  });
});
