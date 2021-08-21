import {
  AbstractOrdinaryCompilationUnitCtx,
  AnnotationCstNode,
  CompilationUnitCtx,
  CstElement,
  CstNode,
  IToken,
  TypeArgumentsCstNode
} from "java-parser/api";

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

export const isTypeArgumentsCstNode = (
  cstElement: CstElement
): cstElement is TypeArgumentsCstNode => {
  return (cstElement as CstNode).name === "typeArguments";
};

export const isAnnotationCstNode = (
  cstElement: CstElement
): cstElement is AnnotationCstNode => {
  return (cstElement as CstNode).name === "annotation";
};

export const isOrdinaryCompilationUnitCtx = (
  ctx: CompilationUnitCtx
): ctx is AbstractOrdinaryCompilationUnitCtx => {
  return (
    (ctx as AbstractOrdinaryCompilationUnitCtx).ordinaryCompilationUnit !==
    undefined
  );
};
