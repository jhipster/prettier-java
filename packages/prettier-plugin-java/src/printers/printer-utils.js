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

module.exports = {
  buildFqn,
  rejectAndJoin,
  rejectAndConcat
};
