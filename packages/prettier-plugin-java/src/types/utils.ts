import { CstNode, CstElement, IToken } from "java-parser/api";

export function isCstNode(tokenOrNode: CstElement): tokenOrNode is CstNode {
  return !isIToken(tokenOrNode);
}

export function isIToken(tokenOrNode: CstElement): tokenOrNode is IToken {
  return (
    (tokenOrNode as IToken).tokenType !== undefined &&
    (tokenOrNode as IToken).image !== undefined
  );
}

export function isCstElementOrUndefinedIToken(
  tokenOrNode: CstElement | undefined
): tokenOrNode is IToken {
  return tokenOrNode !== undefined && isIToken(tokenOrNode);
}
