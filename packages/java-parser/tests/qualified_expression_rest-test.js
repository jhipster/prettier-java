"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("qualifiedExpressionRest", () => {
  it("methodInvocation", () => {
    expect(
      Parser.parse(".a()", parser => parser.qualifiedExpressionRest())
    ).to.deep.equal({
      type: "METHOD_INVOCATION",
      name: {
        type: "IDENTIFIER",
        value: "a"
      },
      parameters: undefined,
      dimensions: []
    });
  });

  it("multiple methodInvocations", () => {
    expect(
      Parser.parse(".a().b()", parser => parser.qualifiedExpressionRest())
    ).to.deep.equal({
      type: "QUALIFIED_EXPRESSION",
      expression: {
        type: "METHOD_INVOCATION",
        name: {
          type: "IDENTIFIER",
          value: "a"
        },
        parameters: undefined,
        dimensions: []
      },
      rest: {
        type: "METHOD_INVOCATION",
        name: {
          type: "IDENTIFIER",
          value: "b"
        },
        parameters: undefined,
        dimensions: []
      }
    });
  });

  it("identifier", () => {
    expect(
      Parser.parse(".a", parser => parser.qualifiedExpressionRest())
    ).to.deep.equal({
      type: "IDENTIFIER",
      value: "a"
    });
  });

  it("this", () => {
    expect(
      Parser.parse(".this", parser => parser.qualifiedExpressionRest())
    ).to.deep.equal({
      type: "THIS"
    });
  });

  it("super", () => {
    expect(
      Parser.parse(".super", parser => parser.qualifiedExpressionRest())
    ).to.deep.equal({
      type: "SUPER"
    });
  });

  it("class", () => {
    expect(
      Parser.parse(".class", parser => parser.qualifiedExpressionRest())
    ).to.deep.equal({
      type: "CLASS"
    });
  });

  it("creatorOptionalNonWildcardInnerCreator", () => {
    expect(
      Parser.parse(".new a()", parser => parser.qualifiedExpressionRest())
    ).to.deep.equal({
      type: "CREATOR_OPTIONAL_NON_WILDCARD_INNER_CREATOR",
      typeArguments: undefined,
      innerCreator: {
        type: "INNER_CREATOR",
        id: {
          type: "IDENTIFIER",
          value: "a"
        },
        typeArguments: undefined,
        rest: {
          type: "CLASS_CREATOR_REST",
          arguments: {
            type: "EXPRESSION_LIST",
            list: []
          },
          body: undefined
        }
      }
    });
  });

  it("explicitGenericInvocation", () => {
    expect(
      Parser.parse(".<boolean> super()", parser =>
        parser.qualifiedExpressionRest()
      )
    ).to.deep.equal({
      type: "GENERIC_INVOCATION",
      typeArguments: {
        type: "TYPE_ARGUMENTS",
        value: {
          type: "TYPE_LIST",
          list: [
            {
              type: "PRIMITIVE_TYPE",
              value: "boolean"
            }
          ]
        }
      },
      invocation: {
        type: "SUPER",
        arguments: {
          type: "EXPRESSION_LIST",
          list: []
        }
      }
    });
  });
});
