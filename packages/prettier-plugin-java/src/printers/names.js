"use strict";

const { buildFqn } = require("./printer-utils");
const { printTokenWithComments } = require("./comments/format-comments");

class NamesPrettierVisitor {
  typeIdentifier(ctx) {
    return printTokenWithComments(ctx.Identifier[0]);
  }

  moduleName(ctx) {
    return buildFqn(ctx.Identifier, ctx.Dot);
  }

  packageName(ctx) {
    return buildFqn(ctx.Identifier, ctx.Dot);
  }

  typeName(ctx) {
    return buildFqn(ctx.Identifier, ctx.Dot);
  }

  expressionName(ctx) {
    return buildFqn(ctx.Identifier, ctx.Dot);
  }

  methodName(ctx) {
    return printTokenWithComments(ctx.Identifier[0]);
  }

  packageOrTypeName(ctx) {
    return buildFqn(ctx.Identifier, ctx.Dot);
  }

  ambiguousName(ctx) {
    return buildFqn(ctx.Identifier, ctx.Dot);
  }
}

module.exports = {
  NamesPrettierVisitor
};
