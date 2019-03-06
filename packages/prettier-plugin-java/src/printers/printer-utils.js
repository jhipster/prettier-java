"use strict";
const { join, concat } = require("prettier").doc.builders;

function buildFqn(tokens) {
  const images = tokens.map(tok => tok.image);
  return join(".", images);
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
  const tokens = [...annotations, ...identifiers];

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
  for (let i = 0; i < arguments.length; i++) {
    if (arguments[i]) {
      tokens = tokens.concat(arguments[i]);
    }
  }

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

module.exports = {
  buildFqn,
  rejectAndJoin,
  rejectAndConcat,
  sortAnnotationIdentifier,
  sortTokens,
  matchCategory
};
