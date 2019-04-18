"use strict";
/* eslint-disable no-unused-vars */

const { buildFqn, getImageWithComments } = require("./printer-utils");

class NamesPrettierVisitor {
  typeIdentifier(ctx) {
    return getImageWithComments(ctx.Identifier[0]);
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
    return getImageWithComments(ctx.Identifier[0]);
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
