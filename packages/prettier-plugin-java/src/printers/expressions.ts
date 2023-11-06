import {
  ArgumentListCtx,
  ArrayAccessSuffixCtx,
  ArrayCreationDefaultInitSuffixCtx,
  ArrayCreationExplicitInitSuffixCtx,
  ArrayCreationExpressionCtx,
  BinaryExpressionCtx,
  CastExpressionCtx,
  ClassLiteralSuffixCtx,
  ClassOrInterfaceTypeToInstantiateCtx,
  ComponentPatternListCtx,
  ComponentPatternCtx,
  DiamondCtx,
  DimExprCtx,
  DimExprsCtx,
  ExplicitLambdaParameterListCtx,
  ExpressionCtx,
  FqnOrRefTypeCtx,
  FqnOrRefTypePartCommonCtx,
  FqnOrRefTypePartFirstCtx,
  FqnOrRefTypePartRestCtx,
  GuardCtx,
  InferredLambdaParameterListCtx,
  IToken,
  LambdaBodyCtx,
  LambdaExpressionCtx,
  LambdaParameterCtx,
  LambdaParameterListCtx,
  LambdaParametersCtx,
  LambdaParametersWithBracesCtx,
  LambdaParameterTypeCtx,
  MethodInvocationSuffixCtx,
  MethodReferenceSuffixCtx,
  NewExpressionCtx,
  ParenthesisExpressionCtx,
  PatternCtx,
  PrimaryCtx,
  PrimaryPrefixCtx,
  PrimarySuffixCtx,
  PrimitiveCastExpressionCtx,
  RecordPatternCtx,
  ReferenceTypeCastExpressionCtx,
  RegularLambdaParameterCtx,
  TernaryExpressionCtx,
  TypeArgumentsOrDiamondCtx,
  TypePatternCtx,
  UnaryExpressionCtx,
  UnaryExpressionNotPlusMinusCtx,
  UnnamedPatternCtx,
  UnqualifiedClassInstanceCreationExpressionCtx
} from "java-parser/api";

import forEach from "lodash/forEach.js";
import { builders } from "prettier/doc";
import { BaseCstPrettierPrinter } from "../base-cst-printer.js";
import { isAnnotationCstNode } from "../types/utils.js";
import { isArgumentListSingleLambda } from "../utils/expressions-utils.js";
import {
  printSingleLambdaInvocation,
  printArgumentListWithBraces
} from "../utils/index.js";
import { printTokenWithComments } from "./comments/format-comments.js";
import { handleCommentsBinaryExpression } from "./comments/handle-comments.js";
import { concat, dedent, group, indent } from "./prettier-builder.js";
import {
  binary,
  findDeepElementInPartsArray,
  isExplicitLambdaParameter,
  isUniqueMethodInvocation,
  putIntoBraces,
  rejectAndConcat,
  rejectAndJoin,
  rejectAndJoinSeps,
  sortAnnotationIdentifier,
  sortNodes,
  sortTokens
} from "./printer-utils.js";

const { ifBreak, line, softline, indentIfBreak } = builders;

export class ExpressionsPrettierVisitor extends BaseCstPrettierPrinter {
  expression(ctx: ExpressionCtx, params: any) {
    return this.visitSingle(ctx, params);
  }

  lambdaExpression(
    ctx: LambdaExpressionCtx,
    params?: {
      lambdaParametersGroupId: symbol;
      isInsideMethodInvocationSuffix: boolean;
    }
  ) {
    const lambdaParameters = group(
      this.visit(ctx.lambdaParameters, params),
      params ? { id: params.lambdaParametersGroupId } : undefined
    );
    const lambdaBody = this.visit(ctx.lambdaBody);

    const isLambdaBodyABlock = ctx.lambdaBody[0].children.block !== undefined;
    if (isLambdaBodyABlock) {
      return rejectAndJoin(" ", [
        lambdaParameters,
        ctx.Arrow[0],
        params?.lambdaParametersGroupId !== undefined
          ? indentIfBreak(lambdaBody, {
              groupId: params.lambdaParametersGroupId
            })
          : lambdaBody
      ]);
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

  lambdaParameters(
    ctx: LambdaParametersCtx,
    params?: { isInsideMethodInvocationSuffix: boolean }
  ) {
    if (ctx.lambdaParametersWithBraces) {
      return this.visitSingle(ctx, params);
    }

    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  lambdaParametersWithBraces(
    ctx: LambdaParametersWithBracesCtx,
    params?: { isInsideMethodInvocationSuffix: boolean }
  ) {
    const lambdaParameterList = this.visit(ctx.lambdaParameterList);

    if (findDeepElementInPartsArray(lambdaParameterList, ",")) {
      const content = putIntoBraces(
        lambdaParameterList,
        softline,
        ctx.LBrace[0],
        ctx.RBrace[0]
      );
      if (params?.isInsideMethodInvocationSuffix === true) {
        return indent(concat([softline, content]));
      }

      return content;
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

  lambdaParameterList(ctx: LambdaParameterListCtx) {
    return this.visitSingle(ctx);
  }

  inferredLambdaParameterList(ctx: InferredLambdaParameterListCtx) {
    const commas = ctx.Comma
      ? ctx.Comma.map(elt => {
          return concat([elt, line]);
        })
      : [];

    return rejectAndJoinSeps(commas, ctx.Identifier);
  }

  explicitLambdaParameterList(ctx: ExplicitLambdaParameterListCtx) {
    const lambdaParameter = this.mapVisit(ctx.lambdaParameter);
    const commas = ctx.Comma
      ? ctx.Comma.map(elt => {
          return concat([elt, line]);
        })
      : [];
    return rejectAndJoinSeps(commas, lambdaParameter);
  }

  lambdaParameter(ctx: LambdaParameterCtx) {
    return this.visitSingle(ctx);
  }

  regularLambdaParameter(ctx: RegularLambdaParameterCtx) {
    const variableModifier = this.mapVisit(ctx.variableModifier);
    const lambdaParameterType = this.visit(ctx.lambdaParameterType);
    const variableDeclaratorId = this.visit(ctx.variableDeclaratorId);

    return rejectAndJoin(" ", [
      rejectAndJoin(" ", variableModifier),
      lambdaParameterType,
      variableDeclaratorId
    ]);
  }

  lambdaParameterType(ctx: LambdaParameterTypeCtx) {
    if (ctx.unannType) {
      return this.visitSingle(ctx);
    }
    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  lambdaBody(ctx: LambdaBodyCtx) {
    return this.visitSingle(ctx);
  }

  ternaryExpression(ctx: TernaryExpressionCtx, params: any) {
    const binaryExpression = this.visit(ctx.binaryExpression, params);
    if (ctx.QuestionMark) {
      const expression1 = this.visit(ctx.expression![0]);
      const expression2 = this.visit(ctx.expression![1]);

      return indent(
        group(
          rejectAndConcat([
            rejectAndJoin(line, [
              binaryExpression,
              rejectAndJoin(" ", [ctx.QuestionMark[0], expression1]),
              rejectAndJoin(" ", [ctx.Colon![0], expression2])
            ])
          ])
        )
      );
    }
    return binaryExpression;
  }

  binaryExpression(
    ctx: BinaryExpressionCtx,
    params?: { addParenthesisToWrapStatement?: boolean }
  ) {
    handleCommentsBinaryExpression(ctx);

    const sortedNodes = sortNodes([
      ctx.pattern,
      ctx.referenceType,
      ctx.expression,
      ctx.unaryExpression
    ]);

    const nodes = this.mapVisit(
      sortedNodes,
      sortedNodes.length === 1 ? params : undefined
    );
    const tokens = sortTokens([
      ctx.Instanceof,
      ctx.AssignmentOperator,
      ctx.Less,
      ctx.Greater,
      ctx.BinaryOperator
    ]);
    const hasTokens = tokens.length > 0;

    const content = binary(nodes, tokens, true);

    return hasTokens && params?.addParenthesisToWrapStatement
      ? group(
          concat([
            ifBreak("("),
            indent(concat([softline, content])),
            softline,
            ifBreak(")")
          ])
        )
      : content;
  }

  unaryExpression(
    ctx: UnaryExpressionCtx,
    params?: { addParenthesisToWrapStatement?: boolean }
  ) {
    const unaryPrefixOperator = ctx.UnaryPrefixOperator
      ? ctx.UnaryPrefixOperator
      : [];
    const primary = this.visit(ctx.primary, params);
    const unarySuffixOperator = ctx.UnarySuffixOperator
      ? ctx.UnarySuffixOperator
      : [];
    return rejectAndConcat([
      rejectAndConcat(unaryPrefixOperator),
      primary,
      rejectAndConcat(unarySuffixOperator)
    ]);
  }

  unaryExpressionNotPlusMinus(ctx: UnaryExpressionNotPlusMinusCtx) {
    const unaryPrefixOperatorNotPlusMinus = ctx.UnaryPrefixOperatorNotPlusMinus // changed when moved to TS
      ? rejectAndJoin(" ", ctx.UnaryPrefixOperatorNotPlusMinus) // changed when moved to TS
      : "";

    const primary = this.visit(ctx.primary);
    const unarySuffixOperator = ctx.UnarySuffixOperator // changed when moved to TS
      ? rejectAndJoin(" ", ctx.UnarySuffixOperator) // changed when moved to TS
      : "";

    return rejectAndJoin(" ", [
      unaryPrefixOperatorNotPlusMinus,
      primary,
      unarySuffixOperator
    ]);
  }

  primary(
    ctx: PrimaryCtx,
    params?: { addParenthesisToWrapStatement?: boolean }
  ) {
    const countMethodInvocation = isUniqueMethodInvocation(ctx.primarySuffix);

    const primaryPrefix = this.visit(ctx.primaryPrefix, {
      ...params,
      shouldBreakBeforeFirstMethodInvocation: countMethodInvocation > 1
    });

    const suffixes = [];

    if (ctx.primarySuffix !== undefined) {
      // edge case: https://github.com/jhipster/prettier-java/issues/381
      let hasFirstInvocationArg = true;

      if (
        ctx.primarySuffix.length > 1 &&
        ctx.primarySuffix[1].children.methodInvocationSuffix &&
        Object.keys(
          ctx.primarySuffix[1].children.methodInvocationSuffix[0].children
        ).length === 2
      ) {
        hasFirstInvocationArg = false;
      }

      if (
        ctx.primarySuffix[0].children.Dot !== undefined &&
        ctx.primaryPrefix[0].children.newExpression !== undefined
      ) {
        suffixes.push(softline);
      }
      suffixes.push(
        this.visit(ctx.primarySuffix[0], {
          shouldDedent:
            // dedent when simple method invocation
            countMethodInvocation !== 1 &&
            // dedent when (chain) method invocation
            ctx.primaryPrefix[0] &&
            ctx.primaryPrefix[0].children.fqnOrRefType &&
            !(
              ctx.primaryPrefix[0].children.fqnOrRefType[0].children.Dot !==
              undefined
            ) &&
            // indent when lambdaExpression
            ctx.primarySuffix[0].children.methodInvocationSuffix &&
            ctx.primarySuffix[0].children.methodInvocationSuffix[0].children
              .argumentList &&
            ctx.primarySuffix[0].children.methodInvocationSuffix[0].children
              .argumentList[0].children.expression &&
            ctx.primarySuffix[0].children.methodInvocationSuffix[0].children
              .argumentList[0].children.expression[0].children
              .lambdaExpression === undefined
        })
      );

      for (let i = 1; i < ctx.primarySuffix.length; i++) {
        if (
          ctx.primarySuffix[i].children.Dot !== undefined &&
          ctx.primarySuffix[i - 1].children.methodInvocationSuffix !== undefined
        ) {
          suffixes.push(softline);
        }
        suffixes.push(this.visit(ctx.primarySuffix[i]));
      }

      if (
        countMethodInvocation === 1 &&
        ctx.primaryPrefix[0].children.newExpression === undefined
      ) {
        return group(
          rejectAndConcat([
            primaryPrefix,
            hasFirstInvocationArg ? suffixes[0] : indent(suffixes[0]),
            indent(rejectAndConcat(suffixes.slice(1)))
          ])
        );
      }
    }

    return group(
      rejectAndConcat([primaryPrefix, indent(rejectAndConcat(suffixes))])
    );
  }

  primaryPrefix(ctx: PrimaryPrefixCtx, params: any) {
    if (ctx.This || ctx.Void) {
      return printTokenWithComments(this.getSingle(ctx) as IToken);
    }

    return this.visitSingle(ctx, params);
  }

  primarySuffix(ctx: PrimarySuffixCtx, params: any) {
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
    return this.visitSingle(ctx, params);
  }

  fqnOrRefType(ctx: FqnOrRefTypeCtx, params: any) {
    const fqnOrRefTypePartFirst = this.visit(ctx.fqnOrRefTypePartFirst);
    const fqnOrRefTypePartRest = this.mapVisit(ctx.fqnOrRefTypePartRest);
    const dims = this.visit(ctx.dims);
    const dots = ctx.Dot ? ctx.Dot : [];
    const isMethodInvocation = ctx.Dot && ctx.Dot.length === 1;

    if (
      params !== undefined &&
      params.shouldBreakBeforeFirstMethodInvocation === true
    ) {
      // when fqnOrRefType is a method call from an object
      if (isMethodInvocation) {
        return rejectAndConcat([
          indent(
            rejectAndJoin(concat([softline, dots[0]]), [
              fqnOrRefTypePartFirst,
              rejectAndJoinSeps(dots.slice(1), fqnOrRefTypePartRest),
              dims
            ])
          )
        ]);
        // otherwise it is a fully qualified name but we need to exclude when it is just a method call
      } else if (ctx.Dot) {
        return indent(
          rejectAndConcat([
            rejectAndJoinSeps(dots.slice(0, dots.length - 1), [
              fqnOrRefTypePartFirst,
              ...fqnOrRefTypePartRest.slice(0, fqnOrRefTypePartRest.length - 1)
            ]),
            softline,
            rejectAndConcat([
              dots[dots.length - 1],
              fqnOrRefTypePartRest[fqnOrRefTypePartRest.length - 1]
            ]),
            dims
          ])
        );
      }
    }

    return rejectAndConcat([
      rejectAndJoinSeps(dots, [fqnOrRefTypePartFirst, ...fqnOrRefTypePartRest]),
      dims
    ]);
  }

  fqnOrRefTypePartFirst(ctx: FqnOrRefTypePartFirstCtx) {
    const annotation = this.mapVisit(ctx.annotation);
    const fqnOrRefTypeCommon = this.visit(ctx.fqnOrRefTypePartCommon);

    return rejectAndJoin(" ", [
      rejectAndJoin(" ", annotation),
      fqnOrRefTypeCommon
    ]);
  }

  fqnOrRefTypePartRest(ctx: FqnOrRefTypePartRestCtx) {
    const annotation = this.mapVisit(ctx.annotation);
    const fqnOrRefTypeCommon = this.visit(ctx.fqnOrRefTypePartCommon);

    const typeArguments = this.visit(ctx.typeArguments);

    return rejectAndJoin(" ", [
      rejectAndJoin(" ", annotation),
      rejectAndConcat([typeArguments, fqnOrRefTypeCommon])
    ]);
  }

  fqnOrRefTypePartCommon(ctx: FqnOrRefTypePartCommonCtx) {
    let keyWord = null;
    if (ctx.Identifier) {
      keyWord = ctx.Identifier[0];
    } else {
      keyWord = ctx.Super![0];
    }

    const typeArguments = this.visit(ctx.typeArguments);

    return rejectAndConcat([keyWord, typeArguments]);
  }

  parenthesisExpression(
    ctx: ParenthesisExpressionCtx,
    params?: { addParenthesisToWrapStatement?: boolean }
  ) {
    const expression = this.visit(ctx.expression);
    const separator = params?.addParenthesisToWrapStatement ? softline : "";
    return putIntoBraces(expression, separator, ctx.LBrace[0], ctx.RBrace[0]);
  }

  castExpression(ctx: CastExpressionCtx) {
    return this.visitSingle(ctx);
  }

  primitiveCastExpression(ctx: PrimitiveCastExpressionCtx) {
    const primitiveType = this.visit(ctx.primitiveType);
    const unaryExpression = this.visit(ctx.unaryExpression);
    return rejectAndJoin(" ", [
      rejectAndConcat([ctx.LBrace[0], primitiveType, ctx.RBrace[0]]),
      unaryExpression
    ]);
  }

  referenceTypeCastExpression(ctx: ReferenceTypeCastExpressionCtx) {
    const referenceType = this.visit(ctx.referenceType);
    const hasAdditionalBounds = ctx.additionalBound !== undefined;
    const additionalBounds = rejectAndJoin(
      line,
      this.mapVisit(ctx.additionalBound)
    );

    const expression = ctx.lambdaExpression
      ? this.visit(ctx.lambdaExpression)
      : this.visit(ctx.unaryExpressionNotPlusMinus);

    return rejectAndJoin(" ", [
      putIntoBraces(
        rejectAndJoin(line, [referenceType, additionalBounds]),
        hasAdditionalBounds ? softline : "",
        ctx.LBrace[0],
        ctx.RBrace[0]
      ),
      expression
    ]);
  }

  newExpression(ctx: NewExpressionCtx) {
    return this.visitSingle(ctx);
  }

  unqualifiedClassInstanceCreationExpression(
    ctx: UnqualifiedClassInstanceCreationExpressionCtx
  ) {
    const typeArguments = this.visit(ctx.typeArguments);
    const classOrInterfaceTypeToInstantiate = this.visit(
      ctx.classOrInterfaceTypeToInstantiate
    );

    let content = printArgumentListWithBraces.call(
      this,
      ctx.argumentList,
      ctx.RBrace[0],
      ctx.LBrace[0]
    );

    const classBody = this.visit(ctx.classBody);

    return rejectAndJoin(" ", [
      ctx.New[0],
      rejectAndConcat([
        typeArguments,
        classOrInterfaceTypeToInstantiate,
        content
      ]),
      classBody
    ]);
  }

  classOrInterfaceTypeToInstantiate(ctx: ClassOrInterfaceTypeToInstantiateCtx) {
    const tokens = sortAnnotationIdentifier(ctx.annotation, ctx.Identifier);

    const segments: any[] = [];
    let currentSegment: any[] = [];

    forEach(tokens, token => {
      if (isAnnotationCstNode(token)) {
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

  typeArgumentsOrDiamond(ctx: TypeArgumentsOrDiamondCtx) {
    return this.visitSingle(ctx);
  }

  diamond(ctx: DiamondCtx) {
    return concat([ctx.Less[0], ctx.Greater[0]]);
  }

  methodInvocationSuffix(ctx: MethodInvocationSuffixCtx, params: any) {
    const isSingleLambda = isArgumentListSingleLambda(ctx.argumentList);
    if (isSingleLambda) {
      return printSingleLambdaInvocation.call(
        this,
        ctx.argumentList,
        ctx.RBrace[0],
        ctx.LBrace[0]
      );
    }

    const argumentList = this.visit(ctx.argumentList);

    if (params && params.shouldDedent) {
      return dedent(
        putIntoBraces(argumentList, softline, ctx.LBrace[0], ctx.RBrace[0])
      );
    }

    return putIntoBraces(argumentList, softline, ctx.LBrace[0], ctx.RBrace[0]);
  }

  argumentList(
    ctx: ArgumentListCtx,
    params?: {
      lambdaParametersGroupId: symbol;
      isInsideMethodInvocationSuffix: boolean;
    }
  ) {
    const expressions = this.mapVisit(ctx.expression, params);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, line])) : [];
    return rejectAndJoinSeps(commas, expressions);
  }

  arrayCreationExpression(ctx: ArrayCreationExpressionCtx) {
    const type = ctx.primitiveType
      ? this.visit(ctx.primitiveType)
      : this.visit(ctx.classOrInterfaceType);
    const suffix = ctx.arrayCreationDefaultInitSuffix
      ? this.visit(ctx.arrayCreationDefaultInitSuffix)
      : this.visit(ctx.arrayCreationExplicitInitSuffix);

    return rejectAndConcat([concat([ctx.New[0], " "]), type, suffix]);
  }

  arrayCreationDefaultInitSuffix(ctx: ArrayCreationDefaultInitSuffixCtx) {
    const dimExprs = this.visit(ctx.dimExprs);
    const dims = this.visit(ctx.dims);
    return rejectAndConcat([dimExprs, dims]);
  }

  arrayCreationExplicitInitSuffix(ctx: ArrayCreationExplicitInitSuffixCtx) {
    const dims = this.visit(ctx.dims);
    const arrayInitializer = this.visit(ctx.arrayInitializer);

    return rejectAndJoin(" ", [dims, arrayInitializer]);
  }

  dimExprs(ctx: DimExprsCtx) {
    const dimExpr = this.mapVisit(ctx.dimExpr);
    return rejectAndConcat(dimExpr);
  }

  dimExpr(ctx: DimExprCtx) {
    const annotations = this.mapVisit(ctx.annotation);
    const expression = this.visit(ctx.expression);

    return rejectAndJoin(" ", [
      rejectAndJoin(" ", annotations),
      rejectAndConcat([ctx.LSquare[0], expression, ctx.RSquare[0]])
    ]);
  }

  classLiteralSuffix(ctx: ClassLiteralSuffixCtx) {
    const squares = [];
    if (ctx.LSquare) {
      for (let i = 0; i < ctx.LSquare.length; i++) {
        squares.push(concat([ctx.LSquare[i], ctx.RSquare![i]]));
      }
    }
    return rejectAndConcat([...squares, ctx.Dot[0], ctx.Class[0]]);
  }

  arrayAccessSuffix(ctx: ArrayAccessSuffixCtx) {
    const expression = this.visit(ctx.expression);
    return rejectAndConcat([ctx.LSquare[0], expression, ctx.RSquare[0]]);
  }

  methodReferenceSuffix(ctx: MethodReferenceSuffixCtx) {
    const typeArguments = this.visit(ctx.typeArguments);
    const identifierOrNew = ctx.New ? ctx.New[0] : ctx.Identifier![0];
    return rejectAndConcat([ctx.ColonColon[0], typeArguments, identifierOrNew]);
  }

  pattern(ctx: PatternCtx) {
    return this.visitSingle(ctx);
  }

  typePattern(ctx: TypePatternCtx) {
    return this.visitSingle(ctx);
  }

  recordPattern(ctx: RecordPatternCtx) {
    const referenceType = this.visit(ctx.referenceType);
    const componentPatternList = this.visit(ctx.componentPatternList);
    return concat([
      referenceType,
      putIntoBraces(
        componentPatternList,
        softline,
        ctx.LBrace[0],
        ctx.RBrace[0]
      )
    ]);
  }

  componentPatternList(ctx: ComponentPatternListCtx) {
    const componentPatterns = this.mapVisit(ctx.componentPattern);
    const commas = ctx.Comma?.map(elt => concat([elt, line])) ?? [];
    return rejectAndJoinSeps(commas, componentPatterns);
  }

  componentPattern(ctx: ComponentPatternCtx) {
    return this.visitSingle(ctx);
  }

  unnamedPattern(ctx: UnnamedPatternCtx) {
    return printTokenWithComments(ctx.Underscore[0]);
  }

  guard(ctx: GuardCtx) {
    const expression = this.visit(ctx.expression, {
      addParenthesisToWrapStatement: true
    });

    return concat([ctx.When[0], " ", expression]);
  }

  isRefTypeInMethodRef() {
    return "isRefTypeInMethodRef";
  }
}
