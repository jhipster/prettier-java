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
    const typeParameterList = this.visit(ctx.typeParameterList);

    return rejectAndJoin("", ["<", typeParameterList, ">"]);
  }

  typeParameterList(ctx) {
    const typeParameter = this.mapVisit(ctx.typeParameter);
    const typeParameterSep = typeParameter.length > 0 ? ", " : "";

    return join(typeParameterSep, typeParameter);
  }

  superclass(ctx) {
    return join(" ", ["extends", this.visit(ctx.classType)]);
  }

  superinterfaces(ctx) {
    const interfaceTypeList = this.visit(ctx.interfaceTypeList);
    return join(" ", ["implements", interfaceTypeList]);
  }

  interfaceTypeList(ctx) {
    const interfaceType = this.mapVisit(ctx.interfaceType);
    const interfaceTypeSep = interfaceType.length > 0 ? ", " : "";

    return join(interfaceTypeSep, interfaceType);
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
    const fieldModifiers = this.mapVisit(ctx.fieldModifier);
    const unannType = this.visit(ctx.unannType);
    const variableDeclaratorList = this.visit(ctx.variableDeclaratorList);

    return rejectAndJoin("", [
      fieldModifiers,
      unannType,
      variableDeclaratorList
    ]);
  }

  fieldModifier(ctx) {
    if (ctx.annotation) {
      return this.visit(ctx.annotation);
    }
    // public | protected | private | ...
    return this.getSingle(ctx).image;
  }

  variableDeclaratorList(ctx) {
    const variableDeclarators = this.mapVisit(ctx.variableDeclarator);
    const variableDeclaratorsSep = variableDeclarators.length > 0 ? ", " : "";

    return join(variableDeclaratorsSep, variableDeclarators);
  }

  variableDeclarator(ctx) {
    return "variableDeclarator";
  }

  variableDeclaratorId(ctx) {
    return "variableDeclaratorId";
  }

  variableInitializer(ctx) {
    const variableInit = ctx.expression ? ctx.expression : ctx.arrayInitializer;

    return this.visit(variableInit);
  }

  unannType(ctx) {
    const type = ctx.unannPrimitiveType
      ? ctx.unannPrimitiveType
      : ctx.unannReferenceType;

    return this.visit(type);
  }

  unannPrimitiveType(ctx) {
    const type = ctx.numericType ? ctx.numericType : ctx.boolean;

    return this.visit(type);
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
