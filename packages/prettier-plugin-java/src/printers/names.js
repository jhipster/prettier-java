"use strict";
/* eslint-disable no-unused-vars */

const { buildFqn } = require("./printer-utils");
const { getImageWithComments } = require("./prettier-builder");

class NamesPrettierVisitor {
  typeIdentifier(ctx) {
    return getImageWithComments(ctx.Identifier[0]);
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
    return getImageWithComments(ctx.Identifier[0]);
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
