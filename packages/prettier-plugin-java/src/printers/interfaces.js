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
  sortModifiers,
  getImageWithComments,
  rejectAndJoinSepToken
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
          getImageWithComments(ctx.Interface[0]),
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
    return getImageWithComments(this.getSingle(ctx));
  }

  extendsInterfaces(ctx) {
    const interfaceTypeList = this.visit(ctx.interfaceTypeList);

    return indent(
      rejectAndJoin(" ", [
        getImageWithComments(ctx.Extends[0]),
        interfaceTypeList
      ])
    );
  }

  interfaceBody(ctx) {
    const interfaceMemberDeclaration = this.mapVisit(
      ctx.interfaceMemberDeclaration
    );

    return rejectAndConcat([
      getImageWithComments(ctx.LCurly[0]),
      indent(
        rejectAndConcat([line, rejectAndJoin(line, interfaceMemberDeclaration)])
      ),
      line,
      getImageWithComments(ctx.RCurly[0])
    ]);
  }

  interfaceMemberDeclaration(ctx) {
    if (ctx.Semicolon) {
      return getImageWithComments(this.getSingle(ctx));
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
        rejectAndConcat([
          variableDeclaratorList,
          getImageWithComments(ctx.Semicolon[0])
        ])
      ])
    ]);
  }

  constantModifier(ctx) {
    if (ctx.annotation) {
      return this.visitSingle(ctx);
    }
    return getImageWithComments(this.getSingle(ctx));
  }

  interfaceMethodDeclaration(ctx) {
    const modifiers = sortModifiers(ctx.interfaceMethodModifier);
    const firstAnnotations = this.mapVisit(modifiers[0]);
    const otherModifiers = this.mapVisit(modifiers[1]);

    const methodHeader = this.visit(ctx.methodHeader);
    const methodBody = this.visit(ctx.methodBody);
    const separator =
      (methodBody === ";") | ((methodBody.parts && methodBody.parts[0]) === ";")
        ? ""
        : " ";

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
    return getImageWithComments(this.getSingle(ctx));
  }

  annotationTypeDeclaration(ctx) {
    const typeIdentifier = this.visit(ctx.typeIdentifier);
    const annotationTypeBody = this.visit(ctx.annotationTypeBody);

    return rejectAndJoin(" ", [
      concat([
        getImageWithComments(ctx.At[0]),
        getImageWithComments(ctx.Interface[0])
      ]),
      typeIdentifier,
      annotationTypeBody
    ]);
  }

  annotationTypeBody(ctx) {
    const annotationTypeMemberDeclaration = this.visit(
      ctx.annotationTypeMemberDeclaration
    );

    return rejectAndJoin(line, [
      indent(
        rejectAndJoin(line, [
          getImageWithComments(ctx.LCurly[0]),
          annotationTypeMemberDeclaration
        ])
      ),
      getImageWithComments(ctx.RCurly[0])
    ]);
  }

  annotationTypeMemberDeclaration(ctx) {
    if (ctx.Semicolon) {
      return getImageWithComments(this.getSingle(ctx));
    }
    return this.visitSingle(ctx);
  }

  annotationTypeElementDeclaration(ctx) {
    const modifiers = sortModifiers(ctx.annotationTypeElementModifier);
    const firstAnnotations = this.mapVisit(modifiers[0]);
    const otherModifiers = this.mapVisit(modifiers[1]);

    const unannType = this.visit(ctx.unannType);
    const identifier = getImageWithComments(ctx.Identifier[0]);
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
          concat([
            getImageWithComments(ctx.LBrace[0]),
            getImageWithComments(ctx.RBrace[0])
          ]),
          dims,
          defaultValue,
          getImageWithComments(ctx.Semicolon[0])
        ])
      ])
    ]);
  }

  annotationTypeElementModifier(ctx) {
    if (ctx.annotation) {
      return this.visitSingle(ctx);
    }
    return getImageWithComments(this.getSingle(ctx));
  }

  defaultValue(ctx) {
    const elementValue = this.visit(ctx.elementValue);

    return rejectAndJoin(" ", [
      getImageWithComments(ctx.Default[0]),
      elementValue
    ]);
  }

  annotation(ctx) {
    const fqn = this.visit(ctx.typeName);

    const annoArgs = [];
    if (ctx.LBrace) {
      annoArgs.push(getImageWithComments(ctx.LBrace[0]));
      if (ctx.elementValuePairList) {
        annoArgs.push(this.visit(ctx.elementValuePairList));
      } else if (ctx.elementValue) {
        annoArgs.push(this.visit(ctx.elementValue));
      }
      annoArgs.push(
        dedent(concat([softline, getImageWithComments(ctx.RBrace[0])]))
      );
    }

    return group(
      rejectAndConcat([
        getImageWithComments(ctx.At[0]),
        fqn,
        indent(rejectAndConcat(annoArgs))
      ])
    );
  }

  elementValuePairList(ctx) {
    const elementValuePairs = this.mapVisit(ctx.elementValuePair);

    return group(
      rejectAndConcat([
        softline,
        rejectAndJoinSepToken(ctx.Comma, elementValuePairs, line)
      ])
    );
  }

  elementValuePair(ctx) {
    const identifier = getImageWithComments(ctx.Identifier[0]);
    const elementValue = this.visit(ctx.elementValue);

    return rejectAndJoin(" ", [
      identifier,
      getImageWithComments(ctx.Equals[0]),
      elementValue
    ]);
  }

  elementValue(ctx) {
    return this.visitSingle(ctx);
  }

  elementValueArrayInitializer(ctx) {
    const elementValueList = this.visit(ctx.elementValueList);
    const comma = ctx.Comma ? getImageWithComments(ctx.Comma[0]) : "";

    return group(
      rejectAndConcat([
        getImageWithComments(ctx.LCurly[0]),
        indent(rejectAndConcat([line, elementValueList, comma])),
        line,
        getImageWithComments(ctx.RCurly[0])
      ])
    );
  }

  elementValueList(ctx) {
    const elementValues = this.mapVisit(ctx.elementValue);

    return group(
      rejectAndConcat([rejectAndJoinSepToken(ctx.Comma, elementValues, line)])
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
