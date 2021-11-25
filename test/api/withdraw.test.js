const { expect } = require("chai");
const request = require("supertest");
const { app } = require("../../src/api");
const { User } = require("../../src/models");
const { neo4j } = require("../../src/connections");
const createJWT = require("../../src/utils/create-jwt");
const faker = require("faker");
const hashPassword = require("../../src/utils/hash-password");

describe("/withdraw", () => {
  describe("authenticateRequest", () => {
    test("throw 401 if no header", async () => {
      const response = await request(app).post("/withdraw");

      expect(response.statusCode).to.equal(401);
    });

    test("throw 401 if no header token", async () => {
      const response = await request(app)
        .post("/withdraw")
        .set({ authorization: "Invalid djkldjlkdj" });

      expect(response.statusCode).to.equal(401);
    });

    test("throw 403 if no user found", async () => {
      const token = await createJWT({ sub: "ahjkdhjkdhjkd" });

      const response = await request(app)
        .post("/withdraw")
        .set({ authorization: `Bearer ${token}` });

      expect(response.statusCode).to.equal(403);
    });
  });

  test("should throw if req.body is invalid", async () => {
    const email = `${faker.random.word()}@${faker.random.word()}.com`;
    const password = faker.internet.password();
    const hashed = await hashPassword(password);

    const { users } = await User.create({
      input: [{ email, password: hashed }],
    });
    const [user] = users;

    const token = await createJWT({ sub: user.id });

    await Promise.all(
      [{ amount: 100 }, { to: "some-address" }, {}].map(async (data) => {
        const response = await request(app)
          .post("/withdraw")
          .set({ authorization: `Bearer ${token}` })
          .send(data);
        expect(response.statusCode).to.equal(400);
      })
    );
  });

  test("should throw insufficient funds", async () => {
    const email = `${faker.random.word()}@${faker.random.word()}.com`;
    const password = faker.internet.password();
    const hashed = await hashPassword(password);
    const amount = faker.datatype.number();
    const to = faker.finance.ethereumAddress();

    const { users } = await User.create({
      input: [{ email, password: hashed }],
    });
    const [user] = users;

    const token = await createJWT({ sub: user.id });

    const response = await request(app)
      .post("/withdraw")
      .set({ authorization: `Bearer ${token}` })
      .send({ amount, to });
    expect(response.statusCode).to.equal(400);
    expect(response.text).to.equal("insufficient funds");
  });

  test("should create a withdrawal against the user", async () => {
    const email = `${faker.random.word()}@${faker.random.word()}.com`;
    const password = faker.internet.password();
    const hashed = await hashPassword(password);
    const amount = faker.datatype.number();
    const to = faker.finance.ethereumAddress();
    const session = neo4j.driver.session();

    let result;
    let user;

    try {
      // Use session here because we dont need to care about the required transactions! in schema
      result = await session.run(
        `
        CREATE (u:User {id: randomUUID()})
        SET u += $user
        CREATE (u)-[:HAS_DEPOSIT]->(:Deposit {amount: $amount})
        RETURN u {.id} as u
      `,
        {
          user: {
            email,
            password: hashed,
          },
          amount,
        }
      );
    } finally {
      session.close();
    }

    user = result.records[0].toObject().u;

    const token = await createJWT({ sub: user.id });

    const response = await request(app)
      .post("/withdraw")
      .set({ authorization: `Bearer ${token}` })
      .send({ amount, to });
    expect(response.statusCode).to.equal(200);

    [user] = await User.find({
      where: { id: user.id },
      selectionSet: `
        {
          withdrawals {
            amount
          }
        }
      `,
    });

    expect(JSON.stringify(user)).to.equal(
      JSON.stringify({ withdrawals: [{ amount }] })
    );
  });
});
