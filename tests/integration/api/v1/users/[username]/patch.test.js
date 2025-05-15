import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import user from "models/user.js";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsuarionInexistente",
        {
          method: "PATCH",
        },
      );
      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      });
    });

    test("With duplicated 'username'", async () => {
      await orchestrator.createUser({
        username: "usuario1",
      });
      await orchestrator.createUser({
        username: "usuario2",
      });
      const updateUserResponse = await fetch(
        "http://localhost:3000/api/v1/users/usuario2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "usuario1",
          }),
        },
      );
      expect(updateUserResponse.status).toEqual(400);
      const updateUserResponseBody = await updateUserResponse.json();
      expect(updateUserResponseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize um outro username para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      await orchestrator.createUser({
        email: "email1@teste.com",
      });
      const secondUserCreated = await orchestrator.createUser({
        email: "email2@teste.com",
      });
      const updateUserResponse = await fetch(
        `http://localhost:3000/api/v1/users/${secondUserCreated.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "email1@teste.com",
          }),
        },
      );
      expect(updateUserResponse.status).toEqual(400);
      const updateUserResponseBody = await updateUserResponse.json();
      expect(updateUserResponseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      const createdUser = await orchestrator.createUser({
        username: "uniqueUser1",
      });
      const updateUserResponse = await fetch(
        "http://localhost:3000/api/v1/users/uniqueUser1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );
      expect(updateUserResponse.status).toEqual(200);
      const updateUserResponseBody = await updateUserResponse.json();
      expect(updateUserResponseBody).toEqual({
        id: updateUserResponseBody.id,
        username: "uniqueUser2",
        email: createdUser.email,
        password: updateUserResponseBody.password,
        created_at: updateUserResponseBody.created_at,
        updated_at: updateUserResponseBody.updated_at,
      });
      expect(uuidVersion(updateUserResponseBody.id)).toBe(4);
      expect(Date.parse(updateUserResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(updateUserResponseBody.updated_at)).not.toBeNaN();
      expect(
        updateUserResponseBody.updated_at > updateUserResponseBody.created_at,
      ).toBe(true);
    });

    test("With unique 'email'", async () => {
      const createdUser = await orchestrator.createUser({
        email: "uniqueEmail1@teste.com",
      });
      const updateUserResponse = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueEmail2@teste.com",
          }),
        },
      );
      expect(updateUserResponse.status).toEqual(200);
      const updateUserResponseBody = await updateUserResponse.json();
      expect(updateUserResponseBody).toEqual({
        id: updateUserResponseBody.id,
        username: createdUser.username,
        email: "uniqueEmail2@teste.com",
        password: updateUserResponseBody.password,
        created_at: updateUserResponseBody.created_at,
        updated_at: updateUserResponseBody.updated_at,
      });
      expect(uuidVersion(updateUserResponseBody.id)).toEqual(4);
      expect(
        updateUserResponseBody.updated_at > updateUserResponseBody.created_at,
      ).toBe(true);
    });

    test("With new 'password'", async () => {
      const createdUser = await orchestrator.createUser({
        password: "newPassword1",
      });
      const updateUserResponse = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "newPassword2",
          }),
        },
      );
      expect(updateUserResponse.status).toEqual(200);
      const updateUserResponseBody = await updateUserResponse.json();
      expect(updateUserResponseBody).toEqual({
        id: updateUserResponseBody.id,
        username: createdUser.username,
        email: createdUser.email,
        password: updateUserResponseBody.password,
        created_at: updateUserResponseBody.created_at,
        updated_at: updateUserResponseBody.updated_at,
      });
      expect(uuidVersion(updateUserResponseBody.id)).toEqual(4);
      expect(
        updateUserResponseBody.updated_at > updateUserResponseBody.created_at,
      ).toBe(true);

      const userInDatabase = await user.findOneByUsername(createdUser.username);
      const correctPasswordMatch = await password.compare(
        "newPassword2",
        userInDatabase.password,
      );
      expect(correctPasswordMatch).toBe(true);
      const incorrectPasswordMatch = await password.compare(
        "newPassword1",
        userInDatabase.password,
      );
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
