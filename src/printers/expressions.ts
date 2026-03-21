import { util, type Doc } from "prettier";
import { builders, utils } from "prettier/doc";
import { printComments, printCommentsSeparately } from "../comments.ts";
import { SyntaxType, type NamedNode } from "../node-types.ts";
import {
  hasChild,
  hasLeadingComments,
  hasType,
  indentInParentheses,
  printDanglingComments,
  type JavaParserOptions,
  type NamedNodePath,
  type NamedNodePrinters,
  type PrintFunction
} from "./helpers.ts";

const {
  align,
  breakParent,
  conditionalGroup,
  group,
  hardline,
  ifBreak,
  indent,
  indentIfBreak,
  join,
  line,
  softline
} = builders;
const { getNextNonSpaceNonCommentCharacterIndex, hasNewline, isNextLineEmpty } =
  util;
const { removeLines, willBreak } = utils;

export default {
  lambda_expression(path, print, options, args) {
    const signatureDocs: Doc[] = [];
    let bodyDoc: Doc | undefined;
    const bodyComments: Doc[] = [];
    const shouldPrintAsChain =
      !(
        args &&
        typeof args === "object" &&
        "expandLastArg" in args &&
        args.expandLastArg
      ) && path.node.bodyNode.type === SyntaxType.LambdaExpression;
    let functionBody: typeof path.node.bodyNode | undefined;

    (function rec() {
      const { node } = path;
      const signatureDoc = printLambdaExpressionSignature(
        path,
        options,
        print,
        args
      );
      if (signatureDocs.length === 0) {
        signatureDocs.push(signatureDoc);
      } else {
        const { leading, trailing } = printCommentsSeparately(path);
        signatureDocs.push([leading, signatureDoc]);
        bodyComments.unshift(trailing);
      }

      if (
        !shouldPrintAsChain ||
        node.bodyNode.type !== SyntaxType.LambdaExpression
      ) {
        bodyDoc = path.call(child => print(child, args), "bodyNode");
        functionBody = node.bodyNode;
      } else {
        path.call(rec, "bodyNode");
      }
    })();

    // We want to always keep these types of nodes on the same line
    // as the arrow.
    const shouldPutBodyOnSameLine =
      !functionBody!.comments?.some(
        ({ leading }) =>
          leading && hasNewline(options.originalText, functionBody!.end.index)
      ) && mayBreakAfterShortPrefix(functionBody!);

    const isCallee =
      path.node.fieldName === "object" &&
      (path.parent as NamedNode | null)?.type === SyntaxType.MethodInvocation;
    const chainGroupId = Symbol("arrow-chain");

    const signaturesDoc = printArrowFunctionSignatures(path, {
      signatureDocs
    });
    let shouldBreakSignatures = false;
    let shouldIndentSignatures = false;
    let shouldPrintSoftlineInIndent = false;
    if (shouldPrintAsChain && isCallee) {
      shouldIndentSignatures = true;
      // If the lambda expression has a leading line comment, there should be a
      // hardline above it so we should not print a softline in indent call
      shouldPrintSoftlineInIndent = !path.node.comments?.some(
        ({ type, leading }) => leading && type === SyntaxType.LineComment
      );
      shouldBreakSignatures = isCallee && !shouldPutBodyOnSameLine;
    }

    // if the arrow function is expanded as last argument, we are adding a
    // level of indentation and need to add a softline to align the closing )
    // with the opening (.
    const trailingSpace =
      args &&
      typeof args === "object" &&
      "expandLastArg" in args &&
      args.expandLastArg &&
      !path.node.comments
        ? softline
        : "";

    bodyDoc = shouldPutBodyOnSameLine
      ? [" ", bodyDoc!, bodyComments]
      : [indent([line, bodyDoc!, bodyComments]), trailingSpace];

    return group([
      group(
        shouldIndentSignatures
          ? indent([shouldPrintSoftlineInIndent ? softline : "", signaturesDoc])
          : signaturesDoc,
        { shouldBreak: shouldBreakSignatures, id: chainGroupId }
      ),
      " ->",
      shouldPrintAsChain
        ? indentIfBreak(bodyDoc, { groupId: chainGroupId })
        : group(bodyDoc),
      shouldPrintAsChain && isCallee
        ? ifBreak(softline, "", { groupId: chainGroupId })
        : ""
    ]);
  },

  inferred_parameters(path, print, options) {
    const identifiers: Doc[] = [];
    path.each(child => {
      if (child.node.type === SyntaxType.Identifier) {
        identifiers.push(print(child));
      }
    }, "namedChildren");

    if (!identifiers.length) {
      return "()";
    }

    const parameters = join([",", line], identifiers);
    if (identifiers.length > 1) {
      return group(indentInParentheses(parameters));
    }
    return options.arrowParens === "avoid"
      ? parameters
      : ["(", ...parameters, ")"];
  },

  ternary_expression(path, print, options) {
    const condition = path.call(print, "conditionNode");
    const consequence = path.call(print, "consequenceNode");
    const alternative = path.call(print, "alternativeNode");

    const parentType = path.parent?.type;
    const isNestedTernary = parentType === SyntaxType.TernaryExpression;
    const suffix = [
      line,
      ["? ", options.useTabs ? indent(consequence) : align(2, consequence)],
      line,
      [": ", options.useTabs ? indent(alternative) : align(2, alternative)]
    ];

    const prefix = group(condition);
    const alignedSuffix =
      !isNestedTernary || options.useTabs
        ? suffix
        : align(Math.max(0, options.tabWidth - 2), suffix);

    if (isNestedTernary) {
      return [prefix, alignedSuffix];
    }

    const parts = [prefix, indent(alignedSuffix)];
    return parentType === SyntaxType.ParenthesizedExpression
      ? parts
      : group(parts);
  },

  assignment_expression(path, print) {
    const { operatorNode, rightNode } = path.node;
    const parts = [path.call(print, "leftNode"), " ", operatorNode.type];
    const right = path.call(print, "rightNode");

    if (
      rightNode.type === SyntaxType.BinaryExpression ||
      (rightNode.type === SyntaxType.TernaryExpression &&
        rightNode.conditionNode.type === SyntaxType.BinaryExpression) ||
      hasLeadingComments(rightNode)
    ) {
      parts.push(group(indent([line, right])));
    } else {
      const groupId = Symbol("assignment");
      parts.push(
        group(indent(line), { id: groupId }),
        indentIfBreak(right, { groupId })
      );
    }

    return parts;
  },

  binary_expression(path, print, options) {
    const { node } = path;
    const parent = path.parent as NamedNode | null;
    const grandparent = path.grandparent as NamedNode | null;
    const isInsideParentheses =
      (parent?.fieldName === "condition" &&
        (grandparent?.type === SyntaxType.IfStatement ||
          grandparent?.type === SyntaxType.WhileStatement ||
          grandparent?.type === SyntaxType.SwitchExpression ||
          grandparent?.type === SyntaxType.DoStatement)) ||
      (parent?.fieldName !== "body" &&
        grandparent?.type === SyntaxType.SynchronizedStatement);

    const parts = printBinaryExpressions(
      path,
      print,
      options,
      isInsideParentheses
    );

    if (isInsideParentheses) {
      return parts;
    }

    if (
      (parent?.fieldName === "object" &&
        (grandparent?.type === SyntaxType.MethodInvocation ||
          grandparent?.type === SyntaxType.ExplicitConstructorInvocation ||
          grandparent?.type === SyntaxType.FieldAccess)) ||
      grandparent?.type === SyntaxType.MethodReference
    ) {
      return parts;
    }

    // Avoid indenting sub-expressions in some cases where the first sub-expression is already
    // indented accordingly. We should indent sub-expressions where the first case isn't indented.
    const shouldNotIndent =
      parent?.type === SyntaxType.ReturnStatement ||
      parent?.type === SyntaxType.ThrowStatement ||
      parent?.type === SyntaxType.ParenthesizedExpression ||
      parent?.type === SyntaxType.AssignmentExpression ||
      parent?.type === SyntaxType.VariableDeclarator ||
      parent?.type === SyntaxType.Guard ||
      (node.fieldName === "body" &&
        parent?.type === SyntaxType.LambdaExpression) ||
      (node.fieldName !== "body" && parent?.type === SyntaxType.ForStatement) ||
      (parent?.type === SyntaxType.TernaryExpression &&
        grandparent?.type !== SyntaxType.ReturnStatement &&
        grandparent?.type !== SyntaxType.ThrowStatement &&
        grandparent?.type !== SyntaxType.ParenthesizedExpression &&
        grandparent?.type !== SyntaxType.ArgumentList) ||
      (node.fieldName === "operand" &&
        parent?.type === SyntaxType.UnaryExpression);

    if (shouldNotIndent) {
      return group(parts);
    }

    if (parts.length === 0) {
      return "";
    }

    const firstGroupIndex = parts.findIndex(
      part =>
        typeof part !== "string" &&
        !Array.isArray(part) &&
        part.type === "group"
    );

    // Separate the leftmost expression, possibly with its leading comments.
    const headParts = parts.slice(
      0,
      firstGroupIndex === -1 ? 1 : firstGroupIndex + 1
    );

    const rest = parts.slice(headParts.length);

    return group([
      // Don't include the initial expression in the indentation
      // level. The first item is guaranteed to be the first
      // left-most expression.
      ...headParts,
      indent(rest)
    ]);
  },

  instanceof_expression(path, print, options) {
    return group(
      indent(
        path.map(child => {
          if (!child.previous) {
            return print(child);
          }

          const separator = (
            options.experimentalOperatorPosition === "start"
              ? child.node.type === "instanceof"
              : child.previous.type === "instanceof"
          )
            ? line
            : " ";

          return [separator, print(child)];
        }, "children")
      )
    );
  },

  unary_expression(path, print) {
    return path.map(print, "children");
  },

  field_access: printMemberChain,

  generic_type(path, print) {
    const typeIdentifierIndex = path.node.namedChildren.findIndex(
      ({ type }) =>
        type === SyntaxType.ScopedTypeIdentifier ||
        type === SyntaxType.TypeIdentifier
    );
    const typeArgumentsIndex = path.node.namedChildren.findIndex(
      ({ type }) => type === SyntaxType.TypeArguments
    );
    return [
      path.call(print, "namedChildren", typeIdentifierIndex),
      path.call(print, "namedChildren", typeArgumentsIndex)
    ];
  },

  parenthesized_expression(path, print) {
    const expression = path.call(print, "namedChildren", 0);
    const parentType = (path.parent as NamedNode | null)?.type;
    const grandparentType = (path.grandparent as NamedNode | null)?.type;
    const expressionType = path.node.namedChildren[0].type;
    const hasLambda = expressionType === SyntaxType.LambdaExpression;
    const hasTernary = expressionType === SyntaxType.TernaryExpression;
    const hasSuffix =
      parentType &&
      (parentType === SyntaxType.ArrayAccess ||
        parentType === SyntaxType.ExplicitConstructorInvocation ||
        parentType === SyntaxType.FieldAccess ||
        parentType === SyntaxType.MethodInvocation ||
        parentType === SyntaxType.MethodReference ||
        parentType === SyntaxType.ObjectCreationExpression);
    const isAssignment =
      (parentType &&
        (parentType === SyntaxType.AssignmentExpression ||
          parentType === SyntaxType.VariableDeclarator)) ||
      (hasSuffix &&
        (grandparentType === SyntaxType.AssignmentExpression ||
          grandparentType === SyntaxType.VariableDeclarator));
    if (!hasLambda && hasSuffix && (!hasTernary || isAssignment)) {
      return group(
        indentInParentheses(hasTernary ? group(expression) : expression)
      );
    } else if (
      parentType &&
      (parentType === SyntaxType.Guard ||
        parentType === SyntaxType.ReturnStatement ||
        (parentType === SyntaxType.UnaryExpression &&
          grandparentType === SyntaxType.ReturnStatement) ||
        (path.node.fieldName === "condition" &&
          (parentType === SyntaxType.DoStatement ||
            parentType === SyntaxType.IfStatement ||
            parentType === SyntaxType.SwitchExpression ||
            parentType === SyntaxType.WhileStatement)) ||
        (path.node.fieldName !== "body" &&
          parentType === SyntaxType.SynchronizedStatement))
    ) {
      return group(indentInParentheses(group(expression)));
    } else if (hasTernary && hasSuffix && !isAssignment) {
      return group(["(", expression, softline, ")"]);
    } else {
      return group([
        "(",
        hasLambda || hasTernary ? expression : indent(expression),
        ")"
      ]);
    }
  },

  cast_expression(path, print) {
    const types = path.map(print, "typeNodes");
    const value = path.call(print, "valueNode");

    return types.length > 1
      ? [group(indentInParentheses(join([line, "& "], types))), " ", value]
      : ["(", ...types, ") ", value];
  },

  object_creation_expression(path, print) {
    const expression: Doc[] = [];

    path.each(child => {
      if (child.node.type === SyntaxType.ClassBody) {
        expression.push(" ");
      }

      expression.push(print(child));

      if (
        child.node.type === SyntaxType.Annotation ||
        child.node.type === SyntaxType.MarkerAnnotation ||
        child.node.type === "new"
      ) {
        expression.push(" ");
      }
    }, "children");

    return expression;
  },

  method_invocation: printMemberChain,

  argument_list(path, print, options) {
    const args = path.node.namedChildren;

    if (args.length === 0) {
      const shouldBreak = path.node.comments?.some(
        ({ type, leading, trailing }) =>
          !leading && !trailing && type === SyntaxType.LineComment
      );
      return group(indentInParentheses(printDanglingComments(path)), {
        shouldBreak
      });
    }

    const lastArgIndex = args.length - 1;

    let anyArgEmptyLine = false;
    const printedArguments: Doc[] = [];
    path.each((arg, index) => {
      let argDoc = print(arg);

      if (index === lastArgIndex) {
        // do nothing
      } else if (isNextLineEmpty(options.originalText, arg.node.end.index)) {
        anyArgEmptyLine = true;
        argDoc = [argDoc, ",", hardline, hardline];
      } else {
        argDoc = [argDoc, ",", line];
      }

      printedArguments.push(argDoc);
    }, "namedChildren");

    function allArgsBrokenOut() {
      return group(["(", indent([line, ...printedArguments]), line, ")"], {
        shouldBreak: true
      });
    }

    if (anyArgEmptyLine) {
      return allArgsBrokenOut();
    }

    if (shouldExpandFirstArg(args)) {
      const tailArgs = printedArguments.slice(1);
      if (tailArgs.some(willBreak)) {
        return allArgsBrokenOut();
      }
      let firstArg: Doc;
      try {
        firstArg = path.call(
          arg => print(arg, { expandFirstArg: true }),
          "namedChildren",
          0
        );
      } catch (caught) {
        if (caught instanceof ArgExpansionBailout) {
          return allArgsBrokenOut();
        }
        throw caught;
      }

      if (willBreak(firstArg)) {
        return [
          breakParent,
          conditionalGroup([
            [
              "(",
              group(firstArg, { shouldBreak: true }),
              ", ",
              ...tailArgs,
              ")"
            ],
            allArgsBrokenOut()
          ])
        ];
      }

      return conditionalGroup([
        ["(", firstArg, ", ", ...tailArgs, ")"],
        ["(", group(firstArg, { shouldBreak: true }), ", ", ...tailArgs, ")"],
        allArgsBrokenOut()
      ]);
    }

    if (shouldExpandLastArg(args)) {
      const headArgs = printedArguments.slice(0, -1);
      if (headArgs.some(willBreak)) {
        return allArgsBrokenOut();
      }
      let lastArg: Doc;
      try {
        lastArg = path.call(
          arg =>
            print(arg, {
              expandLastArg: true
            }),
          "namedChildren",
          lastArgIndex
        );
      } catch (caught) {
        if (caught instanceof ArgExpansionBailout) {
          return allArgsBrokenOut();
        }
        throw caught;
      }

      if (willBreak(lastArg)) {
        return [
          breakParent,
          conditionalGroup([
            ["(", ...headArgs, group(lastArg, { shouldBreak: true }), ")"],
            allArgsBrokenOut()
          ])
        ];
      }

      return conditionalGroup([
        ["(", ...headArgs, lastArg, ")"],
        ["(", ...headArgs, group(lastArg, { shouldBreak: true }), ")"],
        allArgsBrokenOut()
      ]);
    }

    return group(indentInParentheses(printedArguments), {
      shouldBreak: printedArguments.some(willBreak) || anyArgEmptyLine
    });
  },

  array_creation_expression(path, print) {
    const parts: Doc[] = ["new "];

    path.each(child => {
      if (
        child.node.type === SyntaxType.Annotation ||
        child.node.type === SyntaxType.MarkerAnnotation
      ) {
        parts.push(print(child), " ");
      }
    }, "namedChildren");

    parts.push(
      path.call(print, "typeNode"),
      ...path.map(print, "dimensionsNodes")
    );

    if (hasChild(path, "valueNode")) {
      parts.push(" ", path.call(print, "valueNode"));
    }

    return parts;
  },

  dimensions_expr(path, print) {
    return path.map(
      child =>
        child.node.type === SyntaxType.Annotation ||
        child.node.type === SyntaxType.MarkerAnnotation
          ? [print(child), " "]
          : ["[", print(child), "]"],
      "namedChildren"
    );
  },

  class_literal(path, print) {
    return [path.call(print, "namedChildren", 0), ".class"];
  },

  array_access: printMemberChain,

  method_reference(path, print) {
    return path.map(print, "children");
  },

  template_expression(path, print) {
    return [
      path.call(print, "template_processorNode"),
      ".",
      path.call(print, "template_argumentNode")
    ];
  },

  pattern(path, print) {
    return path.call(print, "namedChildren", 0);
  },

  type_pattern(path, print) {
    return join(" ", path.map(print, "children"));
  },

  record_pattern(path, print) {
    return path.map(print, "children");
  },

  record_pattern_body(path, print) {
    return group(
      indentInParentheses(join([",", line], path.map(print, "namedChildren")))
    );
  },

  record_pattern_component(path, print) {
    return join(" ", path.map(print, "children"));
  },

  guard(path, print) {
    const hasParentheses =
      path.node.namedChildren[0].type === SyntaxType.ParenthesizedExpression;
    const expression = path.call(print, "namedChildren", 0);

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
} satisfies Partial<NamedNodePrinters>;

function printLambdaExpressionSignature(
  path: NamedNodePath<SyntaxType.LambdaExpression>,
  options: JavaParserOptions,
  print: PrintFunction,
  args: unknown
) {
  const parts: Doc[] = [];

  const parameters = path.call(print, "parametersNode");
  if (shouldPrintParamsWithoutParens(path, options)) {
    parts.push(parameters);
  } else {
    const shouldExpandParameters =
      args != null &&
      typeof args === "object" &&
      (("expandLastArg" in args && args.expandLastArg === true) ||
        ("expandFirstArg" in args && args.expandFirstArg === true));

    // If the parent is a call with the first/last argument expansion and this
    // is the params of the first/last argument, we don't want the arguments to
    // break and instead want the whole expression to be on a new line.
    //
    // Good:                 Bad:
    //   verylongcall(         verylongcall((
    //     (a, b) => {           a,
    //     }                     b,
    //   )                     ) => {
    //                         })
    if (shouldExpandParameters) {
      if (willBreak(parameters)) {
        // Removing lines in this case leads to broken or ugly output
        throw new ArgExpansionBailout();
      }
      parts.push(group(removeLines(parameters)));
    } else {
      parts.push(parameters);
    }
  }

  const dangling = printDanglingComments(path);
  if (dangling.length) {
    parts.push(" ", dangling);
  }
  return parts;
}

function mayBreakAfterShortPrefix(functionBody: NamedNode) {
  return (
    functionBody.type === SyntaxType.ArrayCreationExpression ||
    functionBody.type === SyntaxType.LambdaExpression ||
    functionBody.type === SyntaxType.Block
  );
}

function printArrowFunctionSignatures(
  path: NamedNodePath,
  { signatureDocs }: { signatureDocs: Doc[] }
) {
  if (signatureDocs.length === 1) {
    return signatureDocs[0];
  }

  const { node, parent } = path;
  if (
    (node.fieldName !== "object" &&
      parent?.type === SyntaxType.MethodInvocation) ||
    parent?.type === SyntaxType.BinaryExpression
  ) {
    return group([
      signatureDocs[0],
      " ->",
      indent([line, join([" ->", line], signatureDocs.slice(1))])
    ]);
  }

  if (
    node.fieldName === "object" &&
    parent?.type === SyntaxType.MethodInvocation
  ) {
    return group(join([" ->", line], signatureDocs));
  }

  return group(indent(join([" ->", line], signatureDocs)));
}

function shouldPrintParamsWithoutParens(
  path: NamedNodePath<SyntaxType.LambdaExpression>,
  options: JavaParserOptions
) {
  if (options.arrowParens === "always") {
    return false;
  }

  if (options.arrowParens === "avoid") {
    const { node } = path;
    return canPrintParamsWithoutParens(node);
  }

  // Fallback default; should be unreachable
  return false;
}

function canPrintParamsWithoutParens(
  node: NamedNode<SyntaxType.LambdaExpression>
) {
  return (
    node.parametersNode.type === SyntaxType.Identifier &&
    !node.comments?.some(({ leading, trailing }) => !leading && !trailing) &&
    !node.parametersNode.comments
  );
}

function printMemberChain(
  path: NamedNodePath<
    | SyntaxType.ArrayAccess
    | SyntaxType.FieldAccess
    | SyntaxType.MethodInvocation
  >,
  print: PrintFunction,
  options: JavaParserOptions
) {
  const isExpressionStatement =
    (path.parent as NamedNode | null)?.type === SyntaxType.ExpressionStatement;

  // The first phase is to linearize the AST by traversing it down.
  //
  //   a().b()
  // has the following AST structure:
  //   MethodInvocation(MethodInvocation)
  // and we transform it into
  //   [MethodInvocation, MethodInvocation]
  const printedNodes: {
    node: NamedNode;
    hasTrailingEmptyLine?: boolean;
    printed: Doc;
  }[] = [];

  // Here we try to retain one typed empty line after each call expression or
  // the first group whether it is in parentheses or not
  function shouldInsertEmptyLineAfter(node: NamedNode) {
    const { originalText } = options;
    const nextCharIndex = getNextNonSpaceNonCommentCharacterIndex(
      originalText,
      node.end.index
    );
    const nextChar = nextCharIndex ? originalText.charAt(nextCharIndex) : "";

    // if it is cut off by a parenthesis, we only account for one typed empty
    // line after that parenthesis
    if (nextChar === ")") {
      return (
        nextCharIndex !== false &&
        isNextLineEmpty(originalText, nextCharIndex + 1)
      );
    }

    return isNextLineEmpty(originalText, node.end.index);
  }

  function rec(path: NamedNodePath) {
    const { node } = path;

    if (
      hasType(path, SyntaxType.MethodInvocation) &&
      hasChild(path, "objectNode")
    ) {
      const hasTrailingEmptyLine = shouldInsertEmptyLineAfter(node);
      printedNodes.unshift({
        node,
        hasTrailingEmptyLine,
        printed: [
          printComments(path, printMethodInvocation(path, print)),
          hasTrailingEmptyLine ? hardline : ""
        ]
      });
      path.call(rec, "objectNode");
    } else if (hasType(path, SyntaxType.ArrayAccess)) {
      printedNodes.unshift({
        node,
        printed: printComments(path, printArrayAccess(path, print))
      });
      path.call(rec, "arrayNode");
    } else if (hasType(path, SyntaxType.FieldAccess)) {
      printedNodes.unshift({
        node,
        printed: printComments(path, printFieldAccess(path, print))
      });
      path.call(rec, "objectNode");
    } else {
      printedNodes.unshift({
        node,
        printed: print(path)
      });
    }
  }

  const { node } = path;
  if (hasType(path, SyntaxType.MethodInvocation)) {
    printedNodes.unshift({
      node,
      printed: printComments(path, printMethodInvocation(path, print))
    });

    if (hasChild(path, "objectNode")) {
      path.call(rec, "objectNode");
    }
  } else if (hasType(path, SyntaxType.ArrayAccess)) {
    printedNodes.unshift({
      node,
      printed: printComments(path, printArrayAccess(path, print))
    });

    if (hasChild(path, "arrayNode")) {
      path.call(rec, "arrayNode");
    }
  } else if (hasType(path, SyntaxType.FieldAccess)) {
    printedNodes.unshift({
      node,
      printed: printComments(path, printFieldAccess(path, print))
    });

    if (hasChild(path, "objectNode")) {
      path.call(rec, "objectNode");
    }
  }

  const danglingComments = printDanglingComments(path);
  if (danglingComments.length) {
    printedNodes[0].printed = [
      ...danglingComments,
      hardline,
      printedNodes[0].printed
    ];
  }

  // Once we have a linear list of printed nodes, we want to create groups out
  // of it.
  //
  //   a().b.c().d().e
  // will be grouped as
  //   [
  //     [MethodInvocation],
  //     [FieldAccess, MethodInvocation],
  //     [MethodInvocation],
  //     [FieldAccess],
  //   ]
  // so that we can print it as
  //   a()
  //     .b.c()
  //     .d()
  //     .e

  // The first group is the first node followed by
  //   - as many ArrayAccess as possible
  //       < fn()[0][1][2] >.something()
  //   - then, as many FieldAccess as possible
  //       < this.items >.something()
  const groups: (typeof printedNodes)[] = [];
  let currentGroup = [printedNodes[0]];
  let i = 1;
  for (; i < printedNodes.length; ++i) {
    if (printedNodes[i].node.type === SyntaxType.ArrayAccess) {
      currentGroup.push(printedNodes[i]);
    } else {
      break;
    }
  }
  if (printedNodes[0].node.type !== SyntaxType.MethodInvocation) {
    for (; i + 1 < printedNodes.length; ++i) {
      if (printedNodes[i].node.type !== SyntaxType.MethodInvocation) {
        currentGroup.push(printedNodes[i]);
      } else {
        break;
      }
    }
  }
  groups.push(currentGroup);
  currentGroup = [];

  // Then, each following group is a sequence of FieldAccess followed by
  // a MethodInvocation. To compute it, we keep adding things to the
  // group until we have seen a MethodInvocation in the past and reach a
  // FieldAccess or MethodInvocation
  let hasSeenMethodInvocation = false;
  for (; i < printedNodes.length; ++i) {
    if (hasSeenMethodInvocation) {
      // [0] should be appended at the end of the group instead of the
      // beginning of the next one
      if (printedNodes[i].node.type === SyntaxType.ArrayAccess) {
        currentGroup.push(printedNodes[i]);
        continue;
      }

      groups.push(currentGroup);
      currentGroup = [];
      hasSeenMethodInvocation = false;
    }

    if (printedNodes[i].node.type === SyntaxType.MethodInvocation) {
      hasSeenMethodInvocation = true;
    }
    currentGroup.push(printedNodes[i]);

    if (printedNodes[i].node.comments?.some(({ trailing }) => trailing)) {
      groups.push(currentGroup);
      currentGroup = [];
      hasSeenMethodInvocation = false;
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  // There are cases like Object.keys(), Observable.of(), _.values() where
  // they are the subject of all the chained calls and therefore should
  // be kept on the same line:
  //
  //   Object.keys(items)
  //     .filter(x -> x)
  //     .map(x -> x)
  //
  // In order to detect those cases, we use an heuristic: if the first
  // node is an identifier with the name starting with a capital
  // letter or just a sequence of _$. The rationale is that they are
  // likely to be factories.
  function isFactory(name: string) {
    return /^[A-Z]|^[$_]+$/.test(name);
  }

  // In case the Identifier is shorter than tab width, we can keep the
  // first call in a single line, if it's an ExpressionStatement.
  //
  //   d3.scaleLinear()
  //     .domain(0, 100)
  //     .range(0, width);
  //
  function isShort(name: string) {
    return name.length <= options.tabWidth;
  }

  function shouldNotWrap(groups: (typeof printedNodes)[]) {
    const hasArrayAccess = groups[1][0]?.node.type === SyntaxType.ArrayAccess;

    if (groups[0].length === 1) {
      const firstNode = groups[0][0].node;
      return (
        firstNode.type === "this" ||
        (firstNode.type === SyntaxType.Identifier &&
          (isFactory(firstNode.value) ||
            (isExpressionStatement && isShort(firstNode.value)) ||
            hasArrayAccess))
      );
    }

    const lastNode = groups[0].at(-1)!.node;
    return (
      lastNode.type === SyntaxType.FieldAccess &&
      lastNode.fieldNode.type === SyntaxType.Identifier &&
      (isFactory(lastNode.fieldNode.value) || hasArrayAccess)
    );
  }

  const shouldMerge =
    groups.length >= 2 &&
    !groups[1][0].node.comments?.length &&
    shouldNotWrap(groups);

  function printGroup(printedGroup: typeof printedNodes) {
    return printedGroup.map(tuple => tuple.printed);
  }

  function printIndentedGroup(groups: (typeof printedNodes)[]) {
    if (groups.length === 0) {
      return "";
    }
    return indent([hardline, join(hardline, groups.map(printGroup))]);
  }

  const printedGroups = groups.map(printGroup);
  const oneLine = printedGroups;

  const cutoff = shouldMerge ? 3 : 2;
  const flatGroups = groups.flat();

  const nodeHasComment = flatGroups.some(node =>
    node.node.comments?.some(({ leading, trailing }) => leading || trailing)
  );

  // If we only have a single `.`, we shouldn't do anything fancy and just
  // render everything concatenated together.
  if (
    groups.length <= cutoff &&
    !nodeHasComment &&
    !groups.some(g => g.at(-1)!.hasTrailingEmptyLine)
  ) {
    return group(oneLine);
  }

  // Find out the last node in the first group and check if it has an
  // empty line after
  const lastNodeBeforeIndent = groups[shouldMerge ? 1 : 0].at(-1)!.node;
  const shouldHaveEmptyLineBeforeIndent =
    lastNodeBeforeIndent.type !== SyntaxType.MethodInvocation &&
    shouldInsertEmptyLineAfter(lastNodeBeforeIndent);

  const expanded = [
    printGroup(groups[0]),
    shouldMerge ? groups.slice(1, 2).map(printGroup) : "",
    shouldHaveEmptyLineBeforeIndent ? hardline : "",
    printIndentedGroup(groups.slice(shouldMerge ? 2 : 1))
  ];

  const methodInvocations = printedNodes
    .map(({ node }) => node)
    .filter(
      (node): node is NamedNode<SyntaxType.MethodInvocation> =>
        node.type === SyntaxType.MethodInvocation
    );

  function lastGroupWillBreakAndOtherCallsHaveFunctionArguments() {
    const lastGroupNode = groups.at(-1)!.at(-1)!.node;
    const lastGroupDoc = printedGroups.at(-1)!;
    return (
      lastGroupNode.type === SyntaxType.MethodInvocation &&
      willBreak(lastGroupDoc) &&
      methodInvocations
        .slice(0, -1)
        .some(node =>
          node.argumentsNode.namedChildren.some(
            ({ type }) => type === SyntaxType.LambdaExpression
          )
        )
    );
  }

  let result;

  // We don't want to print in one line if at least one of these conditions occurs:
  //  * the chain has comments,
  //  * the chain is an expression statement and all the arguments are literal-like ("fluent configuration" pattern),
  //  * the chain is longer than 2 calls and has non-trivial arguments or more than 2 arguments in any call but the first one,
  //  * any group but the last one has a hard line,
  //  * the last call's arguments have a hard line and other calls have non-trivial arguments.
  if (
    nodeHasComment ||
    (methodInvocations.length > 2 &&
      methodInvocations.some(
        inv =>
          !inv.argumentsNode.namedChildren.every(arg =>
            isSimpleCallArgument(arg)
          )
      )) ||
    printedGroups.slice(0, -1).some(willBreak) ||
    lastGroupWillBreakAndOtherCallsHaveFunctionArguments()
  ) {
    result = group(expanded);
  } else {
    result = [
      // We only need to check `oneLine` because if `expanded` is chosen
      // that means that the parent group has already been broken
      // naturally
      willBreak(oneLine) || shouldHaveEmptyLineBeforeIndent ? breakParent : "",
      conditionalGroup([oneLine, expanded])
    ];
  }

  return result;
}

function printMethodInvocation(
  path: NamedNodePath<SyntaxType.MethodInvocation>,
  print: PrintFunction
) {
  const parts: Doc[] = [];
  if (hasChild(path, "objectNode")) {
    parts.push(".");
  }
  if (path.node.children.filter(({ type }) => type === ".").length === 2) {
    parts.push("super", ".");
  }
  if (hasChild(path, "type_argumentsNode")) {
    parts.push(path.call(print, "type_argumentsNode"));
  }
  parts.push(path.call(print, "nameNode"), path.call(print, "argumentsNode"));
  return parts;
}

function printArrayAccess(
  path: NamedNodePath<SyntaxType.ArrayAccess>,
  print: PrintFunction
) {
  const index = path.call(print, "indexNode");
  return path.node.indexNode.type === SyntaxType.DecimalIntegerLiteral
    ? ["[", index, "]"]
    : group(["[", indent([softline, index]), softline, "]"]);
}

function printFieldAccess(
  path: NamedNodePath<SyntaxType.FieldAccess>,
  print: PrintFunction
) {
  const parts: Doc[] = ["."];

  if (path.node.children.filter(({ type }) => type === ".").length === 2) {
    parts.push("super.");
  }

  parts.push(path.call(print, "fieldNode"));

  return parts;
}

/**
 * For binary expressions to be consistent, we need to group
 * subsequent operators with the same precedence level under a single
 * group. Otherwise they will be nested such that some of them break
 * onto new lines but not all. Operators with the same precedence
 * level should either all break or not. Because we group them by
 * precedence level and the AST is structured based on precedence
 * level, things are naturally broken up correctly, i.e. `&&` is
 * broken before `+`.
 */
function printBinaryExpressions(
  path: NamedNodePath,
  print: PrintFunction,
  options: JavaParserOptions,
  isInsideParentheses: boolean
) {
  // Simply print the node normally.
  if (!hasType(path, SyntaxType.BinaryExpression)) {
    return [group(print(path))];
  }

  const { node } = path;
  let parts: Doc[] = [];

  // Put all operators with the same precedence level in the same
  // group. The reason we only need to do this with the `left`
  // expression is because given an expression like `1 + 2 - 3`, it
  // is always parsed like `((1 + 2) - 3)`, meaning the `left` side
  // is where the rest of the expression will exist. Binary
  // expressions on the right side mean they have a difference
  // precedence level and should be treated as a separate group, so
  // print them normally.
  if (
    node.leftNode.type === SyntaxType.BinaryExpression &&
    shouldFlatten(node.operatorNode.type, node.leftNode.operatorNode.type)
  ) {
    // Flatten them out by recursively calling this function.
    parts = path.call(
      () => printBinaryExpressions(path, print, options, isInsideParentheses),
      "leftNode"
    );
  } else {
    parts.push(group(path.call(print, "leftNode")));
  }

  const operator = node.operatorNode.type;
  const operatorDoc = path.call(print, "operatorNode");
  const rightContent = path.call(print, "rightNode");
  let right: Doc =
    options.experimentalOperatorPosition === "start"
      ? [line, operatorDoc, " ", rightContent]
      : [" ", operatorDoc, line, rightContent];

  // If there's only a single binary expression, we want to create a group
  // in order to avoid having a small right part like -1 be on its own line.
  const { parent } = path;
  const shouldBreak =
    node.leftNode.comments?.some(
      ({ trailing, type }) => trailing && type === SyntaxType.LineComment
    ) ?? false;
  const shouldGroup =
    shouldBreak ||
    (!(isInsideParentheses && logicalOperators.has(operator)) &&
      (parent?.type !== node.type ||
        logicalOperators.has(parent.operatorNode.value) !==
          logicalOperators.has(operator)) &&
      node.leftNode.type !== node.type &&
      node.rightNode.type !== node.type);
  if (shouldGroup) {
    right = group(right, { shouldBreak });
  }

  parts.push(right);

  return parent?.type === SyntaxType.BinaryExpression &&
    needsParentheses(parent.operatorNode.type, operator)
    ? ["(", ...parts, ")"]
    : parts;
}

const logicalOperators = new Set(["||", "&&"]);
const equalityOperators = new Set(["==", "!="]);
const multiplicativeOperators = new Set(["*", "/", "%"]);
const bitshiftOperators = new Set([">>", ">>>", "<<"]);

function shouldFlatten(parentOp: string, nodeOp: string) {
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
function getPrecedence(operator: string) {
  return PRECEDENCE.get(operator) ?? -1;
}

function needsParentheses(parentOperator: string, operator: string) {
  return (
    (operator === "&&" && parentOperator === "||") ||
    (["|", "^", "&", "<<", ">>", ">>>"].includes(parentOperator) &&
      getPrecedence(operator) > getPrecedence(parentOperator)) ||
    [operator, parentOperator].every(o => ["==", "!="].includes(o)) ||
    [operator, parentOperator].every(o => ["<<", ">>", ">>>"].includes(o)) ||
    (operator === "*" && parentOperator === "/") ||
    (operator === "/" && parentOperator === "*") ||
    (operator === "%" && ["+", "-", "*", "/"].includes(parentOperator)) ||
    (["*", "/"].includes(operator) && parentOperator === "%")
  );
}

function isSimpleCallArgument(node: NamedNode, depth = 2): boolean {
  if (depth <= 0) {
    return false;
  }

  const isChildSimple = (child: NamedNode) =>
    isSimpleCallArgument(child, depth - 1);

  if (
    node.type.endsWith("_literal") ||
    node.type === "true" ||
    node.type === "false" ||
    node.type === SyntaxType.Identifier ||
    node.type === "this"
  ) {
    return true;
  }

  if (
    node.type === SyntaxType.ObjectCreationExpression ||
    node.type === SyntaxType.MethodInvocation
  ) {
    if (
      node.type === SyntaxType.ObjectCreationExpression ||
      !node.objectNode ||
      isSimpleCallArgument(node.objectNode, depth)
    ) {
      const args = node.argumentsNode.namedChildren;
      return args.length <= depth && args.every(isChildSimple);
    }
    return false;
  }

  if (node.type === SyntaxType.ArrayAccess) {
    return (
      isSimpleCallArgument(node.arrayNode, depth) &&
      isSimpleCallArgument(node.indexNode, depth)
    );
  }

  if (node.type === SyntaxType.FieldAccess) {
    return (
      isSimpleCallArgument(node.objectNode, depth) &&
      isSimpleCallArgument(node.fieldNode, depth)
    );
  }

  if (
    node.type === SyntaxType.MethodReference ||
    node.type === SyntaxType.UnaryExpression ||
    node.type === SyntaxType.UpdateExpression
  ) {
    return isSimpleCallArgument(node.namedChildren[0], depth);
  }

  return false;
}

function couldExpandArg(arg: NamedNode, lambdaChainRecursion = false) {
  if (
    arg.type === SyntaxType.ArrayCreationExpression &&
    arg.valueNode &&
    (arg.valueNode.namedChildren.length > 0 || arg.valueNode.comments)
  ) {
    return true;
  }

  if (arg.type === SyntaxType.LambdaExpression) {
    const { bodyNode: body } = arg;

    if (
      body.type === SyntaxType.Block ||
      body.type === SyntaxType.ArrayCreationExpression
    ) {
      return true;
    }

    if (
      body.type === SyntaxType.LambdaExpression &&
      couldExpandArg(body, true)
    ) {
      return true;
    }

    if (!lambdaChainRecursion) {
      if (body.type === SyntaxType.TernaryExpression) {
        return true;
      }

      if (
        body.type === SyntaxType.MethodInvocation ||
        body.type === SyntaxType.ObjectCreationExpression
      ) {
        return true;
      }
    }
  }

  return false;
}

function shouldExpandLastArg(args: NamedNode[]) {
  const lastArg = args.at(-1)!;
  const penultimateArg = args.at(-2);
  return (
    !lastArg.comments?.some(({ leading }) => leading) &&
    !lastArg.comments?.some(({ trailing }) => trailing) &&
    couldExpandArg(lastArg) &&
    // If the last two arguments are of the same type,
    // disable last element expansion.
    (!penultimateArg || penultimateArg.type !== lastArg.type) &&
    (args.length !== 2 || penultimateArg!.type !== SyntaxType.LambdaExpression)
  );
}

function shouldExpandFirstArg(args: NamedNode[]) {
  if (args.length !== 2) {
    return false;
  }

  const [firstArg, secondArg] = args;

  return (
    !firstArg.comments &&
    firstArg.type === SyntaxType.LambdaExpression &&
    firstArg.bodyNode.type === SyntaxType.Block &&
    secondArg.type !== SyntaxType.LambdaExpression &&
    secondArg.type !== SyntaxType.TernaryExpression &&
    isHopefullyShortCallArgument(secondArg) &&
    !couldExpandArg(secondArg)
  );
}

function isHopefullyShortCallArgument(node: NamedNode) {
  if (node.type === SyntaxType.ParenthesizedExpression) {
    return isHopefullyShortCallArgument(node.namedChildren[0]);
  }

  if (
    (node.type === SyntaxType.MethodInvocation ||
      node.type === SyntaxType.ObjectCreationExpression) &&
    node.argumentsNode.namedChildren.length > 1
  ) {
    return false;
  }

  if (node.type === SyntaxType.BinaryExpression) {
    return (
      isSimpleCallArgument(node.leftNode, 1) &&
      isSimpleCallArgument(node.rightNode, 1)
    );
  }

  return isSimpleCallArgument(node);
}

class ArgExpansionBailout extends Error {
  name = "ArgExpansionBailout";
}
