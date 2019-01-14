"use strict";
/* eslint-disable no-unused-vars */

const { buildFqn } = require("./printer-utils");

class NamesPrettierVisitor {
  typeIdentifier(ctx) {
    return ctx.Identifier[0].image;
  }

  moduleName(ctx) {
    return "moduleName";
  }

  packageName(ctx) {
    return "packageName";
  }

  typeName(ctx) {
    return buildFqn(ctx.Identifier);
  }

  expressionName(ctx) {
    return "expressionName";
  }

  methodName(ctx) {
    return "methodName";
  }

  packageOrTypeName(ctx) {
    return "packageOrTypeName";
  }

  ambiguousName(ctx) {
    return "ambiguousName";
  }
}

module.exports = {
  NamesPrettierVisitor
};
