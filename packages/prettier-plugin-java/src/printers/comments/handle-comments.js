"use strict";

const { hasLeadingComments } = require("./comments-utils");

function handleCommentsBinaryExpression(ctx) {
  let unaryExpressionIndex = 1;
  if (ctx.BinaryOperator !== undefined) {
    ctx.BinaryOperator.forEach(binaryOperator => {
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
          ctx.BinaryOperator.startLine;

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

        // Assign the leading comments & trailing comments of the binaryOperator
        // to the following unaryExpression as leading comments
        ctx.unaryExpression[unaryExpressionIndex].leadingComments =
          ctx.unaryExpression[unaryExpressionIndex].leadingComments || [];
        ctx.unaryExpression[unaryExpressionIndex].leadingComments.unshift(
          ...binaryOperator.leadingComments
        );
        delete binaryOperator.leadingComments;
      }
    });
  }
}

module.exports = {
  handleCommentsBinaryExpression
};
