import type { NamedType } from "../node-types.ts";
import arrays from "./arrays.ts";
import blocksAndStatements from "./blocks-and-statements.ts";
import classes from "./classes.ts";
import expressions from "./expressions.ts";
import {
  printValue,
  type NamedNodePrinter,
  type NamedNodePrinters
} from "./helpers.ts";
import interfaces from "./interfaces.ts";
import lexicalStructure from "./lexical-structure.ts";
import names from "./names.ts";
import packagesAndModules from "./packages-and-modules.ts";
import typesValuesAndVariables from "./types-values-and-variables.ts";

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
