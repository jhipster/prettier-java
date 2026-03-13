import type { AstPath, Printer } from "prettier";
import {
  canAttachComment,
  handleLineComment,
  handleRemainingComment,
  isFullyBetweenPrettierIgnore,
  isPrettierIgnore,
  willPrintOwnComments
} from "./comments.js";
import {
  printComment,
  printValue,
  type JavaComment,
  type JavaNode,
  type JavaNodePath
} from "./printers/helpers.js";
import { printerForNodeType } from "./printers/index.js";
import { SyntaxType } from "./tree-sitter-java.js";

export default {
  print(path, options, print, args) {
    return hasJavaNode(path)
      ? printerForNodeType(path.node.type)(path, print, options, args)
      : printValue(path);
  },
  hasPrettierIgnore(path) {
    return (
      path.node.comments?.some(isPrettierIgnore) === true ||
      (canAttachComment(path.node) && isFullyBetweenPrettierIgnore(path))
    );
  },
  canAttachComment,
  isBlockComment(node) {
    return (node as unknown as JavaComment).type === SyntaxType.BlockComment;
  },
  willPrintOwnComments,
  printComment(commentPath) {
    return printComment(commentPath.node as unknown as JavaComment);
  },
  getCommentChildNodes(node) {
    return node.isNamed ? node.children : [];
  },
  handleComments: {
    ownLine: handleLineComment,
    endOfLine: handleLineComment,
    remaining: handleRemainingComment
  }
} satisfies Printer<JavaNode>;

function hasJavaNode(path: AstPath<JavaNode>): path is JavaNodePath {
  return path.node.isNamed;
}
