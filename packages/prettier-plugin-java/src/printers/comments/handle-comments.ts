import { hasLeadingComments, hasTrailingComments } from "./comments-utils.js";
import {
  BinaryExpressionCtx,
  CstNode,
  IToken,
  UnaryExpressionCstNode
} from "java-parser";

export function handleCommentsBinaryExpression(ctx: BinaryExpressionCtx) {
  moveOperatorLeadingCommentsToNextExpression(ctx);
  moveExpressionTrailingCommentsToNextOperator(ctx);
}

export function handleCommentsParameters(
  lBrace: IToken,
  parameters: CstNode[] | IToken[],
  rBrace: IToken
) {
  const lBraceTrailingComments = lBrace.trailingComments;
  const firstParameter = parameters.at(0);
  if (lBraceTrailingComments && firstParameter) {
    delete lBrace.trailingComments;
    firstParameter.leadingComments = [
      ...lBraceTrailingComments,
      ...(firstParameter.leadingComments ?? [])
    ];
  }
  const lastParameter = parameters.at(-1);
  const rBraceLeadingComments = rBrace.leadingComments;
  if (rBraceLeadingComments) {
    delete rBrace.leadingComments;
    if (lastParameter) {
      lastParameter.trailingComments = [
        ...(lastParameter.trailingComments ?? []),
        ...rBraceLeadingComments
      ];
    } else {
      lBrace.trailingComments = [
        ...(lBrace.trailingComments ?? []),
        ...rBraceLeadingComments
      ];
    }
  }
}

function moveOperatorLeadingCommentsToNextExpression(ctx: BinaryExpressionCtx) {
  let unaryExpressionIndex = 1;
  ctx.BinaryOperator?.forEach(binaryOperator => {
    if (hasLeadingComments(binaryOperator)) {
      while (
        ctx.unaryExpression[unaryExpressionIndex].location.startOffset <
        binaryOperator.endOffset
      ) {
        unaryExpressionIndex++;
      }

      // Adapt the position of the operator and its leading comments
      const shiftUp =
        binaryOperator.leadingComments[0].startLine -
        1 -
        binaryOperator.startLine;

      if (
        binaryOperator.startLine !==
        ctx.unaryExpression[unaryExpressionIndex].location.startLine
      ) {
        binaryOperator.leadingComments.forEach(comment => {
          comment.startLine += 1;
          comment.endLine += 1;
        });
      }
      binaryOperator.startLine += shiftUp;
      binaryOperator.endLine += shiftUp;

      // Move binaryOperator's leading comments to the following
      // unaryExpression
      ctx.unaryExpression[unaryExpressionIndex].leadingComments =
        ctx.unaryExpression[unaryExpressionIndex].leadingComments || [];
      ctx.unaryExpression[unaryExpressionIndex].leadingComments!.unshift(
        ...binaryOperator.leadingComments
      );
      delete (binaryOperator as IToken).leadingComments;
    }
  });
}

function moveExpressionTrailingCommentsToNextOperator(
  ctx: BinaryExpressionCtx
) {
  const binaryOperators = ctx.BinaryOperator;
  let binaryOperatorIndex = 1;
  if (binaryOperators?.length) {
    ctx.unaryExpression.forEach(unaryExpression => {
      if (hasTrailingComments(unaryExpression)) {
        while (
          binaryOperatorIndex < binaryOperators.length &&
          unaryExpression.location.endOffset &&
          binaryOperators[binaryOperatorIndex].startOffset <
            unaryExpression.location.endOffset
        ) {
          binaryOperatorIndex++;
        }
        const binaryOperator = binaryOperators[binaryOperatorIndex];

        // Adapt the position of the expression and its trailing comments
        const shiftUp =
          unaryExpression.trailingComments[0].startLine -
          1 -
          unaryExpression.location.startLine!;

        if (unaryExpression.location.startLine !== binaryOperator.startLine) {
          unaryExpression.trailingComments.forEach(comment => {
            comment.startLine += 1;
            comment.endLine += 1;
          });
        }
        unaryExpression.location.startLine! += shiftUp;
        if (unaryExpression.location.endLine !== undefined) {
          unaryExpression.location.endLine += shiftUp;
        }

        // Move unaryExpression's trailing comments to the following
        // binaryOperator
        binaryOperator.trailingComments = binaryOperator.trailingComments ?? [];
        binaryOperator.trailingComments.unshift(
          ...unaryExpression.trailingComments
        );
        delete (unaryExpression as UnaryExpressionCstNode).trailingComments;
      }
    });
  }
}
