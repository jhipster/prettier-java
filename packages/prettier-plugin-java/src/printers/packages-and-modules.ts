import type {
  ExportsModuleDirectiveCstNode,
  ImportDeclarationCstNode,
  IToken,
  OpensModuleDirectiveCstNode
} from "java-parser";
import type { AstPath, Doc } from "prettier";
import { builders } from "prettier/doc";
import {
  call,
  lineEndWithComments,
  lineStartWithComments,
  map,
  printBlock,
  printDanglingComments,
  printName,
  printSingle,
  type JavaNodePrinters,
  type JavaPrintFn
} from "./helpers.js";

const { group, hardline, indent, join, line } = builders;

export default {
  compilationUnit(path, print) {
    return [...printDanglingComments(path), printSingle(path, print), hardline];
  },

  ordinaryCompilationUnit(path, print) {
    const { children } = path.node;
    const declarations: Doc[] = [];
    if (children.packageDeclaration) {
      declarations.push(call(path, print, "packageDeclaration"));
    }
    if (children.importDeclaration) {
      const staticCount = sortImports(children.importDeclaration);
      const importDeclarations = map(path, print, "importDeclaration").filter(
        doc => doc !== ""
      );
      const staticDeclarations = importDeclarations.slice(0, staticCount);
      const nonStaticDeclarations = importDeclarations.slice(staticCount);
      declarations.push(
        ...[staticDeclarations, nonStaticDeclarations]
          .filter(({ length }) => length)
          .map(declarations => join(hardline, declarations))
      );
    }
    if (children.typeDeclaration) {
      declarations.push(
        ...map(path, print, "typeDeclaration").filter(
          declaration => declaration !== ""
        )
      );
    }
    return join([hardline, hardline], declarations);
  },

  modularCompilationUnit(path, print) {
    const { children } = path.node;
    const declarations: Doc[] = [];
    if (children.importDeclaration) {
      const staticCount = sortImports(children.importDeclaration);
      const importDeclarations = map(path, print, "importDeclaration").filter(
        doc => doc !== ""
      );
      const staticDeclarations = importDeclarations.slice(0, staticCount);
      const nonStaticDeclarations = importDeclarations.slice(staticCount);
      declarations.push(
        ...[staticDeclarations, nonStaticDeclarations]
          .filter(({ length }) => length)
          .map(declarations => join(hardline, declarations))
      );
    }
    declarations.push(call(path, print, "moduleDeclaration"));
    return join([hardline, hardline], declarations);
  },

  packageDeclaration(path, print) {
    return join(hardline, [
      ...map(path, print, "packageModifier"),
      ["package ", printName(path, print), ";"]
    ]);
  },

  packageModifier: printSingle,

  importDeclaration(path, print) {
    const { children } = path.node;
    if (children.emptyStatement) {
      return call(path, print, "emptyStatement");
    }
    const declaration: Doc[] = ["import "];
    if (children.Static) {
      declaration.push("static ");
    }
    declaration.push(call(path, print, "packageOrTypeName"));
    if (children.Star) {
      declaration.push(".*");
    }
    declaration.push(";");
    return declaration;
  },

  typeDeclaration(path, print) {
    return path.node.children.Semicolon ? "" : printSingle(path, print);
  },

  moduleDeclaration(path, print) {
    const { annotation, Open } = path.node.children;
    const prefix: Doc[] = [];
    if (annotation) {
      prefix.push(...map(path, print, "annotation"));
    }
    if (Open) {
      prefix.push("open");
    }
    const declarations = map(
      path,
      declarationPath => {
        const declaration = print(declarationPath);
        const { node, previous } = declarationPath;
        return !previous ||
          lineStartWithComments(node) <= lineEndWithComments(previous) + 1
          ? declaration
          : [hardline, declaration];
      },
      "moduleDirective"
    );
    return join(" ", [
      ...prefix,
      "module",
      printName(path, print),
      printBlock(path, declarations)
    ]);
  },

  moduleDirective: printSingle,

  requiresModuleDirective(path, print) {
    return join(" ", [
      "requires",
      ...map(path, print, "requiresModifier"),
      [call(path, print, "moduleName"), ";"]
    ]);
  },

  exportsModuleDirective(path, print) {
    return printToModuleNamesDirective(path, print, "exports");
  },

  opensModuleDirective(path, print) {
    return printToModuleNamesDirective(path, print, "opens");
  },

  usesModuleDirective(path, print) {
    return ["uses ", call(path, print, "typeName"), ";"];
  },

  providesModuleDirective(path, print) {
    const [firstTypeName, ...restTypeNames] = map(path, print, "typeName");
    return [
      "provides ",
      firstTypeName,
      group(
        indent([
          line,
          group(indent(["with", line, ...join([",", line], restTypeNames)]))
        ])
      ),
      ";"
    ];
  },

  requiresModifier: printSingle
} satisfies Partial<JavaNodePrinters>;

function sortImports(importDeclarations: ImportDeclarationCstNode[]) {
  importDeclarations.sort(({ children: a }, { children: b }) => {
    if (a.Static && !b.Static) {
      return -1;
    } else if (b.Static && !a.Static) {
      return 1;
    }
    if (!b.packageOrTypeName) {
      if (a.packageOrTypeName) {
        return -1;
      }
      return 0;
    } else if (!a.packageOrTypeName) {
      return 1;
    }
    return compareFqn(a.packageOrTypeName[0], b.packageOrTypeName[0]);
  });

  return importDeclarations.reduce(
    (staticCount, importDeclaration) =>
      importDeclaration.children.Static ? staticCount + 1 : staticCount,
    0
  );
}

function compareFqn(
  a: { children: { Identifier: IToken[] } },
  b: { children: { Identifier: IToken[] } }
) {
  const identifiersA = a.children.Identifier;
  const identifiersB = b.children.Identifier;

  const minParts = Math.min(identifiersA.length, identifiersB.length);
  for (let i = 0; i < minParts; i++) {
    const imageA = identifiersA[i].image;
    const imageB = identifiersB[i].image;
    if (imageA < imageB) {
      return -1;
    } else if (imageA > imageB) {
      return 1;
    }
  }

  return identifiersA.length - identifiersB.length;
}

function printToModuleNamesDirective(
  path: AstPath<ExportsModuleDirectiveCstNode | OpensModuleDirectiveCstNode>,
  print: JavaPrintFn,
  prefix: string
) {
  const directive = [prefix, " ", call(path, print, "packageName")];
  if (path.node.children.moduleName) {
    const moduleNames = join([",", line], map(path, print, "moduleName"));
    directive.push(
      group(indent([line, group(indent(["to", line, ...moduleNames]))]))
    );
  }
  directive.push(";");
  return directive;
}
