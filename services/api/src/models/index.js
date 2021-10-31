const { OGM } = require("@neo4j/graphql-ogm");
const { driver } = require("../neo4j");

const typeDefs = `
    type User {
        id: ID @id(autogenerate: true)
        email: String!
        password: String!
        createdAt: DateTime @timestamp
    }
`;

const ogm = new OGM({
  typeDefs,
  driver,
});

const User = ogm.model("User");

module.exports = {
  User,
};
