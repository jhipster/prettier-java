"use strict";
const { line } = require("prettier").doc.builders;
const {
  rejectAndConcat,
  rejectAndJoinSeps,
  printArrayList
} = require("./printer-utils");

class ArraysPrettierVisitor {
  arrayInitializer(ctx) {
    const optionalVariableInitializerList = this.visit(
      ctx.variableInitializerList
    );

    return printArrayList({
      list: optionalVariableInitializerList,
      extraComma: ctx.Comma,
      LCurly: ctx.LCurly[0],
      RCurly: ctx.RCurly[0],
      trailingComma: this.prettierOptions.trailingComma
    });
  }

  variableInitializerList(ctx) {
    const variableInitializers = this.mapVisit(ctx.variableInitializer);
    const commas = ctx.Comma
      ? ctx.Comma.map(comma => {
          return rejectAndConcat([comma, line]);
        })
      : [];

    return rejectAndJoinSeps(commas, variableInitializers);
  }
}

module.exports = {
  ArraysPrettierVisitor
};
