import type { ArgumentListCstNode, ArgumentListCtx, IToken } from "java-parser";
import { builders, utils } from "prettier/doc";
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
    const [flat, expanded] = [false, true].map(shouldBreak => {
      const argumentList = this.visit(argumentListNodes, {
        isHuggable: true,
        shouldBreak
      });
      return putIntoBraces(argumentList, "", lBrace, rBrace);
    });
    return [
      willBreak(flat) ? breakParent : "",
      conditionalGroup([flat, expanded])
    ];
  }

  const argumentList = this.visit(argumentListNodes);
  return putIntoBraces(argumentList, softline, lBrace, rBrace);
}

function isArgumentListHuggable(argumentList: ArgumentListCtx) {
  const expressions = argumentList.expression;
  return (
    (expressions.length === 1 ||
      expressions[expressions.length - 1].children.lambdaExpression?.[0]
        .children.lambdaBody[0].children.block !== undefined) &&
    expressions.filter(({ children }) => children.lambdaExpression).length === 1
  );
}
