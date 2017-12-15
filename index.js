const fromDelta = require("./src/fromDelta");

module.exports = toMdAST;

function toMdAST() {
  this.Parser = function(file) {
    return fromDelta({})(JSON.parse(file));
  };
}
