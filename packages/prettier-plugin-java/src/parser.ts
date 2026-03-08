import type Prettier from "prettier";
import nodeTypeInfo from "tree-sitter-java-orchard/src/node-types.json" with { type: "json" };
import { Language, Parser, type Node } from "web-tree-sitter";
import { determinePrettierIgnoreRanges } from "./comments.js";
import type {
  JavaComment,
  JavaNode,
  JavaNodeOrComment
} from "./printers/helpers.js";
import { SyntaxType } from "./tree-sitter-java.js";

export default {
  async parse(text) {
    const tree = (await parser).parse(text)!;

    const { rootNode } = tree;
    if (rootNode.hasError) {
      throw new Error("Failed to parse: " + rootNode);
    }

    const ast = processTree(rootNode);
    determinePrettierIgnoreRanges(ast);

    tree.delete();

    return ast;
  },
  astFormat: "java",
  hasPragma(text) {
    return /^\/\*\*\n\s+\*\s@(format|prettier)\n\s+\*\//.test(text);
  },
  locStart(node) {
    return node.start.index;
  },
  locEnd(node) {
    return node.end.index;
  }
} satisfies Prettier.Parser<JavaNodeOrComment>;

const parser = (async () => {
  await Parser.init();

  const parser = new Parser();
  const Java = await Language.load(
    new URL("./tree-sitter-java_orchard.wasm", import.meta.url).pathname
  );
  parser.setLanguage(Java);

  return parser;
})();

const multipleFieldsByType = nodeTypeInfo.reduce((map, nodeInfo) => {
  if ("fields" in nodeInfo && nodeInfo.fields) {
    const fields = Object.entries(nodeInfo.fields)
      .filter(([, { multiple }]) => multiple)
      .map(([name]) => name);
    if (fields.length) {
      map.set(nodeInfo.type, new Set(fields));
    }
  }
  return map;
}, new Map<string, Set<String>>());

function processTree(
  node: Node,
  fieldName: string | null = null,
  comments?: JavaComment[]
) {
  const { type, isNamed, text: value, startPosition, endPosition } = node;
  const javaNode = {
    type,
    isNamed,
    value,
    start: {
      index: node.startIndex,
      row: startPosition.row,
      column: startPosition.column
    },
    end: {
      index: node.endIndex,
      row: endPosition.row,
      column: endPosition.column
    },
    children: [],
    namedChildren: [],
    fieldName
  } as JavaNode & {
    [key: `${string}Node`]: JavaNode | undefined;
    [key: `${string}Nodes`]: JavaNode[];
  };

  if (!comments) {
    comments = javaNode.comments = [];
  }

  if (!javaNode.isNamed) {
    return javaNode;
  }

  const multipleFields = multipleFieldsByType.get(node.type);
  multipleFields?.forEach(name => (javaNode[`${name}Nodes`] = []));

  node.children.forEach((child, index) => {
    const { type, text: value, startPosition, endPosition } = child;
    if (type === SyntaxType.BlockComment || type === SyntaxType.LineComment) {
      comments.push({
        type,
        value,
        start: {
          index: child.startIndex,
          row: startPosition.row,
          column: startPosition.column
        },
        end: {
          index: child.endIndex,
          row: endPosition.row,
          column: endPosition.column
        },
        leading: false,
        trailing: false,
        printed: false
      });
    } else {
      const fieldName = node.fieldNameForChild(index);
      const javaChild = processTree(child, fieldName, comments);

      javaNode.children.push(javaChild);
      if (javaChild.isNamed) {
        javaNode.namedChildren.push(javaChild);
      }

      if (fieldName) {
        if (multipleFields?.has(fieldName)) {
          javaNode[`${fieldName}Nodes`].push(javaChild);
        } else {
          javaNode[`${fieldName}Node`] = javaChild;
        }
      }
    }
  });

  return javaNode;
}
