"use strict";
/* eslint-disable no-unused-vars */

class ExpressionsPrettierVisitor {
  constantExpression(ctx) {
    return "constantExpression";
  }

  expression(ctx) {
    return "expression";
  }

  lambdaExpression(ctx) {
    return "lambdaExpression";
  }

  lambdaParameters(ctx) {
    return "lambdaParameters";
  }

  lambdaParametersWithBraces(ctx) {
    return "lambdaParametersWithBraces";
  }

  lambdaParameterList(ctx) {
    return "lambdaParameterList";
  }

  inferredLambdaParameterList(ctx) {
    return "inferredLambdaParameterList";
  }

  explicitLambdaParameterList(ctx) {
    return "explicitLambdaParameterList";
  }

  lambdaParameter(ctx) {
    return "lambdaParameter";
  }

  regularLambdaParameter(ctx) {
    return "regularLambdaParameter";
  }

  lambdaParameterType(ctx) {
    return "lambdaParameterType";
  }

  lambdaBody(ctx) {
    return "lambdaBody";
  }

  ternaryExpression(ctx) {
    return "ternaryExpression";
  }

  binaryExpression(ctx) {
    return "binaryExpression";
  }

  unaryExpression(ctx) {
    return "unaryExpression";
  }

  unaryExpressionNotPlusMinus(ctx) {
    return "unaryExpressionNotPlusMinus";
  }

  primary(ctx) {
    return "primary";
  }

  primaryPrefix(ctx) {
    return "primaryPrefix";
  }

  primarySuffix(ctx) {
    return "primarySuffix";
  }

  fqnOrRefType(ctx) {
    return "fqnOrRefType";
  }

  fqnOrRefTypePart(ctx) {
    return "fqnOrRefTypePart";
  }

  fqnOrRefTypePart$methodTypeArguments(ctx) {
    return "methodTypeArguments";
  }

  fqnOrRefTypePart$classTypeArguments(ctx) {
    return "classTypeArguments";
  }

  parenthesisExpression(ctx) {
    return "parenthesisExpression";
  }

  castExpression(ctx) {
    return "castExpression";
  }

  primitiveCastExpression(ctx) {
    return "primitiveCastExpression";
  }

  referenceTypeCastExpression(ctx) {
    return "referenceTypeCastExpression";
  }

  newExpression(ctx) {
    return "newExpression";
  }

  unqualifiedClassInstanceCreationExpression(ctx) {
    return "unqualifiedClassInstanceCreationExpression";
  }

  classOrInterfaceTypeToInstantiate(ctx) {
    return "classOrInterfaceTypeToInstantiate";
  }

  typeArgumentsOrDiamond(ctx) {
    return "typeArgumentsOrDiamond";
  }

  diamond(ctx) {
    return "diamond";
  }

  methodInvocationSuffix(ctx) {
    return "methodInvocationSuffix";
  }

  argumentList(ctx) {
    return "argumentList";
  }

  arrayCreationExpression(ctx) {
    return "arrayCreationExpression";
  }

  arrayCreationDefaultInitSuffix(ctx) {
    return "arrayCreationDefaultInitSuffix";
  }

  arrayCreationExplicitInitSuffix(ctx) {
    return "arrayCreationExplicitInitSuffix";
  }

  dimExprs(ctx) {
    return "dimExprs";
  }

  dimExpr(ctx) {
    return "dimExpr";
  }

  classLiteralSuffix(ctx) {
    return "classLiteralSuffix";
  }

  arrayAccessSuffix(ctx) {
    return "arrayAccessSuffix";
  }

  methodReferenceSuffix(ctx) {
    return "methodReferenceSuffix";
  }

  identifyNewExpressionType(ctx) {
    return "identifyNewExpressionType";
  }

  isLambdaExpression(ctx) {
    return "isLambdaExpression";
  }

  isCastExpression(ctx) {
    return "isCastExpression";
  }

  isPrimitiveCastExpression(ctx) {
    return "isPrimitiveCastExpression";
  }

  isReferenceTypeCastExpression(ctx) {
    return "isReferenceTypeCastExpression";
  }

  isRefTypeInMethodRef(ctx) {
    return "isRefTypeInMethodRef";
  }
}

module.exports = {
  ExpressionsPrettierVisitor
};
