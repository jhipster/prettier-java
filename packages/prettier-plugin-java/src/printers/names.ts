import { printName, printSingle, type JavaNodePrinters } from "./helpers.js";

export default {
  typeIdentifier: printSingle,
  moduleName: printName,
  packageName: printName,
  typeName: printName,
  expressionName: printName,
  methodName: printSingle,
  packageOrTypeName: printName,
  ambiguousName: printName
} satisfies Partial<JavaNodePrinters>;
