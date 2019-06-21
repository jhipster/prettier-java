"use strict";
/* eslint-disable no-unused-vars */
const _ = require("lodash");
const { line, softline, hardline } = require("prettier").doc.builders;
const {
  reject,
  rejectAndConcat,
  rejectAndJoin,
  sortClassTypeChildren,
  sortModifiers,
  rejectAndJoinSeps,
  displaySemicolon,
  putIntoBraces,
  putIntoCurlyBraces,
  getClassBodyDeclarationsSeparator
} = require("./printer-utils");
const {
  concat,
  join,
  group,
  fill,
  indent,
  getImageWithComments
} = require("./prettier-builder");

class ClassesPrettierVisitor {
  classDeclaration(ctx) {
    const modifiers = sortModifiers(ctx.classModifier);
    const firstAnnotations = this.mapVisit(modifiers[0]);
    const otherModifiers = this.mapVisit(modifiers[1]);

    const classCST = ctx.normalClassDeclaration
      ? ctx.normalClassDeclaration
      : ctx.enumDeclaration;
    const classDoc = this.visit(classCST);

    return rejectAndJoin(hardline, [
      rejectAndJoin(hardline, firstAnnotations),
      rejectAndJoin(" ", [join(" ", otherModifiers), classDoc])
    ]);
  }

  normalClassDeclaration(ctx) {
    const name = this.visit(ctx.typeIdentifier);
    const optionalTypeParams = this.visit(ctx.typeParameters);
    const optionalSuperClasses = this.visit(ctx.superclass);
    const optionalSuperInterfaces = this.visit(ctx.superinterfaces);
    const body = this.visit(ctx.classBody);

    let superClassesPart = "";
    if (optionalSuperClasses) {
      superClassesPart = indent(rejectAndConcat([line, optionalSuperClasses]));
    }

    let superInterfacesPart = "";
    if (optionalSuperInterfaces) {
      superInterfacesPart = indent(
        rejectAndConcat([line, optionalSuperInterfaces])
      );
    }

    return rejectAndJoin(" ", [
      group(
        rejectAndConcat([
          rejectAndJoin(" ", [ctx.Class[0], name]),
          optionalTypeParams,
          superClassesPart,
          superInterfacesPart
        ])
      ),
      body
    ]);
  }

  classModifier(ctx) {
    if (ctx.annotation) {
      return this.visit(ctx.annotation);
    }
    // public | protected | private | ...
    return getImageWithComments(this.getSingle(ctx));
  }

  typeParameters(ctx) {
    const typeParameterList = this.visit(ctx.typeParameterList);

    return rejectAndConcat([ctx.Less[0], typeParameterList, ctx.Greater[0]]);
  }

  typeParameterList(ctx) {
    const typeParameter = this.mapVisit(ctx.typeParameter);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, " "])) : [];

    return rejectAndJoinSeps(commas, typeParameter);
  }

  superclass(ctx) {
    return join(" ", [ctx.Extends[0], this.visit(ctx.classType)]);
  }

  superinterfaces(ctx) {
    const interfaceTypeList = this.visit(ctx.interfaceTypeList);

    return group(
      rejectAndConcat([
        ctx.Implements[0],
        indent(rejectAndConcat([line, interfaceTypeList]))
      ])
    );
  }

  interfaceTypeList(ctx) {
    const interfaceType = this.mapVisit(ctx.interfaceType);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, line])) : [];

    return group(rejectAndJoinSeps(commas, interfaceType));
  }

  classBody(ctx) {
    let content = "";
    if (ctx.classBodyDeclaration !== undefined) {
      const classBodyDeclsVisited = reject(
        this.mapVisit(ctx.classBodyDeclaration)
      );

      const separators = getClassBodyDeclarationsSeparator(
        ctx.classBodyDeclaration
      );

      content = rejectAndJoinSeps(separators, classBodyDeclsVisited);

      if (
        !(
          ctx.classBodyDeclaration[0].children.classMemberDeclaration !==
            undefined &&
          (ctx.classBodyDeclaration[0].children.classMemberDeclaration[0]
            .children.fieldDeclaration !== undefined ||
            ctx.classBodyDeclaration[0].children.classMemberDeclaration[0]
              .children.Semicolon !== undefined)
        )
      ) {
        content = rejectAndConcat([hardline, content]);
      }
    }

    return putIntoCurlyBraces(content, hardline, ctx.LCurly[0], ctx.RCurly[0]);
  }

  classBodyDeclaration(ctx) {
    return this.visitSingle(ctx);
  }

  classMemberDeclaration(ctx) {
    if (ctx.Semicolon) {
      return displaySemicolon(ctx.Semicolon[0]);
    }

    return this.visitSingle(ctx);
  }

  fieldDeclaration(ctx) {
    const modifiers = sortModifiers(ctx.fieldModifier);
    const firstAnnotations = this.mapVisit(modifiers[0]);
    const otherModifiers = this.mapVisit(modifiers[1]);

    const unannType = this.visit(ctx.unannType);
    const variableDeclaratorList = this.visit(ctx.variableDeclaratorList);

    return rejectAndJoin(hardline, [
      rejectAndJoin(hardline, firstAnnotations),
      rejectAndJoin(" ", [
        rejectAndJoin(" ", otherModifiers),
        unannType,
        concat([variableDeclaratorList, ctx.Semicolon[0]])
      ])
    ]);
  }

  fieldModifier(ctx) {
    if (ctx.annotation) {
      return this.visit(ctx.annotation);
    }
    // public | protected | private | ...
    return getImageWithComments(this.getSingle(ctx));
  }

  variableDeclaratorList(ctx) {
    const variableDeclarators = this.mapVisit(ctx.variableDeclarator);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, " "])) : [];
    return rejectAndJoinSeps(commas, variableDeclarators);
  }

  variableDeclarator(ctx) {
    const variableDeclaratorId = this.visit(ctx.variableDeclaratorId);
    if (ctx.Equals) {
      const variableInitializer = this.visit(ctx.variableInitializer);
      return rejectAndJoin(" ", [
        variableDeclaratorId,
        ctx.Equals[0],
        variableInitializer
      ]);
    }
    return variableDeclaratorId;
  }

  variableDeclaratorId(ctx) {
    const identifier = ctx.Identifier[0];
    const dims = this.visit(ctx.dims);

    return rejectAndConcat([identifier, dims]);
  }

  variableInitializer(ctx) {
    return this.visitSingle(ctx);
  }

  unannType(ctx) {
    return this.visitSingle(ctx);
  }

  unannPrimitiveType(ctx) {
    if (ctx.numericType) {
      return this.visitSingle(ctx);
    }
    return getImageWithComments(this.getSingle(ctx));
  }

  unannReferenceType(ctx) {
    const type = ctx.unannPrimitiveType
      ? this.visit(ctx.unannPrimitiveType)
      : this.visit(ctx.unannClassOrInterfaceType);

    const dims = this.visit(ctx.dims);

    return rejectAndConcat([type, dims]);
  }

  unannClassOrInterfaceType(ctx) {
    return this.visit(ctx.unannClassType);
  }

  unannClassType(ctx) {
    const tokens = sortClassTypeChildren(
      ctx.annotation,
      ctx.typeArguments,
      ctx.Identifier
    );

    const segments = [];
    let currentSegment = [];

    _.forEach(tokens, (token, i) => {
      if (token.name === "typeArguments") {
        currentSegment.push(this.visit([token]));
        segments.push(rejectAndConcat(currentSegment));
        currentSegment = [];
      } else if (token.name === "annotation") {
        currentSegment.push(this.visit([token]));
      } else {
        currentSegment.push(token);
        if (
          (i + 1 < tokens.length && tokens[i + 1].name !== "typeArguments") ||
          i + 1 === tokens.length
        ) {
          segments.push(rejectAndConcat(currentSegment));
          currentSegment = [];
        }
      }
    });

    return rejectAndJoinSeps(ctx.Dot, segments);
  }

  unannInterfaceType(ctx) {
    return this.visit(ctx.unannClassType);
  }

  unannTypeVariable(ctx) {
    return getImageWithComments(this.getSingle(ctx));
  }

  methodDeclaration(ctx) {
    const modifiers = sortModifiers(ctx.methodModifier);
    const firstAnnotations = this.mapVisit(modifiers[0]);
    const otherModifiers = this.mapVisit(modifiers[1]);

    const header = this.visit(ctx.methodHeader);
    const body = this.visit(ctx.methodBody);
    const headerBodySeparator =
      body &&
      body.contents &&
      body.contents.parts &&
      body.contents.parts.includes(";")
        ? ""
        : " ";

    return rejectAndJoin(hardline, [
      rejectAndJoin(hardline, firstAnnotations),
      rejectAndJoin(" ", [
        rejectAndJoin(" ", otherModifiers),
        rejectAndJoin(headerBodySeparator, [header, body])
      ])
    ]);
  }

  methodModifier(ctx) {
    if (ctx.annotation) {
      return this.visit(ctx.annotation);
    }
    // public | protected | private | Synchronized | ...
    return getImageWithComments(this.getSingle(ctx));
  }

  methodHeader(ctx) {
    const typeParameters = this.visit(ctx.typeParameters);
    const annotations = this.mapVisit(ctx.annotation);
    const result = this.visit(ctx.result);
    const declarator = this.visit(ctx.methodDeclarator);
    const throws = this.visit(ctx.throws);

    let throwsPart = "";
    if (throws) {
      throwsPart = indent(rejectAndConcat([softline, throws]));
    }

    return group(
      concat([
        rejectAndJoin(" ", [
          typeParameters,
          rejectAndJoin(line, annotations),
          result,
          declarator,
          throwsPart
        ])
      ])
    );
  }

  result(ctx) {
    if (ctx.unannType) {
      return this.visit(ctx.unannType);
    }
    // void
    return getImageWithComments(this.getSingle(ctx));
  }

  methodDeclarator(ctx) {
    const identifier = getImageWithComments(ctx.Identifier[0]);
    const formalParameterList = this.visit(ctx.formalParameterList);
    const dims = this.visit(ctx.dims);

    return rejectAndConcat([
      identifier,
      putIntoBraces(
        formalParameterList,
        softline,
        ctx.LBrace[0],
        ctx.RBrace[0]
      ),
      dims
    ]);
  }

  receiverParameter(ctx) {
    const annotations = this.mapVisit(ctx.annotation);
    const unannType = this.visit(ctx.unannType);
    const identifier = ctx.Identifier
      ? concat([ctx.Identifier[0], ctx.Dot[0]])
      : "";

    return rejectAndJoin("", [
      rejectAndJoin(" ", annotations),
      unannType,
      identifier,
      ctx.This[0]
    ]);
  }

  formalParameterList(ctx) {
    const formalParameter = this.mapVisit(ctx.formalParameter);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, line])) : [];
    return rejectAndJoinSeps(commas, formalParameter);
  }

  formalParameter(ctx) {
    return this.visitSingle(ctx);
  }

  variableParaRegularParameter(ctx) {
    const variableModifier = this.mapVisit(ctx.variableModifier);
    const unannType = this.visit(ctx.unannType);
    const variableDeclaratorId = this.visit(ctx.variableDeclaratorId);

    return rejectAndJoin(" ", [
      rejectAndJoin(" ", variableModifier),
      unannType,
      variableDeclaratorId
    ]);
  }

  variableArityParameter(ctx) {
    const variableModifier = this.mapVisit(ctx.variableModifier);
    const unannType = this.visit(ctx.unannType);
    const annotation = this.mapVisit(ctx.annotation);
    const identifier = ctx.Identifier[0];

    return rejectAndConcat([
      join(" ", variableModifier),
      unannType,
      join(" ", annotation),
      concat([ctx.DotDotDot[0], " "]),
      identifier
    ]);
  }

  variableModifier(ctx) {
    if (ctx.annotation) {
      return this.visit(ctx.annotation);
    }
    return getImageWithComments(this.getSingle(ctx));
  }

  throws(ctx) {
    const exceptionTypeList = this.visit(ctx.exceptionTypeList);
    return join(" ", [ctx.Throws[0], exceptionTypeList]);
  }

  exceptionTypeList(ctx) {
    const exceptionTypes = this.mapVisit(ctx.exceptionType);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, " "])) : [];
    return rejectAndJoinSeps(commas, exceptionTypes);
  }

  exceptionType(ctx) {
    return this.visitSingle(ctx);
  }

  methodBody(ctx) {
    if (ctx.block) {
      return this.visit(ctx.block);
    }

    return getImageWithComments(this.getSingle(ctx));
  }

  instanceInitializer(ctx) {
    return this.visitSingle(ctx);
  }

  staticInitializer(ctx) {
    const block = this.visit(ctx.block);

    return join(" ", [ctx.Static[0], block]);
  }

  constructorDeclaration(ctx) {
    const modifiers = sortModifiers(ctx.constructorModifier);
    const firstAnnotations = this.mapVisit(modifiers[0]);
    const otherModifiers = this.mapVisit(modifiers[1]);

    const constructorDeclarator = this.visit(ctx.constructorDeclarator);
    const throws = this.visit(ctx.throws);
    const constructorBody = this.visit(ctx.constructorBody);

    let throwsPart = "";
    if (throws) {
      throwsPart = indent(rejectAndConcat([softline, throws]));
    }

    return rejectAndJoin(" ", [
      group(
        rejectAndJoin(hardline, [
          rejectAndJoin(hardline, firstAnnotations),
          rejectAndJoin(" ", [
            join(" ", otherModifiers),
            constructorDeclarator,
            throwsPart
          ])
        ])
      ),
      constructorBody
    ]);
  }

  constructorModifier(ctx) {
    if (ctx.annotation) {
      return this.visit(ctx.annotation);
    }
    // public | protected | private | Synchronized | ...
    return getImageWithComments(this.getSingle(ctx));
  }

  constructorDeclarator(ctx) {
    const typeParameters = this.visit(ctx.typeParameters);
    const simpleTypeName = this.visit(ctx.simpleTypeName);
    const receiverParameter = this.visit(ctx.receiverParameter);
    const formalParameterList = this.visit(ctx.formalParameterList);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, " "])) : [];
    return rejectAndConcat([
      typeParameters,
      simpleTypeName,
      putIntoBraces(
        rejectAndJoinSeps(commas, [receiverParameter, formalParameterList]),
        softline,
        ctx.LBrace[0],
        ctx.RBrace[0]
      )
    ]);
  }

  simpleTypeName(ctx) {
    return getImageWithComments(this.getSingle(ctx));
  }

  constructorBody(ctx) {
    const explicitConstructorInvocation = this.visit(
      ctx.explicitConstructorInvocation
    );

    const blockStatements = this.visit(ctx.blockStatements);

    return putIntoCurlyBraces(
      rejectAndJoin(hardline, [explicitConstructorInvocation, blockStatements]),
      hardline,
      ctx.LCurly[0],
      ctx.RCurly[0]
    );
  }

  explicitConstructorInvocation(ctx) {
    return this.visitSingle(ctx);
  }

  unqualifiedExplicitConstructorInvocation(ctx) {
    const typeArguments = this.visit(ctx.typeArguments);
    const keyWord = ctx.This ? ctx.This[0] : ctx.Super[0];
    const argumentList = this.visit(ctx.argumentList);
    return rejectAndConcat([
      typeArguments,
      " ",
      keyWord,
      group(
        rejectAndConcat([
          putIntoBraces(argumentList, softline, ctx.LBrace[0], ctx.RBrace[0]),
          ctx.Semicolon[0]
        ])
      )
    ]);
  }

  qualifiedExplicitConstructorInvocation(ctx) {
    const expressionName = this.visit(ctx.expressionName);
    const typeArguments = this.visit(ctx.typeArguments);
    const argumentList = this.visit(ctx.argumentList);

    return rejectAndConcat([
      expressionName,
      ctx.Dot[0],
      typeArguments,
      ctx.Super[0],
      group(
        rejectAndConcat([
          putIntoBraces(argumentList, softline, ctx.LBrace[0], ctx.RBrace[0]),
          ctx.Semicolon[0]
        ])
      )
    ]);
  }

  enumDeclaration(ctx) {
    const classModifier = this.mapVisit(ctx.classModifier);
    const typeIdentifier = this.visit(ctx.typeIdentifier);
    const superinterfaces = this.visit(ctx.superinterfaces);
    const enumBody = this.visit(ctx.enumBody);

    return rejectAndJoin(" ", [
      join(" ", classModifier),
      ctx.Enum[0],
      typeIdentifier,
      superinterfaces,
      enumBody
    ]);
  }

  enumBody(ctx) {
    const enumConstantList = this.visit(ctx.enumConstantList);
    const enumBodyDeclarations = ctx.enumBodyDeclarations
      ? this.visit(ctx.enumBodyDeclarations)
      : ";";

    const optionnalComma = ctx.Comma
      ? ctx.Comma.map(elt => concat([elt, " "]))
      : [];

    return putIntoCurlyBraces(
      rejectAndJoinSeps(optionnalComma, [
        enumConstantList,
        enumBodyDeclarations
      ]),
      hardline,
      ctx.LCurly[0],
      ctx.RCurly[0]
    );
  }

  enumConstantList(ctx) {
    const enumConstants = this.mapVisit(ctx.enumConstant);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, line])) : [];

    const enumConstantsWithSeparators = [enumConstants[0]];
    for (let i = 1; i < enumConstants.length; i++) {
      enumConstantsWithSeparators.push(commas[i - 1], enumConstants[i]);
    }

    return fill(reject(enumConstantsWithSeparators));
  }

  enumConstant(ctx) {
    const modifiers = sortModifiers(ctx.enumConstantModifier);
    const firstAnnotations = this.mapVisit(modifiers[0]);
    const otherModifiers = this.mapVisit(modifiers[1]);

    const identifier = ctx.Identifier[0];
    const argumentList = this.visit(ctx.argumentList);
    const classBody = this.visit(ctx.classBody);

    const optionnalBracesAndArgumentList = ctx.LBrace
      ? putIntoBraces(argumentList, softline, ctx.LBrace[0], ctx.RBrace[0])
      : "";

    return rejectAndJoin(hardline, [
      rejectAndJoin(hardline, firstAnnotations),
      rejectAndJoin(" ", [
        rejectAndJoin(" ", otherModifiers),
        rejectAndConcat([identifier, optionnalBracesAndArgumentList]),
        classBody
      ])
    ]);
  }

  enumConstantModifier(ctx) {
    return this.visitSingle(ctx);
  }

  enumBodyDeclarations(ctx) {
    let content = "";
    if (ctx.classBodyDeclaration !== undefined) {
      const classBodyDeclaration = this.mapVisit(ctx.classBodyDeclaration);

      const separators = getClassBodyDeclarationsSeparator(
        ctx.classBodyDeclaration
      );

      content = rejectAndJoinSeps(separators, classBodyDeclaration);
    }
    return rejectAndJoin(line, [ctx.Semicolon[0], content]);
  }

  isClassDeclaration(ctx) {
    return "isClassDeclaration";
  }

  identifyClassBodyDeclarationType(ctx) {
    return "identifyClassBodyDeclarationType";
  }
}

module.exports = {
  ClassesPrettierVisitor
};
