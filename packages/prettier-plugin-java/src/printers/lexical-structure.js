"use strict";
/* eslint-disable no-unused-vars */

class LexicalStructurePrettierVisitor {
  literal(ctx) {
    if (ctx.CharLiteral || ctx.StringLiteral || ctx.Null) {
      return this.getSingle(ctx).image;
    }
    return this.visitSingle(ctx);
  }

  integerLiteral(ctx) {
    return this.getSingle(ctx).image;
  }

  floatingPointLiteral(ctx) {
    return this.getSingle(ctx).image;
  }

  booleanLiteral(ctx) {
    return this.getSingle(ctx).image;
  }
}

module.exports = {
  LexicalStructurePrettierVisitor
};
