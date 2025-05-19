import { builders } from "prettier/doc";
import {
  call,
  definedKeys,
  flatMap,
  isNonTerminal,
  map,
  onlyDefinedKey,
  printClassType,
  printList,
  printSingle,
  type JavaNodePrinters
} from "./helpers.js";

const { group, indent, join, line, softline } = builders;

export default {
  primitiveType(path, print) {
    const { children } = path.node;
    const typeKey = onlyDefinedKey(children, ["Boolean", "numericType"]);
    return join(" ", [
      ...map(path, print, "annotation"),
      call(path, print, typeKey)
    ]);
  },

  numericType: printSingle,
  integralType: printSingle,
  floatingPointType: printSingle,

  referenceType(path, print) {
    const { children } = path.node;
    const typeKey = onlyDefinedKey(children, [
      "primitiveType",
      "classOrInterfaceType"
    ]);
    const type = call(path, print, typeKey);
    return join(" ", [
      ...map(path, print, "annotation"),
      children.dims ? [type, call(path, print, "dims")] : type
    ]);
  },

  classOrInterfaceType: printSingle,
  classType: printClassType,
  interfaceType: printSingle,

  typeVariable(path, print) {
    return join(" ", [
      ...map(path, print, "annotation"),
      call(path, print, "Identifier")
    ]);
  },

  dims(path, print) {
    return flatMap(
      path,
      childPath => {
        const child = print(childPath);
        return isNonTerminal(childPath.node) ? [child, " "] : child;
      },
      definedKeys(path.node.children, ["annotation", "LSquare", "RSquare"])
    );
  },

  typeParameter(path, print) {
    const parameter = [
      ...map(path, print, "typeParameterModifier"),
      call(path, print, "typeIdentifier")
    ];
    if (path.node.children.typeBound) {
      parameter.push(call(path, print, "typeBound"));
    }
    return join(" ", parameter);
  },

  typeParameterModifier: printSingle,

  typeBound(path, print) {
    const bound = ["extends ", call(path, print, "classOrInterfaceType")];
    if (path.node.children.additionalBound) {
      bound.push(
        group(
          indent([line, ...join(line, map(path, print, "additionalBound"))])
        )
      );
    }
    return bound;
  },

  additionalBound(path, print) {
    return ["& ", call(path, print, "interfaceType")];
  },

  typeArguments(path, print) {
    return group([
      "<",
      indent([softline, call(path, print, "typeArgumentList")]),
      softline,
      ">"
    ]);
  },

  typeArgumentList(path, print) {
    return printList(path, print, "typeArgument");
  },

  typeArgument: printSingle,

  wildcard(path, print) {
    const wildcard = [...map(path, print, "annotation"), "?"];
    if (path.node.children.wildcardBounds) {
      wildcard.push(call(path, print, "wildcardBounds"));
    }
    return join(" ", wildcard);
  },

  wildcardBounds(path, print) {
    return [
      path.node.children.Extends ? "extends" : "super",
      " ",
      call(path, print, "referenceType")
    ];
  }
} satisfies Partial<JavaNodePrinters>;
