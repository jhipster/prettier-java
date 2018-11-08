const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `package my.own.pkg;

import something.Different;
import java.utils.*;
import abc.def.Something;
import abc.def.Another;

public class PackageAndImports {}
`;

  const expectedOutput = `package my.own.pkg;

import abc.def.Another;
import abc.def.Something;

import java.utils.*;

import something.Different;

public class PackageAndImports {}

`;

  it("can format package_and_imports", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
