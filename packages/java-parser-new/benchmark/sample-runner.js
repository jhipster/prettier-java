"use strict";
/* eslint-disable import/no-extraneous-dependencies, no-console */
const javaParserChev = require("../src/index");

const input = `
    @javax.jdo.annotations.Query(name = "find", language = "JDOQL", value = "SELECT "
        + "FROM domainapp.dom.modules.simple.SimpleObject ")
`;

javaParserChev.parse(input, "elementValue");
