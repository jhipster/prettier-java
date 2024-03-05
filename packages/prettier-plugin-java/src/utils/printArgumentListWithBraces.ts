import type { ArgumentListCstNode, ArgumentListCtx, IToken } from "java-parser";
import { builders } from "prettier/doc";
import { handleCommentsParameters } from "../printers/comments/handle-comments.js";
import { indent } from "../printers/prettier-builder.js";
import { rejectAndConcat } from "../printers/printer-utils.js";

const { lineSuffixBoundary, softline } = builders;

export default function printArgumentListWithBraces(
  argumentListNodes: ArgumentListCstNode[] | undefined,
  rBrace: IToken,
  lBrace: IToken
) {
  const argumentListNode = argumentListNodes?.[0];
  const expressions = argumentListNode?.children.expression ?? [];
  if (argumentListNode) {
    const { leadingComments, trailingComments } = argumentListNode;
    delete argumentListNode.leadingComments;
    delete argumentListNode.trailingComments;
    if (leadingComments) {
      const firstExpression = expressions[0];
      firstExpression.leadingComments = [
        ...leadingComments,
        ...(firstExpression.leadingComments ?? [])
      ];
    }
    if (trailingComments) {
      const lastExpression = expressions.at(-1)!;
      lastExpression.trailingComments = [
        ...(lastExpression.trailingComments ?? []),
        ...trailingComments
      ];
    }
  }
  handleCommentsParameters(lBrace, expressions, rBrace);

  const argumentList = this.visit(argumentListNodes);
  const contents = argumentList
    ? [argumentList]
    : lBrace.trailingComments
      ? [softline, lineSuffixBoundary]
      : [];
  return rejectAndConcat([indent(lBrace), ...contents, rBrace]);
}
