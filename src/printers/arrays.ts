import { printArrayInitializer, type NamedNodePrinters } from "./helpers.js";

export default {
  array_initializer: printArrayInitializer
} satisfies Partial<NamedNodePrinters>;
