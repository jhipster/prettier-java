"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("classOrInterfaceModifier", () => {
  it("public", () => {
    expect(
      Parser.parse("public", parser => parser.classOrInterfaceModifier())
    ).to.deep.equal({
      type: "MODIFIER",
      value: "public"
    });
  });

  it("protected", () => {
    expect(
      Parser.parse("protected", parser => parser.classOrInterfaceModifier())
    ).to.deep.equal({
      type: "MODIFIER",
      value: "protected"
    });
  });

  it("private", () => {
    expect(
      Parser.parse("private", parser => parser.classOrInterfaceModifier())
    ).to.deep.equal({
      type: "MODIFIER",
      value: "private"
    });
  });

  it("static", () => {
    expect(
      Parser.parse("static", parser => parser.classOrInterfaceModifier())
    ).to.deep.equal({
      type: "MODIFIER",
      value: "static"
    });
  });

  it("abstract", () => {
    expect(
      Parser.parse("abstract", parser => parser.classOrInterfaceModifier())
    ).to.deep.equal({
      type: "MODIFIER",
      value: "abstract"
    });
  });

  it("final", () => {
    expect(
      Parser.parse("final", parser => parser.classOrInterfaceModifier())
    ).to.deep.equal({
      type: "MODIFIER",
      value: "final"
    });
  });

  it("strictfp", () => {
    expect(
      Parser.parse("strictfp", parser => parser.classOrInterfaceModifier())
    ).to.deep.equal({
      type: "MODIFIER",
      value: "strictfp"
    });
  });

  it("annotation", () => {
    expect(
      Parser.parse("@Bean", parser => parser.classOrInterfaceModifier())
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
      values: [],
      hasBraces: false
    });
  });

  it("annotation with braces", () => {
    expect(
      Parser.parse("@Bean()", parser => parser.classOrInterfaceModifier())
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
      Parser.parse("@Bean(@Something)", parser =>
        parser.classOrInterfaceModifier()
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
      Parser.parse("@Bean({@Something})", parser =>
        parser.classOrInterfaceModifier()
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
      Parser.parse("@Bean(key=@Value)", parser =>
        parser.classOrInterfaceModifier()
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
});
