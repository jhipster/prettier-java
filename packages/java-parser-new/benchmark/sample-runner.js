"use strict";
/* eslint-disable import/no-extraneous-dependencies, no-console */
const javaParserChev = require("../src/index");

const input = `StringBuilder builder = new StringBuilder();`;
javaParserChev.parse(
  `
    Map<String, Object> carProperties = new HashMap<>();
    carProperties.put(HasModel.PROPERTY, "300SL");`,
  "blockStatements"
);
