"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("methodReferenceRest", () => {
  it("identifier", () => {
    expect(
      Parser.parse("::A", parser => parser.methodReferenceRest())
    ).to.deep.equal({
      type: "METHOD_REFERENCE_REST",
      typeArguments: undefined,
      name: {
        type: "IDENTIFIER",
        value: "A"
      }
    });
  });

  it("new", () => {
    expect(
      Parser.parse("::new", parser => parser.methodReferenceRest())
    ).to.deep.equal({
      type: "METHOD_REFERENCE_REST",
      typeArguments: undefined,
      name: {
        type: "NEW"
      }
    });
  });

  it("typeArguments", () => {
    expect(
      Parser.parse("::<B>A", parser => parser.methodReferenceRest())
    ).to.deep.equal({
      type: "METHOD_REFERENCE_REST",
      typeArguments: {
        type: "TYPE_ARGUMENTS",
        value: {
          type: "TYPE_LIST",
          list: [
            {
              type: "TYPE_ARGUMENT",
              argument: {
                type: "IDENTIFIER",
                value: "B"
              },
              extends: undefined,
              super: undefined
            }
          ]
        }
      },
      name: {
        type: "IDENTIFIER",
        value: "A"
      }
    });
  });
});
