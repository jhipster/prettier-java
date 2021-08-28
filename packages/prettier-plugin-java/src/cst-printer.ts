import { BaseCstPrettierPrinter } from "./base-cst-printer";
import { ArraysPrettierVisitor } from "./printers/arrays";
import { BlocksAndStatementPrettierVisitor } from "./printers/blocks-and-statements";
import { ClassesPrettierVisitor } from "./printers/classes";
import { ExpressionsPrettierVisitor } from "./printers/expressions";
import { InterfacesPrettierVisitor } from "./printers/interfaces";
import { LexicalStructurePrettierVisitor } from "./printers/lexical-structure";
import { NamesPrettierVisitor } from "./printers/names";
import { TypesValuesAndVariablesPrettierVisitor } from "./printers/types-values-and-variables";
import { PackagesAndModulesPrettierVisitor } from "./printers/packages-and-modules";

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
