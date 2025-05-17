import type { Plugin } from "prettier";
import options from "./options.js";
import parser from "./parser.js";
import printer from "./printer.js";
import type { JavaNode } from "./printers/helpers.js";

export default {
  languages: [
    {
      name: "Java",
      parsers: ["java"],
      group: "Java",
      tmScope: "source.java",
      aceMode: "java",
      codemirrorMode: "clike",
      codemirrorMimeType: "text/x-java",
      extensions: [".java"],
      linguistLanguageId: 181,
      vscodeLanguageIds: ["java"]
    }
  ],
  parsers: {
    java: parser
  },
  printers: {
    java: printer
  },
  options,
  defaultOptions: {
    arrowParens: "avoid"
  }
} satisfies Plugin<JavaNode>;
