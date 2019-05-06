"use strict";
/* eslint-disable no-unused-vars */
const { getImageWithComments } = require("./prettier-builder");
class LexicalStructurePrettierVisitor {
  literal(ctx) {
    if (ctx.CharLiteral || ctx.StringLiteral || ctx.Null) {
      return getImageWithComments(this.getSingle(ctx));
    }
    return this.visitSingle(ctx);
  }

  integerLiteral(ctx) {
    return getImageWithComments(this.getSingle(ctx));
  }

  floatingPointLiteral(ctx) {
    return getImageWithComments(this.getSingle(ctx));
  }

  booleanLiteral(ctx) {
    return getImageWithComments(this.getSingle(ctx));
  }
}

module.exports = {
  LexicalStructurePrettierVisitor
};
