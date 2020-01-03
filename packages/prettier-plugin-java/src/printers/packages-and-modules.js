"use strict";

const { line, hardline, indent, group } = require("prettier").doc.builders;
const { concat, join } = require("./prettier-builder");
const { printTokenWithComments } = require("./comments/format-comments");
const {
  buildFqn,
  rejectAndJoin,
  rejectAndConcat,
  rejectAndJoinSeps,
  displaySemicolon,
  putIntoBraces,
  getBlankLinesSeparator,
  sortImports
} = require("./printer-utils");

class PackagesAndModulesPrettierVisitor {
  compilationUnit(ctx) {
    const compilationUnit =
      ctx.ordinaryCompilationUnit || ctx.modularCompilationUnit;

    return concat([this.visit(compilationUnit[0]), line]);
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
      ])
    ]);
  }

  modularCompilationUnit(ctx) {
    const sortedImportsDecl = sortImports(ctx.importDeclaration);
    const nonStaticImports = this.mapVisit(sortedImportsDecl.nonStaticImports);
    const staticImports = this.mapVisit(sortedImportsDecl.staticImports);

    const moduleDeclaration = this.visit(ctx.moduleDeclaration);

    return rejectAndConcat([
      rejectAndJoin(concat([hardline, hardline]), [
        rejectAndJoin(hardline, staticImports),
        rejectAndJoin(hardline, nonStaticImports),
        moduleDeclaration
      ])
    ]);
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
      putIntoBraces(content, hardline, ctx.LCurly[0], ctx.RCurly[0])
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
    return printTokenWithComments(this.getSingle(ctx));
  }

  isModuleCompilationUnit() {
    return "isModuleCompilationUnit";
  }
}

module.exports = {
  PackagesAndModulesPrettierVisitor
};
