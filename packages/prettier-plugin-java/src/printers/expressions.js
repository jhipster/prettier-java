"use strict";

const _ = require("lodash");
const { ifBreak, line, softline } = require("prettier").doc.builders;
const { concat, group, indent } = require("./prettier-builder");
const { printTokenWithComments } = require("./comments/format-comments");
const {
  handleCommentsBinaryExpression
} = require("./comments/handle-comments");
const {
  matchCategory,
  rejectAndJoin,
  rejectAndConcat,
  sortAnnotationIdentifier,
  rejectAndJoinSeps,
  findDeepElementInPartsArray,
  isExplicitLambdaParameter,
  putIntoBraces,
  separateTokensIntoGroups,
  isShiftOperator,
  isUniqueMethodInvocation
} = require("./printer-utils");

class ExpressionsPrettierVisitor {
  constantExpression(ctx) {
    return this.visitSingle(ctx);
  }

  expression(ctx, params) {
    return this.visitSingle(ctx, params);
  }

  lambdaExpression(ctx) {
    const lambdaParameters = this.visit(ctx.lambdaParameters);
    const lambdaBody = this.visit(ctx.lambdaBody);

    const isLambdaBodyABlock = ctx.lambdaBody[0].children.block !== undefined;
    if (isLambdaBodyABlock) {
      return rejectAndJoin(" ", [lambdaParameters, ctx.Arrow[0], lambdaBody]);
    }

    return group(
      indent(
        rejectAndJoin(line, [
          rejectAndJoin(" ", [lambdaParameters, ctx.Arrow[0]]),
          lambdaBody
        ])
      )
    );
  }

  lambdaParameters(ctx) {
    if (ctx.lambdaParametersWithBraces) {
      return this.visitSingle(ctx);
    }

    return printTokenWithComments(this.getSingle(ctx));
  }

  lambdaParametersWithBraces(ctx) {
    const lambdaParameterList = this.visit(ctx.lambdaParameterList);

    if (findDeepElementInPartsArray(lambdaParameterList, ",")) {
      return rejectAndConcat([
        ctx.LBrace[0],
        lambdaParameterList,
        ctx.RBrace[0]
      ]);
    }

    // removing braces when only no comments attached
    if (
      (ctx.LBrace &&
        ctx.RBrace &&
        (!lambdaParameterList || isExplicitLambdaParameter(ctx))) ||
      ctx.LBrace[0].leadingComments ||
      ctx.LBrace[0].trailingComments ||
      ctx.RBrace[0].leadingComments ||
      ctx.RBrace[0].trailingComments
    ) {
      return rejectAndConcat([
        ctx.LBrace[0],
        lambdaParameterList,
        ctx.RBrace[0]
      ]);
    }

    return lambdaParameterList;
  }

  lambdaParameterList(ctx) {
    return this.visitSingle(ctx);
  }

  inferredLambdaParameterList(ctx) {
    const commas = ctx.Comma
      ? ctx.Comma.map(elt => {
          return concat([elt, " "]);
        })
      : [];

    return rejectAndJoinSeps(commas, ctx.Identifier);
  }

  explicitLambdaParameterList(ctx) {
    const lambdaParameter = this.mapVisit(ctx.lambdaParameter);
    const commas = ctx.Comma
      ? ctx.Comma.map(elt => {
          return concat([elt, " "]);
        })
      : [];
    return rejectAndJoinSeps(commas, lambdaParameter);
  }

  lambdaParameter(ctx) {
    return this.visitSingle(ctx);
  }

  regularLambdaParameter(ctx) {
    const variableModifier = this.mapVisit(ctx.variableModifier);
    const lambdaParameterType = this.visit(ctx.lambdaParameterType);
    const variableDeclaratorId = this.visit(ctx.variableDeclaratorId);

    return rejectAndJoin(" ", [
      rejectAndJoin(" ", variableModifier),
      lambdaParameterType,
      variableDeclaratorId
    ]);
  }

  lambdaParameterType(ctx) {
    if (ctx.unannType) {
      return this.visitSingle(ctx);
    }
    return printTokenWithComments(this.getSingle(ctx));
  }

  lambdaBody(ctx) {
    return this.visitSingle(ctx);
  }

  ternaryExpression(ctx, params) {
    const binaryExpression = this.visit(ctx.binaryExpression, params);
    if (ctx.QuestionMark) {
      const expression1 = this.visit(ctx.expression[0]);
      const expression2 = this.visit(ctx.expression[1]);

      return indent(
        group(
          rejectAndConcat([
            rejectAndJoin(line, [
              binaryExpression,
              rejectAndJoin(" ", [ctx.QuestionMark[0], expression1]),
              rejectAndJoin(" ", [ctx.Colon[0], expression2])
            ])
          ])
        )
      );
    }
    return binaryExpression;
  }

  binaryExpression(ctx, params) {
    handleCommentsBinaryExpression(ctx);

    const referenceType = this.mapVisit(ctx.referenceType);
    const expression = this.mapVisit(ctx.expression);
    const unaryExpression = this.mapVisit(ctx.unaryExpression);

    const {
      groupsOfOperator,
      sortedBinaryOperators
    } = separateTokensIntoGroups(ctx);
    const segmentsSplittedByBinaryOperator = [];
    let currentSegment = [];

    if (groupsOfOperator.length === 1 && groupsOfOperator[0].length === 0) {
      return unaryExpression.shift();
    }

    groupsOfOperator.forEach(subgroup => {
      currentSegment = [unaryExpression.shift()];
      for (let i = 0; i < subgroup.length; i++) {
        const token = subgroup[i];
        const shiftOperator = isShiftOperator(subgroup, i);
        if (token.tokenType.name === "Instanceof") {
          currentSegment.push(
            rejectAndJoin(" ", [ctx.Instanceof[0], referenceType.shift()])
          );
        } else if (matchCategory(token, "'AssignmentOperator'")) {
          currentSegment.push(
            indent(rejectAndJoin(line, [token, expression.shift()]))
          );
        } else if (
          shiftOperator === "leftShift" ||
          shiftOperator === "rightShift"
        ) {
          currentSegment.push(
            rejectAndJoin(" ", [
              rejectAndConcat([token, subgroup[i + 1]]),
              unaryExpression.shift()
            ])
          );
          i++;
        } else if (shiftOperator === "doubleRightShift") {
          currentSegment.push(
            rejectAndJoin(" ", [
              rejectAndConcat([token, subgroup[i + 1], subgroup[i + 2]]),
              unaryExpression.shift()
            ])
          );
          i += 2;
        } else if (matchCategory(token, "'BinaryOperator'")) {
          currentSegment.push(
            rejectAndJoin(line, [token, unaryExpression.shift()])
          );
        }
      }
      segmentsSplittedByBinaryOperator.push(
        group(rejectAndJoin(" ", currentSegment))
      );
    });

    if (params !== undefined && params.addParenthesisToWrapStatement) {
      return group(
        concat([
          ifBreak("(", ""),
          indent(
            concat([
              softline,
              group(
                rejectAndJoinSeps(
                  sortedBinaryOperators.map(elt => concat([" ", elt, line])),
                  segmentsSplittedByBinaryOperator
                )
              )
            ])
          ),
          softline,
          ifBreak(")")
        ])
      );
    }

    return group(
      rejectAndJoinSeps(
        sortedBinaryOperators.map(elt => concat([" ", elt, line])),
        segmentsSplittedByBinaryOperator
      )
    );
  }

  unaryExpression(ctx) {
    const unaryPrefixOperator = ctx.UnaryPrefixOperator
      ? ctx.UnaryPrefixOperator
      : [];
    const primary = this.visit(ctx.primary);
    const unarySuffixOperator = ctx.UnarySuffixOperator
      ? ctx.UnarySuffixOperator
      : [];
    return rejectAndConcat([
      rejectAndConcat(unaryPrefixOperator),
      primary,
      rejectAndConcat(unarySuffixOperator)
    ]);
  }

  unaryExpressionNotPlusMinus(ctx) {
    const unaryPrefixOperatorNotPlusMinus = ctx.unaryPrefixOperatorNotPlusMinus
      ? rejectAndJoin(" ", ctx.unaryPrefixOperatorNotPlusMinus)
      : "";

    const primary = this.visit(ctx.primary);
    const unarySuffixOperator = ctx.unarySuffixOperator
      ? rejectAndJoin(" ", ctx.unarySuffixOperator)
      : "";

    return rejectAndJoin(" ", [
      unaryPrefixOperatorNotPlusMinus,
      primary,
      unarySuffixOperator
    ]);
  }

  primary(ctx) {
    const countMethodInvocation = isUniqueMethodInvocation(ctx.primarySuffix);

    const primaryPrefix = this.visit(ctx.primaryPrefix, {
      shouldBreakBeforeFirstMethodInvocation: countMethodInvocation > 1
    });
    const primarySuffixes = this.mapVisit(ctx.primarySuffix);

    const suffixes = [];

    if (ctx.primarySuffix !== undefined) {
      if (
        ctx.primarySuffix[0].children.Dot !== undefined &&
        ctx.primaryPrefix[0].children.newExpression !== undefined
      ) {
        suffixes.push(softline);
      }
      suffixes.push(primarySuffixes[0]);

      for (let i = 1; i < primarySuffixes.length; i++) {
        if (
          ctx.primarySuffix[i].children.Dot !== undefined &&
          ctx.primarySuffix[i - 1].children.methodInvocationSuffix !== undefined
        ) {
          suffixes.push(softline);
        }
        suffixes.push(primarySuffixes[i]);
      }

      if (countMethodInvocation === 1) {
        return group(
          rejectAndConcat([
            primaryPrefix,
            suffixes[0],
            indent(rejectAndConcat(suffixes.slice(1)))
          ])
        );
      }
    }

    return group(
      rejectAndConcat([primaryPrefix, indent(rejectAndConcat(suffixes))])
    );
  }

  primaryPrefix(ctx, params) {
    if (ctx.This || ctx.Void || ctx.Boolean) {
      return printTokenWithComments(this.getSingle(ctx));
    }

    return this.visitSingle(ctx, params);
  }

  primarySuffix(ctx) {
    if (ctx.Dot) {
      if (ctx.This) {
        return rejectAndConcat([ctx.Dot[0], ctx.This[0]]);
      } else if (ctx.Identifier) {
        const typeArguments = this.visit(ctx.typeArguments);
        return rejectAndConcat([ctx.Dot[0], typeArguments, ctx.Identifier[0]]);
      }

      const unqualifiedClassInstanceCreationExpression = this.visit(
        ctx.unqualifiedClassInstanceCreationExpression
      );
      return rejectAndConcat([
        ctx.Dot[0],
        unqualifiedClassInstanceCreationExpression
      ]);
    }
    return this.visitSingle(ctx);
  }

  fqnOrRefType(ctx, params) {
    const fqnOrRefTypePartFirst = this.visit(ctx.fqnOrRefTypePartFirst);
    const fqnOrRefTypePartRest = this.mapVisit(ctx.fqnOrRefTypePartRest);
    const dims = this.visit(ctx.dims);
    const dots = ctx.Dot ? ctx.Dot : [];

    if (
      params !== undefined &&
      params.shouldBreakBeforeFirstMethodInvocation === true
    ) {
      return rejectAndConcat([
        indent(
          rejectAndJoin(concat([softline, dots[0]]), [
            fqnOrRefTypePartFirst,
            rejectAndJoinSeps(dots.slice(1), fqnOrRefTypePartRest),
            dims
          ])
        )
      ]);
    }

    return rejectAndConcat([
      rejectAndJoinSeps(dots, [fqnOrRefTypePartFirst, ...fqnOrRefTypePartRest]),
      dims
    ]);
  }

  fqnOrRefTypePartFirst(ctx) {
    const annotation = this.mapVisit(ctx.annotation);
    const fqnOrRefTypeCommon = this.visit(ctx.fqnOrRefTypePartCommon);

    return rejectAndJoin(" ", [
      rejectAndJoin(" ", annotation),
      fqnOrRefTypeCommon
    ]);
  }

  fqnOrRefTypePartRest(ctx) {
    const annotation = this.mapVisit(ctx.annotation);
    const fqnOrRefTypeCommon = this.visit(ctx.fqnOrRefTypePartCommon);

    let fqnOrRefTypePart$methodTypeArguments = "";
    if (
      ctx.$methodTypeArguments &&
      ctx.$methodTypeArguments[0].children &&
      ctx.$methodTypeArguments[0].children.typeArguments
    ) {
      fqnOrRefTypePart$methodTypeArguments = this.visit(
        ctx.$methodTypeArguments
      );
    }

    return rejectAndJoin(" ", [
      rejectAndJoin(" ", annotation),
      rejectAndConcat([
        fqnOrRefTypePart$methodTypeArguments,
        fqnOrRefTypeCommon
      ])
    ]);
  }

  fqnOrRefTypePartCommon(ctx) {
    let keyWord = null;
    if (ctx.Identifier) {
      keyWord = ctx.Identifier[0];
    } else {
      keyWord = ctx.Super[0];
    }

    let fqnOrRefTypePart$classTypeArguments = "";
    if (
      ctx.$classTypeArguments &&
      ctx.$classTypeArguments[0].children &&
      ctx.$classTypeArguments[0].children.typeArguments
    ) {
      fqnOrRefTypePart$classTypeArguments = this.visit(ctx.$classTypeArguments);
    }

    return rejectAndConcat([keyWord, fqnOrRefTypePart$classTypeArguments]);
  }

  fqnOrRefTypePartRest$methodTypeArguments(ctx) {
    return this.visitSingle(ctx);
  }

  fqnOrRefTypePartCommon$classTypeArguments(ctx) {
    return this.visitSingle(ctx);
  }

  parenthesisExpression(ctx) {
    const expression = this.visit(ctx.expression);
    return putIntoBraces(expression, softline, ctx.LBrace[0], ctx.RBrace[0]);
  }

  castExpression(ctx) {
    return this.visitSingle(ctx);
  }

  primitiveCastExpression(ctx) {
    const primitiveType = this.visit(ctx.primitiveType);
    const unaryExpression = this.visit(ctx.unaryExpression);
    return rejectAndJoin(" ", [
      rejectAndConcat([ctx.LBrace[0], primitiveType, ctx.RBrace[0]]),
      unaryExpression
    ]);
  }

  referenceTypeCastExpression(ctx) {
    const referenceType = this.visit(ctx.referenceType);
    const additionalBound = this.mapVisit(ctx.additionalBound);

    const expression = ctx.lambdaExpression
      ? this.visit(ctx.lambdaExpression)
      : this.visit(ctx.unaryExpressionNotPlusMinus);

    return rejectAndJoin(" ", [
      rejectAndConcat([ctx.LBrace[0], referenceType, ctx.RBrace[0]]),
      additionalBound,
      expression
    ]);
  }

  newExpression(ctx) {
    return this.visitSingle(ctx);
  }

  unqualifiedClassInstanceCreationExpression(ctx) {
    const typeArguments = this.visit(ctx.typeArguments);
    const classOrInterfaceTypeToInstantiate = this.visit(
      ctx.classOrInterfaceTypeToInstantiate
    );
    const argumentList = this.visit(ctx.argumentList);
    const classBody = this.visit(ctx.classBody);

    return rejectAndJoin(" ", [
      ctx.New[0],
      rejectAndConcat([
        typeArguments,
        classOrInterfaceTypeToInstantiate,
        putIntoBraces(argumentList, softline, ctx.LBrace[0], ctx.RBrace[0])
      ]),
      classBody
    ]);
  }

  classOrInterfaceTypeToInstantiate(ctx) {
    const tokens = sortAnnotationIdentifier(ctx.annotation, ctx.Identifier);

    const segments = [];
    let currentSegment = [];

    _.forEach(tokens, token => {
      if (token.name) {
        currentSegment.push(this.visit([token]));
      } else {
        currentSegment.push(token);
        segments.push(rejectAndJoin(" ", currentSegment));
        currentSegment = [];
      }
    });

    const typeArgumentsOrDiamond = this.visit(ctx.typeArgumentsOrDiamond);
    const dots = ctx.Dot ? ctx.Dot : [];
    return rejectAndConcat([
      rejectAndJoinSeps(dots, segments),
      typeArgumentsOrDiamond
    ]);
  }

  typeArgumentsOrDiamond(ctx) {
    return this.visitSingle(ctx);
  }

  diamond(ctx) {
    return concat([ctx.Less[0], ctx.Greater[0]]);
  }

  methodInvocationSuffix(ctx) {
    if (ctx.argumentList === undefined) {
      return rejectAndConcat([ctx.LBrace[0], ctx.RBrace[0]]);
    }

    const argumentList = this.visit(ctx.argumentList);
    return putIntoBraces(argumentList, softline, ctx.LBrace[0], ctx.RBrace[0]);
  }

  argumentList(ctx) {
    const expressions = this.mapVisit(ctx.expression);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, line])) : [];
    return rejectAndJoinSeps(commas, expressions);
  }

  arrayCreationExpression(ctx) {
    const type = ctx.primitiveType
      ? this.visit(ctx.primitiveType)
      : this.visit(ctx.classOrInterfaceType);
    const suffix = ctx.arrayCreationDefaultInitSuffix
      ? this.visit(ctx.arrayCreationDefaultInitSuffix)
      : this.visit(ctx.arrayCreationExplicitInitSuffix);

    return rejectAndConcat([concat([ctx.New[0], " "]), type, suffix]);
  }

  arrayCreationDefaultInitSuffix(ctx) {
    const dimExprs = this.visit(ctx.dimExprs);
    const dims = this.visit(ctx.dims);
    return rejectAndConcat([dimExprs, dims]);
  }

  arrayCreationExplicitInitSuffix(ctx) {
    const dims = this.visit(ctx.dims);
    const arrayInitializer = this.visit(ctx.arrayInitializer);

    return rejectAndJoin(" ", [dims, arrayInitializer]);
  }

  dimExprs(ctx) {
    const dimExpr = this.mapVisit(ctx.dimExpr);
    return rejectAndConcat(dimExpr);
  }

  dimExpr(ctx) {
    const annotations = this.mapVisit(ctx.annotation);
    const expression = this.visit(ctx.expression);

    return rejectAndJoin(" ", [
      rejectAndJoin(" ", annotations),
      rejectAndConcat([ctx.LSquare[0], expression, ctx.RSquare[0]])
    ]);
  }

  classLiteralSuffix(ctx) {
    const squares = [];
    if (ctx.LSquare) {
      for (let i = 0; i < ctx.LSquare.length; i++) {
        squares.push(concat([ctx.LSquare[i], ctx.RSquare[i]]));
      }
    }
    return rejectAndConcat([...squares, ctx.Dot[0], ctx.Class[0]]);
  }

  arrayAccessSuffix(ctx) {
    const expression = this.visit(ctx.expression);
    return rejectAndConcat([ctx.LSquare[0], expression, ctx.RSquare[0]]);
  }

  methodReferenceSuffix(ctx) {
    const typeArguments = this.visit(ctx.typeArguments);
    const identifierOrNew = ctx.New ? ctx.New[0] : ctx.Identifier[0];
    return rejectAndConcat([ctx.ColonColon[0], typeArguments, identifierOrNew]);
  }

  identifyNewExpressionType() {
    return "identifyNewExpressionType";
  }

  isLambdaExpression() {
    return "isLambdaExpression";
  }

  isCastExpression() {
    return "isCastExpression";
  }

  isPrimitiveCastExpression() {
    return "isPrimitiveCastExpression";
  }

  isReferenceTypeCastExpression() {
    return "isReferenceTypeCastExpression";
  }

  isRefTypeInMethodRef() {
    return "isRefTypeInMethodRef";
  }
}

module.exports = {
  ExpressionsPrettierVisitor
};
