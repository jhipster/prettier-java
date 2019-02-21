"use strict";
/* eslint-disable no-unused-vars */

const { buildFqn } = require("./printer-utils");

class NamesPrettierVisitor {
  typeIdentifier(ctx) {
    return ctx.Identifier[0].image;
  }

  moduleName(ctx) {
    return buildFqn(ctx.Identifier);
  }

  packageName(ctx) {
    return buildFqn(ctx.Identifier);
  }

  typeName(ctx) {
    return buildFqn(ctx.Identifier);
  }

  expressionName(ctx) {
    return buildFqn(ctx.Identifier);
  }

  methodName(ctx) {
    return ctx.Identifier[0].image;
  }

  packageOrTypeName(ctx) {
    return buildFqn(ctx.Identifier);
  }

  ambiguousName(ctx) {
    return buildFqn(ctx.Identifier);
  }
}

module.exports = {
  NamesPrettierVisitor
};
