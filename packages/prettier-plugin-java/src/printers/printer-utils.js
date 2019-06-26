"use strict";
const _ = require("lodash");
const {
  join,
  concat,
  group,
  getImageWithComments
} = require("./prettier-builder");
const { indent, hardline } = require("prettier").doc.builders;

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
  const firstAnnotations = [];
  const otherModifiers = [];
  let hasOtherModifier = false;

  _.forEach(modifiers, modifier => {
    if (hasOtherModifier) {
      otherModifiers.push(modifier);
    } else if (modifier.children.annotation) {
      firstAnnotations.push(modifier);
    } else {
      otherModifiers.push(modifier);
      hasOtherModifier = true;
    }
  });

  return [firstAnnotations, otherModifiers];
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
    return getImageWithComments(token);
  }

  if (!hasComments(token)) {
    return "";
  }

  token.image = "";
  return getImageWithComments(token);
}

function hasLeadingComments(token) {
  return token.leadingComments !== undefined;
}

function hasTrailingComments(token) {
  return token.trailingComments !== undefined;
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
  if (ctx && ctx.hasOwnProperty("image") && ctx.tokenType) {
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

function buildOriginalText(firstToken, lastToken, originalText) {
  let startOffset = firstToken.startOffset;
  let endOffset = lastToken.endOffset;
  if (firstToken.leadingComments) {
    startOffset = firstToken.leadingComments[0].startOffset;
  }
  if (lastToken.trailingComments) {
    endOffset =
      lastToken.trailingComments[lastToken.trailingComments.length - 1]
        .endOffset;
  }
  return originalText.substring(startOffset, endOffset + 1);
}

function getCSTNodeStartEndToken(ctx) {
  const tokens = [];
  if (ctx && ctx.hasOwnProperty("image") && ctx.tokenType) {
    return [ctx, ctx];
  }
  Object.keys(ctx.children).forEach(child => {
    ctx.children[child].forEach(subctx => {
      const subStartEndToken = getCSTNodeStartEndToken(subctx);
      if (subStartEndToken) {
        tokens.push(subStartEndToken);
      }
    });
  });
  if (tokens.length === 0) {
    return;
  }
  const startEndTokens = tokens.reduce((tokenArr1, tokenArr2) => {
    const ftoken =
      tokenArr1[0].startOffset - tokenArr2[0].startOffset < 0
        ? tokenArr1[0]
        : tokenArr2[0];
    const ltoken =
      tokenArr2[1].startOffset - tokenArr1[1].startOffset < 0
        ? tokenArr1[1]
        : tokenArr2[1];
    return [ftoken, ltoken];
  });
  return startEndTokens;
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
  putIntoCurlyBraces,
  getInterfaceBodyDeclarationsSeparator,
  getClassBodyDeclarationsSeparator,
  separateTokensIntoGroups,
  isShiftOperator,
  retrieveNodesToken,
  buildOriginalText,
  getCSTNodeStartEndToken
};
