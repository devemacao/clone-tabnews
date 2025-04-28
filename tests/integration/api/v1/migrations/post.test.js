import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("Running pending migrations", () => {
      test("For the first time", async () => {
        const firstPostResponse = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );
        expect(firstPostResponse.status).toBe(201);
        const firstPostResponseBody = await firstPostResponse.json();
        expect(Array.isArray(firstPostResponseBody)).toBe(true);
        expect(firstPostResponseBody.length).toBeGreaterThan(0);
      });
      test("For the second time", async () => {
        const secondPostResponse = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );
        expect(secondPostResponse.status).toBe(200);
        const secondPostResponseBody = await secondPostResponse.json();
        expect(Array.isArray(secondPostResponseBody)).toBe(true);
        expect(secondPostResponseBody.length).toBe(0);
      });
    });
  });
});
