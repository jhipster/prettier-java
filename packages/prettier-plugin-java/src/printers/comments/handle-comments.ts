import { hasLeadingComments, hasTrailingComments } from "./comments-utils";
import {
  BasicForStatementCtx,
  BinaryExpressionCtx,
  CatchClauseCtx,
  DoStatementCtx,
  EnhancedForStatementCtx,
  IToken,
  IfStatementCtx,
  StatementWithoutTrailingSubstatementCtx,
  SwitchStatementCtx,
  UnaryExpressionCstNode,
  WhileStatementCtx
} from "java-parser";

export function handleCommentsBasicForStatement(ctx: BasicForStatementCtx) {
  const comments = removeRBraceTrailingAndEmptyStatementLeadingComments(ctx);
  if (!comments.length) {
    return;
  }
  const target = ctx.forUpdate?.[0] ?? ctx.expression?.[0] ?? ctx.forInit?.[0];
  if (target) {
    if (!target.trailingComments) {
      target.trailingComments = [];
    }
    target.trailingComments.push(...comments);
  } else {
    if (!ctx.For[0].leadingComments) {
      ctx.For[0].leadingComments = [];
    }
    ctx.For[0].leadingComments.push(...comments);
  }
}

export function handleCommentsBinaryExpression(ctx: BinaryExpressionCtx) {
  moveOperatorLeadingCommentsToNextExpression(ctx);
  moveExpressionTrailingCommentsToNextOperator(ctx);
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
          unaryExpression.location.startLine;

        if (unaryExpression.location.startLine !== binaryOperator.startLine) {
          unaryExpression.trailingComments.forEach(comment => {
            comment.startLine += 1;
            comment.endLine += 1;
          });
        }
        unaryExpression.location.startLine += shiftUp;
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

export function handleCommentsCatchClauseOrSwitchStatement(
  ctx: CatchClauseCtx | SwitchStatementCtx
) {
  const comments = removeRBraceTrailingComments(ctx);
  if (!comments.length) {
    return;
  }
  const parenthesesContents =
    "expression" in ctx ? ctx.expression[0] : ctx.catchFormalParameter[0];
  if (!parenthesesContents.trailingComments) {
    parenthesesContents.trailingComments = [];
  }
  parenthesesContents.trailingComments.push(...comments);
}

export function handleCommentsDoStatement(ctx: DoStatementCtx) {
  const comments = removeRBraceTrailingComments(ctx);
  const semicolon = ctx.Semicolon[0];
  if (semicolon.leadingComments) {
    comments.push(...semicolon.leadingComments);
    delete semicolon.leadingComments;
  }
  if (!comments.length) {
    return;
  }
  const expression = ctx.expression[0];
  if (!expression.trailingComments) {
    expression.trailingComments = [];
  }
  expression.trailingComments.push(...comments);
}

export function handleCommentsEnhancedForOrIfOrWhileStatement(
  ctx: EnhancedForStatementCtx | IfStatementCtx | WhileStatementCtx
) {
  const comments = removeRBraceTrailingAndEmptyStatementLeadingComments(ctx);
  if (!comments.length) {
    return;
  }
  const statement =
    ctx.statement[0].children.statementWithoutTrailingSubstatement?.[0]
      .children;
  if (statement?.emptyStatement) {
    const expression = ctx.expression[0];
    if (!expression.trailingComments) {
      expression.trailingComments = [];
    }
    expression.trailingComments.push(...comments);
    return;
  }
  const inner = statement ? innerStatement(statement) : undefined;
  const block = statement?.block?.[0].children.blockStatements?.[0];
  const rCurly = statement?.block?.[0].children.RCurly[0];
  const target =
    inner ??
    block ??
    rCurly ??
    ("For" in ctx ? ctx.For : "If" in ctx ? ctx.If : ctx.While)[0];
  if (block) {
    block.location.startLine--;
  }
  if (!target.leadingComments) {
    target.leadingComments = [];
  }
  target.leadingComments.unshift(...comments);
}

function innerStatement(statement: StatementWithoutTrailingSubstatementCtx) {
  return [
    statement.assertStatement,
    statement.breakStatement,
    statement.continueStatement,
    statement.doStatement,
    statement.expressionStatement,
    statement.expressionStatement,
    statement.returnStatement,
    statement.switchStatement,
    statement.synchronizedStatement,
    statement.throwStatement,
    statement.tryStatement,
    statement.yieldStatement
  ].find(s => s)?.[0];
}

function removeRBraceTrailingAndEmptyStatementLeadingComments(
  ctx:
    | BasicForStatementCtx
    | EnhancedForStatementCtx
    | IfStatementCtx
    | WhileStatementCtx
) {
  const comments = removeRBraceTrailingComments(ctx);
  const statement = ctx.statement[0];
  if (
    statement?.children.statementWithoutTrailingSubstatement?.[0].children
      .emptyStatement?.[0] &&
    statement.leadingComments
  ) {
    comments.push(...statement.leadingComments);
    delete statement.leadingComments;
  }
  return comments;
}

function removeRBraceTrailingComments(
  ctx:
    | BasicForStatementCtx
    | CatchClauseCtx
    | DoStatementCtx
    | EnhancedForStatementCtx
    | IfStatementCtx
    | SwitchStatementCtx
    | WhileStatementCtx
) {
  const rBrace = ctx.RBrace[0];
  if (!rBrace.trailingComments) {
    return [];
  }
  const comments = rBrace.trailingComments;
  delete rBrace.trailingComments;
  return comments;
}
