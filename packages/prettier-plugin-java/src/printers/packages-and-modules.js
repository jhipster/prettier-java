"use strict";
/* eslint-disable no-unused-vars */

const {
  concat,
  indent,
  join,
  line,
  hardline
} = require("prettier").doc.builders;
const {
  buildFqn,
  rejectAndJoin,
  rejectAndConcat,
  getImageWithComments,
  rejectAndJoinSepToken
} = require("./printer-utils");

class PackagesAndModulesPrettierVisitor {
  compilationUnit(ctx) {
    return this.visitSingle(ctx);
  }

  ordinaryCompilationUnit(ctx) {
    const packageDecl = this.visit(ctx.packageDeclaration);
    // TODO: Should imports be sorted? Can imports in Java be safely sorted?
    // TODO2: should the imports be grouped in some manner?
    const importsDecl = this.mapVisit(ctx.importDeclaration);
    const typesDecl = this.mapVisit(ctx.typeDeclaration);

    // TODO: utility to add item+line (or multiple lines) but only if an item exists
    return rejectAndConcat([
      rejectAndJoin(concat([line, line]), [
        packageDecl,
        rejectAndJoin(line, importsDecl),
        rejectAndJoin(line, typesDecl)
      ]),
      line
    ]);
  }

  modularCompilationUnit(ctx) {
    // TODO: Should imports be sorted? Can imports in Java be safely sorted?
    // TODO2: should the imports be grouped in some manner?
    const importsDecl = this.mapVisit(ctx.importDeclaration);
    const moduleDeclaration = this.visit(ctx.moduleDeclaration);
    return join(concat(line, line), [importsDecl, moduleDeclaration]);
  }

  packageDeclaration(ctx) {
    const modifiers = this.mapVisit(ctx.packageModifier);
    const name = buildFqn(ctx.Identifier);

    return rejectAndJoin(hardline, [
      rejectAndJoin(hardline, modifiers),
      concat([getImageWithComments(ctx.Package[0]), " ", name, ";"])
    ]);
  }

  packageModifier(ctx) {
    return this.visitSingle(ctx);
  }

  importDeclaration(ctx) {
    const optionalStatic = ctx.Static
      ? getImageWithComments(ctx.Static[0])
      : "";
    const packageOrTypeName = this.visit(ctx.packageOrTypeName);

    const optionalDotStar = ctx.Dot
      ? concat([
          getImageWithComments(ctx.Dot[0]),
          getImageWithComments(ctx.Star[0])
        ])
      : "";
    return rejectAndJoin(" ", [
      getImageWithComments(ctx.Import[0]),
      optionalStatic,
      rejectAndConcat([
        packageOrTypeName,
        optionalDotStar,
        getImageWithComments(ctx.Semicolon[0])
      ])
    ]);
  }

  typeDeclaration(ctx) {
    return this.visitSingle(ctx);
  }

  moduleDeclaration(ctx) {
    const annotations = this.mapVisit(ctx.annotation);
    const optionalOpen = ctx.Open ? getImageWithComments(ctx.Open[0]) : "";
    const name = buildFqn(ctx.Identifier);
    const moduleDirectives = this.mapVisit(ctx.moduleDirective);
    return rejectAndJoin(" ", [
      join(" ", annotations),
      optionalOpen,
      getImageWithComments(ctx.Module[0]),
      name,
      indent(
        rejectAndJoin(line, [
          getImageWithComments(ctx.LCurly[0]),
          join(line, moduleDirectives)
        ])
      ),
      line,
      getImageWithComments(ctx.RCurly[0])
    ]);
  }

  moduleDirective(ctx) {
    return this.visitSingle(ctx);
  }

  requiresModuleDirective(ctx) {
    const modifiers = this.mapVisit(ctx.requiresModifier);
    const moduleName = this.visit(ctx.moduleName);

    return rejectAndJoin(" ", [
      getImageWithComments(ctx.Requires[0]),
      join(" ", modifiers),
      concat([moduleName, getImageWithComments(ctx.Semicolon[0])])
    ]);
  }

  exportsModuleDirective(ctx) {
    const packageName = this.visit(ctx.packageName);
    const to = ctx.To ? getImageWithComments(ctx.To[0]) : "";
    const moduleNames = this.mapVisit(ctx.moduleName);

    return rejectAndConcat([
      rejectAndJoin(" ", [
        getImageWithComments(ctx.Exports[0]),
        packageName,
        to,
        rejectAndJoinSepToken(ctx.Comma, moduleNames)
      ]),
      getImageWithComments(ctx.Semicolon[0])
    ]);
  }

  opensModuleDirective(ctx) {
    const packageName = this.visit(ctx.packageName);
    const to = ctx.To ? getImageWithComments(ctx.To[0]) : "";
    const moduleNames = this.mapVisit(ctx.moduleName);

    return rejectAndConcat([
      rejectAndJoin(" ", [
        getImageWithComments(ctx.Opens[0]),
        packageName,
        to,
        rejectAndJoinSepToken(ctx.Comma, moduleNames)
      ]),
      getImageWithComments(ctx.Semicolon[0])
    ]);
  }

  usesModuleDirective(ctx) {
    const typeName = this.visit(ctx.typeName);

    return rejectAndConcat([
      getImageWithComments(ctx.Uses[0]),
      typeName,
      getImageWithComments(ctx.Semicolon[0])
    ]);
  }

  providesModuleDirective(ctx) {
    const firstTypeName = this.visit(ctx.typeName[0]);
    const otherTypeNames = this.mapVisit(ctx.typeName.slice(1));

    return rejectAndConcat([
      rejectAndJoin(" ", [
        getImageWithComments(ctx.Provides[0]),
        firstTypeName,
        getImageWithComments(ctx.With[0]),
        rejectAndJoinSepToken(ctx.Comma, otherTypeNames)
      ]),
      getImageWithComments(ctx.Semicolon[0])
    ]);
  }

  requiresModifier(ctx) {
    return getImageWithComments(this.getSingle(ctx));
  }

  isModuleCompilationUnit(ctx) {
    return "isModuleCompilationUnit";
  }
}

module.exports = {
  PackagesAndModulesPrettierVisitor
};
