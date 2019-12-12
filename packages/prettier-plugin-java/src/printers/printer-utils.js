"use strict";
const _ = require("lodash");
const { join, concat, group } = require("./prettier-builder");
const { printTokenWithComments } = require("./comments");
const { indent, hardline } = require("prettier").doc.builders;

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

function hasLeadingComments(token) {
  return token.leadingComments !== undefined;
}

function hasTrailingComments(token) {
  return token.trailingComments !== undefined;
}

function hasLeadingLineComments(token) {
  return (
    token.leadingComments !== undefined &&
    token.leadingComments.length !== 0 &&
    token.leadingComments[token.leadingComments.length - 1].tokenType.name ===
      "LineComment"
  );
}

function hasTrailingLineComments(token) {
  return (
    token.trailingComments !== undefined &&
    token.trailingComments.length !== 0 &&
    token.trailingComments[token.trailingComments.length - 1].tokenType.name ===
      "LineComment"
  );
}

function hasComments(token) {
  return hasLeadingComments(token) || hasTrailingComments(token);
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
    const previousRuleEndLine = ctx[i].location.endLine;
    const nextRuleStartLine = ctx[i + 1].location.startLine;

    if (nextRuleStartLine > previousRuleEndLine + 1) {
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
  const separators = [];
  const additionalBlankLines = [];

  declarations.forEach(declaration => {
    if (needLineDeclaration(declaration)) {
      additionalBlankLines.push(hardline);
    } else {
      additionalBlankLines.push("");
    }
  });

  const userBlankLinesSeparators = getBlankLinesSeparator(declarations);

  for (let i = 0; i < declarations.length - 1; i++) {
    if (!isSemicolon(declarations[i])) {
      const isTwoHardLines =
        userBlankLinesSeparators[i].parts[0].type === "concat";
      const additionalSep =
        !isTwoHardLines &&
        (additionalBlankLines[i + 1] !== "" || additionalBlankLines[i] !== "")
          ? hardline
          : "";
      separators.push(concat([userBlankLinesSeparators[i], additionalSep]));
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
      fieldDeclaration.children.fieldModifier[0].children.annotation !==
        undefined
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
      constantDeclaration.children.constantModifier[0].children.annotation !==
        undefined
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
      interfaceMethodDeclaration.children.interfaceMethodModifier[0].children
        .annotation !== undefined
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
  if (argument === undefined || argument === "") {
    return concat([LBrace, RBrace]);
  }

  return group(
    rejectAndConcat([
      LBrace,
      indent(concat([separator, argument])),
      separator,
      RBrace
    ])
  );
}

function putIntoCurlyBraces(argument, separator, LBrace, RBrace) {
  if (argument !== undefined && argument !== "") {
    return putIntoBraces(argument, separator, LBrace, RBrace);
  }

  if (hasTrailingComments(LBrace) || hasLeadingComments(RBrace)) {
    return concat([LBrace, indent(hardline), RBrace]);
  }

  return concat([LBrace, RBrace]);
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
  hasLeadingLineComments,
  hasTrailingLineComments,
  isExplicitLambdaParameter,
  getBlankLinesSeparator,
  displaySemicolon,
  rejectSeparators,
  putIntoBraces,
  putIntoCurlyBraces,
  getInterfaceBodyDeclarationsSeparator,
  getClassBodyDeclarationsSeparator,
  separateTokensIntoGroups,
  isShiftOperator,
  retrieveNodesToken,
  isStatementEmptyStatement,
  sortImports,
  isUniqueMethodInvocation
};
