"use strict";
/* eslint-disable no-unused-vars */

const {
  group,
  indent,
  join,
  line,
  softline
} = require("prettier").doc.builders;
const { rejectAndConcat, rejectAndJoin } = require("./printer-utils");

class ArraysPrettierVisitor {
  arrayInitializer(ctx) {
    const optionalVariableInitializerList = this.visit(
      ctx.variableInitializerList
    );
    const optionalComma = ctx.Comma ? "," : "";

    const separator = ctx.variableInitializerList || ctx.Comma ? line : "";

    return group(
      rejectAndConcat([
        "{",
        indent(
          rejectAndConcat([optionalVariableInitializerList, optionalComma])
        ),
        separator,
        "}"
      ])
    );
  }

  variableInitializerList(ctx) {
    const variableInitializers = this.mapVisit(ctx.variableInitializer);

    return rejectAndConcat([
      line,
      rejectAndJoin(rejectAndConcat([",", line]), variableInitializers)
    ]);
  }
}

module.exports = {
  ArraysPrettierVisitor
};
