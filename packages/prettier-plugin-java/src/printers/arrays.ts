import {
  ArrayInitializerCtx,
  VariableInitializerListCtx
} from "java-parser/api";
import {
  printArrayList,
  rejectAndConcat,
  rejectAndJoinSeps
} from "./printer-utils";
import { builders } from "prettier/doc";
import { BaseCstPrettierPrinter } from "../base-cst-printer";

const { line } = builders;

export class ArraysPrettierVisitor extends BaseCstPrettierPrinter {
  prettierOptions: any;
  arrayInitializer(ctx: ArrayInitializerCtx) {
    const optionalVariableInitializerList = this.visit(
      ctx.variableInitializerList
    );

    return printArrayList({
      list: optionalVariableInitializerList,
      extraComma: ctx.Comma,
      LCurly: ctx.LCurly[0],
      RCurly: ctx.RCurly[0],
      trailingComma: this.prettierOptions.trailingComma
    });
  }

  variableInitializerList(ctx: VariableInitializerListCtx) {
    const variableInitializers = this.mapVisit(ctx.variableInitializer);
    const commas = ctx.Comma
      ? ctx.Comma.map(comma => {
          return rejectAndConcat([comma, line]);
        })
      : [];

    return rejectAndJoinSeps(commas, variableInitializers);
  }
}
