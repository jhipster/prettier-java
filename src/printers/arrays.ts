import { printArrayInitializer, type JavaNodePrinters } from "./helpers.js";

export default {
  array_initializer: printArrayInitializer
} satisfies Partial<JavaNodePrinters>;
