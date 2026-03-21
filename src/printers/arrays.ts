import { printArrayInitializer, type NamedNodePrinters } from "./helpers.ts";

export default {
  array_initializer: printArrayInitializer
} satisfies Partial<NamedNodePrinters>;
