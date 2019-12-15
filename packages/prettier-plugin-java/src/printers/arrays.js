"use strict";
const { line } = require("prettier").doc.builders;
const {
  rejectAndConcat,
  rejectAndJoinSeps,
  putIntoCurlyBraces
} = require("./printer-utils");

class ArraysPrettierVisitor {
  arrayInitializer(ctx) {
    const optionalVariableInitializerList = this.visit(
      ctx.variableInitializerList
    );
    const optionalComma = ctx.Comma ? ctx.Comma[0] : "";

    return putIntoCurlyBraces(
      rejectAndConcat([optionalVariableInitializerList, optionalComma]),
      line,
      ctx.LCurly[0],
      ctx.RCurly[0]
    );
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
