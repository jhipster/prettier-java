"use strict";

import { buildFqn } from "./printer-utils";
import { printTokenWithComments } from "./comments/format-comments";
import { BaseCstPrettierPrinter } from "../base-cst-printer";
import {
  AmbiguousNameCtx,
  ExpressionNameCtx,
  MethodNameCtx,
  ModuleNameCtx,
  PackageNameCtx,
  PackageOrTypeNameCtx,
  TypeIdentifierCtx,
  TypeNameCtx
} from "java-parser";

export class NamesPrettierVisitor extends BaseCstPrettierPrinter {
  typeIdentifier(ctx: TypeIdentifierCtx) {
    return printTokenWithComments(ctx.Identifier[0]);
  }

  moduleName(ctx: ModuleNameCtx) {
    return buildFqn(ctx.Identifier, ctx.Dot);
  }

  packageName(ctx: PackageNameCtx) {
    return buildFqn(ctx.Identifier, ctx.Dot);
  }

  typeName(ctx: TypeNameCtx) {
    return buildFqn(ctx.Identifier, ctx.Dot);
  }

  expressionName(ctx: ExpressionNameCtx) {
    return buildFqn(ctx.Identifier, ctx.Dot);
  }

  methodName(ctx: MethodNameCtx) {
    return printTokenWithComments(ctx.Identifier[0]);
  }

  packageOrTypeName(ctx: PackageOrTypeNameCtx) {
    return buildFqn(ctx.Identifier, ctx.Dot);
  }

  ambiguousName(ctx: AmbiguousNameCtx) {
    return buildFqn(ctx.Identifier, ctx.Dot);
  }
}
