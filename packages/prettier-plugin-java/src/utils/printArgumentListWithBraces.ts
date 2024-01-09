import { ArgumentListCstNode, IToken } from "java-parser";
import { builders, utils } from "prettier/doc";
import { isArgumentListHuggable } from "./expressions-utils.js";
import { putIntoBraces } from "../printers/printer-utils.js";

const { breakParent, conditionalGroup, softline } = builders;
const { willBreak } = utils;

export default function printArgumentListWithBraces(
  argumentListNodes: ArgumentListCstNode[] | undefined,
  rBrace: IToken,
  lBrace: IToken
) {
  const argumentListCtx = argumentListNodes?.[0].children;
  if (argumentListCtx && isArgumentListHuggable(argumentListCtx)) {
    const [flat, expanded] = [false, true].map(shouldBreak => {
      const argumentList = this.visit(argumentListNodes, { shouldBreak });
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
