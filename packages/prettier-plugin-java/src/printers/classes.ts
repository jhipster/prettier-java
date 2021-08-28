import forEach from "lodash/forEach";
import {
  displaySemicolon,
  getBlankLinesSeparator,
  getClassBodyDeclarationsSeparator,
  isStatementEmptyStatement,
  putIntoBraces,
  reject,
  rejectAndConcat,
  rejectAndJoin,
  rejectAndJoinSeps,
  sortClassTypeChildren,
  sortModifiers
} from "./printer-utils";
import { concat, group, indent, join } from "./prettier-builder";
import { printTokenWithComments } from "./comments/format-comments";
import {
  hasLeadingComments,
  hasLeadingLineComments
} from "./comments/comments-utils";
import { builders } from "prettier/doc";
import { BaseCstPrettierPrinter } from "../base-cst-printer";
import {
  ClassBodyCtx,
  ClassBodyDeclarationCtx,
  ClassDeclarationCtx,
  ClassMemberDeclarationCtx,
  ClassModifierCtx,
  ClassPermitsCtx,
  CompactConstructorDeclarationCtx,
  ConstructorBodyCtx,
  ConstructorDeclarationCtx,
  ConstructorDeclaratorCtx,
  ConstructorModifierCtx,
  EnumBodyCtx,
  EnumBodyDeclarationsCtx,
  EnumConstantCtx,
  EnumConstantListCtx,
  EnumConstantModifierCtx,
  EnumDeclarationCtx,
  ExceptionTypeCtx,
  ExceptionTypeListCtx,
  ExplicitConstructorInvocationCtx,
  FieldDeclarationCtx,
  FieldModifierCtx,
  FormalParameterCtx,
  FormalParameterListCtx,
  InstanceInitializerCtx,
  InterfaceTypeListCtx,
  IToken,
  MethodBodyCtx,
  MethodDeclarationCtx,
  MethodDeclaratorCtx,
  MethodHeaderCtx,
  MethodModifierCtx,
  NormalClassDeclarationCtx,
  QualifiedExplicitConstructorInvocationCtx,
  ReceiverParameterCtx,
  RecordBodyCtx,
  RecordBodyDeclarationCtx,
  RecordComponentCtx,
  RecordComponentListCtx,
  RecordComponentModifierCtx,
  RecordDeclarationCtx,
  RecordHeaderCtx,
  ResultCtx,
  SimpleTypeNameCtx,
  StaticInitializerCtx,
  SuperclassCtx,
  SuperinterfacesCtx,
  ThrowsCtx,
  TypeParameterListCtx,
  TypeParametersCtx,
  UnannClassOrInterfaceTypeCtx,
  UnannClassTypeCtx,
  UnannInterfaceTypeCtx,
  UnannPrimitiveTypeCtx,
  UnannPrimitiveTypeWithOptionalDimsSuffixCtx,
  UnannReferenceTypeCtx,
  UnannTypeCtx,
  UnannTypeVariableCtx,
  UnqualifiedExplicitConstructorInvocationCtx,
  VariableArityParameterCtx,
  VariableArityRecordComponentCtx,
  VariableDeclaratorCtx,
  VariableDeclaratorIdCtx,
  VariableDeclaratorListCtx,
  VariableInitializerCtx,
  VariableModifierCtx,
  VariableParaRegularParameterCtx
} from "java-parser";
import { Doc } from "prettier";
import { isAnnotationCstNode, isTypeArgumentsCstNode } from "../types/utils";
import { printArgumentListWithBraces } from "../utils";

const { line, softline, hardline } = builders;

export class ClassesPrettierVisitor extends BaseCstPrettierPrinter {
  classDeclaration(ctx: ClassDeclarationCtx) {
    const modifiers = sortModifiers(ctx.classModifier);
    const firstAnnotations = this.mapVisit(modifiers[0]);
    const otherModifiers = this.mapVisit(modifiers[1]);

    let classCST;
    if (ctx.normalClassDeclaration !== undefined) {
      classCST = ctx.normalClassDeclaration;
    } else if (ctx.enumDeclaration !== undefined) {
      classCST = ctx.enumDeclaration;
    } else {
      classCST = ctx.recordDeclaration;
    }

    const classDoc = this.visit(classCST);

    return rejectAndJoin(hardline, [
      rejectAndJoin(hardline, firstAnnotations),
      rejectAndJoin(" ", [join(" ", otherModifiers), classDoc])
    ]);
  }

  normalClassDeclaration(ctx: NormalClassDeclarationCtx) {
    const name = this.visit(ctx.typeIdentifier);
    const optionalTypeParams = this.visit(ctx.typeParameters);
    const optionalSuperClasses = this.visit(ctx.superclass);
    const optionalSuperInterfaces = this.visit(ctx.superinterfaces);
    const optionalClassPermits = this.visit(ctx.classPermits);
    const body = this.visit(ctx.classBody, { isNormalClassDeclaration: true });

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

    let classPermits = "";
    if (optionalClassPermits) {
      classPermits = indent(rejectAndConcat([line, optionalClassPermits]));
    }

    return rejectAndJoin(" ", [
      group(
        rejectAndConcat([
          rejectAndJoin(" ", [ctx.Class[0], name]),
          optionalTypeParams,
          superClassesPart,
          superInterfacesPart,
          classPermits
        ])
      ),
      body
    ]);
  }

  classModifier(ctx: ClassModifierCtx) {
    if (ctx.annotation) {
      return this.visit(ctx.annotation);
    }
    // public | protected | private | ...
    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  typeParameters(ctx: TypeParametersCtx) {
    const typeParameterList = this.visit(ctx.typeParameterList);

    return rejectAndConcat([ctx.Less[0], typeParameterList, ctx.Greater[0]]);
  }

  typeParameterList(ctx: TypeParameterListCtx) {
    const typeParameter = this.mapVisit(ctx.typeParameter);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, " "])) : [];

    return rejectAndJoinSeps(commas, typeParameter);
  }

  superclass(ctx: SuperclassCtx) {
    return join(" ", [ctx.Extends[0], this.visit(ctx.classType)]);
  }

  superinterfaces(ctx: SuperinterfacesCtx) {
    const interfaceTypeList = this.visit(ctx.interfaceTypeList);

    return group(
      rejectAndConcat([
        ctx.Implements[0],
        indent(rejectAndConcat([line, interfaceTypeList]))
      ])
    );
  }

  classPermits(ctx: ClassPermitsCtx) {
    const typeNames = this.mapVisit(ctx.typeName);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, line])) : [];

    return group(
      rejectAndConcat([
        ctx.Permits[0],
        indent(
          rejectAndConcat([line, group(rejectAndJoinSeps(commas, typeNames))])
        )
      ])
    );
  }

  interfaceTypeList(ctx: InterfaceTypeListCtx) {
    const interfaceType = this.mapVisit(ctx.interfaceType);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, line])) : [];

    return group(rejectAndJoinSeps(commas, interfaceType));
  }

  classBody(ctx: ClassBodyCtx, param: any) {
    let content = "";
    if (ctx.classBodyDeclaration !== undefined) {
      const classBodyDeclsVisited = reject(
        this.mapVisit(ctx.classBodyDeclaration)
      );

      const separators = getClassBodyDeclarationsSeparator(
        ctx.classBodyDeclaration
      );

      content = rejectAndJoinSeps(separators, classBodyDeclsVisited);

      // edge case when we have SemiColons
      let shouldHardline = false;
      ctx.classBodyDeclaration.forEach(elt => {
        if (
          (elt.children.classMemberDeclaration &&
            !elt.children.classMemberDeclaration[0].children.Semicolon) ||
          elt.children.constructorDeclaration
        ) {
          shouldHardline = true;
        }
      });

      if (
        (ctx.classBodyDeclaration[0].children.classMemberDeclaration ||
          ctx.classBodyDeclaration[0].children.constructorDeclaration) &&
        shouldHardline &&
        param &&
        param.isNormalClassDeclaration
      ) {
        content = rejectAndConcat([hardline, content]);
      }
    }

    return putIntoBraces(content, hardline, ctx.LCurly[0], ctx.RCurly[0]);
  }

  classBodyDeclaration(ctx: ClassBodyDeclarationCtx) {
    return this.visitSingle(ctx);
  }

  classMemberDeclaration(ctx: ClassMemberDeclarationCtx) {
    if (ctx.Semicolon) {
      return displaySemicolon(ctx.Semicolon[0]);
    }

    return this.visitSingle(ctx);
  }

  fieldDeclaration(ctx: FieldDeclarationCtx) {
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

  fieldModifier(ctx: FieldModifierCtx) {
    if (ctx.annotation) {
      return this.visit(ctx.annotation);
    }
    // public | protected | private | ...
    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  variableDeclaratorList(ctx: VariableDeclaratorListCtx) {
    const variableDeclarators = this.mapVisit(ctx.variableDeclarator);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, " "])) : [];
    return rejectAndJoinSeps(commas, variableDeclarators);
  }

  variableDeclarator(ctx: VariableDeclaratorCtx) {
    const variableDeclaratorId = this.visit(ctx.variableDeclaratorId);
    if (ctx.Equals) {
      const variableInitializer = this.visit(ctx.variableInitializer);

      if (hasLeadingLineComments(ctx.variableInitializer![0])) {
        return group(
          indent(
            rejectAndJoin(hardline, [
              rejectAndJoin(" ", [variableDeclaratorId, ctx.Equals[0]]),
              variableInitializer
            ])
          )
        );
      }

      if (
        // Array Initialisation
        ctx.variableInitializer![0].children.arrayInitializer !== undefined ||
        // Lambda expression
        ctx.variableInitializer![0].children.expression![0].children
          .lambdaExpression !== undefined ||
        // Ternary Expression
        (ctx.variableInitializer![0].children.expression![0].children
          .ternaryExpression !== undefined &&
          ctx.variableInitializer![0].children.expression![0].children
            .ternaryExpression[0].children.QuestionMark !== undefined)
      ) {
        return rejectAndJoin(" ", [
          variableDeclaratorId,
          ctx.Equals[0],
          variableInitializer
        ]);
      }

      if (
        ctx.variableInitializer![0].children.expression![0].children
          .ternaryExpression !== undefined
      ) {
        const firstPrimary =
          ctx.variableInitializer![0].children.expression![0].children
            .ternaryExpression[0].children.binaryExpression[0].children
            .unaryExpression[0].children.primary[0];

        // Cast Expression
        if (
          firstPrimary.children.primaryPrefix[0].children.castExpression !==
          undefined
        ) {
          return rejectAndJoin(" ", [
            variableDeclaratorId,
            ctx.Equals[0],
            variableInitializer
          ]);
        }

        // New Expression
        if (
          firstPrimary.children.primaryPrefix[0].children.newExpression !==
          undefined
        ) {
          return rejectAndJoin(" ", [
            variableDeclaratorId,
            ctx.Equals[0],
            variableInitializer
          ]);
        }

        // Method Invocation
        const isMethodInvocation =
          firstPrimary.children.primarySuffix !== undefined &&
          firstPrimary.children.primarySuffix[0].children
            .methodInvocationSuffix !== undefined;
        const isUniqueUnaryExpression =
          ctx.variableInitializer![0].children.expression![0].children
            .ternaryExpression[0].children.binaryExpression[0].children
            .unaryExpression.length === 1;

        const isUniqueMethodInvocation =
          isMethodInvocation && isUniqueUnaryExpression;
        if (isUniqueMethodInvocation) {
          return rejectAndJoin(" ", [
            variableDeclaratorId,
            ctx.Equals[0],
            variableInitializer
          ]);
        }
      }

      return group(
        indent(
          rejectAndJoin(line, [
            rejectAndJoin(" ", [variableDeclaratorId, ctx.Equals[0]]),
            variableInitializer
          ])
        )
      );
    }
    return variableDeclaratorId;
  }

  variableDeclaratorId(ctx: VariableDeclaratorIdCtx) {
    const identifier = ctx.Identifier[0];
    const dims = this.visit(ctx.dims);

    return rejectAndConcat([identifier, dims]);
  }

  variableInitializer(ctx: VariableInitializerCtx) {
    return this.visitSingle(ctx);
  }

  unannType(ctx: UnannTypeCtx) {
    return this.visitSingle(ctx);
  }

  unannPrimitiveTypeWithOptionalDimsSuffix(
    ctx: UnannPrimitiveTypeWithOptionalDimsSuffixCtx
  ) {
    const unannPrimitiveType = this.visit(ctx.unannPrimitiveType);
    const dims = this.visit(ctx.dims);

    return rejectAndConcat([unannPrimitiveType, dims]);
  }

  unannPrimitiveType(ctx: UnannPrimitiveTypeCtx) {
    if (ctx.numericType) {
      return this.visitSingle(ctx);
    }
    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  unannReferenceType(ctx: UnannReferenceTypeCtx) {
    const unannClassOrInterfaceType = this.visit(ctx.unannClassOrInterfaceType);
    const dims = this.visit(ctx.dims);

    return rejectAndConcat([unannClassOrInterfaceType, dims]);
  }

  unannClassOrInterfaceType(ctx: UnannClassOrInterfaceTypeCtx) {
    return this.visit(ctx.unannClassType);
  }

  unannClassType(ctx: UnannClassTypeCtx) {
    const tokens = sortClassTypeChildren(
      ctx.annotation,
      ctx.typeArguments,
      ctx.Identifier
    );

    const segments: Doc[] = [];
    let currentSegment: (Doc | IToken)[] = [];

    forEach(tokens, (token, i) => {
      if (isTypeArgumentsCstNode(token)) {
        currentSegment.push(this.visit([token]));
        segments.push(rejectAndConcat(currentSegment));
        currentSegment = [];
      } else if (isAnnotationCstNode(token)) {
        currentSegment.push(this.visit([token]));
        currentSegment.push(" ");
      } else {
        currentSegment.push(token as IToken);
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

  unannInterfaceType(ctx: UnannInterfaceTypeCtx) {
    return this.visit(ctx.unannClassType);
  }

  unannTypeVariable(ctx: UnannTypeVariableCtx) {
    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  methodDeclaration(ctx: MethodDeclarationCtx) {
    const modifiers = sortModifiers(ctx.methodModifier);
    const firstAnnotations = this.mapVisit(modifiers[0]);
    const otherModifiers = this.mapVisit(modifiers[1]);

    const header = this.visit(ctx.methodHeader);
    const body = this.visit(ctx.methodBody);

    const headerBodySeparator = isStatementEmptyStatement(body) ? "" : " ";

    return rejectAndJoin(hardline, [
      rejectAndJoin(hardline, firstAnnotations),
      rejectAndJoin(" ", [
        rejectAndJoin(" ", otherModifiers),
        rejectAndJoin(headerBodySeparator, [header, body])
      ])
    ]);
  }

  methodModifier(ctx: MethodModifierCtx) {
    if (ctx.annotation) {
      return this.visit(ctx.annotation);
    }
    // public | protected | private | Synchronized | ...
    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  methodHeader(ctx: MethodHeaderCtx) {
    const typeParameters = this.visit(ctx.typeParameters);
    const annotations = this.mapVisit(ctx.annotation);
    const result = this.visit(ctx.result);
    const declarator = this.visit(ctx.methodDeclarator);
    const throws = this.visit(ctx.throws);

    return group(
      concat([
        rejectAndJoin(" ", [
          typeParameters,
          rejectAndJoin(line, annotations),
          result,
          declarator,
          throws
        ])
      ])
    );
  }

  result(ctx: ResultCtx) {
    if (ctx.unannType) {
      return this.visit(ctx.unannType);
    }
    // void
    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  methodDeclarator(ctx: MethodDeclaratorCtx) {
    const identifier = printTokenWithComments(ctx.Identifier[0]);
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

  receiverParameter(ctx: ReceiverParameterCtx) {
    const annotations = this.mapVisit(ctx.annotation);
    const unannType = this.visit(ctx.unannType);
    const identifier = ctx.Identifier
      ? concat([ctx.Identifier[0], ctx.Dot![0]])
      : "";

    return rejectAndJoin("", [
      rejectAndJoin(" ", annotations),
      unannType,
      identifier,
      ctx.This[0]
    ]);
  }

  formalParameterList(ctx: FormalParameterListCtx) {
    const formalParameter = this.mapVisit(ctx.formalParameter);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, line])) : [];
    return rejectAndJoinSeps(commas, formalParameter);
  }

  formalParameter(ctx: FormalParameterCtx) {
    return this.visitSingle(ctx);
  }

  variableParaRegularParameter(ctx: VariableParaRegularParameterCtx) {
    const variableModifier = this.mapVisit(ctx.variableModifier);
    const unannType = this.visit(ctx.unannType);
    const variableDeclaratorId = this.visit(ctx.variableDeclaratorId);

    return rejectAndJoin(" ", [
      rejectAndJoin(" ", variableModifier),
      unannType,
      variableDeclaratorId
    ]);
  }

  variableArityParameter(ctx: VariableArityParameterCtx) {
    const variableModifier = this.mapVisit(ctx.variableModifier);
    const unannType = this.visit(ctx.unannType);
    const annotations = this.mapVisit(ctx.annotation);
    const identifier = ctx.Identifier[0];

    const unannTypePrinted =
      ctx.annotation === undefined
        ? concat([unannType, ctx.DotDotDot[0]])
        : unannType;
    const annotationsPrinted =
      ctx.annotation === undefined
        ? annotations
        : concat([rejectAndJoin(" ", annotations), ctx.DotDotDot[0]]);

    return rejectAndJoin(" ", [
      join(" ", variableModifier),
      unannTypePrinted,
      annotationsPrinted,
      identifier
    ]);
  }

  variableModifier(ctx: VariableModifierCtx) {
    if (ctx.annotation) {
      return this.visit(ctx.annotation);
    }
    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  throws(ctx: ThrowsCtx) {
    const exceptionTypeList = this.visit(ctx.exceptionTypeList);
    const throwsDeclaration = join(" ", [ctx.Throws[0], exceptionTypeList]);
    return group(indent(rejectAndConcat([softline, throwsDeclaration])));
  }

  exceptionTypeList(ctx: ExceptionTypeListCtx) {
    const exceptionTypes = this.mapVisit(ctx.exceptionType);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, " "])) : [];
    return rejectAndJoinSeps(commas, exceptionTypes);
  }

  exceptionType(ctx: ExceptionTypeCtx) {
    return this.visitSingle(ctx);
  }

  methodBody(ctx: MethodBodyCtx) {
    if (ctx.block) {
      return this.visit(ctx.block);
    }

    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  instanceInitializer(ctx: InstanceInitializerCtx) {
    return this.visitSingle(ctx);
  }

  staticInitializer(ctx: StaticInitializerCtx) {
    const block = this.visit(ctx.block);

    return join(" ", [ctx.Static[0], block]);
  }

  constructorDeclaration(ctx: ConstructorDeclarationCtx) {
    const modifiers = sortModifiers(ctx.constructorModifier);
    const firstAnnotations = this.mapVisit(modifiers[0]);
    const otherModifiers = this.mapVisit(modifiers[1]);

    const constructorDeclarator = this.visit(ctx.constructorDeclarator);
    const throws = this.visit(ctx.throws);
    const constructorBody = this.visit(ctx.constructorBody);

    return rejectAndJoin(" ", [
      group(
        rejectAndJoin(hardline, [
          rejectAndJoin(hardline, firstAnnotations),
          rejectAndJoin(" ", [
            join(" ", otherModifiers),
            constructorDeclarator,
            throws
          ])
        ])
      ),
      constructorBody
    ]);
  }

  constructorModifier(ctx: ConstructorModifierCtx) {
    if (ctx.annotation) {
      return this.visit(ctx.annotation);
    }
    // public | protected | private | Synchronized | ...
    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  constructorDeclarator(ctx: ConstructorDeclaratorCtx) {
    const typeParameters = this.visit(ctx.typeParameters);
    const simpleTypeName = this.visit(ctx.simpleTypeName);
    const receiverParameter = this.visit(ctx.receiverParameter);
    const formalParameterList = this.visit(ctx.formalParameterList);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, " "])) : [];

    return rejectAndJoin(" ", [
      typeParameters,
      concat([
        simpleTypeName,
        putIntoBraces(
          rejectAndJoinSeps(commas, [receiverParameter, formalParameterList]),
          softline,
          ctx.LBrace[0],
          ctx.RBrace[0]
        )
      ])
    ]);
  }

  simpleTypeName(ctx: SimpleTypeNameCtx) {
    return printTokenWithComments(this.getSingle(ctx) as IToken);
  }

  constructorBody(ctx: ConstructorBodyCtx) {
    const explicitConstructorInvocation = this.visit(
      ctx.explicitConstructorInvocation
    );

    const blockStatements = this.visit(ctx.blockStatements);

    return putIntoBraces(
      rejectAndJoin(hardline, [explicitConstructorInvocation, blockStatements]),
      hardline,
      ctx.LCurly[0],
      ctx.RCurly[0]
    );
  }

  explicitConstructorInvocation(ctx: ExplicitConstructorInvocationCtx) {
    return this.visitSingle(ctx);
  }

  unqualifiedExplicitConstructorInvocation(
    ctx: UnqualifiedExplicitConstructorInvocationCtx
  ) {
    const typeArguments = this.visit(ctx.typeArguments);
    const keyWord = ctx.This ? ctx.This[0] : ctx.Super![0];
    const argumentList = printArgumentListWithBraces.call(
      this,
      ctx.argumentList,
      ctx.RBrace![0],
      ctx.LBrace[0]
    );
    return rejectAndConcat([
      typeArguments,
      keyWord,
      group(rejectAndConcat([argumentList, ctx.Semicolon[0]]))
    ]);
  }

  qualifiedExplicitConstructorInvocation(
    ctx: QualifiedExplicitConstructorInvocationCtx
  ) {
    const expressionName = this.visit(ctx.expressionName);
    const typeArguments = this.visit(ctx.typeArguments);
    const argumentList = printArgumentListWithBraces.call(
      this,
      ctx.argumentList,
      ctx.RBrace![0],
      ctx.LBrace[0]
    );

    return rejectAndConcat([
      expressionName,
      ctx.Dot[0],
      typeArguments,
      ctx.Super[0],
      group(rejectAndConcat([argumentList, ctx.Semicolon[0]]))
    ]);
  }

  enumDeclaration(ctx: EnumDeclarationCtx) {
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

  enumBody(ctx: EnumBodyCtx) {
    const enumConstantList = this.visit(ctx.enumConstantList);
    const enumBodyDeclarations = this.visit(ctx.enumBodyDeclarations);

    const hasEnumConstants = ctx.enumConstantList !== undefined;
    const hasNoClassBodyDeclarations =
      ctx.enumBodyDeclarations === undefined ||
      ctx.enumBodyDeclarations[0].children.classBodyDeclaration === undefined;

    // edge case: https://github.com/jhipster/prettier-java/issues/383
    const handleEnumBodyDeclarationsLeadingComments =
      !hasNoClassBodyDeclarations &&
      hasLeadingComments(ctx.enumBodyDeclarations![0])
        ? hardline
        : "";

    let optionalComma;
    if (
      hasEnumConstants &&
      hasNoClassBodyDeclarations &&
      this.prettierOptions.trailingComma !== "none"
    ) {
      optionalComma = ctx.Comma ? ctx.Comma[0] : ",";
    } else {
      optionalComma = ctx.Comma ? { ...ctx.Comma[0], image: "" } : "";
    }

    return putIntoBraces(
      rejectAndConcat([
        enumConstantList,
        optionalComma,
        handleEnumBodyDeclarationsLeadingComments,
        enumBodyDeclarations
      ]),
      hardline,
      ctx.LCurly[0],
      ctx.RCurly[0]
    );
  }

  enumConstantList(ctx: EnumConstantListCtx) {
    const enumConstants = this.mapVisit(ctx.enumConstant);

    const blankLineSeparators = getBlankLinesSeparator(ctx.enumConstant);
    const commas = ctx.Comma
      ? ctx.Comma.map((elt, index) =>
          concat([elt, blankLineSeparators![index]])
        )
      : [];

    return group(rejectAndJoinSeps(commas, enumConstants));
  }

  enumConstant(ctx: EnumConstantCtx) {
    const modifiers = sortModifiers(ctx.enumConstantModifier);
    const firstAnnotations = this.mapVisit(modifiers[0]);
    const otherModifiers = this.mapVisit(modifiers[1]);

    const identifier = ctx.Identifier[0];
    const classBody = this.visit(ctx.classBody);

    const optionalBracesAndArgumentList = ctx.LBrace
      ? printArgumentListWithBraces.call(
          this,
          ctx.argumentList,
          ctx.RBrace![0],
          ctx.LBrace[0]
        )
      : "";

    return rejectAndJoin(hardline, [
      rejectAndJoin(hardline, firstAnnotations),
      rejectAndJoin(" ", [
        rejectAndJoin(" ", otherModifiers),
        rejectAndConcat([identifier, optionalBracesAndArgumentList]),
        classBody
      ])
    ]);
  }

  enumConstantModifier(ctx: EnumConstantModifierCtx) {
    return this.visitSingle(ctx);
  }

  enumBodyDeclarations(ctx: EnumBodyDeclarationsCtx) {
    if (ctx.classBodyDeclaration !== undefined) {
      const classBodyDeclaration = this.mapVisit(ctx.classBodyDeclaration);

      const separators = getClassBodyDeclarationsSeparator(
        ctx.classBodyDeclaration
      );

      return rejectAndJoin(concat([hardline, hardline]), [
        ctx.Semicolon[0],
        rejectAndJoinSeps(separators, classBodyDeclaration)
      ]);
    }

    return { ...ctx.Semicolon[0], image: "" };
  }

  recordDeclaration(ctx: RecordDeclarationCtx) {
    const name = this.visit(ctx.typeIdentifier);
    const optionalTypeParams = this.visit(ctx.typeParameters);

    const recordHeader = this.visit(ctx.recordHeader);

    let superInterfacesPart = "";
    const optionalSuperInterfaces = this.visit(ctx.superinterfaces);
    if (optionalSuperInterfaces) {
      superInterfacesPart = indent(
        rejectAndConcat([line, optionalSuperInterfaces])
      );
    }

    const body = this.visit(ctx.recordBody);

    return rejectAndJoin(" ", [
      group(
        rejectAndConcat([
          rejectAndJoin(" ", [ctx.Record[0], name]),
          optionalTypeParams,
          recordHeader,
          superInterfacesPart
        ])
      ),
      body
    ]);
  }
  recordHeader(ctx: RecordHeaderCtx) {
    const recordComponentList = this.visit(ctx.recordComponentList);
    return putIntoBraces(
      recordComponentList,
      softline,
      ctx.LBrace[0],
      ctx.RBrace[0]
    );
  }
  recordComponentList(ctx: RecordComponentListCtx) {
    const recordComponents = this.mapVisit(ctx.recordComponent);
    const commas = ctx.Comma ? ctx.Comma.map(elt => concat([elt, " "])) : [];

    return rejectAndJoinSeps(commas, recordComponents);
  }
  recordComponent(ctx: RecordComponentCtx) {
    const modifiers = this.mapVisit(ctx.recordComponentModifier);
    const unannType = this.visit(ctx.unannType);

    if (ctx.Identifier !== undefined) {
      return rejectAndJoin(" ", [
        join(" ", modifiers),
        unannType,
        ctx.Identifier[0]
      ]);
    }

    const variableArityRecordComponent = this.visit(
      ctx.variableArityRecordComponent
    );
    if (
      ctx.variableArityRecordComponent![0].children.annotation !== undefined
    ) {
      return rejectAndJoin(" ", [
        join(" ", modifiers),
        join(" ", [unannType, variableArityRecordComponent])
      ]);
    }

    return rejectAndJoin(" ", [
      join(" ", modifiers),
      concat([unannType, variableArityRecordComponent])
    ]);
  }
  variableArityRecordComponent(ctx: VariableArityRecordComponentCtx) {
    const annotations = this.mapVisit(ctx.annotation);
    const identifier = ctx.Identifier[0];

    return rejectAndJoin(" ", [
      rejectAndConcat([rejectAndJoin(" ", annotations), ctx.DotDotDot[0]]),
      identifier
    ]);
  }

  recordComponentModifier(ctx: RecordComponentModifierCtx) {
    return this.visitSingle(ctx);
  }

  recordBody(ctx: RecordBodyCtx) {
    return putIntoBraces(
      rejectAndJoinSeps(
        getBlankLinesSeparator(ctx.recordBodyDeclaration),
        this.mapVisit(ctx.recordBodyDeclaration)
      ),
      hardline,
      ctx.LCurly[0],
      ctx.RCurly[0]
    );
  }

  recordBodyDeclaration(ctx: RecordBodyDeclarationCtx) {
    return this.visitSingle(ctx);
  }

  compactConstructorDeclaration(ctx: CompactConstructorDeclarationCtx) {
    const modifiers = sortModifiers(ctx.constructorModifier);
    const firstAnnotations = this.mapVisit(modifiers[0]);
    const otherModifiers = this.mapVisit(modifiers[1]);

    const name = this.visit(ctx.simpleTypeName);
    const constructorBody = this.visit(ctx.constructorBody);

    return rejectAndJoin(" ", [
      group(
        rejectAndJoin(hardline, [
          rejectAndJoin(hardline, firstAnnotations),
          rejectAndJoin(" ", [join(" ", otherModifiers), name])
        ])
      ),
      constructorBody
    ]);
  }

  isClassDeclaration() {
    return "isClassDeclaration";
  }

  identifyClassBodyDeclarationType() {
    return "identifyClassBodyDeclarationType";
  }

  isDims() {
    return "isDims";
  }

  isCompactConstructorDeclaration() {
    return "isCompactConstructorDeclaration";
  }
}
