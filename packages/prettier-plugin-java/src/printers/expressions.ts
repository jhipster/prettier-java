import {
  ArgumentListCtx,
  ArrayAccessSuffixCtx,
  ArrayCreationExpressionCtx,
  ArrayCreationExpressionWithoutInitializerSuffixCtx,
  ArrayCreationWithInitializerSuffixCtx,
  BinaryExpressionCtx,
  CastExpressionCtx,
  ClassLiteralSuffixCtx,
  ClassOrInterfaceTypeToInstantiateCtx,
  ComponentPatternCtx,
  ComponentPatternListCtx,
  ConciseLambdaParameterCtx,
  ConciseLambdaParameterListCtx,
  ConditionalExpressionCtx,
  DiamondCtx,
  DimExprCtx,
  DimExprsCtx,
  EmbeddedExpressionCtx,
  ExpressionCstNode,
  ExpressionCtx,
  FqnOrRefTypeCtx,
  FqnOrRefTypePartCommonCtx,
  FqnOrRefTypePartFirstCtx,
  FqnOrRefTypePartRestCtx,
  GuardCtx,
  IToken,
  LambdaBodyCtx,
  LambdaExpressionCtx,
  LambdaParameterCtx,
  LambdaParameterListCtx,
  LambdaParametersCtx,
  LambdaParametersWithBracesCtx,
  LambdaParameterTypeCtx,
  MatchAllPatternCtx,
  MethodInvocationSuffixCtx,
  MethodReferenceSuffixCtx,
  NewExpressionCtx,
  NormalLambdaParameterListCtx,
  ParenthesisExpressionCtx,
  PatternCtx,
  PrimaryCtx,
  PrimaryPrefixCtx,
  PrimarySuffixCtx,
  PrimitiveCastExpressionCtx,
  RecordPatternCtx,
  ReferenceTypeCastExpressionCtx,
  RegularLambdaParameterCtx,
  StringTemplateCtx,
  TemplateArgumentCtx,
  TemplateCtx,
  TextBlockTemplateCtx,
  TypeArgumentsOrDiamondCtx,
  TypePatternCtx,
  UnaryExpressionCtx,
  UnaryExpressionNotPlusMinusCtx,
  UnqualifiedClassInstanceCreationExpressionCtx
} from "java-parser/api";

import forEach from "lodash/forEach.js";
import type { Doc } from "prettier";
import { builders, utils } from "prettier/doc";
import { BaseCstPrettierPrinter } from "../base-cst-printer.js";
import { isAnnotationCstNode } from "../types/utils.js";
import { printArgumentListWithBraces } from "../utils/index.js";
import { hasLeadingComments } from "./comments/comments-utils.js";
import { printTokenWithComments } from "./comments/format-comments.js";
import {
  handleCommentsBinaryExpression,
  handleCommentsParameters
} from "./comments/handle-comments.js";
import {
  concat,
  dedent,
  group,
  indent,
  indentIfBreak
} from "./prettier-builder.js";
import {
  binary,
  findDeepElementInPartsArray,
  getOperators,
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

const {
  breakParent,
  conditionalGroup,
  ifBreak,
  label,
  line,
  lineSuffixBoundary,
  softline
} = builders;
const { removeLines, willBreak } = utils;

export class ExpressionsPrettierVisitor extends BaseCstPrettierPrinter {
  expression(ctx: ExpressionCtx, params: any) {
    const expression = this.visitSingle(ctx, params);
    return params?.hug && expression.label !== undefined
      ? label(expression.label, expression)
      : expression;
  }

  lambdaExpression(ctx: LambdaExpressionCtx, params?: { hug?: boolean }) {
    const lambdaParameters = group(this.visit(ctx.lambdaParameters));
    const lambdaBody = this.visit(ctx.lambdaBody);

    const isLambdaBodyABlock = ctx.lambdaBody[0].children.block !== undefined;
    const suffix = [
      " ",
      ctx.Arrow[0],
      ...(isLambdaBodyABlock
        ? [" ", lambdaBody]
        : [group(indent([line, lambdaBody]))])
    ];
    if (params?.hug) {
      return willBreak(lambdaParameters)
        ? label({ huggable: false }, concat([lambdaParameters, ...suffix]))
        : concat([removeLines(lambdaParameters), ...suffix]);
    }
    return concat([lambdaParameters, ...suffix]);
  }

  lambdaParameters(ctx: LambdaParametersCtx) {
    if (ctx.lambdaParametersWithBraces) {
      return this.visitSingle(ctx);
    }

    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  lambdaParametersWithBraces(ctx: LambdaParametersWithBracesCtx) {
    const lambdaParameters =
      ctx.lambdaParameterList?.[0].children.normalLambdaParameterList?.[0]
        .children.normalLambdaParameter ??
      ctx.lambdaParameterList?.[0].children.conciseLambdaParameterList?.[0]
        .children.conciseLambdaParameter ??
      [];
    handleCommentsParameters(ctx.LBrace[0], lambdaParameters, ctx.RBrace[0]);
    const lambdaParameterList = this.visit(ctx.lambdaParameterList);

    if (findDeepElementInPartsArray(lambdaParameterList, ",")) {
      return concat([
        ctx.LBrace[0],
        indent([softline, lambdaParameterList]),
        softline,
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

  lambdaParameterList(ctx: LambdaParameterListCtx) {
    return this.visitSingle(ctx);
  }

  conciseLambdaParameterList(ctx: ConciseLambdaParameterListCtx) {
    const conciseLambdaParameters = this.mapVisit(ctx.conciseLambdaParameter);
    const commas = ctx.Comma?.map(comma => concat([comma, line]));
    return rejectAndJoinSeps(commas, conciseLambdaParameters);
  }

  normalLambdaParameterList(ctx: NormalLambdaParameterListCtx) {
    const normalLambdaParameter = this.mapVisit(ctx.normalLambdaParameter);
    const commas = ctx.Comma?.map(comma => concat([comma, line]));
    return rejectAndJoinSeps(commas, normalLambdaParameter);
  }

  normalLambdaParameter(ctx: LambdaParameterCtx) {
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

  conciseLambdaParameter(ctx: ConciseLambdaParameterCtx) {
    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  lambdaBody(ctx: LambdaBodyCtx) {
    return this.visitSingle(ctx);
  }

  conditionalExpression(ctx: ConditionalExpressionCtx, params: any) {
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
    const tokens = sortTokens(getOperators(ctx));
    const hasTokens = tokens.length > 0;

    const nodeParams = sortedNodes.length === 1 ? params : undefined;
    const nodes: Doc[] = [];
    for (let i = 0; i < sortedNodes.length; i++) {
      const node = this.visit(sortedNodes[i], nodeParams);
      const isAssignment =
        tokens[i]?.tokenType.CATEGORIES?.find(
          ({ name }) => name === "AssignmentOperator"
        ) !== undefined;
      if (!isAssignment) {
        nodes.push(node);
        continue;
      }
      const [equals] = tokens.splice(i, 1);
      const expression = sortedNodes[++i] as ExpressionCstNode;
      const nextNode = this.visit(expression);
      const conditionalExpression =
        expression.children.conditionalExpression?.[0].children;
      const binaryExpression =
        conditionalExpression?.binaryExpression?.[0].children;
      const breakAfterOperator =
        conditionalExpression?.QuestionMark === undefined &&
        binaryExpression !== undefined &&
        getOperators(binaryExpression).length > 0;
      if (breakAfterOperator) {
        nodes.push(
          concat([node, " ", equals, group(indent([line, nextNode]))])
        );
        continue;
      }
      const groupId = Symbol("assignment");
      nodes.push(
        concat([
          node,
          " ",
          equals,
          indent(group(line, { id: groupId })),
          indentIfBreak(nextNode, { groupId })
        ])
      );
    }

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
    const newExpression =
      ctx.primaryPrefix[0].children.newExpression?.[0].children;
    const isBreakableNewExpression =
      countMethodInvocation <= 1 &&
      this.isBreakableNewExpression(newExpression);
    const fqnOrRefType =
      ctx.primaryPrefix[0].children.fqnOrRefType?.[0].children;
    const firstMethodInvocation = ctx.primarySuffix
      ?.map(suffix => suffix.children.methodInvocationSuffix?.[0].children)
      .find(methodInvocationSuffix => methodInvocationSuffix);

    const hasFqnRefPart = fqnOrRefType?.fqnOrRefTypePartRest !== undefined;
    const lastFqnRefPartDot = this.lastDot(fqnOrRefType);
    const isCapitalizedIdentifier =
      !!this.isCapitalizedIdentifier(fqnOrRefType);
    const isCapitalizedIdentifierWithoutTrailingComment =
      isCapitalizedIdentifier &&
      (lastFqnRefPartDot === undefined ||
        !hasLeadingComments(lastFqnRefPartDot));

    const shouldBreakBeforeFirstMethodInvocation =
      countMethodInvocation > 1 &&
      hasFqnRefPart &&
      !isCapitalizedIdentifierWithoutTrailingComment &&
      firstMethodInvocation !== undefined;

    const shouldBreakBeforeMethodInvocations =
      shouldBreakBeforeFirstMethodInvocation ||
      countMethodInvocation > 2 ||
      (countMethodInvocation > 1 && newExpression) ||
      !firstMethodInvocation?.argumentList;

    const primaryPrefix = this.visit(ctx.primaryPrefix, {
      ...params,
      shouldBreakBeforeFirstMethodInvocation
    });

    const suffixes = [];

    if (ctx.primarySuffix !== undefined) {
      if (
        newExpression &&
        !isBreakableNewExpression &&
        ctx.primarySuffix[0].children.Dot !== undefined
      ) {
        suffixes.push(softline);
      }
      suffixes.push(this.visit(ctx.primarySuffix[0]));

      for (let i = 1; i < ctx.primarySuffix.length; i++) {
        if (
          shouldBreakBeforeMethodInvocations &&
          ctx.primarySuffix[i].children.Dot !== undefined &&
          ctx.primarySuffix[i - 1].children.methodInvocationSuffix !== undefined
        ) {
          suffixes.push(softline);
        }
        suffixes.push(this.visit(ctx.primarySuffix[i]));
      }

      if (!newExpression && countMethodInvocation === 1) {
        return group(
          rejectAndConcat([
            primaryPrefix,
            suffixes[0],
            indent(rejectAndConcat(suffixes.slice(1)))
          ])
        );
      }
    }

    const methodInvocation =
      ctx.primarySuffix?.[0].children.methodInvocationSuffix;
    const isMethodInvocationWithArguments =
      methodInvocation?.[0].children.argumentList !== undefined;
    const isUnqualifiedMethodInvocation =
      methodInvocation !== undefined && !fqnOrRefType?.Dot;
    return group(
      rejectAndConcat([
        primaryPrefix,
        isCapitalizedIdentifier || isUnqualifiedMethodInvocation
          ? suffixes.shift()
          : "",
        !isBreakableNewExpression &&
        (shouldBreakBeforeMethodInvocations || !isMethodInvocationWithArguments)
          ? indent(concat(suffixes))
          : concat(suffixes)
      ])
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

      const suffix = this.visit(
        ctx.unqualifiedClassInstanceCreationExpression ?? ctx.templateArgument
      );
      return rejectAndConcat([ctx.Dot[0], suffix]);
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

  methodInvocationSuffix(ctx: MethodInvocationSuffixCtx) {
    return printArgumentListWithBraces.call(
      this,
      ctx.argumentList,
      ctx.RBrace[0],
      ctx.LBrace[0]
    );
  }

  argumentList(ctx: ArgumentListCtx) {
    const headArgs = this.mapVisit(ctx.expression.slice(0, -1)).map(
      (expression, index) => concat([expression, ctx.Comma![index], line])
    );
    const lastExpression = ctx.expression.at(-1);
    const lastArg = this.visit(lastExpression);

    if (this.isArgumentListHuggable(ctx)) {
      const huggedLastArg = this.visit(lastExpression, { hug: true });
      const lastArgNotHuggable =
        typeof huggedLastArg === "object" &&
        !Array.isArray(huggedLastArg) &&
        huggedLastArg.type === "label" &&
        huggedLastArg.label?.huggable === false;

      if (lastArgNotHuggable || headArgs.some(willBreak)) {
        return group([indent([line, ...headArgs, lastArg]), line], {
          shouldBreak: true
        });
      }
      const suffix = lastExpression?.children.lambdaExpression?.[0].children
        .lambdaBody[0].children.block
        ? ""
        : line;
      const hugged = [
        ...headArgs,
        group([huggedLastArg, suffix], { shouldBreak: true })
      ];
      const expanded = group([indent([line, ...headArgs, lastArg]), line], {
        shouldBreak: true
      });

      return willBreak(huggedLastArg)
        ? [breakParent, conditionalGroup([hugged, expanded])]
        : conditionalGroup([[...headArgs, huggedLastArg], hugged, expanded]);
    }

    return group([indent([softline, ...headArgs, lastArg]), softline]);
  }

  arrayCreationExpression(ctx: ArrayCreationExpressionCtx) {
    const type = ctx.primitiveType
      ? this.visit(ctx.primitiveType)
      : this.visit(ctx.classOrInterfaceType);
    const suffix = ctx.arrayCreationExpressionWithoutInitializerSuffix
      ? this.visit(ctx.arrayCreationExpressionWithoutInitializerSuffix)
      : this.visit(ctx.arrayCreationWithInitializerSuffix);

    return rejectAndConcat([concat([ctx.New[0], " "]), type, suffix]);
  }

  arrayCreationExpressionWithoutInitializerSuffix(
    ctx: ArrayCreationExpressionWithoutInitializerSuffixCtx
  ) {
    const dimExprs = this.visit(ctx.dimExprs);
    const dims = this.visit(ctx.dims);
    return rejectAndConcat([dimExprs, dims]);
  }

  arrayCreationWithInitializerSuffix(
    ctx: ArrayCreationWithInitializerSuffixCtx
  ) {
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

  templateArgument(ctx: TemplateArgumentCtx) {
    return ctx.template
      ? this.visit(ctx.template)
      : printTokenWithComments((ctx.StringLiteral ?? ctx.TextBlock)![0]);
  }

  template(ctx: TemplateCtx) {
    return this.visitSingle(ctx);
  }

  stringTemplate(ctx: StringTemplateCtx) {
    const embeddedExpressions = this.mapVisit(ctx.embeddedExpression).flatMap(
      expression =>
        group([softline, expression, lineSuffixBoundary, dedent(softline)])
    );
    return concat([
      ctx.StringTemplateBegin[0],
      rejectAndJoinSeps(ctx.StringTemplateMid, embeddedExpressions),
      ctx.StringTemplateEnd[0]
    ]);
  }

  textBlockTemplate(ctx: TextBlockTemplateCtx) {
    const embeddedExpressions = this.mapVisit(ctx.embeddedExpression).flatMap(
      expression =>
        group([softline, expression, lineSuffixBoundary, dedent(softline)])
    );
    return concat([
      ctx.TextBlockTemplateBegin[0],
      rejectAndJoinSeps(ctx.TextBlockTemplateMid, embeddedExpressions),
      ctx.TextBlockTemplateEnd[0]
    ]);
  }

  embeddedExpression(ctx: EmbeddedExpressionCtx) {
    return this.visit(ctx.expression);
  }

  pattern(ctx: PatternCtx) {
    return this.visitSingle(ctx);
  }

  typePattern(ctx: TypePatternCtx) {
    return this.visitSingle(ctx);
  }

  recordPattern(ctx: RecordPatternCtx) {
    const componentPatterns =
      ctx.componentPatternList?.[0].children.componentPattern ?? [];
    handleCommentsParameters(ctx.LBrace[0], componentPatterns, ctx.RBrace[0]);
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

  matchAllPattern(ctx: MatchAllPatternCtx) {
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

  private isArgumentListHuggable(argumentList: ArgumentListCtx) {
    const expressions = argumentList.expression;
    const lastArgument = expressions.at(-1);
    const lastArgumentLambdaBodyExpression =
      lastArgument?.children.lambdaExpression?.[0].children.lambdaBody[0]
        .children.expression?.[0].children;
    const lastArgumentLambdaBodyTernaryExpression =
      lastArgumentLambdaBodyExpression?.conditionalExpression?.[0].children;
    return (
      !lastArgument?.leadingComments &&
      !lastArgument?.trailingComments &&
      (!lastArgumentLambdaBodyExpression ||
        lastArgumentLambdaBodyTernaryExpression?.QuestionMark !== undefined ||
        lastArgumentLambdaBodyTernaryExpression?.binaryExpression[0].children
          .unaryExpression.length === 1) &&
      expressions.findIndex(({ children }) => children.lambdaExpression) ===
        expressions.length - 1
    );
  }

  private isBreakableNewExpression(newExpression?: NewExpressionCtx) {
    const arrayCreationExpression =
      newExpression?.arrayCreationExpression?.[0].children;
    const classInstanceCreationExpression =
      newExpression?.unqualifiedClassInstanceCreationExpression?.[0].children;
    return [
      arrayCreationExpression?.classOrInterfaceType?.[0].children.classType[0]
        .children.typeArguments,
      arrayCreationExpression?.arrayCreationWithInitializerSuffix?.[0].children
        .arrayInitializer[0].children.variableInitializerList,
      classInstanceCreationExpression?.classOrInterfaceTypeToInstantiate[0]
        .children.typeArgumentsOrDiamond?.[0].children.typeArguments,
      classInstanceCreationExpression?.argumentList
    ].some(breakablePart => breakablePart !== undefined);
  }

  private isCapitalizedIdentifier(fqnOrRefType?: FqnOrRefTypeCtx) {
    const fqnOrRefTypeParts = [
      fqnOrRefType?.fqnOrRefTypePartFirst[0],
      ...(fqnOrRefType?.fqnOrRefTypePartRest ?? [])
    ];
    const nextToLastIdentifier =
      fqnOrRefTypeParts[fqnOrRefTypeParts.length - 2]?.children
        .fqnOrRefTypePartCommon[0].children.Identifier?.[0].image;
    return (
      nextToLastIdentifier &&
      /^\p{Uppercase_Letter}/u.test(nextToLastIdentifier)
    );
  }

  private lastDot(fqnOrRefType: FqnOrRefTypeCtx | undefined) {
    if (fqnOrRefType === undefined || fqnOrRefType.Dot === undefined) {
      return undefined;
    }

    const lastDot = fqnOrRefType.Dot[fqnOrRefType.Dot.length - 1];
    return lastDot;
  }
}
