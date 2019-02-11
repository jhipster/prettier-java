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

    return join("", [
      join(" ", fieldModifiers),
      " ",
      unannType,
      " ",
      variableDeclaratorList,
      ";"
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
    const variableDeclaratorId = this.visit(ctx.variableDeclaratorId);
    if (ctx.Equals) {
      const variableInitializer = this.visit(ctx.variableInitializer);
      return join(" ", [variableDeclaratorId, "=", variableInitializer]);
    }
    return variableDeclaratorId;
  }

  variableDeclaratorId(ctx) {
    const identifier = ctx.Identifier[0].image;
    const dims = this.visit(ctx.dims);

    return rejectAndJoin("", [identifier, dims]);
  }

  variableInitializer(ctx) {
    return this.visitSingle(ctx);
  }

  unannType(ctx) {
    return this.visitSingle(ctx);
  }

  unannPrimitiveType(ctx) {
    if (ctx.numericType) {
      return this.visitSingle(ctx);
    }
    return this.getSingle(ctx).image;
  }

  unannReferenceType(ctx) {
    const type = ctx.unannPrimitiveType
      ? this.visit(ctx.unannPrimitiveType)
      : this.visit(ctx.unannClassOrInterfaceType);

    const dims = this.visit(ctx.dims);

    return rejectAndJoin("", [type, dims]);
  }

  unannClassOrInterfaceType(ctx) {
    return this.visit(ctx.unannClassType);
  }

  unannClassType(ctx) {
    return "unannClassType";
  }

  unannInterfaceType(ctx) {
    return this.visit(ctx.unannClassType);
  }

  unannTypeVariable(ctx) {
    return this.getSingle(ctx).image;
  }

  methodDeclaration(ctx) {
    const modifiers = this.mapVisit(ctx.methodModifier);
    const header = this.visit(ctx.methodHeader);
    const body = this.visit(ctx.methodBody);

    return concat([rejectAndJoin(" ", modifiers), header, " ", body]);
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
    if (ctx.unannType) {
      return this.visit(ctx.unannType);
    }
    // void
    return this.getSingle(ctx).image;
  }

  methodDeclarator(ctx) {
    const identifier = ctx.Identifier[0].image;
    const receiverParameter = this.visit(ctx.receiverParameter);
    const separator = receiverParameter ? ", " : "";
    const formalParameterList = this.visit(ctx.formalParameterList);
    const dims = this.visit(ctx.dims);

    return rejectAndJoin("", [
      identifier,
      "(",
      receiverParameter,
      separator,
      formalParameterList,
      ")",
      dims
    ]);
  }

  receiverParameter(ctx) {
    const annotations = this.mapVisit(ctx.annotation);
    const unannType = this.visit(ctx.unannType);
    const identifier = ctx.Identifier
      ? concat([ctx.Identifier[0].image, "."])
      : "";

    return rejectAndJoin("", [
      join(" ", annotations),
      unannType,
      identifier,
      "this"
    ]);
  }

  formalParameterList(ctx) {
    const formalParameter = this.mapVisit(ctx.formalParameter);
    return join(", ", formalParameter);
  }

  formalParameter(ctx) {
    return this.visitSingle(ctx);
  }

  variableParaRegularParameter(ctx) {
    const variableModifier = this.mapVisit(ctx.variableModifier);
    const unannType = this.visit(ctx.unannType);
    const variableDeclaratorId = this.visit(ctx.variableDeclaratorId);

    return rejectAndJoin(" ", [
      join(" ", variableModifier),
      unannType,
      variableDeclaratorId
    ]);
  }

  variableArityParameter(ctx) {
    const variableModifier = this.mapVisit(ctx.variableModifier);
    const unannType = this.visit(ctx.unannType);
    const annotation = this.mapVisit(ctx.annotation);
    const identifier = ctx.Identifier[0].image;

    return rejectAndJoin("", [
      join(" ", variableModifier),
      unannType,
      join(" ", annotation),
      "...",
      identifier
    ]);
  }

  variableModifier(ctx) {
    if (ctx.annotation) {
      return this.visit(ctx.annotation);
    }
    return this.getSingle(ctx).image;
  }

  throws(ctx) {
    const exceptionTypeList = this.visit(ctx.exceptionTypeList);
    return join(" ", ["throws", exceptionTypeList]);
  }

  exceptionTypeList(ctx) {
    const exceptionTypes = this.mapVisit(ctx.exceptionType);
    return join(", ", exceptionTypes);
  }

  exceptionType(ctx) {
    return this.visitSingle(ctx);
  }

  methodBody(ctx) {
    if (ctx.block) {
      return this.visit(ctx.block);
    }

    return this.getSingle(ctx).image;
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
