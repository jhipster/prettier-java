"use strict";
/* eslint-disable no-unused-vars */

const {
  line,
  group,
  indent,
  softline,
  concat,
  hardline
} = require("prettier").doc.builders;
const { rejectAndConcat, rejectAndJoin } = require("./printer-utils");

class BlocksAndStatementPrettierVisitor {
  block(ctx) {
    const blockStatements = this.visit(ctx.blockStatements);

    if (blockStatements) {
      return rejectAndJoin(hardline, [
        indent(rejectAndJoin(hardline, ["{", blockStatements])),
        "}"
      ]);
    }

    return "{}";
  }

  blockStatements(ctx) {
    const blockStatement = this.mapVisit(ctx.blockStatement);
    return rejectAndJoin(hardline, blockStatement);
  }

  blockStatement(ctx) {
    return this.visitSingle(ctx);
  }

  localVariableDeclarationStatement(ctx) {
    const localVariableDeclaration = this.visit(ctx.localVariableDeclaration);
    return rejectAndConcat([localVariableDeclaration, ";"]);
  }

  localVariableDeclaration(ctx) {
    const variableModifiers = this.mapVisit(ctx.variableModifier);
    const localVariableType = this.visit(ctx.localVariableType);
    const variableDeclaratorList = this.visit(ctx.variableDeclaratorList);

    return rejectAndJoin(" ", [
      rejectAndJoin(" ", variableModifiers),
      localVariableType,
      variableDeclaratorList
    ]);
  }

  localVariableType(ctx) {
    if (ctx.unannType) {
      return this.visitSingle(ctx);
    }

    return this.getSingle(ctx).image;
  }

  statement(ctx) {
    return this.visitSingle(ctx);
  }

  statementWithoutTrailingSubstatement(ctx) {
    return this.visitSingle(ctx);
  }

  emptyStatement(ctx) {
    return ";";
  }

  labeledStatement(ctx) {
    const identifier = ctx.Identifier[0].image;
    const statement = this.visit(ctx.statement);

    return rejectAndJoin(":", [identifier, statement]);
  }

  expressionStatement(ctx) {
    const statementExpression = this.visit(ctx.statementExpression);
    return rejectAndConcat([statementExpression, ";"]);
  }

  statementExpression(ctx) {
    return this.visitSingle(ctx);
  }

  ifStatement(ctx) {
    const expression = this.visit(ctx.expression);
    const ifStatement = this.visit(ctx.statement[0]);

    const elseStatement = ctx.Else
      ? rejectAndJoin(" ", [" else", this.visit(ctx.statement[1])])
      : "";

    return rejectAndConcat([
      "if (",
      expression,
      ") ",
      ifStatement,
      elseStatement
    ]);
  }

  assertStatement(ctx) {
    const expressions = this.mapVisit(ctx.expression);

    return rejectAndConcat(["assert ", rejectAndJoin(" : ", expressions), ";"]);
  }

  switchStatement(ctx) {
    const expression = this.visit(ctx.expression);
    const switchBlock = this.visit(ctx.switchBlock);

    return rejectAndJoin(" ", [
      "switch",
      rejectAndConcat(["(", expression, ")"]),
      switchBlock
    ]);
  }

  switchBlock(ctx) {
    const switchCases = this.mapVisit(ctx.switchCase);

    return rejectAndJoin(line, [
      indent(rejectAndJoin(line, ["{", rejectAndJoin(line, switchCases)])),
      "}"
    ]);
  }

  switchCase(ctx) {
    const switchLabel = this.visit(ctx.switchLabel);
    const blockStatements = this.visit(ctx.blockStatements);

    return indent(rejectAndJoin(line, [switchLabel, blockStatements]));
  }

  switchLabel(ctx) {
    if (ctx.Case) {
      const constantExpression = this.visit(ctx.constantExpression);
      return rejectAndConcat(["case ", constantExpression, ":"]);
    }

    return "default:";
  }

  enumConstantName(ctx) {
    return this.visitSingle(ctx);
  }

  whileStatement(ctx) {
    const expression = this.visit(ctx.expression);
    const statement = this.visit(ctx.statement);

    return rejectAndJoin(" ", [
      "while",
      rejectAndConcat(["(", expression, ")"]),
      statement
    ]);
  }

  doStatement(ctx) {
    const statement = this.visit(ctx.statement);
    const expression = this.visit(ctx.expression);

    return rejectAndJoin(" ", [
      "do",
      statement,
      "while",
      rejectAndConcat(["(", expression, ");"])
    ]);
  }

  forStatement(ctx) {
    return this.visitSingle(ctx);
  }

  basicForStatement(ctx) {
    const forInit = this.visit(ctx.forInit);
    const expression = this.visit(ctx.expression);
    const forUpdate = this.visit(ctx.forUpdate);
    const statement = this.visit(ctx.statement);

    return rejectAndConcat([
      "for (",
      forInit,
      rejectAndJoin(" ", [";", expression]),
      rejectAndJoin(" ", [";", forUpdate]),
      ") ",
      statement
    ]);
  }

  forInit(ctx) {
    return this.visitSingle(ctx);
  }

  forUpdate(ctx) {
    return this.visitSingle(ctx);
  }

  statementExpressionList(ctx) {
    const statementExpressions = this.mapVisit(ctx.statementExpression);

    return rejectAndJoin(", ", statementExpressions);
  }

  enhancedForStatement(ctx) {
    const variableModifiers = this.mapVisit(ctx.variableModifier);
    const localVariableType = this.visit(ctx.localVariableType);
    const variableDeclaratorId = this.visit(ctx.variableDeclaratorId);
    const expression = this.visit(ctx.expression);
    const statement = this.visit(ctx.statement);

    return rejectAndConcat([
      "for (",
      rejectAndJoin(" ", [
        rejectAndJoin(" ", variableModifiers),
        localVariableType,
        variableDeclaratorId
      ]),
      " : ",
      expression,
      ") ",
      statement
    ]);
  }

  breakStatement(ctx) {
    if (ctx.Identifier) {
      const identifier = ctx.Identifier[0].image;

      return rejectAndConcat(["break ", identifier, ";"]);
    }

    return "break;";
  }

  continueStatement(ctx) {
    if (ctx.Identifier) {
      const identifier = ctx.Identifier[0].image;

      return rejectAndConcat(["continue ", identifier, ";"]);
    }

    return "continue;";
  }

  returnStatement(ctx) {
    if (ctx.expression) {
      const expression = this.visit(ctx.expression);

      return rejectAndConcat(["return ", expression, ";"]);
    }

    return "return;";
  }

  throwStatement(ctx) {
    const expression = this.visit(ctx.expression);

    return rejectAndConcat(["throw ", expression, ";"]);
  }

  synchronizedStatement(ctx) {
    const expression = this.visit(ctx.expression);
    const block = this.visit(ctx.block);

    return rejectAndConcat(["synchronized (", expression, ") ", block]);
  }

  tryStatement(ctx) {
    if (ctx.tryWithResourcesStatement) {
      return this.visit(ctx.tryWithResourcesStatement);
    }

    const block = this.visit(ctx.block);
    const catches = this.visit(ctx.catches);
    const finallyBlock = this.visit(ctx.finally);

    return rejectAndJoin(" ", ["try", block, catches, finallyBlock]);
  }

  catches(ctx) {
    const catchClauses = this.mapVisit(ctx.catchClause);
    return rejectAndJoin(" ", catchClauses);
  }

  catchClause(ctx) {
    const catchFormalParameter = this.visit(ctx.catchFormalParameter);
    const block = this.visit(ctx.block);

    return rejectAndConcat([
      group(
        rejectAndConcat([
          "catch (",
          indent(rejectAndConcat([softline, catchFormalParameter])),
          softline,
          ") "
        ])
      ),
      block
    ]);
  }

  catchFormalParameter(ctx) {
    const variableModifiers = this.mapVisit(ctx.variableModifier);
    const catchType = this.visit(ctx.catchType);
    const variableDeclaratorId = this.visit(ctx.variableDeclaratorId);

    return rejectAndJoin(" ", [
      rejectAndJoin(" ", variableModifiers),
      catchType,
      variableDeclaratorId
    ]);
  }

  catchType(ctx) {
    const unannClassType = this.visit(ctx.unannClassType);
    const classTypes = this.mapVisit(ctx.classType);

    return group(
      rejectAndJoin(concat([line, "| "]), [
        unannClassType,
        rejectAndJoin(concat([line, "| "]), classTypes)
      ])
    );
  }

  finally(ctx) {
    const block = this.visit(ctx.block);

    return rejectAndJoin(" ", ["finally", block]);
  }

  tryWithResourcesStatement(ctx) {
    const resourceSpecification = this.visit(ctx.resourceSpecification);
    const block = this.visit(ctx.block);
    const catches = this.visit(ctx.catches);
    const finallyBlock = this.visit(ctx.finally);

    return rejectAndJoin(" ", [
      "try",
      resourceSpecification,
      block,
      catches,
      finallyBlock
    ]);
  }

  resourceSpecification(ctx) {
    const resourceList = this.visit(ctx.resourceList);
    const optionalSemicolon = ctx.Semicolon ? ";" : "";

    return rejectAndConcat(["(", resourceList, optionalSemicolon, ")"]);
  }

  resourceList(ctx) {
    const resources = this.mapVisit(ctx.resource);

    return rejectAndJoin("; ", resources);
  }

  resource(ctx) {
    return this.visitSingle(ctx);
  }

  resourceInit(ctx) {
    const variableModifiers = this.mapVisit(ctx.variableModifier);
    const localVariableType = this.visit(ctx.localVariableType);
    const identifier = ctx.Identifier[0].image;
    const expression = this.visit(ctx.expression);

    return rejectAndJoin(" ", [
      rejectAndJoin(" ", variableModifiers),
      localVariableType,
      identifier,
      "=",
      expression
    ]);
  }

  variableAccess(ctx) {
    return this.visitSingle(ctx);
  }

  isBasicForStatement(ctx) {
    return "isBasicForStatement";
  }

  isLocalVariableDeclaration(ctx) {
    return "isLocalVariableDeclaration";
  }
}

module.exports = {
  BlocksAndStatementPrettierVisitor
};
