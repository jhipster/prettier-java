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

function printCompilationUnit(node) {
  const docs = [];

  // Add package
  if (node.package) {
    docs.push(printNode(node.package));
    docs.push(hardline);
  }

  // Add imports
  if (node.imports && node.imports.length > 0) {
    const imports = printNodes(node.imports);

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
  docs.push(group(concat([printNodes(node.types)])), hardline);

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

function printTypeDeclaration(node) {
  const docs = [];

  // Add marker annotations like @Bean
  docs.push(printMarkerAnnotations(node.modifiers));

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(node.modifiers));

  // Add interface or class keyword
  docs.push(node.interface ? "interface" : "class");
  docs.push(" ");

  // Add name of class/interface
  docs.push(printNode(node.name));

  // Add type parameters
  if (node.typeParameters && node.typeParameters.length > 0) {
    docs.push("<");
    docs.push(group(printParameters(node.typeParameters)));
    docs.push(">");
  }

  // Add extends class
  if (node.superclassType) {
    const ext = [];
    ext.push(line);
    ext.push("extends");
    ext.push(" ");
    ext.push(printNode(node.superclassType));
    docs.push(indent(concat(ext)));
  }

  // Add implemented interfaces
  if (node.superInterfaceTypes && node.superInterfaceTypes.length > 0) {
    const impl = [];
    impl.push(line);
    impl.push("implements");
    const interfaces = [];
    node.superInterfaceTypes.forEach(superInterfaceType => {
      interfaces.push(printNode(superInterfaceType));
    });
    const joinedInterfaces = join(concat([",", line]), interfaces);
    impl.push(indent(concat([line, joinedInterfaces])));
    docs.push(indent(concat(impl)));
  }

  // Add open curly bracelet for class/interface beginning
  docs.push(" ");
  docs.push("{");

  // Add class body
  docs.push(indent(printNodes(node.bodyDeclarations)));

  // Add open curly bracelet for class/interface beginning
  docs.push(softline);
  docs.push(softline);
  docs.push("}");

  return group(concat(docs));
}

function printEnumDeclaration(node) {
  const docs = [];

  // Add marker annotations like @Bean
  docs.push(printMarkerAnnotations(node.modifiers));

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(node.modifiers));

  // Add interface or class keyword
  docs.push("enum");
  docs.push(" ");

  // Add name of class/interface
  docs.push(printNode(node.name));
  docs.push(" ");

  // Add implemented interfaces
  if (node.superInterfaceTypes && node.superInterfaceTypes.length > 0) {
    docs.push("implements");
    docs.push(" ");
    const interfaces = [];
    node.superInterfaceTypes.forEach(superInterfaceType => {
      interfaces.push(printNode(superInterfaceType));
    });
    docs.push(join(", ", interfaces));
    docs.push(" ");
  }

  // Add open curly bracelet for class/interface beginning
  docs.push("{");
  docs.push(hardline);

  // Add enum constants
  docs.push(printParameters(node.enumConstants));
  docs.push(";");

  // Add class body
  docs.push(printNodes(node.bodyDeclarations));

  // Add open curly bracelet for class/interface beginning
  docs.push(softline);
  docs.push(hardline);
  docs.push("}");

  return group(concat(docs));
}

function printEnumConstantDeclaration(node) {
  const docs = [];

  // Add marker annotations like @Bean
  docs.push(printMarkerAnnotations(node.modifiers));

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(node.modifiers));

  // Add name of class/interface
  docs.push(printNode(node.name));

  // Add primitive type like void, int, etc.
  if (node.arguments && node.arguments.length > 0) {
    docs.push(group(printParameters(node.arguments)));
  }

  return concat(docs);
}

function printMethodDeclaration(node) {
  const docs = [];

  docs.push(hardline);
  docs.push(hardline);

  // Add marker annotations like @PostConstruct
  docs.push(printMarkerAnnotations(node.modifiers));

  docs.push(printMethodDeclarationStart(node));

  // Add method body
  // Body doesn't exist for abstract
  if (node.body) {
    docs.push(group(indent(printNode(node.body))));

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

function printMethodDeclarationStart(node) {
  const docs = [];

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(node.modifiers));

  // Add type parameters
  if (node.typeParameters && node.typeParameters.length > 0) {
    docs.push("<");
    docs.push(group(printParameters(node.typeParameters)));
    docs.push(">");
    docs.push(" ");
  }

  // Add return type
  if (node.returnType2) {
    docs.push(printNode(node.returnType2));
    docs.push(" ");
  }

  // Add name of class/interface
  docs.push(printNode(node.name));

  // Add open brace for method parameters
  docs.push("(");

  // Add parameters
  if (node.parameters && node.parameters.length > 0) {
    docs.push(printParameters(node.parameters));
    docs.push(softline);
  }

  // Add close brace for method parameters
  docs.push(")");

  // Add thrown exceptions
  if (node.thrownExceptions && node.thrownExceptions.length > 0) {
    const throws = [];
    throws.push(line);
    throws.push("throws");
    const interfaces = [];
    node.thrownExceptions.forEach(superInterfaceType => {
      interfaces.push(printNode(superInterfaceType));
    });
    const joinedInterfaces = join(concat([",", line]), interfaces);
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

function printBlock(node) {
  const docs = [];

  // Add statements
  docs.push(printNodes(node.statements));

  return concat(docs);
}

function printEnhancedForStatement(node) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add for
  docs.push("for");
  docs.push(" ");

  // Add open brace
  docs.push("(");

  // Add parameter
  docs.push(printNode(node.parameter));

  // Add colon
  docs.push(" ");
  docs.push(":");
  docs.push(" ");

  // Add expression
  docs.push(printNode(node.expression));

  // Add close braces and open curly braces
  docs.push(")");
  docs.push(" ");
  docs.push("{");

  // Add then of if
  docs.push(indent(printNode(node.body)));

  // Add close curly braces
  docs.push(line);
  docs.push("}");

  return concat(docs);
}

function printExpressionStatement(node) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add expression
  docs.push(printNode(node.expression));
  docs.push(";");

  return concat(docs);
}

function printForStatement(node) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add while and open braces
  docs.push("for");
  docs.push(" ");
  docs.push("(");

  // Add initializer
  if (node.initializers) {
    docs.push(printNodes(node.initializers));
  }
  docs.push(";");

  // Add expression
  if (node.expression) {
    docs.push(" ");
    docs.push(printNode(node.expression));
  }
  docs.push(";");

  // Add updater
  if (node.updaters && node.updaters.length > 0) {
    docs.push(" ");
    docs.push(printNodes(node.updaters));
  }

  // Add close braces and open curly braces
  docs.push(")");
  docs.push(" ");
  docs.push("{");

  // Add then of if
  docs.push(indent(printNode(node.body)));

  // Add close curly braces
  docs.push(line);
  docs.push("}");

  return concat(docs);
}

function printIfStatement(node) {
  const docs = [];

  // Add line
  docs.push(hardline);

  docs.push(printIfStatementContinue(node));

  return concat(docs);
}

function printReturnStatement(node) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add return
  docs.push("return");
  docs.push(" ");

  // Add expression
  docs.push(printNode(node.expression));

  // Add semicolon
  docs.push(";");

  return concat(docs);
}

function printThrowStatement(node) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add return
  docs.push("throw");
  docs.push(" ");

  // Add expression
  docs.push(printNode(node.expression));

  // Add semicolon
  docs.push(";");

  return concat(docs);
}

function printVariableDeclarationStatement(node) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(node.modifiers));

  // Add type
  docs.push(printNode(node.type));
  docs.push(" ");

  // Add fragments
  if (node.fragments && node.fragments.length > 0) {
    docs.push(printNodes(node.fragments));
  }

  // Add semicolon
  docs.push(";");

  return concat(docs);
}

function printIfStatementContinue(node) {
  const docs = [];

  // Add if and open braces
  docs.push("if");
  docs.push(" ");
  docs.push("(");

  // Add expression
  docs.push(printNode(node.expression));

  // Add close braces and open curly braces
  docs.push(")");
  docs.push(" ");
  docs.push("{");

  // Add then of if
  docs.push(indent(printNode(node.thenStatement)));

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
      docs.push(printIfStatementContinue(node.elseStatement));
    } else {
      // Regular else
      docs.push("{");
      docs.push(indent(printNode(node.elseStatement)));
      // Add close curly braces
      docs.push(line);
      docs.push("}");
    }
  }

  return concat(docs);
}

function printWhileStatement(node) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add while and open braces
  docs.push("while");
  docs.push(" ");
  docs.push("(");

  // Add expression
  docs.push(printNode(node.expression));

  // Add close braces and open curly braces
  docs.push(")");
  docs.push(" ");
  docs.push("{");

  // Add then of if
  docs.push(indent(printNode(node.body)));

  // Add close curly braces
  docs.push(line);
  docs.push("}");

  return concat(docs);
}

function printFieldDeclaration(node) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add marker annotations like @Bean
  docs.push(printMarkerAnnotations(node.modifiers));

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(node.modifiers));

  // Add type
  docs.push(printNode(node.type));
  docs.push(" ");

  // Add fragments
  if (node.fragments && node.fragments.length > 0) {
    docs.push(printNodes(node.fragments));
  }

  // Add semicolon
  docs.push(";");

  return concat(docs);
}

function printImportDeclaration(node) {
  const docs = [];

  // Add import
  docs.push("import");
  docs.push(" ");

  // Add name
  docs.push(printNode(node.name));

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

function printPackageDeclaration(node) {
  const docs = [];

  // Add package
  docs.push("package");
  docs.push(" ");

  // Add name
  docs.push(printNode(node.name));

  // Add semicolon
  docs.push(";");

  // Add line
  docs.push(hardline);

  return concat(docs);
}

function printSingleVariableDeclaration(node) {
  const docs = [];

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(node.modifiers));

  // Add type
  docs.push(printNode(node.type));
  docs.push(" ");

  // Add variable name
  docs.push(printNode(node.name));

  return concat(docs);
}

function printTypeParameter(node) {
  const docs = [];

  // Add name
  docs.push(printNode(node.name));

  // Add type bounds
  if (node.typeBounds && node.typeBounds.length > 0) {
    docs.push(" ");
    docs.push("extends");
    docs.push(" ");
    docs.push(printNodes(node.typeBounds));
  }

  return concat(docs);
}

function printArrayType(node) {
  const docs = [];

  // Modify component type if ArrayType to not print braces
  if (node.removeBraces && node.componentType.node === "ArrayType") {
    node.componentType.removeBraces = true;
  }
  // Add array type like String, Integer, etc.
  docs.push(printNode(node.componentType));

  if (!node.removeBraces) {
    docs.push("[]");
  }

  return concat(docs);
}

function printParameterizedType(node) {
  const docs = [];

  // Add type
  docs.push(printNode(node.type));

  // Add type arguments
  if (node.typeArguments && node.typeArguments.length > 0) {
    docs.push("<");
    docs.push(printParameters(node.typeArguments));
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

function printSimpleType(node) {
  const docs = [];

  // Add type
  docs.push(printNode(node.name));

  return concat(docs);
}

function printWildcardType(node) {
  const docs = [];

  // Add questionmark
  docs.push("?");

  // Add extends
  docs.push(" ");
  docs.push("extends");
  docs.push(" ");

  // Add bound
  docs.push(printNode(node.bound));

  return concat(docs);
}

function printConstructorInvocation(node) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add this
  docs.push("this");
  docs.push("(");

  // Add primitive type like void, int, etc.
  docs.push(group(printParameters(node.arguments)));

  docs.push(")");
  docs.push(";");

  return concat(docs);
}

function printMethodInvocation(node) {
  const docs = [];

  // Add expression
  if (node.expression) {
    docs.push(printNode(node.expression));
    docs.push(".");
  }

  // Add method name
  docs.push(printNode(node.name));

  // Add open brace for method parameters
  docs.push("(");

  // Add method arguments
  docs.push(printNodes(node.arguments));

  // Add close brace for method parameters
  docs.push(")");

  return concat(docs);
}

function printSuperConstructorInvocation(node) {
  const docs = [];

  // Add line
  docs.push(hardline);

  // Add super
  docs.push("super");
  docs.push("(");

  // Add primitive type like void, int, etc.
  docs.push(group(printParameters(node.arguments)));

  docs.push(")");
  docs.push(";");

  return concat(docs);
}

function printSuperMethodInvocation(node) {
  const docs = [];

  // Add super
  docs.push("super");
  docs.push(".");

  // Add name
  docs.push(printNode(node.name));

  // Add type arguments
  if (node.typeArguments && node.typeArguments.length > 0) {
    docs.push("<");
    docs.push(printParameters(node.typeArguments));
    docs.push(">");
  }

  // Add open braces
  docs.push("(");

  // Add arguments
  if (node.arguments && node.arguments.length > 0) {
    docs.push(printParameters(node.arguments));
  }

  // Add close braces
  docs.push(")");

  return concat(docs);
}

function printQualifiedName(node) {
  const docs = [];

  // Add qualifier
  docs.push(printNode(node.qualifier));
  docs.push(".");

  // Add name
  docs.push(printNode(node.name));

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

function printTypeLiteral(node) {
  const docs = [];

  // Add type
  docs.push(printNode(node.type));

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

function printArrayCreation(node) {
  const docs = [];

  // Add new
  docs.push("new");
  docs.push(" ");

  // Modify node if ArrayType to not print braces
  if (node.type.node === "ArrayType") {
    node.type.removeBraces = true;
  }
  // Add type
  docs.push(printNode(node.type));

  // Add dimensions
  if (node.dimensions && node.dimensions.length > 0) {
    node.dimensions.forEach(dimension => {
      // Add open square braces
      docs.push("[");

      // Add dimension
      docs.push(printNode(dimension));

      // Add close square braces
      docs.push("]");
    });
  } else {
    // Just push an empty init of square braces
    docs.push("[]");
  }

  // Add initializer
  if (node.initializer) {
    // Add initialiter
    docs.push(printNode(node.initializer));
  }

  return concat(docs);
}

function printClassInstanceCreation(node) {
  const docs = [];

  // Add new
  docs.push("new");
  docs.push(" ");

  // Add type
  docs.push(printNode(node.type));

  // Add open braces
  docs.push("(");

  // Add arguments
  if (node.arguments && node.arguments.length > 0) {
    docs.push(printParameters(node.arguments));
  }

  // Add close braces
  docs.push(")");

  return concat(docs);
}

function printArrayInitializer(node) {
  const docs = [];

  // Add open curly braces
  docs.push("{");

  // Add expressions
  docs.push(printParameters(node.expressions));

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

function printCastExpression(node) {
  const docs = [];

  // Add open braces
  docs.push("(");

  // Add type
  docs.push(printNode(node.type));

  // Add close braces
  docs.push(")");
  docs.push(" ");

  // Add expression
  docs.push(printNode(node.expression));

  return concat(docs);
}

function printConditionalExpression(node) {
  const docs = [];

  // Add expression
  docs.push(printNode(node.expression));
  docs.push(" ");

  // Add questionmark
  docs.push("?");
  docs.push(" ");

  // Add then expression
  docs.push(printNode(node.thenExpression));
  docs.push(" ");

  // Add colon
  docs.push(":");
  docs.push(" ");

  // Add else expression
  docs.push(printNode(node.elseExpression));

  return concat(docs);
}

function printInfixExpression(node) {
  const docs = [];

  // Add left operand
  docs.push(printNode(node.leftOperand));

  // Add operator
  docs.push(" ");
  docs.push(node.operator);
  docs.push(" ");

  // Add right operand
  docs.push(printNode(node.rightOperand));

  return concat(docs);
}

function printParenthesizedExpression(node) {
  const docs = [];

  // Add open brace
  docs.push("(");

  // Add expression
  docs.push(printNode(node.expression));

  // Add close brace
  docs.push(")");

  return concat(docs);
}

function printPostfixExpression(node) {
  const docs = [];

  // Add operand
  docs.push(printNode(node.operand));

  // Add operator
  docs.push(node.operator);

  return concat(docs);
}

function printPrefixExpression(node) {
  const docs = [];

  // Add operator
  docs.push(node.operator);

  // Add operand
  docs.push(printNode(node.operand));

  return concat(docs);
}

function printVariableDeclarationExpression(node) {
  const docs = [];

  // Add modifiers like public, static, etc.
  docs.push(printModifiers(node.modifiers));

  // Add type
  docs.push(printNode(node.type));
  docs.push(" ");

  // Add fragments
  docs.push(printNodes(node.fragments));

  return concat(docs);
}

function printVariableDeclarationFragment(node) {
  const docs = [];

  // Add name
  docs.push(printNode(node.name));

  // Add initializer
  if (node.initializer) {
    docs.push(" ");
    docs.push("=");
    docs.push(" ");
    docs.push(printNode(node.initializer));
  }

  return concat(docs);
}

function printArrayAccess(node) {
  const docs = [];

  // Add array
  docs.push(printNode(node.array));

  // Add index
  docs.push("[");
  docs.push(printNode(node.index));
  docs.push("]");

  return concat(docs);
}

function printAssignment(node) {
  const docs = [];

  // Add left hand side
  docs.push(printNode(node.leftHandSide));

  // Add operator
  docs.push(" ");
  docs.push(node.operator);
  docs.push(" ");

  // Add right hand side
  docs.push(printNode(node.rightHandSide));

  return concat(docs);
}

function printFieldAccess(node) {
  const docs = [];

  // Add expression
  if (node.expression) {
    docs.push(printNode(node.expression));
    docs.push(".");
  }

  // Add name
  docs.push(printNode(node.name));

  return concat(docs);
}

function printThisExpression() {
  const docs = [];

  docs.push("this");

  return concat(docs);
}

function printMarkerAnnotations(nodes) {
  const docs = [];

  // Add only marker annotations in array
  nodes.forEach(modifier => {
    if (modifier.node === "MarkerAnnotation") {
      docs.push(printMarkerAnnotation(modifier));
    }
  });

  return concat(docs);
}

function printMarkerAnnotation(node) {
  const docs = [];

  // Add type name
  docs.push("@");
  docs.push(printNode(node.typeName));
  docs.push(hardline);

  return concat(docs);
}

function printModifiers(nodes) {
  const docs = [];

  // Add only marker annotations in array
  nodes.forEach(modifier => {
    if (modifier.node === "Modifier") {
      docs.push(printModifier(modifier));
    }
  });

  return concat(docs);
}

function printModifier(node) {
  const docs = [];

  // Add keyword
  docs.push(node.keyword);
  docs.push(" ");

  return concat(docs);
}

function printNode(node) {
  switch (node.node) {
    case "CompilationUnit": {
      return printCompilationUnit(node);
    }
    case "TypeDeclaration": {
      return printTypeDeclaration(node);
    }
    case "EnumDeclaration": {
      return printEnumDeclaration(node);
    }
    case "EnumConstantDeclaration": {
      return printEnumConstantDeclaration(node);
    }
    case "MethodDeclaration": {
      return printMethodDeclaration(node);
    }
    case "Block": {
      return printBlock(node);
    }
    case "EnhancedForStatement": {
      return printEnhancedForStatement(node);
    }
    case "ExpressionStatement": {
      return printExpressionStatement(node);
    }
    case "ForStatement": {
      return printForStatement(node);
    }
    case "IfStatement": {
      return printIfStatement(node);
    }
    case "ReturnStatement": {
      return printReturnStatement(node);
    }
    case "ThrowStatement": {
      return printThrowStatement(node);
    }
    case "VariableDeclarationStatement": {
      return printVariableDeclarationStatement(node);
    }
    case "WhileStatement": {
      return printWhileStatement(node);
    }
    case "FieldDeclaration": {
      return printFieldDeclaration(node);
    }
    case "ImportDeclaration": {
      return printImportDeclaration(node);
    }
    case "PackageDeclaration": {
      return printPackageDeclaration(node);
    }
    case "SingleVariableDeclaration": {
      return printSingleVariableDeclaration(node);
    }
    case "TypeParameter": {
      return printTypeParameter(node);
    }
    case "ArrayType": {
      return printArrayType(node);
    }
    case "ParameterizedType": {
      return printParameterizedType(node);
    }
    case "PrimitiveType": {
      return printPrimitiveType(node);
    }
    case "SimpleType": {
      return printSimpleType(node);
    }
    case "WildcardType": {
      return printWildcardType(node);
    }
    case "ConstructorInvocation": {
      return printConstructorInvocation(node);
    }
    case "MethodInvocation": {
      return printMethodInvocation(node);
    }
    case "SuperConstructorInvocation": {
      return printSuperConstructorInvocation(node);
    }
    case "SuperMethodInvocation": {
      return printSuperMethodInvocation(node);
    }
    case "QualifiedName": {
      return printQualifiedName(node);
    }
    case "BooleanLiteral": {
      return printBooleanLiteral(node);
    }
    case "TypeLiteral": {
      return printTypeLiteral(node);
    }
    case "StringLiteral": {
      return printStringLiteral(node);
    }
    case "NumberLiteral": {
      return printNumberLiteral(node);
    }
    case "NullLiteral": {
      return printNullLiteral(node);
    }
    case "ArrayCreation": {
      return printArrayCreation(node);
    }
    case "ClassInstanceCreation": {
      return printClassInstanceCreation(node);
    }
    case "ArrayInitializer": {
      return printArrayInitializer(node);
    }
    case "SimpleName": {
      return printSimpleName(node);
    }
    case "CastExpression": {
      return printCastExpression(node);
    }
    case "ConditionalExpression": {
      return printConditionalExpression(node);
    }
    case "InfixExpression": {
      return printInfixExpression(node);
    }
    case "ParenthesizedExpression": {
      return printParenthesizedExpression(node);
    }
    case "PostfixExpression": {
      return printPostfixExpression(node);
    }
    case "PrefixExpression": {
      return printPrefixExpression(node);
    }
    case "VariableDeclarationExpression": {
      return printVariableDeclarationExpression(node);
    }
    case "VariableDeclarationFragment": {
      return printVariableDeclarationFragment(node);
    }
    case "ArrayAccess": {
      return printArrayAccess(node);
    }
    case "Assignment": {
      return printAssignment(node);
    }
    case "FieldAccess": {
      return printFieldAccess(node);
    }
    case "ThisExpression": {
      return printThisExpression(node);
    }
    // modifiers
    case "MarkerAnnotation": {
      return printMarkerAnnotation(node);
    }
    case "Modifier": {
      return printModifier(node);
    }
    /* istanbul ignore next */
    default:
      // eslint-disable-next-line no-console
      console.error("Unknown Java node:", node);
      return "";
  }
}

function printNodes(nodes) {
  const docs = [];

  nodes.forEach(node => {
    docs.push(printNode(node));
  });

  return concat(docs);
}

function printParameters(nodes) {
  const docs = [];

  if (nodes.length === 0) {
    return concat(docs);
  }

  docs.push(softline);

  const params = [];
  nodes.forEach(node => {
    params.push(printNode(node));
  });
  docs.push(join(concat([",", line]), params));

  return indent(concat(docs));
}

function genericPrint(path) {
  /* genericPrint(path, options, print) */

  const node = path.getValue();
  return printNode(node);
}

module.exports = genericPrint;
