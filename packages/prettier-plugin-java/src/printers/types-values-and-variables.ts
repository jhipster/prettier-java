"use strict";

import forEach from "lodash/forEach";

import { concat, join } from "./prettier-builder";
import { printTokenWithComments } from "./comments/format-comments";
import {
  rejectAndConcat,
  rejectAndJoin,
  rejectAndJoinSeps,
  sortClassTypeChildren
} from "./printer-utils";
import {
  AdditionalBoundCtx,
  AnnotationCstNode,
  ClassOrInterfaceTypeCtx,
  ClassTypeCtx,
  CstNode,
  DimsCtx,
  FloatingPointTypeCtx,
  IntegralTypeCtx,
  InterfaceTypeCtx,
  IToken,
  NumericTypeCtx,
  PrimitiveTypeCtx,
  ReferenceTypeCtx,
  TypeArgumentCtx,
  TypeArgumentListCtx,
  TypeArgumentsCtx,
  TypeBoundCtx,
  TypeParameterCtx,
  TypeParameterModifierCtx,
  TypeVariableCtx,
  WildcardBoundsCtx,
  WildcardCtx
} from "java-parser/api";
import { BaseCstPrettierPrinter } from "../base-cst-printer";
import {
  isAnnotationCstNode,
  isCstNode,
  isTypeArgumentsCstNode
} from "../types/utils";

export class TypesValuesAndVariablesPrettierVisitor extends BaseCstPrettierPrinter {
  primitiveType(ctx: PrimitiveTypeCtx) {
    const annotations = this.mapVisit(ctx.annotation);
    const type = ctx.numericType
      ? this.visit(ctx.numericType)
      : this.getSingle(ctx);

    return rejectAndJoin(" ", [join(" ", annotations), type]);
  }

  numericType(ctx: NumericTypeCtx) {
    return this.visitSingle(ctx);
  }

  integralType(ctx: IntegralTypeCtx) {
    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  floatingPointType(ctx: FloatingPointTypeCtx) {
    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  referenceType(ctx: ReferenceTypeCtx) {
    const annotations = this.mapVisit(ctx.annotation);

    const type = ctx.primitiveType
      ? this.visit(ctx.primitiveType)
      : this.visit(ctx.classOrInterfaceType);

    const dims = this.visit(ctx.dims);

    return rejectAndJoin(" ", [join(" ", annotations), concat([type, dims])]);
  }

  classOrInterfaceType(ctx: ClassOrInterfaceTypeCtx) {
    return this.visitSingle(ctx);
  }

  classType(ctx: ClassTypeCtx) {
    const tokens = sortClassTypeChildren(
      ctx.annotation,
      ctx.typeArguments,
      ctx.Identifier
    );

    const segments: any[] = [];
    let currentSegment: any[] = [];

    forEach(tokens, (token, i) => {
      if (isTypeArgumentsCstNode(token)) {
        currentSegment.push(this.visit([token]));
        segments.push(rejectAndConcat(currentSegment));
        currentSegment = [];
      } else if (isAnnotationCstNode(token)) {
        currentSegment.push(this.visit([token]));
      } else {
        currentSegment.push(token);
        if (
          (i + 1 < tokens.length && !isTypeArgumentsCstNode(tokens[i + 1])) ||
          i + 1 === tokens.length
        ) {
          segments.push(rejectAndConcat(currentSegment));
          currentSegment = [];
        }
      }
    });

    return rejectAndJoinSeps(ctx.Dot, segments);
  }

  interfaceType(ctx: InterfaceTypeCtx) {
    return this.visitSingle(ctx);
  }

  typeVariable(ctx: TypeVariableCtx) {
    const annotations = this.mapVisit(ctx.annotation);
    const identifier = this.getSingle(ctx);

    return rejectAndJoin(" ", [join(" ", annotations), identifier]);
  }

  dims(ctx: DimsCtx) {
    let tokens: (IToken | AnnotationCstNode)[] = [...ctx.LSquare];

    if (ctx.annotation) {
      tokens = [...tokens, ...ctx.annotation];
    }

    tokens = tokens.sort((a, b) => {
      const startOffset1 = isCstNode(a)
        ? a.children.At[0].startOffset
        : a.startOffset;
      const startOffset2 = isCstNode(b)
        ? b.children.At[0].startOffset
        : b.startOffset;
      return startOffset1 - startOffset2;
    });

    const segments: any[] = [];
    let currentSegment: any[] = [];

    forEach(tokens, token => {
      if (isCstNode(token)) {
        currentSegment.push(this.visit([token]));
      } else {
        segments.push(
          rejectAndConcat([
            rejectAndJoin(" ", currentSegment),
            concat([ctx.LSquare[0], ctx.RSquare[0]])
          ])
        );
        currentSegment = [];
      }
    });

    return rejectAndConcat(segments);
  }

  typeParameter(ctx: TypeParameterCtx) {
    const typeParameterModifiers = this.mapVisit(ctx.typeParameterModifier);

    const typeIdentifier = this.visit(ctx.typeIdentifier);
    const typeBound = this.visit(ctx.typeBound);

    return rejectAndJoin(" ", [
      join(" ", typeParameterModifiers),
      typeIdentifier,
      typeBound
    ]);
  }

  typeParameterModifier(ctx: TypeParameterModifierCtx) {
    return this.visitSingle(ctx);
  }

  typeBound(ctx: TypeBoundCtx) {
    const classOrInterfaceType = this.visit(ctx.classOrInterfaceType);
    const additionalBound = this.mapVisit(ctx.additionalBound);

    return rejectAndJoin(" ", [
      ctx.Extends[0],
      classOrInterfaceType,
      join(" ", additionalBound)
    ]);
  }

  additionalBound(ctx: AdditionalBoundCtx) {
    const interfaceType = this.visit(ctx.interfaceType);

    return join(" ", [ctx.And[0], interfaceType]);
  }

  typeArguments(ctx: TypeArgumentsCtx) {
    const typeArgumentList = this.visit(ctx.typeArgumentList);

    return rejectAndConcat([ctx.Less[0], typeArgumentList, ctx.Greater[0]]);
  }

  typeArgumentList(ctx: TypeArgumentListCtx) {
    const typeArguments = this.mapVisit(ctx.typeArgument);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, " "])) : [];
    return rejectAndJoinSeps(commas, typeArguments);
  }

  typeArgument(ctx: TypeArgumentCtx) {
    return this.visitSingle(ctx);
  }

  wildcard(ctx: WildcardCtx) {
    const annotations = this.mapVisit(ctx.annotation);
    const wildcardBounds = this.visit(ctx.wildcardBounds);

    return rejectAndJoin(" ", [
      join(" ", annotations),
      ctx.QuestionMark[0],
      wildcardBounds
    ]);
  }

  wildcardBounds(ctx: WildcardBoundsCtx) {
    const keyWord = ctx.Extends ? ctx.Extends[0] : ctx.Super![0];
    const referenceType = this.visit(ctx.referenceType);
    return join(" ", [keyWord, referenceType]);
  }
}
