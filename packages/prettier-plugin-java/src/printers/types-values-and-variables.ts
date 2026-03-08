import { builders } from "prettier/doc";
import { printValue, type JavaNodePrinters } from "./helpers.js";

const { group, indent, join, line, softline } = builders;

export default {
  boolean_type: printValue,
  integral_type: printValue,
  floating_point_type: printValue,
  void_type: printValue,

  array_type(path, print) {
    return [
      path.call(print, "elementNode"),
      path.call(print, "dimensionsNode")
    ];
  },

  annotated_type(path, print) {
    return join(" ", path.map(print, "children"));
  },

  dimensions(path, print) {
    return path.map(
      child => (child.node.isNamed ? [print(child), " "] : child.node.value),
      "children"
    );
  },

  type_parameter(path, print) {
    return join(" ", path.map(print, "children"));
  },

  type_bound(path, print) {
    const [firstType, ...restTypes] = path.map(print, "namedChildren");
    const bound = ["extends ", firstType];
    if (restTypes.length) {
      bound.push(group(indent([line, "& ", ...join([line, "& "], restTypes)])));
    }
    return bound;
  },

  type_arguments(path, print) {
    const types = path.map(print, "namedChildren");

    return types.length
      ? group([
          "<",
          indent([softline, join([",", line], types)]),
          softline,
          ">"
        ])
      : "<>";
  },

  wildcard(path, print) {
    return join(" ", path.map(print, "children"));
  }
} satisfies Partial<JavaNodePrinters>;
