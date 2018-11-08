"use strict";

//const util = require("../_util-from-prettier");

const docBuilders = require("prettier").doc.builders;
const concat = docBuilders.concat;
const join = docBuilders.join;
const hardline = docBuilders.hardline;
const line = docBuilders.line;
const softline = docBuilders.softline;
const group = docBuilders.group;
const indent = docBuilders.indent;

function printCompilationUnit(node, path, print) {
  const docs = [];

  // Add package
  if (node.package) {
    docs.push(path.call(print, "package"));
    docs.push(hardline);
  }

  // Add imports
  if (node.imports && node.imports.length > 0) {
    const imports = concat(path.map(print, "imports"));

    // Sort imports
    imports.parts.sort((a, b) => {
      if (!a.importPath) {
        a.importPath = getImportPath(a.parts[2]);
      }
      if (!b.importPath) {
        b.importPath = getImportPath(b.parts[2]);
      }
      if (a.importPath < b.importPath) {
        return -1;
      }
      if (a.importPath > b.importPath) {
        return 1;
      }
      return 0;
    });

    // Add hardline between different import groups
    let lastImportPathGroup;
    imports.parts.forEach(part => {
      if (!part.importPath) {
        part.importPath = getImportPath(part.parts[2]);
      }
      const currentImportPathGroup = part.importPath.split(".")[0];
      if (!lastImportPathGroup) {
        lastImportPathGroup = currentImportPathGroup;
      } else if (currentImportPathGroup !== lastImportPathGroup) {
        docs.push(hardline);
        lastImportPathGroup = currentImportPathGroup;
      }
      docs.push(part);
    });
    docs.push(hardline);
  }

  // Add type declarations
  docs.push(group(join(hardline, path.map(print, "types"))), hardline);

  return concat(docs);

  function getImportPath(parts) {
    if (typeof parts === "string") {
      // If already string, just return
      return parts;
    } else if (parts.type && parts.type === "concat") {
      // Search deeper in concat
      return getImportPath(parts.parts).join("");
    }

    // Search in array
    const paths = [];
    if (parts.constructor === Array) {
      parts.forEach(part => {
        paths.push(getImportPath(part));
      });
    }
    return paths;
  }
}

function printTypeDeclaration(node, path, print) {
  const docs = [];

  // Add marker annotations like @Bean
  docs.push(printAnnotations(path, print));

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(path, print));

  // Add declaration
  docs.push(path.call(print, "declaration"));

  return concat(docs);
}

function printLocalTypeDeclaration(node, path, print) {
  const docs = [];

  docs.push(hardline);
  docs.push(hardline);

  // Add marker annotations like @Bean
  docs.push(printAnnotations(path, print));

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(path, print));

  // Add declaration
  docs.push(path.call(print, "declaration"));

  return concat(docs);
}

function printClassDeclaration(node, path, print) {
  const docs = [];

  docs.push("class");
  docs.push(" ");

  // Add name of class/interface
  docs.push(path.call(print, "name"));

  // Add type parameters
  if (node.typeParameters) {
    docs.push(
      enclosedElementList(
        path,
        print,
        "<",
        path.call(print, "typeParameters"),
        ">"
      )
    );
  }

  // Add extends class
  if (node.extends) {
    const ext = [];
    ext.push(line);
    ext.push("extends");
    ext.push(" ");
    ext.push(path.call(print, "extends"));
    docs.push(indent(concat(ext)));
  }

  // Add implemented interfaces
  if (node.implements) {
    const impl = [];
    impl.push(line);
    impl.push("implements");
    impl.push(indent(concat([line, path.call(print, "implements")])));
    docs.push(group(indent(concat(impl))));
  }

  docs.push(" ");

  // // Add soft line if body is not empty, and not only contains empty lines
  if (node.body) {
    // Add class body
    docs.push(path.call(print, "body"));
  }

  // Add hardline
  docs.push(hardline);

  return group(concat(docs));
}

function printInterfaceDeclaration(node, path, print) {
  const docs = [];
  docs.push("interface");
  docs.push(" ");

  // Add name of class/interface
  docs.push(path.call(print, "name"));

  // Add type parameters
  if (node.typeParameters) {
    docs.push(
      enclosedElementList(
        path,
        print,
        "<",
        path.call(print, "typeParameters"),
        ">"
      )
    );
  }

  // Add extends class
  if (node.extends) {
    const ext = [];
    ext.push(line);
    ext.push("extends");
    ext.push(" ");
    ext.push(path.call(print, "extends"));
    docs.push(indent(concat(ext)));
  }

  docs.push(" ");

  // // Add soft line if body is not empty, and not only contains empty lines
  if (node.body) {
    // Add class body
    docs.push(path.call(print, "body"));
  }

  // Add hardline
  docs.push(hardline);

  return group(concat(docs));
}

function printConstructorDeclaration(node, path, print) {
  const docs = [];

  // Add name
  docs.push(path.call(print, "name"));

  // Add parameters
  docs.push(path.call(print, "parameters"));

  // Add throws
  // TODO throws

  // Add body
  docs.push(" ");
  docs.push(path.call(print, "body"));

  return concat(docs);
}

function printAnnotationTypeElementDeclaration(node, path, print) {
  const docs = [];

  docs.push(hardline);

  // Add marker annotations like @Bean
  docs.push(printAnnotations(path, print));

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(path, print));

  // Add declaration
  docs.push(path.call(print, "declaration"));

  return concat(docs);
}

function printAnnotationTypeElementRest(node, path, print) {
  const docs = [];

  // Add typeType
  docs.push(path.call(print, "typeType"));
  docs.push(" ");

  // Add name
  docs.push(path.call(print, "name"));

  // Add semicolon
  docs.push(";");

  return concat(docs);
}

function printAnnotationMethodRest(node, path, print) {
  const docs = [];

  // Add name
  docs.push(path.call(print, "name"));
  docs.push("(");
  docs.push(")");
  docs.push(" ");

  // Add defaultValue
  docs.push(path.call(print, "defaultValue"));

  return concat(docs);
}

function printClassBody(node, path, print) {
  const docs = [];

  // Add open curly brace
  docs.push("{");

  // Add declarations
  if (node.declarations.length > 0) {
    docs.push(
      indent(
        concat([hardline, join(hardline, path.map(print, "declarations"))])
      )
    );
    docs.push(hardline);
  }

  // Add close curly brace
  docs.push("}");

  return concat(docs);
}

function printClassBodyBlock(node, path, print) {
  const docs = [];

  const index = Number(path.getName());
  // If method is first element in class, add extra line
  if (
    index === 0 ||
    (index > 0 &&
      path.getParentNode().declarations[index - 1].declaration &&
      path.getParentNode().declarations[index - 1].declaration.type ===
        "FIELD_DECLARATION" &&
      !path.getParentNode().declarations[index - 1].followedEmptyLine)
  ) {
    docs.push(hardline);
  }

  // Add static
  if (node.static) {
    docs.push("static");
    docs.push(" ");
  }

  // Add block
  docs.push(path.call(print, "block"));

  docs.push(hardline);

  return concat(docs);
}

function printClassBodyMemberDeclaration(node, path, print) {
  const docs = [];

  const index = Number(path.getName());
  // If method is first element in class, add extra line
  if (
    (index === 0 &&
      (node.declaration.type === "METHOD_DECLARATION" ||
        node.declaration.type === "GENERIC_METHOD_DECLARATION" ||
        node.declaration.type === "CONSTRUCTOR_DECLARATION")) ||
    (index > 0 &&
      (node.declaration.type === "METHOD_DECLARATION" ||
        node.declaration.type === "GENERIC_METHOD_DECLARATION" ||
        node.declaration.type === "CONSTRUCTOR_DECLARATION") &&
      path.getParentNode().declarations[index - 1].declaration &&
      path.getParentNode().declarations[index - 1].declaration.type ===
        "FIELD_DECLARATION" &&
      !path.getParentNode().declarations[index - 1].followedEmptyLine)
  ) {
    docs.push(hardline);
  }

  // Add marker annotations like @Bean
  docs.push(printAnnotations(path, print));

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(path, print));

  // Add declaration
  docs.push(path.call(print, "declaration"));

  if (
    node.declaration.type === "METHOD_DECLARATION" ||
    node.declaration.type === "GENERIC_METHOD_DECLARATION" ||
    node.declaration.type === "CONSTRUCTOR_DECLARATION" ||
    (node.followedEmptyLine &&
      index + 1 < path.getParentNode().declarations.length)
  ) {
    docs.push(hardline);
  }

  return concat(docs);
}

function printInterfaceBody(node, path, print) {
  const docs = [];

  // Add open curly brace
  docs.push("{");

  // Add declarations
  if (node.declarations.length > 0) {
    docs.push(
      indent(
        concat([hardline, join(hardline, path.map(print, "declarations"))])
      )
    );
    docs.push(hardline);
  }

  // Add close curly brace
  docs.push("}");

  return concat(docs);
}

function printInterfaceBodyDeclaration(node, path, print) {
  const docs = [];

  const index = Number(path.getName());
  // If method is first element in interface, add extra line
  if (
    (index === 0 && node.declaration.type === "INTERFACE_METHOD_DECLARATION") ||
    (index > 0 &&
      node.declaration.type === "INTERFACE_METHOD_DECLARATION" &&
      path.getParentNode().declarations[index - 1].declaration &&
      path.getParentNode().declarations[index - 1].declaration.type ===
        "CONSTANT_DECLARATION" &&
      !path.getParentNode().declarations[index - 1].followedEmptyLine)
  ) {
    docs.push(hardline);
  }

  // Add marker annotations like @Bean
  docs.push(printAnnotations(path, print));

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(path, print));

  // Add declaration
  docs.push(path.call(print, "declaration"));

  if (
    node.declaration.type === "INTERFACE_METHOD_DECLARATION" ||
    (node.followedEmptyLine &&
      index + 1 < path.getParentNode().declarations.length)
  ) {
    docs.push(hardline);
  }

  return concat(docs);
}

function printInterfaceMethodDeclaration(node, path, print) {
  const docs = [];

  // Add marker annotations like @Bean
  docs.push(printAnnotations(path, print));

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(path, print));

  const start = [];
  // Add type type
  if (node.typeType) {
    start.push(path.call(print, "typeType"));
    start.push(" ");
  }

  // Add name
  start.push(path.call(print, "name"));

  // // Add parameters
  if (node.parameters) {
    start.push(path.call(print, "parameters"));
  }

  // Add dimensions
  docs.push(concat(path.map(print, "dimensions")));

  // Add thrown exceptions
  if (node.throws) {
    const throws = [];
    throws.push(line);
    throws.push("throws");
    throws.push(indent(concat([line, path.call(print, "throws")])));
    start.push(indent(concat(throws)));
  }
  docs.push(group(concat(start)));

  // Add method body
  if (node.body) {
    // Add open curly
    docs.push(" ");

    docs.push(path.call(print, "body"));
  } else {
    // If abstract
    docs.push(";");
  }

  return concat(docs);
}

function printEnumDeclaration(node, path, print) {
  const docs = [];

  // Add interface or class keyword
  docs.push("enum");
  docs.push(" ");

  // Add name of class/interface
  docs.push(path.call(print, "name"));
  docs.push(" ");

  // Add implemented interfaces
  // TODO implements
  if (node.implements) {
    docs.push("implements");
    docs.push(" ");
    docs.push(path.call(print, "implements"));
    docs.push(" ");
  }

  // Add open curly bracelet for class/interface beginning
  docs.push("{");
  docs.push(hardline);

  const docs2 = [];

  // Add enum constants
  docs2.push(hardline);
  docs2.push(path.call(print, "enumConstants"));
  docs2.push(";");

  docs2.push(hardline);

  docs.push(indent(concat(docs2)));

  if (node.body && node.body.declarations.length > 0) {
    // Add class body
    docs.push(path.call(print, "body"));
  } else {
    docs.push(hardline);
  }

  // Add open curly bracelet for class/interface beginning
  docs.push("}");

  // Add line
  docs.push(hardline);

  return group(concat(docs));
}

function printEnumConstant(node, path, print) {
  const docs = [];

  // Add marker annotations like @Bean
  docs.push(printAnnotations(path, print));

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(path, print));

  // Add name of class/interface
  docs.push(path.call(print, "name"));

  // Add primitive type like void, int, etc.
  if (node.arguments && node.arguments) {
    docs.push("(");
    docs.push(path.call(print, "arguments"));
    docs.push(")");
  }

  return concat(docs);
}

function printEnumDeclarations(node, path, print) {
  const docs = [];

  // Add declarations
  if (node.declarations.length > 0) {
    docs.push(
      indent(
        concat([hardline, join(hardline, path.map(print, "declarations"))])
      )
    );
    docs.push(hardline);
  }

  return concat(docs);
}

function printConstantDeclaration(node, path, print) {
  const docs = [];

  // Add type type
  if (node.typeType) {
    docs.push(path.call(print, "typeType"));
    docs.push(" ");
  }

  // Add declarators
  if (node.declarators) {
    docs.push(join(concat([",", line]), path.map(print, "declarators")));
  }

  // Add semicolon
  docs.push(";");

  return concat(docs);
}

function printMethodDeclaration(node, path, print) {
  const docs = [];

  const start = [];
  // Add type type
  if (node.typeType) {
    start.push(path.call(print, "typeType"));
    start.push(" ");
  }

  // Add name
  start.push(path.call(print, "name"));

  // // Add parameters
  if (node.parameters) {
    start.push(path.call(print, "parameters"));
  }

  // Add thrown exceptions
  if (node.throws) {
    const throws = [];
    throws.push(line);
    throws.push("throws");
    throws.push(indent(concat([line, path.call(print, "throws")])));
    start.push(indent(concat(throws)));
  }
  docs.push(group(concat(start)));

  // Add method body
  if (node.body) {
    // Add open curly
    docs.push(" ");

    docs.push(path.call(print, "body"));
  } else {
    // If abstract
    docs.push(";");
  }

  return concat(docs);
}

function printGenericMethodDeclaration(node, path, print) {
  const docs = [];

  // Add typeParameters
  docs.push(
    enclosedElementList(
      path,
      print,
      "<",
      path.call(print, "typeParameters"),
      ">"
    )
  );
  docs.push(" ");

  // Add methodDeclaration
  docs.push(path.call(print, "methodDeclaration"));

  return concat(docs);
}

function printFormalParameters(node, path, print) {
  return enclosedElementList(
    path,
    print,
    "(",
    join(concat([",", line]), path.map(print, "parameters")),
    ")"
  );
}

function printFormalParameter(node, path, print) {
  const docs = [];

  // Add marker annotations like @Bean
  docs.push(printAnnotations(path, print));

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(path, print));

  // Add type type
  if (node.typeType) {
    docs.push(path.call(print, "typeType"));
    if (node.dotDotDot) {
      docs.push("...");
    }
    docs.push(" ");
  }

  docs.push(path.call(print, "id"));

  return concat(docs);
}

function printBlock(node, path, print) {
  const docs = [];

  // Add open curly
  docs.push("{");

  // Add statements
  if (node.statements.length > 0) {
    docs.push(indent(concat(path.map(print, "statements"))));
    docs.push(line);
  }

  // Add close curly
  docs.push("}");

  return concat(docs);
}

function printAssertStatement(node, path, print) {
  const docs = [];

  // If parent is block AND parent parent is LambdaExpression
  // AND there is only one statement, don't print a hardline
  if (
    path.getParentNode(1).node !== "LAMBDA_EXPRESSION" ||
    path.getParentNode().type !== "BLOCK" ||
    path.getParentNode().statements.length > 1
  ) {
    // Add line
    docs.push(hardline);
  }

  docs.push("assert");
  docs.push(" ");

  // Add booleanExpression
  docs.push(path.call(print, "booleanExpression"));

  if (node.valueExpression) {
    docs.push(" ");
    docs.push(":");
    docs.push(" ");
    // Add valueExpression
    docs.push(path.call(print, "valueExpression"));
  }

  // If parent is block AND parent parent is LambdaExpression
  // AND there is only one statement, don't print a semi colon
  if (
    path.getParentNode(1).node !== "LAMBDA_EXPRESSION" ||
    path.getParentNode().type !== "BLOCK" ||
    path.getParentNode().statements.length > 1
  ) {
    docs.push(";");
  }

  const index = Number(path.getName());
  if (
    node.followedEmptyLine &&
    path.getParentNode().type === "BLOCK" &&
    index + 1 < path.getParentNode().statements.length
  ) {
    docs.push(hardline);
  }

  return concat(docs);
}

function printExpressionStatement(node, path, print) {
  const docs = [];

  // If parent is block AND parent parent is LambdaExpression
  // AND there is only one statement, don't print a hardline
  if (
    path.getParentNode(1).node !== "LAMBDA_EXPRESSION" ||
    path.getParentNode().type !== "BLOCK" ||
    path.getParentNode().statements.length > 1
  ) {
    // Add line
    docs.push(hardline);
  }

  // Add expression
  docs.push(path.call(print, "expression"));

  // If parent is block AND parent parent is LambdaExpression
  // AND there is only one statement, don't print a semi colon
  if (
    path.getParentNode(1).node !== "LAMBDA_EXPRESSION" ||
    path.getParentNode().type !== "BLOCK" ||
    path.getParentNode().statements.length > 1
  ) {
    docs.push(";");
  }

  const index = Number(path.getName());
  if (
    node.followedEmptyLine &&
    path.getParentNode().type === "BLOCK" &&
    index + 1 < path.getParentNode().statements.length
  ) {
    docs.push(hardline);
  }

  return concat(docs);
}

function printCommaList(node, path, print) {
  return join(concat([",", line]), path.map(print, "list"));
}

function printAndList(node, path, print) {
  const docs = [];

  docs.push(join(concat([" ", "&", line]), path.map(print, "list")));

  return concat(docs);
}

function printVerticalLineList(node, path, print) {
  const docs = [];

  docs.push(join(concat([" ", "|", line]), path.map(print, "list")));

  return concat(docs);
}

function printDotList(node, path, print) {
  const docs = [];

  docs.push(join(".", path.map(print, "elements")));

  return concat(docs);
}

function printIdentifierNameElement(node, path, print) {
  const docs = [];

  // Add id
  docs.push(path.call(print, "id"));

  // Add typeArguments
  if (node.typeArguments) {
    docs.push(path.call(print, "typeArguments"));
  }

  return concat(docs);
}

function printIdentifierArguments(node, path, print) {
  return group(
    concat([path.call(print, "name"), argumentList(node, path, print)])
  );
}

function printForStatement(node, path, print) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add while and open braces
  docs.push("for");
  docs.push(" ");
  docs.push("(");

  // Add for control
  docs.push(path.call(print, "forControl"));

  // Add close braces and open curly braces
  docs.push(")");
  docs.push(" ");

  // Add body
  docs.push(path.call(print, "body"));

  return concat(docs);
}

function printBasicForControl(node, path, print) {
  const docs = [];

  // Add initializer
  if (node.forInit) {
    docs.push(path.call(print, "forInit"));
  }
  docs.push(";");

  // Add expression
  if (node.expression) {
    docs.push(" ");
    docs.push(path.call(print, "expression"));
  }
  docs.push(";");

  // Add expressionList
  if (node.expressionList) {
    docs.push(" ");
    docs.push(path.call(print, "expressionList"));
  }

  return concat(docs);
}

function printEnhancedForControl(node, path, print) {
  const docs = [];

  // Add declaration
  docs.push(path.call(print, "declaration"));

  // Add colon
  docs.push(" ");
  docs.push(":");
  docs.push(" ");

  // Add expression
  docs.push(path.call(print, "expression"));

  return concat(docs);
}

function printIfStatement(node, path, print) {
  const docs = [];

  // Add line, if parent is not an if statement
  if (path.getParentNode().type !== "IF_STATEMENT") {
    docs.push(hardline);
  }

  // Add if and open braces
  docs.push("if");
  docs.push(" ");
  docs.push("(");

  // Add condition
  docs.push(path.call(print, "condition"));

  // Add close braces and open curly braces
  docs.push(")");
  docs.push(" ");

  // Add body
  docs.push(path.call(print, "body"));

  // Add else
  if (node.else) {
    docs.push(" ");
    docs.push("else");
    docs.push(" ");
    docs.push(path.call(print, "else"));
  }

  return concat(docs);
}

function printSynchronizedStatement(node, path, print) {
  const docs = [];

  docs.push(hardline);

  // Add synchronized and open braces
  docs.push("synchronized");
  docs.push(" ");
  docs.push("(");

  // Add condition
  docs.push(path.call(print, "condition"));

  // Add close braces and open curly braces
  docs.push(")");
  docs.push(" ");

  // Add body
  docs.push(path.call(print, "body"));

  return concat(docs);
}

function printContinueStatement(node, path, print) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add return
  docs.push("continue");

  if (node.identifier) {
    docs.push(" ");
    // Add identifier
    docs.push(path.call(print, "identifier"));
  }

  // Add semicolon
  docs.push(";");

  return concat(docs);
}

function printSemiColonStatement() {
  const docs = [];

  // do nothing

  return concat(docs);
}

function printReturnStatement(node, path, print) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add return
  docs.push("return");

  if (node.expression) {
    docs.push(" ");
    // Add expression
    docs.push(path.call(print, "expression"));
  }

  // Add semicolon
  docs.push(";");

  return concat(docs);
}

function printBreakStatement(node, path, print) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add return
  docs.push("break");

  if (node.identifier) {
    docs.push(" ");
    // Add identifier
    docs.push(path.call(print, "identifier"));
  }

  // Add semicolon
  docs.push(";");

  return concat(docs);
}

function printThrowStatement(node, path, print) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add return
  docs.push("throw");
  docs.push(" ");

  // Add expression
  docs.push(path.call(print, "expression"));

  // Add semicolon
  docs.push(";");

  return concat(docs);
}

function printTryStatement(node, path, print) {
  const docs = [];
  // Add line
  docs.push(hardline);

  // Add return
  docs.push("try");
  docs.push(" ");

  // Add resource specification
  if (node.resourceSpecification) {
    docs.push(path.call(print, "resourceSpecification"));
  }

  // Add body
  docs.push(path.call(print, "body"));
  docs.push(" ");

  // Add catch clauses
  docs.push(concat(path.map(print, "catchClauses")));

  // Add finally
  if (node.finally) {
    docs.push(path.call(print, "finally"));
  }

  return concat(docs);
}

function printResourceSpecification(node, path, print) {
  const docs = [];

  // Add open brace
  docs.push("(");

  // Add resources
  docs.push(path.call(print, "resources"));

  // Add close brace
  docs.push(")");

  return concat(docs);
}

function printResources(node, path, print) {
  const docs = [];

  // Add resources
  docs.push(concat(path.map(print, "resources")));

  return concat(docs);
}

function printResource(node, path, print) {
  const docs = [];

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(path, print));

  // Add typeType
  docs.push(path.call(print, "typeType"));
  docs.push(" ");

  // Add id
  docs.push(path.call(print, "id"));

  // Add expression
  if (node.expression) {
    // Add equals
    docs.push(" ");
    docs.push("=");
    docs.push(" ");

    docs.push(path.call(print, "expression"));
  }

  return concat(docs);
}

function printCatchClause(node, path, print) {
  const docs = [];

  // Add catch
  docs.push("catch");

  // Add open brace
  docs.push("(");

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(path, print));

  // Add catchType
  docs.push(
    group(
      concat([
        indent(
          concat([
            softline,
            path.call(print, "catchType"),
            " ",
            path.call(print, "id")
          ])
        ),
        softline
      ])
    )
  );

  // Add close brace
  docs.push(")");
  docs.push(" ");

  // Add block
  docs.push(path.call(print, "block"));
  docs.push(" ");

  return concat(docs);
}

function printFinallyBlock(node, path, print) {
  const docs = [];

  // Add catch
  docs.push("finally");
  docs.push(" ");

  // Add block
  docs.push(path.call(print, "block"));
  docs.push(" ");

  return concat(docs);
}

function printWhileStatement(node, path, print) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add while and open braces
  docs.push("while");
  docs.push(" ");
  docs.push("(");

  // Add condition
  docs.push(path.call(print, "condition"));

  // Add close braces and open curly braces
  docs.push(")");
  docs.push(" ");

  // Add then of if
  docs.push(path.call(print, "body"));

  return concat(docs);
}

function printDoWhileStatement(node, path, print) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add do
  docs.push("do");
  docs.push(" ");

  // Add body
  docs.push(path.call(print, "body"));

  // Add while and open braces
  docs.push(" ");
  docs.push("while");
  docs.push(" ");
  docs.push("(");

  // Add condition
  docs.push(path.call(print, "condition"));

  // Add close braces and open curly braces
  docs.push(")");
  docs.push(";");

  return concat(docs);
}

function printSwitchStatement(node, path, print) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add while and open braces
  docs.push("switch");
  docs.push(" ");
  docs.push("(");

  // Add condition
  docs.push(path.call(print, "condition"));

  // Add close braces and open curly braces
  docs.push(")");
  docs.push(" ");

  // Add open curly
  docs.push("{");

  // Add statementGroups
  docs.push(indent(concat(path.map(print, "statementGroups"))));

  // Add close curly
  docs.push(hardline);
  docs.push("}");

  return concat(docs);
}

function printSwitchBlockStatementGroup(node, path, print) {
  const docs = [];

  // Add labels
  docs.push(concat(path.map(print, "labels")));

  // Add statements
  docs.push(indent(concat(path.map(print, "statements"))));

  return concat(docs);
}

function printSwitchLabelCase(node, path, print) {
  const docs = [];

  docs.push(hardline);

  // Add case
  docs.push("case");
  docs.push(" ");

  // Add expression
  docs.push(path.call(print, "expression"));

  // Add colon
  docs.push(":");

  return concat(docs);
}

function printSwitchLabelDefault() {
  const docs = [];

  docs.push(hardline);

  // Add case
  docs.push("default");

  // Add colon
  docs.push(":");

  return concat(docs);
}

function printFieldDeclaration(node, path, print) {
  const docs = [];

  if (path.getParentNode().type === "BLOCK") {
    docs.push(hardline);
  }

  // Add typeType
  docs.push(path.call(print, "typeType"));
  docs.push(" ");

  // Add variableDeclarators
  if (node.variableDeclarators) {
    docs.push(path.call(print, "variableDeclarators"));
  }

  // Add semicolon
  docs.push(";");

  return concat(docs);
}

function printImportDeclaration(node, path, print) {
  const docs = [];

  // Add import
  docs.push("import");
  docs.push(" ");

  // Add static
  if (node.static) {
    docs.push("static");
    docs.push(" ");
  }

  // Add name
  docs.push(path.call(print, "name"));

  // Add on demand
  if (node.onDemand) {
    docs.push(".*");
  }

  // Add semicolon
  docs.push(";");

  // Add line
  docs.push(hardline);

  return concat(docs);
}

function printPackageDeclaration(node, path, print) {
  const docs = [];

  // Add package
  docs.push("package");
  docs.push(" ");

  // Add name
  docs.push(path.call(print, "name"));

  // Add semicolon
  docs.push(";");

  // Add line
  docs.push(hardline);

  return concat(docs);
}

function printLocalVariableDeclaration(node, path, print) {
  const docs = [];

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(path, print));

  // Add type
  docs.push(path.call(print, "typeType"));
  docs.push(" ");

  // Add variable name
  docs.push(path.call(print, "declarators"));

  return concat(docs);
}

function printConstantDeclarator(node, path, print) {
  const docs = [];

  // Add name
  docs.push(path.call(print, "name"));

  // Add dimensions
  docs.push(concat(path.map(print, "dimensions")));

  // Add init
  if (node.init) {
    docs.push(" ");
    docs.push("=");
    docs.push(" ");

    docs.push(path.call(print, "init"));
  }

  return concat(docs);
}

function printVariableDeclarator(node, path, print) {
  const docs = [];

  // Add id
  docs.push(path.call(print, "id"));

  // Add init
  if (node.init) {
    docs.push(" ");
    docs.push("=");
    docs.push(" ");

    docs.push(path.call(print, "init"));
  }

  return concat(docs);
}

function printTypeType(node, path, print) {
  const docs = [];

  // Add marker annotations like @Bean
  docs.push(printAnnotations(path, print));

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(path, print));

  // Add value
  docs.push(path.call(print, "value"));

  // Add dimensions
  docs.push(concat(path.map(print, "dimensions")));

  return concat(docs);
}

function printTypeArguments(node, path, print) {
  return node.value
    ? enclosedElementList(path, print, "<", path.call(print, "value"), ">")
    : concat(["<", ">"]);
}

function printClassOrInterfaceTypeElement(node, path, print) {
  const docs = [];

  //  Add name
  docs.push(path.call(print, "name"));

  //  Add typeArguments
  if (node.typeArguments) {
    docs.push(path.call(print, "typeArguments"));
  }

  //  Add dimensions
  if (node.dimensions) {
    docs.push(concat(path.map(print, "dimensions")));
  }

  return concat(docs);
}

function printPrimitiveType(node) {
  const docs = [];

  // Add primitive type like void, int, etc.
  docs.push(node.value);

  return concat(docs);
}

function printMethodInvocation(node, path, print) {
  const docs = [];

  // Add method name
  docs.push(path.call(print, "name"));

  // Add method parameters
  docs.push(
    enclosedElementList(
      path,
      print,
      "(",
      node.parameters ? path.call(print, "parameters") : concat([]),
      ")"
    )
  );

  // Add dimensions
  docs.push(concat(path.map(print, "dimensions")));

  return concat(docs);
}

function printGenericInvocation(node, path, print) {
  const docs = [];

  // Add typeArguments
  docs.push(path.call(print, "typeArguments"));

  // Add invocation
  docs.push(path.call(print, "invocation"));

  return concat(docs);
}

function printQualifiedName(node, path, print) {
  const docs = [];

  // Add name
  docs.push(join(".", path.map(print, "name")));

  return concat(docs);
}

function printQualifiedExpression(node, path, print) {
  const docs = [];

  // expression
  const expression = path.call(print, "expression");

  // rest
  const rest = path.call(print, "rest");

  // Add name
  docs.push(join(".", [expression, rest]));

  return concat(docs);
}

function printOperatorExpression(node, path, print) {
  const docs = [];

  // left
  docs.push(path.call(print, "left"));

  // operator
  docs.push(" ");
  docs.push(path.call(print, "operator"));
  docs.push(" ");

  // right
  docs.push(path.call(print, "right"));

  return concat(docs);
}

function printParExpression(node, path, print) {
  const docs = [];

  if (path.getParentNode().type !== "ASSERT_STATEMENT") {
    // Add open brace
    docs.push("(");
  }

  // Add expression
  docs.push(path.call(print, "expression"));

  if (path.getParentNode().type !== "ASSERT_STATEMENT") {
    // Add close brace
    docs.push(")");
  }

  return concat(docs);
}

function printIdentifier(node) {
  const docs = [];

  // Add value
  docs.push(node.value);

  return concat(docs);
}

function printIdentifiers(node, path, print) {
  const docs = [];

  if (!node.identifiers) {
    docs.push("(");
    docs.push(")");
  } else if (node.identifiers.list.length === 1) {
    docs.push(path.call(print, "identifiers"));
  } else {
    docs.push(
      enclosedElementList(
        path,
        print,
        "(",
        path.call(print, "identifiers"),
        ")"
      )
    );
  }

  return concat(docs);
}

function printDefaultValue(node, path, print) {
  const docs = [];

  // Add default
  docs.push("default");
  docs.push(" ");

  // Add value
  docs.push(path.call(print, "value"));

  return concat(docs);
}

function printBooleanLiteral(node) {
  const docs = [];

  // Add boolean value
  docs.push(node.value);

  return concat(docs);
}

function printOperator(node) {
  const docs = [];

  // Add operator
  docs.push(node.operator);

  return concat(docs);
}

function printStringLiteral(node) {
  const docs = [];

  // Add value
  docs.push(node.value);

  return concat(docs);
}

function printNumberLiteral(node) {
  const docs = [];

  // Add value
  docs.push(node.value);

  return concat(docs);
}

function printSimpleCreator(node, path, print) {
  return concat([
    "new",
    " ",
    path.call(print, "name"),
    path.call(print, "rest")
  ]);
}

function printClassCreatorRest(node, path, print) {
  const docs = [];

  // Add arguments
  docs.push(argumentList(node, path, print));

  // Add body
  if (node.body) {
    docs.push(" ");
    docs.push(path.call(print, "body"));
  }

  return concat(docs);
}

function printArrayCreatorRest(node, path, print) {
  const docs = [];

  // Add dimensions
  docs.push(concat(path.map(print, "dimensions")));

  // Add arrayInitializer
  if (node.arrayInitializer) {
    docs.push(" ");
    docs.push(path.call(print, "arrayInitializer"));
  }

  return concat(docs);
}

function printCreatorOptionalNonWildcardInnerCreator(node, path, print) {
  const docs = [];

  // Add new
  docs.push("new");
  docs.push(" ");

  // Add typeArguments
  if (node.typeArguments) {
    docs.push(path.call(print, "typeArguments"));
  }

  // Add innerCreator
  docs.push(path.call(print, "innerCreator"));

  return concat(docs);
}

function printInnerCreator(node, path, print) {
  const docs = [];

  // Add id
  docs.push(path.call(print, "id"));

  // Add typeArguments
  if (node.typeArguments) {
    docs.push(path.call(print, "typeArguments"));
  }

  // Add rest
  docs.push(path.call(print, "rest"));

  return concat(docs);
}

function printNonWildcardCreator(node, path, print) {
  const docs = [];

  // Add new
  docs.push("new");
  docs.push(" ");

  // Add typeArguments
  if (node.typeArguments) {
    docs.push(path.call(print, "typeArguments"));
  }

  // Add name
  docs.push(path.call(print, "name"));

  // Add rest
  docs.push(path.call(print, "rest"));

  return concat(docs);
}

function printArrayInitializer(node, path, print) {
  const docs = [];

  // Add statements
  if (node.variableInitializers.length === 0) {
    docs.push("{");
    docs.push("}");
  } else if (node.variableInitializers.length > 0) {
    docs.push(
      group(
        concat([
          "{",
          indent(
            concat([
              line,
              join(concat([",", line]), path.map(print, "variableInitializers"))
            ])
          ),
          line,
          "}"
        ])
      )
    );
  }

  return concat(docs);
}

function printElementValuePair(node, path, print) {
  const docs = [];

  // Add key
  docs.push(path.call(print, "key"));
  docs.push(" ");

  // Add equals
  docs.push("=");
  docs.push(" ");

  // Add value
  docs.push(path.call(print, "value"));

  return concat(docs);
}

function printElementValueArrayInitializer(node, path, print) {
  const docs = [];

  // Add open curly
  docs.push("{");

  docs.push(
    group(
      indent(
        concat([line, join(concat([",", line]), path.map(print, "values"))])
      )
    )
  );

  // Add close curly
  docs.push(line);
  docs.push("}");

  return concat(docs);
}

function printCastExpression(node, path, print) {
  const docs = [];

  // Add open braces
  docs.push("(");

  // Add castType
  docs.push(path.call(print, "castType"));

  // Add close braces
  docs.push(")");
  docs.push(" ");

  // Add expression
  docs.push(path.call(print, "expression"));

  return concat(docs);
}

function printIfElseExpression(node, path, print) {
  const docs = [];

  // Add condition
  docs.push(path.call(print, "condition"));
  docs.push(" ");

  // Add questionmark
  docs.push("?");
  docs.push(" ");

  // Add if
  docs.push(path.call(print, "if"));
  docs.push(" ");

  // Add colon
  docs.push(":");
  docs.push(" ");

  // Add else
  docs.push(path.call(print, "else"));

  return concat(docs);
}

function printPostfixExpression(node, path, print) {
  const docs = [];

  // Add expression
  docs.push(path.call(print, "expression"));

  // Add postfix
  docs.push(node.postfix);

  return concat(docs);
}

function printPrefixExpression(node, path, print) {
  const docs = [];

  // Add prefix
  docs.push(node.prefix);

  // Add expression
  docs.push(path.call(print, "expression"));

  return concat(docs);
}

function printInstanceofExpression(node, path, print) {
  const docs = [];

  // Add expression
  docs.push(path.call(print, "expression"));

  // Add instanceof keyword
  docs.push(" ");
  docs.push("instanceof");
  docs.push(" ");

  // Add instanceof
  docs.push(path.call(print, "instanceof"));

  return concat(docs);
}

function printVariableDeclaratorId(node, path, print) {
  const docs = [];

  // Add id
  docs.push(path.call(print, "id"));

  // Add dimensions
  docs.push(concat(path.map(print, "dimensions")));

  return concat(docs);
}

function printTypeArgument(node, path, print) {
  const docs = [];

  // Add argument
  docs.push(path.call(print, "argument"));

  // Add super
  if (node.super) {
    docs.push(" ");
    docs.push("super");
    docs.push(" ");
    docs.push(path.call(print, "super"));
  }

  // Add extends
  if (node.extends) {
    docs.push(" ");
    docs.push("extends");
    docs.push(" ");
    docs.push(path.call(print, "extends"));
  }

  return concat(docs);
}

function printTypeParameter(node, path, print) {
  const docs = [];

  // Add marker annotations like @Bean
  docs.push(printAnnotations(path, print));

  // Add name
  docs.push(path.call(print, "name"));

  // Add typeBounds
  if (node.typeBound) {
    docs.push(" ");
    docs.push("extends");
    docs.push(" ");
    docs.push(path.call(print, "typeBound"));
  }

  return concat(docs);
}

function printThis(node, path, print) {
  return node.arguments
    ? concat(["this", argumentList(node, path, print)])
    : concat(["this"]);
}

function printSuper(node, path, print) {
  return node.arguments
    ? concat(["super", argumentList(node, path, print)])
    : concat(["super"]);
}

function argumentList(node, path, print) {
  return enclosedElementList(
    path,
    print,
    "(",
    path.call(print, "arguments"),
    ")"
  );
}

function enclosedElementList(path, print, prefix, element, suffix) {
  return group(
    concat([prefix, indent(concat([softline, element])), softline, suffix])
  );
}

function printAnnotationTypeDeclaration(node, path, print) {
  const docs = [];

  // Add interface
  docs.push("@interface");
  docs.push(" ");

  // Add name
  docs.push(path.call(print, "name"));
  docs.push(" ");

  // Add body
  docs.push(path.call(print, "body"));

  return concat(docs);
}

function printAnnotationTypeBody(node, path, print) {
  const docs = [];

  // Add open curly
  docs.push("{");

  // Add statements
  if (node.declarations.length > 0) {
    docs.push(indent(concat(path.map(print, "declarations"))));
    docs.push(line);
  }

  // Add close curly
  docs.push("}");

  return concat(docs);
}

function printAnnotation(node, path, print) {
  const docs = [];

  // Add type name
  docs.push("@");
  docs.push(path.call(print, "name"));
  if (node.hasBraces) {
    docs.push(
      enclosedElementList(
        path,
        print,
        "(",
        node.values
          ? join(concat([",", line]), path.map(print, "values"))
          : concat([]),
        ")"
      )
    );
  }
  docs.push(hardline);

  return concat(docs);
}

function printModifier(node) {
  const docs = [];

  // Add keyword
  docs.push(node.value);
  docs.push(" ");

  return concat(docs);
}

function printEndOfLineComment(node) {
  const docs = [];

  if (isEmptyComment(node)) {
    return concat(docs);
  }

  // Add line
  docs.push(hardline);

  // Add comment
  docs.push(node.comment);

  return concat(docs);
}

function printTraditionalComment(node) {
  const docs = [];

  if (isEmptyComment(node)) {
    return concat(docs);
  }

  // Add line
  docs.push(hardline);

  // Add comment
  docs.push(node.comment);

  return concat(docs);
}

function printJavaDocComment(node) {
  const docs = [];

  if (isEmptyComment(node)) {
    return concat(docs);
  }

  // Add line
  docs.push(hardline);

  // Add comment
  docs.push(node.comment);

  return concat(docs);
}

function printCommentStandalone(node, path) {
  const docs = [];

  const index = Number(path.getName());
  if (index !== 0) {
    if (
      (path.getParentNode().type === "CLASS_BODY" &&
        (path.getParentNode().declarations[index - 1].type !==
          "CLASS_BODY_MEMBER_DECLARATION" &&
          path.getParentNode().declarations[index - 1].type !==
            "COMMENT_STANDALONE")) ||
      (path.getParentNode().type === "INTERFACE_BODY" &&
        (path.getParentNode().declarations[index - 1].type !==
          "INTERFACE_METHOD_DECLARATION" &&
          path.getParentNode().declarations[index - 1].type !==
            "COMMENT_STANDALONE")) ||
      (path.getParentNode().type === "BLOCK" &&
        path.getParentNode().statements[index - 1].type !==
          "COMMENT_STANDALONE")
    ) {
      docs.push(hardline);
    }
  }

  // Add value
  docs.push(node.value);

  if (
    (path.getParentNode().type !== "CLASS_BODY" ||
      index !== path.getParentNode().declarations.length - 1) &&
    (path.getParentNode().type !== "INTERFACE_BODY" ||
      index !== path.getParentNode().declarations.length - 1) &&
    (path.getParentNode().type !== "BLOCK" ||
      index !== path.getParentNode().statements.length - 1)
  ) {
    docs.push(hardline);
  }

  return concat(docs);
}

function printMethodReference(node, path, print) {
  const docs = [];

  // Add reference
  docs.push(path.call(print, "reference"));

  // Add colon colon
  docs.push("::");

  // Add typeArguments
  if (node.typeArguments) {
    docs.push(path.call(print, "typeArguments"));
  }

  // Add name
  docs.push(path.call(print, "name"));

  return concat(docs);
}

function printLambdaExpression(node, path, print) {
  const docs = [];

  // Add parameters
  docs.push(path.call(print, "parameters"));
  docs.push(" ");

  // Add pointer
  docs.push("->");
  docs.push(" ");

  // Add body
  docs.push(path.call(print, "body"));

  return concat(docs);
}

function printVoid() {
  const docs = [];

  docs.push("void");

  return concat(docs);
}

function printClass() {
  const docs = [];

  docs.push("class");

  return concat(docs);
}

function printNew() {
  const docs = [];

  docs.push("new");

  return concat(docs);
}

function printNull() {
  const docs = [];

  docs.push("null");

  return concat(docs);
}

function printQuestionmark() {
  const docs = [];

  docs.push("?");

  return concat(docs);
}

function printDimension(node, path, print) {
  const docs = [];

  // Add open square
  docs.push("[");

  // Add expression
  if (node.expression) {
    docs.push(path.call(print, "expression"));
  }

  // Add close square
  docs.push("]");

  return concat(docs);
}

function isEmptyComment(node) {
  if (node.node === "EndOfLineComment") {
    return node.comment === "//";
  }

  if (node.node === "TraditionalComment") {
    return node.comment === "/**/" || node.comment === "/* */";
  }

  if (node.node === "JavaDocComment") {
    return node.comment === "/***/" || node.comment === "/** */";
  }

  return false;
}

function printNode(node, path, print) {
  // console.log(node.type, node);
  switch (node.type) {
    case "COMPILATION_UNIT": {
      return printCompilationUnit(node, path, print);
    }
    case "TYPE_DECLARATION": {
      return printTypeDeclaration(node, path, print);
    }
    case "LOCAL_TYPE_DECLARATION": {
      return printLocalTypeDeclaration(node, path, print);
    }
    case "CLASS_DECLARATION": {
      return printClassDeclaration(node, path, print);
    }
    case "INTERFACE_DECLARATION": {
      return printInterfaceDeclaration(node, path, print);
    }
    case "CONSTRUCTOR_DECLARATION": {
      return printConstructorDeclaration(node, path, print);
    }
    case "ANNOTATION_TYPE_ELEMENT_DECLARATION": {
      return printAnnotationTypeElementDeclaration(node, path, print);
    }
    case "ANNOTATION_TYPE_ELEMENT_REST": {
      return printAnnotationTypeElementRest(node, path, print);
    }
    case "ANNOTATION_METHOD_REST": {
      return printAnnotationMethodRest(node, path, print);
    }
    case "CLASS_BODY": {
      return printClassBody(node, path, print);
    }
    case "CLASS_BODY_BLOCK": {
      return printClassBodyBlock(node, path, print);
    }
    case "CLASS_BODY_MEMBER_DECLARATION": {
      return printClassBodyMemberDeclaration(node, path, print);
    }
    case "INTERFACE_BODY": {
      return printInterfaceBody(node, path, print);
    }
    case "INTERFACE_BODY_DECLARATION": {
      return printInterfaceBodyDeclaration(node, path, print);
    }
    case "INTERFACE_METHOD_DECLARATION": {
      return printInterfaceMethodDeclaration(node, path, print);
    }
    case "ENUM_DECLARATION": {
      return printEnumDeclaration(node, path, print);
    }
    case "ENUM_CONSTANT": {
      return printEnumConstant(node, path, print);
    }
    case "ENUM_BODY_DECLARATIONS": {
      return printEnumDeclarations(node, path, print);
    }
    case "CONSTANT_DECLARATION": {
      return printConstantDeclaration(node, path, print);
    }
    case "METHOD_DECLARATION": {
      return printMethodDeclaration(node, path, print);
    }
    case "GENERIC_METHOD_DECLARATION": {
      return printGenericMethodDeclaration(node, path, print);
    }
    case "FORMAL_PARAMETERS": {
      return printFormalParameters(node, path, print);
    }
    case "FORMAL_PARAMETER": {
      return printFormalParameter(node, path, print);
    }
    case "BLOCK": {
      return printBlock(node, path, print);
    }
    case "ASSERT_STATEMENT": {
      return printAssertStatement(node, path, print);
    }
    case "EXPRESSION_STATEMENT": {
      return printExpressionStatement(node, path, print);
    }
    case "EXPRESSION_LIST":
    case "ENUM_CONSTANTS":
    case "TYPE_LIST":
    case "VARIABLE_DECLARATORS":
    case "TYPE_PARAMETERS":
    case "IDENTIFIER_LIST":
    case "QUALIFIED_NAME_LIST": {
      return printCommaList(node, path, print);
    }
    case "TYPE_BOUND": {
      return printAndList(node, path, print);
    }

    case "CATCH_TYPE": {
      return printVerticalLineList(node, path, print);
    }
    case "CLASS_OR_INTERFACE_TYPE":
    case "IDENTIFIER_NAME": {
      return printDotList(node, path, print);
    }
    case "IDENTIFIER_NAME_ELEMENT": {
      return printIdentifierNameElement(node, path, print);
    }
    case "IDENTIFIER_ARGUMENTS": {
      return printIdentifierArguments(node, path, print);
    }
    case "FOR_STATEMENT": {
      return printForStatement(node, path, print);
    }
    case "BASIC_FOR_CONTROL": {
      return printBasicForControl(node, path, print);
    }
    case "ENHANCED_FOR_CONTROL": {
      return printEnhancedForControl(node, path, print);
    }
    case "IF_STATEMENT": {
      return printIfStatement(node, path, print);
    }
    case "SYNCHRONIZED_STATEMENT": {
      return printSynchronizedStatement(node, path, print);
    }
    case "RETURN_STATEMENT": {
      return printReturnStatement(node, path, print);
    }
    case "BREAK_STATEMENT": {
      return printBreakStatement(node, path, print);
    }
    case "CONTINUE_STATEMENT": {
      return printContinueStatement(node, path, print);
    }
    case "SEMI_COLON_STATEMENT": {
      return printSemiColonStatement(node, path, print);
    }
    case "THROW_STATEMENT": {
      return printThrowStatement(node, path, print);
    }
    case "TRY_STATEMENT": {
      return printTryStatement(node, path, print);
    }
    case "RESOURCE_SPECIFICATION": {
      return printResourceSpecification(node, path, print);
    }
    case "RESOURCES": {
      return printResources(node, path, print);
    }
    case "RESOURCE": {
      return printResource(node, path, print);
    }
    case "CATCH_CLAUSE": {
      return printCatchClause(node, path, print);
    }
    case "FINALLY_BLOCK": {
      return printFinallyBlock(node, path, print);
    }
    case "WHILE_STATEMENT": {
      return printWhileStatement(node, path, print);
    }
    case "DO_WHILE_STATEMENT": {
      return printDoWhileStatement(node, path, print);
    }
    case "SWITCH_STATEMENT": {
      return printSwitchStatement(node, path, print);
    }
    case "SWITCH_BLOCK_STATEMENT_GROUP": {
      return printSwitchBlockStatementGroup(node, path, print);
    }
    case "SWITCH_LABEL_CASE": {
      return printSwitchLabelCase(node, path, print);
    }
    case "SWITCH_LABEL_DEFAULT": {
      return printSwitchLabelDefault(node, path, print);
    }
    case "FIELD_DECLARATION": {
      return printFieldDeclaration(node, path, print);
    }
    case "IMPORT_DECLARATION": {
      return printImportDeclaration(node, path, print);
    }
    case "PACKAGE_DECLARATION": {
      return printPackageDeclaration(node, path, print);
    }
    case "LOCAL_VARIABLE_DECLARATION": {
      return printLocalVariableDeclaration(node, path, print);
    }
    case "CONSTANT_DECLARATOR": {
      return printConstantDeclarator(node, path, print);
    }
    case "VARIABLE_DECLARATOR": {
      return printVariableDeclarator(node, path, print);
    }
    case "TYPE_TYPE": {
      return printTypeType(node, path, print);
    }
    case "TYPE_ARGUMENTS": {
      return printTypeArguments(node, path, print);
    }
    case "CLASS_OR_INTERFACE_TYPE_ELEMENT": {
      return printClassOrInterfaceTypeElement(node, path, print);
    }
    case "PRIMITIVE_TYPE": {
      return printPrimitiveType(node, path, print);
    }
    case "METHOD_INVOCATION": {
      return printMethodInvocation(node, path, print);
    }
    case "GENERIC_INVOCATION": {
      return printGenericInvocation(node, path, print);
    }
    case "QUALIFIED_NAME": {
      return printQualifiedName(node, path, print);
    }
    case "QUALIFIED_EXPRESSION": {
      return printQualifiedExpression(node, path, print);
    }
    case "OPERATOR_EXPRESSION": {
      return printOperatorExpression(node, path, print);
    }
    case "PAR_EXPRESSION": {
      return printParExpression(node, path, print);
    }
    case "IDENTIFIER": {
      return printIdentifier(node, path, print);
    }
    case "IDENTIFIERS": {
      return printIdentifiers(node, path, print);
    }
    case "DEFAULT_VALUE": {
      return printDefaultValue(node, path, print);
    }
    case "BOOLEAN_LITERAL": {
      return printBooleanLiteral(node, path, print);
    }
    case "OPERATOR": {
      return printOperator(node, path, print);
    }
    case "CHAR_LITERAL":
    case "STRING_LITERAL": {
      return printStringLiteral(node, path, print);
    }
    case "DECIMAL_LITERAL":
    case "FLOAT_LITERAL":
    case "OCT_LITERAL":
    case "HEX_LITERAL": {
      return printNumberLiteral(node, path, print);
    }
    case "SIMPLE_CREATOR": {
      return printSimpleCreator(node, path, print);
    }
    case "CLASS_CREATOR_REST": {
      return printClassCreatorRest(node, path, print);
    }
    case "ARRAY_CREATOR_REST": {
      return printArrayCreatorRest(node, path, print);
    }
    case "CREATOR_OPTIONAL_NON_WILDCARD_INNER_CREATOR": {
      return printCreatorOptionalNonWildcardInnerCreator(node, path, print);
    }
    case "INNER_CREATOR": {
      return printInnerCreator(node, path, print);
    }
    case "NON_WILDCARD_CREATOR": {
      return printNonWildcardCreator(node, path, print);
    }
    case "ARRAY_INITIALIZER": {
      return printArrayInitializer(node, path, print);
    }
    case "ELEMENT_VALUE_PAIR": {
      return printElementValuePair(node, path, print);
    }
    case "ELEMENT_VALUE_ARRAY_INITIALIZER": {
      return printElementValueArrayInitializer(node, path, print);
    }
    case "CAST_EXPRESSION": {
      return printCastExpression(node, path, print);
    }
    case "IF_ELSE_EXPRESSION": {
      return printIfElseExpression(node, path, print);
    }
    case "POSTFIX_EXPRESSION": {
      return printPostfixExpression(node, path, print);
    }
    case "PREFIX_EXPRESSION": {
      return printPrefixExpression(node, path, print);
    }
    case "INSTANCEOF_EXPRESSION": {
      return printInstanceofExpression(node, path, print);
    }
    case "VARIABLE_DECLARATOR_ID": {
      return printVariableDeclaratorId(node, path, print);
    }
    case "TYPE_ARGUMENT": {
      return printTypeArgument(node, path, print);
    }
    case "TYPE_PARAMETER": {
      return printTypeParameter(node, path, print);
    }
    case "THIS": {
      return printThis(node, path, print);
    }
    case "SUPER": {
      return printSuper(node, path, print);
    }
    case "ANNOTATION_TYPE_DECLARATION": {
      return printAnnotationTypeDeclaration(node, path, print);
    }
    case "ANNOTATION_TYPE_BODY": {
      return printAnnotationTypeBody(node, path, print);
    }
    // modifiers
    case "ANNOTATION": {
      return printAnnotation(node, path, print);
    }
    case "MODIFIER": {
      return printModifier(node, path, print);
    }
    // Comments
    case "EndOfLineComment": {
      return printEndOfLineComment(node, path, print);
    }
    case "TraditionalComment": {
      return printTraditionalComment(node, path, print);
    }
    case "JavaDocComment": {
      return printJavaDocComment(node, path, print);
    }
    case "COMMENT_STANDALONE": {
      return printCommentStandalone(node, path, print);
    }
    // MethodReference / Lambda
    case "METHOD_REFERENCE": {
      return printMethodReference(node, path, print);
    }
    case "LAMBDA_EXPRESSION": {
      return printLambdaExpression(node, path, print);
    }
    case "VOID": {
      return printVoid(node, path, print);
    }
    case "CLASS": {
      return printClass(node, path, print);
    }
    case "NEW": {
      return printNew(node, path, print);
    }
    case "NULL": {
      return printNull(node, path, print);
    }
    case "QUESTIONMARK": {
      return printQuestionmark(node, path, print);
    }
    case "DIMENSION": {
      return printDimension(node, path, print);
    }
    /* ignore next */
    default:
      // eslint-disable-next-line no-console
      console.error("Unknown Java node:", node);
      return "";
  }
}

function printModifiers(path, print) {
  const docs = [];

  // Add only modifiers in array
  path.each(modifierPath => {
    if (modifierPath.getValue().type === "MODIFIER") {
      docs.push(modifierPath.call(print));
    }
  }, "modifiers");

  return concat(docs);
}

function printAnnotations(path, print) {
  const docs = [];

  const annotations = [];

  // Add only marker annotations in array
  path.each(annotationPath => {
    const node = annotationPath.getValue();
    if (node.type === "ANNOTATION") {
      const annotation = annotationPath.call(print);
      docs.push(annotation);
      annotations.push(annotation);
    }
  }, "modifiers");

  // Sort imports
  annotations.sort((a, b) => {
    if (!a.importPath) {
      a.importPath = getAnnotationName(a.parts[1]);
    }
    if (!b.importPath) {
      b.importPath = getAnnotationName(b.parts[1]);
    }
    if (a.importPath < b.importPath) {
      return -1;
    }
    if (a.importPath > b.importPath) {
      return 1;
    }
    return 0;
  });

  return concat(annotations);

  function getAnnotationName(parts) {
    if (typeof parts === "string") {
      // If already string, just return
      return parts;
    } else if (parts.type && parts.type === "concat") {
      // Search deeper in concat
      return getAnnotationName(parts.parts).join("");
    }

    // Search in array
    const paths = [];
    if (parts.constructor === Array) {
      parts.forEach(part => {
        paths.push(getAnnotationName(part));
      });
    }
    return paths;
  }
}

function genericPrint(path, options, print) {
  const node = path.getValue();
  // console.log(node);
  // if (node.comments) {
  //   console.log(node.type, node.comments);
  // }

  // node["comments"] = [
  //   {
  //     ast_type: "comment",
  //     value: "// a",
  //     leading: false,
  //     trailing: true,
  //     printed: false
  //   },
  //   {
  //     ast_type: "comment",
  //     value: "// b",
  //     leading: true,
  //     trailing: false,
  //     printed: false
  //   }
  // ];

  return printNode(node, path, print);
}

module.exports = genericPrint;
