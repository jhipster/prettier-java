"use strict";
const _ = require("lodash");
const { join, concat } = require("./prettier-builder");

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
    if (item.parts && item.parts.length === 0) {
      return false;
    }
    return item != false;
  });
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
module.exports = {
  buildFqn,
  rejectAndJoin,
  rejectAndConcat,
  sortAnnotationIdentifier,
  sortClassTypeChildren,
  sortTokens,
  matchCategory,
  sortModifiers,
  rejectAndJoinSeps,
  findDeepElementInPartsArray
};
