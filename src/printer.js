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
  docs.push(group(concat(path.map(print, "types"))), hardline);

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
    parts.forEach(part => {
      paths.push(getImportPath(part));
    });
    return paths;
  }
}

function printTypeDeclaration(node, path, print) {
  const docs = [];

  // Add marker annotations like @Bean
  docs.push(printAnnotations(path, print));

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(path, print));

  // Add interface or class keyword
  docs.push(node.interface ? "interface" : "class");
  docs.push(" ");

  // Add name of class/interface
  docs.push(path.call(print, "name"));

  // Add type parameters
  if (node.typeParameters && node.typeParameters.length > 0) {
    docs.push("<");
    docs.push(group(printParameters("typeParameters", path, print)));
    docs.push(">");
  }

  // Add extends class
  if (node.superclassType) {
    const ext = [];
    ext.push(line);
    ext.push("extends");
    ext.push(" ");
    ext.push(path.call(print, "superclassType"));
    docs.push(indent(concat(ext)));
  }

  // Add implemented interfaces
  if (node.superInterfaceTypes && node.superInterfaceTypes.length > 0) {
    const impl = [];
    impl.push(line);
    impl.push("implements");
    impl.push(
      indent(
        concat([
          line,
          join(concat([",", line]), path.map(print, "superInterfaceTypes"))
        ])
      )
    );
    docs.push(indent(concat(impl)));
  }

  // Add open curly bracelet for class/interface beginning
  docs.push(" ");
  docs.push("{");

  // Add class body
  docs.push(indent(concat(path.map(print, "bodyDeclarations"))));

  // Add open curly bracelet for class/interface beginning
  docs.push(softline);
  docs.push(softline);
  docs.push("}");

  return group(concat(docs));
}

function printAnonymousClassDeclaration(node, path, print) {
  const docs = [];

  // Add open curly brace
  docs.push("{");

  // Add body declarations
  docs.push(indent(concat(path.map(print, "bodyDeclarations"))));
  docs.push(hardline);
  docs.push(hardline);

  // Add close curly brace
  docs.push("}");

  return concat(docs);
}

function printEnumDeclaration(node, path, print) {
  const docs = [];

  // Add marker annotations like @Bean
  docs.push(printAnnotations(path, print));

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(path, print));

  // Add interface or class keyword
  docs.push("enum");
  docs.push(" ");

  // Add name of class/interface
  docs.push(path.call(print, "name"));
  docs.push(" ");

  // Add implemented interfaces
  if (node.superInterfaceTypes && node.superInterfaceTypes.length > 0) {
    docs.push("implements");
    docs.push(" ");
    docs.push(join(", ", path.map(print, "superInterfaceTypes")));
    docs.push(" ");
  }

  // Add open curly bracelet for class/interface beginning
  docs.push("{");
  docs.push(hardline);

  // Add enum constants
  docs.push(printParameters("enumConstants", path, print));
  docs.push(";");

  // Add class body
  docs.push(concat(path.map(print, "bodyDeclarations")));

  // Add open curly bracelet for class/interface beginning
  docs.push(softline);
  docs.push(hardline);
  docs.push("}");

  return group(concat(docs));
}

function printEnumConstantDeclaration(node, path, print) {
  const docs = [];

  // Add marker annotations like @Bean
  docs.push(printAnnotations(path, print));

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(path, print));

  // Add name of class/interface
  docs.push(path.call(print, "name"));

  // Add primitive type like void, int, etc.
  if (node.arguments && node.arguments.length > 0) {
    docs.push(group(printParameters("arguments", path, print)));
  }

  return concat(docs);
}

function printMethodDeclaration(node, path, print) {
  const docs = [];

  docs.push(hardline);
  docs.push(hardline);

  // Add marker annotations like @PostConstruct
  docs.push(printAnnotations(path, print));

  docs.push(printMethodDeclarationStart(node, path, print));

  // Add method body
  // Body doesn't exist for abstract
  if (node.body) {
    docs.push(group(indent(path.call(print, "body"))));

    // Add line if the block wasn't empty
    if (
      node.body.node === "Block" &&
      node.body.statements &&
      node.body.statements.length > 0
    ) {
      docs.push(line);
    }

    // Add close curly brace for method beginning
    docs.push("}");
  }

  return concat(docs);
}

function printMethodDeclarationStart(node, path, print) {
  const docs = [];

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(path, print));

  // Add type parameters
  if (node.typeParameters && node.typeParameters.length > 0) {
    docs.push("<");
    docs.push(group(printParameters("typeParameters", path, print)));
    docs.push(">");
    docs.push(" ");
  }

  // Add return type
  if (node.returnType2) {
    docs.push(path.call(print, "returnType2"));
    docs.push(" ");
  }

  // Add name of class/interface
  docs.push(path.call(print, "name"));

  // Add open brace for method parameters
  docs.push("(");

  // Add parameters
  if (node.parameters && node.parameters.length > 0) {
    docs.push(printParameters("parameters", path, print));
    docs.push(softline);
  }

  // Add close brace for method parameters
  docs.push(")");

  // Add thrown exceptions
  if (node.thrownExceptions && node.thrownExceptions.length > 0) {
    const throws = [];
    throws.push(line);
    throws.push("throws");
    const joinedInterfaces = join(
      concat([",", line]),
      path.map(print, "thrownExceptions")
    );
    throws.push(indent(concat([line, joinedInterfaces])));
    docs.push(indent(concat(throws)));
  }

  // Body doesn't exist for abstract
  if (node.body) {
    docs.push(" ");

    // Add open curly brace for method beginning
    docs.push("{");
  } else {
    // If abstract
    docs.push(";");
  }

  return group(concat(docs));
}

function printBlock(node, path, print) {
  const docs = [];

  // Add statements
  docs.push(concat(path.map(print, "statements")));

  return concat(docs);
}

function printEnhancedForStatement(node, path, print) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add for
  docs.push("for");
  docs.push(" ");

  // Add open brace
  docs.push("(");

  // Add parameter
  docs.push(path.call(print, "parameter"));

  // Add colon
  docs.push(" ");
  docs.push(":");
  docs.push(" ");

  // Add expression
  docs.push(path.call(print, "expression"));

  // Add close braces and open curly braces
  docs.push(")");
  docs.push(" ");
  docs.push("{");

  // Add then of if
  docs.push(indent(path.call(print, "body")));

  // Add close curly braces
  docs.push(line);
  docs.push("}");

  return concat(docs);
}

function printExpressionStatement(node, path, print) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add expression
  docs.push(path.call(print, "expression"));
  docs.push(";");

  return concat(docs);
}

function printForStatement(node, path, print) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add while and open braces
  docs.push("for");
  docs.push(" ");
  docs.push("(");

  // Add initializer
  if (node.initializers) {
    docs.push(concat(path.map(print, "initializers")));
  }
  docs.push(";");

  // Add expression
  if (node.expression) {
    docs.push(" ");
    docs.push(path.call(print, "expression"));
  }
  docs.push(";");

  // Add updater
  if (node.updaters && node.updaters.length > 0) {
    docs.push(" ");
    docs.push(concat(path.map(print, "updaters")));
  }

  // Add close braces and open curly braces
  docs.push(")");
  docs.push(" ");
  docs.push("{");

  // Add then of if
  docs.push(indent(path.call(print, "body")));

  // Add close curly braces
  docs.push(line);
  docs.push("}");

  return concat(docs);
}

function printIfStatement(node, path, print) {
  const docs = [];

  // Add line, if parent is not an if statement
  if (path.getParentNode().node !== "IfStatement") {
    docs.push(hardline);
  }

  docs.push(printIfStatementContinue(node, path, print));

  return concat(docs);
}

function printReturnStatement(node, path, print) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add return
  docs.push("return");
  docs.push(" ");

  // Add expression
  docs.push(path.call(print, "expression"));

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

  // Add open curly braces
  docs.push("{");

  // Add body
  docs.push(indent(path.call(print, "body")));

  // Add line
  docs.push(hardline);

  // Add close curly braces
  docs.push("}");
  docs.push(" ");

  // Add catch clauses
  docs.push(concat(path.map(print, "catchClauses")));

  // Add finally
  if (node.finally) {
    // Add finally
    docs.push("finally");
    docs.push(" ");

    // Add open curly braces
    docs.push("{");

    docs.push(indent(path.call(print, "finally")));

    // Add close curly braces
    docs.push(hardline);
    docs.push("}");
  }

  return concat(docs);
}

function printVariableDeclarationStatement(node, path, print) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(path, print));

  // Add type
  docs.push(path.call(print, "type"));
  docs.push(" ");

  // Add fragments
  if (node.fragments && node.fragments.length > 0) {
    docs.push(concat(path.map(print, "fragments")));
  }

  // Add semicolon
  docs.push(";");

  return concat(docs);
}

function printIfStatementContinue(node, path, print) {
  const docs = [];

  // Add if and open braces
  docs.push("if");
  docs.push(" ");
  docs.push("(");

  // Add expression
  docs.push(path.call(print, "expression"));

  // Add close braces and open curly braces
  docs.push(")");
  docs.push(" ");
  docs.push("{");

  // Add then of if
  docs.push(indent(path.call(print, "thenStatement")));

  // Add close curly braces
  docs.push(line);
  docs.push("}");

  // Add else
  if (node.elseStatement) {
    docs.push(" ");
    docs.push("else");
    docs.push(" ");
    if (node.elseStatement.node == "IfStatement") {
      // Is in the else statement another if, then print that if
      // console.log(node.elseStatement);
      // docs.push(printIfStatementContinue(node.elseStatement));
      docs.push(path.call(print, "elseStatement"));
    } else {
      // Regular else
      docs.push("{");
      docs.push(indent(path.call(print, "elseStatement")));
      // Add close curly braces
      docs.push(line);
      docs.push("}");
    }
  }

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

  // Add expression
  docs.push(path.call(print, "expression"));

  // Add close braces and open curly braces
  docs.push(")");
  docs.push(" ");
  docs.push("{");

  // Add then of if
  docs.push(indent(path.call(print, "body")));

  // Add close curly braces
  docs.push(line);
  docs.push("}");

  return concat(docs);
}

function printFieldDeclaration(node, path, print) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add marker annotations like @Bean
  docs.push(printAnnotations(path, print));

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(path, print));

  // Add type
  docs.push(path.call(print, "type"));
  docs.push(" ");

  // Add fragments
  if (node.fragments && node.fragments.length > 0) {
    docs.push(concat(path.map(print, "fragments")));
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

function printSingleVariableDeclaration(node, path, print) {
  const docs = [];

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(path, print));

  // Add type
  docs.push(path.call(print, "type"));
  docs.push(" ");

  // Add variable name
  docs.push(path.call(print, "name"));

  return concat(docs);
}

function printTypeParameter(node, path, print) {
  const docs = [];

  // Add name
  docs.push(path.call(print, "name"));

  // Add type bounds
  if (node.typeBounds && node.typeBounds.length > 0) {
    docs.push(" ");
    docs.push("extends");
    docs.push(" ");
    docs.push(concat(path.map(print, "typeBounds")));
  }

  return concat(docs);
}

function printArrayType(node, path, print) {
  const docs = [];

  // Modify component type if ArrayType to not print braces
  if (node.removeBraces && node.componentType.node === "ArrayType") {
    node.componentType.removeBraces = true;
  }
  // Add array type like String, Integer, etc.
  docs.push(path.call(print, "componentType"));

  if (!node.removeBraces) {
    docs.push("[]");
  }

  return concat(docs);
}

function printParameterizedType(node, path, print) {
  const docs = [];

  // Add type
  docs.push(path.call(print, "type"));

  // Add type arguments
  if (node.typeArguments && node.typeArguments.length > 0) {
    docs.push("<");
    docs.push(printParameters("typeArguments", path, print));
    docs.push(">");
  }

  return concat(docs);
}

function printPrimitiveType(node) {
  const docs = [];

  // Add primitive type like void, int, etc.
  docs.push(node.primitiveTypeCode);

  return concat(docs);
}

function printSimpleType(node, path, print) {
  const docs = [];

  // Add type
  docs.push(path.call(print, "name"));

  return concat(docs);
}

function printWildcardType(node, path, print) {
  const docs = [];

  // Add questionmark
  docs.push("?");

  // Add extends
  docs.push(" ");
  docs.push("extends");
  docs.push(" ");

  // Add bound
  docs.push(path.call(print, "bound"));

  return concat(docs);
}

function printConstructorInvocation(node, path, print) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add this
  docs.push("this");
  docs.push("(");

  // Add primitive type like void, int, etc.
  docs.push(group(printParameters("arguments", path, print)));

  docs.push(")");
  docs.push(";");

  return concat(docs);
}

function printMethodInvocation(node, path, print) {
  const docs = [];

  // Add expression
  if (node.expression) {
    docs.push(path.call(print, "expression"));
    docs.push(".");
  }

  // Add method name
  docs.push(path.call(print, "name"));

  // Add open brace for method parameters
  docs.push("(");

  // Add method arguments
  docs.push(concat(path.map(print, "arguments")));

  // Add close brace for method parameters
  docs.push(")");

  return concat(docs);
}

function printSuperConstructorInvocation(node, path, print) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add super
  docs.push("super");
  docs.push("(");

  // Add primitive type like void, int, etc.
  docs.push(group(printParameters("arguments", path, print)));

  docs.push(")");
  docs.push(";");

  return concat(docs);
}

function printSuperMethodInvocation(node, path, print) {
  const docs = [];

  // Add super
  docs.push("super");
  docs.push(".");

  // Add name
  docs.push(path.call(print, "name"));

  // Add type arguments
  if (node.typeArguments && node.typeArguments.length > 0) {
    docs.push("<");
    docs.push(printParameters("typeArguments", path, print));
    docs.push(">");
  }

  // Add open braces
  docs.push("(");

  // Add arguments
  if (node.arguments && node.arguments.length > 0) {
    docs.push(printParameters("arguments", path, print));
  }

  // Add close braces
  docs.push(")");

  return concat(docs);
}

function printQualifiedName(node, path, print) {
  const docs = [];

  // Add qualifier
  docs.push(path.call(print, "qualifier"));
  docs.push(".");

  // Add name
  docs.push(path.call(print, "name"));

  return concat(docs);
}

function printBooleanLiteral(node) {
  const docs = [];

  // Add boolean value
  if (node.booleanValue) {
    docs.push("true");
  } else {
    docs.push("false");
  }

  return concat(docs);
}

function printTypeLiteral(node, path, print) {
  const docs = [];

  // Add type
  docs.push(path.call(print, "type"));

  // Add .class
  docs.push(".class");

  return concat(docs);
}

function printStringLiteral(node) {
  const docs = [];

  // Add escaped value
  docs.push(node.escapedValue);

  return concat(docs);
}

function printNumberLiteral(node) {
  const docs = [];

  // Add token
  docs.push(node.token);

  return concat(docs);
}

function printNullLiteral() {
  const docs = [];

  // Add null
  docs.push("null");

  return concat(docs);
}

function printArrayCreation(node, path, print) {
  const docs = [];

  // Add new
  docs.push("new");
  docs.push(" ");

  // Modify node if ArrayType to not print braces
  if (node.type.node === "ArrayType") {
    node.type.removeBraces = true;
  }
  // Add type
  docs.push(path.call(print, "type"));

  // Add dimensions
  if (node.dimensions && node.dimensions.length > 0) {
    path.each(dimensionPath => {
      // Add open square braces
      docs.push("[");

      // Add dimension
      docs.push(dimensionPath.call(print));

      // Add close square braces
      docs.push("]");
    }, "dimensions");
  } else {
    // Just push an empty init of square braces
    docs.push("[]");
  }

  // Add initializer
  if (node.initializer) {
    // Add initialiter
    docs.push(path.call(print, "initializer"));
  }

  return concat(docs);
}

function printClassInstanceCreation(node, path, print) {
  const docs = [];

  // Add new
  docs.push("new");
  docs.push(" ");

  // Add type
  docs.push(path.call(print, "type"));

  // Add open braces
  docs.push("(");

  // Add arguments
  if (node.arguments && node.arguments.length > 0) {
    docs.push(printParameters("arguments", path, print));
  }

  // Add close braces
  docs.push(")");

  // Add anonymous class declaration
  if (node.anonymousClassDeclaration) {
    docs.push(path.call(print, "anonymousClassDeclaration"));
  }

  return concat(docs);
}

function printArrayInitializer(node, path, print) {
  const docs = [];

  // Add open curly braces
  docs.push("{");

  // Add expressions
  docs.push(printParameters("expressions", path, print));

  // Add close curly braces
  docs.push(softline);
  docs.push("}");

  return concat(docs);
}

function printSimpleName(node) {
  const docs = [];

  // Add identifier
  docs.push(node.identifier);

  return concat(docs);
}

function printCastExpression(node, path, print) {
  const docs = [];

  // Add open braces
  docs.push("(");

  // Add type
  docs.push(path.call(print, "type"));

  // Add close braces
  docs.push(")");
  docs.push(" ");

  // Add expression
  docs.push(path.call(print, "expression"));

  return concat(docs);
}

function printConditionalExpression(node, path, print) {
  const docs = [];

  // Add expression
  docs.push(path.call(print, "expression"));
  docs.push(" ");

  // Add questionmark
  docs.push("?");
  docs.push(" ");

  // Add then expression
  docs.push(path.call(print, "thenExpression"));
  docs.push(" ");

  // Add colon
  docs.push(":");
  docs.push(" ");

  // Add else expression
  docs.push(path.call(print, "elseExpression"));

  return concat(docs);
}

function printInfixExpression(node, path, print) {
  const docs = [];

  // Add left operand
  docs.push(path.call(print, "leftOperand"));

  // Add operator
  docs.push(" ");
  docs.push(node.operator);
  docs.push(" ");

  // Add right operand
  docs.push(path.call(print, "rightOperand"));

  return concat(docs);
}

function printParenthesizedExpression(node, path, print) {
  const docs = [];

  // Add open brace
  docs.push("(");

  // Add expression
  docs.push(path.call(print, "expression"));

  // Add close brace
  docs.push(")");

  return concat(docs);
}

function printPostfixExpression(node, path, print) {
  const docs = [];

  // Add operand
  docs.push(path.call(print, "operand"));

  // Add operator
  docs.push(node.operator);

  return concat(docs);
}

function printPrefixExpression(node, path, print) {
  const docs = [];

  // Add operator
  docs.push(node.operator);

  // Add operand
  docs.push(path.call(print, "operand"));

  return concat(docs);
}

function printVariableDeclarationExpression(node, path, print) {
  const docs = [];

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(path, print));

  // Add type
  docs.push(path.call(print, "type"));
  docs.push(" ");

  // Add fragments
  docs.push(concat(path.map(print, "fragments")));

  return concat(docs);
}

function printVariableDeclarationFragment(node, path, print) {
  const docs = [];

  // Add name
  docs.push(path.call(print, "name"));

  // Add initializer
  if (node.initializer) {
    docs.push(" ");
    docs.push("=");
    docs.push(" ");
    docs.push(path.call(print, "initializer"));
  }

  return concat(docs);
}

function printArrayAccess(node, path, print) {
  const docs = [];

  // Add array
  docs.push(path.call(print, "array"));

  // Add index
  docs.push("[");
  docs.push(path.call(print, "index"));
  docs.push("]");

  return concat(docs);
}

function printAssignment(node, path, print) {
  const docs = [];

  // Add left hand side
  docs.push(path.call(print, "leftHandSide"));

  // Add operator
  docs.push(" ");
  docs.push(node.operator);
  docs.push(" ");

  // Add right hand side
  docs.push(path.call(print, "rightHandSide"));

  return concat(docs);
}

function printFieldAccess(node, path, print) {
  const docs = [];

  // Add expression
  if (node.expression) {
    docs.push(path.call(print, "expression"));
    docs.push(".");
  }

  // Add name
  docs.push(path.call(print, "name"));

  return concat(docs);
}

function printThisExpression() {
  const docs = [];

  docs.push("this");

  return concat(docs);
}

function printNormalAnnotation(node, path, print) {
  const docs = [];

  // Add type name
  docs.push("@");
  docs.push(path.call(print, "typeName"));
  docs.push("(");
  if (node.values && node.values.length > 0) {
    docs.push(
      group(
        concat([
          indent(
            concat([
              softline,
              join(concat([",", line]), path.map(print, "values"))
            ])
          ),
          softline
        ])
      )
    );
  }
  docs.push(")");
  docs.push(hardline);

  return concat(docs);
}

function printSingleMemberAnnotation(node, path, print) {
  const docs = [];

  // Add type name
  docs.push("@");
  docs.push(path.call(print, "typeName"));
  docs.push("(");
  docs.push(path.call(print, "value"));
  docs.push(")");
  docs.push(hardline);

  return concat(docs);
}

function printMarkerAnnotation(node, path, print) {
  const docs = [];

  // Add type name
  docs.push("@");
  docs.push(path.call(print, "typeName"));
  docs.push(hardline);

  return concat(docs);
}

function printModifier(node) {
  const docs = [];

  // Add keyword
  docs.push(node.keyword);
  docs.push(" ");

  return concat(docs);
}

function printCatchClause(node, path, print) {
  const docs = [];

  // Add catch
  docs.push("catch");

  // Add open brace
  docs.push("(");

  // Add exception
  docs.push(path.call(print, "exception"));

  // Add close brace
  docs.push(")");
  docs.push(" ");

  // Add open curly brace
  docs.push("{");

  // Add body
  docs.push(indent(path.call(print, "body")));
  docs.push(hardline);

  // Add close curly brace
  docs.push("}");
  docs.push(" ");

  return concat(docs);
}

function printNode(node, path, print) {
  switch (node.node) {
    case "CompilationUnit": {
      return printCompilationUnit(node, path, print);
    }
    case "TypeDeclaration": {
      return printTypeDeclaration(node, path, print);
    }
    case "AnonymousClassDeclaration": {
      return printAnonymousClassDeclaration(node, path, print);
    }
    case "EnumDeclaration": {
      return printEnumDeclaration(node, path, print);
    }
    case "EnumConstantDeclaration": {
      return printEnumConstantDeclaration(node, path, print);
    }
    case "MethodDeclaration": {
      return printMethodDeclaration(node, path, print);
    }
    case "Block": {
      return printBlock(node, path, print);
    }
    case "EnhancedForStatement": {
      return printEnhancedForStatement(node, path, print);
    }
    case "ExpressionStatement": {
      return printExpressionStatement(node, path, print);
    }
    case "ForStatement": {
      return printForStatement(node, path, print);
    }
    case "IfStatement": {
      return printIfStatement(node, path, print);
    }
    case "ReturnStatement": {
      return printReturnStatement(node, path, print);
    }
    case "ThrowStatement": {
      return printThrowStatement(node, path, print);
    }
    case "TryStatement": {
      return printTryStatement(node, path, print);
    }
    case "VariableDeclarationStatement": {
      return printVariableDeclarationStatement(node, path, print);
    }
    case "WhileStatement": {
      return printWhileStatement(node, path, print);
    }
    case "FieldDeclaration": {
      return printFieldDeclaration(node, path, print);
    }
    case "ImportDeclaration": {
      return printImportDeclaration(node, path, print);
    }
    case "PackageDeclaration": {
      return printPackageDeclaration(node, path, print);
    }
    case "SingleVariableDeclaration": {
      return printSingleVariableDeclaration(node, path, print);
    }
    case "TypeParameter": {
      return printTypeParameter(node, path, print);
    }
    case "ArrayType": {
      return printArrayType(node, path, print);
    }
    case "ParameterizedType": {
      return printParameterizedType(node, path, print);
    }
    case "PrimitiveType": {
      return printPrimitiveType(node, path, print);
    }
    case "SimpleType": {
      return printSimpleType(node, path, print);
    }
    case "WildcardType": {
      return printWildcardType(node, path, print);
    }
    case "ConstructorInvocation": {
      return printConstructorInvocation(node, path, print);
    }
    case "MethodInvocation": {
      return printMethodInvocation(node, path, print);
    }
    case "SuperConstructorInvocation": {
      return printSuperConstructorInvocation(node, path, print);
    }
    case "SuperMethodInvocation": {
      return printSuperMethodInvocation(node, path, print);
    }
    case "QualifiedName": {
      return printQualifiedName(node, path, print);
    }
    case "BooleanLiteral": {
      return printBooleanLiteral(node, path, print);
    }
    case "TypeLiteral": {
      return printTypeLiteral(node, path, print);
    }
    case "StringLiteral": {
      return printStringLiteral(node, path, print);
    }
    case "NumberLiteral": {
      return printNumberLiteral(node, path, print);
    }
    case "NullLiteral": {
      return printNullLiteral(node, path, print);
    }
    case "ArrayCreation": {
      return printArrayCreation(node, path, print);
    }
    case "ClassInstanceCreation": {
      return printClassInstanceCreation(node, path, print);
    }
    case "ArrayInitializer": {
      return printArrayInitializer(node, path, print);
    }
    case "SimpleName": {
      return printSimpleName(node, path, print);
    }
    case "CastExpression": {
      return printCastExpression(node, path, print);
    }
    case "ConditionalExpression": {
      return printConditionalExpression(node, path, print);
    }
    case "InfixExpression": {
      return printInfixExpression(node, path, print);
    }
    case "ParenthesizedExpression": {
      return printParenthesizedExpression(node, path, print);
    }
    case "PostfixExpression": {
      return printPostfixExpression(node, path, print);
    }
    case "PrefixExpression": {
      return printPrefixExpression(node, path, print);
    }
    case "VariableDeclarationExpression": {
      return printVariableDeclarationExpression(node, path, print);
    }
    case "VariableDeclarationFragment": {
      return printVariableDeclarationFragment(node, path, print);
    }
    case "ArrayAccess": {
      return printArrayAccess(node, path, print);
    }
    case "Assignment": {
      return printAssignment(node, path, print);
    }
    case "FieldAccess": {
      return printFieldAccess(node, path, print);
    }
    case "ThisExpression": {
      return printThisExpression(node, path, print);
    }
    // modifiers
    case "NormalAnnotation": {
      return printNormalAnnotation(node, path, print);
    }
    case "SingleMemberAnnotation": {
      return printSingleMemberAnnotation(node, path, print);
    }
    case "MarkerAnnotation": {
      return printMarkerAnnotation(node, path, print);
    }
    case "Modifier": {
      return printModifier(node, path, print);
    }
    case "MemberValuePair": {
      return printMemberValuePair(node, path, print);
    }
    // CatchClause
    case "CatchClause": {
      return printCatchClause(node, path, print);
    }
    /* istanbul ignore next */
    default:
      // eslint-disable-next-line no-console
      console.error("Unknown Java node:", node);
      return "";
  }
}

function printParameters(childrensPathName, path, print) {
  const docs = [];

  docs.push(softline);
  docs.push(join(concat([",", line]), path.map(print, childrensPathName)));

  return indent(concat(docs));
}

function printModifiers(path, print) {
  const docs = [];

  // Add only modifiers in array
  path.each(modifierPath => {
    if (modifierPath.getValue().node === "Modifier") {
      docs.push(modifierPath.call(print));
    }
  }, "modifiers");

  return concat(docs);
}

function printMemberValuePair(node, path, print) {
  const docs = [];

  // Add name
  docs.push(path.call(print, "name"));

  // Add equals symbol
  docs.push(" ");
  docs.push("=");
  docs.push(" ");

  // Add value
  docs.push(path.call(print, "value"));

  return concat(docs);
}

function printAnnotations(path, print) {
  const docs = [];

  const annotations = [];
  const annotationsMap = new Object();

  // Add only marker annotations in array
  path.each(annotationPath => {
    const node = annotationPath.getValue().node;
    if (
      node === "NormalAnnotation" ||
      node === "SingleMemberAnnotation" ||
      node === "MarkerAnnotation"
    ) {
      const identifier = annotationPath.getValue().typeName.identifier;
      annotations.push(identifier);
      annotationsMap[identifier] = annotationPath.call(print);
    }
  }, "modifiers");

  annotations.sort((a, b) => {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });

  annotations.forEach(annotation => {
    docs.push(annotationsMap[annotation]);
  });

  return concat(docs);
}

function genericPrint(path, options, print) {
  const node = path.getValue();

  return printNode(node, path, print);
}

module.exports = genericPrint;
