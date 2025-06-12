import { concat, group, ifBreak, indent } from "./prettier-builder.js";
import { printTokenWithComments } from "./comments/format-comments.js";
import { handleCommentsParameters } from "./comments/handle-comments.js";
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
} from "./printer-utils.js";

import { builders } from "prettier/doc";
import { BaseCstPrettierPrinter } from "../base-cst-printer.js";
import {
  AnnotationCtx,
  AnnotationInterfaceBodyCtx,
  AnnotationInterfaceDeclarationCtx,
  AnnotationInterfaceElementDeclarationCtx,
  AnnotationInterfaceElementModifierCtx,
  AnnotationInterfaceMemberDeclarationCtx,
  ConstantDeclarationCtx,
  ConstantModifierCtx,
  DefaultValueCtx,
  ElementValueArrayInitializerCtx,
  ElementValueCtx,
  ElementValueListCtx,
  ElementValuePairCtx,
  ElementValuePairListCtx,
  InterfaceBodyCtx,
  InterfaceDeclarationCtx,
  InterfaceExtendsCtx,
  InterfaceMemberDeclarationCtx,
  InterfaceMethodDeclarationCtx,
  InterfaceMethodModifierCtx,
  InterfaceModifierCtx,
  InterfacePermitsCtx,
  IToken,
  NormalInterfaceDeclarationCtx
} from "java-parser";
import Doc = builders.Doc;

const { line, softline, hardline } = builders;

export class InterfacesPrettierVisitor extends BaseCstPrettierPrinter {
  interfaceDeclaration(ctx: InterfaceDeclarationCtx) {
    const modifiers = sortModifiers(ctx.interfaceModifier);
    const firstAnnotations = this.mapVisit(modifiers[0]);
    const otherModifiers = this.mapVisit(modifiers[1]);

    const declaration = ctx.normalInterfaceDeclaration
      ? this.visit(ctx.normalInterfaceDeclaration)
      : this.visit(ctx.annotationInterfaceDeclaration);

    return rejectAndJoin(hardline, [
      rejectAndJoin(hardline, firstAnnotations),
      rejectAndJoin(" ", [rejectAndJoin(" ", otherModifiers), declaration])
    ]);
  }

  normalInterfaceDeclaration(ctx: NormalInterfaceDeclarationCtx) {
    const typeIdentifier = this.visit(ctx.typeIdentifier);
    const typeParameters = this.visit(ctx.typeParameters);
    const interfaceExtends = this.visit(ctx.interfaceExtends);
    const optionalInterfacePermits = this.visit(ctx.interfacePermits);
    const interfaceBody = this.visit(ctx.interfaceBody);

    let interfaceExtendsPart: Doc = "";
    if (interfaceExtends) {
      interfaceExtendsPart = indent(
        rejectAndConcat([softline, interfaceExtends])
      );
    }

    let interfacePermits: Doc = "";
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
          interfaceExtendsPart,
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

  interfaceExtends(ctx: InterfaceExtendsCtx) {
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
    let joinedInterfaceMemberDeclaration: Doc = "";

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
    const throwsGroupId = Symbol("throws");
    const firstAnnotations = this.mapVisit(modifiers[0]);
    const otherModifiers = this.mapVisit(modifiers[1]);

    const methodHeader = this.visit(ctx.methodHeader, { throwsGroupId });
    const methodBody = this.visit(ctx.methodBody);
    const separator = isStatementEmptyStatement(methodBody)
      ? ""
      : ctx.methodHeader[0].children.throws
        ? ifBreak(hardline, " ", { groupId: throwsGroupId })
        : " ";

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

  annotationInterfaceDeclaration(ctx: AnnotationInterfaceDeclarationCtx) {
    const typeIdentifier = this.visit(ctx.typeIdentifier);
    const annotationInterfaceBody = this.visit(ctx.annotationInterfaceBody);

    return rejectAndJoin(" ", [
      concat([ctx.At[0], ctx.Interface[0]]),
      typeIdentifier,
      annotationInterfaceBody
    ]);
  }

  annotationInterfaceBody(ctx: AnnotationInterfaceBodyCtx) {
    const annotationInterfaceMemberDeclaration = this.mapVisit(
      ctx.annotationInterfaceMemberDeclaration
    );

    return rejectAndJoin(line, [
      indent(
        rejectAndJoin(line, [
          ctx.LCurly[0],
          rejectAndJoin(
            concat([line, line]),
            annotationInterfaceMemberDeclaration
          )
        ])
      ),
      ctx.RCurly[0]
    ]);
  }

  annotationInterfaceMemberDeclaration(
    ctx: AnnotationInterfaceMemberDeclarationCtx
  ) {
    if (ctx.Semicolon) {
      return printTokenWithComments(this.getSingle(ctx) as IToken);
    }
    return this.visitSingle(ctx);
  }

  annotationInterfaceElementDeclaration(
    ctx: AnnotationInterfaceElementDeclarationCtx
  ) {
    const modifiers = sortModifiers(ctx.annotationInterfaceElementModifier);
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

  annotationInterfaceElementModifier(
    ctx: AnnotationInterfaceElementModifierCtx
  ) {
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

    let annoArgs: Doc = "";
    if (ctx.LBrace) {
      const elementValues =
        ctx.elementValuePairList?.[0].children.elementValuePair ??
        ctx.elementValue ??
        [];
      handleCommentsParameters(ctx.LBrace[0], elementValues, ctx.RBrace![0]);
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
}
