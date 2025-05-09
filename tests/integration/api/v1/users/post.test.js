import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import user from "models/user.js";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "nilsonsoares",
          email: "teste@teste.com",
          password: "senha123",
        }),
      });
      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "nilsonsoares",
        email: "teste@teste.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDataDase = await user.findOneByUsername("nilsonsoares");
      const correctPasswordMatch = await password.compare(
        "senha123",
        userInDataDase.password,
      );
      expect(correctPasswordMatch).toBe(true);

      const incorrectPasswordMatch = await password.compare(
        "senha1234",
        userInDataDase.password,
      );
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("With duplicated email", async () => {
      const firstResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado1",
          email: "duplicado@teste.com",
          password: "senha123",
        }),
      });
      expect(firstResponse.status).toBe(201);
      const secondResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado2",
          email: "Duplicado@teste.com",
          password: "senha123",
        }),
      });
      expect(secondResponse.status).toBe(400);
      const secondResponseBody = await secondResponse.json();
      expect(secondResponseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });
    test("With duplicated username", async () => {
      const firstResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usernameduplicado",
          email: "usernameduplicado1@teste.com",
          password: "senha123",
        }),
      });
      expect(firstResponse.status).toBe(201);
      const secondResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usernameduplicado",
          email: "Usernameduplicado2@teste.com",
          password: "senha123",
        }),
      });
      expect(secondResponse.status).toBe(400);
      const secondResponseBody = await secondResponse.json();
      expect(secondResponseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize um outro username para realizar esta operação.",
        status_code: 400,
      });
    });
  });
});
