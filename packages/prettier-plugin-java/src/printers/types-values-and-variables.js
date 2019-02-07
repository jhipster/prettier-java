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
const { rejectAndJoin } = require("./printer-utils");

class TypesValuesAndVariablesPrettierVisitor {
  primitiveType(ctx) {
    const annotations = this.mapVisit(ctx.annotation);
    let type = null;
    if (ctx.numericType) {
      type = this.visit(ctx.numericType);
    } else {
      type = this.getSingle(ctx).image;
    }

    return rejectAndJoin(" ", [annotations, type]);
  }

  numericType(ctx) {
    return "numericType";
  }

  integralType(ctx) {
    return "integralType";
  }

  floatingPointType(ctx) {
    return "floatingPointType";
  }

  referenceType(ctx) {
    return "referenceType";
  }

  classOrInterfaceType(ctx) {
    return "classOrInterfaceType";
  }

  classType(ctx) {
    return "classType";
  }

  interfaceType(ctx) {
    return "interfaceType";
  }

  typeVariable(ctx) {
    return "typeVariable";
  }

  dims(ctx) {
    return "dims";
  }

  typeParameter(ctx) {
    return "typeParameter";
  }

  typeParameterModifier(ctx) {
    return "typeParameterModifier";
  }

  typeBound(ctx) {
    return "typeBound";
  }

  additionalBound(ctx) {
    return "additionalBound";
  }

  typeArguments(ctx) {
    return "typeArguments";
  }

  typeArgumentList(ctx) {
    return "typeArgumentList";
  }

  typeArgument(ctx) {
    return "typeArgument";
  }

  wildcard(ctx) {
    return "wildcard";
  }

  wildcardBounds(ctx) {
    return "wildcardBounds";
  }
}

module.exports = {
  TypesValuesAndVariablesPrettierVisitor
};
