"use strict";
/* eslint-disable no-unused-vars */

const _ = require("lodash");
const {
  concat,
  dedent,
  group,
  indent,
  join,
  line,
  softline
} = require("prettier").doc.builders;
const {
  matchCategory,
  rejectAndJoin,
  rejectAndConcat,
  sortAnnotationIdentifier,
  sortTokens
} = require("./printer-utils");

class ExpressionsPrettierVisitor {
  constantExpression(ctx) {
    return this.visitSingle(ctx);
  }

  expression(ctx) {
    return this.visitSingle(ctx);
  }

  lambdaExpression(ctx) {
    const lambdaParameters = this.visit(ctx.lambdaParameters);
    const lambdaBody = this.visit(ctx.lambdaBody);

    return rejectAndJoin(" -> ", [lambdaParameters, lambdaBody]);
  }

  lambdaParameters(ctx) {
    if (ctx.lambdaParametersWithBraces) {
      return this.visitSingle(ctx);
    }

    return this.getSingle(ctx).image;
  }

  lambdaParametersWithBraces(ctx) {
    const lambdaParameterList = this.visit(ctx.lambdaParameterList);

    if (lambdaParameterList && lambdaParameterList.parts.indexOf(", ") === -1) {
      return lambdaParameterList;
    }
    return rejectAndConcat(["(", lambdaParameterList, ")"]);
  }

  lambdaParameterList(ctx) {
    return this.visitSingle(ctx);
  }

  inferredLambdaParameterList(ctx) {
    const identifiers = ctx.Identifier.map(identifier => identifier.image);

    return rejectAndJoin(", ", identifiers);
  }

  explicitLambdaParameterList(ctx) {
    const lambdaParameter = this.mapVisit(ctx.lambdaParameter);

    return rejectAndJoin(", ", lambdaParameter);
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
    return this.getSingle(ctx).image;
  }

  lambdaBody(ctx) {
    return this.visitSingle(ctx);
  }

  ternaryExpression(ctx) {
    const binaryExpression = this.visit(ctx.binaryExpression);
    if (ctx.QuestionMark) {
      const expression1 = this.visit(ctx.expression[0]);
      const expression2 = this.visit(ctx.expression[1]);

      return group(
        rejectAndConcat([
          group(
            rejectAndConcat([binaryExpression, indent(line), "? ", expression1])
          ),
          indent(line),
          ": ",
          expression2
        ])
      );
    }
    return binaryExpression;
  }

  binaryExpression(ctx) {
    const sortedTokens = sortTokens(
      ctx.Instanceof,
      ctx.AssignmentOperator,
      ctx.Less,
      ctx.Greater,
      ctx.BinaryOperator
    );
    const referenceType = this.mapVisit(ctx.referenceType);
    const expression = this.mapVisit(ctx.expression);
    const unaryExpression = this.mapVisit(ctx.unaryExpression);
    const segment = [unaryExpression.shift()];
    for (let i = 0; i < sortedTokens.length; i++) {
      const token = sortedTokens[i];
      if (token.tokenType.tokenName === "Instanceof") {
        segment.push(rejectAndJoin(" ", ["instanceof", referenceType.shift()]));
      } else if (matchCategory(token, "'AssignmentOperator'")) {
        segment.push(rejectAndJoin(" ", [token.image, expression.shift()]));
      } else if (
        i + 1 < sortedTokens.length &&
        ((sortedTokens[i].image === ">" && sortedTokens[i + 1].image === ">") ||
          (sortedTokens[i].image === "<" && sortedTokens[i + 1].image === "<"))
      ) {
        // TODO: fix here by implementing print for s << 2, s >> 2 and s >>> 2
        // currently work only for s << 2 and s >> 2
        segment.push(
          rejectAndJoin(" ", [
            rejectAndConcat([token.image, sortedTokens[i + 1].image]),
            unaryExpression.shift()
          ])
        );
        i += 1;
      } else if (matchCategory(token, "'BinaryOperator'")) {
        segment.push(
          indent(
            rejectAndConcat([
              softline,
              rejectAndJoin(" ", [token.image, unaryExpression.shift()])
            ])
          )
        );
      }
    }
    return group(rejectAndJoin(" ", segment));
  }

  unaryExpression(ctx) {
    const unaryPrefixOperator = ctx.UnaryPrefixOperator
      ? ctx.UnaryPrefixOperator.map(token => token.image)
      : [];
    const primary = this.visit(ctx.primary);
    const unarySuffixOperator = ctx.UnarySuffixOperator
      ? ctx.UnarySuffixOperator.map(token => token.image)
      : [];

    return rejectAndConcat([
      rejectAndConcat(unaryPrefixOperator),
      primary,
      rejectAndConcat(unarySuffixOperator)
    ]);
  }

  unaryExpressionNotPlusMinus(ctx) {
    const unaryPrefixOperatorNotPlusMinus = ctx.unaryPrefixOperatorNotPlusMinus
      ? rejectAndJoin(
          " ",
          ctx.unaryPrefixOperatorNotPlusMinus.map(token => token.image)
        )
      : "";

    const primary = this.visit(ctx.primary);
    const unarySuffixOperator = ctx.unarySuffixOperator
      ? rejectAndJoin(" ", ctx.unarySuffixOperator.map(token => token.image))
      : "";

    return rejectAndJoin(" ", [
      unaryPrefixOperatorNotPlusMinus,
      primary,
      unarySuffixOperator
    ]);
  }

  primary(ctx) {
    const primaryPrefix = this.visit(ctx.primaryPrefix);

    const segments = [];
    let currentSegment = [];
    const primarySuffixes = this.mapVisit(ctx.primarySuffix);

    for (let i = 0; i < primarySuffixes.length; i++) {
      currentSegment.push(primarySuffixes[i]);
      if (
        i + 1 < ctx.primarySuffix.length &&
        ctx.primarySuffix[i + 1].children.methodInvocationSuffix
      ) {
        currentSegment.push(primarySuffixes[i + 1]);
        i += 1;
      }
      segments.push(rejectAndConcat(currentSegment));
      currentSegment = [];
    }

    return group(
      concat([primaryPrefix, indent(rejectAndJoin(softline, segments))])
    );
  }

  primaryPrefix(ctx) {
    if (ctx.This || ctx.Void) {
      return this.getSingle(ctx).image;
    }

    return this.visitSingle(ctx);
  }

  primarySuffix(ctx) {
    if (ctx.Dot) {
      if (ctx.This) {
        return rejectAndConcat([".", "this"]);
      } else if (ctx.Identifier) {
        const typeArguments = this.visit(ctx.typeArguments);
        return rejectAndConcat([".", typeArguments, ctx.Identifier[0].image]);
      }

      const unqualifiedClassInstanceCreationExpression = this.visit(
        ctx.unqualifiedClassInstanceCreationExpression
      );
      return rejectAndConcat([".", unqualifiedClassInstanceCreationExpression]);
    }
    return this.visitSingle(ctx);
  }

  fqnOrRefType(ctx) {
    const fqnOrRefTypePart = this.mapVisit(ctx.fqnOrRefTypePart);
    const dims = this.visit(ctx.dims);

    return rejectAndConcat([join(".", fqnOrRefTypePart), dims]);
  }

  fqnOrRefTypePart(ctx) {
    const annotation = this.mapVisit(ctx.annotation);

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

    let keyWord = null;
    if (ctx.Identifier) {
      keyWord = ctx.Identifier[0].image;
    } else {
      keyWord = "super";
    }

    let fqnOrRefTypePart$classTypeArguments = "";
    if (
      ctx.$classTypeArguments &&
      ctx.$classTypeArguments[0].children &&
      ctx.$classTypeArguments[0].children.typeArguments
    ) {
      fqnOrRefTypePart$classTypeArguments = this.visit(ctx.$classTypeArguments);
    }

    return rejectAndJoin(" ", [
      rejectAndJoin(" ", annotation),
      rejectAndConcat([
        fqnOrRefTypePart$methodTypeArguments,
        keyWord,
        fqnOrRefTypePart$classTypeArguments
      ])
    ]);
  }

  fqnOrRefTypePart$methodTypeArguments(ctx) {
    return this.visitSingle(ctx);
  }

  fqnOrRefTypePart$classTypeArguments(ctx) {
    return this.visitSingle(ctx);
  }

  parenthesisExpression(ctx) {
    const expression = this.visit(ctx.expression);
    return rejectAndConcat(["(", expression, ")"]);
  }

  castExpression(ctx) {
    return this.visitSingle(ctx);
  }

  primitiveCastExpression(ctx) {
    const primitiveType = this.visit(ctx.primitiveType);
    const unaryExpression = this.visit(ctx.unaryExpression);
    return rejectAndJoin(" ", [
      rejectAndConcat(["(", primitiveType, ")"]),
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
      rejectAndConcat(["(", referenceType, ")"]),
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
      "new",
      rejectAndConcat([
        typeArguments,
        classOrInterfaceTypeToInstantiate,
        "(",
        group(rejectAndConcat([indent(argumentList), softline, ")"]))
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
        currentSegment.push(token.image);
        segments.push(rejectAndJoin(" ", currentSegment));
        currentSegment = [];
      }
    });

    const typeArgumentsOrDiamond = this.visit(ctx.typeArgumentsOrDiamond);

    return rejectAndConcat([
      rejectAndJoin(".", segments),
      typeArgumentsOrDiamond
    ]);
  }

  typeArgumentsOrDiamond(ctx) {
    return this.visitSingle(ctx);
  }

  diamond(ctx) {
    return "<>";
  }

  methodInvocationSuffix(ctx) {
    const argumentList = this.visit(ctx.argumentList);
    return group(
      rejectAndConcat([
        rejectAndConcat(["(", argumentList]),
        dedent(softline),
        ")"
      ])
    );
  }

  argumentList(ctx) {
    const expressions = this.mapVisit(ctx.expression);

    return group(
      rejectAndConcat([
        softline,
        rejectAndJoin(rejectAndConcat([",", line]), expressions)
      ])
    );
  }

  arrayCreationExpression(ctx) {
    const type = ctx.primitiveType
      ? this.visit(ctx.primitiveType)
      : this.visit(ctx.classOrInterfaceType);
    const suffix = ctx.arrayCreationDefaultInitSuffix
      ? this.visit(ctx.arrayCreationDefaultInitSuffix)
      : this.visit(ctx.arrayCreationExplicitInitSuffix);

    return rejectAndConcat(["new ", type, suffix]);
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
      rejectAndConcat(["[", expression, "]"])
    ]);
  }

  classLiteralSuffix(ctx) {
    const squares = ctx.LSquare ? "[]".repeat(ctx.LSquare.length) : "";

    return rejectAndConcat([squares, ".class"]);
  }

  arrayAccessSuffix(ctx) {
    const expression = this.visit(ctx.expression);
    return rejectAndConcat(["[", expression, "]"]);
  }

  methodReferenceSuffix(ctx) {
    const typeArguments = this.visit(ctx.typeArguments);
    const identifierOrNew = ctx.New ? "new" : ctx.Identifier[0].image;
    return rejectAndConcat(["::", typeArguments, identifierOrNew]);
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
