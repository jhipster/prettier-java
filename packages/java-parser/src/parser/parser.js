"use strict";
const { Parser } = require("chevrotain");
const { allTokens, tokens: t } = require("./tokens_new");
const typesValuesVariables = require("./productions/types-values-and-variables");
const names = require("./productions/names");
const packagesModules = require("./productions/packages-and-modules");
const classes = require("./productions/classes");
const interfaces = require("./productions/interfaces");
const arrays = require("./productions/arrays");

/**
 * This parser attempts to strongly align with the specs style at:
 * -  https://docs.oracle.com/javase/specs/jls/se11/html/jls-19.html
 *
 * Deviations from the spec will be marked.
 *
 * Note that deviations from the spec do not mean deviations from Java Grammar.
 * Rather it means an **equivalent** grammar which was written differently, e.g:
 * - LL(k) vs LR(K)
 * - Left Recursions vs Repetitions
 * - NonTerminals combined together or divided to sub-NonTerminals
 * - ...
 *
 * A special type of spec deviations are the "super grammar" kind.
 * This means that the parser has been defined in such a way that it accept a
 * **strict superset** of the inputs the official grammar accepts.
 *
 * This technique is used to simplify the parser when narrowing the set
 * of accepted inputs can more easily be done in a post parsing phase.
 *
 * TODO: document guide lines for using back tracking
 *
 */
class JavaParser extends Parser {
  constructor() {
    super(allTokens, {
      // ambiguities resolved by backtracking
      ignoredIssues: {
        annotation: {
          OR: true
        },
        annotationTypeMemberDeclaration: {
          OR: true
        },
        typeDeclaration: {
          OR: true
        },
        typeArgument: {
          OR: true
        },
        arrayType: {
          OR: true
        },
        type: {
          OR: true
        },
        referenceType: {
          OR: true
        },
        compilationUnit: {
          OR: true
        },
        classBodyDeclaration: {
          OR: true
        },
        classMemberDeclaration: {
          OR: true
        },
        unannReferenceType: {
          OR: true
        },
        formalParameter: {
          OR: true
        },
        interfaceMemberDeclaration: {
          OR: true
        }
      }
    });

    const $ = this;

    // ---------------------
    // Productions from §3 (Lexical Structure)
    // ---------------------
    $.RULE("typeIdentifier", () => {
      // TODO: implement: Identifier but not var
      $.CONSUME(t.Identifier);
    });

    // Include the productions from all "chapters".
    typesValuesVariables.defineRules($, t);
    names.defineRules($, t);
    classes.defineRules($, t);
    packagesModules.defineRules($, t);
    interfaces.defineRules($, t);
    arrays.defineRules($, t);

    // ---------------------
    // Productions from §14 (Blocks and Statements)
    // ---------------------
    $.RULE("block", () => {
      $.CONSUME(t.LCurly);
      // TODO: TBD
    });

    $.RULE("blockStatements", () => {
      $.CONSUME(t.Var);
      // TODO: TBD
    });

    // ---------------------
    // Productions from §15 (Expressions)
    // ---------------------
    $.RULE("expression", () => {
      $.CONSUME(t.CharLiteral);
      // TODO: TBD
    });

    $.RULE("primary", () => {
      $.CONSUME(t.This);
      // TODO: TBD
    });

    $.RULE("argumentList", () => {
      $.SUBRULE($.expression);
      // TODO: TBD
    });

    $.RULE("conditionalExpression", () => {
      // TODO: TBD
      $.CONSUME(t.CharLiteral);
    });

    // ---------------------
    // Backtracking lookahead logic
    // ---------------------

    $.RULE("isExpressionName", () => {
      this.isBackTrackingStack.push(1);
      const orgState = this.saveRecogState();
      try {
        $.SUBRULE($.expressionName);
        const nextTokenType = this.LA(1).tokenType;
        const nextNextTokenType = this.LA(2).tokenType;
        return (
          nextTokenType === t.Dot &&
          (nextNextTokenType === t.Less || nextNextTokenType === t.Super)
        );
      } catch (e) {
        return false;
      } finally {
        this.reloadRecogState(orgState);
        this.isBackTrackingStack.pop();
      }
    });

    this.performSelfAnalysis();
  }

  // hack to turn off CST building side effects during backtracking
  // TODO:
  cstPostNonTerminal(ruleCstResult, ruleName) {
    if (this.isBackTracking() === false) {
      super.cstPostNonTerminal(ruleCstResult, ruleName);
    }
  }
}

// TODO: remove this - only used during development to force self analysis
new JavaParser();

module.exports = JavaParser;
