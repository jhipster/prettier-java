import { ArgumentListCstNode, IToken } from "java-parser";
import { builders } from "prettier/doc";
import { isSingleArgumentLambdaExpressionWithBlock } from "./expressions-utils";
import { printTokenWithComments } from "../printers/comments/format-comments";
import { concat, dedent, indent } from "../printers/prettier-builder";
import { putIntoBraces } from "../printers/printer-utils";

const { softline, ifBreak } = builders;

export default function printSingleLambdaInvocation(
  argumentListCtx: ArgumentListCstNode[] | undefined,
  rBrace: IToken,
  lBrace: IToken
) {
  const lambdaParametersGroupId = Symbol("lambdaParameters");
  const argumentList = this.visit(argumentListCtx, {
    lambdaParametersGroupId,
    isInsideMethodInvocationSuffix: true
  });

  const formattedRBrace = isSingleArgumentLambdaExpressionWithBlock(
    argumentListCtx
  )
    ? ifBreak(
        indent(concat([softline, rBrace])),
        printTokenWithComments(rBrace),
        { groupId: lambdaParametersGroupId }
      )
    : indent(concat([softline, rBrace]));
  return dedent(putIntoBraces(argumentList, "", lBrace, formattedRBrace));
}
