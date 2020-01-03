"use strict";
const { printTokenWithComments } = require("./comments/format-comments");

class LexicalStructurePrettierVisitor {
  literal(ctx) {
    if (ctx.CharLiteral || ctx.StringLiteral || ctx.Null) {
      return printTokenWithComments(this.getSingle(ctx));
    }
    return this.visitSingle(ctx);
  }

  integerLiteral(ctx) {
    return printTokenWithComments(this.getSingle(ctx));
  }

  floatingPointLiteral(ctx) {
    return printTokenWithComments(this.getSingle(ctx));
  }

  booleanLiteral(ctx) {
    return printTokenWithComments(this.getSingle(ctx));
  }
}

module.exports = {
  LexicalStructurePrettierVisitor
};
