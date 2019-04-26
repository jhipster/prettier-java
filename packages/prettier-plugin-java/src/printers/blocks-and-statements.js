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
const {
  rejectAndConcat,
  rejectAndJoin,
  getImageWithComments,
  rejectAndJoinSepToken
} = require("./printer-utils");

class BlocksAndStatementPrettierVisitor {
  block(ctx) {
    const blockStatements = this.visit(ctx.blockStatements);

    if (blockStatements) {
      return rejectAndJoin(hardline, [
        indent(
          rejectAndJoin(hardline, [
            getImageWithComments(ctx.LCurly[0]),
            blockStatements
          ])
        ),
        getImageWithComments(ctx.RCurly[0])
      ]);
    }

    return concat([
      getImageWithComments(ctx.LCurly[0]),
      getImageWithComments(ctx.RCurly[0])
    ]);
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
    return rejectAndConcat([
      localVariableDeclaration,
      getImageWithComments(ctx.Semicolon[0])
    ]);
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

    return getImageWithComments(this.getSingle(ctx));
  }

  statement(ctx) {
    return this.visitSingle(ctx);
  }

  statementWithoutTrailingSubstatement(ctx) {
    return this.visitSingle(ctx);
  }

  emptyStatement(ctx) {
    return getImageWithComments(ctx.Semicolon[0]);
  }

  labeledStatement(ctx) {
    const identifier = getImageWithComments(ctx.Identifier[0]);
    const statement = this.visit(ctx.statement);

    return rejectAndJoin(getImageWithComments(ctx.Colon[0]), [
      identifier,
      statement
    ]);
  }

  expressionStatement(ctx) {
    const statementExpression = this.visit(ctx.statementExpression);
    return rejectAndConcat([
      statementExpression,
      getImageWithComments(ctx.Semicolon[0])
    ]);
  }

  statementExpression(ctx) {
    return this.visitSingle(ctx);
  }

  ifStatement(ctx) {
    const expression = this.visit(ctx.expression);
    const ifStatement = this.visit(ctx.statement[0]);
    const elseStatement = ctx.Else
      ? rejectAndJoin(" ", [
          getImageWithComments(ctx.Else[0]),
          this.visit(ctx.statement[1])
        ])
      : "";
    return rejectAndConcat([
      rejectAndJoin(" ", [
        getImageWithComments(ctx.If[0]),
        getImageWithComments(ctx.LBrace[0])
      ]),
      expression,
      rejectAndJoin(" ", [
        getImageWithComments(ctx.RBrace[0]),
        ifStatement,
        elseStatement
      ])
    ]);
  }

  assertStatement(ctx) {
    const expressions = this.mapVisit(ctx.expression);
    const colon = ctx.Colon ? getImageWithComments(ctx.Colon[0]) : ":";
    return rejectAndConcat([
      rejectAndJoin(" ", [
        getImageWithComments(ctx.Assert[0]),
        rejectAndJoin(" ".concat(colon).concat(" "), expressions)
      ]),
      getImageWithComments(ctx.Semicolon[0])
    ]);
  }

  switchStatement(ctx) {
    const expression = this.visit(ctx.expression);
    const switchBlock = this.visit(ctx.switchBlock);
    return rejectAndJoin(" ", [
      getImageWithComments(ctx.Switch[0]),
      rejectAndConcat([
        getImageWithComments(ctx.LBrace[0]),
        expression,
        getImageWithComments(ctx.RBrace[0])
      ]),
      switchBlock
    ]);
  }

  switchBlock(ctx) {
    const switchCases = this.mapVisit(ctx.switchCase);

    return rejectAndJoin(line, [
      indent(
        rejectAndJoin(line, [
          getImageWithComments(ctx.LCurly[0]),
          rejectAndJoin(line, switchCases)
        ])
      ),
      getImageWithComments(ctx.RCurly[0])
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
      return rejectAndJoin(" ", [
        getImageWithComments(ctx.Case[0]),
        rejectAndConcat([
          constantExpression,
          getImageWithComments(ctx.Colon[0])
        ])
      ]);
    }
    return rejectAndConcat([
      getImageWithComments(ctx.Default[0]),
      getImageWithComments(ctx.Colon[0])
    ]);
  }

  enumConstantName(ctx) {
    return this.visitSingle(ctx);
  }

  whileStatement(ctx) {
    const expression = this.visit(ctx.expression);
    const statement = this.visit(ctx.statement);
    return rejectAndJoin(" ", [
      getImageWithComments(ctx.While[0]),
      rejectAndConcat([
        getImageWithComments(ctx.LBrace[0]),
        expression,
        getImageWithComments(ctx.RBrace[0])
      ]),
      statement
    ]);
  }

  doStatement(ctx) {
    const statement = this.visit(ctx.statement);
    const expression = this.visit(ctx.expression);
    return rejectAndJoin(" ", [
      getImageWithComments(ctx.Do[0]),
      statement,
      getImageWithComments(ctx.While[0]),
      rejectAndConcat([
        getImageWithComments(ctx.LBrace[0]),
        expression,
        getImageWithComments(ctx.RBrace[0]),
        getImageWithComments(ctx.Semicolon[0])
      ])
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
      rejectAndJoin(" ", [
        getImageWithComments(ctx.For[0]),
        getImageWithComments(ctx.LBrace[0])
      ]),
      forInit,
      rejectAndJoin(" ", [getImageWithComments(ctx.Semicolon[0]), expression]),
      rejectAndJoin(" ", [getImageWithComments(ctx.Semicolon[0]), forUpdate]),
      rejectAndJoin(" ", [getImageWithComments(ctx.RBrace[0]), statement])
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
    return rejectAndJoinSepToken(ctx.Comma, statementExpressions, " ");
  }

  enhancedForStatement(ctx) {
    const variableModifiers = this.mapVisit(ctx.variableModifier);
    const localVariableType = this.visit(ctx.localVariableType);
    const variableDeclaratorId = this.visit(ctx.variableDeclaratorId);
    const expression = this.visit(ctx.expression);
    const statement = this.visit(ctx.statement);
    return rejectAndConcat([
      rejectAndJoin(" ", [
        getImageWithComments(ctx.For[0]),
        getImageWithComments(ctx.LBrace[0])
      ]),
      rejectAndJoin(" ", [
        rejectAndJoin(" ", [
          rejectAndJoin(" ", variableModifiers),
          localVariableType,
          variableDeclaratorId
        ]),
        rejectAndJoin(" ", [getImageWithComments(ctx.Colon[0]), expression])
      ]),

      rejectAndJoin(" ", [getImageWithComments(ctx.RBrace[0]), statement])
    ]);
  }

  breakStatement(ctx) {
    if (ctx.Identifier) {
      const identifier = getImageWithComments(ctx.Identifier[0]);

      return rejectAndJoin(" ", [
        getImageWithComments(ctx.Break[0]),
        rejectAndConcat([identifier, getImageWithComments(ctx.Semicolon[0])])
      ]);
    }

    return rejectAndConcat([
      getImageWithComments(ctx.Break[0]),
      getImageWithComments(ctx.Semicolon[0])
    ]);
  }

  continueStatement(ctx) {
    if (ctx.Identifier) {
      const identifier = getImageWithComments(ctx.Identifier[0]);
      return rejectAndJoin(" ", [
        getImageWithComments(ctx.Continue[0]),
        rejectAndConcat([identifier, getImageWithComments(ctx.Semicolon[0])])
      ]);
    }

    return rejectAndConcat([
      getImageWithComments(ctx.Continue[0]),
      getImageWithComments(ctx.Semicolon[0])
    ]);
  }

  returnStatement(ctx) {
    if (ctx.expression) {
      const expression = this.visit(ctx.expression);
      return rejectAndJoin(" ", [
        getImageWithComments(ctx.Return[0]),
        rejectAndConcat([expression, getImageWithComments(ctx.Semicolon[0])])
      ]);
    }
    return rejectAndConcat([
      getImageWithComments(ctx.Return[0]),
      getImageWithComments(ctx.Semicolon[0])
    ]);
  }

  throwStatement(ctx) {
    const expression = this.visit(ctx.expression);
    return rejectAndJoin(" ", [
      getImageWithComments(ctx.Throw[0]),
      rejectAndConcat([expression, getImageWithComments(ctx.Semicolon[0])])
    ]);
  }

  synchronizedStatement(ctx) {
    const expression = this.visit(ctx.expression);
    const block = this.visit(ctx.block);
    return rejectAndConcat([
      rejectAndJoin(" ", [
        getImageWithComments(ctx.Synchronized[0]),
        getImageWithComments(ctx.LBrace[0])
      ]),
      expression,
      getImageWithComments(ctx.RBrace[0]).concat(" "),
      block
    ]);
  }

  tryStatement(ctx) {
    if (ctx.tryWithResourcesStatement) {
      return this.visit(ctx.tryWithResourcesStatement);
    }

    const block = this.visit(ctx.block);
    const catches = this.visit(ctx.catches);
    const finallyBlock = this.visit(ctx.finally);
    return rejectAndJoin(" ", [
      getImageWithComments(ctx.Try[0]),
      block,
      catches,
      finallyBlock
    ]);
  }

  catches(ctx) {
    const catchClauses = this.mapVisit(ctx.catchClause);
    return rejectAndJoin(" ", catchClauses);
  }

  catchClause(ctx) {
    const catchFormalParameter = this.visit(ctx.catchFormalParameter);
    const block = this.visit(ctx.block);
    return rejectAndConcat([
      rejectAndJoin(" ", [
        group(
          rejectAndConcat([
            rejectAndJoin(" ", [
              getImageWithComments(ctx.Catch[0]),
              getImageWithComments(ctx.LBrace[0])
            ]),
            indent(rejectAndConcat([softline, catchFormalParameter])),
            softline,
            getImageWithComments(ctx.RBrace[0])
          ])
        ),
        block
      ])
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

    return rejectAndJoin(" ", [getImageWithComments(ctx.Finally[0]), block]);
  }

  tryWithResourcesStatement(ctx) {
    const resourceSpecification = this.visit(ctx.resourceSpecification);
    const block = this.visit(ctx.block);
    const catches = this.visit(ctx.catches);
    const finallyBlock = this.visit(ctx.finally);

    return rejectAndJoin(" ", [
      getImageWithComments(ctx.Try[0]),
      resourceSpecification,
      block,
      catches,
      finallyBlock
    ]);
  }

  resourceSpecification(ctx) {
    const resourceList = this.visit(ctx.resourceList);
    const optionalSemicolon = ctx.Semicolon
      ? getImageWithComments(ctx.Semicolon[0])
      : "";

    return rejectAndConcat([
      getImageWithComments(ctx.LBrace[0]),
      resourceList,
      optionalSemicolon,
      getImageWithComments(ctx.RBrace[0])
    ]);
  }

  resourceList(ctx) {
    const resources = this.mapVisit(ctx.resource);
    return rejectAndJoinSepToken(ctx.Semicoon, resources, " ");
  }

  resource(ctx) {
    return this.visitSingle(ctx);
  }

  resourceInit(ctx) {
    const variableModifiers = this.mapVisit(ctx.variableModifier);
    const localVariableType = this.visit(ctx.localVariableType);
    const identifier = getImageWithComments(ctx.Identifier[0]);
    const expression = this.visit(ctx.expression);
    return rejectAndJoin(" ", [
      rejectAndJoin(" ", variableModifiers),
      localVariableType,
      identifier,
      getImageWithComments(ctx.Equals[0]),
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
