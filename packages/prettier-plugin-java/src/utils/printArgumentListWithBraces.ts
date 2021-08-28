import { ArgumentListCstNode, IToken } from "java-parser";
import { builders } from "prettier/doc";
import { isArgumentListSingleLambda } from "./expressions-utils";
import { putIntoBraces } from "../printers/printer-utils";
import printSingleLambdaInvocation from "./printSingleLambdaInvocation";

const { softline } = builders;

export default function printArgumentListWithBraces(
  argumentListCtx: ArgumentListCstNode[] | undefined,
  rBrace: IToken,
  lBrace: IToken
) {
  const isSingleLambda = isArgumentListSingleLambda(argumentListCtx);
  if (isSingleLambda) {
    return printSingleLambdaInvocation.call(
      this,
      argumentListCtx,
      rBrace,
      lBrace
    );
  }

  const argumentList = this.visit(argumentListCtx, {
    isInsideMethodInvocationSuffix: true
  });
  return putIntoBraces(argumentList, softline, lBrace, rBrace);
}
