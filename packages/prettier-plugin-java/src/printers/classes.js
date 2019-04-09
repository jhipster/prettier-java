"use strict";
/* eslint-disable no-unused-vars */
const _ = require("lodash");
const {
  concat,
  join,
  line,
  ifBreak,
  fill,
  group,
  indent,
  dedent,
  softline,
  breakParent
} = require("prettier").doc.builders;
const {
  rejectAndConcat,
  rejectAndJoin,
  sortClassTypeChildren
} = require("./printer-utils");

class ClassesPrettierVisitor {
  classDeclaration(ctx) {
    const modifiers = this.mapVisit(ctx.classModifier);

    const classCST = ctx.normalClassDeclaration
      ? ctx.normalClassDeclaration
      : ctx.enumDeclaration;
    const classDoc = this.visit(classCST);

    return rejectAndJoin(" ", [join(" ", modifiers), classDoc]);
  }

  normalClassDeclaration(ctx) {
    const name = this.visit(ctx.typeIdentifier);
    const optionalTypeParams = this.visit(ctx.typeParameters);
    const optionalSuperClasses = this.visit(ctx.superclass);
    const optionalSuperInterfaces = this.visit(ctx.superinterfaces);
    const body = this.visit(ctx.classBody);

    let superClassesPart = "";
    if (optionalSuperClasses) {
      superClassesPart = indent(
        rejectAndConcat([softline, optionalSuperClasses])
      );
    }

    let superInterfacesPart = "";
    if (optionalSuperInterfaces) {
      superInterfacesPart = indent(
        rejectAndConcat([softline, optionalSuperInterfaces])
      );
    }

    return rejectAndJoin(" ", [
      group(
        rejectAndJoin(" ", [
          "class",
          rejectAndConcat([name, optionalTypeParams]),
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
    return this.getSingle(ctx).image;
  }

  typeParameters(ctx) {
    const typeParameterList = this.visit(ctx.typeParameterList);

    return rejectAndConcat([
      "<",
      group(rejectAndConcat([indent(typeParameterList), softline, ">"]))
    ]);
  }

  typeParameterList(ctx) {
    const typeParameter = this.mapVisit(ctx.typeParameter);

    return group(
      rejectAndConcat([
        softline,
        rejectAndJoin(rejectAndConcat([",", line]), typeParameter)
      ])
    );
  }

  superclass(ctx) {
    return join(" ", ["extends", this.visit(ctx.classType)]);
  }

  superinterfaces(ctx) {
    const interfaceTypeList = this.visit(ctx.interfaceTypeList);

    return indent(rejectAndJoin(" ", ["implements", interfaceTypeList]));
  }

  interfaceTypeList(ctx) {
    const interfaceType = this.mapVisit(ctx.interfaceType);

    return group(
      rejectAndConcat([
        softline,
        rejectAndJoin(rejectAndConcat([",", line]), interfaceType),
        breakParent
      ])
    );
  }

  classBody(ctx) {
    const classBodyDecls = this.mapVisit(ctx.classBodyDeclaration);

    if (classBodyDecls.length !== 0) {
      return rejectAndConcat([
        "{",
        indent(rejectAndConcat([line, rejectAndJoin(line, classBodyDecls)])),
        line,
        "}"
      ]);
    }

    return "{}";
  }

  classBodyDeclaration(ctx) {
    return this.visitSingle(ctx);
  }

  classMemberDeclaration(ctx) {
    return this.visitSingle(ctx);
  }

  fieldDeclaration(ctx) {
    const fieldModifiers = this.mapVisit(ctx.fieldModifier);
    const unannType = this.visit(ctx.unannType);
    const variableDeclaratorList = this.visit(ctx.variableDeclaratorList);

    return rejectAndJoin(" ", [
      rejectAndJoin(" ", fieldModifiers),
      unannType,
      concat([variableDeclaratorList, ";"])
    ]);
  }

  fieldModifier(ctx) {
    if (ctx.annotation) {
      return this.visit(ctx.annotation);
    }
    // public | protected | private | ...
    return this.getSingle(ctx).image;
  }

  variableDeclaratorList(ctx) {
    const variableDeclarators = this.mapVisit(ctx.variableDeclarator);

    return rejectAndJoin(", ", variableDeclarators);
  }

  variableDeclarator(ctx) {
    const variableDeclaratorId = this.visit(ctx.variableDeclaratorId);
    if (ctx.Equals) {
      const variableInitializer = this.visit(ctx.variableInitializer);
      return rejectAndJoin(" ", [
        variableDeclaratorId,
        "=",
        variableInitializer
      ]);
    }
    return variableDeclaratorId;
  }

  variableDeclaratorId(ctx) {
    const identifier = ctx.Identifier[0].image;
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
    return this.getSingle(ctx).image;
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
        currentSegment.push(token.image);
        if (
          (i + 1 < tokens.length && tokens[i + 1].name !== "typeArguments") ||
          i + 1 === tokens.length
        ) {
          segments.push(rejectAndConcat(currentSegment));
          currentSegment = [];
        }
      }
    });

    return rejectAndJoin(".", segments);
  }

  unannInterfaceType(ctx) {
    return this.visit(ctx.unannClassType);
  }

  unannTypeVariable(ctx) {
    return this.getSingle(ctx).image;
  }

  methodDeclaration(ctx) {
    const modifiers = this.mapVisit(ctx.methodModifier);
    const header = this.visit(ctx.methodHeader);
    const body = this.visit(ctx.methodBody);

    const headerBodySeparator = body === ";" ? "" : " ";
    return rejectAndConcat([
      line,
      rejectAndJoin(" ", [
        rejectAndJoin(" ", modifiers),
        rejectAndJoin(headerBodySeparator, [header, body])
      ])
    ]);
  }

  methodModifier(ctx) {
    if (ctx.annotation) {
      return this.visit(ctx.annotation);
    }
    // public | protected | private | Synchronized | ...
    return this.getSingle(ctx).image;
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
    return this.getSingle(ctx).image;
  }

  methodDeclarator(ctx) {
    const identifier = ctx.Identifier[0].image;
    const formalParameterList = this.visit(ctx.formalParameterList);
    const dims = this.visit(ctx.dims);

    return rejectAndConcat([
      identifier,
      "(",
      group(rejectAndConcat([indent(formalParameterList), softline, ")"])),
      dims
    ]);
  }

  receiverParameter(ctx) {
    const annotations = this.mapVisit(ctx.annotation);
    const unannType = this.visit(ctx.unannType);
    const identifier = ctx.Identifier
      ? concat([ctx.Identifier[0].image, "."])
      : "";

    return rejectAndJoin("", [
      rejectAndJoin(" ", annotations),
      unannType,
      identifier,
      "this"
    ]);
  }

  formalParameterList(ctx) {
    const formalParameter = this.mapVisit(ctx.formalParameter);

    return group(
      rejectAndConcat([
        softline,
        rejectAndJoin(rejectAndConcat([",", line]), formalParameter)
      ])
    );
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
    const identifier = ctx.Identifier[0].image;

    return rejectAndConcat([
      join(" ", variableModifier),
      unannType,
      join(" ", annotation),
      "... ",
      identifier
    ]);
  }

  variableModifier(ctx) {
    if (ctx.annotation) {
      return this.visit(ctx.annotation);
    }
    return this.getSingle(ctx).image;
  }

  throws(ctx) {
    const exceptionTypeList = this.visit(ctx.exceptionTypeList);
    return join(" ", ["throws", exceptionTypeList]);
  }

  exceptionTypeList(ctx) {
    const exceptionTypes = this.mapVisit(ctx.exceptionType);
    return join(", ", exceptionTypes);
  }

  exceptionType(ctx) {
    return this.visitSingle(ctx);
  }

  methodBody(ctx) {
    if (ctx.block) {
      return this.visit(ctx.block);
    }

    return this.getSingle(ctx).image;
  }

  instanceInitializer(ctx) {
    return this.visitSingle(ctx);
  }

  staticInitializer(ctx) {
    const block = this.visit(ctx.block);

    return join(" ", ["static", block]);
  }

  constructorDeclaration(ctx) {
    const constructorModifier = this.mapVisit(ctx.constructorModifier);
    const constructorDeclarator = this.visit(ctx.constructorDeclarator);
    const throws = this.visit(ctx.throws);
    const constructorBody = this.visit(ctx.constructorBody);

    let throwsPart = "";
    if (throws) {
      throwsPart = indent(rejectAndConcat([softline, throws]));
    }

    return rejectAndConcat([
      line,
      rejectAndJoin(" ", [
        group(
          rejectAndJoin(" ", [
            join(" ", constructorModifier),
            constructorDeclarator,
            throwsPart
          ])
        ),
        constructorBody
      ])
    ]);
  }

  constructorModifier(ctx) {
    if (ctx.annotation) {
      return this.visit(ctx.annotation);
    }
    // public | protected | private | Synchronized | ...
    return this.getSingle(ctx).image;
  }

  constructorDeclarator(ctx) {
    const typeParameters = this.visit(ctx.typeParameters);
    const simpleTypeName = this.visit(ctx.simpleTypeName);
    const receiverParameter = this.visit(ctx.receiverParameter);
    const formalParameterList = this.visit(ctx.formalParameterList);

    return rejectAndConcat([
      typeParameters,
      simpleTypeName,
      "(",
      group(
        rejectAndConcat([
          indent(rejectAndJoin(", ", [receiverParameter, formalParameterList])),
          softline,
          ")"
        ])
      )
    ]);
  }

  simpleTypeName(ctx) {
    return this.getSingle(ctx).image;
  }

  constructorBody(ctx) {
    const explicitConstructorInvocation = this.visit(
      ctx.explicitConstructorInvocation
    );

    const blockStatements = this.visit(ctx.blockStatements);

    return rejectAndJoin(line, [
      indent(
        rejectAndJoin(line, [
          "{",
          explicitConstructorInvocation,
          blockStatements
        ])
      ),
      "}"
    ]);
  }

  explicitConstructorInvocation(ctx) {
    return this.visitSingle(ctx);
  }

  unqualifiedExplicitConstructorInvocation(ctx) {
    const typeArguments = this.visit(ctx.typeArguments);
    const keyWord = ctx.This ? "this" : "super";
    const argumentList = this.visit(ctx.argumentList);

    return rejectAndConcat([
      typeArguments,
      " ",
      keyWord,
      "(",
      group(rejectAndConcat([indent(argumentList), softline, ");"]))
    ]);
  }

  qualifiedExplicitConstructorInvocation(ctx) {
    const expressionName = this.visit(ctx.expressionName);
    const typeArguments = this.visit(ctx.typeArguments);
    const argumentList = this.visit(ctx.argumentList);

    return rejectAndConcat([
      expressionName,
      ".",
      typeArguments,
      "super",
      "(",
      group(rejectAndConcat([indent(argumentList), softline, ");"]))
    ]);
  }

  enumDeclaration(ctx) {
    const classModifier = this.mapVisit(ctx.classModifier);
    const typeIdentifier = this.visit(ctx.typeIdentifier);
    const superinterfaces = this.visit(ctx.superinterfaces);
    const enumBody = this.visit(ctx.enumBody);

    return rejectAndJoin(" ", [
      join(" ", classModifier),
      "enum",
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

    const optionnalComma = ctx.Comma ? ", " : "";

    if (enumConstantList) {
      return rejectAndConcat([
        "{",
        indent(
          rejectAndConcat([
            line,
            rejectAndJoin(optionnalComma, [
              enumConstantList,
              enumBodyDeclarations
            ])
          ])
        ),
        line,
        "}"
      ]);
    }

    return "{}";
  }

  enumConstantList(ctx) {
    const enumConstants = this.mapVisit(ctx.enumConstant);

    return rejectAndJoin(concat([",", line]), enumConstants);
  }

  enumConstant(ctx) {
    const enumConstantModifiers = this.mapVisit(ctx.enumConstantModifier);
    const identifier = ctx.Identifier[0].image;
    const argumentList = this.visit(ctx.argumentList);
    const classBody = this.visit(ctx.classBody);

    const optionnalBracesAndArgumentList = ctx.LBrace
      ? rejectAndConcat(["(", argumentList, ")"])
      : "";

    return rejectAndJoin(" ", [
      rejectAndJoin(" ", enumConstantModifiers),
      rejectAndConcat([identifier, optionnalBracesAndArgumentList]),
      classBody
    ]);
  }

  enumConstantModifier(ctx) {
    return this.visitSingle(ctx);
  }

  enumBodyDeclarations(ctx) {
    const classBodyDeclaration = this.mapVisit(ctx.classBodyDeclaration);

    return rejectAndJoin(line, [";", join(line, classBodyDeclaration)]);
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
