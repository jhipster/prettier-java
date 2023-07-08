"use strict";
import { IToken } from "java-parser";
import { builders } from "prettier/doc";
import Doc = builders.Doc;

const { processComments } = require("./comments/format-comments");
/*
 * ------------------------------------------------------------------
 * Wraps the Prettier builder functions to print tokens with comments
 * ------------------------------------------------------------------
 */

export function concat(docs: (Doc | IToken)[]): Doc {
  const concatenation = processComments(docs);

  if (!Array.isArray(docs)) {
    return "";
  }

  return concatenation;
}

export function join(sep: any, docs: (Doc | IToken)[]): Doc {
  return builders.join(processComments(sep), processComments(docs));
}

export function group(docs: Doc | IToken | (Doc | IToken)[], opts?: any) {
  const group = builders.group(processComments(docs), opts);
  return group.contents === undefined ? "" : group;
}

export function fill(docs: (Doc | IToken)[]) {
  return builders.fill(processComments(docs));
}

export function indent(doc: Doc | IToken) {
  const processedDoc = processComments(doc);
  if (processedDoc.length === 0) {
    return "";
  }

  return builders.indent(processedDoc);
}

export function dedent(doc: Doc | IToken) {
  const processedDoc = processComments(doc);
  if (processedDoc.length === 0) {
    return "";
  }

  return builders.dedent(processComments(doc));
}

export function ifBreak(
  breakContents: Doc | IToken,
  flatContents: Doc | IToken
) {
  return builders.ifBreak(
    processComments(breakContents),
    processComments(flatContents)
  );
}

export function indentIfBreak(contents: Doc | IToken, opts?: any) {
  return builders.indentIfBreak(processComments(contents), opts);
}
