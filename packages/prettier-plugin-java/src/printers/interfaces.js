"use strict";
/* eslint-disable no-unused-vars */

const {
  concat,
  join,
  line,
  ifBreak,
  group,
  indent
} = require("prettier").doc.builders;
const { rejectAndConcat, rejectAndJoin } = require("./printer-utils");

class InterfacesPrettierVisitor {
  interfaceDeclaration(ctx) {
    const interfaceModifiers = this.mapVisit(ctx.interfaceModifier);
    const declaration = ctx.normalInterfaceDeclaration
      ? this.visit(ctx.normalInterfaceDeclaration)
      : this.visit(ctx.annotationTypeDeclaration);

    return rejectAndJoin(" ", [
      rejectAndJoin(" ", interfaceModifiers),
      declaration
    ]);
  }

  normalInterfaceDeclaration(ctx) {
    const typeIdentifier = this.visit(ctx.typeIdentifier);
    const typeParameters = this.visit(ctx.typeParameters);
    const extendsInterfaces = this.visit(ctx.extendsInterfaces);
    const interfaceBody = this.visit(ctx.interfaceBody);

    return rejectAndJoin(" ", [
      "interface",
      typeIdentifier,
      typeParameters,
      extendsInterfaces,
      interfaceBody
    ]);
  }

  interfaceModifier(ctx) {
    if (ctx.annotation) {
      return this.visitSingle(ctx);
    }
    return this.getSingle(ctx).image;
  }

  extendsInterfaces(ctx) {
    const interfaceTypeList = this.visit(ctx.interfaceTypeList);

    return rejectAndJoin(" ", ["extends", interfaceTypeList]);
  }

  interfaceBody(ctx) {
    const interfaceMemberDeclaration = this.mapVisit(
      ctx.interfaceMemberDeclaration
    );

    return rejectAndConcat([
      "{",
      indent(
        rejectAndConcat([line, rejectAndJoin(line, interfaceMemberDeclaration)])
      ),
      line,
      "}"
    ]);
  }

  interfaceMemberDeclaration(ctx) {
    if (ctx.Semicolon) {
      return this.getSingle(ctx).image;
    }
    return this.visitSingle(ctx);
  }

  constantDeclaration(ctx) {
    const constantModifiers = this.mapVisit(ctx.constantModifier);
    const unannType = this.visit(ctx.unannType);
    const variableDeclaratorList = this.visit(ctx.variableDeclaratorList);

    return rejectAndJoin(" ", [
      rejectAndJoin(" ", constantModifiers),
      unannType,
      rejectAndConcat([variableDeclaratorList, ";"])
    ]);
  }

  constantModifier(ctx) {
    if (ctx.annotation) {
      return this.visitSingle(ctx);
    }
    return this.getSingle(ctx).image;
  }

  interfaceMethodDeclaration(ctx) {
    const interfaceMethodModifiers = this.mapVisit(ctx.interfaceMethodModifier);
    const methodHeader = this.visit(ctx.methodHeader);
    const methodBody = this.visit(ctx.methodBody);

    return rejectAndJoin(" ", [
      rejectAndJoin(" ", interfaceMethodModifiers),
      methodHeader,
      methodBody
    ]);
  }

  interfaceMethodModifier(ctx) {
    if (ctx.annotation) {
      return this.visitSingle(ctx);
    }
    return this.getSingle(ctx).image;
  }

  annotationTypeDeclaration(ctx) {
    const typeIdentifier = this.visit(ctx.typeIdentifier);
    const annotationTypeBody = this.visit(ctx.annotationTypeBody);

    return rejectAndJoin(" ", [
      "@interface",
      typeIdentifier,
      annotationTypeBody
    ]);
  }

  annotationTypeBody(ctx) {
    const annotationTypeMemberDeclaration = this.visit(
      ctx.annotationTypeMemberDeclaration
    );

    return rejectAndJoin(line, [
      rejectAndJoin(line, ["{", annotationTypeMemberDeclaration]),
      "}"
    ]);
  }

  annotationTypeMemberDeclaration(ctx) {
    if (ctx.Semicolon) {
      return this.getSingle(ctx).image;
    }
    return this.visitSingle(ctx);
  }

  annotationTypeElementDeclaration(ctx) {
    const annotationTypeElementModifiers = this.mapVisit(
      ctx.annotationTypeElementModifier
    );
    const unannType = this.visit(ctx.unannType);
    const identifier = ctx.Identifier[0].image;
    const dims = this.visit(ctx.dims);
    const defaultValue = this.visit(ctx.defaultValue);

    return rejectAndJoin(" ", [
      rejectAndJoin(" ", annotationTypeElementModifiers),
      unannType,
      rejectAndConcat([identifier, dims]),
      defaultValue
    ]);
  }

  annotationTypeElementModifier(ctx) {
    if (ctx.annotation) {
      return this.visitSingle(ctx);
    }
    return this.getSingle(ctx).image;
  }

  defaultValue(ctx) {
    const elementValue = this.visit(ctx.elementValue);

    return rejectAndJoin(" ", ["default", elementValue]);
  }

  annotation(ctx) {
    const fqn = this.visit(ctx.typeName);

    const annoArgs = [];
    if (ctx.LBrace) {
      annoArgs.push("(");
      if (ctx.elementValuePairList) {
        annoArgs.push(this.visit(ctx.elementValuePairList));
      } else if (ctx.elementValue) {
        annoArgs.push(this.visit(ctx.elementValue));
      }
      annoArgs.push(")");
    }

    return concat(["@", fqn, concat(annoArgs)]);
  }

  elementValuePairList(ctx) {
    const elementValuePairs = this.mapVisit(ctx.elementValuePair);

    return rejectAndJoin(", ", elementValuePairs);
  }

  elementValuePair(ctx) {
    const identifier = ctx.Identifier[0].image;
    const elementValue = this.visit(ctx.elementValue);

    return rejectAndJoin(" ", [identifier, "=", elementValue]);
  }

  elementValue(ctx) {
    return this.visitSingle(ctx);
  }

  elementValueArrayInitializer(ctx) {
    const elementValueList = this.visit(ctx.elementValueList);
    const comma = ctx.Comma ? "," : "";

    return rejectAndJoin(" ", [
      "{",
      rejectAndConcat([elementValueList, comma]),
      "}"
    ]);
  }

  elementValueList(ctx) {
    const elementValues = this.mapVisit(ctx.elementValue);

    return rejectAndJoin(", ", elementValues);
  }

  identifyInterfaceBodyDeclarationType(ctx) {
    return "identifyInterfaceBodyDeclarationType";
  }

  identifyAnnotationBodyDeclarationType(ctx) {
    return "identifyAnnotationBodyDeclarationType";
  }

  isSimpleElementValueAnnotation(ctx) {
    return "isSimpleElementValueAnnotation";
  }
}

module.exports = {
  InterfacesPrettierVisitor
};
