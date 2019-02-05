"use strict";
/* eslint-disable no-unused-vars */
const {
  concat,
  join,
  line,
  ifBreak,
  group,
  indent,
  dedent
} = require("prettier").doc.builders;
const { rejectAndJoin } = require("./printer-utils");

class ClassesPrettierVisitor {
  classDeclaration(ctx) {
    const modifiers = this.mapVisit(ctx.classModifier);

    const classCST = ctx.normalClassDeclaration
      ? ctx.normalClassDeclaration
      : ctx.enumDeclaration;
    const classDoc = this.visit(classCST);

    const modifierSpace = modifiers.length > 0 ? " " : "";
    return concat([join(" ", modifiers), modifierSpace, classDoc]);
  }

  normalClassDeclaration(ctx) {
    const name = this.visit(ctx.typeIdentifier);
    const typeParams = this.visit(ctx.typeParameters);
    const superClasses = this.visit(ctx.superclass);
    const superInterfaces = this.visit(ctx.superinterfaces);
    const body = this.visit(ctx.classBody);

    return rejectAndJoin(" ", [
      "class",
      name,
      typeParams,
      superClasses,
      superInterfaces,
      body
    ]);
  }

  classModifier(ctx) {
    if (ctx.annotation) {
      return this.visit(ctx.annotation);
    }
    // public | protected | private | ...
    return this.getSingle(ctx).image;
  }

  typeParameters(ctx) {
    return "TBD";
  }

  typeParameterList(ctx) {
    return "typeParameterList";
  }

  superclass(ctx) {
    return "TBD";
  }

  superinterfaces(ctx) {
    return "TBD";
  }

  interfaceTypeList(ctx) {
    return "interfaceTypeList";
  }

  classBody(ctx) {
    const classBodyDecls = this.mapVisit(ctx.classBodyDeclaration);
    return concat([
      "{",
      indent(concat([line, join(line, classBodyDecls)])),
      line,
      "}"
    ]);
  }

  classBodyDeclaration(ctx) {
    return this.visitSingle(ctx);
  }

  classMemberDeclaration(ctx) {
    return this.visitSingle(ctx);
  }

  fieldDeclaration(ctx) {
    return "fieldDeclaration";
  }

  fieldModifier(ctx) {
    return "fieldModifier";
  }

  variableDeclaratorList(ctx) {
    return "variableDeclaratorList";
  }

  variableDeclarator(ctx) {
    return "variableDeclarator";
  }

  variableDeclaratorId(ctx) {
    return "variableDeclaratorId";
  }

  variableInitializer(ctx) {
    return "variableInitializer";
  }

  unannType(ctx) {
    return "unannType";
  }

  unannPrimitiveType(ctx) {
    return "unannPrimitiveType";
  }

  unannReferenceType(ctx) {
    return "unannReferenceType";
  }

  unannClassOrInterfaceType(ctx) {
    return "unannClassOrInterfaceType";
  }

  unannClassType(ctx) {
    return "unannClassType";
  }

  unannInterfaceType(ctx) {
    return "unannInterfaceType";
  }

  unannTypeVariable(ctx) {
    return "unannTypeVariable";
  }

  methodDeclaration(ctx) {
    const modifiers = this.mapVisit(ctx.methodModifier);
    const header = this.visit(ctx.methodHeader);
    const body = this.visit(ctx.methodBody);

    return concat([rejectAndJoin(" ", modifiers), " ", header, " ", body]);
  }

  methodModifier(ctx) {
    if (ctx.annotation) {
      return this.visit(ctx.annotation);
    }
    // public | protected | private | Synchronized | ...
    return this.getSingle(ctx).image;
  }

  methodHeader(ctx) {
    const typeParameters = this.visit(ctx.typeParameters);
    const annotations = this.mapVisit(ctx.annotation);
    const result = this.visit(ctx.result);
    const declarator = this.visit(ctx.methodDeclarator);
    const throws = this.visit(ctx.throws);

    return concat([
      rejectAndJoin(" ", [
        typeParameters,
        join(line, annotations),
        result,
        declarator,
        throws
      ])
    ]);
  }

  result(ctx) {
    return "result";
  }

  methodDeclarator(ctx) {
    return "methodDeclarator";
  }

  receiverParameter(ctx) {
    return "receiverParameter";
  }

  formalParameterList(ctx) {
    return "formalParameterList";
  }

  formalParameter(ctx) {
    return "formalParameter";
  }

  variableParaRegularParameter(ctx) {
    return "variableParaRegularParameter";
  }

  variableArityParameter(ctx) {
    return "variableArityParameter";
  }

  variableModifier(ctx) {
    return "variableModifier";
  }

  throws(ctx) {
    return "throws";
  }

  exceptionTypeList(ctx) {
    return "exceptionTypeList";
  }

  exceptionType(ctx) {
    return "exceptionType";
  }

  methodBody(ctx) {
    return "methodBody";
  }

  instanceInitializer(ctx) {
    return "instanceInitializer";
  }

  staticInitializer(ctx) {
    return "staticInitializer";
  }

  constructorDeclaration(ctx) {
    return "constructorDeclaration";
  }

  constructorModifier(ctx) {
    return "constructorModifier";
  }

  constructorDeclarator(ctx) {
    return "constructorDeclarator";
  }

  simpleTypeName(ctx) {
    return "simpleTypeName";
  }

  constructorBody(ctx) {
    return "constructorBody";
  }

  explicitConstructorInvocation(ctx) {
    return "explicitConstructorInvocation";
  }

  unqualifiedExplicitConstructorInvocation(ctx) {
    return "unqualifiedExplicitConstructorInvocation";
  }

  qualifiedExplicitConstructorInvocation(ctx) {
    return "qualifiedExplicitConstructorInvocation";
  }

  enumDeclaration(ctx) {
    return "enumDeclaration";
  }

  enumBody(ctx) {
    return "enumBody";
  }

  enumConstantList(ctx) {
    return "enumConstantList";
  }

  enumConstant(ctx) {
    return "enumConstant";
  }

  enumConstantModifier(ctx) {
    return "enumConstantModifier";
  }

  enumBodyDeclarations(ctx) {
    return "enumBodyDeclarations";
  }

  isClassDeclaration(ctx) {
    return "isClassDeclaration";
  }

  identifyClassBodyDeclarationType(ctx) {
    return "identifyClassBodyDeclarationType";
  }
}

module.exports = {
  ClassesPrettierVisitor
};
