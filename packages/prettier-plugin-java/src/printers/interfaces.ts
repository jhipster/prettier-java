import type { Doc } from "prettier";
import { builders } from "prettier/doc";
import {
  call,
  hasDeclarationAnnotations,
  indentInParentheses,
  lineEndWithComments,
  lineStartWithComments,
  map,
  onlyDefinedKey,
  printArrayInitializer,
  printBlock,
  printClassPermits,
  printList,
  printSingle,
  sortModifiersAndGetDeclarationAnnotationCount,
  type JavaNodePrinters
} from "./helpers.js";

const { group, hardline, indent, join, line } = builders;

export default {
  interfaceDeclaration(path, print) {
    const { children } = path.node;
    const annotationCount = sortModifiersAndGetDeclarationAnnotationCount(
      children.interfaceModifier ?? [],
      true
    );
    const modifiers = children.interfaceModifier
      ? map(path, print, "interfaceModifier")
      : [];
    const annotations = modifiers.slice(0, annotationCount);
    const otherModifiers = modifiers.slice(annotationCount);

    const declarationKey = onlyDefinedKey(children, [
      "annotationInterfaceDeclaration",
      "normalInterfaceDeclaration"
    ]);
    return join(hardline, [
      ...annotations,
      join(" ", [...otherModifiers, call(path, print, declarationKey)])
    ]);
  },

  normalInterfaceDeclaration(path, print) {
    const { interfaceExtends, interfacePermits, typeParameters } =
      path.node.children;
    const header = ["interface ", call(path, print, "typeIdentifier")];
    if (typeParameters) {
      header.push(call(path, print, "typeParameters"));
    }
    if (interfaceExtends) {
      header.push(indent([line, call(path, print, "interfaceExtends")]));
    }
    if (interfacePermits) {
      header.push(indent([line, call(path, print, "interfacePermits")]));
    }
    return [group(header), " ", call(path, print, "interfaceBody")];
  },

  interfaceModifier: printSingle,

  interfaceExtends(path, print) {
    return group([
      "extends",
      indent([line, call(path, print, "interfaceTypeList")])
    ]);
  },

  interfacePermits: printClassPermits,

  interfaceBody(path, print) {
    const declarations: Doc[] = [];
    if (path.node.children.interfaceMemberDeclaration) {
      let previousRequiresPadding = false;
      path.each(
        declarationPath => {
          const declaration = print(declarationPath);
          if (declaration === "") {
            return;
          }
          const { node, previous } = declarationPath;
          const constantDeclaration =
            node.children.constantDeclaration?.[0].children;
          const methodDeclaration =
            node.children.interfaceMethodDeclaration?.[0].children;
          const currentRequiresPadding =
            (!constantDeclaration && !methodDeclaration) ||
            methodDeclaration?.methodBody[0].children.block !== undefined ||
            hasDeclarationAnnotations(
              constantDeclaration?.constantModifier ??
                methodDeclaration?.interfaceMethodModifier ??
                []
            );
          const blankLine =
            declarations.length > 0 &&
            (previousRequiresPadding ||
              currentRequiresPadding ||
              lineStartWithComments(node) > lineEndWithComments(previous!) + 1);
          declarations.push(blankLine ? [hardline, declaration] : declaration);
          previousRequiresPadding = currentRequiresPadding;
        },
        "children",
        "interfaceMemberDeclaration"
      );
    }
    return printBlock(path, declarations);
  },

  interfaceMemberDeclaration(path, print) {
    const { children } = path.node;
    return children.Semicolon
      ? ""
      : call(path, print, onlyDefinedKey(children));
  },

  constantDeclaration(path, print) {
    const { children } = path.node;
    const declarationAnnotationCount =
      sortModifiersAndGetDeclarationAnnotationCount(
        children.constantModifier ?? []
      );
    const modifiers = children.constantModifier
      ? map(path, print, "constantModifier")
      : [];
    const declarationAnnotations = modifiers.slice(
      0,
      declarationAnnotationCount
    );
    const otherModifiers = modifiers.slice(declarationAnnotationCount);

    return join(hardline, [
      ...declarationAnnotations,
      join(" ", [
        ...otherModifiers,
        call(path, print, "unannType"),
        [call(path, print, "variableDeclaratorList"), ";"]
      ])
    ]);
  },

  constantModifier: printSingle,

  interfaceMethodDeclaration(path, print) {
    const { children } = path.node;
    const declarationAnnotationCount =
      sortModifiersAndGetDeclarationAnnotationCount(
        children.interfaceMethodModifier ?? []
      );
    const modifiers = children.interfaceMethodModifier
      ? map(path, print, "interfaceMethodModifier")
      : [];
    const declarationAnnotations = modifiers.slice(
      0,
      declarationAnnotationCount
    );
    const otherModifiers = modifiers.slice(declarationAnnotationCount);

    const header = call(path, print, "methodHeader");
    const body = call(path, print, "methodBody");

    const bodySeparator = children.methodBody[0].children.Semicolon ? "" : " ";

    return join(hardline, [
      ...declarationAnnotations,
      join(" ", [...otherModifiers, [header, bodySeparator, body]])
    ]);
  },

  interfaceMethodModifier: printSingle,

  annotationInterfaceDeclaration(path, print) {
    return join(" ", [
      "@interface",
      call(path, print, "typeIdentifier"),
      call(path, print, "annotationInterfaceBody")
    ]);
  },

  annotationInterfaceBody(path, print) {
    const declarations = (
      path.node.children.annotationInterfaceMemberDeclaration
        ? map(
            path,
            declarationPath => {
              const declaration = print(declarationPath);
              return declarationPath.isFirst
                ? declaration
                : [hardline, declaration];
            },
            "annotationInterfaceMemberDeclaration"
          )
        : []
    ).filter(declaration => declaration !== "");
    return printBlock(path, declarations);
  },

  annotationInterfaceMemberDeclaration(path, print) {
    const { children } = path.node;
    return children.Semicolon
      ? ""
      : call(path, print, onlyDefinedKey(children));
  },

  annotationInterfaceElementDeclaration(path, print) {
    const { children } = path.node;
    const declarationAnnotationCount =
      sortModifiersAndGetDeclarationAnnotationCount(
        children.annotationInterfaceElementModifier ?? []
      );
    const modifiers = children.annotationInterfaceElementModifier
      ? map(path, print, "annotationInterfaceElementModifier")
      : [];
    const declarationAnnotations = modifiers.slice(
      0,
      declarationAnnotationCount
    );
    const otherModifiers = modifiers.slice(declarationAnnotationCount);

    const declaration = [call(path, print, "Identifier"), "()"];
    if (children.dims) {
      declaration.push(call(path, print, "dims"));
    }
    if (children.defaultValue) {
      declaration.push(" ", call(path, print, "defaultValue"));
    }
    declaration.push(";");
    return join(hardline, [
      ...declarationAnnotations,
      join(" ", [
        ...otherModifiers,
        call(path, print, "unannType"),
        declaration
      ])
    ]);
  },

  annotationInterfaceElementModifier: printSingle,

  defaultValue(path, print) {
    return ["default ", call(path, print, "elementValue")];
  },

  annotation(path, print) {
    const { children } = path.node;
    const annotation = ["@", call(path, print, "typeName")];
    if (children.elementValue || children.elementValuePairList) {
      const valuesKey = onlyDefinedKey(children, [
        "elementValue",
        "elementValuePairList"
      ]);
      annotation.push(indentInParentheses(call(path, print, valuesKey)));
    }
    return annotation;
  },

  elementValuePairList(path, print) {
    return printList(path, print, "elementValuePair");
  },

  elementValuePair(path, print) {
    return join(" ", [
      call(path, print, "Identifier"),
      call(path, print, "Equals"),
      call(path, print, "elementValue")
    ]);
  },

  elementValue: printSingle,

  elementValueArrayInitializer(path, print, options) {
    return printArrayInitializer(path, print, options, "elementValueList");
  },

  elementValueList(path, print) {
    return group(printList(path, print, "elementValue"));
  }
} satisfies Partial<JavaNodePrinters>;
