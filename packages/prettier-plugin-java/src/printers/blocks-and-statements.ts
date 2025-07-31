import type { Doc } from "prettier";
import { builders } from "prettier/doc";
import {
  call,
  definedKeys,
  indentInParentheses,
  isBinaryExpression,
  isEmptyStatement,
  lineEndWithComments,
  lineStartWithComments,
  map,
  onlyDefinedKey,
  printBlock,
  printDanglingComments,
  printSingle,
  printWithModifiers,
  type JavaNodePrinters
} from "./helpers.js";

const { group, hardline, ifBreak, indent, join, line, softline } = builders;

export default {
  block(path, print) {
    const statements = path.node.children.blockStatements
      ? (call(path, print, "blockStatements") as Doc[])
      : [];
    return printBlock(path, statements.length ? [statements] : []);
  },

  blockStatements(path, print) {
    return join(
      hardline,
      map(
        path,
        statementPath => {
          const { node, previous } = statementPath;
          const statement = print(statementPath);
          return previous &&
            lineStartWithComments(node) > lineEndWithComments(previous) + 1
            ? [hardline, statement]
            : statement;
        },
        "blockStatement"
      ).filter(doc => doc !== "")
    );
  },

  blockStatement: printSingle,

  localVariableDeclarationStatement(path, print) {
    return [call(path, print, "localVariableDeclaration"), ";"];
  },

  localVariableDeclaration(path, print) {
    const declaration = join(" ", [
      call(path, print, "localVariableType"),
      call(path, print, "variableDeclaratorList")
    ]);
    return printWithModifiers(path, print, "variableModifier", declaration);
  },

  localVariableType: printSingle,
  statement: printSingle,
  statementWithoutTrailingSubstatement: printSingle,

  emptyStatement() {
    return "";
  },

  labeledStatement(path, print) {
    return [
      call(path, print, "Identifier"),
      ": ",
      call(path, print, "statement")
    ];
  },

  expressionStatement(path, print) {
    return [call(path, print, "statementExpression"), ";"];
  },

  statementExpression: printSingle,

  ifStatement(path, print) {
    const { children } = path.node;
    const hasEmptyStatement = isEmptyStatement(children.statement[0]);
    const statement: Doc[] = [
      "if ",
      indentInParentheses(call(path, print, "expression")),
      hasEmptyStatement ? ";" : [" ", call(path, print, "statement", 0)]
    ];
    if (children.Else) {
      const danglingComments = printDanglingComments(path);
      if (danglingComments.length) {
        statement.push(hardline, ...danglingComments, hardline);
      } else {
        const elseHasBlock =
          children.statement[0].children
            .statementWithoutTrailingSubstatement?.[0].children.block !==
          undefined;
        statement.push(elseHasBlock ? " " : hardline);
      }
      const elseHasEmptyStatement = isEmptyStatement(children.statement[1]);
      statement.push(
        "else",
        elseHasEmptyStatement ? ";" : [" ", call(path, print, "statement", 1)]
      );
    }
    return statement;
  },

  assertStatement(path, print) {
    return ["assert ", ...join([" : "], map(path, print, "expression")), ";"];
  },

  switchStatement(path, print) {
    return join(" ", [
      "switch",
      indentInParentheses(call(path, print, "expression")),
      call(path, print, "switchBlock")
    ]);
  },

  switchBlock(path, print) {
    const { children } = path.node;
    const caseKeys = definedKeys(children, [
      "switchBlockStatementGroup",
      "switchRule"
    ]);
    const cases = caseKeys.length === 1 ? map(path, print, caseKeys[0]) : [];
    return printBlock(path, cases);
  },

  switchBlockStatementGroup(path, print) {
    const { children } = path.node;
    const switchLabel = call(path, print, "switchLabel");
    if (!children.blockStatements) {
      return [switchLabel, ":"];
    }
    const blockStatements = call(path, print, "blockStatements");
    const statements = children.blockStatements[0].children.blockStatement;
    const onlyStatementIsBlock =
      statements.length === 1 &&
      statements[0].children.statement?.[0].children
        .statementWithoutTrailingSubstatement?.[0].children.block !== undefined;
    return [
      switchLabel,
      ":",
      onlyStatementIsBlock
        ? [" ", blockStatements]
        : indent([hardline, blockStatements])
    ];
  },

  switchLabel(path, print) {
    const { children } = path.node;
    if (!(children.caseConstant ?? children.casePattern ?? children.Null)) {
      return "default";
    }
    const values: Doc[] = [];
    if (children.Null) {
      values.push("null");
      if (children.Default) {
        values.push("default");
      }
    } else {
      const valuesKey = onlyDefinedKey(children, [
        "caseConstant",
        "casePattern"
      ]);
      values.push(...map(path, print, valuesKey));
    }
    const hasMultipleValues = values.length > 1;
    const label = hasMultipleValues
      ? ["case", indent([line, ...join([",", line], values)])]
      : ["case ", values[0]];
    return children.guard
      ? [
          group([...label, hasMultipleValues ? line : " "]),
          call(path, print, "guard")
        ]
      : group(label);
  },

  switchRule(path, print) {
    const { children } = path.node;
    const bodyKey = onlyDefinedKey(children, [
      "block",
      "expression",
      "throwStatement"
    ]);
    const parts = [
      call(path, print, "switchLabel"),
      " -> ",
      call(path, print, bodyKey)
    ];
    if (children.Semicolon) {
      parts.push(";");
    }
    return parts;
  },

  caseConstant: printSingle,
  casePattern: printSingle,

  whileStatement(path, print) {
    const statement = call(path, print, "statement");
    const hasEmptyStatement = isEmptyStatement(path.node.children.statement[0]);
    return [
      "while ",
      indentInParentheses(call(path, print, "expression")),
      ...[hasEmptyStatement ? ";" : " ", statement]
    ];
  },

  doStatement(path, print) {
    const hasEmptyStatement = isEmptyStatement(path.node.children.statement[0]);
    return [
      "do",
      hasEmptyStatement ? ";" : [" ", call(path, print, "statement")],
      " while ",
      indentInParentheses(call(path, print, "expression")),
      ";"
    ];
  },

  forStatement: printSingle,

  basicForStatement(path, print) {
    const { children } = path.node;
    const danglingComments = printDanglingComments(path);
    if (danglingComments.length) {
      danglingComments.push(hardline);
    }
    const expressions = (["forInit", "expression", "forUpdate"] as const).map(
      expressionKey =>
        expressionKey in children ? call(path, print, expressionKey) : ""
    );
    const hasEmptyStatement = isEmptyStatement(children.statement[0]);
    return [
      ...danglingComments,
      "for ",
      expressions.some(expression => expression !== "")
        ? indentInParentheses(join([";", line], expressions))
        : "(;;)",
      hasEmptyStatement ? ";" : [" ", call(path, print, "statement")]
    ];
  },

  forInit: printSingle,
  forUpdate: printSingle,

  statementExpressionList(path, print) {
    return group(
      map(path, print, "statementExpression").map((expression, index) =>
        index === 0 ? expression : [",", indent([line, expression])]
      )
    );
  },

  enhancedForStatement(path, print) {
    const statementNode = path.node.children.statement[0];
    const forStatement = [
      printDanglingComments(path),
      "for ",
      "(",
      call(path, print, "localVariableDeclaration"),
      " : ",
      call(path, print, "expression"),
      ")"
    ];
    if (isEmptyStatement(statementNode)) {
      forStatement.push(";");
    } else {
      const hasStatementBlock =
        statementNode.children.statementWithoutTrailingSubstatement?.[0]
          .children.block !== undefined;
      const statement = call(path, print, "statement");
      forStatement.push(
        hasStatementBlock ? [" ", statement] : indent([line, statement])
      );
    }
    return group(forStatement);
  },

  breakStatement(path, print) {
    return path.node.children.Identifier
      ? ["break ", call(path, print, "Identifier"), ";"]
      : "break;";
  },

  continueStatement(path, print) {
    return path.node.children.Identifier
      ? ["continue ", call(path, print, "Identifier"), ";"]
      : "continue;";
  },

  returnStatement(path, print) {
    const { children } = path.node;
    const statement: Doc[] = ["return"];
    if (children.expression) {
      statement.push(" ");
      const expression = call(path, print, "expression");
      if (isBinaryExpression(children.expression[0])) {
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

  throwStatement(path, print) {
    return ["throw ", call(path, print, "expression"), ";"];
  },

  synchronizedStatement(path, print) {
    return [
      "synchronized ",
      indentInParentheses(call(path, print, "expression")),
      " ",
      call(path, print, "block")
    ];
  },

  tryStatement(path, print) {
    const { children } = path.node;
    if (children.tryWithResourcesStatement) {
      return call(path, print, "tryWithResourcesStatement");
    }
    const blocks = ["try", call(path, print, "block")];
    if (children.catches) {
      blocks.push(call(path, print, "catches"));
    }
    if (children.finally) {
      blocks.push(call(path, print, "finally"));
    }
    return join(" ", blocks);
  },

  catches(path, print) {
    return join(" ", map(path, print, "catchClause"));
  },

  catchClause(path, print) {
    return [
      "catch ",
      indentInParentheses(call(path, print, "catchFormalParameter")),
      " ",
      call(path, print, "block")
    ];
  },

  catchFormalParameter(path, print) {
    return join(" ", [
      ...map(path, print, "variableModifier"),
      call(path, print, "catchType"),
      call(path, print, "variableDeclaratorId")
    ]);
  },

  catchType(path, print) {
    return join(
      [line, "| "],
      [call(path, print, "unannClassType"), ...map(path, print, "classType")]
    );
  },

  finally(path, print) {
    return ["finally ", call(path, print, "block")];
  },

  tryWithResourcesStatement(path, print) {
    const { children } = path.node;
    const blocks = [
      "try",
      call(path, print, "resourceSpecification"),
      call(path, print, "block")
    ];
    if (children.catches) {
      blocks.push(call(path, print, "catches"));
    }
    if (children.finally) {
      blocks.push(call(path, print, "finally"));
    }
    return join(" ", blocks);
  },

  resourceSpecification(path, print) {
    const resources = [call(path, print, "resourceList")];
    if (path.node.children.Semicolon) {
      resources.push(ifBreak(";"));
    }
    return indentInParentheses(resources);
  },

  resourceList(path, print) {
    return join([";", line], map(path, print, "resource"));
  },

  resource: printSingle,

  yieldStatement(path, print) {
    return ["yield ", call(path, print, "expression"), ";"];
  },

  variableAccess: printSingle
} satisfies Partial<JavaNodePrinters>;
