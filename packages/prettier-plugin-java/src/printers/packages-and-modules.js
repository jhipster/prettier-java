"use strict";
/* eslint-disable no-unused-vars */

const { concat, join, line, ifBreak, group } = require("prettier").doc.builders;
const { buildFqn } = require("./printer-utils");

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
      join(line, importsDecl),
      join(line, typesDecl),
      line
    ]);
  }

  modularCompilationUnit(ctx) {
    return "modularCompilationUnit";
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
    return "import a";
  }

  typeDeclaration(ctx) {
    return this.visitSingle(ctx);
  }

  moduleDeclaration(ctx) {
    return "moduleDeclaration";
  }

  moduleDirective(ctx) {
    return "moduleDirective";
  }

  requiresModuleDirective(ctx) {
    return "requiresModuleDirective";
  }

  exportsModuleDirective(ctx) {
    return "exportsModuleDirective";
  }

  opensModuleDirective(ctx) {
    return "opensModuleDirective";
  }

  usesModuleDirective(ctx) {
    return "usesModuleDirective";
  }

  providesModuleDirective(ctx) {
    return "providesModuleDirective";
  }

  requiresModifier(ctx) {
    return "requiresModifier";
  }

  isModuleCompilationUnit(ctx) {
    return "isModuleCompilationUnit";
  }
}

module.exports = {
  PackagesAndModulesPrettierVisitor
};
