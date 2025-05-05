import type { Doc } from "prettier";
import { builders } from "prettier/doc";
import {
  call,
  printDanglingComments,
  printList,
  type JavaNodePrinters
} from "./helpers.js";

const { group, ifBreak, indent, line } = builders;

export default {
  arrayInitializer(path, print, options) {
    const list: Doc[] = [];
    if (path.node.children.variableInitializerList) {
      list.push(call(path, print, "variableInitializerList"));
      if (options.trailingComma !== "none") {
        list.push(ifBreak(","));
      }
    }
    list.push(...printDanglingComments(path));
    return list.length
      ? group(["{", indent([line, ...list]), line, "}"])
      : "{}";
  },

  variableInitializerList(path, print) {
    return printList(path, print, "variableInitializer");
  }
} satisfies Partial<JavaNodePrinters>;
