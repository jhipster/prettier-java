import arrays from "./arrays.js";
import blocksAndStatements from "./blocks-and-statements.js";
import classes from "./classes.js";
import expressions from "./expressions.js";
import type { JavaNodePrinter, JavaNodePrinters } from "./helpers.js";
import interfaces from "./interfaces.js";
import lexicalStructure from "./lexical-structure.js";
import names from "./names.js";
import packagesAndModules from "./packages-and-modules.js";
import typesValuesAndVariables from "./types-values-and-variables.js";

const printersByNodeType: JavaNodePrinters = {
  ...arrays,
  ...blocksAndStatements,
  ...classes,
  ...expressions,
  ...interfaces,
  ...lexicalStructure,
  ...names,
  ...packagesAndModules,
  ...typesValuesAndVariables
};

export function printerForNodeType<T extends keyof JavaNodePrinters>(
  type: T
): JavaNodePrinter<T> {
  return printersByNodeType[type];
}
