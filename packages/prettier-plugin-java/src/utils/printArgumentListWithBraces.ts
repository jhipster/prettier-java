import type { ArgumentListCstNode, ArgumentListCtx, IToken } from "java-parser";
import { builders, utils } from "prettier/doc";
import { dedent } from "../printers/prettier-builder.js";
import { putIntoBraces } from "../printers/printer-utils.js";

const { breakParent, conditionalGroup, softline } = builders;
const { willBreak } = utils;

export default function printArgumentListWithBraces(
  argumentListNodes: ArgumentListCstNode[] | undefined,
  rBrace: IToken,
  lBrace: IToken
) {
  if (
    argumentListNodes &&
    !argumentListNodes[0].leadingComments &&
    !rBrace.leadingComments &&
    isArgumentListHuggable(argumentListNodes[0].children)
  ) {
    const [flat, hugged, expanded] = [{ flat: true }, { hugged: true }, {}].map(
      params => {
        const argumentList = this.visit(argumentListNodes, params);
        const flat = params.flat || params.hugged;
        const separator = flat ? "" : softline;
        return putIntoBraces(
          flat ? dedent(argumentList) : argumentList,
          separator,
          lBrace,
          rBrace
        );
      }
    );
    const alternatives = conditionalGroup([flat, hugged, expanded]);
    return willBreak(flat) ? [breakParent, alternatives] : alternatives;
  }

  const argumentList = this.visit(argumentListNodes);
  return putIntoBraces(argumentList, softline, lBrace, rBrace);
}

function isArgumentListHuggable(argumentList: ArgumentListCtx) {
  const expressions = argumentList.expression;
  const lastArgumentLambdaBodyExpression =
    expressions.at(-1)?.children.lambdaExpression?.[0].children.lambdaBody[0]
      .children.expression?.[0].children;
  const lastArgumentLambdaBodyTernaryExpression =
    lastArgumentLambdaBodyExpression?.ternaryExpression?.[0].children;
  return (
    (!lastArgumentLambdaBodyExpression ||
      lastArgumentLambdaBodyTernaryExpression?.QuestionMark !== undefined ||
      lastArgumentLambdaBodyTernaryExpression?.binaryExpression[0].children
        .unaryExpression.length === 1) &&
    expressions.findIndex(({ children }) => children.lambdaExpression) ===
      expressions.length - 1
  );
}
