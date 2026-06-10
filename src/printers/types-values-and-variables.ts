import { builders } from "prettier/doc";
import {
  printTypeParameters,
  printValue,
  type NamedNodePrinters
} from "./helpers.ts";

const { group, indent, join, line } = builders;

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
    return path.map(child => {
      if (child.node.isNamed) {
        return [...(child.isFirst ? [" "] : []), print(child), " "];
      }
      return child.node.value;
    }, "children");
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

  type_arguments: printTypeParameters,

  wildcard(path, print) {
    return join(" ", path.map(print, "children"));
  }
} satisfies Partial<NamedNodePrinters>;
