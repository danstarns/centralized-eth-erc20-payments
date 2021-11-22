module.exports = {
  contracts_directory: "./src/contracts",
  contracts_build_directory: "./src/contracts/build/contracts",
  migrations_directory: "./src/contracts/migrations",
  test_directory: "./test/contracts",
  compilers: {
    solc: {
      version: "0.8.0", // A version or constraint - Ex. "^0.5.0"
    },
  },
};
