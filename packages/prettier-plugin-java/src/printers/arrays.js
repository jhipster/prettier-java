"use strict";
/* eslint-disable no-unused-vars */

const { join } = require("prettier").doc.builders;
const { rejectAndConcat } = require("./printer-utils");

class ArraysPrettierVisitor {
  arrayInitializer(ctx) {
    const optionalVariableInitializerList = this.visit(
      ctx.variableInitializerList
    );
    const optionalComma = ctx.Comma ? ", " : "";
    return rejectAndConcat([
      "{",
      optionalVariableInitializerList,
      optionalComma,
      "}"
    ]);
  }

  variableInitializerList(ctx) {
    const variableInitializers = this.mapVisit(ctx.variableInitializer);
    return join(", ", variableInitializers);
  }
}

module.exports = {
  ArraysPrettierVisitor
};
