const { expect } = require("chai");
const request = require("supertest");
const { app } = require("../../src/api");
const { User } = require("../../src/models");
const createJWT = require("../../src/utils/create-jwt");
const faker = require("faker");

describe("/me", () => {
  describe("authenticateRequest", () => {
    test("throw 401 if no header", async () => {
      const response = await request(app).get("/me");

      expect(response.statusCode).to.equal(401);
    });

    test("throw 401 if no header token", async () => {
      const response = await request(app)
        .get("/me")
        .set({ authorization: "Invalid djkldjlkdj" });

      expect(response.statusCode).to.equal(401);
    });

    test("throw 403 if no user found", async () => {
      const token = await createJWT({ sub: "ahjkdhjkdhjkd" });

      const response = await request(app)
        .get("/me")
        .set({ authorization: `Bearer ${token}` });

      expect(response.statusCode).to.equal(403);
    });
  });

  test("should return user", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();

    const { users } = await User.create({ input: [{ email, password }] });
    const user = users[0];

    const token = await createJWT({ sub: user.id });

    const response = await request(app)
      .get("/me")
      .set({ authorization: `Bearer ${token}` });

    expect(response.statusCode).to.equal(200);
    expect(response.body.id).to.equal(user.id);
  });
});
