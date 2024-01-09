import { ArgumentListCtx } from "java-parser";

export function isArgumentListHuggable(argumentList: ArgumentListCtx) {
  const expressions = argumentList.expression;
  return (
    expressions.filter(expression => expression.children.lambdaExpression)
      .length === 1 &&
    (expressions.length === 1 ||
      expressions[expressions.length - 1].children.lambdaExpression?.[0]
        .children.lambdaBody[0].children.block !== undefined)
  );
}
