import type { AstPath, Printer } from "prettier";
import {
  canAttachComment,
  handleLineComment,
  handleRemainingComment,
  isFullyBetweenPrettierIgnore,
  isPrettierIgnore,
  willPrintOwnComments
} from "./comments.ts";
import { SyntaxType, type CommentNode, type SyntaxNode } from "./node-types.ts";
import {
  embedTextBlock,
  hasType,
  printComment,
  printValue,
  type NamedNodePath
} from "./printers/helpers.ts";
import { printerForNodeType } from "./printers/index.ts";

export default {
  print(path, options, print, args) {
    return hasJavaNode(path)
      ? printerForNodeType(path.node.type)(path, print, options, args)
      : printValue(path);
  },
  embed(path) {
    return hasType(path, SyntaxType.StringLiteral)
      ? embedTextBlock(path)
      : null;
  },
  hasPrettierIgnore(path) {
    return (
      path.node.comments?.some(isPrettierIgnore) === true ||
      (canAttachComment(path.node) && isFullyBetweenPrettierIgnore(path))
    );
  },
  canAttachComment,
  isBlockComment(node) {
    return (node as unknown as CommentNode).type === SyntaxType.BlockComment;
  },
  willPrintOwnComments,
  printComment(commentPath) {
    return printComment(commentPath.node as unknown as CommentNode);
  },
  getCommentChildNodes(node) {
    return node.isNamed ? node.children : [];
  },
  handleComments: {
    ownLine: handleLineComment,
    endOfLine: handleLineComment,
    remaining: handleRemainingComment
  },
  getVisitorKeys() {
    return ["namedChildren"];
  }
} satisfies Printer<SyntaxNode>;

function hasJavaNode(path: AstPath<SyntaxNode>): path is NamedNodePath {
  return path.node.isNamed;
}
