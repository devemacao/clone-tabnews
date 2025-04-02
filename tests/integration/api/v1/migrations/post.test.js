import database from "infra/database.js";

beforeAll(cleanDatabase);
async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public");
}

test("POST to /api/v1/migrations should return 200", async () => {
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
