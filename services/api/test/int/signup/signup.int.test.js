const request = require("supertest");
const { app } = require("../../../src/server");

describe("/signup", () => {
  test("should create and return a user", async () => {
    const email = "test@test.com";
    const password = "password";

    const response = await request(app).post("/signup").send({
      email,
      password,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.email).toBe(email);
  });
});
