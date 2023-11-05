import { printTokenWithComments } from "./comments/format-comments.js";
import { join } from "./prettier-builder.js";
import { BaseCstPrettierPrinter } from "../base-cst-printer.js";
import {
  BooleanLiteralCtx,
  FloatingPointLiteralCtx,
  IntegerLiteralCtx,
  IToken,
  LiteralCtx
} from "java-parser";
import { builders } from "prettier/doc";

const { hardline } = builders;

export class LexicalStructurePrettierVisitor extends BaseCstPrettierPrinter {
  literal(ctx: LiteralCtx) {
    if (ctx.TextBlock) {
      const lines = ctx.TextBlock[0].image.split("\n");
      const open = lines.shift()!;
      const baseIndent = Math.min(
        ...lines.map(line => line.search(/\S/)).filter(indent => indent >= 0)
      );
      return join(hardline, [
        open,
        ...lines.map(line => line.slice(baseIndent))
      ]);
    }
    if (ctx.CharLiteral || ctx.StringLiteral || ctx.Null) {
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
