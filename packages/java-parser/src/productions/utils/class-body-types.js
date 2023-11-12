"use strict";

const classBodyTypes = {
  unknown: 0,
  fieldDeclaration: 1,
  methodDeclaration: 2,
  classDeclaration: 3,
  interfaceDeclaration: 4,
  semiColon: 5,
  instanceInitializer: 6,
  staticInitializer: 7,
  constructorDeclaration: 8
};

module.exports = {
  classBodyTypes
};
