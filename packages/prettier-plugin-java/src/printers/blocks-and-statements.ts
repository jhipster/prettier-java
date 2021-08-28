"use strict";

import { builders } from "prettier/doc";
import { concat, dedent, group, indent, join } from "./prettier-builder";
import { printTokenWithComments } from "./comments/format-comments";
import {
  hasLeadingLineComments,
  hasTrailingLineComments
} from "./comments/comments-utils";
import {
  displaySemicolon,
  getBlankLinesSeparator,
  isStatementEmptyStatement,
  putIntoBraces,
  rejectAndConcat,
  rejectAndJoin,
  rejectAndJoinSeps,
  rejectSeparators,
  sortModifiers
} from "./printer-utils";
import { BaseCstPrettierPrinter } from "../base-cst-printer";
import {
  AssertStatementCtx,
  BasicForStatementCtx,
  BlockCtx,
  BlockStatementCtx,
  BlockStatementsCtx,
  BreakStatementCtx,
  CaseConstantCtx,
  CatchClauseCtx,
  CatchesCtx,
  CatchFormalParameterCtx,
  CatchTypeCtx,
  ContinueStatementCtx,
  DoStatementCtx,
  EmptyStatementCtx,
  EnhancedForStatementCtx,
  ExpressionStatementCtx,
  FinallyCtx,
  ForInitCtx,
  ForStatementCtx,
  ForUpdateCtx,
  IfStatementCtx,
  IToken,
  LabeledStatementCtx,
  LocalVariableDeclarationCtx,
  LocalVariableDeclarationStatementCtx,
  LocalVariableTypeCtx,
  ResourceCtx,
  ResourceInitCtx,
  ResourceListCtx,
  ResourceSpecificationCtx,
  ReturnStatementCtx,
  StatementCtx,
  StatementExpressionCtx,
  StatementExpressionListCtx,
  StatementWithoutTrailingSubstatementCtx,
  SwitchBlockCtx,
  SwitchBlockStatementGroupCtx,
  SwitchLabelCtx,
  SwitchRuleCtx,
  SwitchStatementCtx,
  SynchronizedStatementCtx,
  ThrowStatementCtx,
  TryStatementCtx,
  TryWithResourcesStatementCtx,
  VariableAccessCtx,
  WhileStatementCtx,
  YieldStatementCtx
} from "java-parser";

const { line, softline, hardline } = builders;

export class BlocksAndStatementPrettierVisitor extends BaseCstPrettierPrinter {
  block(ctx: BlockCtx) {
    const blockStatements = this.visit(ctx.blockStatements);

    return putIntoBraces(
      blockStatements,
      hardline,
      ctx.LCurly[0],
      ctx.RCurly[0]
    );
  }

  blockStatements(ctx: BlockStatementsCtx) {
    const blockStatement = this.mapVisit(ctx.blockStatement);

    const separators = rejectSeparators(
      getBlankLinesSeparator(ctx.blockStatement),
      blockStatement
    );

    return rejectAndJoinSeps(separators, blockStatement);
  }

  blockStatement(ctx: BlockStatementCtx) {
    return this.visitSingle(ctx);
  }

  localVariableDeclarationStatement(ctx: LocalVariableDeclarationStatementCtx) {
    const localVariableDeclaration = this.visit(ctx.localVariableDeclaration);
    return rejectAndConcat([localVariableDeclaration, ctx.Semicolon[0]]);
  }

  localVariableDeclaration(ctx: LocalVariableDeclarationCtx) {
    const modifiers = sortModifiers(ctx.variableModifier);
    const firstAnnotations = this.mapVisit(modifiers[0]);
    const finalModifiers = this.mapVisit(modifiers[1]);

    const localVariableType = this.visit(ctx.localVariableType);
    const variableDeclaratorList = this.visit(ctx.variableDeclaratorList);
    return rejectAndJoin(hardline, [
      rejectAndJoin(hardline, firstAnnotations),
      rejectAndJoin(" ", [
        rejectAndJoin(" ", finalModifiers),
        localVariableType,
        variableDeclaratorList
      ])
    ]);
  }

  localVariableType(ctx: LocalVariableTypeCtx) {
    if (ctx.unannType) {
      return this.visitSingle(ctx);
    }

    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  statement(ctx: StatementCtx, params: any) {
    // handling Labeled statements comments
    if (ctx.labeledStatement !== undefined) {
      const newLabelStatement = { ...ctx.labeledStatement[0] };
      const newColon = { ...ctx.labeledStatement[0].children.Colon[0] };
      const newStatement = {
        ...ctx.labeledStatement[0].children.statement[0]
      };

      const labeledStatementLeadingComments = [];

      if (newColon.trailingComments !== undefined) {
        labeledStatementLeadingComments.push(...newColon.trailingComments);
        delete newColon.trailingComments;
      }

      if (newStatement.leadingComments !== undefined) {
        labeledStatementLeadingComments.push(...newStatement.leadingComments);
        delete newStatement.leadingComments;
      }

      if (labeledStatementLeadingComments.length !== 0) {
        newLabelStatement.leadingComments = labeledStatementLeadingComments;
      }
      newLabelStatement.children.Colon[0] = newColon;
      newLabelStatement.children.statement[0] = newStatement;

      return this.visit([newLabelStatement]);
    }

    return this.visitSingle(ctx, params);
  }

  statementWithoutTrailingSubstatement(
    ctx: StatementWithoutTrailingSubstatementCtx,
    params: any
  ) {
    return this.visitSingle(ctx, params);
  }

  emptyStatement(ctx: EmptyStatementCtx, params: any) {
    return displaySemicolon(ctx.Semicolon[0], params);
  }

  labeledStatement(ctx: LabeledStatementCtx) {
    const identifier = ctx.Identifier[0];
    const statement = this.visit(ctx.statement);

    return rejectAndJoin(ctx.Colon[0], [identifier, statement]);
  }

  expressionStatement(ctx: ExpressionStatementCtx) {
    const statementExpression = this.visit(ctx.statementExpression);
    return rejectAndConcat([statementExpression, ctx.Semicolon[0]]);
  }

  statementExpression(ctx: StatementExpressionCtx) {
    return this.visitSingle(ctx);
  }

  ifStatement(ctx: IfStatementCtx) {
    const expression = this.visit(ctx.expression);

    const ifStatement = this.visit(ctx.statement[0], {
      allowEmptyStatement: true
    });
    const ifSeparator = isStatementEmptyStatement(ifStatement) ? "" : " ";

    let elsePart = "";
    if (ctx.Else !== undefined) {
      const elseStatement = this.visit(ctx.statement[1], {
        allowEmptyStatement: true
      });
      const elseSeparator = isStatementEmptyStatement(elseStatement) ? "" : " ";

      const elseOnSameLine =
        hasTrailingLineComments(ctx.statement[0]) ||
        hasLeadingLineComments(ctx.Else[0])
          ? hardline
          : " ";

      elsePart = rejectAndJoin(elseSeparator, [
        concat([elseOnSameLine, ctx.Else[0]]),
        elseStatement
      ]);
    }

    return rejectAndConcat([
      rejectAndJoin(" ", [
        ctx.If[0],
        concat([
          putIntoBraces(expression, softline, ctx.LBrace[0], ctx.RBrace[0]),
          ifSeparator
        ])
      ]),
      ifStatement,
      elsePart
    ]);
  }

  assertStatement(ctx: AssertStatementCtx) {
    const expressions = this.mapVisit(ctx.expression);
    const colon = ctx.Colon ? ctx.Colon[0] : ":";
    return rejectAndConcat([
      concat([ctx.Assert[0], " "]),
      rejectAndJoin(concat([" ", colon, " "]), expressions),
      ctx.Semicolon[0]
    ]);
  }

  switchStatement(ctx: SwitchStatementCtx) {
    const expression = this.visit(ctx.expression);
    const switchBlock = this.visit(ctx.switchBlock);

    return rejectAndJoin(" ", [
      ctx.Switch[0],
      putIntoBraces(expression, softline, ctx.LBrace[0], ctx.RBrace[0]),
      switchBlock
    ]);
  }

  switchBlock(ctx: SwitchBlockCtx) {
    const switchCases =
      ctx.switchBlockStatementGroup !== undefined
        ? this.mapVisit(ctx.switchBlockStatementGroup)
        : this.mapVisit(ctx.switchRule);

    return putIntoBraces(
      rejectAndJoin(hardline, switchCases),
      hardline,
      ctx.LCurly[0],
      ctx.RCurly[0]
    );
  }

  switchBlockStatementGroup(ctx: SwitchBlockStatementGroupCtx) {
    const switchLabels = this.mapVisit(ctx.switchLabel);

    const labels = [];
    for (let i = 0; i < switchLabels.length; i++) {
      labels.push(concat([switchLabels[i], ctx.Colon[i]]));
    }

    const blockStatements = this.visit(ctx.blockStatements);

    return indent(
      rejectAndJoin(hardline, [
        dedent(rejectAndJoin(hardline, labels)),
        blockStatements
      ])
    );
  }

  switchLabel(ctx: SwitchLabelCtx) {
    if (ctx.Case) {
      const caseConstants = this.mapVisit(ctx.caseConstant);

      const commas = ctx.Comma
        ? ctx.Comma.map(elt => {
            return concat([elt, line]);
          })
        : [];

      return group(
        indent(
          rejectAndConcat([
            concat([ctx.Case[0], " "]),
            rejectAndJoinSeps(commas, caseConstants)
          ])
        )
      );
    }

    return concat([ctx.Default![0]]);
  }

  switchRule(ctx: SwitchRuleCtx) {
    const switchLabel = this.visit(ctx.switchLabel);

    let caseInstruction;
    if (ctx.throwStatement !== undefined) {
      caseInstruction = this.visit(ctx.throwStatement);
    } else if (ctx.block !== undefined) {
      caseInstruction = this.visit(ctx.block);
    } else {
      caseInstruction = concat([this.visit(ctx.expression), ctx.Semicolon![0]]);
    }

    return join(" ", [switchLabel, ctx.Arrow[0], caseInstruction]);
  }

  caseConstant(ctx: CaseConstantCtx) {
    return this.visitSingle(ctx);
  }

  whileStatement(ctx: WhileStatementCtx) {
    const expression = this.visit(ctx.expression);
    const statement = this.visit(ctx.statement[0], {
      allowEmptyStatement: true
    });
    const statementSeparator = isStatementEmptyStatement(statement) ? "" : " ";

    return rejectAndJoin(" ", [
      ctx.While[0],
      rejectAndJoin(statementSeparator, [
        putIntoBraces(expression, softline, ctx.LBrace[0], ctx.RBrace[0]),
        statement
      ])
    ]);
  }

  doStatement(ctx: DoStatementCtx) {
    const statement = this.visit(ctx.statement[0], {
      allowEmptyStatement: true
    });
    const statementSeparator = isStatementEmptyStatement(statement) ? "" : " ";

    const expression = this.visit(ctx.expression);

    return rejectAndJoin(" ", [
      rejectAndJoin(statementSeparator, [ctx.Do[0], statement]),
      ctx.While[0],
      rejectAndConcat([
        putIntoBraces(expression, softline, ctx.LBrace[0], ctx.RBrace[0]),
        ctx.Semicolon[0]
      ])
    ]);
  }

  forStatement(ctx: ForStatementCtx) {
    return this.visitSingle(ctx);
  }

  basicForStatement(ctx: BasicForStatementCtx) {
    const forInit = this.visit(ctx.forInit);
    const expression = this.visit(ctx.expression);
    const forUpdate = this.visit(ctx.forUpdate);
    const statement = this.visit(ctx.statement[0], {
      allowEmptyStatement: true
    });
    const statementSeparator = isStatementEmptyStatement(statement) ? "" : " ";

    return rejectAndConcat([
      rejectAndJoin(" ", [
        ctx.For[0],
        putIntoBraces(
          rejectAndConcat([
            forInit,
            rejectAndJoin(line, [ctx.Semicolon[0], expression]),
            rejectAndJoin(line, [ctx.Semicolon[1], forUpdate])
          ]),
          softline,
          ctx.LBrace[0],
          ctx.RBrace[0]
        )
      ]),
      statementSeparator,
      statement
    ]);
  }

  forInit(ctx: ForInitCtx) {
    return this.visitSingle(ctx);
  }

  forUpdate(ctx: ForUpdateCtx) {
    return this.visitSingle(ctx);
  }

  statementExpressionList(ctx: StatementExpressionListCtx) {
    const statementExpressions = this.mapVisit(ctx.statementExpression);
    const commas = ctx.Comma
      ? ctx.Comma.map(elt => {
          return concat([printTokenWithComments(elt), " "]);
        })
      : [];
    return rejectAndJoinSeps(commas, statementExpressions);
  }

  enhancedForStatement(ctx: EnhancedForStatementCtx) {
    const variableModifiers = this.mapVisit(ctx.variableModifier);
    const localVariableType = this.visit(ctx.localVariableType);
    const variableDeclaratorId = this.visit(ctx.variableDeclaratorId);
    const expression = this.visit(ctx.expression);
    const statement = this.visit(ctx.statement[0], {
      allowEmptyStatement: true
    });
    const statementSeparator = isStatementEmptyStatement(statement) ? "" : " ";

    return rejectAndConcat([
      rejectAndJoin(" ", [ctx.For[0], ctx.LBrace[0]]),
      rejectAndJoin(" ", [
        rejectAndJoin(" ", variableModifiers),
        localVariableType,
        variableDeclaratorId
      ]),
      concat([" ", ctx.Colon[0], " "]),
      expression,
      concat([ctx.RBrace[0], statementSeparator]),
      statement
    ]);
  }

  breakStatement(ctx: BreakStatementCtx) {
    if (ctx.Identifier) {
      const identifier = ctx.Identifier[0];
      return rejectAndConcat([
        concat([ctx.Break[0], " "]),
        identifier,
        ctx.Semicolon[0]
      ]);
    }

    return concat([ctx.Break[0], ctx.Semicolon[0]]);
  }

  continueStatement(ctx: ContinueStatementCtx) {
    if (ctx.Identifier) {
      const identifier = ctx.Identifier[0];

      return rejectAndConcat([
        concat([ctx.Continue[0], " "]),
        identifier,
        ctx.Semicolon[0]
      ]);
    }

    return rejectAndConcat([ctx.Continue[0], ctx.Semicolon[0]]);
  }

  returnStatement(ctx: ReturnStatementCtx) {
    if (ctx.expression) {
      const expression = this.visit(ctx.expression, {
        addParenthesisToWrapStatement: true
      });

      return rejectAndConcat([
        concat([ctx.Return[0], " "]),
        expression,
        ctx.Semicolon[0]
      ]);
    }

    return rejectAndConcat([ctx.Return[0], ctx.Semicolon[0]]);
  }

  throwStatement(ctx: ThrowStatementCtx) {
    const expression = this.visit(ctx.expression);

    return rejectAndConcat([
      concat([ctx.Throw[0], " "]),
      expression,
      ctx.Semicolon[0]
    ]);
  }

  synchronizedStatement(ctx: SynchronizedStatementCtx) {
    const expression = this.visit(ctx.expression);
    const block = this.visit(ctx.block);

    return rejectAndConcat([
      join(" ", [
        ctx.Synchronized[0],
        concat([
          putIntoBraces(expression, softline, ctx.LBrace[0], ctx.RBrace[0]),
          " "
        ])
      ]),
      block
    ]);
  }

  tryStatement(ctx: TryStatementCtx) {
    if (ctx.tryWithResourcesStatement) {
      return this.visit(ctx.tryWithResourcesStatement);
    }

    const block = this.visit(ctx.block);
    const catches = this.visit(ctx.catches);
    const finallyBlock = this.visit(ctx.finally);

    return rejectAndJoin(" ", [ctx.Try![0], block, catches, finallyBlock]);
  }

  catches(ctx: CatchesCtx) {
    const catchClauses = this.mapVisit(ctx.catchClause);
    return rejectAndJoin(" ", catchClauses);
  }

  catchClause(ctx: CatchClauseCtx) {
    const catchFormalParameter = this.visit(ctx.catchFormalParameter);
    const block = this.visit(ctx.block);

    return rejectAndConcat([
      group(
        rejectAndConcat([
          rejectAndJoin(" ", [ctx.Catch[0], ctx.LBrace[0]]),
          indent(rejectAndConcat([softline, catchFormalParameter])),
          softline,
          concat([ctx.RBrace[0], " "])
        ])
      ),
      block
    ]);
  }

  catchFormalParameter(ctx: CatchFormalParameterCtx) {
    const variableModifiers = this.mapVisit(ctx.variableModifier);
    const catchType = this.visit(ctx.catchType);
    const variableDeclaratorId = this.visit(ctx.variableDeclaratorId);

    return rejectAndJoin(" ", [
      rejectAndJoin(" ", variableModifiers),
      catchType,
      variableDeclaratorId
    ]);
  }

  catchType(ctx: CatchTypeCtx) {
    const unannClassType = this.visit(ctx.unannClassType);
    const classTypes = this.mapVisit(ctx.classType);
    const ors = ctx.Or ? ctx.Or.map(elt => concat([line, elt, " "])) : [];

    return group(rejectAndJoinSeps(ors, [unannClassType, ...classTypes]));
  }

  finally(ctx: FinallyCtx) {
    const block = this.visit(ctx.block);

    return rejectAndJoin(" ", [ctx.Finally[0], block]);
  }

  tryWithResourcesStatement(ctx: TryWithResourcesStatementCtx) {
    const resourceSpecification = this.visit(ctx.resourceSpecification);
    const block = this.visit(ctx.block);
    const catches = this.visit(ctx.catches);
    const finallyBlock = this.visit(ctx.finally);

    return rejectAndJoin(" ", [
      ctx.Try[0],
      resourceSpecification,
      block,
      catches,
      finallyBlock
    ]);
  }

  resourceSpecification(ctx: ResourceSpecificationCtx) {
    const resourceList = this.visit(ctx.resourceList);
    const optionalSemicolon = ctx.Semicolon ? ctx.Semicolon[0] : "";

    return putIntoBraces(
      rejectAndConcat([resourceList, optionalSemicolon]),
      softline,
      ctx.LBrace[0],
      ctx.RBrace[0]
    );
  }

  resourceList(ctx: ResourceListCtx) {
    const resources = this.mapVisit(ctx.resource);
    const semicolons = ctx.Semicolon
      ? ctx.Semicolon.map(elt => {
          return concat([elt, line]);
        })
      : [""];
    return rejectAndJoinSeps(semicolons, resources);
  }

  resource(ctx: ResourceCtx) {
    return this.visitSingle(ctx);
  }

  resourceInit(ctx: ResourceInitCtx) {
    const variableModifiers = this.mapVisit(ctx.variableModifier);
    const localVariableType = this.visit(ctx.localVariableType);
    const identifier = ctx.Identifier[0];
    const expression = this.visit(ctx.expression);

    return rejectAndJoin(" ", [
      rejectAndJoin(" ", variableModifiers),
      localVariableType,
      identifier,
      ctx.Equals[0],
      expression
    ]);
  }

  yieldStatement(ctx: YieldStatementCtx) {
    const expression = this.visit(ctx.expression);
    return join(" ", [ctx.Yield[0], concat([expression, ctx.Semicolon[0]])]);
  }

  variableAccess(ctx: VariableAccessCtx) {
    return this.visitSingle(ctx);
  }

  isBasicForStatement() {
    return "isBasicForStatement";
  }

  isLocalVariableDeclaration() {
    return "isLocalVariableDeclaration";
  }

  isClassicSwitchLabel() {
    return "isClassicSwitchLabel";
  }
}
