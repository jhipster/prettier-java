"use strict";
/* eslint-disable no-unused-vars */

class LexicalStructurePrettierVisitor {
  literal(ctx) {
    return "literal";
  }

  integerLiteral(ctx) {
    return "integerLiteral";
  }

  floatingPointLiteral(ctx) {
    return "floatingPointLiteral";
  }

  booleanLiteral(ctx) {
    return "booleanLiteral";
  }
}

module.exports = {
  LexicalStructurePrettierVisitor
};
