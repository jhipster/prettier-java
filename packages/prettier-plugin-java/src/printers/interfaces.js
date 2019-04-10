"use strict";
/* eslint-disable no-unused-vars */

const {
  concat,
  join,
  line,
  softline,
  ifBreak,
  group,
  indent,
  hardline,
  dedent
} = require("prettier").doc.builders;
const {
  rejectAndConcat,
  rejectAndJoin,
  sortModifiers
} = require("./printer-utils");

class InterfacesPrettierVisitor {
  interfaceDeclaration(ctx) {
    const modifiers = sortModifiers(ctx.interfaceModifier);
    const firstAnnotations = this.mapVisit(modifiers[0]);
    const otherModifiers = this.mapVisit(modifiers[1]);

    const declaration = ctx.normalInterfaceDeclaration
      ? this.visit(ctx.normalInterfaceDeclaration)
      : this.visit(ctx.annotationTypeDeclaration);

    return rejectAndJoin(hardline, [
      rejectAndJoin(hardline, firstAnnotations),
      rejectAndJoin(" ", [rejectAndJoin(" ", otherModifiers), declaration])
    ]);
  }

  normalInterfaceDeclaration(ctx) {
    const typeIdentifier = this.visit(ctx.typeIdentifier);
    const typeParameters = this.visit(ctx.typeParameters);
    const extendsInterfaces = this.visit(ctx.extendsInterfaces);
    const interfaceBody = this.visit(ctx.interfaceBody);

    let extendsInterfacesPart = "";
    if (extendsInterfaces) {
      extendsInterfacesPart = indent(
        rejectAndConcat([softline, extendsInterfaces])
      );
    }

    return rejectAndJoin(" ", [
      group(
        rejectAndJoin(" ", [
          "interface",
          typeIdentifier,
          typeParameters,
          extendsInterfacesPart
        ])
      ),
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

    return indent(rejectAndJoin(" ", ["extends", interfaceTypeList]));
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
    const modifiers = sortModifiers(ctx.constantModifier);
    const firstAnnotations = this.mapVisit(modifiers[0]);
    const otherModifiers = this.mapVisit(modifiers[1]);

    const unannType = this.visit(ctx.unannType);
    const variableDeclaratorList = this.visit(ctx.variableDeclaratorList);

    return rejectAndJoin(hardline, [
      rejectAndJoin(hardline, firstAnnotations),
      rejectAndJoin(" ", [
        rejectAndJoin(" ", otherModifiers),
        unannType,
        rejectAndConcat([variableDeclaratorList, ";"])
      ])
    ]);
  }

  constantModifier(ctx) {
    if (ctx.annotation) {
      return this.visitSingle(ctx);
    }
    return this.getSingle(ctx).image;
  }

  interfaceMethodDeclaration(ctx) {
    const modifiers = sortModifiers(ctx.interfaceMethodModifier);
    const firstAnnotations = this.mapVisit(modifiers[0]);
    const otherModifiers = this.mapVisit(modifiers[1]);

    const methodHeader = this.visit(ctx.methodHeader);
    const methodBody = this.visit(ctx.methodBody);
    const separator = methodBody === ";" ? "" : " ";

    return rejectAndJoin(hardline, [
      rejectAndJoin(hardline, firstAnnotations),
      rejectAndJoin(" ", [
        rejectAndJoin(" ", otherModifiers),
        rejectAndJoin(separator, [methodHeader, methodBody])
      ])
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
      indent(rejectAndJoin(line, ["{", annotationTypeMemberDeclaration])),
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
    const modifiers = sortModifiers(ctx.annotationTypeElementModifier);
    const firstAnnotations = this.mapVisit(modifiers[0]);
    const otherModifiers = this.mapVisit(modifiers[1]);

    const unannType = this.visit(ctx.unannType);
    const identifier = ctx.Identifier[0].image;
    const dims = this.visit(ctx.dims);
    const defaultValue = ctx.defaultValue
      ? concat([" ", this.visit(ctx.defaultValue)])
      : "";

    return rejectAndJoin(hardline, [
      rejectAndJoin(hardline, firstAnnotations),
      rejectAndJoin(" ", [
        rejectAndJoin(" ", otherModifiers),
        unannType,
        rejectAndConcat([identifier, "()", dims, defaultValue, ";"])
      ])
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
      annoArgs.push(dedent(concat([softline, ")"])));
    }

    return group(
      rejectAndConcat(["@", fqn, indent(rejectAndConcat(annoArgs))])
    );
  }

  elementValuePairList(ctx) {
    const elementValuePairs = this.mapVisit(ctx.elementValuePair);

    return group(
      rejectAndConcat([
        softline,
        rejectAndJoin(rejectAndConcat([",", line]), elementValuePairs)
      ])
    );
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

    return group(
      rejectAndConcat([
        "{",
        indent(rejectAndConcat([line, elementValueList, comma])),
        line,
        "}"
      ])
    );
  }

  elementValueList(ctx) {
    const elementValues = this.mapVisit(ctx.elementValue);

    return group(
      rejectAndConcat([
        rejectAndJoin(rejectAndConcat([",", line]), elementValues)
      ])
    );
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
