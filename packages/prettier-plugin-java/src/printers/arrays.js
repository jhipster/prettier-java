"use strict";
/* eslint-disable no-unused-vars */

const {
  group,
  indent,
  join,
  line,
  softline
} = require("prettier").doc.builders;
const {
  rejectAndConcat,
  rejectAndJoin,
  getImageWithComments,
  rejectAndJoinSepToken
} = require("./printer-utils");

class ArraysPrettierVisitor {
  arrayInitializer(ctx) {
    const optionalVariableInitializerList = this.visit(
      ctx.variableInitializerList
    );
    const optionalComma = ctx.Comma ? getImageWithComments(ctx.Comma[0]) : "";

    const separator = ctx.variableInitializerList || ctx.Comma ? line : "";

    return group(
      rejectAndConcat([
        getImageWithComments(ctx.LCurly[0]),
        indent(
          rejectAndConcat([optionalVariableInitializerList, optionalComma])
        ),
        separator,
        getImageWithComments(ctx.RCurly[0])
      ])
    );
  }

  variableInitializerList(ctx) {
    const variableInitializers = this.mapVisit(ctx.variableInitializer);

    return rejectAndConcat([
      line,
      rejectAndJoinSepToken(ctx.Comma, variableInitializers, line)
    ]);
  }
}

module.exports = {
  ArraysPrettierVisitor
};
