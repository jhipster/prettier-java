import { BaseCstPrettierPrinter } from "./base-cst-printer.js";
import { ArraysPrettierVisitor } from "./printers/arrays.js";
import { BlocksAndStatementPrettierVisitor } from "./printers/blocks-and-statements.js";
import { ClassesPrettierVisitor } from "./printers/classes.js";
import { ExpressionsPrettierVisitor } from "./printers/expressions.js";
import { InterfacesPrettierVisitor } from "./printers/interfaces.js";
import { LexicalStructurePrettierVisitor } from "./printers/lexical-structure.js";
import { NamesPrettierVisitor } from "./printers/names.js";
import { TypesValuesAndVariablesPrettierVisitor } from "./printers/types-values-and-variables.js";
import { PackagesAndModulesPrettierVisitor } from "./printers/packages-and-modules.js";

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

function mixInMethods(...classesToMix: any[]) {
  classesToMix.forEach(from => {
    const fromMethodsNames = Object.getOwnPropertyNames(from.prototype);
    const fromPureMethodsName = fromMethodsNames.filter(
      methodName => methodName !== "constructor"
    );
    fromPureMethodsName.forEach(methodName => {
      // @ts-ignore
      BaseCstPrettierPrinter.prototype[methodName] = from.prototype[methodName];
    });
  });
}

const prettyPrinter = new BaseCstPrettierPrinter();

// TODO: do we need the "path" and "print" arguments passed by prettier
// see https://github.com/prettier/prettier/issues/5747
export function createPrettierDoc(cstNode: any, options: any) {
  prettyPrinter.prettierOptions = options;
  return prettyPrinter.visit(cstNode);
}
