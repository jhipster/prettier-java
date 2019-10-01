"use strict";
/* eslint-disable no-unused-vars */

const { line, hardline, indent, group } = require("prettier").doc.builders;
const { concat, join, getImageWithComments } = require("./prettier-builder");
const {
  buildFqn,
  rejectAndJoin,
  rejectAndConcat,
  rejectAndJoinSeps,
  displaySemicolon,
  putIntoCurlyBraces,
  getBlankLinesSeparator,
  sortImports
} = require("./printer-utils");

class PackagesAndModulesPrettierVisitor {
  compilationUnit(ctx) {
    const compilationUnit =
      ctx.ordinaryCompilationUnit || ctx.modularCompilationUnit;
    return concat([this.visit(compilationUnit[0]), ctx.EOF[0]]);
  }

  ordinaryCompilationUnit(ctx) {
    const packageDecl = this.visit(ctx.packageDeclaration);

    const sortedImportsDecl = sortImports(ctx.importDeclaration);
    const nonStaticImports = this.mapVisit(sortedImportsDecl.nonStaticImports);
    const staticImports = this.mapVisit(sortedImportsDecl.staticImports);

    const typesDecl = this.mapVisit(ctx.typeDeclaration);

    // TODO: utility to add item+line (or multiple lines) but only if an item exists
    return rejectAndConcat([
      rejectAndJoin(concat([hardline, hardline]), [
        packageDecl,
        rejectAndJoin(hardline, staticImports),
        rejectAndJoin(hardline, nonStaticImports),
        rejectAndJoin(concat([hardline, hardline]), typesDecl)
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
    const name = buildFqn(ctx.Identifier, ctx.Dot);

    return rejectAndJoin(hardline, [
      rejectAndJoin(hardline, modifiers),
      concat([ctx.Package[0], " ", name, ctx.Semicolon[0]])
    ]);
  }

  packageModifier(ctx) {
    return this.visitSingle(ctx);
  }

  importDeclaration(ctx) {
    if (ctx.emptyStatement !== undefined) {
      return this.visit(ctx.emptyStatement);
    }

    const optionalStatic = ctx.Static ? ctx.Static[0] : "";
    const packageOrTypeName = this.visit(ctx.packageOrTypeName);

    const optionalDotStar = ctx.Dot ? concat([ctx.Dot[0], ctx.Star[0]]) : "";

    return rejectAndJoin(" ", [
      ctx.Import[0],
      optionalStatic,
      rejectAndConcat([packageOrTypeName, optionalDotStar, ctx.Semicolon[0]])
    ]);
  }

  typeDeclaration(ctx) {
    if (ctx.Semicolon) {
      return displaySemicolon(ctx.Semicolon[0]);
    }
    return this.visitSingle(ctx);
  }

  moduleDeclaration(ctx) {
    const annotations = this.mapVisit(ctx.annotation);
    const optionalOpen = ctx.Open ? ctx.Open[0] : "";
    const name = buildFqn(ctx.Identifier, ctx.Dot);
    const moduleDirectives = this.mapVisit(ctx.moduleDirective);

    const content = rejectAndJoinSeps(
      getBlankLinesSeparator(ctx.moduleDirective),
      moduleDirectives
    );

    return rejectAndJoin(" ", [
      join(" ", annotations),
      optionalOpen,
      ctx.Module[0],
      name,
      putIntoCurlyBraces(content, hardline, ctx.LCurly[0], ctx.RCurly[0])
    ]);
  }

  moduleDirective(ctx) {
    return this.visitSingle(ctx);
  }

  requiresModuleDirective(ctx) {
    const modifiers = this.mapVisit(ctx.requiresModifier);
    const moduleName = this.visit(ctx.moduleName);

    return rejectAndJoin(" ", [
      ctx.Requires[0],
      join(" ", modifiers),
      concat([moduleName, ctx.Semicolon[0]])
    ]);
  }

  exportsModuleDirective(ctx) {
    const packageName = this.visit(ctx.packageName);
    const to = ctx.To ? ctx.To[0] : "";
    const moduleNames = this.mapVisit(ctx.moduleName);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, line])) : [];

    return group(
      rejectAndConcat([
        indent(
          rejectAndJoin(line, [
            rejectAndJoin(" ", [ctx.Exports[0], packageName]),
            group(
              indent(
                rejectAndJoin(line, [
                  to,
                  rejectAndJoinSeps(commas, moduleNames)
                ])
              )
            )
          ])
        ),
        ctx.Semicolon[0]
      ])
    );
  }

  opensModuleDirective(ctx) {
    const packageName = this.visit(ctx.packageName);
    const to = ctx.To ? ctx.To[0] : "";
    const moduleNames = this.mapVisit(ctx.moduleName);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, line])) : [];

    return group(
      rejectAndConcat([
        indent(
          rejectAndJoin(line, [
            rejectAndJoin(" ", [ctx.Opens[0], packageName]),
            group(
              indent(
                rejectAndJoin(line, [
                  to,
                  rejectAndJoinSeps(commas, moduleNames)
                ])
              )
            )
          ])
        ),
        ctx.Semicolon[0]
      ])
    );
  }

  usesModuleDirective(ctx) {
    const typeName = this.visit(ctx.typeName);

    return rejectAndConcat([
      concat([ctx.Uses[0], " "]),
      typeName,
      ctx.Semicolon[0]
    ]);
  }

  providesModuleDirective(ctx) {
    const firstTypeName = this.visit(ctx.typeName[0]);
    const otherTypeNames = this.mapVisit(ctx.typeName.slice(1));
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, line])) : [];

    return group(
      rejectAndConcat([
        indent(
          rejectAndJoin(line, [
            rejectAndJoin(" ", [ctx.Provides[0], firstTypeName]),
            group(
              indent(
                rejectAndJoin(line, [
                  ctx.With[0],
                  rejectAndJoinSeps(commas, otherTypeNames)
                ])
              )
            )
          ])
        ),
        ctx.Semicolon[0]
      ])
    );
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
