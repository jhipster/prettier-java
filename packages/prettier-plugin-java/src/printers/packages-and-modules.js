"use strict";
/* eslint-disable no-unused-vars */

const { concat, indent, join, line } = require("prettier").doc.builders;
const { buildFqn, rejectAndJoin, rejectAndConcat } = require("./printer-utils");

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
    return concat([
      packageDecl,
      line,
      line,
      join(line, importsDecl),
      line,
      line,
      join(line, typesDecl),
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

    return concat([join(" ", modifiers), "package", " ", name, ";"]);
  }

  packageModifier(ctx) {
    return this.visitSingle(ctx);
  }

  importDeclaration(ctx) {
    const optionalStatic = ctx.Static ? "static" : "";
    const packageOrTypeName = this.visit(ctx.packageOrTypeName);

    const optionalDotStar = ctx.Dot ? ".*" : "";

    return rejectAndJoin(" ", [
      "import",
      optionalStatic,
      rejectAndConcat([packageOrTypeName, optionalDotStar, ";"])
    ]);
  }

  typeDeclaration(ctx) {
    return this.visitSingle(ctx);
  }

  moduleDeclaration(ctx) {
    const annotations = this.mapVisit(ctx.annotation);
    const optionalOpen = ctx.Open ? "open" : "";
    const name = buildFqn(ctx.Identifier);
    const moduleDirectives = this.mapVisit(ctx.moduleDirective);
    return rejectAndJoin(" ", [
      join(" ", annotations),
      optionalOpen,
      "module",
      name,
      indent(rejectAndJoin(line, ["{", join(line, moduleDirectives)])),
      line,
      "}"
    ]);
  }

  moduleDirective(ctx) {
    return this.visitSingle(ctx);
  }

  requiresModuleDirective(ctx) {
    const modifiers = this.mapVisit(ctx.methodModifier);
    const moduleName = this.visit(ctx.moduleName);

    return rejectAndJoin(" ", [
      "requires",
      join(" ", modifiers),
      concat([moduleName, ";"])
    ]);
  }

  exportsModuleDirective(ctx) {
    const packageName = this.visit(ctx.packageName);
    const to = ctx.To ? "to" : "";
    const moduleNames = this.mapVisit(ctx.moduleName);

    return rejectAndConcat([
      rejectAndJoin(" ", ["exports", packageName, to, join(", ", moduleNames)]),
      ";"
    ]);
  }

  opensModuleDirective(ctx) {
    const packageName = this.visit(ctx.packageName);
    const to = ctx.To ? "to" : "";
    const moduleNames = this.mapVisit(ctx.moduleName);

    return rejectAndConcat([
      rejectAndJoin(" ", ["opens", packageName, to, join(", ", moduleNames)]),
      ";"
    ]);
  }

  usesModuleDirective(ctx) {
    const typeName = this.visit(ctx.typeName);

    return rejectAndConcat(["uses ", typeName, ";"]);
  }

  providesModuleDirective(ctx) {
    const firstTypeName = this.visit(ctx.typeName[0]);
    const otherTypeNames = this.mapVisit(ctx.typeName.slice(1));

    return rejectAndConcat([
      rejectAndJoin(" ", [
        "provides",
        firstTypeName,
        "with",
        join(", ", otherTypeNames)
      ]),
      ";"
    ]);
  }

  requiresModifier(ctx) {
    return this.getSingle(ctx).image;
  }

  isModuleCompilationUnit(ctx) {
    return "isModuleCompilationUnit";
  }
}

module.exports = {
  PackagesAndModulesPrettierVisitor
};
