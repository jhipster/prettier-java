"use strict";
import { IToken } from "java-parser";
import { doc } from "prettier";
import Doc = doc.builders.Doc;

const prettier = require("prettier").doc.builders;

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
  const concatenation = prettier.join(
    processComments(sep),
    processComments(docs)
  );
  return concatenation.length === 0 ? "" : concatenation;
}

export function group(doc: Doc | IToken, opts?: any) {
  const group = prettier.group(processComments(doc), opts);
  return group.contents === undefined ? "" : group;
}

export function fill(docs: (Doc | IToken)[]) {
  const fill = prettier.fill(processComments(docs));
  return fill.length === 0 ? "" : fill;
}

export function indent(doc: Doc | IToken) {
  const indentedDoc = prettier.indent(processComments(doc));
  return indentedDoc.contents.length === 0 ? "" : indentedDoc;
}

export function dedent(doc: Doc | IToken) {
  const indentedDoc = prettier.dedent(processComments(doc));
  return indentedDoc.contents.length === 0 ? "" : indentedDoc;
}

export function ifBreak(
  breakContents: Doc | IToken,
  flatContents: Doc | IToken
) {
  return prettier.ifBreak(
    processComments(breakContents),
    processComments(flatContents)
  );
}
