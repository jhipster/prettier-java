"use strict";
const {
  Parser,
  createTokenInstance,
  EOF,
  tokenMatcher
} = require("chevrotain");
const { allTokens, tokens } = require("./tokens");

const END_OF_FILE = createTokenInstance(EOF, "", NaN, NaN, NaN, NaN, NaN, NaN);
Object.freeze(END_OF_FILE);

class JavaParser extends Parser {
  constructor() {
    super(allTokens);

    const $ = this;

    // compilationUnit
    // : packageDeclaration? importDeclaration* typeDeclaration* EOF
    $.RULE("compilationUnit", () => {
      let foundTypeDeclaration = false;
      $.OPTION(() => {
        $.MANY(() => $.SUBRULE($.annotation));
        $.OR([
          { ALT: () => $.SUBRULE($.packageDeclaration) },
          {
            ALT: () => {
              $.MANY2(() => {
                $.SUBRULE($.typeDeclaration);
                foundTypeDeclaration = true;
              });
            }
          }
        ]);
      });
      $.OPTION2({
        GATE: () => !foundTypeDeclaration,
        DEF: () => {
          $.MANY3(() => {
            $.SUBRULE2($.importDeclaration);
          });
          $.MANY4(() => {
            $.SUBRULE2($.typeDeclaration);
          });
        }
      });
    });

    // packageDeclaration
    // : annotation* PACKAGE qualifiedName ';'
    $.RULE("packageDeclaration", () => {
      $.CONSUME(tokens.Package);
      $.SUBRULE($.qualifiedName);
      $.SUBRULE($.semiColon);
    });

    // importDeclaration
    // : IMPORT STATIC? qualifiedName ('.' '*')? ';'
    $.RULE("importDeclaration", () => {
      $.CONSUME(tokens.Import);
      $.OPTION(() => {
        $.CONSUME(tokens.Static);
      });
      $.SUBRULE($.qualifiedName);
      $.OPTION2(() => {
        $.CONSUME(tokens.Dot);
        $.CONSUME(tokens.Star);
      });
      $.SUBRULE($.semiColon);
    });

    // typeDeclaration
    // : classOrInterfaceModifier*
    //   (classDeclaration | enumDeclaration | interfaceDeclaration | annotationTypeDeclaration)
    $.RULE("typeDeclaration", () => {
      $.MANY(() => {
        $.SUBRULE($.classOrInterfaceModifier);
      });
      $.OR([
        { ALT: () => $.SUBRULE($.classDeclaration) },
        { ALT: () => $.SUBRULE($.enumDeclaration) },
        { ALT: () => $.SUBRULE($.interfaceDeclaration) },
        { ALT: () => $.SUBRULE($.annotationTypeDeclaration) }
      ]);
    });

    // modifier
    // : classOrInterfaceModifier
    // | NATIVE
    // | SYNCHRONIZED
    // | TRANSIENT
    // | VOLATILE
    $.RULE("modifier", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.classOrInterfaceModifier) },
        { ALT: () => $.CONSUME(tokens.Native) },
        { ALT: () => $.CONSUME(tokens.Synchronized) },
        { ALT: () => $.CONSUME(tokens.Transient) },
        { ALT: () => $.CONSUME(tokens.Volatile) }
      ]);
    });

    // classOrInterfaceModifier
    // : annotation
    // | PUBLIC
    // | PROTECTED
    // | PRIVATE
    // | STATIC
    // | ABSTRACT
    // | FINAL    // FINAL for class only -- does not apply to interfaces
    // | STRICTFP
    $.RULE("classOrInterfaceModifier", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.annotation) },
        { ALT: () => $.CONSUME(tokens.Public) },
        { ALT: () => $.CONSUME(tokens.Protected) },
        { ALT: () => $.CONSUME(tokens.Private) },
        { ALT: () => $.CONSUME(tokens.Static) },
        { ALT: () => $.CONSUME(tokens.Abstract) },
        { ALT: () => $.CONSUME(tokens.Final) },
        { ALT: () => $.CONSUME(tokens.Strictfp) }
      ]);
    });

    // variableModifier
    // : FINAL
    // | annotation
    $.RULE("variableModifier", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.annotation) },
        { ALT: () => $.CONSUME(tokens.Final) }
      ]);
    });

    // annotation
    // : '@' qualifiedName ('(' ( elementValuePairs* | elementValue )? ')')?
    $.RULE("annotation", () => {
      $.CONSUME(tokens.At);
      $.SUBRULE($.qualifiedName);
      $.OPTION(() => {
        $.CONSUME(tokens.LBrace);
        $.OPTION2(() => {
          $.OR([
            {
              ALT: () => {
                $.SUBRULE($.expression);
              }
            },
            { ALT: () => $.SUBRULE($.elementValueArrayInitializer) }
          ]);
          $.MANY(() => {
            $.CONSUME(tokens.Comma);
            $.SUBRULE2($.elementValuePair);
          });
        });
        $.CONSUME(tokens.RBrace);
      });
    });

    // elementValuePairs
    // : elementValuePair (',' elementValuePair)*
    $.RULE("elementValuePairs", () => {
      $.AT_LEAST_ONE_SEP({
        SEP: tokens.Comma,
        DEF: () => {
          $.SUBRULE($.elementValuePair);
        }
      });
    });

    // elementValuePair
    // : IDENTIFIER '=' elementValue
    $.RULE("elementValuePair", () => {
      $.CONSUME(tokens.Identifier);
      $.CONSUME(tokens.Equals);
      $.SUBRULE($.elementValue);
    });

    // elementValue
    // : expression
    // | annotation
    // | elementValueArrayInitializer
    $.RULE("elementValue", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.expression) },
        { ALT: () => $.SUBRULE($.elementValueArrayInitializer) }
      ]);
    });

    // elementValueArrayInitializer
    // : '{' (elementValue (',' elementValue)*)? (',')? '}'
    $.RULE("elementValueArrayInitializer", () => {
      $.CONSUME(tokens.LCurly);
      $.OPTION(() => {
        $.SUBRULE($.elementValue);
        $.MANY(() => {
          $.CONSUME(tokens.Comma);
          $.SUBRULE2($.elementValue);
        });
      });
      $.OPTION2(() => {
        $.CONSUME2(tokens.Comma);
      });
      $.CONSUME(tokens.RCurly);
    });

    // classDeclaration
    // : CLASS IDENTIFIER typeParameters?
    //   (EXTENDS typeType)?
    //   (IMPLEMENTS typeList)?
    //   classBody
    $.RULE("classDeclaration", () => {
      $.CONSUME(tokens.Class);
      $.CONSUME(tokens.Identifier);
      $.OPTION(() => {
        $.SUBRULE($.typeParameters);
      });
      $.OPTION2(() => {
        $.CONSUME(tokens.Extends);
        $.SUBRULE($.typeType);
      });
      $.OPTION3(() => {
        $.CONSUME(tokens.Implements);
        $.SUBRULE($.typeList);
      });
      $.SUBRULE($.classBody);
    });

    // typeParameters
    // : '<' typeParameter (',' typeParameter)* '>'
    $.RULE("typeParameters", () => {
      $.CONSUME(tokens.Less);
      $.AT_LEAST_ONE_SEP({
        SEP: tokens.Comma,
        DEF: () => {
          $.SUBRULE($.typeParameter);
        }
      });
      $.CONSUME(tokens.Greater);
    });

    // typeParameter
    // : annotation* IDENTIFIER (EXTENDS typeBound)?
    $.RULE("typeParameter", () => {
      $.MANY(() => {
        $.SUBRULE($.annotation);
      });
      $.CONSUME(tokens.Identifier);
      $.OPTION(() => {
        $.CONSUME(tokens.Extends);
        $.SUBRULE($.typeBound);
      });
    });

    // typeBound
    // : typeType ('&' typeType)*
    $.RULE("typeBound", () => {
      $.AT_LEAST_ONE_SEP({
        SEP: tokens.And,
        DEF: () => {
          $.SUBRULE($.typeType);
        }
      });
    });

    // classBody
    // : '{' classBodyDeclaration* '}'
    $.RULE("classBody", () => {
      $.CONSUME(tokens.LCurly);
      $.MANY(() => {
        $.SUBRULE($.classBodyDeclaration);
      });
      $.CONSUME(tokens.RCurly);
    });

    // classBodyDeclaration
    // : STATIC? block
    // | modifier* memberDeclaration
    // | ';'
    $.RULE("classBodyDeclaration", () => {
      $.OPTION(() => {
        $.CONSUME(tokens.Static);
      });
      $.OR([
        {
          ALT: () => {
            $.SUBRULE($.block);
          }
        },
        {
          // classBodyMemberDeclaration
          ALT: () => {
            $.MANY(() => {
              $.SUBRULE($.modifier);
            });
            $.SUBRULE($.memberDeclaration);
          }
        },
        {
          // semiColon
          ALT: () => {
            $.SUBRULE($.semiColon);
          }
        }
      ]);
    });

    // memberDeclaration
    // : fieldDeclarationOrMethodDeclarationOrConstructorDeclaration
    // | genericMethodDeclarationOrGenericConstructorDeclaration
    // | interfaceDeclaration
    // | annotationTypeDeclaration
    // | classDeclaration
    // | enumDeclaration
    $.RULE("memberDeclaration", () => {
      $.OR([
        {
          ALT: () =>
            $.SUBRULE(
              $.fieldDeclarationOrMethodDeclarationOrConstructorDeclaration
            )
        },
        {
          ALT: () =>
            $.SUBRULE($.genericMethodDeclarationOrGenericConstructorDeclaration)
        },
        { ALT: () => $.SUBRULE($.interfaceDeclaration) },
        { ALT: () => $.SUBRULE($.annotationTypeDeclaration) },
        { ALT: () => $.SUBRULE($.classDeclaration) },
        { ALT: () => $.SUBRULE($.enumDeclaration) }
      ]);
    });

    // fieldDeclarationOrMethodDeclarationOrConstructorDeclaration
    // : fieldDeclaration
    // | methodDeclaration
    // | constructorDeclaration
    $.RULE(
      "fieldDeclarationOrMethodDeclarationOrConstructorDeclaration",
      () => {
        let isFieldDeclaration = true;
        let isMethodDeclaration = true;
        let isConstructorDeclaration = true;
        let firstType = undefined;
        // typeTypeOrVoid
        $.OR([
          {
            // typeType
            ALT: () => {
              $.OPTION(() => {
                $.SUBRULE($.annotation);
                isConstructorDeclaration = false;
              });
              $.OR2([
                {
                  ALT: () => {
                    firstType = $.CONSUME(tokens.Identifier);

                    $.OR3([
                      {
                        // constructorDeclaration
                        GATE: () => isConstructorDeclaration,
                        ALT: () => {
                          $.SUBRULE($.formalParameters);
                          $.OPTION2(() => {
                            $.CONSUME(tokens.Throws);
                            $.SUBRULE($.qualifiedNameList);
                          });
                          $.SUBRULE($.methodBody);
                          isFieldDeclaration = false;
                          isMethodDeclaration = false;
                          firstType.isConstructorDeclaration = true;
                        }
                      },
                      {
                        ALT: () => {
                          $.OPTION3(() => {
                            $.SUBRULE($.typeArguments);
                          });
                          $.MANY({
                            GATE: () => this.LA(2).tokenType !== tokens.Class,
                            DEF: () => {
                              $.CONSUME(tokens.Dot);
                              $.SUBRULE2($.classOrInterfaceTypeElement);
                            }
                          });
                          isConstructorDeclaration = false;
                        }
                      }
                    ]);
                  }
                },
                {
                  ALT: () => {
                    firstType = $.SUBRULE($.primitiveType);
                    isConstructorDeclaration = false;
                  }
                }
              ]);
              $.MANY2({
                GATE: () => !isConstructorDeclaration,
                DEF: () => {
                  const lSquare = $.CONSUME(tokens.LSquare);
                  lSquare.isTypeType = true;
                  $.CONSUME(tokens.RSquare);
                }
              });
            }
          },
          {
            // Void
            ALT: () => {
              firstType = $.CONSUME(tokens.Void);
              isConstructorDeclaration = false;
              isFieldDeclaration = false;
            }
          }
        ]);
        $.OR4([
          {
            GATE: () => isMethodDeclaration || isFieldDeclaration,
            ALT: () => {
              $.CONSUME2(tokens.Identifier);

              $.OR5([
                {
                  // fieldDeclaration
                  ALT: () => {
                    $.MANY3(() => {
                      $.CONSUME2(tokens.LSquare, {
                        LABEL: "identifierDimension"
                      });
                      $.CONSUME2(tokens.RSquare);
                    });
                    $.OPTION4(() => {
                      $.CONSUME(tokens.Equals);
                      $.SUBRULE($.variableInitializer);
                    });
                    $.MANY4(() => {
                      $.CONSUME(tokens.Comma);
                      $.SUBRULE($.variableDeclarator);
                    });
                    $.SUBRULE($.semiColon);
                    if (firstType) {
                      firstType.isFieldDeclaration = true;
                    }
                  }
                },
                {
                  // methodDeclaration
                  ALT: () => {
                    $.SUBRULE2($.formalParameters);
                    $.MANY5(() => {
                      $.CONSUME3(tokens.LSquare);
                      $.CONSUME3(tokens.RSquare);
                    });
                    $.OPTION5(() => {
                      $.CONSUME2(tokens.Throws);
                      $.SUBRULE2($.qualifiedNameList);
                    });
                    $.SUBRULE2($.methodBody);
                    if (firstType) {
                      firstType.isMethodDeclaration = true;
                    }
                  }
                }
              ]);
            }
          },
          {
            ALT: () => {
              // empty
            }
          }
        ]);
      }
    );

    // methodDeclaration
    // : typeTypeOrVoid IDENTIFIER formalParameters ('[' ']')*
    //   (THROWS qualifiedNameList)?
    //   methodBody
    $.RULE("methodDeclaration", () => {
      $.SUBRULE($.typeTypeOrVoid);
      $.CONSUME(tokens.Identifier);
      $.SUBRULE($.formalParameters);
      $.MANY(() => {
        $.CONSUME(tokens.LSquare);
        $.CONSUME(tokens.RSquare);
      });
      $.OPTION(() => {
        $.CONSUME(tokens.Throws);
        $.SUBRULE($.qualifiedNameList);
      });
      $.SUBRULE($.methodBody);
    });

    // constructorDeclaration
    // : IDENTIFIER formalParameters (THROWS qualifiedNameList)? block
    $.RULE("constructorDeclaration", () => {
      $.CONSUME(tokens.Identifier);
      $.SUBRULE($.formalParameters);
      $.OPTION(() => {
        $.CONSUME(tokens.Throws);
        $.SUBRULE($.qualifiedNameList);
      });
      $.SUBRULE($.methodBody);
    });

    // genericMethodDeclarationOrGenericConstructorDeclaration
    // : typeParameters methodDeclaration
    $.RULE("genericMethodDeclarationOrGenericConstructorDeclaration", () => {
      $.SUBRULE($.typeParameters);
      $.OR([
        { ALT: () => $.SUBRULE($.methodDeclaration) },
        { ALT: () => $.SUBRULE($.constructorDeclaration) }
      ]);
    });

    // fieldDeclaration
    // : typeType variableDeclarators ';'
    $.RULE("fieldDeclaration", () => {
      $.SUBRULE($.typeType);
      $.SUBRULE($.variableDeclarators);
      $.SUBRULE($.semiColon);
    });

    // methodBody
    // : block
    // | ";"
    $.RULE("methodBody", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.block) },
        { ALT: () => $.SUBRULE($.semiColon) }
      ]);
    });

    // enumDeclaration
    // : ENUM IDENTIFIER (IMPLEMENTS typeList)? '{' enumConstants? ','? enumBodyDeclarations? '}'
    $.RULE("enumDeclaration", () => {
      $.CONSUME(tokens.Enum);
      $.CONSUME(tokens.Identifier);
      $.OPTION(() => {
        $.CONSUME(tokens.Implements);
        $.SUBRULE($.typeList);
      });
      $.CONSUME(tokens.LCurly);
      $.OPTION2(() => {
        $.SUBRULE($.enumConstants);
      });
      $.OPTION3(() => {
        $.CONSUME(tokens.Comma);
      });
      $.OPTION4(() => {
        $.SUBRULE($.enumBodyDeclarations);
      });
      $.CONSUME(tokens.RCurly);
    });

    // enumConstants
    // : enumConstant (',' enumConstant)*
    $.RULE("enumConstants", () => {
      $.SUBRULE($.enumConstant);
      $.MANY({
        // It can have a single comma at the end
        // What should follow is a right curly OR
        // a semi colon for a start of a enumBodyDeclarations
        GATE: () =>
          this.LA(2).tokenType !== tokens.RCurly &&
          this.LA(2).tokenType !== tokens.SemiColon,
        DEF: () => {
          $.CONSUME(tokens.Comma);
          $.SUBRULE2($.enumConstant);
        }
      });
    });

    // enumConstant
    // : annotation* IDENTIFIER arguments? classBody?
    $.RULE("enumConstant", () => {
      $.MANY(() => {
        $.SUBRULE($.annotation);
      });
      $.CONSUME(tokens.Identifier);
      $.OPTION(() => {
        $.SUBRULE($.arguments);
      });
      $.OPTION2(() => {
        $.SUBRULE($.classBody);
      });
    });

    // enumBodyDeclarations
    // : ';' classBodyDeclaration*
    $.RULE("enumBodyDeclarations", () => {
      $.SUBRULE($.semiColon);
      $.MANY(() => {
        $.SUBRULE($.classBodyDeclaration);
      });
    });

    // interfaceDeclaration
    // : INTERFACE IDENTIFIER typeParameters? (EXTENDS typeList)? interfaceBody
    $.RULE("interfaceDeclaration", () => {
      $.CONSUME(tokens.Interface);
      $.CONSUME(tokens.Identifier);
      $.OPTION(() => {
        $.SUBRULE($.typeParameters);
      });
      $.OPTION2(() => {
        $.CONSUME(tokens.Extends);
        $.SUBRULE($.typeList);
      });
      $.SUBRULE($.interfaceBody);
    });

    // interfaceBody
    // : '{' interfaceBodyDeclaration* '}'
    $.RULE("interfaceBody", () => {
      $.CONSUME(tokens.LCurly);
      $.MANY(() => {
        $.SUBRULE($.interfaceBodyDeclaration);
      });
      $.CONSUME(tokens.RCurly);
    });

    // interfaceBodyDeclaration
    // : modifier* interfaceMemberDeclaration
    $.RULE("interfaceBodyDeclaration", () => {
      $.MANY(() => {
        $.SUBRULE($.modifier);
      });
      $.SUBRULE($.interfaceMemberDeclaration);
    });

    // interfaceMemberDeclaration
    // : constantDeclarationOrInterfaceMethodDeclaration
    // | interfaceDeclaration
    // | annotationTypeDeclaration
    // | classDeclaration
    // | enumDeclaration
    $.RULE("interfaceMemberDeclaration", () => {
      $.OR([
        {
          ALT: () =>
            $.SUBRULE($.constantDeclarationOrInterfaceMethodDeclaration)
        },
        { ALT: () => $.SUBRULE($.interfaceDeclaration) },
        { ALT: () => $.SUBRULE($.classDeclaration) },
        { ALT: () => $.SUBRULE($.enumDeclaration) }
      ]);
    });

    // constantDeclarationOrInterfaceMethodDeclaration
    // : constantDeclaration
    // | interfaceMethodDeclaration
    $.RULE("constantDeclarationOrInterfaceMethodDeclaration", () => {
      let isConstantDeclaration = true;
      let isInterfaceMethodDeclaration = true;

      $.OR([
        {
          ALT: () => {
            // interfaceMethodDeclaration
            $.MANY(() => {
              $.SUBRULE($.interfaceMethodModifier);
              isConstantDeclaration = false;
            });
            $.OPTION(() => {
              $.SUBRULE($.typeParameters);
              isConstantDeclaration = false;
            });
            $.MANY2(() => {
              $.SUBRULE($.annotation);
              isConstantDeclaration = false;
            });
            $.OR2([
              {
                ALT: () => {
                  $.SUBRULE($.typeType);

                  $.OPTION2({
                    GATE: () => isConstantDeclaration,
                    DEF: () => {
                      $.AT_LEAST_ONE_SEP({
                        SEP: tokens.Comma,
                        DEF: () => {
                          $.SUBRULE($.constantDeclarator);
                        }
                      });
                      $.SUBRULE($.semiColon);
                      isInterfaceMethodDeclaration = false;
                    }
                  });
                }
              },
              { ALT: () => $.CONSUME(tokens.Void) }
            ]);

            $.OR3([
              {
                GATE: () => isInterfaceMethodDeclaration,
                ALT: () => {
                  $.CONSUME(tokens.Identifier);
                  $.SUBRULE($.formalParameters);
                  $.MANY3(() => {
                    $.CONSUME(tokens.LSquare);
                    $.CONSUME(tokens.RSquare);
                  });
                  $.OPTION3(() => {
                    $.CONSUME(tokens.Throws);
                    $.SUBRULE($.qualifiedNameList);
                  });
                  $.SUBRULE($.methodBody);
                }
              },
              {
                ALT: () => {
                  // empty for constant declaration
                }
              }
            ]);
          }
        }
      ]);
    });

    // constantDeclaration
    // : typeType constantDeclarator (',' constantDeclarator)* ';'
    $.RULE("constantDeclaration", () => {
      $.SUBRULE($.typeType);
      $.AT_LEAST_ONE_SEP({
        SEP: tokens.Comma,
        DEF: () => {
          $.SUBRULE($.constantDeclarator);
        }
      });
      $.SUBRULE($.semiColon);
    });

    // constantDeclarator
    // : IDENTIFIER ('[' ']')* '=' variableInitializer
    $.RULE("constantDeclarator", () => {
      $.CONSUME(tokens.Identifier);
      $.MANY(() => {
        $.CONSUME(tokens.LSquare);
        $.CONSUME(tokens.RSquare);
      });
      $.CONSUME(tokens.Equals);
      $.SUBRULE($.variableInitializer);
    });

    // see matching of [] comment in methodDeclaratorRest
    // methodBody from Java8
    // interfaceMethodDeclaration
    // : interfaceMethodModifier*
    //   (typeParameters annotation*)?
    //   typeTypeOrVoid
    //   IDENTIFIER formalParameters ('[' ']')*
    //   (THROWS qualifiedNameList)?
    //   methodBody
    $.RULE("interfaceMethodDeclaration", () => {
      $.MANY(() => {
        $.SUBRULE($.interfaceMethodModifier);
      });
      $.OPTION(() => {
        $.SUBRULE($.typeParameters);
      });
      $.MANY2(() => {
        $.SUBRULE($.annotation);
      });
      $.SUBRULE($.typeTypeOrVoid);
      $.CONSUME(tokens.Identifier);
      $.SUBRULE($.formalParameters);
      $.MANY3(() => {
        $.CONSUME(tokens.LSquare);
        $.CONSUME(tokens.RSquare);
      });
      $.OPTION2(() => {
        $.CONSUME(tokens.Throws);
        $.SUBRULE($.qualifiedNameList);
      });
      $.SUBRULE($.methodBody);
    });

    // // Java8
    // interfaceMethodModifier
    // : annotation
    // | PUBLIC
    // | ABSTRACT
    // | DEFAULT
    // | STATIC
    // | STRICTFP
    $.RULE("interfaceMethodModifier", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.annotation) },
        { ALT: () => $.CONSUME(tokens.Public) },
        { ALT: () => $.CONSUME(tokens.Abstract) },
        { ALT: () => $.CONSUME(tokens.Default) },
        { ALT: () => $.CONSUME(tokens.Static) },
        { ALT: () => $.CONSUME(tokens.Strictfp) }
      ]);
    });

    // variableDeclarators
    // : variableDeclarator (',' variableDeclarator)*
    $.RULE("variableDeclarators", () => {
      $.AT_LEAST_ONE_SEP({
        SEP: tokens.Comma,
        DEF: () => {
          $.SUBRULE($.variableDeclarator);
        }
      });
    });

    // variableDeclarator
    // : variableDeclaratorId ('=' variableInitializer)?
    $.RULE("variableDeclarator", () => {
      $.SUBRULE($.variableDeclaratorId);
      $.OPTION(() => {
        $.CONSUME(tokens.Equals);
        $.SUBRULE($.variableInitializer);
      });
    });

    // variableDeclaratorId
    // : IDENTIFIER ('[' ']')*
    $.RULE("variableDeclaratorId", () => {
      $.CONSUME(tokens.Identifier);
      $.MANY(() => {
        $.CONSUME(tokens.LSquare);
        $.CONSUME(tokens.RSquare);
      });
    });

    // variableInitializer
    // : arrayInitializer
    // | expression
    $.RULE("variableInitializer", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.arrayInitializer) },
        {
          ALT: () => {
            $.SUBRULE($.expression);
            $.OPTION(() => {
              $.CONSUME(tokens.Questionmark);
              $.SUBRULE2($.expression);
              $.CONSUME(tokens.Colon);
              $.SUBRULE3($.expression);
            });
          }
        }
      ]);
    });

    // arrayInitializer
    // : '{' (variableInitializer (',' variableInitializer)* (',')? )? '}'
    $.RULE("arrayInitializer", () => {
      $.CONSUME(tokens.LCurly);
      $.OPTION(() => {
        $.SUBRULE($.variableInitializer);
        $.MANY({
          GATE: () =>
            this.LA(2).tokenType !== tokens.Comma &&
            this.LA(2).tokenType !== tokens.RCurly,
          DEF: () => {
            $.CONSUME(tokens.Comma);
            $.SUBRULE2($.variableInitializer);
          }
        });
      });
      $.OPTION2(() => {
        $.CONSUME2(tokens.Comma);
      });
      $.CONSUME(tokens.RCurly);
    });

    // annotationTypeDeclaration
    // : '@' INTERFACE IDENTIFIER annotationTypeBody
    $.RULE("annotationTypeDeclaration", () => {
      $.CONSUME(tokens.At);
      $.CONSUME(tokens.Interface);
      $.CONSUME(tokens.Identifier);
      $.SUBRULE($.annotationTypeBody);
    });

    // annotationTypeBody
    // : '{' (annotationTypeElementDeclaration)* '}'
    $.RULE("annotationTypeBody", () => {
      $.CONSUME(tokens.LCurly);
      $.MANY(() => {
        $.SUBRULE($.annotationTypeElementDeclaration);
      });
      $.CONSUME(tokens.RCurly);
    });

    // annotationTypeElementDeclaration
    // : modifier* annotationTypeElementRest
    $.RULE("annotationTypeElementDeclaration", () => {
      $.MANY(() => {
        $.SUBRULE($.modifier);
      });
      $.SUBRULE($.annotationTypeElementRest);
    });

    // annotationTypeElementRest
    // : typeType annotationMethodRestOrConstantRest ';'
    // | classDeclaration ';'?
    // | interfaceDeclaration ';'?
    // | enumDeclaration ';'?
    // | annotationTypeDeclaration ';'?
    $.RULE("annotationTypeElementRest", () => {
      $.OR([
        {
          ALT: () => {
            $.SUBRULE($.typeType);
            $.SUBRULE($.annotationMethodRestOrConstantRest);
            $.SUBRULE($.semiColon);
          }
        },
        {
          ALT: () => {
            $.SUBRULE($.classDeclaration);
            $.OPTION(() => {
              $.SUBRULE2($.semiColon);
            });
          }
        },
        {
          ALT: () => {
            $.SUBRULE($.interfaceDeclaration);
            $.OPTION2(() => {
              $.SUBRULE3($.semiColon);
            });
          }
        },
        {
          ALT: () => {
            $.SUBRULE($.enumDeclaration);
            $.OPTION3(() => {
              $.SUBRULE4($.semiColon);
            });
          }
        },
        {
          ALT: () => {
            $.SUBRULE($.annotationTypeDeclaration);
            $.OPTION4(() => {
              $.SUBRULE5($.semiColon);
            });
          }
        }
      ]);
    });

    // annotationMethodRestOrConstantRest
    // : annotationMethodRest
    // | annotationConstantRest
    $.RULE("annotationMethodRestOrConstantRest", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.annotationMethodRest) },
        { ALT: () => $.SUBRULE($.annotationConstantRest) }
      ]);
    });

    // annotationMethodRest
    // : IDENTIFIER '(' ')' defaultValue?
    $.RULE("annotationMethodRest", () => {
      $.CONSUME(tokens.Identifier);
      $.CONSUME(tokens.LBrace);
      $.CONSUME(tokens.RBrace);
      $.OPTION(() => {
        $.SUBRULE($.defaultValue);
      });
    });

    // annotationConstantRest
    // : variableDeclarators
    $.RULE("annotationConstantRest", () => {
      $.SUBRULE($.variableDeclarators);
    });

    // defaultValue
    // : DEFAULT elementValue
    $.RULE("defaultValue", () => {
      $.CONSUME(tokens.Default);
      $.SUBRULE($.elementValue);
    });

    // typeList
    // : typeType (',' typeType)*
    $.RULE("typeList", () => {
      $.AT_LEAST_ONE_SEP({
        SEP: tokens.Comma,
        DEF: () => {
          $.SUBRULE($.typeType);
        }
      });
    });

    // typeType
    // : annotation? (classOrInterfaceType | primitiveType) ('[' ']')*
    $.RULE("typeType", () => {
      $.OR([
        {
          ALT: () => {
            $.SUBRULE($.annotation);
            $.OPTION(() => {
              $.OR2([
                { ALT: () => $.SUBRULE($.classOrInterfaceType) },
                { ALT: () => $.SUBRULE($.primitiveType) }
              ]);
              $.MANY(() => {
                $.CONSUME(tokens.LSquare);
                $.CONSUME(tokens.RSquare);
              });
            });
          }
        },
        {
          ALT: () => {
            $.OR3([
              { ALT: () => $.SUBRULE2($.classOrInterfaceType) },
              { ALT: () => $.SUBRULE2($.primitiveType) }
            ]);
            $.MANY2(() => {
              $.CONSUME2(tokens.LSquare);
              $.CONSUME2(tokens.RSquare);
            });
          }
        }
      ]);
    });

    // typeTypeOrVoid
    // : typeType | VOID
    $.RULE("typeTypeOrVoid", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.typeType) },
        { ALT: () => $.CONSUME(tokens.Void) }
      ]);
    });

    // classOrInterfaceType
    // : classOrInterfaceTypeElement ('.' classOrInterfaceTypeElement)*
    $.RULE("classOrInterfaceType", () => {
      $.SUBRULE($.classOrInterfaceTypeElement);
      $.MANY({
        GATE: () => this.LA(2).tokenType !== tokens.Class,
        DEF: () => {
          $.CONSUME(tokens.Dot);
          $.SUBRULE2($.classOrInterfaceTypeElement);
        }
      });
    });

    // classOrInterfaceTypeElement
    // : IDENTIFIER typeArguments?
    $.RULE("classOrInterfaceTypeElement", () => {
      $.CONSUME(tokens.Identifier);
      $.OPTION(() => {
        $.SUBRULE($.typeArguments);
      });
    });

    // typeArguments
    // : '<' typeArgument (',' typeArgument)* '>'
    $.RULE("typeArguments", () => {
      $.CONSUME(tokens.Less);
      $.AT_LEAST_ONE_SEP({
        SEP: tokens.Comma,
        DEF: () => {
          $.SUBRULE($.typeArgument);
        }
      });
      $.CONSUME(tokens.Greater);
    });

    // typeArgumentsOrOperatorExpressionRest
    // : '<'
    //   (
    //     'this'
    //     | 'super'
    //     | literal
    //     | typeArgument (',' typeArgument)* ( '(' expressionList ')' dimension* )? '>'?
    //     | '(' expression ')'
    //   )
    $.RULE("typeArgumentsOrOperatorExpressionRest", () => {
      $.CONSUME(tokens.Less);
      $.OR([
        { ALT: () => $.CONSUME(tokens.This) },
        { ALT: () => $.CONSUME(tokens.Super) },
        { ALT: () => $.SUBRULE($.literal) },
        {
          ALT: () => {
            let canBeOperatorExpression = true;
            $.SUBRULE($.typeArgument);
            $.MANY(() => {
              $.CONSUME(tokens.Comma);
              $.SUBRULE2($.typeArgument);
              canBeOperatorExpression = false;
            });

            let isOperatorExpression = false;
            $.OPTION3({
              GATE: () => canBeOperatorExpression,
              DEF: () => {
                $.CONSUME(tokens.LBrace);
                $.OPTION4(() => {
                  $.SUBRULE($.expressionList);
                });
                $.CONSUME(tokens.RBrace);
                $.MANY2(() => {
                  $.SUBRULE($.dimension);
                });
                isOperatorExpression = true;
              }
            });
            $.OPTION5({
              GATE: () => !isOperatorExpression,
              DEF: () => {
                $.CONSUME(tokens.Greater);
              }
            });
          }
        },
        {
          ALT: () => {
            $.CONSUME2(tokens.LBrace);
            $.SUBRULE2($.expression);
            $.CONSUME2(tokens.RBrace);
          }
        }
      ]);
    });

    // typeArgument
    // : typeType | '?'
    //   ((EXTENDS | SUPER) typeType)?
    $.RULE("typeArgument", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.typeType) },
        { ALT: () => $.CONSUME(tokens.Questionmark) }
      ]);
      $.OPTION(() => {
        $.OR2([
          { ALT: () => $.CONSUME(tokens.Extends) },
          { ALT: () => $.CONSUME(tokens.Super) }
        ]);
        $.SUBRULE2($.typeType);
      });
    });

    // qualifiedNameList
    // : qualifiedName (',' qualifiedName)*
    $.RULE("qualifiedNameList", () => {
      $.AT_LEAST_ONE_SEP({
        SEP: tokens.Comma,
        DEF: () => {
          $.SUBRULE($.qualifiedName);
        }
      });
    });

    // identifiers
    // : '(' identifierList? ')'
    $.RULE("identifiers", () => {
      $.CONSUME(tokens.LBrace);
      $.OPTION(() => {
        $.SUBRULE($.identifierList);
      });
      $.CONSUME(tokens.RBrace);
    });

    // identifierList
    // : identifier (',' identifier)*
    $.RULE("identifierList", () => {
      $.AT_LEAST_ONE_SEP({
        SEP: tokens.Comma,
        DEF: () => {
          $.CONSUME(tokens.Identifier);
        }
      });
    });

    // formalParameters
    // : '(' formalParameterList? ')'
    $.RULE("formalParameters", () => {
      $.CONSUME(tokens.LBrace);
      $.OPTION(() => {
        $.SUBRULE($.formalParameterList);
      });
      $.CONSUME(tokens.RBrace);
    });

    // formalParameterList
    // : formalParameter (',' formalParameter)*
    $.RULE("formalParameterList", () => {
      $.AT_LEAST_ONE_SEP({
        SEP: tokens.Comma,
        DEF: () => {
          $.SUBRULE($.formalParameter);
        }
      });
    });

    // formalParameter
    // : variableModifier* typeType DOTDOTDOT? variableDeclaratorId
    $.RULE("formalParameter", () => {
      $.MANY(() => {
        $.SUBRULE($.variableModifier);
      });
      $.SUBRULE($.typeType);
      $.OPTION(() => {
        $.CONSUME(tokens.DotDotDot);
      });
      $.SUBRULE($.variableDeclaratorId);
    });

    // block
    // : '{' blockStatement* '}'
    $.RULE("block", () => {
      $.CONSUME(tokens.LCurly);
      $.MANY(() => {
        $.SUBRULE($.blockStatement);
      });
      $.CONSUME(tokens.RCurly);
    });

    // blockStatement
    // : variableModifier* typeType variableDeclarators ';' // localVariableDeclaration
    // | classOrInterfaceModifier* (classDeclaration | interfaceDeclaration) // localTypeDeclaration
    // | identifierStatement
    // | expressionStatement
    $.RULE("blockStatement", () => {
      let hasSemiColon = false;
      $.MANY(() => {
        $.SUBRULE($.classOrInterfaceModifier);
      });
      $.OR([
        {
          // localeVariableDeclaration
          ALT: () => {
            $.OR2([
              {
                ALT: () => {
                  $.SUBRULE($.expression);

                  $.OR3([
                    {
                      // identifierStatement
                      ALT: () => {
                        $.CONSUME(tokens.Colon);
                        $.SUBRULE($.statement);
                      }
                    },
                    {
                      // expressionStatement
                      ALT: () => {
                        $.SUBRULE($.semiColon);
                        hasSemiColon = true;
                      }
                    },
                    {
                      ALT: () => {
                        $.OPTION(() => {
                          $.SUBRULE($.typeArguments);
                        });
                        $.MANY2({
                          GATE: () => this.LA(2).tokenType !== tokens.Class,
                          DEF: () => {
                            $.CONSUME(tokens.Dot);
                            $.SUBRULE2($.classOrInterfaceTypeElement);
                          }
                        });
                      }
                    }
                  ]);
                }
              }
            ]);
            $.OPTION2({
              GATE: () => !hasSemiColon,
              DEF: () => {
                // if not identifier statement
                $.MANY3(() => {
                  $.CONSUME(tokens.LSquare);
                  $.CONSUME(tokens.RSquare);
                });
                $.SUBRULE($.variableDeclarators);
                $.SUBRULE2($.semiColon);
              }
            });
          }
        },
        // localTypeDeclaration
        { ALT: () => $.SUBRULE($.classDeclaration) },
        // localTypeDeclaration
        { ALT: () => $.SUBRULE($.interfaceDeclaration) },
        { ALT: () => $.SUBRULE($.statementWithStartingToken) }
      ]);
    });

    // statement
    // : statementWithStartingToken
    // | identifierStatement
    $.RULE("statement", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.statementWithStartingToken) },
        { ALT: () => $.SUBRULE($.expressionStatement) },
        { ALT: () => $.SUBRULE($.identifierStatement) }
      ]);
    });

    // statementWithStartingToken
    // : block
    // | assertStatement
    // | ifStatement
    // | forStatement
    // | whileStatement
    // | doWhileStatement
    // | tryStatement
    // | switchStatement
    // | synchronizedStatement
    // | returnStatement
    // | throwStatement
    // | breakStatement
    // | continueStatement
    // | semiColonStatement
    // | expressionStatement
    $.RULE("statementWithStartingToken", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.block) },
        { ALT: () => $.SUBRULE($.assertStatement) },
        { ALT: () => $.SUBRULE($.ifStatement) },
        { ALT: () => $.SUBRULE($.forStatement) },
        { ALT: () => $.SUBRULE($.whileStatement) },
        { ALT: () => $.SUBRULE($.doWhileStatement) },
        { ALT: () => $.SUBRULE($.tryStatement) },
        { ALT: () => $.SUBRULE($.switchStatement) },
        { ALT: () => $.SUBRULE($.synchronizedStatement) },
        { ALT: () => $.SUBRULE($.returnStatement) },
        { ALT: () => $.SUBRULE($.throwStatement) },
        { ALT: () => $.SUBRULE($.breakStatement) },
        { ALT: () => $.SUBRULE($.continueStatement) },
        { ALT: () => $.SUBRULE($.semiColonStatement) }
      ]);
    });

    // assertStatement
    // : ASSERT expression (':' expression)? ';'
    $.RULE("assertStatement", () => {
      $.CONSUME(tokens.Assert);
      $.SUBRULE($.expression);
      $.OPTION(() => {
        $.CONSUME(tokens.Colon);
        $.SUBRULE2($.expression);
      });
      $.SUBRULE($.semiColon);
    });

    // ifStatement
    // : IF '(' expression ')' statement (ELSE statement)?
    $.RULE("ifStatement", () => {
      $.CONSUME(tokens.If);
      $.CONSUME(tokens.LBrace);
      $.SUBRULE($.expression);
      $.CONSUME(tokens.RBrace);
      $.SUBRULE($.statement);
      $.OPTION(() => {
        $.CONSUME(tokens.Else);
        $.SUBRULE2($.statement);
      });
    });

    // whileStatement
    // : WHILE '(' expression ')' statement
    $.RULE("whileStatement", () => {
      $.CONSUME(tokens.While);
      $.CONSUME(tokens.LBrace);
      $.SUBRULE($.expression);
      $.CONSUME(tokens.RBrace);
      $.SUBRULE($.statement);
    });

    // doWhileStatement
    // : DO statement WHILE '(' expression ')' ';'
    $.RULE("doWhileStatement", () => {
      $.CONSUME(tokens.Do);
      $.SUBRULE($.statement);
      $.CONSUME(tokens.While);
      $.CONSUME(tokens.LBrace);
      $.SUBRULE($.expression);
      $.CONSUME(tokens.RBrace);
      $.SUBRULE($.semiColon);
    });

    // tryStatement
    // : TRY resourceSpecification? block (catchClause+ finallyBlock? | finallyBlock)
    $.RULE("tryStatement", () => {
      $.CONSUME(tokens.Try);
      $.OPTION(() => {
        $.SUBRULE($.resourceSpecification);
      });
      $.SUBRULE($.block);
      $.OPTION1(() => {
        $.OR([
          {
            ALT: () => {
              $.SUBRULE($.catchClause);
              $.MANY(() => {
                $.SUBRULE2($.catchClause);
              });
              $.OPTION2(() => {
                $.SUBRULE($.finallyBlock);
              });
            }
          },
          { ALT: () => $.SUBRULE2($.finallyBlock) }
        ]);
      });
    });

    // switchStatement
    // : SWITCH '(' expression ')' '{' switchBlockStatementGroup* switchLabel* '}'
    $.RULE("switchStatement", () => {
      $.CONSUME(tokens.Switch);
      $.CONSUME(tokens.LBrace);
      $.SUBRULE($.expression);
      $.CONSUME(tokens.RBrace);
      $.CONSUME(tokens.LCurly);
      $.MANY(() => {
        $.SUBRULE($.switchBlockStatementGroup);
      });
      $.CONSUME(tokens.RCurly);
    });

    // synchronizedStatement
    // : SYNCHRONIZED '(' expression ')' block
    $.RULE("synchronizedStatement", () => {
      $.CONSUME(tokens.Synchronized);
      $.CONSUME(tokens.LBrace);
      $.SUBRULE($.expression);
      $.CONSUME(tokens.RBrace);
      $.SUBRULE($.block);
    });

    // returnStatement
    // : RETURN expression? ';'
    $.RULE("returnStatement", () => {
      $.CONSUME(tokens.Return);
      $.OPTION(() => {
        $.SUBRULE($.expression);
      });
      $.SUBRULE($.semiColon);
    });

    // throwStatement
    // : THROW expression ';'
    $.RULE("throwStatement", () => {
      $.CONSUME(tokens.Throw);
      $.SUBRULE($.expression);
      $.SUBRULE($.semiColon);
    });

    // breakStatement
    // : BREAK IDENTIFIER? ';'
    $.RULE("breakStatement", () => {
      $.CONSUME(tokens.Break);
      $.OPTION(() => {
        $.CONSUME(tokens.Identifier);
      });
      $.SUBRULE($.semiColon);
    });

    // continueStatement
    // : CONTINUE IDENTIFIER? ';'
    $.RULE("continueStatement", () => {
      $.CONSUME(tokens.Continue);
      $.OPTION(() => {
        $.CONSUME(tokens.Identifier);
      });
      $.SUBRULE($.semiColon);
    });

    // semiColonStatement
    // : ';'
    $.RULE("semiColonStatement", () => {
      $.SUBRULE($.semiColon);
    });

    // expressionStatement
    // : expression ';'
    $.RULE("expressionStatement", () => {
      $.SUBRULE($.expression);
      $.SUBRULE($.semiColon);
    });

    // identifierStatement
    // : IDENTIFIER ':' statement
    $.RULE("identifierStatement", () => {
      $.CONSUME(tokens.Identifier);
      $.CONSUME(tokens.Colon);
      $.SUBRULE($.statement);
    });

    // catchClause
    // : CATCH '(' variableModifier* catchType IDENTIFIER ')' block
    $.RULE("catchClause", () => {
      $.CONSUME(tokens.Catch);
      $.CONSUME(tokens.LBrace);
      $.MANY(() => {
        $.SUBRULE($.variableModifier);
      });
      $.SUBRULE($.catchType);
      $.CONSUME(tokens.Identifier);
      $.CONSUME(tokens.RBrace);
      $.SUBRULE($.block);
    });

    // catchType
    // : qualifiedName ('|' qualifiedName)*
    $.RULE("catchType", () => {
      $.AT_LEAST_ONE_SEP({
        SEP: tokens.Or,
        DEF: () => {
          $.SUBRULE($.qualifiedName);
        }
      });
    });

    // finallyBlock
    // : FINALLY block
    $.RULE("finallyBlock", () => {
      $.CONSUME(tokens.Finally);
      $.SUBRULE($.block);
    });

    // resourceSpecification
    // : '(' resources ';'? ')'
    $.RULE("resourceSpecification", () => {
      $.CONSUME(tokens.LBrace);
      $.SUBRULE($.resources);
      $.OPTION(() => {
        $.SUBRULE($.semiColon);
      });
      $.CONSUME(tokens.RBrace);
    });

    // resources
    // : resource (';' resource)*
    $.RULE("resources", () => {
      $.SUBRULE($.resource);
      $.MANY({
        GATE: () => this.LA(2).tokenType !== tokens.RBrace,
        DEF: () => {
          $.SUBRULE($.semiColon);
          $.SUBRULE2($.resource);
        }
      });
    });

    // resource
    // : variableModifier* classOrInterfaceType variableDeclaratorId '=' expression
    $.RULE("resource", () => {
      $.MANY(() => {
        $.SUBRULE($.variableModifier);
      });
      $.SUBRULE($.classOrInterfaceType);
      $.SUBRULE($.variableDeclaratorId);
      $.CONSUME(tokens.Equals);
      $.SUBRULE($.expression);
    });

    // switchBlockStatementGroup
    // : switchLabel+ blockStatement*
    $.RULE("switchBlockStatementGroup", () => {
      $.SUBRULE($.switchLabel);
      $.MANY(() => {
        $.SUBRULE2($.switchLabel);
      });
      $.MANY2(() => {
        $.SUBRULE2($.blockStatement);
      });
    });

    // switchLabel
    // : switchLabelCase
    // | switchLabelDefault
    $.RULE("switchLabel", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.switchLabelCase) },
        { ALT: () => $.SUBRULE($.switchLabelDefault) }
      ]);
    });

    // switchLabelCase
    // : CASE (expression | IDENTIFIER) ':'
    $.RULE("switchLabelCase", () => {
      $.CONSUME(tokens.Case);
      $.SUBRULE($.expression);
      $.CONSUME(tokens.Colon);
    });

    // switchLabelDefault
    // : DEFAULT ':'
    $.RULE("switchLabelDefault", () => {
      $.CONSUME(tokens.Default);
      $.CONSUME(tokens.Colon);
    });

    // forStatement
    // : FOR '(' forControl ')' statement
    $.RULE("forStatement", () => {
      $.CONSUME(tokens.For);
      $.CONSUME(tokens.LBrace);
      $.SUBRULE($.forControl);
      $.CONSUME(tokens.RBrace);
      $.SUBRULE($.statement);
    });

    // forControl
    // : (localVariableDeclaration | expressionList)? ';' expression? ';' forUpdate=expressionList? // basicForStatement
    // | variableModifier* typeType variableDeclaratorId ':' expression // enhancedForControl
    $.RULE("forControl", () => {
      let enhancedForStatement = false;
      $.OPTION(() => {
        let localVariableDeclaration = false;
        $.MANY(() => {
          $.SUBRULE($.variableModifier);
          localVariableDeclaration = true;
        });
        $.SUBRULE($.expression);
        $.OR([
          {
            ALT: () => {
              $.SUBRULE($.variableDeclaratorId);

              $.OR2([
                {
                  // enhancedForStatement
                  ALT: () => {
                    $.CONSUME(tokens.Colon);
                    $.SUBRULE2($.expression);
                    enhancedForStatement = true;
                  }
                },
                {
                  ALT: () => {
                    $.OPTION2(() => {
                      $.CONSUME(tokens.Equals);
                      $.SUBRULE($.variableInitializer);
                    });
                  }
                }
              ]);

              $.MANY2({
                GATE: () => !enhancedForStatement,
                DEF: () => {
                  $.CONSUME(tokens.Comma);
                  $.SUBRULE($.variableDeclarator);
                }
              });
            }
          },
          {
            GATE: !localVariableDeclaration,
            ALT: () => {
              $.MANY3(() => {
                $.CONSUME2(tokens.Comma);
                $.SUBRULE3($.expression);
              });
            }
          }
        ]);
      });
      $.OR3([
        {
          GATE: () => !enhancedForStatement,
          ALT: () => {
            $.SUBRULE($.semiColon);
            $.OPTION3(() => {
              const optionalExpression = $.SUBRULE4($.expression);
              optionalExpression.optionalExpression = true;
            });
            $.SUBRULE2($.semiColon);
            $.OPTION4(() => {
              $.SUBRULE($.expressionList);
            });
          }
        },
        {
          ALT: () => {
            // Just here for enhancedForStatement
          }
        }
      ]);
    });

    // enhancedForControl
    // : variableModifier* typeType variableDeclaratorId ':' expression
    $.RULE("enhancedForControl", () => {
      $.MANY(() => {
        $.SUBRULE($.variableModifier);
      });
      $.SUBRULE($.typeType);
      $.SUBRULE($.variableDeclaratorId);
      $.CONSUME(tokens.Colon);
      $.SUBRULE($.expression);
    });

    // explicitGenericInvocationSuffix
    // : super
    // | IDENTIFIER arguments
    $.RULE("explicitGenericInvocationSuffix", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.super) },
        { ALT: () => $.SUBRULE($.identifierArguments) }
      ]);
    });

    // identifierArguments
    // : IDENTIFIER arguments
    $.RULE("identifierArguments", () => {
      $.CONSUME(tokens.Identifier);
      $.SUBRULE($.arguments);
    });

    // super
    // : SUPER superSuffix
    $.RULE("super", () => {
      $.CONSUME(tokens.Super);
      $.SUBRULE($.superSuffix);
    });

    // superSuffix
    // : arguments
    // | dotIdentifierArguments
    $.RULE("superSuffix", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.arguments) },
        { ALT: () => $.SUBRULE($.dotIdentifierArguments) }
      ]);
    });

    // arguments
    // : '(' expressionList? ')'
    $.RULE("arguments", () => {
      $.CONSUME(tokens.LBrace);
      $.OPTION(() => {
        $.SUBRULE($.expressionList);
      });
      $.CONSUME(tokens.RBrace);
    });

    // dotIdentifierArguments
    // : '.' IDENTIFIER arguments?
    $.RULE("dotIdentifierArguments", () => {
      $.CONSUME(tokens.Dot);
      $.CONSUME(tokens.Identifier);
      $.OPTION(() => {
        $.SUBRULE($.arguments);
      });
    });

    // parExpression
    // : '(' expression ')'
    $.RULE("parExpression", () => {
      $.CONSUME(tokens.LBrace);
      $.SUBRULE($.expression);
      $.CONSUME(tokens.RBrace);
    });

    // expressionList
    // : expression (',' expression)*
    $.RULE("expressionList", () => {
      $.AT_LEAST_ONE_SEP({
        SEP: tokens.Comma,
        DEF: () => {
          $.SUBRULE($.expression);
        }
      });
    });

    // methodInvocation
    // : IDENTIFIER '(' expressionList? ')'
    $.RULE("methodInvocation", () => {
      $.CONSUME(tokens.Identifier);
      $.CONSUME(tokens.LBrace);
      $.OPTION(() => {
        $.SUBRULE($.expressionList);
      });
      $.CONSUME(tokens.RBrace);
      $.MANY(() => {
        $.SUBRULE($.dimension);
      });
    });

    // expression
    // : atomic
    //   (
    //     instanceExpressionRest
    //     | squareExpressionRest
    //     | postfixExpressionRest
    //     | ifElseExpressionRest
    //     | qualifiedExpressionRest
    //     | '->' lambdaBody // lambdaExpression
    //     | methodReferenceRest
    //     | ( operatorExpressionRest )*
    //     )
    // | prefixExpression
    // | parExpressionOrCastExpressionOrLambdaExpression
    $.RULE("expression", () => {
      $.OR([
        {
          ALT: () => {
            $.SUBRULE($.atomic);
            $.OR2([
              { ALT: () => $.SUBRULE($.instanceofExpressionRest) },
              { ALT: () => $.SUBRULE($.squareExpressionRest) },
              { ALT: () => $.SUBRULE($.postfixExpressionRest) },
              {
                ALT: () => {
                  $.SUBRULE($.ifElseExpressionRest);
                }
              },
              {
                ALT: () => {
                  $.SUBRULE($.qualifiedExpressionRest);
                  $.OR3([
                    {
                      ALT: () => $.SUBRULE2($.postfixExpressionRest)
                    },
                    {
                      ALT: () => {
                        $.OR4([
                          { ALT: () => $.SUBRULE2($.instanceofExpressionRest) },
                          {
                            ALT: () =>
                              $.MANY(() => {
                                $.SUBRULE($.operatorExpressionRest);
                              })
                          }
                        ]);
                        $.OPTION(() => $.SUBRULE2($.ifElseExpressionRest));
                      }
                    }
                  ]);
                }
              },
              {
                // lambdaExpression
                ALT: () => {
                  $.CONSUME(tokens.Pointer);
                  $.SUBRULE($.lambdaBody);
                }
              },
              { ALT: () => $.SUBRULE($.methodReferenceRest) },
              {
                ALT: () => {
                  $.MANY2(() => {
                    $.SUBRULE2($.operatorExpressionRest);
                    $.OPTION2(() => {
                      $.SUBRULE3($.ifElseExpressionRest);
                    });
                  });
                }
              }
            ]);
          }
        },
        {
          ALT: () => {
            $.SUBRULE($.prefixExpression);
          }
        },
        {
          ALT: () => {
            $.SUBRULE($.parExpressionOrCastExpressionOrLambdaExpression);
          }
        }
      ]);
    });

    // atomic
    // : methodInvocation
    // | primary
    // | creator
    $.RULE("atomic", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.methodInvocation) },
        { ALT: () => $.SUBRULE($.primary) },
        { ALT: () => $.SUBRULE($.creator) }
      ]);
    });

    // instanceofExpressionRest
    // : INSTANCEOF typeType
    $.RULE("instanceofExpressionRest", () => {
      $.CONSUME(tokens.Instanceof);
      $.SUBRULE($.typeType);
      $.MANY(() => {
        $.SUBRULE($.operatorExpressionRest);
      });
    });

    // squareExpressionRest
    // : '[' expression ']'
    $.RULE("squareExpressionRest", () => {
      $.CONSUME(tokens.LSquare);
      $.SUBRULE($.expression);
      $.CONSUME(tokens.RSquare);
    });

    // postfixExpressionRest
    // : ('++' | '--')
    $.RULE("postfixExpressionRest", () => {
      $.OR([
        {
          ALT: () => {
            $.CONSUME(tokens.PlusPlus);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.MinusMinus);
          }
        }
      ]);
    });

    // ifElseExpressionRest
    // : '?' expression ':' expression
    $.RULE("ifElseExpressionRest", () => {
      $.CONSUME(tokens.Questionmark);
      $.SUBRULE($.expression);
      $.CONSUME(tokens.Colon);
      $.SUBRULE2($.expression);
    });

    // qualifiedExpressionRest
    // : '.'
    //   (
    //     IDENTIFIER
    //     | methodInvocation
    //     | THIS
    //     | SUPER
    //     | creatorOptionalNonWildcardInnerCreator
    //     | explicitGenericInvocation
    //   )
    $.RULE("qualifiedExpressionRest", () => {
      $.CONSUME(tokens.Dot);
      $.OR([
        { ALT: () => $.SUBRULE($.methodInvocation) },
        {
          ALT: () => {
            $.CONSUME(tokens.Identifier);
            $.OPTION(() => {
              $.SUBRULE($.typeArgumentsOrOperatorExpressionRest);
            });
            $.MANY(() => {
              $.SUBRULE($.dimension);
            });
          }
        },
        { ALT: () => $.CONSUME(tokens.Class) },
        { ALT: () => $.CONSUME(tokens.This) },
        { ALT: () => $.CONSUME(tokens.Super) },
        { ALT: () => $.SUBRULE($.creatorOptionalNonWildcardInnerCreator) },
        { ALT: () => $.SUBRULE($.explicitGenericInvocation) }
      ]);

      $.OR2([
        { ALT: () => $.SUBRULE($.qualifiedExpressionRest) },
        { ALT: () => $.SUBRULE($.methodReferenceRest) },
        {
          ALT: () => {
            // or nothing
          }
        }
      ]);
    });

    // creatorOptionalNonWildcardInnerCreator
    // : NEW nonWildcardTypeArguments? innerCreator
    $.RULE("creatorOptionalNonWildcardInnerCreator", () => {
      $.CONSUME(tokens.New);
      $.OPTION(() => {
        $.SUBRULE($.nonWildcardTypeArguments);
      });
      $.SUBRULE($.innerCreator);
    });

    // prefixExpression
    // : ('+'|'-'|'++'|'--'|'~'|'!') expression
    $.RULE("prefixExpression", () => {
      $.OR([
        {
          ALT: () => {
            $.CONSUME(tokens.Plus);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.Minus);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.PlusPlus);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.MinusMinus);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.Tilde);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.Exclamationmark);
          }
        }
      ]);
      $.SUBRULE($.expression);
    });

    // parExpressionOrCastExpressionOrLambdaExpression
    // : '(' expression ')'
    // | '(' typeType ')' expression
    // | lambdaExpression // Java8
    $.RULE("parExpressionOrCastExpressionOrLambdaExpression", () => {
      $.CONSUME(tokens.LBrace);
      // if parExpression
      // -> no
      //       - annotations
      //       - typeArguments
      //       - LSquare/RSquare
      // -> only one expression
      $.OR([
        {
          // empty parameters lambda expression
          ALT: () => {
            $.CONSUME(tokens.RBrace);
            $.CONSUME(tokens.Pointer);
            $.SUBRULE($.lambdaBody);
          }
        },
        {
          ALT: () => {
            let formalParameters = false;
            let i = 0;
            $.OPTION(() => {
              const final = $.CONSUME(tokens.Final);
              final.cnt = i;
              formalParameters = true;
            });
            $.SUBRULE($.expression);
            if (!formalParameters) {
              $.OPTION2(() => {
                $.SUBRULE($.variableDeclaratorId);
                formalParameters = true;
              });
            } else {
              $.SUBRULE2($.variableDeclaratorId);
            }

            // For potentielle formalParameterList or identifierList
            $.MANY(() => {
              i++;
              $.CONSUME(tokens.Comma);
              if (formalParameters) {
                $.OPTION3(() => {
                  const final = $.CONSUME2(tokens.Final);
                  final.cnt = i;
                });
              }
              $.SUBRULE2($.expression);
              if (formalParameters) {
                $.SUBRULE3($.variableDeclaratorId);
              }
            });

            $.CONSUME2(tokens.RBrace);
            $.OR2([
              // lambda expression
              {
                ALT: () => {
                  $.CONSUME2(tokens.Pointer);
                  $.SUBRULE2($.lambdaBody);
                }
              },
              {
                GATE: () => !formalParameters,
                ALT: () => {
                  // for potentielle cast expression
                  // or operator expression
                  let isOperatorExpression = false;
                  $.OPTION4(() => {
                    $.SUBRULE($.operator);
                    isOperatorExpression = true;
                  });
                  $.SUBRULE3($.expression);
                  $.MANY2({
                    GATE: () => isOperatorExpression,
                    DEF: () => {
                      $.SUBRULE($.operatorExpressionRest);
                    }
                  });
                  $.OPTION5({
                    GATE: () => isOperatorExpression,
                    DEF: () => {
                      $.SUBRULE($.ifElseExpressionRest);
                    }
                  });
                }
              },
              {
                GATE: () => !formalParameters,
                ALT: () => {
                  // Cast expression with following method or variable
                  $.SUBRULE($.qualifiedExpressionRest);
                  $.MANY3(() => {
                    $.SUBRULE2($.operatorExpressionRest);
                  });
                  // followed by a short if else
                  $.OR3([
                    { ALT: () => $.SUBRULE2($.ifElseExpressionRest) },
                    { ALT: () => {} }
                  ]);
                }
              },
              {
                GATE: () => !formalParameters,
                ALT: () => {
                  // followed by a short if else
                  $.SUBRULE3($.ifElseExpressionRest);
                }
              },
              {
                // if the first expression is not an identifier, second expression should be empty
                GATE: () => !formalParameters,
                ALT: () => {}
              }
            ]);
          }
        }
      ]);
    });

    // operator
    // : ('*'|'/'|'%')
    //   | ('+'|'-')
    //   | ('<<' | '>>>' | '>>')
    //   | ('<=' | '>=' | '>' | '<')
    //   | ('==' | '!=')
    //   | '&'
    //   | '^'
    //   | '|'
    //   | '&&'
    //   | '||'
    //   | ('=' | '+=' | '-=' | '*=' | '/=' | '&=' | '|=' | '^=' | '>>=' | '>>>=' | '<<=' | '%=')
    $.RULE("operator", () => {
      $.OR([
        // ('*'|'/'|'%')
        {
          ALT: () => {
            $.CONSUME(tokens.Star);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.Dash);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.Percentage);
          }
        },
        // ('+'|'-')
        {
          ALT: () => {
            $.CONSUME(tokens.Plus);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.Minus);
          }
        },
        // ('<<')
        {
          ALT: () => {
            $.CONSUME(tokens.LessLess);
          }
        },
        // ('<=' | '>=' | '>' | '>>' | '>>>' | '<')
        {
          ALT: () => {
            $.CONSUME(tokens.LessEquals);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.GreaterEquals);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.Greater);
            $.OPTION(() => {
              $.CONSUME2(tokens.Greater);
              $.OPTION2(() => {
                $.CONSUME3(tokens.Greater);
              });
            });
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.Less);
          }
        },
        // ('==' | '!=')
        {
          ALT: () => {
            $.CONSUME(tokens.EqualsEquals);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.ExclamationmarkEquals);
          }
        },
        // '&'
        {
          ALT: () => {
            $.CONSUME(tokens.And);
          }
        },
        // | '^'
        {
          ALT: () => {
            $.CONSUME(tokens.Caret);
          }
        },
        // | '|'
        {
          ALT: () => {
            $.CONSUME(tokens.Or);
          }
        },
        // | '&&'
        {
          ALT: () => {
            $.CONSUME(tokens.AndAnd);
          }
        },
        // | '||'
        {
          ALT: () => {
            $.CONSUME(tokens.OrOr);
          }
        },
        // ('=' | '+=' | '-=' | '*=' | '/=' | '&=' | '|=' | '^=' | '>>=' | '>>>=' | '<<=' | '%=')
        {
          ALT: () => {
            $.CONSUME(tokens.Equals);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.PlusEquals);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.MinusEquals);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.StarEquals);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.DashEquals);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.AndEquals);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.OrEquals);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.CaretEquals);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.GreaterGreaterEquals);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.GreaterGreaterGreaterEquals);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.LessLessEquals);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.PercentageEquals);
          }
        }
      ]);
    });

    // operatorExpressionRest
    // : operator expression
    $.RULE("operatorExpressionRest", () => {
      const operator = $.SUBRULE($.operator);
      $.OR([
        { ALT: () => $.SUBRULE($.expression) },
        {
          GATE: () => operator.children.Equals.length > 0,
          ALT: () => $.SUBRULE($.elementValueArrayInitializer)
        }
      ]);
    });

    // methodReferenceRest // Java 8
    // : '::' typeArguments? (IDENTIFIER | NEW)
    $.RULE("methodReferenceRest", () => {
      $.CONSUME(tokens.ColonColon);
      $.OPTION(() => {
        $.SUBRULE($.typeArguments);
      });
      $.OR([
        {
          ALT: () => {
            $.CONSUME(tokens.Identifier);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.New);
          }
        }
      ]);
    });

    // lambdaExpression // Java8
    // : lambdaParameters '->' lambdaBody
    $.RULE("lambdaExpression", () => {
      $.SUBRULE($.lambdaParameters);
      $.CONSUME(tokens.Pointer);
      $.SUBRULE($.lambdaBody);
    });

    // lambdaParameters // Java8
    // : IDENTIFIER
    // | formalParameters
    // | identifiers
    $.RULE("lambdaParameters", () => {
      $.OR([
        { ALT: () => $.CONSUME(tokens.Identifier) },
        {
          ALT: () => {
            $.CONSUME(tokens.LBrace);
            $.CONSUME(tokens.RBrace);
          }
        },
        {
          ALT: () => {
            $.CONSUME2(tokens.LBrace);
            $.SUBRULE($.formalParameterList);
            $.CONSUME2(tokens.RBrace);
          }
        },
        {
          ALT: () => {
            $.CONSUME3(tokens.LBrace);
            $.SUBRULE($.identifierList);
            $.CONSUME3(tokens.RBrace);
          }
        }
      ]);
    });

    // // Java8
    // lambdaBody
    // : expression
    // | block
    $.RULE("lambdaBody", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.expression) },
        { ALT: () => $.SUBRULE($.block) }
      ]);
    });

    // classType
    // : annotation* classOrInterfaceType
    $.RULE("classType", () => {
      $.MANY(() => {
        $.SUBRULE($.annotation);
      });
      $.SUBRULE($.classOrInterfaceType);
    });

    // creator
    // : nonWildcardCreator
    // | simpleCreator
    $.RULE("creator", () => {
      $.CONSUME(tokens.New);
      $.OR([
        { ALT: () => $.SUBRULE($.nonWildcardCreator) },
        { ALT: () => $.SUBRULE($.simpleCreator) }
      ]);
    });

    // nonWildCardCreator
    // : nonWildcardTypeArguments createdName classCreatorRest
    $.RULE("nonWildcardCreator", () => {
      $.SUBRULE($.nonWildcardTypeArguments);
      $.SUBRULE($.createdName);
      $.SUBRULE($.classCreatorRest);
    });

    // simpleCreator
    // : createdName (arrayCreatorRest | classCreatorRest)
    $.RULE("simpleCreator", () => {
      $.SUBRULE($.createdName);
      $.OR([
        { ALT: () => $.SUBRULE($.arrayCreatorRest) },
        { ALT: () => $.SUBRULE($.classCreatorRest) }
      ]);
    });

    // createdName
    // : identifierName
    // | primitiveType
    $.RULE("createdName", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.identifierName) },
        { ALT: () => $.SUBRULE($.primitiveType) }
      ]);
    });

    // identifierName
    // : identifierNameElement ('.' identifierNameElement)*
    $.RULE("identifierName", () => {
      $.AT_LEAST_ONE_SEP({
        SEP: tokens.Dot,
        DEF: () => {
          $.SUBRULE($.identifierNameElement);
        }
      });
    });

    // identifierNameElement
    // : IDENTIFIER typeArgumentsOrDiamond?
    $.RULE("identifierNameElement", () => {
      $.CONSUME(tokens.Identifier);
      $.OPTION(() => {
        $.SUBRULE($.nonWildcardTypeArgumentsOrDiamond);
      });
    });

    // innerCreator
    // : IDENTIFIER nonWildcardTypeArgumentsOrDiamond? classCreatorRest
    $.RULE("innerCreator", () => {
      $.CONSUME(tokens.Identifier);
      $.OPTION(() => {
        $.SUBRULE($.nonWildcardTypeArgumentsOrDiamond);
      });
      $.SUBRULE($.classCreatorRest);
    });

    // arrayCreatorRest
    // : '[' (']' ('[' ']')* arrayInitializer | expression ']' ('[' expression ']')* ('[' ']')*)
    $.RULE("arrayCreatorRest", () => {
      $.CONSUME(tokens.LSquare);
      $.OR([
        {
          ALT: () => {
            $.CONSUME(tokens.RSquare);
            $.MANY(() => {
              $.CONSUME2(tokens.LSquare);
              $.CONSUME2(tokens.RSquare);
            });
            $.SUBRULE($.arrayInitializer);
          }
        },
        {
          ALT: () => {
            $.SUBRULE($.expression);
            $.CONSUME3(tokens.RSquare);
            $.MANY2(() => {
              $.CONSUME4(tokens.LSquare);
              $.SUBRULE2($.expression);
              $.CONSUME4(tokens.RSquare);
            });
            $.MANY3(() => {
              $.CONSUME5(tokens.LSquare);
              $.CONSUME5(tokens.RSquare);
            });
          }
        }
      ]);
    });

    // classCreatorRest
    // : arguments classBody?
    $.RULE("classCreatorRest", () => {
      $.SUBRULE($.arguments);
      $.OPTION(() => {
        $.SUBRULE($.classBody);
      });
    });

    // explicitGenericInvocation
    // : nonWildcardTypeArguments explicitGenericInvocationSuffix
    $.RULE("explicitGenericInvocation", () => {
      $.SUBRULE($.nonWildcardTypeArguments);
      $.SUBRULE($.explicitGenericInvocationSuffix);
    });

    // typeArgumentsOrDiamond
    // : emptyDiamond
    // | typeArguments
    $.RULE("typeArgumentsOrDiamond", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.emptyDiamond) },
        { ALT: () => $.SUBRULE($.typeArguments) }
      ]);
    });

    // nonWildcardTypeArgumentsOrDiamond
    // : emptyDiamond
    // | nonWildcardTypeArguments
    $.RULE("nonWildcardTypeArgumentsOrDiamond", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.emptyDiamond) },
        { ALT: () => $.SUBRULE($.nonWildcardTypeArguments) }
      ]);
    });

    // emptyDiamond
    // : '<' '>'
    $.RULE("emptyDiamond", () => {
      $.CONSUME(tokens.Less);
      $.CONSUME(tokens.Greater);
    });

    // nonWildcardTypeArguments
    // : '<' typeList '>'
    $.RULE("nonWildcardTypeArguments", () => {
      $.CONSUME(tokens.Less);
      $.SUBRULE($.typeList);
      $.CONSUME(tokens.Greater);
    });

    // qualifiedName
    // : IDENTIFIER ('.' IDENTIFIER)*
    $.RULE("qualifiedName", () => {
      $.CONSUME(tokens.Identifier);
      $.MANY({
        // The gate condition is in addition to basic grammar lookahead, so this.LA(1) === dot
        // is always checked
        GATE: () => this.LA(2).tokenType === tokens.Identifier,
        DEF: () => {
          $.CONSUME(tokens.Dot);
          $.CONSUME2(tokens.Identifier);
        }
      });
    });

    // primary
    // : THIS
    // | SUPER
    // | literal
    // | IDENTIFIER
    //// | typeTypeOrVoid '.' CLASS
    // | nonWildcardTypeArguments (explicitGenericInvocationSuffix | THIS arguments)
    $.RULE("primary", () => {
      $.OR([
        {
          ALT: () => {
            $.SUBRULE($.thisOrSuper);
          }
        },
        { ALT: () => $.SUBRULE($.literal) },
        {
          ALT: () => {
            $.OR2([
              {
                ALT: () => {
                  $.SUBRULE($.annotation);
                  $.OPTION2(() => {
                    $.OR3([
                      {
                        ALT: () => {
                          $.CONSUME(tokens.Identifier);
                          $.OPTION3(() => {
                            $.SUBRULE($.typeArguments);
                          });
                        }
                      },
                      { ALT: () => $.SUBRULE($.primitiveType) }
                    ]);
                    $.MANY(() => {
                      $.CONSUME(tokens.LSquare);
                      $.CONSUME(tokens.RSquare);
                    });
                  });
                }
              },
              {
                ALT: () => {
                  $.OR4([
                    {
                      ALT: () => {
                        $.SUBRULE(
                          $.identifierOrIdentifierWithTypeArgumentsOrOperatorExpression
                        );
                      }
                    },
                    { ALT: () => $.SUBRULE2($.primitiveType) }
                  ]);
                  $.MANY2(() => {
                    $.SUBRULE($.dimension);
                  });
                }
              }
            ]);
          }
        },
        { ALT: () => $.CONSUME(tokens.Void) },
        {
          ALT: () => {
            $.SUBRULE($.nonWildcardTypeArguments);
            $.OR5([
              { ALT: () => $.SUBRULE($.explicitGenericInvocationSuffix) },
              {
                ALT: () => {
                  $.CONSUME2(tokens.This);
                  $.SUBRULE2($.arguments);
                }
              }
            ]);
          }
        }
      ]);
    });

    // identifierOrIdentifierWithTypeArgumentsOrOperatorExpression
    $.RULE(
      "identifierOrIdentifierWithTypeArgumentsOrOperatorExpression",
      () => {
        $.CONSUME(tokens.Identifier);
        $.OPTION(() => {
          $.SUBRULE($.typeArgumentsOrOperatorExpressionRest);
        });
      }
    );

    // dimension
    // : '[' expression? ']'
    $.RULE("dimension", () => {
      $.CONSUME(tokens.LSquare);
      $.OPTION(() => $.SUBRULE($.expression));
      $.CONSUME(tokens.RSquare);
    });

    // thisOrSuper
    // : (
    //     THIS
    //     | SUPER
    //   )
    //   arguments?
    $.RULE("thisOrSuper", () => {
      $.OR([
        {
          ALT: () => {
            $.CONSUME(tokens.This);
          }
        },
        {
          ALT: () => {
            $.CONSUME(tokens.Super);
          }
        }
      ]);
      $.OPTION(() => $.SUBRULE($.arguments));
    });

    // literal
    // : integerLiteral
    // | floatLiteral
    // | CHAR_LITERAL
    // | STRING_LITERAL
    // | BOOL_LITERAL
    // | NULL_LITERAL
    $.RULE("literal", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.integerLiteral) },
        { ALT: () => $.SUBRULE($.floatLiteral) },
        { ALT: () => $.CONSUME(tokens.CharLiteral) },
        { ALT: () => $.SUBRULE($.stringLiteral) },
        { ALT: () => $.SUBRULE($.booleanLiteral) },
        { ALT: () => $.CONSUME(tokens.Null) }
      ]);
    });

    // stringLiteral
    $.RULE("stringLiteral", () => {
      $.CONSUME(tokens.StringLiteral);
    });

    // booleanLiteral
    // : TRUE
    // | FALSE
    $.RULE("booleanLiteral", () => {
      $.OR([
        { ALT: () => $.CONSUME(tokens.True) },
        { ALT: () => $.CONSUME(tokens.False) }
      ]);
    });

    // integerLiteral
    // : DECIMAL_LITERAL
    // | HEX_LITERAL
    // | OCT_LITERAL
    // | BINARY_LITERAL
    $.RULE("integerLiteral", () => {
      $.OR([
        { ALT: () => $.CONSUME(tokens.DecimalLiteral) },
        { ALT: () => $.CONSUME(tokens.HexLiteral) },
        { ALT: () => $.CONSUME(tokens.OctLiteral) },
        { ALT: () => $.CONSUME(tokens.BinaryLiteral) }
      ]);
    });

    // floatLiteral
    // : FLOAT_LITERAL
    // | HEX_FLOAT_LITERAL
    $.RULE("floatLiteral", () => {
      $.OR([
        { ALT: () => $.CONSUME(tokens.FloatLiteral) },
        { ALT: () => $.CONSUME(tokens.HexFloatLiteral) }
      ]);
    });

    // primitiveType
    // : BOOLEAN
    // | CHAR
    // | BYTE
    // | SHORT
    // | INT
    // | LONG
    // | FLOAT
    // | DOUBLE
    $.RULE("primitiveType", () => {
      $.OR([
        { ALT: () => $.CONSUME(tokens.Boolean) },
        { ALT: () => $.CONSUME(tokens.Char) },
        { ALT: () => $.CONSUME(tokens.Byte) },
        { ALT: () => $.CONSUME(tokens.Short) },
        { ALT: () => $.CONSUME(tokens.Int) },
        { ALT: () => $.CONSUME(tokens.Long) },
        { ALT: () => $.CONSUME(tokens.Float) },
        { ALT: () => $.CONSUME(tokens.Double) }
      ]);
    });

    // semiColon
    // : ';'
    // | ( ';' \n \n )
    $.RULE("semiColon", () => {
      $.OR([
        { ALT: () => $.CONSUME(tokens.SemiColon) },
        { ALT: () => $.CONSUME(tokens.SemiColonWithFollowEmptyLine) }
      ]);
    });

    Parser.performSelfAnalysis(this);
  }

  LA(howMuch) {
    if (howMuch === 1) {
      let token = super.LA(howMuch);
      while (
        tokenMatcher(token, tokens.LineComment) ||
        tokenMatcher(token, tokens.JavaDocComment) ||
        tokenMatcher(token, tokens.TraditionalComment) ||
        tokenMatcher(token, tokens.LineCommentStandalone) ||
        tokenMatcher(token, tokens.JavaDocCommentStandalone) ||
        tokenMatcher(token, tokens.TraditionalCommentStandalone)
      ) {
        const comment = token;
        super.consumeToken();
        token = super.LA(howMuch);
        if (!this.isEmptyComment(comment)) {
          const prevToken = this.CST_STACK[this.CST_STACK.length - 1];
          // If we are in a class or interface body
          if (
            prevToken.name === "classBody" ||
            prevToken.name === "interfaceBody" ||
            prevToken.name === "block"
          ) {
            if (
              tokenMatcher(comment, tokens.LineCommentStandalone) ||
              tokenMatcher(comment, tokens.JavaDocCommentStandalone) ||
              tokenMatcher(comment, tokens.TraditionalCommentStandalone)
            ) {
              if (prevToken.name === "classBody") {
                this.addCommentStandAlone(
                  prevToken,
                  "classBodyDeclaration",
                  comment
                );
              } else if (prevToken.name === "interfaceBody") {
                this.addCommentStandAlone(
                  prevToken,
                  "interfaceBodyDeclaration",
                  comment
                );
              } else if (prevToken.name === "block") {
                this.addCommentStandAlone(prevToken, "blockStatement", comment);
              }
            } else if (
              this.lastToken &&
              this.lastToken.startLine !== comment.startLine &&
              tokenMatcher(token, tokens.RCurly) &&
              (tokenMatcher(comment, tokens.LineComment) ||
                tokenMatcher(comment, tokens.JavaDocComment) ||
                tokenMatcher(comment, tokens.TraditionalComment))
            ) {
              // if its the last comment we transform it into a standalone comment
              if (prevToken.name === "classBody") {
                this.addCommentStandAlone(
                  prevToken,
                  "classBodyDeclaration",
                  comment
                );
              } else if (prevToken.name === "interfaceBody") {
                this.addCommentStandAlone(
                  prevToken,
                  "interfaceBodyDeclaration",
                  comment
                );
              } else if (prevToken.name === "block") {
                this.addCommentStandAlone(prevToken, "blockStatement", comment);
              }
            }
          }
        }
      }
      this.lastToken = token;
      return token;
    }

    if (howMuch > 1) {
      return this.LAgreater1(howMuch);
    }
  }

  addCommentStandAlone(prevToken, declaration, comment) {
    if (!prevToken.children[declaration]) {
      prevToken.children[declaration] = [];
    }
    prevToken.children[declaration].push({
      name: comment.image.startsWith("//")
        ? "LineCommentStandalone"
        : "JavaDocTraditionalCommentStandalone",
      children: { image: comment.image }
    });
    comment.added = true;
  }

  LAgreater1(howMuch) {
    let nextSearchIdx = this.currIdx;
    for (let i = 0; i < howMuch; i++) {
      nextSearchIdx = this.skipComments(nextSearchIdx + 1);
    }

    const token = this.input[nextSearchIdx];
    if (!token) {
      return END_OF_FILE;
    }
    return token;
  }

  skipComments(nextSearchIdx) {
    let token = this.input[nextSearchIdx];
    while (
      token &&
      (tokenMatcher(token, tokens.LineComment) ||
        tokenMatcher(token, tokens.JavaDocComment) ||
        tokenMatcher(token, tokens.TraditionalComment) ||
        tokenMatcher(token, tokens.LineCommentStandalone) ||
        tokenMatcher(token, tokens.JavaDocCommentStandalone) ||
        tokenMatcher(token, tokens.TraditionalCommentStandalone))
    ) {
      nextSearchIdx++;
      token = this.input[nextSearchIdx];
    }
    return nextSearchIdx;
  }

  cstPostTerminal(key, consumedToken) {
    super.cstPostTerminal(key, consumedToken);

    const lastElement = this.CST_STACK[this.CST_STACK.length - 1];
    if (lastElement.name === "semiColon") {
      const nextToken = super.LA(1);
      // After every Token (terminal) is successfully consumed
      // We will add all the comment that appeared after it on the same line
      // to the CST (Parse Tree)
      if (
        tokenMatcher(nextToken, tokens.LineComment) &&
        !nextToken.added &&
        ((lastElement.children.SemiColon &&
          nextToken.startLine ===
            lastElement.children.SemiColon[0].startLine) ||
          (lastElement.children.SemiColonWithFollowEmptyLine &&
            nextToken.startLine ===
              lastElement.children.SemiColonWithFollowEmptyLine[0].startLine))
      ) {
        nextToken.trailing = true;
        nextToken.added = true;
        this.CST_STACK[this.CST_STACK.length - 2].children[
          tokens.LineComment.tokenName
        ] = [nextToken];
      }
    } else {
      let lookBehindIdx = -1;
      let prevToken = super.LA(lookBehindIdx);

      // After every Token (terminal) is successfully consumed
      // We will add all the comment that appeared before it to the CST (Parse Tree)
      while (
        !prevToken.added &&
        (tokenMatcher(prevToken, tokens.LineComment) ||
          tokenMatcher(prevToken, tokens.TraditionalComment) ||
          tokenMatcher(prevToken, tokens.JavaDocComment) ||
          tokenMatcher(prevToken, tokens.LineCommentStandalone) ||
          tokenMatcher(prevToken, tokens.TraditionalCommentStandalone) ||
          tokenMatcher(prevToken, tokens.JavaDocCommentStandalone))
      ) {
        // TODO replace with faster method instead of replace
        if (!this.isEmptyComment(prevToken)) {
          super.cstPostTerminal(
            prevToken.tokenType.tokenName.replace("Standalone", ""),
            prevToken
          );
        }
        lookBehindIdx--;
        prevToken = super.LA(lookBehindIdx);
      }
    }
  }

  isEmptyComment(comment) {
    // TODO fix replace because SLOW
    return (
      (tokenMatcher(comment, tokens.LineComment) &&
        comment.image.replace(/[\s]*/g, "") === "//") ||
      (tokenMatcher(comment, tokens.JavaDocComment) &&
        comment.image.replace(/[\s\n\r*]*/g, "") === "//") ||
      (tokenMatcher(comment, tokens.TraditionalComment) &&
        comment.image.replace(/[\s\n\r*]*/g, "") === "//") ||
      (tokenMatcher(comment, tokens.LineCommentStandalone) &&
        comment.image.replace(/[\s]*/g, "") === "//") ||
      (tokenMatcher(comment, tokens.JavaDocCommentStandalone) &&
        comment.image.replace(/[\s\n\r*]*/g, "") === "//") ||
      (tokenMatcher(comment, tokens.TraditionalCommentStandalone) &&
        comment.image.replace(/[\s\n\r*]*/g, "") === "//")
    );
  }
}

module.exports = JavaParser;
