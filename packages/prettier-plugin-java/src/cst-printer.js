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
