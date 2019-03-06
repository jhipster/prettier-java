"use strict";
/* eslint-disable no-unused-vars */

const {
  concat,
  join,
  line,
  ifBreak,
  group,
  indent,
  dedent
} = require("prettier").doc.builders;
const { rejectAndJoin, rejectAndConcat } = require("./printer-utils");

class TypesValuesAndVariablesPrettierVisitor {
  primitiveType(ctx) {
    const annotations = this.mapVisit(ctx.annotation);
    const type = ctx.numericType
      ? this.visit(ctx.numericType)
      : this.getSingle(ctx).image;

    return rejectAndJoin(" ", [join(" ", annotations), type]);
  }

  numericType(ctx) {
    return this.visitSingle(ctx);
  }

  integralType(ctx) {
    return this.getSingle(ctx).image;
  }

  floatingPointType(ctx) {
    return this.getSingle(ctx).image;
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
    // TODO : refactor by sorting tokens
    const dots = ctx.Dots;

    if (dots) {
      const annotations = ctx.annotation;
      const typeArguments = ctx.typeArguments;
      const identifiers = ctx.Identifier;

      const segments = [];
      for (const dot in dots) {
        const offset = dot.startOffset;

        const currentSegmentAnnotations = [];
        while (annotations.length > 0) {
          const annotation = annotations[0];
          if (annotation && annotation.startOffset < offset) {
            currentSegmentAnnotations.push(this.visit(annotation));
            annotations.pop();
          } else {
            break;
          }
        }
        const currentSegmentIdentifier = identifiers.pop().image;

        let currentSegmentTypeArgument = undefined;
        const typeArgument = typeArguments[0];
        if (typeArgument && typeArgument.startOffset < offset) {
          currentSegmentTypeArgument = this.visit(typeArgument);
          typeArguments.pop();
        }

        segments.push(
          concat(
            join(" ", currentSegmentAnnotations),
            currentSegmentIdentifier,
            currentSegmentTypeArgument
          )
        );
      }

      return join(".", segments);
    }

    const annotations = this.mapVisit(ctx.annotation);
    const identifier = ctx.Identifier[0].image;
    const typeArguments = this.mapVisit(ctx.typeArguments);

    return rejectAndJoin("", [
      join(" ", annotations),
      identifier,
      typeArguments
    ]);
  }

  interfaceType(ctx) {
    return this.visitSingle(ctx);
  }

  typeVariable(ctx) {
    const annotations = this.mapVisit(ctx.annotation);
    const identifier = this.getSingle(ctx).image;

    return rejectAndJoin(" ", [join(" ", annotations), identifier]);
  }

  dims(ctx) {
    // TODO: refactor here by sorting annotations
    const squares = ctx.LSquare;
    const annotations = this.mapVisit(ctx.annotation);

    const segments = [];
    for (const square in squares) {
      const squareOffSet = square.startOffset;

      const currentSegment = [];
      while (annotations.length > 0) {
        const annotation = annotation[0];
        if (annotation.startOffset < squareOffSet) {
          currentSegment.push(annotations.pop());
        }
      }

      segments.push(
        rejectAndJoin(" ", [rejectAndJoin(" ", currentSegment), "[]"])
      );
    }

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
      "extends",
      classOrInterfaceType,
      join(" ", additionalBound)
    ]);
  }

  additionalBound(ctx) {
    const interfaceType = this.visit(ctx.interfaceType);

    return join(" ", ["&", interfaceType]);
  }

  typeArguments(ctx) {
    const typeArgumentList = this.visit(ctx.typeArgumentList);

    return concat(["<", typeArgumentList, ">"]);
  }

  typeArgumentList(ctx) {
    const typeArguments = this.mapVisit(ctx.typeArgument);

    return join(", ", typeArguments);
  }

  typeArgument(ctx) {
    return this.visitSingle(ctx);
  }

  wildcard(ctx) {
    const annotations = this.mapVisit(ctx.annotation);
    const wildcardBounds = this.visit(ctx.wildcardBounds);

    return rejectAndJoin(" ", [join(" ", annotations), "?", wildcardBounds]);
  }

  wildcardBounds(ctx) {
    const keyWord = ctx.Extends ? "extends" : "super";
    const referenceType = this.visit(ctx.referenceType);
    return join(" ", [keyWord, referenceType]);
  }
}

module.exports = {
  TypesValuesAndVariablesPrettierVisitor
};
