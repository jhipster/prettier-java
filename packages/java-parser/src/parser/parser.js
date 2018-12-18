"use strict";
const { Parser } = require("chevrotain");
const { allTokens, tokens: t } = require("./tokens_new");
const lexicalStructure = require("./productions/lexical-structure");
const typesValuesVariables = require("./productions/types-values-and-variables");
const names = require("./productions/names");
const packagesModules = require("./productions/packages-and-modules");
const classes = require("./productions/classes");
const interfaces = require("./productions/interfaces");
const arrays = require("./productions/arrays");
const blocksStatements = require("./productions/blocks-and-statements");
const expressions = require("./productions/expressions");

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
        },
        blockStatement: {
          OR: true
        },
        forStatement: {
          OR: true
        },
        newExpression: {
          OR: true
        },
        arrayCreationExpression: {
          OR: true,
          OR2: true
        },
        expression: {
          OR: true
        },
        lambdaParameterList: {
          OR: true
        },
        lambdaParameter: {
          OR: true
        }
      }
    });

    const $ = this;

    // ---------------------
    // Productions from §3 (Lexical Structure)
    // ---------------------
    $.RULE("typeIdentifier", () => {
      // TODO: implement: Identifier but not var in the lexer
      $.CONSUME(t.Identifier);
    });

    // Include the productions from all "chapters".
    lexicalStructure.defineRules($, t);
    typesValuesVariables.defineRules($, t);
    names.defineRules($, t);
    classes.defineRules($, t);
    packagesModules.defineRules($, t);
    interfaces.defineRules($, t);
    arrays.defineRules($, t);
    blocksStatements.defineRules($, t);
    expressions.defineRules($, t);

    // ---------------------
    // Productions from §15 (Expressions)
    // ---------------------

    $.RULE("conditionalExpression", () => {
      // TODO: TBD
      $.CONSUME(t.CharLiteral);
    });

    $.RULE("constantExpression", () => {
      $.SUBRULE($.expression);
    });

    $.RULE("fieldAccess", () => {
      // TODO: TBD
      $.CONSUME(t.Super);
      $.CONSUME(t.Dot);
      $.CONSUME(t.Identifier);
    });

    this.performSelfAnalysis();
  }

  // hack to turn off CST building side effects during backtracking
  // TODO: should be patched in Chevrotain
  cstPostNonTerminal(ruleCstResult, ruleName) {
    if (this.isBackTracking() === false) {
      super.cstPostNonTerminal(ruleCstResult, ruleName);
    }
  }
}

// TODO: remove this - only used during development to force self analysis
new JavaParser();

module.exports = JavaParser;
