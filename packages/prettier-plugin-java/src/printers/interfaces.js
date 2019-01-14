"use strict";
/* eslint-disable no-unused-vars */

const { concat, join, line, ifBreak, group } = require("prettier").doc.builders;

class InterfacesPrettierVisitor {
  interfaceDeclaration(ctx) {
    return "interfaceDeclaration";
  }

  normalInterfaceDeclaration(ctx) {
    return "normalInterfaceDeclaration";
  }

  interfaceModifier(ctx) {
    return "interfaceModifier";
  }

  extendsInterfaces(ctx) {
    return "extendsInterfaces";
  }

  interfaceBody(ctx) {
    return "interfaceBody";
  }

  interfaceMemberDeclaration(ctx) {
    return "interfaceMemberDeclaration";
  }

  constantDeclaration(ctx) {
    return "constantDeclaration";
  }

  constantModifier(ctx) {
    return "constantModifier";
  }

  interfaceMethodDeclaration(ctx) {
    return "interfaceMethodDeclaration";
  }

  interfaceMethodModifier(ctx) {
    return "interfaceMethodModifier";
  }

  annotationTypeDeclaration(ctx) {
    return "annotationTypeDeclaration";
  }

  annotationTypeBody(ctx) {
    return "annotationTypeBody";
  }

  annotationTypeMemberDeclaration(ctx) {
    return "annotationTypeMemberDeclaration";
  }

  annotationTypeElementDeclaration(ctx) {
    return "annotationTypeElementDeclaration";
  }

  annotationTypeElementModifier(ctx) {
    return "annotationTypeElementModifier";
  }

  defaultValue(ctx) {
    return "defaultValue";
  }

  annotation(ctx) {
    const fqn = this.visit(ctx.typeName);

    const annoArgs = [];
    if (ctx.LBrace) {
      annoArgs.push("(");
      if (ctx.elementValuePair) {
        annoArgs.push(this.visit(ctx.elementValuePair));
      } else if (ctx.elementValue) {
        annoArgs.push(this.visit(ctx.elementValue));
      }
      annoArgs.push(")");
    }

    return concat(["@", fqn, concat(annoArgs), line]);
  }

  elementValuePairList(ctx) {
    return "elementValuePairList";
  }

  elementValuePair(ctx) {
    return "TBD";
  }

  elementValue(ctx) {
    return "TBD";
  }

  elementValueArrayInitializer(ctx) {
    return "elementValueArrayInitializer";
  }

  elementValueList(ctx) {
    return "elementValueList";
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
