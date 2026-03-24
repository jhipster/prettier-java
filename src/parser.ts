import type Prettier from "prettier";
import { Language, Parser, type Node } from "web-tree-sitter";
import { determinePrettierIgnoreRanges } from "./comments.ts";
import {
  multiFieldsByType,
  SyntaxType,
  type CommentNode,
  type SyntaxNode
} from "./node-types.ts";

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
} satisfies Prettier.Parser<SyntaxNode | CommentNode>;

const parser = (async () => {
  await Parser.init();

  const parser = new Parser();
  const Java = await Language.load(
    new URL("./tree-sitter-java_orchard.wasm", import.meta.url).pathname
  );
  parser.setLanguage(Java);

  return parser;
})();

function processTree(
  node: Node,
  fieldName: string | null = null,
  comments?: CommentNode[]
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
  } as SyntaxNode & {
    [key: `${string}Node`]: SyntaxNode | undefined;
    [key: `${string}Nodes`]: SyntaxNode[];
  };

  if (!comments) {
    comments = javaNode.comments = [];
  }

  if (!javaNode.isNamed) {
    return javaNode;
  }

  const multiFields = multiFieldsByType[node.type];
  if (multiFields) {
    Object.keys(multiFields).forEach(name => (javaNode[`${name}Nodes`] = []));
  }

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
        if (multiFields?.[fieldName]) {
          javaNode[`${fieldName}Nodes`].push(javaChild);
        } else {
          javaNode[`${fieldName}Node`] = javaChild;
        }
      }
    }
  });

  return javaNode;
}
