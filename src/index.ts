import type { Plugin } from "prettier";
import type { SyntaxNode } from "./node-types.ts";
import options from "./options.ts";
import parser from "./parser.ts";
import printer from "./printer.ts";

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
} satisfies Plugin<SyntaxNode>;
