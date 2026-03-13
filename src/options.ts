import type { SupportOptions } from "prettier";

export default {
  arrowParens: {
    type: "choice",
    category: "Java",
    default: "always",
    choices: [
      { value: "always", description: "" },
      { value: "avoid", description: "" }
    ],
    description: "Include parentheses around a sole arrow function parameter."
  },
  trailingComma: {
    type: "choice",
    category: "Java",
    default: "all",
    choices: [
      { value: "all", description: "" },
      { value: "es5", description: "" },
      { value: "none", description: "" }
    ],
    description: "Print trailing commas wherever possible when multi-line."
  },
  experimentalOperatorPosition: {
    type: "choice",
    category: "Java",
    default: "end",
    choices: [
      { value: "start", description: "" },
      { value: "end", description: "" }
    ],
    description: "Where to print operators when binary expressions wrap lines."
  }
} satisfies SupportOptions;
