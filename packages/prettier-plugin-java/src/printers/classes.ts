import type {
  ClassBodyCstNode,
  EnumBodyDeclarationsCstNode
} from "java-parser";
import type { AstPath, Doc } from "prettier";
import { builders } from "prettier/doc";
import {
  call,
  hasDeclarationAnnotations,
  hasLeadingComments,
  isBinaryExpression,
  lineEndWithComments,
  lineStartWithComments,
  map,
  onlyDefinedKey,
  printBody,
  printClassPermits,
  printClassType,
  printDanglingComments,
  printList,
  printSingle,
  sortModifiers,
  type JavaNode,
  type JavaNodePrinters,
  type JavaPrintFn
} from "./helpers.js";

const { group, hardline, indent, indentIfBreak, join, line, softline } =
  builders;

export default {
  classDeclaration(path, print) {
    const { children } = path.node;
    const annotationCount = sortModifiers(children.classModifier ?? [], true);
    const modifiers = children.classModifier
      ? map(path, print, "classModifier")
      : [];
    const annotations = modifiers.slice(0, annotationCount);
    const otherModifiers = modifiers.slice(annotationCount);

    const declarationKey = onlyDefinedKey(children, [
      "enumDeclaration",
      "normalClassDeclaration",
      "recordDeclaration"
    ]);
    const declaration = call(path, print, declarationKey);

    return join(hardline, [
      ...annotations,
      join(" ", [...otherModifiers, declaration])
    ]);
  },

  normalClassDeclaration(path, print) {
    const { classExtends, classImplements, classPermits, typeParameters } =
      path.node.children;
    const header = ["class ", call(path, print, "typeIdentifier")];
    if (typeParameters) {
      header.push(call(path, print, "typeParameters"));
    }
    if (classExtends) {
      header.push(indent([line, call(path, print, "classExtends")]));
    }
    if (classImplements) {
      header.push(indent([line, call(path, print, "classImplements")]));
    }
    if (classPermits) {
      header.push(indent([line, call(path, print, "classPermits")]));
    }
    return [group(header), " ", call(path, print, "classBody")];
  },

  classModifier: printSingle,

  typeParameters(path, print) {
    return group([
      "<",
      indent([softline, call(path, print, "typeParameterList")]),
      softline,
      ">"
    ]);
  },

  typeParameterList(path, print) {
    return printList(path, print, "typeParameter");
  },

  classExtends(path, print) {
    return ["extends ", call(path, print, "classType")];
  },

  classImplements(path, print) {
    return group([
      "implements",
      indent([line, call(path, print, "interfaceTypeList")])
    ]);
  },

  classPermits: printClassPermits,

  interfaceTypeList(path, print) {
    return group(printList(path, print, "interfaceType"));
  },

  classBody(path, print) {
    return printBody(path, printClassBodyDeclarations(path, print));
  },

  classBodyDeclaration: printSingle,

  classMemberDeclaration(path, print) {
    const { children } = path.node;
    return children.Semicolon
      ? ""
      : call(path, print, onlyDefinedKey(children));
  },

  fieldDeclaration(path, print) {
    const { children } = path.node;
    const declarationAnnotationCount = sortModifiers(
      children.fieldModifier ?? []
    );
    const modifiers = children.fieldModifier
      ? map(path, print, "fieldModifier")
      : [];
    const declarationAnnotations = modifiers.slice(
      0,
      declarationAnnotationCount
    );
    const otherModifiers = modifiers.slice(declarationAnnotationCount);

    const type = call(path, print, "unannType");
    const declaratorList = call(path, print, "variableDeclaratorList");

    return join(hardline, [
      ...declarationAnnotations,
      join(" ", [...otherModifiers, type, [declaratorList, ";"]])
    ]);
  },

  fieldModifier: printSingle,

  variableDeclaratorList(path, print) {
    const declarators = map(path, print, "variableDeclarator");
    return declarators.length > 1 &&
      path.node.children.variableDeclarator.some(
        ({ children }) => children.Equals
      )
      ? group(indent(join([",", line], declarators)), {
          shouldBreak: (path.getNode(4) as JavaNode | null)?.name !== "forInit"
        })
      : join(", ", declarators);
  },

  variableDeclarator(path, print) {
    const { children } = path.node;
    const variableInitializer = children.variableInitializer?.[0];
    const declaratorId = call(path, print, "variableDeclaratorId");
    if (!variableInitializer) {
      return declaratorId;
    }
    const expression = variableInitializer.children.expression?.[0];
    const declarator = [declaratorId, " ", call(path, print, "Equals")];
    const initializer = call(path, print, "variableInitializer");
    if (
      hasLeadingComments(variableInitializer) ||
      (expression && isBinaryExpression(expression))
    ) {
      declarator.push(group(indent([line, initializer])));
    } else {
      const groupId = Symbol("assignment");
      declarator.push(
        group(indent(line), { id: groupId }),
        indentIfBreak(initializer, { groupId })
      );
    }
    return group(declarator);
  },

  variableDeclaratorId(path, print) {
    const { dims, Underscore } = path.node.children;
    if (Underscore) {
      return "_";
    }
    const identifier = call(path, print, "Identifier");
    return dims ? [identifier, call(path, print, "dims")] : identifier;
  },

  variableInitializer: printSingle,

  unannType: printSingle,

  unannPrimitiveTypeWithOptionalDimsSuffix(path, print) {
    const type = call(path, print, "unannPrimitiveType");
    return path.node.children.dims ? [type, call(path, print, "dims")] : type;
  },

  unannPrimitiveType: printSingle,

  unannReferenceType(path, print) {
    const type = call(path, print, "unannClassOrInterfaceType");
    return path.node.children.dims ? [type, call(path, print, "dims")] : type;
  },

  unannClassOrInterfaceType: printSingle,

  unannClassType: printClassType,

  unannInterfaceType: printSingle,

  unannTypeVariable: printSingle,

  methodDeclaration(path, print) {
    const { children } = path.node;
    const declarationAnnotationCount = sortModifiers(
      children.methodModifier ?? []
    );
    const modifiers = children.methodModifier
      ? map(path, print, "methodModifier")
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

  methodModifier: printSingle,

  methodHeader(path, print) {
    const { typeParameters, annotation, throws } = path.node.children;
    const header: Doc[] = [];
    if (typeParameters) {
      header.push(call(path, print, "typeParameters"));
    }
    if (annotation) {
      header.push(join(line, map(path, print, "annotation")));
    }
    header.push(
      call(path, print, "result"),
      call(path, print, "methodDeclarator")
    );
    return throws
      ? group([
          ...join(" ", header),
          group(indent([line, call(path, print, "throws")]))
        ])
      : group(join(" ", header));
  },

  result: printSingle,

  methodDeclarator(path, print) {
    const { dims, formalParameterList, receiverParameter } = path.node.children;
    const declarator = [call(path, print, "Identifier")];
    const parameters: Doc[] = [];
    if (receiverParameter) {
      parameters.push(call(path, print, "receiverParameter"));
    }
    if (formalParameterList) {
      parameters.push(call(path, print, "formalParameterList"));
    }
    const items = parameters.length
      ? join([",", line], parameters)
      : printDanglingComments(path);
    declarator.push(
      items.length
        ? group(["(", indent([softline, items]), softline, ")"])
        : "()"
    );
    if (dims) {
      declarator.push(call(path, print, "dims"));
    }
    return declarator;
  },

  receiverParameter(path, print) {
    const { children } = path.node;
    const annotations = children.annotation
      ? map(path, print, "annotation")
      : [];
    return join(" ", [
      ...annotations,
      call(path, print, "unannType"),
      children.Identifier ? [call(path, print, "Identifier"), ".this"] : "this"
    ]);
  },

  formalParameterList(path, print) {
    return printList(path, print, "formalParameter");
  },

  formalParameter: printSingle,

  variableParaRegularParameter(path, print) {
    const modifiers = path.node.children.variableModifier
      ? map(path, print, "variableModifier")
      : [];
    return join(" ", [
      ...modifiers,
      call(path, print, "unannType"),
      call(path, print, "variableDeclaratorId")
    ]);
  },

  variableArityParameter(path, print) {
    const { children } = path.node;
    const modifiers = children.variableModifier
      ? map(path, print, "variableModifier")
      : [];
    const annotations = children.annotation
      ? map(path, print, "annotation")
      : [];
    return [
      join(" ", [...modifiers, call(path, print, "unannType"), ...annotations]),
      "... ",
      call(path, print, "Identifier")
    ];
  },

  variableModifier: printSingle,

  throws(path, print) {
    return ["throws ", call(path, print, "exceptionTypeList")];
  },

  exceptionTypeList(path, print) {
    return join(", ", map(path, print, "exceptionType"));
  },

  exceptionType: printSingle,

  methodBody: printSingle,

  instanceInitializer: printSingle,

  staticInitializer(path, print) {
    return ["static ", call(path, print, "block")];
  },

  constructorDeclaration(path, print) {
    const { constructorModifier, throws } = path.node.children;
    const declarationAnnotationCount = sortModifiers(
      constructorModifier ?? [],
      true
    );
    const modifiers = constructorModifier
      ? map(path, print, "constructorModifier")
      : [];
    const declarationAnnotations = modifiers.slice(
      0,
      declarationAnnotationCount
    );
    const otherModifiers = modifiers.slice(declarationAnnotationCount);

    const header = [call(path, print, "constructorDeclarator")];
    if (throws) {
      header.push(group(indent([line, call(path, print, "throws")])));
    }
    return join(hardline, [
      ...declarationAnnotations,
      join(" ", [
        ...otherModifiers,
        header,
        call(path, print, "constructorBody")
      ])
    ]);
  },

  constructorModifier: printSingle,

  constructorDeclarator(path, print) {
    const { children } = path.node;
    const parameters: Doc[] = [];
    if (children.receiverParameter) {
      parameters.push(call(path, print, "receiverParameter"));
    }
    if (children.formalParameterList) {
      parameters.push(call(path, print, "formalParameterList"));
    }
    const typeName = call(path, print, "simpleTypeName");
    const header = parameters.length
      ? [
          typeName,
          group([
            "(",
            indent([softline, ...join([",", line], parameters)]),
            softline,
            ")"
          ])
        ]
      : [typeName, "()"];
    return children.typeParameters
      ? [call(path, print, "typeParameters"), " ", ...header]
      : header;
  },

  simpleTypeName: printSingle,

  constructorBody(path, print) {
    const { children } = path.node;
    const statements: Doc[] = [];
    if (children.explicitConstructorInvocation) {
      statements.push(call(path, print, "explicitConstructorInvocation"));
    }
    if (children.blockStatements) {
      statements.push(call(path, print, "blockStatements"));
    }
    return printBody(path, statements);
  },

  explicitConstructorInvocation: printSingle,

  unqualifiedExplicitConstructorInvocation(path, print) {
    const { children } = path.node;
    const invocation: Doc[] = [];
    if (children.typeArguments) {
      invocation.push(call(path, print, "typeArguments"));
    }
    invocation.push(children.Super ? "super" : "this");
    if (children.argumentList) {
      invocation.push(group(["(", call(path, print, "argumentList"), ")"]));
    } else {
      const danglingComments = printDanglingComments(path);
      if (danglingComments.length) {
        invocation.push(
          "(",
          indent([hardline, ...danglingComments]),
          hardline,
          ")"
        );
      } else {
        invocation.push("()");
      }
    }
    invocation.push(";");
    return invocation;
  },

  qualifiedExplicitConstructorInvocation(path, print) {
    const { children } = path.node;
    const invocation = [call(path, print, "expressionName"), "."];
    if (children.typeArguments) {
      invocation.push(call(path, print, "typeArguments"));
    }
    invocation.push("super");
    if (children.argumentList) {
      invocation.push(group(["(", call(path, print, "argumentList"), ")"]));
    } else {
      const danglingComments = printDanglingComments(path);
      if (danglingComments.length) {
        invocation.push(
          "(",
          indent([hardline, ...danglingComments]),
          hardline,
          ")"
        );
      } else {
        invocation.push("()");
      }
    }
    invocation.push(";");
    return invocation;
  },

  enumDeclaration(path, print) {
    const header = ["enum", call(path, print, "typeIdentifier")];
    if (path.node.children.classImplements) {
      header.push(call(path, print, "classImplements"));
    }
    return join(" ", [...header, call(path, print, "enumBody")]);
  },

  enumBody(path, print, options) {
    const { children } = path.node;
    const body: Doc[] = [];
    const hasNonEmptyDeclaration = (children.enumBodyDeclarations ?? [])
      .flatMap(({ children }) => children.classBodyDeclaration ?? [])
      .some(
        ({ children }) =>
          !children.classMemberDeclaration?.[0].children.Semicolon
      );
    if (children.enumConstantList) {
      body.push(call(path, print, "enumConstantList"));
      if (!hasNonEmptyDeclaration && options.trailingComma !== "none") {
        body.push(",");
      }
    }
    if (hasNonEmptyDeclaration) {
      body.push(";", hardline, call(path, print, "enumBodyDeclarations"));
    }
    body.push(...printDanglingComments(path));
    return body.length
      ? ["{", indent([hardline, ...body]), hardline, "}"]
      : "{}";
  },

  enumConstantList(path, print) {
    return join(
      [",", hardline],
      map(
        path,
        constantPath => {
          const constant = print(constantPath);
          const { node, previous } = constantPath;
          return !previous ||
            lineStartWithComments(node) <= lineEndWithComments(previous) + 1
            ? constant
            : [hardline, constant];
        },
        "enumConstant"
      )
    );
  },

  enumConstant(path, print) {
    const { argumentList, classBody, enumConstantModifier } =
      path.node.children;
    const declarationAnnotationCount = sortModifiers(
      enumConstantModifier ?? []
    );
    const modifiers = enumConstantModifier
      ? map(path, print, "enumConstantModifier")
      : [];
    const declarationAnnotations = modifiers.slice(
      0,
      declarationAnnotationCount
    );
    const otherModifiers = modifiers.slice(declarationAnnotationCount);

    const initializer = [call(path, print, "Identifier")];
    if (argumentList) {
      initializer.push(group(["(", call(path, print, "argumentList"), ")"]));
    }
    if (classBody) {
      initializer.push(" ", call(path, print, "classBody"));
    }
    return join(hardline, [
      ...declarationAnnotations,
      join(" ", [...otherModifiers, initializer])
    ]);
  },

  enumConstantModifier: printSingle,

  enumBodyDeclarations(path, print) {
    return join(hardline, printClassBodyDeclarations(path, print));
  },

  recordDeclaration(path, print) {
    const { children } = path.node;
    const header = ["record ", call(path, print, "typeIdentifier")];
    if (children.typeParameters) {
      header.push(call(path, print, "typeParameters"));
    }
    header.push(call(path, print, "recordHeader"));
    if (children.classImplements) {
      header.push(" ", call(path, print, "classImplements"));
    }
    return [group(header), " ", call(path, print, "recordBody")];
  },

  recordHeader(path, print) {
    if (!path.node.children.recordComponentList) {
      const danglingComments = printDanglingComments(path);
      return danglingComments.length
        ? ["(", indent([hardline, ...danglingComments]), hardline, ")"]
        : "()";
    }
    return group([
      "(",
      indent([softline, call(path, print, "recordComponentList")]),
      softline,
      ")"
    ]);
  },

  recordComponentList(path, print) {
    return join(
      [",", line],
      map(
        path,
        componentPath => {
          const { node, previous } = componentPath;
          const blankLine =
            previous &&
            lineStartWithComments(node) > lineEndWithComments(previous) + 1;
          const component = print(componentPath);
          return blankLine ? [softline, component] : component;
        },
        "recordComponent"
      )
    );
  },

  recordComponent(path, print) {
    const { children } = path.node;
    const modifiers = children.recordComponentModifier
      ? map(path, print, "recordComponentModifier")
      : [];
    const type = [call(path, print, "unannType")];
    if (
      children.Identifier ||
      children.variableArityRecordComponent![0].children.annotation
    ) {
      type.push(" ");
    }
    const suffixKey = onlyDefinedKey(children, [
      "Identifier",
      "variableArityRecordComponent"
    ]);
    type.push(call(path, print, suffixKey));
    return group(join(line, [...modifiers, type]));
  },

  variableArityRecordComponent(path, print) {
    const annotations = path.node.children.annotation
      ? join(" ", map(path, print, "annotation"))
      : [];
    return [...annotations, "... ", call(path, print, "Identifier")];
  },

  recordComponentModifier: printSingle,

  recordBody(path, print) {
    const declarations: Doc[] = [];
    if (path.node.children.recordBodyDeclaration) {
      let previousRequiresPadding = false;
      path.each(
        declarationPath => {
          const declaration = print(declarationPath);
          if (declaration === "") {
            return;
          }
          const { node, previous } = declarationPath;
          const fieldDeclaration =
            node.children.classBodyDeclaration?.[0].children
              .classMemberDeclaration?.[0].children.fieldDeclaration?.[0]
              .children;
          const currentRequiresPadding =
            !fieldDeclaration ||
            hasDeclarationAnnotations(fieldDeclaration.fieldModifier ?? []);
          const blankLine =
            declarations.length > 0 &&
            (previousRequiresPadding ||
              currentRequiresPadding ||
              lineStartWithComments(node) > lineEndWithComments(previous!) + 1);
          declarations.push(blankLine ? [hardline, declaration] : declaration);
          previousRequiresPadding = currentRequiresPadding;
        },
        "children",
        "recordBodyDeclaration"
      );
    }
    return printBody(path, declarations);
  },

  recordBodyDeclaration: printSingle,

  compactConstructorDeclaration(path, print) {
    const { children } = path.node;
    const declarationAnnotationCount = sortModifiers(
      children.constructorModifier ?? [],
      true
    );
    const modifiers = children.constructorModifier
      ? map(path, print, "constructorModifier")
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
        call(path, print, "simpleTypeName"),
        call(path, print, "constructorBody")
      ])
    ]);
  }
} satisfies Partial<JavaNodePrinters>;

function printClassBodyDeclarations(
  path: AstPath<ClassBodyCstNode | EnumBodyDeclarationsCstNode>,
  print: JavaPrintFn
) {
  if (!path.node.children.classBodyDeclaration) {
    return [];
  }
  const declarations: Doc[] = [];
  let previousRequiresPadding =
    path.node.name === "enumBodyDeclarations" ||
    (path.grandparent as JavaNode | null)?.name === "normalClassDeclaration";
  path.each(
    declarationPath => {
      const declaration = print(declarationPath);
      if (declaration === "") {
        return;
      }
      const { node, previous } = declarationPath;
      const fieldDeclaration =
        node.children.classMemberDeclaration?.[0].children.fieldDeclaration?.[0]
          .children;
      const currentRequiresPadding = fieldDeclaration
        ? hasDeclarationAnnotations(fieldDeclaration.fieldModifier ?? [])
        : true;
      const blankLine =
        previousRequiresPadding ||
        (declarations.length > 0 &&
          (currentRequiresPadding ||
            lineStartWithComments(node) > lineEndWithComments(previous!) + 1));
      declarations.push(blankLine ? [hardline, declaration] : declaration);
      previousRequiresPadding = currentRequiresPadding;
    },
    "children",
    "classBodyDeclaration"
  );
  return declarations;
}
