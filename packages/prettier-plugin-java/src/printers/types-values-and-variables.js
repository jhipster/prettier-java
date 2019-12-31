"use strict";

const _ = require("lodash");

const { concat, join } = require("./prettier-builder");
const { printTokenWithComments } = require("./comments/format-comments");
const {
  rejectAndJoin,
  rejectAndConcat,
  sortClassTypeChildren,
  rejectAndJoinSeps
} = require("./printer-utils");

class TypesValuesAndVariablesPrettierVisitor {
  primitiveType(ctx) {
    const annotations = this.mapVisit(ctx.annotation);
    const type = ctx.numericType
      ? this.visit(ctx.numericType)
      : this.getSingle(ctx);

    return rejectAndJoin(" ", [join(" ", annotations), type]);
  }

  numericType(ctx) {
    return this.visitSingle(ctx);
  }

  integralType(ctx) {
    return printTokenWithComments(this.getSingle(ctx));
  }

  floatingPointType(ctx) {
    return printTokenWithComments(this.getSingle(ctx));
  }

  referenceType(ctx) {
    const annotations = this.mapVisit(ctx.annotation);

    const type = ctx.primitiveType
      ? this.visit(ctx.primitiveType)
      : this.visit(ctx.classOrInterfaceType);

    const dims = this.visit(ctx.dims);

    return rejectAndJoin(" ", [join(" ", annotations), concat([type, dims])]);
  }

  classOrInterfaceType(ctx) {
    return this.visitSingle(ctx);
  }

  classType(ctx) {
    const tokens = sortClassTypeChildren(
      ctx.annotation,
      ctx.typeArguments,
      ctx.Identifier
    );

    const segments = [];
    let currentSegment = [];

    _.forEach(tokens, (token, i) => {
      if (token.name === "typeArguments") {
        currentSegment.push(this.visit([token]));
        segments.push(rejectAndConcat(currentSegment));
        currentSegment = [];
      } else if (token.name === "annotation") {
        currentSegment.push(this.visit([token]));
      } else {
        currentSegment.push(token);
        if (
          (i + 1 < tokens.length && tokens[i + 1].name !== "typeArguments") ||
          i + 1 === tokens.length
        ) {
          segments.push(rejectAndConcat(currentSegment));
          currentSegment = [];
        }
      }
    });

    return rejectAndJoinSeps(ctx.Dot, segments);
  }

  interfaceType(ctx) {
    return this.visitSingle(ctx);
  }

  typeVariable(ctx) {
    const annotations = this.mapVisit(ctx.annotation);
    const identifier = this.getSingle(ctx);

    return rejectAndJoin(" ", [join(" ", annotations), identifier]);
  }

  dims(ctx) {
    let tokens = [...ctx.LSquare];

    if (ctx.annotation) {
      tokens = [...tokens, ...ctx.annotation];
    }

    tokens = tokens.sort((a, b) => {
      const startOffset1 = a.name
        ? a.children.At[0].startOffset
        : a.startOffset;
      const startOffset2 = b.name
        ? b.children.At[0].startOffset
        : b.startOffset;
      return startOffset1 - startOffset2;
    });

    const segments = [];
    let currentSegment = [];

    _.forEach(tokens, token => {
      if (token.name === "annotation") {
        currentSegment.push(this.visit([token]));
      } else {
        segments.push(
          rejectAndConcat([
            rejectAndJoin(" ", currentSegment),
            concat([ctx.LSquare[0], ctx.RSquare[0]])
          ])
        );
        currentSegment = [];
      }
    });

    return rejectAndConcat(segments);
  }

  typeParameter(ctx) {
    const typeParameterModifiers = this.mapVisit(ctx.typeParameterModifier);

    const typeIdentifier = this.visit(ctx.typeIdentifier);
    const typeBound = this.visit(ctx.typeBound);

    return rejectAndJoin(" ", [
      join(" ", typeParameterModifiers),
      typeIdentifier,
      typeBound
    ]);
  }

  typeParameterModifier(ctx) {
    return this.visitSingle(ctx);
  }

  typeBound(ctx) {
    const classOrInterfaceType = this.visit(ctx.classOrInterfaceType);
    const additionalBound = this.mapVisit(ctx.additionalBound);

    return rejectAndJoin(" ", [
      ctx.Extends[0],
      classOrInterfaceType,
      join(" ", additionalBound)
    ]);
  }

  additionalBound(ctx) {
    const interfaceType = this.visit(ctx.interfaceType);

    return join(" ", [ctx.And[0], interfaceType]);
  }

  typeArguments(ctx) {
    const typeArgumentList = this.visit(ctx.typeArgumentList);

    return rejectAndConcat([ctx.Less[0], typeArgumentList, ctx.Greater[0]]);
  }

  typeArgumentList(ctx) {
    const typeArguments = this.mapVisit(ctx.typeArgument);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, " "])) : [];
    return rejectAndJoinSeps(commas, typeArguments);
  }

  typeArgument(ctx) {
    return this.visitSingle(ctx);
  }

  wildcard(ctx) {
    const annotations = this.mapVisit(ctx.annotation);
    const wildcardBounds = this.visit(ctx.wildcardBounds);

    return rejectAndJoin(" ", [
      join(" ", annotations),
      ctx.QuestionMark[0],
      wildcardBounds
    ]);
  }

  wildcardBounds(ctx) {
    const keyWord = ctx.Extends ? ctx.Extends[0] : ctx.Super[0];
    const referenceType = this.visit(ctx.referenceType);
    return join(" ", [keyWord, referenceType]);
  }
}

module.exports = {
  TypesValuesAndVariablesPrettierVisitor
};
