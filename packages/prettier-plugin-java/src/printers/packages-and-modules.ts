import type { Doc } from "prettier";
import { builders } from "prettier/doc";
import { SyntaxType } from "../tree-sitter-java.js";
import {
  printBlock,
  printDanglingComments,
  printValue,
  type JavaNode,
  type JavaNodePath,
  type JavaNodePrinters,
  type JavaPrintFn
} from "./helpers.js";

const { group, hardline, indent, join, line } = builders;

export default {
  program(path, print) {
    if (!path.node.namedChildren.length) {
      return [...printDanglingComments(path), hardline];
    }

    const parts: Doc[] = [];

    if (path.node.namedChildren[0].type === SyntaxType.PackageDeclaration) {
      parts.push(path.call(print, "namedChildren", 0));
    }

    const staticImports: { doc: Doc; names: string[] }[] = [];
    const imports: { doc: Doc; names: string[] }[] = [];
    const otherDeclarations: Doc[] = [];

    path.each(child => {
      const doc = print(child);

      if (child.node.type === SyntaxType.ImportDeclaration) {
        const names = extractNames(
          child.node.namedChildren[0] as JavaNode<
            SyntaxType.Identifier | SyntaxType.ScopedIdentifier
          >
        );
        if (
          child.node.namedChildren.some(
            ({ type }) => type === SyntaxType.Asterisk
          )
        ) {
          names.push("*");
        }
        (child.node.children[1].type === "static"
          ? staticImports
          : imports
        ).push({ doc, names });
      } else if (child.node.type !== SyntaxType.PackageDeclaration) {
        otherDeclarations.push(doc);
      }
    }, "namedChildren");

    parts.push(
      ...[staticImports, imports]
        .filter(imports => imports.length)
        .map(imports =>
          join(
            hardline,
            imports.sort(compareFqn).map(({ doc }) => doc)
          )
        ),
      ...otherDeclarations
    );

    return [...join([hardline, hardline], parts), hardline];
  },

  package_declaration(path, print) {
    const annotations: Doc[] = [];
    const identifier: Doc[] = [];
    path.each(child => {
      switch (child.node.type) {
        case SyntaxType.Annotation:
        case SyntaxType.MarkerAnnotation:
          annotations.push(print(child));
          break;
        case SyntaxType.Identifier:
        case SyntaxType.ScopedIdentifier:
          identifier.push(print(child));
          break;
      }
    }, "namedChildren");
    return join(hardline, [...annotations, ["package ", ...identifier, ";"]]);
  },

  import_declaration(path, print) {
    const declaration: Doc[] = ["import "];

    if (path.node.children.some(({ type }) => type === "static")) {
      declaration.push("static ");
    }

    const identifierIndex = path.node.namedChildren.findIndex(
      ({ type }) =>
        type === SyntaxType.Identifier || type === SyntaxType.ScopedIdentifier
    );
    declaration.push(path.call(print, "namedChildren", identifierIndex));

    if (
      path.node.namedChildren.some(({ type }) => type === SyntaxType.Asterisk)
    ) {
      declaration.push(".*");
    }
    declaration.push(";");

    return declaration;
  },

  module_declaration(path, print) {
    const parts: Doc[] = [];

    path.each(child => {
      if (
        child.node.type === SyntaxType.Annotation ||
        child.node.type === SyntaxType.MarkerAnnotation
      ) {
        parts.push(print(child));
      }
    }, "namedChildren");

    if (path.node.children.some(({ type }) => type === "open")) {
      parts.push("open");
    }

    parts.push(
      "module",
      path.call(print, "nameNode"),
      path.call(print, "bodyNode")
    );

    return join(" ", parts);
  },

  module_body(path, print) {
    return printBlock(
      path,
      path.map(
        child =>
          child.previous && child.node.start.row > child.previous.end.row + 1
            ? [hardline, print(child)]
            : print(child),
        "namedChildren"
      )
    );
  },

  requires_module_directive(path, print) {
    const parts: Doc[] = ["requires"];

    path.each(child => {
      if (child.node.type === SyntaxType.RequiresModifier) {
        parts.push(print(child));
      }
    }, "namedChildren");

    parts.push(path.call(print, "moduleNode"));

    return [...join(" ", parts), ";"];
  },

  exports_module_directive: printToModuleNamesDirective,
  opens_module_directive: printToModuleNamesDirective,

  uses_module_directive(path, print) {
    return ["uses ", path.call(print, "typeNode"), ";"];
  },

  provides_module_directive(path, print) {
    const [provided, ...providers] = path.map(print, "namedChildren");
    return [
      "provides ",
      provided,
      group(
        indent([
          line,
          group(indent(["with", line, ...join([",", line], providers)]))
        ])
      ),
      ";"
    ];
  },

  requires_modifier: printValue
} satisfies Partial<JavaNodePrinters>;

function extractNames(
  node: JavaNode<SyntaxType.Identifier | SyntaxType.ScopedIdentifier>
): string[] {
  return node.type === SyntaxType.Identifier
    ? [node.value]
    : [...extractNames(node.scopeNode), node.nameNode.value];
}

function compareFqn(
  { names: a }: { names: string[] },
  { names: b }: { names: string[] }
) {
  const minParts = Math.min(a.length, b.length);
  for (let i = 0; i < minParts; i++) {
    const imageA = a[i];
    const imageB = b[i];
    if (imageA < imageB) {
      return -1;
    } else if (imageA > imageB) {
      return 1;
    }
  }

  return a.length - b.length;
}

function printToModuleNamesDirective(
  path: JavaNodePath<
    SyntaxType.ExportsModuleDirective | SyntaxType.OpensModuleDirective
  >,
  print: JavaPrintFn
) {
  const prefix =
    path.node.type === SyntaxType.ExportsModuleDirective ? "exports" : "opens";
  const directive = [prefix, " ", path.call(print, "packageNode")];
  if (path.node.modulesNodes.length) {
    const moduleNames = join([",", line], path.map(print, "modulesNodes"));
    directive.push(
      group(indent([line, group(indent(["to", line, ...moduleNames]))]))
    );
  }
  directive.push(";");
  return directive;
}
