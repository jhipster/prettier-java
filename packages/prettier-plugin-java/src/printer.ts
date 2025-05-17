import type { AstPath, Printer } from "prettier";
import {
  canAttachComment,
  handleLineComment,
  handleRemainingComment,
  isFullyBetweenFormatterOffOn
} from "./comments.js";
import {
  isNonTerminal,
  isTerminal,
  printComment,
  type JavaNode,
  type JavaTerminal
} from "./printers/helpers.js";
import { printerForNodeType } from "./printers/index.js";

export default {
  print(path: DistributedAstPath<JavaNode>, options, print, args) {
    return hasTerminal(path)
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
    return isTerminal(node) && node.tokenType.name === "TraditionalComment";
  },
  printComment(commentPath) {
    const { node } = commentPath;
    if (isNonTerminal(node) || node.tokenType.GROUP !== "comments") {
      throw new Error(`Not a comment: ${JSON.stringify(node)}`);
    }
    return printComment(node);
  },
  getCommentChildNodes(node) {
    return isNonTerminal(node)
      ? Object.values(node.children).flatMap(child => child)
      : [];
  },
  handleComments: {
    ownLine: handleLineComment,
    endOfLine: handleLineComment,
    remaining: handleRemainingComment
  }
} satisfies Printer<JavaNode>;

function hasTerminal(path: AstPath<JavaNode>): path is AstPath<JavaTerminal> {
  return isTerminal(path.node);
}

type DistributedAstPath<T> = T extends any ? AstPath<T> : never;
