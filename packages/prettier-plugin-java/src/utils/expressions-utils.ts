import { ArgumentListCstNode } from "java-parser";

export function isArgumentListSingleLambda(
  argumentList: ArgumentListCstNode[] | undefined
) {
  if (argumentList === undefined) {
    return false;
  }

  const args = argumentList[0].children.expression;
  if (args.length !== 1) {
    return false;
  }

  const argument = args[0];
  return argument.children.lambdaExpression !== undefined;
}

export const isSingleArgumentLambdaExpressionWithBlock = (
  argumentList: ArgumentListCstNode[] | undefined
) => {
  if (argumentList === undefined) {
    return false;
  }

  const args = argumentList[0].children.expression;
  if (args.length !== 1) {
    return false;
  }

  const argument = args[0];
  return (
    argument.children.lambdaExpression !== undefined &&
    argument.children.lambdaExpression[0].children.lambdaBody[0].children
      .block !== undefined
  );
};
