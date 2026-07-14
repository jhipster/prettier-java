import type { AstPath, Doc, Options, ParserOptions } from "prettier";
import { builders, utils } from "prettier/doc";
import {
  SyntaxType,
  type ArrayInitializerNode,
  type CommentNode,
  type ExpressionNode,
  type NamedNode,
  type NamedType,
  type SyntaxNode,
  type TypeString
} from "../node-types.ts";

const {
  group,
  hardline,
  ifBreak,
  indent,
  indentIfBreak,
  join,
  line,
  lineSuffixBoundary,
  softline
} = builders;
const { mapDoc } = utils;

export function hasType<T extends NamedType>(
  path: AstPath<NamedNode>,
  type: T
): path is AstPath<NamedNode<T>> {
  return path.node.type === type;
}

export function hasChild<T, K extends keyof T>(
  path: AstPath<T>,
  fieldName: K
): path is AstPath<T & { [P in K]-?: NonNullable<T[P]> }> {
  return path.node[fieldName] != null;
}

export function definedKeys<T extends SyntaxNode, K extends keyof T>(
  obj: T,
  options?: K[]
) {
  return (options ?? (Object.keys(obj) as K[])).filter(
    key => obj[key] !== undefined
  );
}

export function printModifiers(
  path: NamedNodePath,
  print: PrintFunction,
  annotationMode?: "declarationOnly" | "avoidBreak" | "noBreak"
): Doc[] {
  const modifiersIndex = path.node.namedChildren.findIndex(
    ({ type }) => type === SyntaxType.Modifiers
  );
  if (modifiersIndex === -1) {
    return [];
  }
  const separator =
    annotationMode === "avoidBreak"
      ? line
      : annotationMode === "noBreak" ||
          path.node.namedChildren[modifiersIndex].children.some(
            ({ type }) =>
              type !== SyntaxType.Annotation &&
              type !== SyntaxType.MarkerAnnotation
          )
        ? " "
        : hardline;
  return [
    path.call(
      modifiers => print(modifiers, { annotationMode }),
      "namedChildren",
      modifiersIndex
    ),
    separator
  ];
}

export function printValue(path: AstPath<SyntaxNode>) {
  return path.node.value;
}

export function lineStartWithComments(node: SyntaxNode) {
  return node.comments?.length
    ? Math.min(node.start.row, node.comments[0].start.row)
    : node.start.row;
}

export function lineEndWithComments(node: SyntaxNode) {
  return node.comments?.length
    ? Math.max(node.end.row, node.comments.at(-1)!.end.row)
    : node.end.row;
}

export function printDanglingComments(
  path: NamedNodePath,
  danglingCommentsPrintOptions: { indent?: boolean } = {}
): Doc {
  const { indent: shouldIndent = false } = danglingCommentsPrintOptions;
  const danglingComments = new Set(
    path.node.comments?.filter(
      comment => !(comment.leading || comment.trailing)
    )
  );

  if (danglingComments.size === 0) {
    return "";
  }

  const parts = path
    .map(
      ({ node: comment }) =>
        danglingComments.has(comment) ? printComment(comment) : "",
      "comments"
    )
    .filter(Boolean);

  const doc = join(hardline, parts);
  return shouldIndent ? indent([hardline, doc]) : doc;
}

export function printComment(comment: CommentNode) {
  comment.printed = true;
  const lines = comment.value.split("\n").map(line => line.trim());
  return lines.length > 1 &&
    lines[0].startsWith("/*") &&
    lines.slice(1).every(line => line.startsWith("*")) &&
    lines.at(-1)!.endsWith("*/")
    ? join(
        hardline,
        lines.map((line, index) => (index === 0 ? line : ` ${line}`))
      )
    : comment.value;
}

export function hasLeadingComments(node: SyntaxNode) {
  return node.comments?.some(({ leading }) => leading) ?? false;
}

export function indentInParentheses(contents: Doc) {
  return (contents && !Array.isArray(contents)) || contents.length
    ? ["(", indent([softline, contents]), softline, ")"]
    : "()";
}

export function printArrayInitializer(
  path: NamedNodePath<
    SyntaxType.ArrayInitializer | SyntaxType.ElementValueArrayInitializer
  >,
  print: PrintFunction,
  options: JavaParserOptions
) {
  if (!path.node.namedChildren.length) {
    const danglingComments = printDanglingComments(path, { indent: true });
    return danglingComments ? ["{", danglingComments, hardline, "}"] : "{}";
  }

  const list = join([",", line], path.map(print, "namedChildren"));

  if (list.length && options.trailingComma !== "none") {
    list.push(ifBreak(","));
  }

  return group(["{", indent([line, ...list]), line, "}"]);
}

export function printBlock(path: NamedNodePath, contents: Doc[]) {
  if (contents.length) {
    return group([
      "{",
      indent([hardline, ...join(hardline, contents)]),
      hardline,
      "}"
    ]);
  }
  const danglingComments = printDanglingComments(path, { indent: true });
  if (danglingComments) {
    return ["{", danglingComments, hardline, "}"];
  }
  const parent = path.parent;
  const grandparent = path.grandparent;
  return (parent?.type === SyntaxType.CatchClause &&
    (grandparent?.type === SyntaxType.TryStatement ||
      grandparent?.type === SyntaxType.TryWithResourcesStatement) &&
    grandparent.namedChildren.filter(
      ({ type }) => type === SyntaxType.CatchClause
    ).length === 1 &&
    !grandparent.namedChildren.some(
      ({ type }) => type === SyntaxType.FinallyClause
    )) ||
    (parent &&
      [
        SyntaxType.ForStatement,
        SyntaxType.DoStatement,
        SyntaxType.EnhancedForStatement,
        SyntaxType.WhileStatement
      ].includes(parent.type)) ||
    [
      SyntaxType.AnnotationTypeBody,
      SyntaxType.ClassBody,
      SyntaxType.ConstructorBody,
      SyntaxType.EnumBody,
      SyntaxType.InterfaceBody,
      SyntaxType.ModuleBody,
      SyntaxType.RecordPatternBody
    ].includes(path.node.type) ||
    (parent &&
      [
        SyntaxType.Block,
        SyntaxType.LambdaExpression,
        SyntaxType.MethodDeclaration,
        SyntaxType.StaticInitializer,
        SyntaxType.SynchronizedStatement
      ].includes(parent.type))
    ? "{}"
    : ["{", hardline, "}"];
}

export function printBlockStatements(
  path: NamedNodePath<
    | SyntaxType.Block
    | SyntaxType.ConstructorBody
    | SyntaxType.SwitchBlockStatementGroup
  >,
  print: PrintFunction
) {
  const parts: Doc[] = [];
  path.each(child => {
    const { node, previous } = child;

    if (node.type === SyntaxType.SwitchLabel) {
      return;
    }

    const blankLine =
      parts.length &&
      previous &&
      lineStartWithComments(node) > lineEndWithComments(previous) + 1;

    const declaration = print(child);
    parts.push(blankLine ? [hardline, declaration] : declaration);
  }, "namedChildren");
  return parts;
}

export function printBodyDeclarations(
  path: NamedNodePath<
    | SyntaxType.AnnotationTypeBody
    | SyntaxType.ClassBody
    | SyntaxType.EnumBody
    | SyntaxType.EnumBodyDeclarations
    | SyntaxType.FormalParameters
    | SyntaxType.InterfaceBody
  >,
  print: PrintFunction,
  padFirst = false
) {
  const isInterfaceBody = path.node.type === SyntaxType.InterfaceBody;
  const isFormalParameters = path.node.type === SyntaxType.FormalParameters;
  const separator = isFormalParameters ? softline : hardline;
  let previousRequiresPadding = padFirst;

  return path.map(child => {
    const { node, previous } = child;

    const modifiers =
      node.namedChildren.find(({ type }) => type === SyntaxType.Modifiers)
        ?.children ?? [];
    const firstAnnotationIndex = modifiers.findIndex(
      ({ type }) =>
        type === SyntaxType.Annotation || type === SyntaxType.MarkerAnnotation
    );
    const lastNonAnnotationIndex = modifiers.findLastIndex(
      ({ type }) =>
        type !== SyntaxType.Annotation && type !== SyntaxType.MarkerAnnotation
    );
    const hasDeclarationAnnotation =
      firstAnnotationIndex !== -1 &&
      ((!isFormalParameters && lastNonAnnotationIndex === -1) ||
        firstAnnotationIndex < lastNonAnnotationIndex);
    const currentRequiresPadding =
      hasDeclarationAnnotation ||
      (!isFormalParameters &&
        node.type !== SyntaxType.ConstantDeclaration &&
        node.type !== SyntaxType.EnumConstant &&
        node.type !== SyntaxType.FieldDeclaration &&
        !(
          isInterfaceBody &&
          node.type === SyntaxType.MethodDeclaration &&
          !node.bodyNode
        ));

    const blankLine =
      previousRequiresPadding ||
      (previous &&
        (currentRequiresPadding ||
          lineStartWithComments(node) > lineEndWithComments(previous) + 1));

    previousRequiresPadding = currentRequiresPadding;

    const declaration = print(child);
    return blankLine ? [separator, declaration] : declaration;
  }, "namedChildren");
}

export function printTypeParameters(
  path: NamedNodePath<SyntaxType.TypeArguments | SyntaxType.TypeParameters>,
  print: PrintFunction
) {
  const parameters = path.node.namedChildren;

  const shouldInline =
    parameters.length === 0 ||
    (parameters.length === 1 &&
      isSimpleType(parameters[0]) &&
      !parameters.some(
        ({ comments }) =>
          comments?.length &&
          comments.some(({ type }) => type === SyntaxType.LineComment)
      ));

  if (shouldInline) {
    return ["<", join(", ", path.map(print, "namedChildren")), ">"];
  }

  const parts = [
    "<",
    indent([softline, join([",", line], path.map(print, "namedChildren"))]),
    softline,
    ">"
  ];

  return path.node.type === SyntaxType.TypeArguments ? group(parts) : parts;
}

export function printVariableDeclaration(
  path: NamedNodePath<
    | SyntaxType.ConstantDeclaration
    | SyntaxType.FieldDeclaration
    | SyntaxType.LocalVariableDeclaration
  >,
  print: PrintFunction
) {
  const declaration = printModifiers(path, print);

  declaration.push(path.call(print, "typeNode"), " ");

  const declarators = path.map(print, "declaratorNodes");

  if (
    declarators.length > 1 &&
    path.node.declaratorNodes.some(({ valueNode }) => valueNode)
  ) {
    declaration.push(
      group(indent(join([",", line], declarators)), {
        shouldBreak:
          (path.parent as NamedNode | null)?.type !== SyntaxType.ForStatement
      })
    );
  } else {
    declaration.push(join(", ", declarators));
  }

  declaration.push(";");

  return declaration;
}

export function printAssignment(
  leftDoc: Doc,
  operator: Doc,
  rightDoc?: Doc,
  rightNode?: ArrayInitializerNode | ExpressionNode
) {
  if (!rightDoc || !rightNode) {
    return leftDoc;
  }

  const breakAfterOperator =
    rightNode.type === SyntaxType.BinaryExpression ||
    rightNode.type === SyntaxType.InstanceofExpression ||
    (rightNode.type === SyntaxType.TernaryExpression &&
      (rightNode.conditionNode.type === SyntaxType.BinaryExpression ||
        rightNode.conditionNode.type === SyntaxType.InstanceofExpression)) ||
    hasLeadingComments(rightNode);

  if (breakAfterOperator) {
    // First break after operator, then right-hand side
    return group([leftDoc, operator, group(indent([line, rightDoc]))]);
  }

  // First break right-hand side, then after operator
  const groupId = Symbol("assignment");
  return group([
    leftDoc,
    operator,
    group(indent(line), { id: groupId }),
    lineSuffixBoundary,
    indentIfBreak(rightDoc, { groupId })
  ]);
}

export function printTextBlock(contents: Doc) {
  return ['"""', hardline, contents, '"""'];
}

export function embedTextBlock(path: NamedNodePath<SyntaxType.StringLiteral>) {
  const hasInterpolations = path.node.namedChildren.some(
    ({ type }) => type === SyntaxType.StringInterpolation
  );
  if (hasInterpolations || path.node.children[0].value === '"') {
    return null;
  }

  const language = findEmbeddedLanguage(path);
  if (!language) {
    return null;
  }

  const text = unescapeTextBlockContents(textBlockContents(path.node));

  return async (
    textToDoc: (text: string, options: Options) => Promise<Doc>
  ) => {
    const doc = await textToDoc(text, { parser: language });
    return printTextBlock([escapeDocForTextBlock(doc), hardline]);
  };
}

export function textBlockContents(node: NamedNode<SyntaxType.StringLiteral>) {
  const lines = node.value.split("\n").slice(1);
  const baseIndent = findBaseIndent(lines);
  return lines
    .map(line => line.slice(baseIndent))
    .join("\n")
    .slice(0, -3);
}

const PRECEDENCE = new Map(
  [
    ["||"],
    ["&&"],
    ["|"],
    ["^"],
    ["&"],
    ["==", "!="],
    ["<", ">", "<=", ">=", "instanceof"],
    ["<<", ">>", ">>>"],
    ["+", "-"],
    ["*", "/", "%"]
  ].flatMap((operators, index) => operators.map(operator => [operator, index]))
);
export function getPrecedence(operator: string) {
  return PRECEDENCE.get(operator) ?? -1;
}

const equalityOperators = new Set(["==", "!="]);
const multiplicativeOperators = new Set(["*", "/", "%"]);
const bitshiftOperators = new Set([">>", ">>>", "<<"]);

export function isBitwiseOperator(operator: string) {
  return (
    bitshiftOperators.has(operator) ||
    operator === "|" ||
    operator === "^" ||
    operator === "&"
  );
}

export function shouldFlatten(parentOp: string, nodeOp: string) {
  if (getPrecedence(nodeOp) !== getPrecedence(parentOp)) {
    return false;
  }

  // x == y == z --> (x == y) == z
  if (equalityOperators.has(parentOp) && equalityOperators.has(nodeOp)) {
    return false;
  }

  // x * y % z --> (x * y) % z
  if (
    (nodeOp === "%" && multiplicativeOperators.has(parentOp)) ||
    (parentOp === "%" && multiplicativeOperators.has(nodeOp))
  ) {
    return false;
  }

  // x * y / z --> (x * y) / z
  // x / y * z --> (x / y) * z
  if (
    nodeOp !== parentOp &&
    multiplicativeOperators.has(nodeOp) &&
    multiplicativeOperators.has(parentOp)
  ) {
    return false;
  }

  // x << y << z --> (x << y) << z
  if (bitshiftOperators.has(parentOp) && bitshiftOperators.has(nodeOp)) {
    return false;
  }

  return true;
}

export function createTypeCheckFunction<T extends TypeString>(typesArray: T[]) {
  const types = new Set<TypeString>(typesArray);

  return (
    node: SyntaxNode | undefined | null
  ): node is Extract<SyntaxNode, { type: T }> =>
    node != null && types.has(node.type);
}

export const isMember = createTypeCheckFunction([
  SyntaxType.ArrayAccess,
  SyntaxType.FieldAccess,
  SyntaxType.MethodInvocation
]);

export function needsParentheses(path: NamedNodePath) {
  if (path.isRoot) {
    return false;
  }

  const { node, parent } = path;

  const parentCheckResult = parentNeedsParentheses(path);
  if (typeof parentCheckResult === "boolean") {
    return parentCheckResult;
  }

  switch (node.type) {
    case SyntaxType.SwitchExpression:
      return (
        isMember(parent) ||
        parent?.type === SyntaxType.ExplicitConstructorInvocation ||
        parent?.type === SyntaxType.MethodReference ||
        parent?.type === SyntaxType.ObjectCreationExpression
      );

    case SyntaxType.UpdateExpression:
      if (parent?.type === SyntaxType.UnaryExpression) {
        return node.children[0].type.startsWith(parent.operatorNode.type);
      }
    // else fallthrough
    case SyntaxType.UnaryExpression:
      switch (parent?.type) {
        case SyntaxType.UnaryExpression:
          return (
            node.type === SyntaxType.UnaryExpression &&
            node.operatorNode.type === parent.operatorNode.type &&
            (node.operatorNode.type === "+" || node.operatorNode.type === "-")
          );

        case SyntaxType.InstanceofExpression:
          // A user typing `!foo instanceof Bar` probably intended
          // `!(foo instanceof Bar)`, so format to `(!foo) instance Bar` to what is
          // really happening
          return (
            parent.leftNode === node && node.type === SyntaxType.UnaryExpression
          );

        default:
          return false;
      }

    case SyntaxType.BinaryExpression:
    case SyntaxType.InstanceofExpression:
      if (parent?.type === SyntaxType.UpdateExpression) {
        return true;
      }

    // fallthrough
    case SyntaxType.CastExpression:
      switch (parent?.type) {
        case SyntaxType.CastExpression:
          // example: (Baz) (Bar) foo
          return node.type !== SyntaxType.CastExpression;

        case SyntaxType.MethodReference:
        case SyntaxType.ObjectCreationExpression:
        case SyntaxType.UpdateExpression:
          return true;
        case SyntaxType.UnaryExpression:
          // `UnaryExpression` adds parentheses and indention when argument has comment
          if (!node.comments) {
            return true;
          }
          break;

        case SyntaxType.ExplicitConstructorInvocation:
        case SyntaxType.FieldAccess:
        case SyntaxType.MethodInvocation:
          return parent.objectNode === node;

        case SyntaxType.ArrayAccess:
          return parent.arrayNode === node;

        case SyntaxType.BinaryExpression:
        case SyntaxType.InstanceofExpression: {
          if (node.type === SyntaxType.CastExpression) {
            return false;
          }

          if (
            parent.type === SyntaxType.BinaryExpression &&
            isLogicalOperator(parent.operatorNode) &&
            node.type === SyntaxType.BinaryExpression &&
            isLogicalOperator(node.operatorNode)
          ) {
            return parent.operatorNode.type !== node.operatorNode.type;
          }

          const operator =
            node.type === SyntaxType.InstanceofExpression
              ? "instanceof"
              : node.operatorNode.type;
          const precedence = getPrecedence(operator);
          const parentOperator =
            parent.type === SyntaxType.InstanceofExpression
              ? "instanceof"
              : parent.operatorNode.type;
          const parentPrecedence = getPrecedence(parentOperator);

          if (parentPrecedence > precedence) {
            return true;
          }

          if (parent.rightNode === node && parentPrecedence === precedence) {
            return true;
          }

          if (
            parentPrecedence === precedence &&
            !shouldFlatten(parentOperator, operator)
          ) {
            return true;
          }

          if (
            parentPrecedence < precedence &&
            operator === "%" &&
            (parentOperator === "+" || parentOperator === "-")
          ) {
            return true;
          }

          // Add parenthesis when working with bitwise operators
          // It's not strictly needed but helps with code understanding
          if (isBitwiseOperator(parentOperator)) {
            return true;
          }

          return false;
        }

        default:
          return false;
      }
      break;

    case SyntaxType.AssignmentExpression:
      if (
        parent?.type === SyntaxType.ForStatement &&
        (parent.initNodes.includes(node) || parent.updateNodes.includes(node))
      ) {
        return false;
      }

      if (
        parent?.type === SyntaxType.ExpressionStatement &&
        parent.namedChildren[0] === node
      ) {
        return false;
      }

      if (
        parent?.type === SyntaxType.AssignmentExpression ||
        (parent?.type === SyntaxType.LambdaExpression &&
          parent.bodyNode === node)
      ) {
        return false;
      }

      return true;

    case SyntaxType.TernaryExpression:
      switch (parent?.type) {
        case SyntaxType.UnaryExpression:
        case SyntaxType.BinaryExpression:
        case SyntaxType.CastExpression:
        case SyntaxType.MethodReference:
        case SyntaxType.ObjectCreationExpression:
          return true;

        case SyntaxType.TernaryExpression:
          return parent.conditionNode === node;

        case SyntaxType.ExplicitConstructorInvocation:
        case SyntaxType.FieldAccess:
        case SyntaxType.MethodInvocation:
          return parent.objectNode === node;

        case SyntaxType.ArrayAccess:
          return parent.arrayNode === node;

        default:
          return false;
      }
  }

  return false;
}

export function returnArgumentHasLeadingComment(node: NamedNode) {
  return node.comments?.some(
    comment =>
      comment.leading &&
      (comment.type === SyntaxType.LineComment || comment.start < comment.end)
  );
}

export const isReturnOrThrowStatement = createTypeCheckFunction([
  SyntaxType.ReturnStatement,
  SyntaxType.ThrowStatement
]);

function parentNeedsParentheses(path: AstPath<NamedNode>) {
  const { parent } = path;

  switch (parent?.type) {
    case SyntaxType.ReturnStatement:
    case SyntaxType.ThrowStatement:
      if (willReturnOrThrowStatementBreak(path)) {
        return false;
      }
      break;
  }
}

function willReturnOrThrowStatementBreak(path: NamedNodePath) {
  const { parent } = path;
  if (!isReturnOrThrowStatement(parent)) {
    return false;
  }

  /*
  When `ReturnStatement` or `ThrowStatement` breaks, parentheses will be added around it's argument.
  So don't need add parentheses again.
  But we can't know how the argument printed, so only matches cases that will break for sure
  */

  const { node } = path;

  if (
    node.type === SyntaxType.AssignmentExpression &&
    returnArgumentHasLeadingComment(node)
  ) {
    return true;
  }

  return false;
}

const isLogicalOperator = createTypeCheckFunction(["||", "&&"]);

function isSimpleType(node: NamedNode): boolean {
  const { type, children, namedChildren } = node;
  const lastNamedChild = namedChildren.at(-1);

  return (
    [
      SyntaxType.BooleanType,
      SyntaxType.FloatingPointType,
      SyntaxType.IntegralType,
      SyntaxType.TypeIdentifier,
      SyntaxType.VoidType
    ].includes(type) ||
    (type === SyntaxType.AnnotatedType &&
      lastNamedChild &&
      isSimpleType(lastNamedChild)) ||
    (type === SyntaxType.ArrayType && isSimpleType(node.elementNode)) ||
    (type === SyntaxType.ScopedTypeIdentifier &&
      lastNamedChild &&
      isSimpleType(namedChildren[0]) &&
      isSimpleType(lastNamedChild)) ||
    (type === SyntaxType.TypeParameter &&
      (lastNamedChild?.type !== SyntaxType.TypeBound ||
        lastNamedChild.namedChildren.length === 1)) ||
    (type === SyntaxType.Wildcard &&
      (children.at(-1)!.type === "?" || isSimpleType(namedChildren.at(-1)!)))
  );
}

function findBaseIndent(lines: string[]) {
  return Math.min(
    ...lines.map(line => line.search(/\S/)).filter(indent => indent >= 0)
  );
}

function findEmbeddedLanguage(path: NamedNodePath) {
  return path.ancestors
    .find(
      ({ type, comments }) =>
        type === SyntaxType.Block || comments?.some(({ leading }) => leading)
    )
    ?.comments?.filter(({ leading }) => leading)
    .map(
      ({ value }) => value.match(/^(?:\/\/|\/\*)\s*language\s*=\s*(\S+)/)?.[1]
    )
    .findLast(language => language)
    ?.toLowerCase();
}

function escapeDocForTextBlock(doc: Doc) {
  return mapDoc(doc, currentDoc =>
    typeof currentDoc === "string"
      ? currentDoc.replace(/\\|"""/g, match =>
          match === "\\" ? "\\\\" : '""\\"'
        )
      : currentDoc
  );
}

function unescapeTextBlockContents(text: string) {
  return text.replace(/\\(?:([stnr"'\\])|\n|\r\n?)/g, (_, escaped) => {
    switch (escaped) {
      case "s":
        return " ";
      case "t":
        return "\t";
      case "n":
        return "\n";
      case "r":
        return "\r";
      default:
        return escaped ?? "";
    }
  });
}

export type NamedNodePrinters = {
  [T in NamedType]: NamedNodePrinter<T>;
};
export type NamedNodePrinter<T extends NamedType> = (
  path: NamedNodePath<T>,
  print: PrintFunction,
  options: JavaParserOptions,
  args?: unknown
) => Doc;
export type NamedNodePath<T extends NamedType = NamedType> = AstPath<
  NamedNode<T>
>;
export type PrintFunction = (path: AstPath<SyntaxNode>, args?: unknown) => Doc;
export type JavaParserOptions = ParserOptions<SyntaxNode>;
