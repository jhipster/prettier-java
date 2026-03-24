import { writeFileSync } from "node:fs";
import nodeTypeInfo from "tree-sitter-java-orchard/src/node-types.json" with { type: "json" };

writeFileSync(
  "src/node-types.ts",
  `interface Point {
  index: number;
  row: number;
  column: number;
}

interface SyntaxNodeBase {
  value: string;
  start: Point;
  end: Point;
  comments?: CommentNode[];
}

interface NamedNodeBase extends SyntaxNodeBase {
  isNamed: true;
  fieldName: string | null;
  children: SyntaxNode[];
  namedChildren: NamedNode[];
}

export interface UnnamedNode<T extends UnnamedType = UnnamedType> extends SyntaxNodeBase {
  type: T;
  isNamed: false;
  fieldName: string | null;
}

export interface CommentNode extends SyntaxNodeBase {
  type: CommentType;
  leading: boolean;
  trailing: boolean;
  printed: boolean;
  enclosingNode?: SyntaxNode;
  precedingNode?: SyntaxNode;
  followingNode?: SyntaxNode;
}

type PickNamedType<Node, T extends SyntaxType> = Node extends { type: T; isNamed: true } ? Node : never;

export type NamedNode<T extends NamedType = NamedType> = PickNamedType<SyntaxNode, T>;

export const enum SyntaxType {
  ERROR = "ERROR",
${nodeTypeInfo
  .filter(({ named, subtypes }) => named && !subtypes?.length)
  .map(
    ({ type }) =>
      `  ${getSyntaxKindFromString(type)} = ${JSON.stringify(type)},`
  )
  .join("\n")}
};

export type CommentType = SyntaxType.BlockComment | SyntaxType.LineComment;

export type NamedType = Exclude<SyntaxType, CommentType>;

export type UnnamedType = ${nodeTypeInfo
    .filter(({ named }) => !named)
    .map(({ type }) => JSON.stringify(type))
    .join(" | ")};

export type TypeString = NamedType | UnnamedType;

export const multiFieldsByType: Partial<Record<string, Partial<Record<string, true>>>> = ${JSON.stringify(
    nodeTypeInfo.reduce(
      (acc, nodeInfo) => {
        if ("fields" in nodeInfo && nodeInfo.fields) {
          const multiFields = Object.entries(nodeInfo.fields)
            .filter(([, { multiple }]) => multiple)
            .reduce(
              (fieldAcc, [name]) => {
                fieldAcc[name] = true;
                return fieldAcc;
              },
              {} as Record<string, boolean>
            );

          if (Object.keys(multiFields).length > 0) {
            acc[nodeInfo.type] = multiFields;
          }
        }
        return acc;
      },
      {} as Record<string, Record<string, boolean>>
    )
  )};

export type SyntaxNode = ErrorNode | ${nodeTypeInfo
    .filter(({ type }) => !type.endsWith("_comment"))
    .map(getTypeExprFromRef)
    .join(" | ")};

export interface ErrorNode extends NamedNodeBase {
  type: SyntaxType.ERROR;
}

${nodeTypeInfo
  .filter(({ named }) => named)
  .map(({ type, subtypes, fields }) =>
    subtypes?.length
      ? `export type ${getTypeNameFromString(type)} = ${subtypes.map(getTypeExprFromRef).join(" | ")};`
      : `export interface ${getTypeNameFromString(type)} extends NamedNodeBase {
  type: SyntaxType.${getSyntaxKindFromString(type)};
${
  fields && Object.keys(fields).length
    ? `${Object.entries(fields as unknown as Record<string, NodeTypeChildren>)
        .map(([field, children]) => {
          let fieldName = `${field}Node`;
          let type = children.types.length
            ? children.types.map(t => getTypeExprFromRef(t)).join(" | ")
            : "UnnamedNode";
          if (children.multiple) {
            if (children.types.length > 1) {
              type = `(${type})`;
            }
            type += "[]";
            fieldName += "s";
          }
          const opt = children.required || children.multiple ? "" : "?";
          return `  ${fieldName}${opt}: ${type};`;
        })
        .join("\n")}
}`
    : "}"
}`
  )
  .join("\n\n")}
`
);

interface NodeTypeRef {
  type: string;
  named: boolean;
  isError?: boolean;
}

interface NodeTypeChildren {
  multiple: boolean;
  required: boolean;
  types: NodeTypeRef[];
}

function isIdentifier(str: string) {
  return /^[a-z$_][a-z0-9$_]*$/i.test(str);
}

function mangleNameToIdentifier(str: string) {
  let sb = "$";
  for (let i = 0; i < str.length; ++i) {
    const char = str.charAt(i);
    if (/[a-z0-9_]/i.test(char)) {
      sb += char;
    } else {
      sb += "$" + str.charCodeAt(i) + "$";
    }
  }
  return sb;
}

function toCapitalCase(str: string) {
  return str
    .replace(/^[a-z]/, t => t.toUpperCase())
    .replace(/_[a-zA-Z]/g, t => t.substring(1).toUpperCase());
}

function getTypePrefixFromString(str: string) {
  return isIdentifier(str) ? toCapitalCase(str) : mangleNameToIdentifier(str);
}

function getTypeNameFromString(str: string) {
  return getTypePrefixFromString(str) + "Node";
}

function getSyntaxKindFromString(str: string) {
  return getTypePrefixFromString(str);
}

function getTypeExprFromRef({ type, named }: { type: string; named: boolean }) {
  return named
    ? getTypeNameFromString(type)
    : `UnnamedNode<${JSON.stringify(type)}>`;
}
