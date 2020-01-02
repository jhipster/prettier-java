"use strict";
const { line } = require("prettier").doc.builders;
const { ifBreak } = require("./prettier-builder");
const {
  rejectAndConcat,
  rejectAndJoinSeps,
  putIntoBraces
} = require("./printer-utils");

class ArraysPrettierVisitor {
  arrayInitializer(ctx) {
    const optionalVariableInitializerList = this.visit(
      ctx.variableInitializerList
    );

    let optionalComma;
    if (this.prettierOptions.trailingComma !== "none") {
      optionalComma = ctx.Comma
        ? ifBreak(ctx.Comma[0], { ...ctx.Comma[0], image: "" })
        : ifBreak(",", "");
    } else {
      optionalComma = ctx.Comma ? { ...ctx.Comma[0], image: "" } : "";
    }

    return putIntoBraces(
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
