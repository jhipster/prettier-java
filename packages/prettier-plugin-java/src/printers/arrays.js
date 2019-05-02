"use strict";
/* eslint-disable no-unused-vars */

const { line } = require("prettier").doc.builders;
const { group, indent } = require("./prettier-builder");
const { rejectAndConcat, rejectAndJoinSeps } = require("./printer-utils");

class ArraysPrettierVisitor {
  arrayInitializer(ctx) {
    const optionalVariableInitializerList = this.visit(
      ctx.variableInitializerList
    );
    const optionalComma = ctx.Comma ? ctx.Comma[0] : "";

    const separator = ctx.variableInitializerList || ctx.Comma ? line : "";

    return group(
      rejectAndConcat([
        ctx.LCurly[0],
        indent(
          rejectAndConcat([optionalVariableInitializerList, optionalComma])
        ),
        separator,
        ctx.RCurly[0]
      ])
    );
  }

  variableInitializerList(ctx) {
    const variableInitializers = this.mapVisit(ctx.variableInitializer);
    const commas = ctx.Comma
      ? ctx.Comma.map(comma => {
          return rejectAndConcat([comma, line]);
        })
      : [];

    return rejectAndConcat([
      line,
      rejectAndJoinSeps(commas, variableInitializers)
    ]);
  }
}

module.exports = {
  ArraysPrettierVisitor
};
