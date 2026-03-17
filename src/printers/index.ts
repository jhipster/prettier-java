import type { NamedType } from "../node-types.js";
import arrays from "./arrays.js";
import blocksAndStatements from "./blocks-and-statements.js";
import classes from "./classes.js";
import expressions from "./expressions.js";
import {
  printValue,
  type NamedNodePrinter,
  type NamedNodePrinters
} from "./helpers.js";
import interfaces from "./interfaces.js";
import lexicalStructure from "./lexical-structure.js";
import names from "./names.js";
import packagesAndModules from "./packages-and-modules.js";
import typesValuesAndVariables from "./types-values-and-variables.js";

const printersByNodeType: NamedNodePrinters = {
  ERROR(path) {
    throw new Error(`Failed to parse: "${printValue(path)}"`);
  },
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

export function printerForNodeType<T extends NamedType>(
  type: T
): NamedNodePrinter<T> {
  return printersByNodeType[type];
}
