const { expect } = require("chai");
const request = require("supertest");
const { app } = require("../../src/api");
const { User } = require("../../src/models");
const faker = require("faker");
const hashPassword = require("../../src/utils/hash-password");
const comparePassword = require("../../src/utils/compare-password");
const decodeJWT = require("../../src/utils/decode-jwt");

describe("/login", () => {
  test("should return status 400 when email or password is not provided", async () => {
    await Promise.all(
      [
        { email: `${faker.random.word()}@${faker.random.word()}.com` },
        { password: faker.internet.password() },
      ].map(async (data) => {
        const response = await request(app).post("/login").send(data);
        expect(response.statusCode).to.equal(400);
      })
    );
  });

  test("should throw 404 if user is not found", async () => {
    const email = `${faker.random.word()}@${faker.random.word()}.com`;
    const password = faker.internet.password();

    const response = await request(app).post("/login").send({
      email,
      password,
    });
    expect(response.statusCode).to.equal(404);
  });

  test("should throw 401 if incorrect password", async () => {
    const email = `${faker.random.word()}@${faker.random.word()}.com`;
    const password = faker.internet.password();

    const hashed = await hashPassword(password);

    await User.create({ input: [{ email, password: hashed }] });

    const response = await request(app).post("/login").send({
      email,
      password: "invalid password",
    });
    expect(response.statusCode).to.equal(401);
  });

  test("should login and return jwt", async () => {
    const email = `${faker.random.word()}@${faker.random.word()}.com`;
    const password = faker.internet.password();
    const hashed = await hashPassword(password);

    const { users } = await User.create({
      input: [{ email, password: hashed }],
    });
    const [user] = users;

    const response = await request(app).post("/login").send({
      email,
      password,
    });
    expect(response.statusCode).to.equal(200);

    expect(await comparePassword(password, user.password)).to.equal(true);

    const decoded = await decodeJWT(response.body.jwt);

    expect(decoded.sub).to.equal(user.id);
  });
});
