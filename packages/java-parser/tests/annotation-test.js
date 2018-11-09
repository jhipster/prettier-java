"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("annotation", () => {
  it("annotation", () => {
    expect(Parser.parse("@Bean", parser => parser.annotation())).to.deep.equal({
      type: "ANNOTATION",
      name: {
        type: "QUALIFIED_NAME",
        name: [
          {
            type: "IDENTIFIER",
            value: "Bean"
          }
        ]
      },
      hasBraces: false,
      values: []
    });
  });

  it("annotation with braces", () => {
    expect(
      Parser.parse("@Bean()", parser => parser.annotation())
    ).to.deep.equal({
      type: "ANNOTATION",
      name: {
        type: "QUALIFIED_NAME",
        name: [
          {
            type: "IDENTIFIER",
            value: "Bean"
          }
        ]
      },
      hasBraces: true,
      values: []
    });
  });

  it("annotation with element value (annotation)", () => {
    expect(
      Parser.parse("@Bean(@Something)", parser => parser.annotation())
    ).to.deep.equal({
      type: "ANNOTATION",
      name: {
        type: "QUALIFIED_NAME",
        name: [
          {
            type: "IDENTIFIER",
            value: "Bean"
          }
        ]
      },
      hasBraces: true,
      values: [
        {
          type: "ANNOTATION",
          name: {
            type: "QUALIFIED_NAME",
            name: [
              {
                type: "IDENTIFIER",
                value: "Something"
              }
            ]
          },
          hasBraces: false,
          values: []
        }
      ]
    });
  });

  it("annotation with element value (elementValueArrayInitializer)", () => {
    expect(
      Parser.parse("@Bean({@Something})", parser => parser.annotation())
    ).to.deep.equal({
      type: "ANNOTATION",
      name: {
        type: "QUALIFIED_NAME",
        name: [
          {
            type: "IDENTIFIER",
            value: "Bean"
          }
        ]
      },
      hasBraces: true,
      values: [
        {
          type: "ELEMENT_VALUE_ARRAY_INITIALIZER",
          values: [
            {
              type: "ANNOTATION",
              name: {
                type: "QUALIFIED_NAME",
                name: [
                  {
                    type: "IDENTIFIER",
                    value: "Something"
                  }
                ]
              },
              hasBraces: false,
              values: []
            }
          ]
        }
      ]
    });
  });

  it("annotation with element value pairs", () => {
    expect(
      Parser.parse("@Bean(key=@Value)", parser => parser.annotation())
    ).to.deep.equal({
      type: "ANNOTATION",
      name: {
        type: "QUALIFIED_NAME",
        name: [
          {
            type: "IDENTIFIER",
            value: "Bean"
          }
        ]
      },
      hasBraces: true,
      values: [
        {
          type: "ELEMENT_VALUE_PAIR",
          key: {
            type: "IDENTIFIER",
            value: "key"
          },
          value: {
            type: "ANNOTATION",
            name: {
              type: "QUALIFIED_NAME",
              name: [
                {
                  type: "IDENTIFIER",
                  value: "Value"
                }
              ]
            },
            hasBraces: false,
            values: []
          }
        }
      ]
    });
  });

  it("annotation with element value pair with array initialization", () => {
    expect(
      Parser.parse('@Bean(key={"Abc"})', parser => parser.annotation())
    ).to.deep.equal({
      type: "ANNOTATION",
      name: {
        type: "QUALIFIED_NAME",
        name: [
          {
            type: "IDENTIFIER",
            value: "Bean"
          }
        ]
      },
      hasBraces: true,
      values: [
        {
          type: "ELEMENT_VALUE_PAIR",
          key: {
            type: "IDENTIFIER",
            value: "key"
          },
          value: {
            type: "ELEMENT_VALUE_ARRAY_INITIALIZER",
            values: [
              {
                type: "STRING_LITERAL",
                value: '"Abc"'
              }
            ]
          }
        }
      ]
    });
  });

  it("annotation with element value pairs with array initializations", () => {
    expect(
      Parser.parse('@Bean(key={"Abc"}, key2={"Def"})', parser =>
        parser.annotation()
      )
    ).to.deep.equal({
      type: "ANNOTATION",
      name: {
        type: "QUALIFIED_NAME",
        name: [
          {
            type: "IDENTIFIER",
            value: "Bean"
          }
        ]
      },
      hasBraces: true,
      values: [
        {
          type: "ELEMENT_VALUE_PAIR",
          key: {
            type: "IDENTIFIER",
            value: "key"
          },
          value: {
            type: "ELEMENT_VALUE_ARRAY_INITIALIZER",
            values: [
              {
                type: "STRING_LITERAL",
                value: '"Abc"'
              }
            ]
          }
        },
        {
          type: "ELEMENT_VALUE_PAIR",
          key: {
            type: "IDENTIFIER",
            value: "key2"
          },
          value: {
            type: "ELEMENT_VALUE_ARRAY_INITIALIZER",
            values: [
              {
                type: "STRING_LITERAL",
                value: '"Def"'
              }
            ]
          }
        }
      ]
    });
  });
});
