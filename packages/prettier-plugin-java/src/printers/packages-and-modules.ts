import { concat, join } from "./prettier-builder";
import { printTokenWithComments } from "./comments/format-comments";
import {
  buildFqn,
  displaySemicolon,
  getBlankLinesSeparator,
  putIntoBraces,
  rejectAndConcat,
  rejectAndJoin,
  rejectAndJoinSeps,
  sortImports
} from "./printer-utils";
import { builders } from "prettier/doc";
import { BaseCstPrettierPrinter } from "../base-cst-printer";
import {
  CompilationUnitCtx,
  ExportsModuleDirectiveCtx,
  ImportDeclarationCtx,
  IToken,
  ModularCompilationUnitCtx,
  ModuleDeclarationCtx,
  ModuleDirectiveCtx,
  OpensModuleDirectiveCtx,
  OrdinaryCompilationUnitCtx,
  PackageDeclarationCtx,
  PackageModifierCtx,
  ProvidesModuleDirectiveCtx,
  RequiresModifierCtx,
  RequiresModuleDirectiveCtx,
  TypeDeclarationCtx,
  UsesModuleDirectiveCtx
} from "java-parser";
import { isOrdinaryCompilationUnitCtx } from "../types/utils";

const { line, hardline, indent, group } = builders;

export class PackagesAndModulesPrettierVisitor extends BaseCstPrettierPrinter {
  compilationUnit(ctx: CompilationUnitCtx) {
    const compilationUnit = isOrdinaryCompilationUnitCtx(ctx)
      ? ctx.ordinaryCompilationUnit
      : ctx.modularCompilationUnit;

    return concat([this.visit(compilationUnit[0]), line]);
  }

  ordinaryCompilationUnit(ctx: OrdinaryCompilationUnitCtx) {
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

  modularCompilationUnit(ctx: ModularCompilationUnitCtx) {
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

  packageDeclaration(ctx: PackageDeclarationCtx) {
    const modifiers = this.mapVisit(ctx.packageModifier);
    const name = buildFqn(ctx.Identifier, ctx.Dot);

    return rejectAndJoin(hardline, [
      rejectAndJoin(hardline, modifiers),
      concat([ctx.Package[0], " ", name, ctx.Semicolon[0]])
    ]);
  }

  packageModifier(ctx: PackageModifierCtx) {
    return this.visitSingle(ctx);
  }

  importDeclaration(ctx: ImportDeclarationCtx) {
    if (ctx.emptyStatement !== undefined) {
      return this.visit(ctx.emptyStatement);
    }

    const optionalStatic = ctx.Static ? ctx.Static[0] : "";
    const packageOrTypeName = this.visit(ctx.packageOrTypeName);

    const optionalDotStar = ctx.Dot ? concat([ctx.Dot[0], ctx.Star![0]]) : "";

    return rejectAndJoin(" ", [
      ctx.Import![0],
      optionalStatic,
      rejectAndConcat([packageOrTypeName, optionalDotStar, ctx.Semicolon![0]])
    ]);
  }

  typeDeclaration(ctx: TypeDeclarationCtx) {
    if (ctx.Semicolon) {
      return displaySemicolon(ctx.Semicolon[0]);
    }
    return this.visitSingle(ctx);
  }

  moduleDeclaration(ctx: ModuleDeclarationCtx) {
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

  moduleDirective(ctx: ModuleDirectiveCtx) {
    return this.visitSingle(ctx);
  }

  requiresModuleDirective(ctx: RequiresModuleDirectiveCtx) {
    const modifiers = this.mapVisit(ctx.requiresModifier);
    const moduleName = this.visit(ctx.moduleName);

    return rejectAndJoin(" ", [
      ctx.Requires[0],
      join(" ", modifiers),
      concat([moduleName, ctx.Semicolon[0]])
    ]);
  }

  exportsModuleDirective(ctx: ExportsModuleDirectiveCtx) {
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

  opensModuleDirective(ctx: OpensModuleDirectiveCtx) {
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

  usesModuleDirective(ctx: UsesModuleDirectiveCtx) {
    const typeName = this.visit(ctx.typeName);

    return rejectAndConcat([
      concat([ctx.Uses[0], " "]),
      typeName,
      ctx.Semicolon[0]
    ]);
  }

  providesModuleDirective(ctx: ProvidesModuleDirectiveCtx) {
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

  requiresModifier(ctx: RequiresModifierCtx) {
    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  isModuleCompilationUnit() {
    return "isModuleCompilationUnit";
  }
}
