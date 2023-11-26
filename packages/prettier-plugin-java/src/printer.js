import { createPrettierDoc } from "./cst-printer.js";

// eslint-disable-next-line no-unused-vars
export default function genericPrint(path, options, print) {
  const node = path.getValue();
  return createPrettierDoc(node, options);
}
