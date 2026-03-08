import type { Doc } from "prettier";
import { builders } from "prettier/doc";
import { SyntaxType } from "../tree-sitter-java.js";
import {
  hasChild,
  hasLeadingComments,
  indentInParentheses,
  printBlock,
  printBlockStatements,
  printDanglingComments,
  printModifiers,
  printVariableDeclaration,
  type JavaNodePrinters
} from "./helpers.js";

const {
  group,
  hardline,
  ifBreak,
  indent,
  indentIfBreak,
  join,
  line,
  softline
} = builders;

export default {
  block(path, print) {
    return printBlock(path, printBlockStatements(path, print));
  },

  local_variable_declaration: printVariableDeclaration,

  labeled_statement(path, print) {
    return join(": ", path.map(print, "namedChildren"));
  },

  expression_statement(path, print) {
    const parentType = path.parent?.type as SyntaxType;
    const expressionType = path.node.namedChildren[0].type;
    const expression = path.call(print, "namedChildren", 0);

    return expressionType === SyntaxType.SwitchExpression &&
      parentType !== SyntaxType.AssignmentExpression &&
      parentType !== SyntaxType.SwitchRule
      ? expression
      : [expression, ";"];
  },

  if_statement(path, print) {
    const statement = ["if ", path.call(print, "conditionNode")];

    if (path.node.consequenceNode.type === ";") {
      statement.push(";");
    } else {
      statement.push(" ", path.call(print, "consequenceNode"));
    }

    if (!hasChild(path, "alternativeNode")) {
      return statement;
    }

    const danglingComments = printDanglingComments(path);
    if (danglingComments.length) {
      statement.push(hardline, ...danglingComments, hardline);
    } else {
      const ifHasBlock = path.node.consequenceNode.type === SyntaxType.Block;
      statement.push(ifHasBlock ? " " : hardline);
    }

    statement.push("else");

    if (path.node.alternativeNode.type === ";") {
      statement.push(";");
    } else {
      statement.push(" ", path.call(print, "alternativeNode"));
    }

    return statement;
  },

  assert_statement(path, print) {
    return ["assert ", ...join(" : ", path.map(print, "namedChildren")), ";"];
  },

  switch_expression(path, print) {
    return join(" ", [
      "switch",
      path.call(print, "conditionNode"),
      path.call(print, "bodyNode")
    ]);
  },

  switch_block(path, print) {
    return printBlock(path, path.map(print, "namedChildren"));
  },

  switch_block_statement_group(path, print) {
    const parts: Doc[] = [];

    path.each(child => {
      if (child.node.type === SyntaxType.SwitchLabel) {
        parts.push(print(child), ":");
      }
    }, "namedChildren");

    const firstStatementIndex = path.node.namedChildren.findIndex(
      ({ type }) => type !== SyntaxType.SwitchLabel
    );
    const onlyStatementIsBlock =
      firstStatementIndex === path.node.namedChildren.length - 1 &&
      path.node.namedChildren[firstStatementIndex].type === SyntaxType.Block;
    if (onlyStatementIsBlock) {
      parts.push(" ", path.call(print, "namedChildren", firstStatementIndex));
    } else if (firstStatementIndex !== -1) {
      parts.push(
        indent([hardline, ...join(hardline, printBlockStatements(path, print))])
      );
    }

    return parts;
  },

  switch_label(path, print) {
    const hasCase = path.node.children.some(({ type }) => type === "case");
    if (!hasCase) {
      return "default";
    }
    const values: Doc[] = [];
    path.each(child => {
      if (child.node.type !== SyntaxType.Guard) {
        values.push(print(child));
      }
    }, "namedChildren");

    const hasMultipleValues = values.length > 1;
    const label = hasMultipleValues
      ? ["case", indent([line, ...join([",", line], values)])]
      : ["case ", values[0]];

    const guardIndex = path.node.namedChildren.findIndex(
      ({ type }) => type === SyntaxType.Guard
    );
    return guardIndex !== -1
      ? [
          group([...label, hasMultipleValues ? line : " "]),
          path.call(print, "namedChildren", guardIndex)
        ]
      : group(label);
  },

  switch_rule(path, print) {
    const bodyIndex = path.node.namedChildren.findIndex(
      ({ type }) =>
        type === SyntaxType.Block ||
        type === SyntaxType.ExpressionStatement ||
        type === SyntaxType.ThrowStatement
    );
    const body = path.call(print, "namedChildren", bodyIndex);

    const switchLabelIndex = path.node.namedChildren.findIndex(
      ({ type }) => type === SyntaxType.SwitchLabel
    );
    const parts = [path.call(print, "namedChildren", switchLabelIndex), " ->"];

    const bodyNode = path.node.namedChildren[bodyIndex];
    if (bodyNode.type !== SyntaxType.Block && hasLeadingComments(bodyNode)) {
      parts.push(indent([hardline, body]));
    } else {
      parts.push(" ", body);
    }
    return parts;
  },

  while_statement(path, print) {
    const parts = ["while ", path.call(print, "conditionNode")];
    const body = path.call(print, "bodyNode");

    const bodyType = path.node.bodyNode.type;
    if (bodyType === SyntaxType.Block) {
      parts.push(" ", body);

      return parts;
    } else if (bodyType === ";") {
      parts.push(";");

      return parts;
    } else {
      parts.push(line, body);

      return group(indent(parts));
    }
  },

  do_statement(path, print) {
    const hasEmptyStatement = path.node.bodyNode.type === ";";
    return [
      "do",
      hasEmptyStatement ? ";" : [" ", path.call(print, "bodyNode")],
      " while ",
      path.call(print, "conditionNode"),
      ";"
    ];
  },

  for_statement(path, print) {
    const danglingComments = printDanglingComments(path);
    if (danglingComments.length) {
      danglingComments.push(hardline);
    }

    const hasInit = path.node.initNodes.length > 0;
    const hasCondition = hasChild(path, "conditionNode");
    const hasUpdate = path.node.updateNodes.length > 0;
    const expressions = [
      !hasInit
        ? ";"
        : path.node.initNodes[0].type === SyntaxType.LocalVariableDeclaration
          ? path.call(print, "initNodes", 0)
          : [printExpressionList(path.map(print, "initNodes")), ";"],
      hasCondition ? [path.call(print, "conditionNode"), ";"] : ";",
      hasUpdate ? printExpressionList(path.map(print, "updateNodes")) : ""
    ];

    const hasEmptyStatement = path.node.bodyNode.type === ";";
    const parts = [
      ...danglingComments,
      "for ",
      hasInit || hasCondition || hasUpdate
        ? group(indentInParentheses(join(line, expressions)))
        : "(;;)",
      hasEmptyStatement ? ";" : [" ", path.call(print, "bodyNode")]
    ];

    return parts;
  },

  update_expression(path, print) {
    return path.map(print, "children");
  },

  enhanced_for_statement(path, print) {
    const forStatement = printDanglingComments(path);
    forStatement.push(
      "for (",
      ...printModifiers(path, print),
      path.call(print, "typeNode"),
      " ",
      path.call(print, "nameNode")
    );

    if (hasChild(path, "dimensionsNode")) {
      forStatement.push(path.call(print, "dimensionsNode"));
    }

    forStatement.push(" : ", path.call(print, "valueNode"), ")");

    const bodyType = path.node.bodyNode.type;
    if (bodyType === ";") {
      forStatement.push(";");
    } else {
      const body = path.call(print, "bodyNode");
      forStatement.push(
        bodyType === SyntaxType.Block ? [" ", body] : indent([line, body])
      );
    }
    return group(forStatement);
  },

  break_statement(path, print) {
    const parts: Doc[] = ["break"];

    const identifierIndex = path.node.namedChildren.findIndex(
      ({ type }) => type === SyntaxType.Identifier
    );
    if (identifierIndex !== -1) {
      parts.push(" ", path.call(print, "namedChildren", identifierIndex));
    }

    parts.push(";");

    return parts;
  },

  continue_statement(path, print) {
    const identifierIndex = path.node.namedChildren.findIndex(
      ({ type }) => type === SyntaxType.Identifier
    );
    return identifierIndex !== -1
      ? ["continue ", path.call(print, "namedChildren", identifierIndex), ";"]
      : "continue;";
  },

  return_statement(path, print) {
    const statement: Doc[] = ["return"];

    if (path.node.namedChildren.length) {
      statement.push(" ");
      const expression = path.call(print, "namedChildren", 0);
      if (path.node.namedChildren[0].type === SyntaxType.BinaryExpression) {
        statement.push(
          group([
            ifBreak("("),
            indent([softline, expression]),
            softline,
            ifBreak(")")
          ])
        );
      } else {
        statement.push(expression);
      }
    }
    statement.push(";");
    return statement;
  },

  throw_statement(path, print) {
    return ["throw ", path.call(print, "namedChildren", 0), ";"];
  },

  synchronized_statement(path, print) {
    const parenthesizedExpressionIndex = path.node.namedChildren.findIndex(
      ({ type }) => type === SyntaxType.ParenthesizedExpression
    );
    return [
      "synchronized ",
      path.call(print, "namedChildren", parenthesizedExpressionIndex),
      " ",
      path.call(print, "bodyNode")
    ];
  },

  try_statement(path, print) {
    const parts = ["try", path.call(print, "bodyNode")];

    path.each(child => {
      if (
        child.node.type === SyntaxType.CatchClause ||
        child.node.type === SyntaxType.FinallyClause
      ) {
        parts.push(print(child));
      }
    }, "namedChildren");

    return join(" ", parts);
  },

  catch_clause(path, print) {
    const catchFormalParameterIndex = path.node.namedChildren.findIndex(
      ({ type }) => type === SyntaxType.CatchFormalParameter
    );
    return [
      "catch ",
      group(
        indentInParentheses(
          path.call(print, "namedChildren", catchFormalParameterIndex)
        )
      ),
      " ",
      path.call(print, "bodyNode")
    ];
  },

  catch_formal_parameter(path, print) {
    const parts = printModifiers(path, print);

    const catchTypeIndex = path.node.namedChildren.findIndex(
      ({ type }) => type === SyntaxType.CatchType
    );
    parts.push(
      path.call(print, "namedChildren", catchTypeIndex),
      " ",
      path.call(print, "nameNode")
    );

    if (hasChild(path, "dimensionsNode")) {
      parts.push(path.call(print, "dimensionsNode"));
    }
    return parts;
  },

  catch_type(path, print) {
    return join([line, "| "], path.map(print, "namedChildren"));
  },

  finally_clause(path, print) {
    return ["finally ", path.call(print, "namedChildren", 0)];
  },

  try_with_resources_statement(path, print) {
    const parts = [
      "try",
      path.call(print, "resourcesNode"),
      path.call(print, "bodyNode")
    ];

    path.each(child => {
      if (
        child.node.type === SyntaxType.CatchClause ||
        child.node.type === SyntaxType.FinallyClause
      ) {
        parts.push(print(child));
      }
    }, "namedChildren");

    return join(" ", parts);
  },

  resource_specification(path, print) {
    const resources: Doc[] = [];
    let hasTrailingSemicolon = false;

    path.each(child => {
      if (child.node.type === SyntaxType.Resource) {
        resources.push(print(child));
        hasTrailingSemicolon = false;
      } else if (child.node.type === ";") {
        hasTrailingSemicolon = true;
      }
    }, "children");

    const parts = join([";", line], resources);

    if (hasTrailingSemicolon) {
      parts.push(ifBreak(";"));
    }
    return group(indentInParentheses(parts));
  },

  resource(path, print) {
    if (
      hasChild(path, "typeNode") &&
      hasChild(path, "nameNode") &&
      hasChild(path, "valueNode")
    ) {
      const parts = printModifiers(path, print);

      parts.push(
        path.call(print, "typeNode"),
        " ",
        path.call(print, "nameNode")
      );

      if (hasChild(path, "dimensionsNode")) {
        parts.push(path.call(print, "dimensionsNode"));
      }

      parts.push(" =");

      const value = path.call(print, "valueNode");
      if (
        path.node.valueNode.type === SyntaxType.BinaryExpression ||
        hasLeadingComments(path.node.valueNode)
      ) {
        parts.push(group(indent([line, value])));
      } else {
        const groupId = Symbol("assignment");
        parts.push(
          group(indent(line), { id: groupId }),
          indentIfBreak(value, { groupId })
        );
      }

      return parts;
    }

    const resourceIndex = path.node.namedChildren.findIndex(
      ({ type }) =>
        type === SyntaxType.Identifier || type === SyntaxType.FieldAccess
    );
    return path.call(print, "namedChildren", resourceIndex);
  },

  yield_statement(path, print) {
    return ["yield ", path.call(print, "namedChildren", 0), ";"];
  }
} satisfies Partial<JavaNodePrinters>;

function printExpressionList(expressions: Doc[]) {
  return group(
    expressions.map((expression, index) =>
      index === 0 ? expression : [",", indent([line, expression])]
    )
  );
}
