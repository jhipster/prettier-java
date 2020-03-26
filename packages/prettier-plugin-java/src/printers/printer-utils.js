"use strict";
const _ = require("lodash");
const { ifBreak, join, concat, group } = require("./prettier-builder");
const {
  getTokenLeadingComments,
  printTokenWithComments
} = require("./comments/format-comments");
const { hasComments } = require("./comments/comments-utils");
const { indent, hardline, line } = require("prettier").doc.builders;

const orderedModifiers = [
  "Public",
  "Protected",
  "Private",
  "Abstract",
  "Default",
  "Static",
  "Final",
  "Transient",
  "Volatile",
  "Synchronized",
  "Native",
  "Strictfp"
];

function buildFqn(tokens, dots) {
  return rejectAndJoinSeps(dots ? dots : [], tokens);
}

function rejectAndJoinSeps(sepTokens, elems, sep) {
  if (!Array.isArray(sepTokens)) {
    return rejectAndJoin(sepTokens, elems);
  }
  const actualElements = reject(elems);
  const res = [];

  for (let i = 0; i < sepTokens.length; i++) {
    res.push(actualElements[i], sepTokens[i]);
    if (sep) {
      res.push(sep);
    }
  }
  res.push(...actualElements.slice(sepTokens.length));
  return concat(res);
}

function reject(elems) {
  return elems.filter(item => {
    if (typeof item === "string") {
      return item !== "";
    }
    // eslint-ignore next - We want the conversion to boolean!
    return item != false && item !== undefined;
  });
}

function rejectSeparators(separators, elems) {
  const realElements = reject(elems);

  const realSeparators = [];
  for (let i = 0; i < realElements.length - 1; i++) {
    if (realElements[i] !== "") {
      realSeparators.push(separators[i]);
    }
  }

  return realSeparators;
}

function rejectAndJoin(sep, elems) {
  const actualElements = reject(elems);

  return join(sep, actualElements);
}

function rejectAndConcat(elems) {
  const actualElements = reject(elems);

  return concat(actualElements);
}

function sortAnnotationIdentifier(annotations, identifiers) {
  let tokens = [...identifiers];

  if (annotations && annotations.length > 0) {
    tokens = [...tokens, ...annotations];
  }

  return tokens.sort((a, b) => {
    const startOffset1 =
      a.name === "annotation" ? a.children.At[0].startOffset : a.startOffset;
    const startOffset2 =
      b.name === "annotation" ? b.children.At[0].startOffset : b.startOffset;
    return startOffset1 - startOffset2;
  });
}

function sortTokens() {
  let tokens = [];

  _.forEach(arguments, argument => {
    if (argument) {
      tokens = tokens.concat(argument);
    }
  });

  return tokens.sort((a, b) => {
    return a.startOffset - b.startOffset;
  });
}

function matchCategory(token, categoryName) {
  const labels = token.tokenType.CATEGORIES.map(category => {
    return category.LABEL;
  });

  return labels.indexOf(categoryName) !== -1;
}

function sortClassTypeChildren(annotations, typeArguments, identifiers, dots) {
  let tokens = [...identifiers];

  if (annotations && annotations.length > 0) {
    tokens = [...tokens, ...annotations];
  }

  if (typeArguments && typeArguments.length > 0) {
    tokens = [...tokens, ...typeArguments];
  }

  if (dots && dots.length > 0) {
    tokens = [...tokens, ...dots];
  }

  return tokens.sort((a, b) => {
    const startOffsetA = a.name
      ? a.children.At
        ? a.children.At[0].startOffset
        : a.children.Less[0].startOffset
      : a.startOffset;
    const startOffsetB = b.name
      ? b.children.At
        ? b.children.At[0].startOffset
        : b.children.Less[0].startOffset
      : b.startOffset;
    return startOffsetA - startOffsetB;
  });
}

function sortModifiers(modifiers) {
  let firstAnnotations = [];
  const otherModifiers = [];
  let lastAnnotations = [];
  let hasOtherModifier = false;

  /**
   * iterate in reverse order because we special-case
   * method annotations which come after all other
   * modifiers
   */
  _.forEachRight(modifiers, modifier => {
    const isAnnotation = modifier.children.annotation !== undefined;
    const isMethodAnnotation =
      isAnnotation &&
      (modifier.name === "methodModifier" ||
        modifier.name === "interfaceMethodModifier");

    if (isAnnotation) {
      if (isMethodAnnotation && !hasOtherModifier) {
        lastAnnotations.unshift(modifier);
      } else {
        firstAnnotations.unshift(modifier);
      }
    } else {
      otherModifiers.unshift(modifier);
      hasOtherModifier = true;
    }
  });

  /**
   * if there are only annotations, move everything from
   * lastAnnotations to firstAnnotations
   */
  if (!hasOtherModifier) {
    firstAnnotations = firstAnnotations.concat(lastAnnotations);
    lastAnnotations = [];
  }

  otherModifiers.sort((a, b) => {
    const modifierIndexA = orderedModifiers.indexOf(Object.keys(a.children)[0]);
    const modifierIndexB = orderedModifiers.indexOf(Object.keys(b.children)[0]);

    return modifierIndexA - modifierIndexB;
  });

  return [firstAnnotations, otherModifiers.concat(lastAnnotations)];
}

function findDeepElementInPartsArray(item, elt) {
  if (Array.isArray(item)) {
    if (item.includes(elt)) {
      return true;
    }
    for (let i = 0; i < item.length; i++) {
      if (findDeepElementInPartsArray(item[i], elt)) {
        return true;
      }
    }
  } else {
    for (const key in item) {
      if (
        typeof item[key] === "object" &&
        findDeepElementInPartsArray(item[key], elt)
      ) {
        return true;
      }
    }
  }

  return false;
}

function displaySemicolon(token, params) {
  if (params !== undefined && params.allowEmptyStatement) {
    return printTokenWithComments(token);
  }

  if (!hasComments(token)) {
    return "";
  }

  token.image = "";
  return printTokenWithComments(token);
}

function isExplicitLambdaParameter(ctx) {
  return (
    ctx &&
    ctx.lambdaParameterList &&
    ctx.lambdaParameterList[0] &&
    ctx.lambdaParameterList[0].children &&
    ctx.lambdaParameterList[0].children.explicitLambdaParameterList
  );
}

function getBlankLinesSeparator(ctx) {
  if (ctx === undefined) {
    return undefined;
  }

  const separators = [];
  for (let i = 0; i < ctx.length - 1; i++) {
    const previousRuleEndLineWithComment =
      ctx[i].trailingComments !== undefined
        ? ctx[i].trailingComments[ctx[i].trailingComments.length - 1].endLine
        : ctx[i].location.endLine;

    const nextRuleStartLineWithComment =
      ctx[i + 1].leadingComments !== undefined
        ? ctx[i + 1].leadingComments[0].startLine
        : ctx[i + 1].location.startLine;

    if (nextRuleStartLineWithComment - previousRuleEndLineWithComment > 1) {
      separators.push(concat([hardline, hardline]));
    } else {
      separators.push(hardline);
    }
  }

  return separators;
}

function getDeclarationsSeparator(
  declarations,
  needLineDeclaration,
  isSemicolon
) {
  const declarationsWithoutEmptyStatements = declarations.filter(
    declaration => !isSemicolon(declaration)
  );

  const userBlankLinesSeparators = getBlankLinesSeparator(
    declarationsWithoutEmptyStatements
  );
  const additionalBlankLines = declarationsWithoutEmptyStatements.map(
    needLineDeclaration
  );

  const separators = [];
  let indexNextNotEmptyDeclaration = 0;
  for (let i = 0; i < declarations.length - 1; i++) {
    // if the empty statement has comments
    // we want to print them on their own line
    if (isSemicolon(declarations[i])) {
      if (hasComments(declarations[i])) {
        separators.push(hardline);
      }
    } else if (
      indexNextNotEmptyDeclaration <
      declarationsWithoutEmptyStatements.length - 1
    ) {
      const isTwoHardLines =
        userBlankLinesSeparators[indexNextNotEmptyDeclaration].parts[0].type ===
        "concat";
      const additionalSep =
        !isTwoHardLines &&
        (additionalBlankLines[indexNextNotEmptyDeclaration + 1] ||
          additionalBlankLines[indexNextNotEmptyDeclaration])
          ? hardline
          : "";
      separators.push(
        concat([
          userBlankLinesSeparators[indexNextNotEmptyDeclaration],
          additionalSep
        ])
      );

      indexNextNotEmptyDeclaration += 1;
    }
  }

  return separators;
}

function needLineClassBodyDeclaration(declaration) {
  if (declaration.children.classMemberDeclaration === undefined) {
    return true;
  }

  const classMemberDeclaration = declaration.children.classMemberDeclaration[0];

  if (classMemberDeclaration.children.fieldDeclaration !== undefined) {
    const fieldDeclaration =
      classMemberDeclaration.children.fieldDeclaration[0];
    if (
      fieldDeclaration.children.fieldModifier !== undefined &&
      hasAnnotation(fieldDeclaration.children.fieldModifier)
    ) {
      return true;
    }
    return false;
  } else if (classMemberDeclaration.children.Semicolon !== undefined) {
    return false;
  }

  return true;
}

function needLineInterfaceMemberDeclaration(declaration) {
  if (declaration.children.constantDeclaration !== undefined) {
    const constantDeclaration = declaration.children.constantDeclaration[0];
    if (
      constantDeclaration.children.constantModifier !== undefined &&
      hasAnnotation(constantDeclaration.children.constantModifier)
    ) {
      return true;
    }
    return false;
  } else if (declaration.children.interfaceMethodDeclaration !== undefined) {
    const interfaceMethodDeclaration =
      declaration.children.interfaceMethodDeclaration[0];
    if (
      interfaceMethodDeclaration.children.interfaceMethodModifier !==
        undefined &&
      hasNonTrailingAnnotation(
        interfaceMethodDeclaration.children.interfaceMethodModifier
      )
    ) {
      return true;
    }
    return false;
  }

  return true;
}

function isClassBodyDeclarationASemicolon(classBodyDeclaration) {
  if (classBodyDeclaration.children.classMemberDeclaration) {
    if (
      classBodyDeclaration.children.classMemberDeclaration[0].children
        .Semicolon !== undefined
    ) {
      return true;
    }
  }
  return false;
}

function isInterfaceMemberASemicolon(interfaceMemberDeclaration) {
  return interfaceMemberDeclaration.children.Semicolon !== undefined;
}

function hasAnnotation(modifiers) {
  return modifiers.some(modifier => modifier.children.annotation !== undefined);
}

/**
 * Return true if there is a method modifier that does not come after all other modifiers
 * It is useful to know if sortModifiers will add an annotation before other modifiers
 *
 * @param methodModifiers
 * @returns {boolean}
 */
function hasNonTrailingAnnotation(methodModifiers) {
  const firstAnnotationIndex = methodModifiers.findIndex(
    modifier => modifier.children.annotation !== undefined
  );
  const lastNonAnnotationIndex = _.findLastIndex(
    methodModifiers,
    modifier => modifier.children.annotation === undefined
  );

  return (
    firstAnnotationIndex < lastNonAnnotationIndex ||
    lastNonAnnotationIndex === -1
  );
}

function getClassBodyDeclarationsSeparator(classBodyDeclarationContext) {
  return getDeclarationsSeparator(
    classBodyDeclarationContext,
    needLineClassBodyDeclaration,
    isClassBodyDeclarationASemicolon
  );
}

function getInterfaceBodyDeclarationsSeparator(
  interfaceMemberDeclarationContext
) {
  return getDeclarationsSeparator(
    interfaceMemberDeclarationContext,
    needLineInterfaceMemberDeclaration,
    isInterfaceMemberASemicolon
  );
}

function putIntoBraces(argument, separator, LBrace, RBrace) {
  const rightBraceLeadingComments = getTokenLeadingComments(RBrace);
  const lastBreakLine =
    // check if last element of the array is a line
    rightBraceLeadingComments.length !== 0 &&
    rightBraceLeadingComments[rightBraceLeadingComments.length - 1] === hardline
      ? rightBraceLeadingComments.pop()
      : separator;
  delete RBrace.leadingComments;

  let contentInsideBraces;
  if (argument === undefined || argument === "") {
    if (rightBraceLeadingComments.length === 0) {
      return concat([LBrace, RBrace]);
    }
    contentInsideBraces = [separator, ...rightBraceLeadingComments];
  } else if (rightBraceLeadingComments.length !== 0) {
    contentInsideBraces = [
      separator,
      argument,
      separator,
      ...rightBraceLeadingComments
    ];
  } else {
    contentInsideBraces = [separator, argument];
  }

  return group(
    rejectAndConcat([
      LBrace,
      indent(concat(contentInsideBraces)),
      lastBreakLine,
      RBrace
    ])
  );
}

const andOrBinaryOperators = new Set(["&&", "||", "&", "|", "^"]);
function separateTokensIntoGroups(ctx) {
  /**
   * separate tokens into groups by andOrBinaryOperators ("&&", "||", "&", "|", "^")
   * in order to break those operators in priority.
   */
  const tokens = sortTokens(
    ctx.Instanceof,
    ctx.AssignmentOperator,
    ctx.Less,
    ctx.Greater,
    ctx.BinaryOperator
  );

  const groupsOfOperator = [];
  const sortedBinaryOperators = [];
  let tmpGroup = [];
  tokens.forEach(token => {
    if (
      matchCategory(token, "'BinaryOperator'") &&
      andOrBinaryOperators.has(token.image)
    ) {
      sortedBinaryOperators.push(token);
      groupsOfOperator.push(tmpGroup);
      tmpGroup = [];
    } else {
      tmpGroup.push(token);
    }
  });

  groupsOfOperator.push(tmpGroup);

  return {
    groupsOfOperator,
    sortedBinaryOperators
  };
}

function isShiftOperator(tokens, index) {
  if (tokens.length <= index + 1) {
    return "none";
  }

  if (
    tokens[index].image === "<" &&
    tokens[index + 1].image === "<" &&
    tokens[index].startOffset === tokens[index + 1].startOffset - 1
  ) {
    return "leftShift";
  }
  if (
    tokens[index].image === ">" &&
    tokens[index + 1].image === ">" &&
    tokens[index].startOffset === tokens[index + 1].startOffset - 1
  ) {
    if (
      tokens.length > index + 2 &&
      tokens[index + 2].image === ">" &&
      tokens[index + 1].startOffset === tokens[index + 2].startOffset - 1
    ) {
      return "doubleRightShift";
    }
    return "rightShift";
  }

  return "none";
}

function retrieveNodesToken(ctx) {
  const tokens = retrieveNodesTokenRec(ctx);
  tokens.sort((token1, token2) => {
    return token1.startOffset - token2.startOffset;
  });
  return tokens;
}

function retrieveNodesTokenRec(ctx) {
  const tokens = [];
  if (
    ctx &&
    Object.prototype.hasOwnProperty.call(ctx, "image") &&
    ctx.tokenType
  ) {
    if (ctx.leadingComments) {
      tokens.push(...ctx.leadingComments);
    }
    tokens.push(ctx);
    if (ctx.trailingComments) {
      tokens.push(...ctx.trailingComments);
    }
    return tokens;
  }
  Object.keys(ctx.children).forEach(child => {
    ctx.children[child].forEach(subctx => {
      tokens.push(...retrieveNodesTokenRec(subctx));
    });
  });
  return tokens;
}

function isStatementEmptyStatement(statement) {
  return (
    statement === ";" ||
    (statement.type === "concat" && statement.parts[0] === ";")
  );
}

function sortImports(imports) {
  const staticImports = [];
  const nonStaticImports = [];

  if (imports !== undefined) {
    for (let i = 0; i < imports.length; i++) {
      if (imports[i].children.Static !== undefined) {
        staticImports.push(imports[i]);
      } else if (imports[i].children.emptyStatement === undefined) {
        nonStaticImports.push(imports[i]);
      }
    }

    // TODO: Could be optimized as we could expect that the array is already almost sorted
    const comparator = (first, second) =>
      compareFqn(
        first.children.packageOrTypeName[0],
        second.children.packageOrTypeName[0]
      );
    staticImports.sort(comparator);
    nonStaticImports.sort(comparator);
  }

  return {
    staticImports,
    nonStaticImports
  };
}

function compareFqn(packageOrTypeNameFirst, packageOrTypeNameSecond) {
  const identifiersFirst = packageOrTypeNameFirst.children.Identifier;
  const identifiersSecond = packageOrTypeNameSecond.children.Identifier;

  const minParts = Math.min(identifiersFirst.length, identifiersSecond.length);
  for (let i = 0; i < minParts; i++) {
    if (identifiersFirst[i].image < identifiersSecond[i].image) {
      return -1;
    } else if (identifiersFirst[i].image > identifiersSecond[i].image) {
      return 1;
    }
  }

  if (identifiersFirst.length < identifiersSecond.length) {
    return -1;
  } else if (identifiersFirst.length > identifiersSecond.length) {
    return 1;
  }

  return 0;
}

function isUniqueMethodInvocation(primarySuffixes) {
  if (primarySuffixes === undefined) {
    return 0;
  }

  let count = 0;
  primarySuffixes.forEach(primarySuffix => {
    if (primarySuffix.children.methodInvocationSuffix !== undefined) {
      count++;

      if (count > 1) {
        return 2;
      }
    }
  });

  return count;
}

function printArrayList({ list, extraComma, LCurly, RCurly, trailingComma }) {
  let optionalComma;
  if (trailingComma !== "none" && list !== "") {
    optionalComma = extraComma
      ? ifBreak(extraComma[0], { ...extraComma[0], image: "" })
      : ifBreak(",", "");
  } else {
    optionalComma = extraComma ? { ...extraComma[0], image: "" } : "";
  }

  return putIntoBraces(
    rejectAndConcat([list, optionalComma]),
    line,
    LCurly,
    RCurly
  );
}

module.exports = {
  buildFqn,
  reject,
  rejectAndJoin,
  rejectAndConcat,
  sortAnnotationIdentifier,
  sortClassTypeChildren,
  sortTokens,
  matchCategory,
  sortModifiers,
  rejectAndJoinSeps,
  findDeepElementInPartsArray,
  isExplicitLambdaParameter,
  getBlankLinesSeparator,
  displaySemicolon,
  rejectSeparators,
  putIntoBraces,
  getInterfaceBodyDeclarationsSeparator,
  getClassBodyDeclarationsSeparator,
  separateTokensIntoGroups,
  isShiftOperator,
  retrieveNodesToken,
  isStatementEmptyStatement,
  sortImports,
  isUniqueMethodInvocation,
  printArrayList
};
