import { printTokenWithComments } from "./comments/format-comments";
import { BaseCstPrettierPrinter } from "../base-cst-printer";
import {
  BooleanLiteralCtx,
  FloatingPointLiteralCtx,
  IntegerLiteralCtx,
  IToken,
  LiteralCtx
} from "java-parser";

export class LexicalStructurePrettierVisitor extends BaseCstPrettierPrinter {
  literal(ctx: LiteralCtx) {
    if (ctx.CharLiteral || ctx.TextBlock || ctx.StringLiteral || ctx.Null) {
      return printTokenWithComments(this.getSingle(ctx) as IToken);
    }
    return this.visitSingle(ctx);
  }

  integerLiteral(ctx: IntegerLiteralCtx) {
    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  floatingPointLiteral(ctx: FloatingPointLiteralCtx) {
    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  booleanLiteral(ctx: BooleanLiteralCtx) {
    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }
}
