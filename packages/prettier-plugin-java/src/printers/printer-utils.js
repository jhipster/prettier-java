"use strict";
const { join } = require("prettier").doc.builders;

function buildFqn(tokens) {
  const images = tokens.map(tok => tok.image);
  return join(".", images);
}

function rejectAndJoin(sep, elems) {
  const actualElements = elems.filter(item => {
    // eslint-ignore next - We want the conversion to boolean!
    return item != false;
  });

  return join(sep, actualElements);
}

module.exports = {
  buildFqn,
  rejectAndJoin
};
