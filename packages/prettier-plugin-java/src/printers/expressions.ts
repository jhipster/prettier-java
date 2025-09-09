import type {
  FqnOrRefTypeCtx,
  StringTemplateCstNode,
  TextBlockTemplateCstNode
} from "java-parser";
import type { AstPath, Doc } from "prettier";
import { builders, utils } from "prettier/doc";
import type { JavaComment } from "../comments.js";
import {
  call,
  definedKeys,
  each,
  findBaseIndent,
  flatMap,
  hasLeadingComments,
  indentInParentheses,
  isBinaryExpression,
  isNonTerminal,
  isTerminal,
  map,
  onlyDefinedKey,
  printDanglingComments,
  printList,
  printName,
  printSingle,
  type IterProperties,
  type JavaNodePrinters,
  type JavaNonTerminal,
  type JavaPrintFn
} from "./helpers.js";

const {
  breakParent,
  conditionalGroup,
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
const { removeLines, willBreak } = utils;

export default {
  expression: printSingle,

  lambdaExpression(path, print, _, args = {}) {
    const hug = (args as { hug?: boolean }).hug ?? false;
    const parameters = call(path, print, "lambdaParameters");
    const expression = [hug ? removeLines(parameters) : parameters, " ->"];
    const lambdaExpression =
      path.node.children.lambdaBody[0].children.expression;
    const body = call(path, print, "lambdaBody");
    if (lambdaExpression) {
      const suffix = indent([line, body]);
      expression.push(group(hug ? [suffix, softline] : suffix));
    } else {
      expression.push(" ", body);
    }
    return expression;
  },

  lambdaParameters(path, print, options) {
    const parameters = printSingle(path, print);
    return !path.node.children.lambdaParametersWithBraces &&
      options.arrowParens === "always"
      ? ["(", parameters, ")"]
      : parameters;
  },

  lambdaParametersWithBraces(path, print, options) {
    const { lambdaParameterList } = path.node.children;
    if (!lambdaParameterList) {
      return "()";
    }
    const { conciseLambdaParameterList, normalLambdaParameterList } =
      lambdaParameterList[0].children;
    const parameterCount = (conciseLambdaParameterList?.[0].children
      .conciseLambdaParameter ??
      normalLambdaParameterList?.[0].children.normalLambdaParameter)!.length;
    const parameters = call(path, print, "lambdaParameterList");
    if (parameterCount > 1) {
      return indentInParentheses(parameters);
    }
    return conciseLambdaParameterList && options.arrowParens === "avoid"
      ? parameters
      : ["(", parameters, ")"];
  },

  lambdaParameterList: printSingle,

  conciseLambdaParameterList(path, print) {
    return printList(path, print, "conciseLambdaParameter");
  },

  normalLambdaParameterList(path, print) {
    return printList(path, print, "normalLambdaParameter");
  },

  normalLambdaParameter: printSingle,

  regularLambdaParameter(path, print) {
    return join(" ", [
      ...map(path, print, "variableModifier"),
      call(path, print, "lambdaParameterType"),
      call(path, print, "variableDeclaratorId")
    ]);
  },

  lambdaParameterType: printSingle,
  conciseLambdaParameter: printSingle,
  lambdaBody: printSingle,

  conditionalExpression(path, print) {
    const binaryExpression = call(path, print, "binaryExpression");
    if (!path.node.children.QuestionMark) {
      return binaryExpression;
    }
    const expressions = map(path, print, "expression");
    const contents = indent(
      join(line, [
        binaryExpression,
        ["? ", expressions[0]],
        [": ", expressions[1]]
      ])
    );
    const isNestedTernary =
      (path.getNode(4) as JavaNonTerminal | null)?.name ===
      "conditionalExpression";
    return isNestedTernary ? contents : group(contents);
  },

  binaryExpression(path, print, options) {
    const { children } = path.node;
    const operands = flatMap(
      path,
      print,
      definedKeys(children, [
        "expression",
        "pattern",
        "referenceType",
        "unaryExpression"
      ])
    );
    const operators = flatMap(
      path,
      operatorPath => {
        const { node } = operatorPath;
        let image: string;
        if (isTerminal(node)) {
          image = node.image;
        } else if (node.children.Less) {
          image = "<<";
        } else {
          image = node.children.Greater!.length === 2 ? ">>" : ">>>";
        }
        return { image, doc: print(operatorPath) };
      },
      definedKeys(children, [
        "AssignmentOperator",
        "BinaryOperator",
        "Instanceof",
        "shiftOperator"
      ])
    );
    const hasNonAssignmentOperators =
      (operators.length > 0 && !children.AssignmentOperator) ||
      (children.expression !== undefined &&
        isBinaryExpression(children.expression[0]));
    const isInList =
      (path.getNode(4) as JavaNonTerminal | null)?.name === "elementValue" ||
      (path.getNode(6) as JavaNonTerminal | null)?.name === "argumentList";
    return binary(operands, operators, {
      hasNonAssignmentOperators,
      isInList,
      isRoot: true,
      operatorPosition: options.experimentalOperatorPosition
    });
  },

  unaryExpression(path, print) {
    return [
      ...map(path, print, "UnaryPrefixOperator"),
      call(path, print, "primary"),
      ...map(path, print, "UnarySuffixOperator")
    ];
  },

  unaryExpressionNotPlusMinus(path, print) {
    const { children } = path.node;
    const expression: Doc[] = [];
    if (children.UnaryPrefixOperatorNotPlusMinus) {
      expression.push(...map(path, print, "UnaryPrefixOperatorNotPlusMinus"));
    }
    expression.push(call(path, print, "primary"));
    if (children.UnarySuffixOperator) {
      expression.push(...map(path, print, "UnarySuffixOperator"));
    }
    return join(" ", expression);
  },

  primary(path, print) {
    const { children } = path.node;
    if (!children.primarySuffix) {
      return call(path, print, "primaryPrefix");
    }
    const methodInvocations = children.primarySuffix
      .filter(({ children }) => children.methodInvocationSuffix)
      .map(({ children }) => children.methodInvocationSuffix![0].children);
    const hasLambdaMethodParameter = methodInvocations.some(
      ({ argumentList }) =>
        argumentList?.[0].children.expression.some(
          ({ children }) => children.lambdaExpression
        )
    );
    const prefixIsCallExpression =
      children.primaryPrefix[0].children.newExpression;
    const callExpressionCount =
      methodInvocations.length +
      (prefixIsCallExpression ? 1 : 0) +
      children.primarySuffix.filter(
        ({ children }) => children.unqualifiedClassInstanceCreationExpression
      ).length;
    const fqnOrRefType =
      children.primaryPrefix[0].children.fqnOrRefType?.[0].children;
    const prefixIsMethodInvocation =
      fqnOrRefType?.fqnOrRefTypePartRest !== undefined &&
      children.primarySuffix?.[0].children.methodInvocationSuffix !== undefined;
    const prefixIsStaticMethodInvocation =
      prefixIsMethodInvocation && isCapitalizedIdentifier(fqnOrRefType);
    const prefixIsInstanceMethodInvocation =
      prefixIsMethodInvocation && !prefixIsStaticMethodInvocation;
    const mustBreakForCallExpressions =
      methodInvocations.length > 2 && hasLambdaMethodParameter;
    const separator = mustBreakForCallExpressions ? hardline : softline;
    const prefix = [
      call(
        path,
        prefixPath =>
          print(prefixPath, {
            lastSeparator:
              prefixIsStaticMethodInvocation ||
              (prefixIsInstanceMethodInvocation && callExpressionCount === 1)
                ? ""
                : separator
          }),
        "primaryPrefix"
      )
    ];
    const canBreakForCallExpressions =
      callExpressionCount > 2 ||
      (callExpressionCount === 2 && prefixIsInstanceMethodInvocation) ||
      willBreak(prefix);
    const suffixes: Doc[] = [];
    each(
      path,
      suffixPath => {
        const { node, previous } = suffixPath;
        const suffix = print(suffixPath);
        if (node.children.Dot) {
          if (
            (canBreakForCallExpressions &&
              ((!previous && prefixIsCallExpression) ||
                previous?.children.methodInvocationSuffix ||
                previous?.children
                  .unqualifiedClassInstanceCreationExpression)) ||
            (!node.children.templateArgument && willBreak(suffix))
          ) {
            suffixes.push(separator);
          }
          suffixes.push(suffix);
        } else if (previous) {
          suffixes.push(suffix);
        } else {
          prefix.push(
            prefixIsInstanceMethodInvocation && callExpressionCount >= 2
              ? indent(suffix)
              : suffix
          );
        }
      },
      "primarySuffix"
    );
    const hasSuffixComments = children.primarySuffix.some(suffix =>
      hasLeadingComments(suffix)
    );
    return group(
      canBreakForCallExpressions || hasSuffixComments
        ? [prefix, indent(suffixes)]
        : [prefix, ...suffixes]
    );
  },

  primaryPrefix: printSingle,

  primarySuffix(path, print) {
    const { children } = path.node;
    if (!children.Dot) {
      return printSingle(path, print);
    }
    const suffix: Doc[] = ["."];
    if (children.This) {
      suffix.push("this");
    } else if (children.Identifier) {
      if (children.typeArguments) {
        suffix.push(call(path, print, "typeArguments"));
      }
      suffix.push(call(path, print, "Identifier"));
    } else {
      const suffixKey = onlyDefinedKey(children, [
        "templateArgument",
        "unqualifiedClassInstanceCreationExpression"
      ]);
      suffix.push(call(path, print, suffixKey));
    }
    return suffix;
  },

  fqnOrRefType(path, print, _, args) {
    const lastSeparator = (args as { lastSeparator?: Doc }).lastSeparator ?? "";
    const fqnOrRefType = [
      call(path, print, "fqnOrRefTypePartFirst"),
      ...map(
        path,
        partPath => {
          const part = print(partPath);
          return partPath.isLast
            ? [willBreak(part) ? hardline : lastSeparator, part]
            : part;
        },
        "fqnOrRefTypePartRest"
      )
    ];
    fqnOrRefType.push(indent(fqnOrRefType.pop()!));
    return path.node.children.dims
      ? [fqnOrRefType, call(path, print, "dims")]
      : fqnOrRefType;
  },

  fqnOrRefTypePartFirst(path, print) {
    return join(" ", [
      ...map(path, print, "annotation"),
      call(path, print, "fqnOrRefTypePartCommon")
    ]);
  },

  fqnOrRefTypePartRest(path, print) {
    const common = call(path, print, "fqnOrRefTypePartCommon");
    const type = path.node.children.typeArguments
      ? [call(path, print, "typeArguments"), common]
      : common;
    return [".", ...join(" ", [...map(path, print, "annotation"), type])];
  },

  fqnOrRefTypePartCommon(path, print) {
    const { children } = path.node;
    const keywordKey = onlyDefinedKey(children, ["Identifier", "Super"]);
    const keyword = call(path, print, keywordKey);
    return children.typeArguments
      ? [keyword, call(path, print, "typeArguments")]
      : keyword;
  },

  parenthesisExpression(path, print) {
    const expression = call(path, print, "expression");
    const ancestorName = (path.getNode(14) as JavaNonTerminal | null)?.name;
    const binaryExpression = path.getNode(8) as JavaNonTerminal | null;
    return ancestorName &&
      ["guard", "returnStatement"].includes(ancestorName) &&
      binaryExpression &&
      binaryExpression.name === "binaryExpression" &&
      Object.keys(binaryExpression.children).length === 1
      ? indentInParentheses(expression)
      : ["(", indent(expression), ")"];
  },

  castExpression: printSingle,

  primitiveCastExpression(path, print) {
    return [
      "(",
      call(path, print, "primitiveType"),
      ") ",
      call(path, print, "unaryExpression")
    ];
  },

  referenceTypeCastExpression(path, print) {
    const { children } = path.node;
    const type = call(path, print, "referenceType");
    const cast = children.additionalBound
      ? indentInParentheses(
          join(line, [type, ...map(path, print, "additionalBound")])
        )
      : ["(", type, ")"];
    const expressionKey = onlyDefinedKey(children, [
      "lambdaExpression",
      "unaryExpressionNotPlusMinus"
    ]);
    return [cast, " ", call(path, print, expressionKey)];
  },

  newExpression: printSingle,

  unqualifiedClassInstanceCreationExpression(path, print) {
    const { children } = path.node;
    const expression: Doc[] = ["new "];
    if (children.typeArguments) {
      expression.push(call(path, print, "typeArguments"));
    }
    expression.push(
      call(path, print, "classOrInterfaceTypeToInstantiate"),
      children.argumentList
        ? group(["(", call(path, print, "argumentList"), ")"])
        : "()"
    );
    if (children.classBody) {
      expression.push(" ", call(path, print, "classBody"));
    }
    return expression;
  },

  classOrInterfaceTypeToInstantiate(path, print) {
    const { children } = path.node;
    const type = children.annotation
      ? flatMap(
          path,
          childPath => [
            print(childPath),
            isNonTerminal(childPath.node) ? " " : "."
          ],
          ["annotation", "Identifier"]
        )
      : printName(path, print);
    if (children.typeArgumentsOrDiamond) {
      type.push(call(path, print, "typeArgumentsOrDiamond"));
    }
    return type;
  },

  typeArgumentsOrDiamond: printSingle,

  diamond() {
    return "<>";
  },

  methodInvocationSuffix(path, print) {
    return path.node.children.argumentList
      ? group(["(", call(path, print, "argumentList"), ")"])
      : indentInParentheses(printDanglingComments(path), { shouldBreak: true });
  },

  argumentList(path, print) {
    const expressions = path.node.children.expression;
    const lastExpression = expressions.at(
      -1
    ) as (typeof expressions)[number] & { comments?: JavaComment[] };
    const lastExpressionLambdaBodyExpression =
      lastExpression.children.lambdaExpression?.[0].children.lambdaBody[0]
        .children.expression?.[0].children;
    const lastExpressionLambdaBodyTernaryExpression =
      lastExpressionLambdaBodyExpression?.conditionalExpression?.[0].children;
    const isHuggable =
      !lastExpression.comments &&
      (!lastExpressionLambdaBodyExpression ||
        lastExpressionLambdaBodyTernaryExpression?.QuestionMark !== undefined ||
        lastExpressionLambdaBodyTernaryExpression?.binaryExpression?.[0]
          .children.unaryExpression.length === 1) &&
      expressions.findIndex(({ children }) => children.lambdaExpression) ===
        expressions.length - 1;
    const args = map(path, print, "expression");
    const allArgsExpandable = [
      indent([softline, ...join([",", line], args)]),
      softline
    ];
    if (!isHuggable || willBreak((args.at(-1) as Doc[])[0])) {
      return allArgsExpandable;
    }
    const headArgs = args.slice(0, -1);
    const huggedLastArg = path.call(
      argPath => print(argPath, { hug: true }),
      "children",
      "expression",
      args.length - 1
    );
    const lastArgExpanded = join(", ", [
      ...headArgs,
      group(huggedLastArg, { shouldBreak: true })
    ]);
    if (willBreak(huggedLastArg)) {
      return [
        breakParent,
        conditionalGroup([lastArgExpanded, allArgsExpandable])
      ];
    }
    return conditionalGroup([
      join(", ", [...headArgs, huggedLastArg]),
      lastArgExpanded,
      allArgsExpandable
    ]);
  },

  arrayCreationExpression(path, print) {
    const { children } = path.node;
    const typeKey = onlyDefinedKey(children, [
      "classOrInterfaceType",
      "primitiveType"
    ]);
    const suffixKey = onlyDefinedKey(children, [
      "arrayCreationExpressionWithoutInitializerSuffix",
      "arrayCreationWithInitializerSuffix"
    ]);
    return ["new ", call(path, print, typeKey), call(path, print, suffixKey)];
  },

  arrayCreationExpressionWithoutInitializerSuffix(path, print) {
    const expressions = call(path, print, "dimExprs");
    return path.node.children.dims
      ? [expressions, call(path, print, "dims")]
      : expressions;
  },

  arrayCreationWithInitializerSuffix(path, print) {
    return [
      call(path, print, "dims"),
      " ",
      call(path, print, "arrayInitializer")
    ];
  },

  dimExprs(path, print) {
    return map(path, print, "dimExpr");
  },

  dimExpr(path, print) {
    return join(" ", [
      ...map(path, print, "annotation"),
      ["[", call(path, print, "expression"), "]"]
    ]);
  },

  classLiteralSuffix(path, print) {
    const lSquares = map(path, print, "LSquare");
    const rSquares = map(path, print, "RSquare");
    return [
      ...lSquares.flatMap((lSquare, index) => [lSquare, rSquares[index]]),
      ".class"
    ];
  },

  arrayAccessSuffix(path, print) {
    return ["[", call(path, print, "expression"), "]"];
  },

  methodReferenceSuffix(path, print) {
    const { children } = path.node;
    const reference: Doc[] = ["::"];
    if (children.typeArguments) {
      reference.push(call(path, print, "typeArguments"));
    }
    reference.push(
      call(path, print, onlyDefinedKey(children, ["Identifier", "New"]))
    );
    return reference;
  },

  templateArgument: printSingle,
  template: printSingle,

  stringTemplate(path, print) {
    return printTemplate(
      path,
      print,
      "StringTemplateBegin",
      "StringTemplateMid",
      "StringTemplateEnd"
    );
  },

  textBlockTemplate(path, print) {
    return printTemplate(
      path,
      print,
      "TextBlockTemplateBegin",
      "TextBlockTemplateMid",
      "TextBlockTemplateEnd"
    );
  },

  embeddedExpression: printSingle,
  pattern: printSingle,
  typePattern: printSingle,

  recordPattern(path, print) {
    const patterns = path.node.children.componentPatternList
      ? indentInParentheses(call(path, print, "componentPatternList"))
      : "()";
    return [call(path, print, "referenceType"), patterns];
  },

  componentPatternList(path, print) {
    return printList(path, print, "componentPattern");
  },

  componentPattern: printSingle,
  matchAllPattern: printSingle,

  guard(path, print) {
    const expression = call(path, print, "expression");
    const hasParentheses =
      path.node.children.expression[0].children.conditionalExpression?.[0]
        .children.binaryExpression[0].children.unaryExpression[0].children
        .primary[0].children.primaryPrefix[0].children.parenthesisExpression !==
      undefined;
    return [
      "when ",
      hasParentheses
        ? expression
        : group([
            ifBreak("("),
            indent([softline, expression]),
            softline,
            ifBreak(")")
          ])
    ];
  }
} satisfies Partial<JavaNodePrinters>;

function binary(
  operands: Doc[],
  operators: { image: string; doc: Doc }[],
  {
    hasNonAssignmentOperators = false,
    isInList = false,
    isRoot = false,
    operatorPosition
  }: {
    hasNonAssignmentOperators?: boolean;
    isInList?: boolean;
    isRoot?: boolean;
    operatorPosition: "end" | "start";
  }
): Doc {
  let levelOperator: string | undefined;
  let levelPrecedence: number | undefined;
  let level: Doc[] = [];
  while (operators.length) {
    const nextOperator = operators[0].image;
    const nextPrecedence = getOperatorPrecedence(nextOperator);

    if (levelPrecedence === undefined || nextPrecedence === levelPrecedence) {
      const { image: operator, doc: operatorDoc } = operators.shift()!;
      level.push(operands.shift()!);
      if (
        levelOperator !== undefined &&
        needsParentheses(levelOperator, operator)
      ) {
        level = [["(", group(indent(level)), ")"]];
      }
      const parts = [" ", operatorDoc, line];
      if (operatorPosition === "start" && !isAssignmentOperator(operator)) {
        parts.reverse();
      }
      level.push(parts);
      levelOperator = operator;
      levelPrecedence = nextPrecedence;
    } else if (nextPrecedence < levelPrecedence) {
      if (!isRoot) {
        break;
      }
      level.push(operands.shift()!);
      const content = group(indent(level));
      operands.unshift(
        levelOperator !== undefined &&
          needsParentheses(levelOperator, nextOperator)
          ? ["(", content, ")"]
          : content
      );
      level = [];
      levelOperator = undefined;
      levelPrecedence = undefined;
    } else {
      const content = binary(operands, operators, { operatorPosition });
      operands.unshift(
        levelOperator !== undefined &&
          needsParentheses(nextOperator, levelOperator)
          ? ["(", indent(content), ")"]
          : content
      );
    }
  }
  level.push(operands.shift()!);
  if (
    !levelOperator ||
    (!isInList &&
      !isAssignmentOperator(levelOperator) &&
      levelOperator !== "instanceof")
  ) {
    return group(level);
  }
  if (!isRoot || hasNonAssignmentOperators) {
    return group(indent(level));
  }
  const groupId = Symbol("assignment");
  return group([
    level[0],
    group(indent(level[1]), { id: groupId }),
    indentIfBreak(level[2], { groupId })
  ]);
}

const precedencesByOperator = new Map(
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
function getOperatorPrecedence(operator: string) {
  return precedencesByOperator.get(operator) ?? -1;
}

function needsParentheses(operator: string, parentOperator: string) {
  return (
    (operator === "&&" && parentOperator === "||") ||
    (["|", "^", "&", "<<", ">>", ">>>"].includes(parentOperator) &&
      getOperatorPrecedence(operator) >
        getOperatorPrecedence(parentOperator)) ||
    [operator, parentOperator].every(o => ["==", "!="].includes(o)) ||
    [operator, parentOperator].every(o => ["<<", ">>", ">>>"].includes(o)) ||
    (operator === "*" && parentOperator === "/") ||
    (operator === "/" && parentOperator === "*") ||
    (operator === "%" && ["+", "-", "*", "/"].includes(parentOperator)) ||
    (["*", "/"].includes(operator) && parentOperator === "%")
  );
}

const assignmentOperators = new Set([
  "=",
  "*=",
  "/=",
  "%=",
  "+=",
  "-=",
  "<<=",
  ">>=",
  ">>>=",
  "&=",
  "^=",
  "|="
]);
function isAssignmentOperator(operator: string) {
  return assignmentOperators.has(operator);
}

function isCapitalizedIdentifier(fqnOrRefType: FqnOrRefTypeCtx) {
  const nextToLastIdentifier = [
    fqnOrRefType.fqnOrRefTypePartFirst[0],
    ...(fqnOrRefType.fqnOrRefTypePartRest ?? [])
  ].at(-2)?.children.fqnOrRefTypePartCommon[0].children.Identifier?.[0].image;
  return /^\p{Uppercase_Letter}/u.test(nextToLastIdentifier ?? "");
}

function printTemplate<
  T extends StringTemplateCstNode | TextBlockTemplateCstNode,
  C extends Exclude<IterProperties<T["children"]>, "embeddedExpression">
>(path: AstPath<T>, print: JavaPrintFn, beginKey: C, midKey: C, endKey: C) {
  const begin = call(path, ({ node }) => node.image, beginKey);
  const mids = map(path, ({ node }) => node.image, midKey);
  const end = call(path, ({ node }) => node.image, endKey);
  const lines = [begin, ...mids, end].join("").split("\n").slice(1);
  const baseIndent = findBaseIndent(lines);
  const prefix = "\n" + " ".repeat(baseIndent);
  const parts = [begin, ...mids, end].map(image =>
    join(hardline, image.split(prefix))
  );
  return indent([
    parts[0],
    ...map(
      path,
      (expressionPath, index) => {
        const expression = group([
          indent([softline, print(expressionPath), lineSuffixBoundary]),
          softline
        ]);
        return index === 0 ? expression : [parts[index], expression];
      },
      "embeddedExpression" as IterProperties<T["children"]>
    ),
    parts.at(-1)!
  ]);
}
