const { expect } = require("chai");
const request = require("supertest");
const { app } = require("../../src/api");
const { User } = require("../../src/models");
const faker = require("faker");
const comparePassword = require("../../src/utils/compare-password");
const decodeJWT = require("../../src/utils/decode-jwt");

describe("/signup", () => {
  test("should return status 400 when email or password is not provided", async () => {
    await Promise.all(
      [
        { email: faker.internet.email() },
        { password: faker.internet.password() },
        {},
      ].map(async (data) => {
        const response = await request(app).post("/signup").send(data);
        expect(response.statusCode).to.equal(400);
      })
    );
  });

  test("should throw User with email already exists", async () => {
    const email = `${faker.random.word()}@${faker.random.word()}.com`;
    const password = faker.internet.password();

    await User.create({ input: [{ email, password }] });

    const response = await request(app)
      .post("/signup")
      .send({ email, password });

    expect(response.statusCode).to.equal(400);
    expect(response.text).to.equal("User with email already exists");
  });

  test("should create and return a user", async () => {
    const email = `${faker.random.word()}@${faker.random.word()}.com`;
    const password = faker.internet.password();

    const response = await request(app).post("/signup").send({
      email,
      password,
    });
    expect(response.statusCode).to.equal(200);

    const [user] = await User.find({ where: { email } });

    expect(await comparePassword(password, user.password)).to.equal(true);

    const decoded = await decodeJWT(response.body.jwt);

    expect(decoded.sub).to.equal(user.id);
  });
});
