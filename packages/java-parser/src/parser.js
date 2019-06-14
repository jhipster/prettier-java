"use strict";
const { Parser, isRecognitionException } = require("chevrotain");
const { allTokens, tokens: t } = require("./tokens");
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
      // TODO: performance: maxLookahead = 1 may be faster, but could we refactor the grammar to it?
      //       and more importantly, do we want to?
      maxLookahead: 2,
      // ambiguities resolved by backtracking
      ignoredIssues: {
        binaryExpression: {
          OR: true
        },
        lambdaParameterType: {
          OR: true
        },
        annotation: {
          OR: true
        },
        localVariableType: {
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
        },
        primaryPrefix: {
          OR: true
        },
        castExpression: {
          OR: true
        },
        referenceTypeCastExpression: {
          OR: true
        },
        elementValue: {
          OR: true
        },
        resource: {
          OR: true
        },
        forInit: {
          OR: true
        },
        interfaceDeclaration: {
          OR: true
        }
      },
      nodeLocationTracking: "full"
    });

    const $ = this;

    // ---------------------
    // Productions from §3 (Lexical Structure)
    // ---------------------
    // TODO: move this rule to the correct file
    $.RULE("typeIdentifier", () => {
      // TODO: implement: Identifier but not var in the lexer
      $.CONSUME(t.Identifier);
    });

    // Include the productions from all "chapters".
    lexicalStructure.defineRules.call(this, $, t);
    typesValuesVariables.defineRules.call(this, $, t);
    names.defineRules.call(this, $, t);
    classes.defineRules.call(this, $, t);
    packagesModules.defineRules.call(this, $, t);
    interfaces.defineRules.call(this, $, t);
    arrays.defineRules.call(this, $, t);
    blocksStatements.defineRules.call(this, $, t);
    expressions.defineRules.call(this, $, t);

    this.performSelfAnalysis();
  }

  // hack to turn off CST building side effects during backtracking
  // TODO: should be patched in Chevrotain
  cstPostNonTerminal(ruleCstResult, ruleName) {
    if (this.isBackTracking() === false) {
      super.cstPostNonTerminal(ruleCstResult, ruleName);
    }
  }

  BACKTRACK_LOOKAHEAD(production, errValue = false) {
    this.isBackTrackingStack.push(1);
    // TODO: "saveRecogState" does not handle the occurrence stack
    const orgState = this.saveRecogState();
    try {
      // hack to enable outputting none CST values from grammar rules.
      this.outputCst = false;
      return production.call(this);
    } catch (e) {
      if (isRecognitionException(e)) {
        return errValue;
      }
      throw e;
    } finally {
      this.outputCst = true;
      this.reloadRecogState(orgState);
      this.isBackTrackingStack.pop();
    }
  }
}

module.exports = JavaParser;
