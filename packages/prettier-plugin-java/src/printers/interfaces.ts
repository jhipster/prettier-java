import { concat, group, indent } from "./prettier-builder";
import { printTokenWithComments } from "./comments/format-comments";
import {
  displaySemicolon,
  getInterfaceBodyDeclarationsSeparator,
  isStatementEmptyStatement,
  printArrayList,
  putIntoBraces,
  rejectAndConcat,
  rejectAndJoin,
  rejectAndJoinSeps,
  sortModifiers
} from "./printer-utils";

import { builders } from "prettier/doc";
import { BaseCstPrettierPrinter } from "../base-cst-printer";
import {
  AnnotationCtx,
  AnnotationTypeBodyCtx,
  AnnotationTypeDeclarationCtx,
  AnnotationTypeElementDeclarationCtx,
  AnnotationTypeElementModifierCtx,
  AnnotationTypeMemberDeclarationCtx,
  ConstantDeclarationCtx,
  ConstantModifierCtx,
  DefaultValueCtx,
  ElementValueArrayInitializerCtx,
  ElementValueCtx,
  ElementValueListCtx,
  ElementValuePairCtx,
  ElementValuePairListCtx,
  ExtendsInterfacesCtx,
  InterfaceBodyCtx,
  InterfaceDeclarationCtx,
  InterfaceMemberDeclarationCtx,
  InterfaceMethodDeclarationCtx,
  InterfaceMethodModifierCtx,
  InterfaceModifierCtx,
  InterfacePermitsCtx,
  IToken,
  NormalInterfaceDeclarationCtx
} from "java-parser";

const { line, softline, hardline } = builders;

export class InterfacesPrettierVisitor extends BaseCstPrettierPrinter {
  interfaceDeclaration(ctx: InterfaceDeclarationCtx) {
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

  normalInterfaceDeclaration(ctx: NormalInterfaceDeclarationCtx) {
    const typeIdentifier = this.visit(ctx.typeIdentifier);
    const typeParameters = this.visit(ctx.typeParameters);
    const extendsInterfaces = this.visit(ctx.extendsInterfaces);
    const optionalInterfacePermits = this.visit(ctx.interfacePermits);
    const interfaceBody = this.visit(ctx.interfaceBody);

    let extendsInterfacesPart = "";
    if (extendsInterfaces) {
      extendsInterfacesPart = indent(
        rejectAndConcat([softline, extendsInterfaces])
      );
    }

    let interfacePermits = "";
    if (optionalInterfacePermits) {
      interfacePermits = indent(
        rejectAndConcat([softline, optionalInterfacePermits])
      );
    }

    return rejectAndJoin(" ", [
      group(
        rejectAndJoin(" ", [
          ctx.Interface[0],
          concat([typeIdentifier, typeParameters]),
          extendsInterfacesPart,
          interfacePermits
        ])
      ),
      interfaceBody
    ]);
  }

  interfaceModifier(ctx: InterfaceModifierCtx) {
    if (ctx.annotation) {
      return this.visitSingle(ctx);
    }
    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  extendsInterfaces(ctx: ExtendsInterfacesCtx) {
    const interfaceTypeList = this.visit(ctx.interfaceTypeList);

    return group(
      rejectAndConcat([
        ctx.Extends[0],
        indent(rejectAndConcat([line, interfaceTypeList]))
      ])
    );
  }

  interfacePermits(ctx: InterfacePermitsCtx) {
    return this.classPermits(ctx);
  }

  interfaceBody(ctx: InterfaceBodyCtx) {
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

  interfaceMemberDeclaration(ctx: InterfaceMemberDeclarationCtx) {
    if (ctx.Semicolon) {
      return displaySemicolon(ctx.Semicolon[0]);
    }
    return this.visitSingle(ctx);
  }

  constantDeclaration(ctx: ConstantDeclarationCtx) {
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

  constantModifier(ctx: ConstantModifierCtx) {
    if (ctx.annotation) {
      return this.visitSingle(ctx);
    }
    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  interfaceMethodDeclaration(ctx: InterfaceMethodDeclarationCtx) {
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

  interfaceMethodModifier(ctx: InterfaceMethodModifierCtx) {
    if (ctx.annotation) {
      return this.visitSingle(ctx);
    }
    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  annotationTypeDeclaration(ctx: AnnotationTypeDeclarationCtx) {
    const typeIdentifier = this.visit(ctx.typeIdentifier);
    const annotationTypeBody = this.visit(ctx.annotationTypeBody);

    return rejectAndJoin(" ", [
      concat([ctx.At[0], ctx.Interface[0]]),
      typeIdentifier,
      annotationTypeBody
    ]);
  }

  annotationTypeBody(ctx: AnnotationTypeBodyCtx) {
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

  annotationTypeMemberDeclaration(ctx: AnnotationTypeMemberDeclarationCtx) {
    if (ctx.Semicolon) {
      return printTokenWithComments(this.getSingle(ctx) as IToken);
    }
    return this.visitSingle(ctx);
  }

  annotationTypeElementDeclaration(ctx: AnnotationTypeElementDeclarationCtx) {
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

  annotationTypeElementModifier(ctx: AnnotationTypeElementModifierCtx) {
    if (ctx.annotation) {
      return this.visitSingle(ctx);
    }
    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  defaultValue(ctx: DefaultValueCtx) {
    const elementValue = this.visit(ctx.elementValue);

    return rejectAndJoin(" ", [ctx.Default[0], elementValue]);
  }

  annotation(ctx: AnnotationCtx) {
    const fqn = this.visit(ctx.typeName);

    let annoArgs = "";
    if (ctx.LBrace) {
      if (ctx.elementValuePairList) {
        annoArgs = putIntoBraces(
          this.visit(ctx.elementValuePairList),
          softline,
          ctx.LBrace[0],
          ctx.RBrace![0]
        );
      } else if (ctx.elementValue) {
        annoArgs = putIntoBraces(
          this.visit(ctx.elementValue),
          softline,
          ctx.LBrace[0],
          ctx.RBrace![0]
        );
      }
    }

    return group(rejectAndConcat([ctx.At[0], fqn, annoArgs]));
  }

  elementValuePairList(ctx: ElementValuePairListCtx) {
    const elementValuePairs = this.mapVisit(ctx.elementValuePair);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, line])) : [];

    return rejectAndJoinSeps(commas, elementValuePairs);
  }

  elementValuePair(ctx: ElementValuePairCtx) {
    const identifier = ctx.Identifier[0];
    const elementValue = this.visit(ctx.elementValue);

    return rejectAndJoin(" ", [identifier, ctx.Equals[0], elementValue]);
  }

  elementValue(ctx: ElementValueCtx) {
    return this.visitSingle(ctx);
  }

  elementValueArrayInitializer(ctx: ElementValueArrayInitializerCtx) {
    const elementValueList = this.visit(ctx.elementValueList);

    return printArrayList({
      list: elementValueList,
      extraComma: ctx.Comma,
      LCurly: ctx.LCurly[0],
      RCurly: ctx.RCurly[0],
      trailingComma: this.prettierOptions.trailingComma
    });
  }

  elementValueList(ctx: ElementValueListCtx) {
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
