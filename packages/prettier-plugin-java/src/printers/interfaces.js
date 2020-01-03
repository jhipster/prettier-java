"use strict";

const { line, softline, hardline } = require("prettier").doc.builders;
const { concat, group, indent } = require("./prettier-builder");
const { printTokenWithComments } = require("./comments/format-comments");
const {
  rejectAndConcat,
  rejectAndJoin,
  sortModifiers,
  rejectAndJoinSeps,
  getInterfaceBodyDeclarationsSeparator,
  putIntoBraces,
  displaySemicolon,
  isStatementEmptyStatement,
  printArrayList
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
          ctx.Interface[0],
          concat([typeIdentifier, typeParameters]),
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
    return printTokenWithComments(this.getSingle(ctx));
  }

  extendsInterfaces(ctx) {
    const interfaceTypeList = this.visit(ctx.interfaceTypeList);

    return group(
      rejectAndConcat([
        ctx.Extends[0],
        indent(rejectAndConcat([line, interfaceTypeList]))
      ])
    );
  }

  interfaceBody(ctx) {
    let joinedInterfaceMemberDeclaration = "";

    if (ctx.interfaceMemberDeclaration !== undefined) {
      const interfaceMemberDeclaration = this.mapVisit(
        ctx.interfaceMemberDeclaration
      );

      const separators = getInterfaceBodyDeclarationsSeparator(
        ctx.interfaceMemberDeclaration
      );

      joinedInterfaceMemberDeclaration = rejectAndJoinSeps(
        separators,
        interfaceMemberDeclaration
      );
    }
    return putIntoBraces(
      joinedInterfaceMemberDeclaration,
      hardline,
      ctx.LCurly[0],
      ctx.RCurly[0]
    );
  }

  interfaceMemberDeclaration(ctx) {
    if (ctx.Semicolon) {
      return displaySemicolon(ctx.Semicolon[0]);
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
        rejectAndConcat([variableDeclaratorList, ctx.Semicolon[0]])
      ])
    ]);
  }

  constantModifier(ctx) {
    if (ctx.annotation) {
      return this.visitSingle(ctx);
    }
    return printTokenWithComments(this.getSingle(ctx));
  }

  interfaceMethodDeclaration(ctx) {
    const modifiers = sortModifiers(ctx.interfaceMethodModifier);
    const firstAnnotations = this.mapVisit(modifiers[0]);
    const otherModifiers = this.mapVisit(modifiers[1]);

    const methodHeader = this.visit(ctx.methodHeader);
    const methodBody = this.visit(ctx.methodBody);
    const separator = isStatementEmptyStatement(methodBody) ? "" : " ";

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
    return printTokenWithComments(this.getSingle(ctx));
  }

  annotationTypeDeclaration(ctx) {
    const typeIdentifier = this.visit(ctx.typeIdentifier);
    const annotationTypeBody = this.visit(ctx.annotationTypeBody);

    return rejectAndJoin(" ", [
      concat([ctx.At[0], ctx.Interface[0]]),
      typeIdentifier,
      annotationTypeBody
    ]);
  }

  annotationTypeBody(ctx) {
    const annotationTypeMemberDeclaration = this.mapVisit(
      ctx.annotationTypeMemberDeclaration
    );

    return rejectAndJoin(line, [
      indent(
        rejectAndJoin(line, [
          ctx.LCurly[0],
          rejectAndJoin(concat([line, line]), annotationTypeMemberDeclaration)
        ])
      ),
      ctx.RCurly[0]
    ]);
  }

  annotationTypeMemberDeclaration(ctx) {
    if (ctx.Semicolon) {
      return printTokenWithComments(this.getSingle(ctx));
    }
    return this.visitSingle(ctx);
  }

  annotationTypeElementDeclaration(ctx) {
    const modifiers = sortModifiers(ctx.annotationTypeElementModifier);
    const firstAnnotations = this.mapVisit(modifiers[0]);
    const otherModifiers = this.mapVisit(modifiers[1]);

    const unannType = this.visit(ctx.unannType);
    const identifier = ctx.Identifier[0];
    const dims = this.visit(ctx.dims);
    const defaultValue = ctx.defaultValue
      ? concat([" ", this.visit(ctx.defaultValue)])
      : "";

    return rejectAndJoin(hardline, [
      rejectAndJoin(hardline, firstAnnotations),
      rejectAndJoin(" ", [
        rejectAndJoin(" ", otherModifiers),
        unannType,
        rejectAndConcat([
          identifier,
          concat([ctx.LBrace[0], ctx.RBrace[0]]),
          dims,
          defaultValue,
          ctx.Semicolon[0]
        ])
      ])
    ]);
  }

  annotationTypeElementModifier(ctx) {
    if (ctx.annotation) {
      return this.visitSingle(ctx);
    }
    return printTokenWithComments(this.getSingle(ctx));
  }

  defaultValue(ctx) {
    const elementValue = this.visit(ctx.elementValue);

    return rejectAndJoin(" ", [ctx.Default[0], elementValue]);
  }

  annotation(ctx) {
    const fqn = this.visit(ctx.typeName);

    let annoArgs = "";
    if (ctx.LBrace) {
      if (ctx.elementValuePairList) {
        annoArgs = putIntoBraces(
          this.visit(ctx.elementValuePairList),
          softline,
          ctx.LBrace[0],
          ctx.RBrace[0]
        );
      } else if (ctx.elementValue) {
        annoArgs = putIntoBraces(
          this.visit(ctx.elementValue),
          softline,
          ctx.LBrace[0],
          ctx.RBrace[0]
        );
      }
    }

    return group(rejectAndConcat([ctx.At[0], fqn, annoArgs]));
  }

  elementValuePairList(ctx) {
    const elementValuePairs = this.mapVisit(ctx.elementValuePair);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, line])) : [];

    return rejectAndJoinSeps(commas, elementValuePairs);
  }

  elementValuePair(ctx) {
    const identifier = ctx.Identifier[0];
    const elementValue = this.visit(ctx.elementValue);

    return rejectAndJoin(" ", [identifier, ctx.Equals[0], elementValue]);
  }

  elementValue(ctx) {
    return this.visitSingle(ctx);
  }

  elementValueArrayInitializer(ctx) {
    const elementValueList = this.visit(ctx.elementValueList);

    return printArrayList({
      list: elementValueList,
      extraComma: ctx.Comma,
      LCurly: ctx.LCurly[0],
      RCurly: ctx.RCurly[0],
      trailingComma: this.prettierOptions.trailingComma
    });
  }

  elementValueList(ctx) {
    const elementValues = this.mapVisit(ctx.elementValue);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, line])) : [];

    return group(rejectAndConcat([rejectAndJoinSeps(commas, elementValues)]));
  }

  identifyInterfaceBodyDeclarationType() {
    return "identifyInterfaceBodyDeclarationType";
  }

  identifyAnnotationBodyDeclarationType() {
    return "identifyAnnotationBodyDeclarationType";
  }

  isSimpleElementValueAnnotation() {
    return "isSimpleElementValueAnnotation";
  }
}

module.exports = {
  InterfacesPrettierVisitor
};
