import {
  BaseJavaCstVisitor,
  CstChildrenDictionary,
  CstElement,
  CstNode
} from "java-parser";
import { Doc } from "prettier";
import { printNodeWithComments } from "./printers/comments/format-comments";

export class BaseCstPrettierPrinter extends BaseJavaCstVisitor {
  prettierOptions: any;

  mapVisit = (elements: CstNode[] | undefined, params?: any) => {
    if (elements === undefined) {
      // TODO: can optimize this by returning an immutable empty array singleton.
      return [];
    }

    return elements.map(element => this.visit(element, params));
  };

  getSingle = (ctx: CstChildrenDictionary): CstElement => {
    const ctxKeys = Object.keys(ctx);
    if (ctxKeys.length !== 1) {
      throw Error(
        `Expecting single key CST ctx but found: <${ctxKeys.length}> keys`
      );
    }
    const singleElementKey = ctxKeys[0];
    const singleElementValues = ctx[singleElementKey];

    if (singleElementValues?.length !== 1) {
      throw Error(
        `Expecting single item in CST ctx key but found: <${singleElementValues?.length}> items`
      );
    }

    return singleElementValues[0];
  };

  // @ts-ignore
  orgVisit = this.visit;
  visit = function (ctx: CstNode | CstNode[] | undefined, inParam?: any): Doc {
    if (ctx === undefined) {
      // empty Doc
      return "";
    }

    const node = Array.isArray(ctx) ? ctx[0] : ctx;

    if (node.ignore) {
      try {
        const startOffset =
          node.leadingComments !== undefined
            ? node.leadingComments[0].startOffset
            : node.location.startOffset;
        const endOffset = (
          node.trailingComments !== undefined
            ? node.trailingComments[node.trailingComments.length - 1].endOffset
            : node.location.endOffset
        ) as number;

        return this.prettierOptions.originalText.substring(
          startOffset,
          endOffset + 1
        );
      } catch (e) {
        throw Error(
          e +
            "\nThere might be a problem with prettier-ignore, please report an issue on https://github.com/jhipster/prettier-java/issues"
        );
      }
    }

    return printNodeWithComments(node, this.orgVisit.call(this, node, inParam));
  };

  visitSingle = function (ctx: CstChildrenDictionary, params?: any) {
    const singleElement = this.getSingle(ctx);
    return this.visit(singleElement, params);
  };

  constructor() {
    super();
  }
}
