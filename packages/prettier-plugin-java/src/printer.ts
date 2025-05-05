import type { CstElement, IToken } from "java-parser";
import type { AstPath, Printer } from "prettier";
import {
  canAttachComment,
  handleLineComment,
  handleRemainingComment,
  isFullyBetweenFormatterOffOn
} from "./comments.js";
import { isNode, isToken, printComment } from "./printers/helpers.js";
import { printerForNodeType } from "./printers/index.js";

export default {
  print(path: DistributedAstPath<CstElement>, options, print, args) {
    return hasToken(path)
      ? path.node.image
      : printerForNodeType(path.node.name)(path, print, options, args);
  },
  hasPrettierIgnore(path) {
    const { node } = path;
    return (
      node.comments?.some(({ image }) =>
        /^(\/\/\s*prettier-ignore|\/\*\s*prettier-ignore\s*\*\/)$/.test(image)
      ) === true ||
      (canAttachComment(node) && isFullyBetweenFormatterOffOn(path))
    );
  },
  canAttachComment,
  isBlockComment(node) {
    return isToken(node) && node.tokenType.name === "TraditionalComment";
  },
  printComment(commentPath) {
    const { node } = commentPath;
    if (isNode(node) || node.tokenType.GROUP !== "comments") {
      throw new Error(`Not a comment: ${JSON.stringify(node)}`);
    }
    return printComment(node);
  },
  getCommentChildNodes(node) {
    return isNode(node)
      ? Object.values(node.children).flatMap(child => child)
      : [];
  },
  handleComments: {
    ownLine: handleLineComment,
    endOfLine: handleLineComment,
    remaining: handleRemainingComment
  }
} satisfies Printer<CstElement>;

function hasToken(path: AstPath<CstElement>): path is AstPath<IToken> {
  return isToken(path.node);
}

type DistributedAstPath<T> = T extends any ? AstPath<T> : never;
