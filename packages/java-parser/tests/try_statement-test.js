"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("tryStatement", () => {
  it("only try", () => {
    expect(
      Parser.parse("try {}", parser => parser.tryStatement())
    ).to.deep.equal({
      type: "TRY_STATEMENT",
      resourceSpecification: undefined,
      body: {
        type: "BLOCK",
        statements: []
      },
      catchClauses: [],
      finally: undefined
    });
  });

  it("one catchClause", () => {
    expect(
      Parser.parse("try {} catch (A e) {}", parser => parser.tryStatement())
    ).to.deep.equal({
      type: "TRY_STATEMENT",
      resourceSpecification: undefined,
      body: {
        type: "BLOCK",
        statements: []
      },
      catchClauses: [
        {
          type: "CATCH_CLAUSE",
          modifiers: [],
          catchType: {
            type: "CATCH_TYPE",
            list: [
              {
                type: "QUALIFIED_NAME",
                name: [
                  {
                    type: "IDENTIFIER",
                    value: "A"
                  }
                ]
              }
            ]
          },
          id: {
            type: "IDENTIFIER",
            value: "e"
          },
          block: {
            type: "BLOCK",
            statements: []
          }
        }
      ],
      finally: undefined
    });
  });

  it("multiple catchClauses", () => {
    expect(
      Parser.parse("try {} catch (A e) {} catch (B e) {}", parser =>
        parser.tryStatement()
      )
    ).to.deep.equal({
      type: "TRY_STATEMENT",
      resourceSpecification: undefined,
      body: {
        type: "BLOCK",
        statements: []
      },
      catchClauses: [
        {
          type: "CATCH_CLAUSE",
          modifiers: [],
          catchType: {
            type: "CATCH_TYPE",
            list: [
              {
                type: "QUALIFIED_NAME",
                name: [
                  {
                    type: "IDENTIFIER",
                    value: "A"
                  }
                ]
              }
            ]
          },
          id: {
            type: "IDENTIFIER",
            value: "e"
          },
          block: {
            type: "BLOCK",
            statements: []
          }
        },
        {
          type: "CATCH_CLAUSE",
          modifiers: [],
          catchType: {
            type: "CATCH_TYPE",
            list: [
              {
                type: "QUALIFIED_NAME",
                name: [
                  {
                    type: "IDENTIFIER",
                    value: "B"
                  }
                ]
              }
            ]
          },
          id: {
            type: "IDENTIFIER",
            value: "e"
          },
          block: {
            type: "BLOCK",
            statements: []
          }
        }
      ],
      finally: undefined
    });
  });

  it("resourceSpecification", () => {
    expect(
      Parser.parse("try ( A.B a = this ) {} catch (A e) {}", parser =>
        parser.tryStatement()
      )
    ).to.deep.equal({
      type: "TRY_STATEMENT",
      resourceSpecification: {
        type: "RESOURCE_SPECIFICATION",
        resources: {
          type: "RESOURCES",
          resources: [
            {
              type: "RESOURCE",
              modifiers: [],
              typeType: {
                type: "CLASS_OR_INTERFACE_TYPE",
                elements: [
                  {
                    type: "IDENTIFIER",
                    value: "A"
                  },
                  {
                    type: "IDENTIFIER",
                    value: "B"
                  }
                ]
              },
              id: {
                type: "VARIABLE_DECLARATOR_ID",
                id: {
                  type: "IDENTIFIER",
                  value: "a"
                },
                dimensions: []
              },
              expression: {
                type: "THIS"
              }
            }
          ]
        }
      },
      body: {
        type: "BLOCK",
        statements: []
      },
      catchClauses: [
        {
          type: "CATCH_CLAUSE",
          modifiers: [],
          catchType: {
            type: "CATCH_TYPE",
            list: [
              {
                type: "QUALIFIED_NAME",
                name: [
                  {
                    type: "IDENTIFIER",
                    value: "A"
                  }
                ]
              }
            ]
          },
          id: {
            type: "IDENTIFIER",
            value: "e"
          },
          block: {
            type: "BLOCK",
            statements: []
          }
        }
      ],
      finally: undefined
    });
  });

  it("one catchClause with finallyBlock", () => {
    expect(
      Parser.parse("try {} catch (A e) {} finally {}", parser =>
        parser.tryStatement()
      )
    ).to.deep.equal({
      type: "TRY_STATEMENT",
      resourceSpecification: undefined,
      body: {
        type: "BLOCK",
        statements: []
      },
      catchClauses: [
        {
          type: "CATCH_CLAUSE",
          modifiers: [],
          catchType: {
            type: "CATCH_TYPE",
            list: [
              {
                type: "QUALIFIED_NAME",
                name: [
                  {
                    type: "IDENTIFIER",
                    value: "A"
                  }
                ]
              }
            ]
          },
          id: {
            type: "IDENTIFIER",
            value: "e"
          },
          block: {
            type: "BLOCK",
            statements: []
          }
        }
      ],
      finally: {
        type: "FINALLY_BLOCK",
        block: {
          type: "BLOCK",
          statements: []
        }
      }
    });
  });

  it("only finallyBlock", () => {
    expect(
      Parser.parse("try {} finally {}", parser => parser.tryStatement())
    ).to.deep.equal({
      type: "TRY_STATEMENT",
      resourceSpecification: undefined,
      body: {
        type: "BLOCK",
        statements: []
      },
      catchClauses: [],
      finally: {
        type: "FINALLY_BLOCK",
        block: {
          type: "BLOCK",
          statements: []
        }
      }
    });
  });
});
