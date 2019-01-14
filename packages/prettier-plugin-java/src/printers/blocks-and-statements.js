"use strict";
/* eslint-disable no-unused-vars */

class BlocksAndStatementPrettierVisitor {
  block(ctx) {
    return "block";
  }

  blockStatements(ctx) {
    return "blockStatements";
  }

  blockStatement(ctx) {
    return "blockStatement";
  }

  localVariableDeclarationStatement(ctx) {
    return "localVariableDeclarationStatement";
  }

  localVariableDeclaration(ctx) {
    return "localVariableDeclaration";
  }

  localVariableType(ctx) {
    return "localVariableType";
  }

  statement(ctx) {
    return "statement";
  }

  statementWithoutTrailingSubstatement(ctx) {
    return "statementWithoutTrailingSubstatement";
  }

  emptyStatement(ctx) {
    return "emptyStatement";
  }

  labeledStatement(ctx) {
    return "labeledStatement";
  }

  expressionStatement(ctx) {
    return "expressionStatement";
  }

  statementExpression(ctx) {
    return "statementExpression";
  }

  ifStatement(ctx) {
    return "ifStatement";
  }

  assertStatement(ctx) {
    return "assertStatement";
  }

  switchStatement(ctx) {
    return "switchStatement";
  }

  switchBlock(ctx) {
    return "switchBlock";
  }

  switchCase(ctx) {
    return "switchCase";
  }

  switchLabel(ctx) {
    return "switchLabel";
  }

  enumConstantName(ctx) {
    return "enumConstantName";
  }

  whileStatement(ctx) {
    return "whileStatement";
  }

  doStatement(ctx) {
    return "doStatement";
  }

  forStatement(ctx) {
    return "forStatement";
  }

  basicForStatement(ctx) {
    return "basicForStatement";
  }

  forInit(ctx) {
    return "forInit";
  }

  forUpdate(ctx) {
    return "forUpdate";
  }

  statementExpressionList(ctx) {
    return "statementExpressionList";
  }

  enhancedForStatement(ctx) {
    return "enhancedForStatement";
  }

  breakStatement(ctx) {
    return "breakStatement";
  }

  continueStatement(ctx) {
    return "continueStatement";
  }

  returnStatement(ctx) {
    return "returnStatement";
  }

  throwStatement(ctx) {
    return "throwStatement";
  }

  synchronizedStatement(ctx) {
    return "synchronizedStatement";
  }

  tryStatement(ctx) {
    return "tryStatement";
  }

  catches(ctx) {
    return "catches";
  }

  catchClause(ctx) {
    return "catchClause";
  }

  catchFormalParameter(ctx) {
    return "catchFormalParameter";
  }

  catchType(ctx) {
    return "catchType";
  }

  finally(ctx) {
    return "finally";
  }

  tryWithResourcesStatement(ctx) {
    return "tryWithResourcesStatement";
  }

  resourceSpecification(ctx) {
    return "resourceSpecification";
  }

  resourceList(ctx) {
    return "resourceList";
  }

  resource(ctx) {
    return "resource";
  }

  resourceInit(ctx) {
    return "resourceInit";
  }

  variableAccess(ctx) {
    return "variableAccess";
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
