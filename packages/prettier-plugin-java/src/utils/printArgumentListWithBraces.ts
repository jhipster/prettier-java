import { ArgumentListCstNode, IToken } from "java-parser";
import { builders } from "prettier/doc";
import {
  isArgumentListSingleLambda,
  isSingleArgumentLambdaExpressionWithBlock
} from "./expressions-utils";
import { printTokenWithComments } from "../printers/comments/format-comments";
import { concat, dedent, indent } from "../printers/prettier-builder";
import { putIntoBraces } from "../printers/printer-utils";

const { softline, ifBreak } = builders;

export function printArgumentListWithBraces(
  argumentListCtx: ArgumentListCstNode[] | undefined,
  rBrace: IToken,
  lBrace: IToken
) {
  const lambdaParametersGroupId = Symbol("lambdaParameters");
  const argumentList = this.visit(argumentListCtx, {
    lambdaParametersGroupId,
    isInsideMethodInvocationSuffix: true
  });
  const isSingleLambda = isArgumentListSingleLambda(argumentListCtx);

  if (isSingleLambda) {
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

  return putIntoBraces(argumentList, softline, lBrace, rBrace);
}
