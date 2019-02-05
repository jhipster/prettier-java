"use strict";

const { BaseJavaCstVisitor } = require("java-parser");
const { ArraysPrettierVisitor } = require("./printers/arrays");
const {
  BlocksAndStatementPrettierVisitor
} = require("./printers/blocks-and-statements");
const { ClassesPrettierVisitor } = require("./printers/classes");
const { ExpressionsPrettierVisitor } = require("./printers/expressions");
const { InterfacesPrettierVisitor } = require("./printers/interfaces");
const {
  LexicalStructurePrettierVisitor
} = require("./printers/lexical-structure");
const { NamesPrettierVisitor } = require("./printers/names");
const {
  TypesValuesAndVariablesPrettierVisitor
} = require("./printers/types-values-and-variables");
const {
  PackagesAndModulesPrettierVisitor
} = require("./printers/packages-and-modules");

class CstPrettierPrinter extends BaseJavaCstVisitor {
  constructor() {
    super();
    // TODO: can we ignore the optimized lookahead methods here?
    this.validateVisitor();

    // TODO: this methods should be defined on the prototype
    // defining as instance members **after** the validations to avoid
    // false positive errors on redundant methods
    this.mapVisit = elements => {
      if (elements === undefined) {
        // TODO: can optimize this by returning an immutable empty array singleton.
        return [];
      }

      return elements.map(this.visit, this);
    };

    this.getSingle = function(ctx) {
      const ctxKeys = Object.keys(ctx);
      if (ctxKeys.length !== 1) {
        throw Error(
          `Expecting single key CST ctx but found: <${ctxKeys.length}> keys`
        );
      }
      const singleElementKey = ctxKeys[0];
      const singleElementValues = ctx[singleElementKey];

      if (singleElementValues.length !== 1) {
        throw Error(
          `Expecting single item in CST ctx key but found: <${
            singleElementValues.length
          }> items`
        );
      }

      return singleElementValues[0];
    };

    this.visitSingle = function(ctx) {
      const singleElement = this.getSingle(ctx);
      return this.visit(singleElement);
    };

    // hack to get a reference to the inherited visit method from
    // the prototype because we cannot user "super.visit" inside the function
    // below
    const orgVisit = this.visit;
    this.visit = function(ctx, inParam) {
      if (ctx === undefined) {
        // empty Doc
        return "";
      }

      return orgVisit.call(this, ctx, inParam);
    };
  }
}

// Mixins for the win
mixInMethods(
  ArraysPrettierVisitor,
  BlocksAndStatementPrettierVisitor,
  ClassesPrettierVisitor,
  ExpressionsPrettierVisitor,
  InterfacesPrettierVisitor,
  LexicalStructurePrettierVisitor,
  NamesPrettierVisitor,
  TypesValuesAndVariablesPrettierVisitor,
  PackagesAndModulesPrettierVisitor
);

function mixInMethods(...classesToMix) {
  classesToMix.forEach(from => {
    const fromMethodsNames = Object.getOwnPropertyNames(from.prototype);
    const fromPureMethodsName = fromMethodsNames.filter(
      methodName => methodName !== "constructor"
    );
    fromPureMethodsName.forEach(methodName => {
      CstPrettierPrinter.prototype[methodName] = from.prototype[methodName];
    });
  });
}

const prettyPrinter = new CstPrettierPrinter();

// TODO: do we need the "path" and "print" arguments passed by prettier
// see https://github.com/prettier/prettier/issues/5747
function createPrettierDoc(cstNode) {
  return prettyPrinter.visit(cstNode);
}

module.exports = {
  createPrettierDoc
};
