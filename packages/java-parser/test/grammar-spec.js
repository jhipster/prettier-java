"use strict";
const { expect } = require("chai");
const prettier = require("prettier"); // for CI tests
const path = require("path");
const fse = require("fs-extra");
describe("Snapshot Tests", () => {
  const gramFile = path.resolve(__dirname, "../src/gen/grammar.json");
  let snap;

  before(() => {
    snap = fse.readFileSync(gramFile);
    //regenerate the grammar
    require("../scripts/gen-grammar");
  });

  it("ensures the grammar is up to date", () => {
    const actualGrammar = fse.readFileSync(gramFile);
    expect(
      prettier.format(actualGrammar.toString(), { parser: "json" })
    ).to.equal(prettier.format(snap.toString(), { parser: "json" }));
  });
});
