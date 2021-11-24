const fs = require("fs");
const path = require("path");

// Finds imports inside a solidity file when using sol compiler
function findSolImports(p) {
  if (p[0] === ".") {
    return {
      contents: fs.readFileSync(path.join(directoryPath, p)).toString(),
    };
  }

  return {
    contents: fs
      .readFileSync(path.join(__dirname, "../", "../", "node_modules", p))
      .toString(),
  };
}

module.exports = findSolImports;
