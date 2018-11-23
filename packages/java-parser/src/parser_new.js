"use strict";
const { Parser, isRecognitionException } = require("chevrotain");
const { allTokens, tokens: t } = require("./tokens_new");

/**
 * This parser attempts to strongly align with the specs style at:
 * -  https://docs.oracle.com/javase/specs/jls/se11/html/jls-19.html
 *
 * Deviations from the spec will be marked.
 *
 * Note that deviations from the spec do not mean deviations from Java Grammar.
 * Rather it means an **equivalent** grammar which was written differently, e.g:
 * - LL(k) vs LR(K)
 * - Left Recursions vs Repetitions
 * - NonTerminals combined together or divided to sub-NonTerminals
 * - ...
 *
 * A special type of spec deviations are the "super grammar" kind.
 * This means that the parser has been defined in such a way that it accept a
 * **strict superset** of the inputs the official grammar accepts.
 *
 * This technique is used to simplify the parser when narrowing the set
 * of accepted inputs can more easily be done in a post parsing phase.
 *
 */
class JavaParser extends Parser {
  constructor() {
    super(allTokens, {
      // ambiguities resolved by backtracking
      ignoredIssues: {
        referenceType: {
          OR: true
        },
        compilationUnit: {
          OR: true
        }
      }
    });

    const $ = this;

    // ---------------------
    // Productions from §3 (Lexical Structure)
    // ---------------------
    $.RULE("typeIdentifier", () => {
      // TODO: implement: Identifier but not var
      $.CONSUME(t.Identifier);
    });

    // ---------------------
    // Productions from §4 (Types, Values, and Variables)
    // ---------------------
    $.RULE("type", () => {
      $.OR([
        // "referenceType" must appear **before** "primitiveType" due to common prefix.
        {
          GATE: () => $.BACKTRACK($.referenceType),
          ALT: () => $.SUBRULE($.referenceType)
        },
        {
          // Backtracking not needed, because if its not a "referenceType"
          // It must be a primitiveType (or Error)
          ALT: () => $.SUBRULE($.primitiveType)
        }
      ]);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-4.html#jls-PrimitiveType
    $.RULE("primitiveType", () => {
      $.MANY(() => {
        $.SUBRULE($.annotation);
      });
      $.OR([
        { ALT: () => $.SUBRULE($.numericType) },
        { ALT: () => $.CONSUME(t.Boolean) }
      ]);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-4.html#jls-NumericType
    $.RULE("numericType", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.integralType) },
        { ALT: () => $.SUBRULE($.floatingPointType) }
      ]);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-4.html#jls-IntegralType
    $.RULE("integralType", () => {
      $.OR([
        { ALT: () => $.CONSUME(t.Byte) },
        { ALT: () => $.CONSUME(t.Short) },
        { ALT: () => $.CONSUME(t.Int) },
        { ALT: () => $.CONSUME(t.Long) },
        { ALT: () => $.CONSUME(t.Char) }
      ]);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-4.html#jls-FloatingPointType
    $.RULE("floatingPointType", () => {
      $.OR([
        { ALT: () => $.CONSUME(t.Float) },
        { ALT: () => $.CONSUME(t.Double) }
      ]);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-4.html#jls-ReferenceType
    $.RULE("referenceType", () => {
      $.OR([
        // Spec Deviation: "arrayType" must appear **before**
        //                 "classOrInterfaceType" due to common prefix.
        {
          GATE: () => $.BACKTRACK($.arrayType),
          ALT: () => $.SUBRULE($.arrayType)
        },
        {
          ALT: () => $.SUBRULE($.classOrInterfaceType)
        }
      ]);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-4.html#jls-ClassOrInterfaceType
    $.RULE("classOrInterfaceType", () => {
      // Spec Deviation: The spec says: "classType | interfaceType" but "interfaceType"
      //                 is not mentioned in the parser because it is identical to "classType"
      //                 The distinction is **semantic** not syntactic.
      $.SUBRULE($.classType);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-4.html#jls-ClassType
    $.RULE("classType", () => {
      // Spec Deviation: Refactored left recursion and alternation to iterations
      $.MANY(() => {
        $.SUBRULE($.annotation);
      });
      $.CONSUME(t.Identifier);
      $.OPTION(() => {
        $.SUBRULE($.typeArguments);
      });
      $.MANY2(() => {
        $.CONSUME(t.Dot);
        $.MANY3(() => {
          $.SUBRULE2($.annotation);
        });
        // TODO: Semantic Check: This Identifier cannot be "var"
        $.CONSUME2(t.Identifier);
        $.OPTION2(() => {
          $.SUBRULE2($.typeArguments);
        });
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-4.html#jls-InterfaceType
    $.RULE("interfaceType", () => {
      $.SUBRULE($.classType);
    });

    $.RULE("typeVariable", () => {
      $.MANY(() => {
        $.SUBRULE($.annotation);
      });
      // TODO: Semantic Check: This Identifier cannot be "var"
      $.CONSUME(t.Identifier);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-4.html#jls-ArrayType
    $.RULE("arrayType", () => {
      // Spec Deviation: The alternative with "TypeVariable" is not specified
      //      because it's syntax is included in "classOrInterfaceType"
      $.OR([
        {
          GATE: () => $.BACKTRACK($.primitiveType),
          ALT: () => $.SUBRULE($.primitiveType)
        },
        {
          ALT: () => $.SUBRULE($.classOrInterfaceType)
        }
      ]);
      $.SUBRULE($.dims);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-4.html#jls-Dims
    $.RULE("dims", () => {
      $.MANY(() => {
        $.SUBRULE($.annotation);
      });
      $.CONSUME(t.LSquare);
      $.CONSUME(t.RSquare);

      $.MANY2(() => {
        $.MANY3(() => {
          $.SUBRULE2($.annotation);
        });
        $.CONSUME2(t.LSquare);
        $.CONSUME2(t.RSquare);
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-4.html#jls-TypeParameter
    $.RULE("typeParameter", () => {
      $.MANY(() => {
        $.SUBRULE($.typeParameterModifier);
      });
      $.SUBRULE($.typeIdentifier);
      $.OPTION(() => {
        $.SUBRULE($.typeBound);
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-4.html#jls-TypeParameterModifier
    $.RULE("typeParameterModifier", () => {
      $.SUBRULE($.annotation);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-4.html#jls-TypeBound
    $.RULE("typeBound", () => {
      $.CONSUME(t.Extends);
      // Spec Deviation: The alternative with "TypeVariable" is not specified
      //      because it's syntax is included in "classOrInterfaceType"
      $.SUBRULE($.classOrInterfaceType);
      $.MANY2(() => {
        $.SUBRULE($.additionalBound);
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-4.html#jls-AdditionalBound
    $.RULE("additionalBound", () => {
      $.CONSUME(t.At);
      $.SUBRULE($.interfaceType);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-4.html#jls-TypeArguments
    $.RULE("typeArguments", () => {
      $.CONSUME(t.Less);
      $.SUBRULE($.typeArgumentList);
      $.CONSUME(t.Greater);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-4.html#jls-TypeArgumentList
    $.RULE("typeArgumentList", () => {
      $.SUBRULE($.typeArgument);
      $.MANY(() => {
        $.CONSUME(t.Comma);
        $.SUBRULE2($.typeArgument);
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-4.html#jls-TypeArgument
    $.RULE("typeArgument", () => {
      // TODO: performance: evaluate flipping the order of alternatives
      $.OR([
        {
          GATE: () => $.BACKTRACK($.referenceType),
          ALT: () => $.SUBRULE($.referenceType)
        },
        { ALT: () => $.SUBRULE($.wildcard) }
      ]);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-4.html#jls-Wildcard
    $.RULE("wildcard", () => {
      $.MANY(() => {
        $.SUBRULE($.annotation);
      });
      $.CONSUME(t.Questionmark);
      $.OPTION(() => {
        $.SUBRULE($.wildcardBounds);
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-4.html#jls-WildcardBounds
    $.RULE("wildcardBounds", () => {
      // TODO: consider in-lining suffix into the alternatives to match the spec more strongly
      $.OR([
        { ALT: () => $.CONSUME(t.Extends) },
        { ALT: () => $.CONSUME(t.Super) }
      ]);
      $.SUBRULE($.referenceType);
    });

    // ---------------------
    // Productions from §6 (Names)
    // ---------------------

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-6.html#jls-ModuleName
    $.RULE("moduleName", () => {
      $.CONSUME(t.Identifier);
      $.MANY(() => {
        $.CONSUME(t.Dot);
        $.CONSUME2(t.Identifier);
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-6.html#jls-PackageName
    $.RULE("packageName", () => {
      $.CONSUME(t.Identifier);
      $.MANY(() => {
        $.CONSUME(t.Dot);
        $.CONSUME2(t.Identifier);
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-6.html#jls-TypeName
    $.RULE("typeName", () => {
      // Spec Deviation: The last Identifier in a "typeName" may not be be "var"
      //                 But the parser does not check for that.
      // TODO: post parsing semantic check: last "Identifier" in a "typeName"
      //                                    cannot be the "var" keyword
      // TODO: option 2 implement "Not Var" Ident using token categories?
      $.CONSUME(t.Identifier);
      $.MANY(() => {
        $.CONSUME(t.Dot);
        $.CONSUME2(t.Identifier);
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-6.html#jls-ExpressionName
    $.RULE("expressionName", () => {
      // Spec Deviation: in-lined "ambiguousName" to be LL(K)
      $.CONSUME(t.Identifier);
      $.MANY(() => {
        $.CONSUME(t.Dot);
        $.CONSUME2(t.Identifier);
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-6.html#jls-MethodName
    $.RULE("methodName", () => {
      $.CONSUME(t.Identifier);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-6.html#jls-PackageOrTypeName
    $.RULE("packageOrTypeName", () => {
      $.CONSUME(t.Identifier);
      $.MANY({
        // In some contexts a "Dot Star" (.*) may appear
        // after a "packageOrTypeName", by default Chevrotain will
        // only look a single token ahead (Dot) to determine if another iteration
        // exists which will cause a parsing error for inputs such as:
        // "import a.b.c.*"
        GATE: () => this.LA(2).tokenType !== t.Star,
        DEF: () => {
          $.CONSUME(t.Dot);
          $.CONSUME2(t.Identifier);
        }
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-6.html#jls-AmbiguousName
    $.RULE("ambiguousName", () => {
      $.CONSUME(t.Identifier);
      $.MANY(() => {
        $.CONSUME(t.Dot);
        $.CONSUME2(t.Identifier);
      });
    });

    // ---------------------
    // Productions from §7 (Packages and Modules)
    // ---------------------

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-7.html#CompilationUnit
    $.RULE("compilationUnit", () => {
      // custom optimized backtracking lookahead logic
      const isModule = this.isModuleCompilationUnit();
      $.OR([
        {
          GATE: () => isModule === false,
          ALT: () => $.SUBRULE($.ordinaryCompilationUnit)
        },
        {
          ALT: () => $.SUBRULE($.modularCompilationUnit)
        }
      ]);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-7.html#jls-OrdinaryCompilationUnit
    $.RULE("ordinaryCompilationUnit", () => {
      $.OPTION(() => {
        $.SUBRULE($.packageDeclaration);
      });
      $.MANY(() => {
        $.SUBRULE($.importDeclaration);
      });
      $.MANY2(() => {
        $.SUBRULE($.typeDeclaration);
      });
    });

    //     // https://docs.oracle.com/javase/specs/jls/se11/html/jls-7.html#jls-ModularCompilationUnit
    $.RULE("modularCompilationUnit", () => {
      $.MANY(() => {
        $.SUBRULE($.importDeclaration);
      });
      $.SUBRULE($.moduleDeclaration);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-7.html#jls-PackageDeclaration
    $.RULE("packageDeclaration", () => {
      $.MANY(() => {
        $.SUBRULE($.packageModifier);
      });
      $.CONSUME(t.Package);
      $.CONSUME(t.Identifier);
      $.MANY2(() => {
        $.CONSUME(t.Dot);
        $.CONSUME2(t.Identifier);
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-7.html#jls-PackageModifier
    $.RULE("packageModifier", () => {
      $.SUBRULE($.annotation);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-7.html#jls-ImportDeclaration
    $.RULE("importDeclaration", () => {
      // Spec Deviation: The spec defines four different kinds of import declarations.
      //                 Our grammar however combines those into a single rule due to difficulties
      //                 distinguishing between the alternatives due to unbound common prefix.
      // TODO: A post parsing step is required to align with the official specs.
      //       The Identifier "var" is not allowed in all positions and variations of the importDeclaration
      $.CONSUME(t.Import);
      $.OPTION(() => {
        $.CONSUME(t.Static);
      });
      $.SUBRULE($.packageOrTypeName);
      $.OPTION2(() => {
        $.CONSUME(t.Dot);
        $.CONSUME(t.Star);
      });
      $.CONSUME(t.Semicolon);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-7.html#jls-TypeDeclaration
    $.RULE("typeDeclaration", () => {
      const isClassDeclaration = this.isClassDeclaration();
      $.OR([
        {
          GATE: () => isClassDeclaration,
          ALT: () => $.SUBRULE($.classDeclaration)
        },
        { ALT: () => $.SUBRULE($.interfaceDeclaration) },
        { ALT: () => $.CONSUME(t.Semicolon) }
      ]);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-7.html#jls-ModuleDeclaration
    $.RULE("moduleDeclaration", () => {
      $.MANY(() => {
        $.SUBRULE($.annotation);
      });
      $.OPTION(() => {
        $.CONSUME(t.Open);
      });
      $.CONSUME(t.Module);
      $.CONSUME(t.Identifier);
      $.MANY2(() => {
        $.CONSUME(t.Dot);
        $.CONSUME2(t.Identifier);
      });
      $.CONSUME(t.LCurly);
      $.MANY3(() => {
        $.SUBRULE($.moduleDirective);
      });
      $.CONSUME(t.RCurly);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-7.html#jls-ModuleDirective
    $.RULE("moduleDirective", () => {
      // Spec Deviation: Each of the alternatives of "moduleDirective" was extracted
      //                 to its own nonTerminal, to reduce verbosity.
      $.OR([
        { ALT: () => $.SUBRULE($.requiresModuleDirective) },
        { ALT: () => $.SUBRULE($.exportsModuleDirective) },
        { ALT: () => $.SUBRULE($.opensModuleDirective) },
        { ALT: () => $.SUBRULE($.usesModuleDirective) },
        { ALT: () => $.SUBRULE($.providesModuleDirective) }
      ]);
    });

    $.RULE("requiresModuleDirective", () => {
      // Spec Deviation: extracted from "moduleDirective"
      $.CONSUME(t.Requires);
      $.MANY(() => {
        $.SUBRULE($.requiresModifier);
      });
      $.SUBRULE($.moduleName);
      $.CONSUME(t.Semicolon);
    });

    $.RULE("exportsModuleDirective", () => {
      // Spec Deviation: extracted from "moduleDirective"
      $.CONSUME(t.Exports);
      $.SUBRULE($.packageName);
      $.OPTION(() => {
        $.CONSUME(t.To);
        $.SUBRULE($.moduleName);
        $.MANY(() => {
          $.CONSUME(t.Comma);
          $.SUBRULE2($.moduleName);
        });
      });
      $.CONSUME(t.Semicolon);
    });

    $.RULE("opensModuleDirective", () => {
      // Spec Deviation: extracted from "moduleDirective"
      $.CONSUME(t.Opens);
      $.SUBRULE($.packageName);
      $.OPTION(() => {
        $.CONSUME(t.To);
        $.SUBRULE($.moduleName);
        $.MANY(() => {
          $.CONSUME(t.Comma);
          $.SUBRULE2($.moduleName);
        });
      });
      $.CONSUME(t.Semicolon);
    });

    $.RULE("usesModuleDirective", () => {
      // Spec Deviation: extracted from "moduleDirective"
      $.CONSUME(t.Uses);
      $.SUBRULE($.typeName);
      $.CONSUME(t.Semicolon);
    });

    $.RULE("providesModuleDirective", () => {
      // Spec Deviation: extracted from "moduleDirective"
      $.CONSUME(t.Provides);
      $.CONSUME(t.With);
      $.SUBRULE($.typeName);
      $.MANY(() => {
        $.CONSUME(t.Comma);
        $.SUBRULE2($.typeName);
      });
      $.CONSUME(t.Semicolon);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-7.html#jls-RequiresModifier
    $.RULE("requiresModifier", () => {
      $.OR([
        { ALT: () => $.CONSUME(t.Transitive) },
        { ALT: () => $.CONSUME(t.Static) }
      ]);
    });

    // ---------------------
    // Productions from §8 (Classes)
    // ---------------------
    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-ClassDeclaration
    $.RULE("classDeclaration", () => {
      // Spec Deviation: extracted common "{classModifier}" prefix
      $.MANY(() => {
        $.SUBRULE($.classModifier);
      });
      $.OR([
        { ALT: () => $.SUBRULE($.normalClassDeclaration) },
        { ALT: () => $.SUBRULE($.enumDeclaration) }
      ]);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-NormalClassDeclaration
    $.RULE("normalClassDeclaration", () => {
      // Spec Deviation: extracted common "{classModifier}" to "classDeclaration"
      $.CONSUME(t.Class);
      $.SUBRULE($.typeIdentifier);
      $.OPTION(() => {
        $.SUBRULE($.typeParameters);
      });
      $.OPTION2(() => {
        $.SUBRULE($.superclass);
      });
      $.OPTION3(() => {
        $.SUBRULE($.superinterfaces);
      });
      $.SUBRULE($.classBody);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-ClassModifier
    $.RULE("classModifier", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.annotation) },
        { ALT: () => $.CONSUME(t.Public) },
        { ALT: () => $.CONSUME(t.Protected) },
        { ALT: () => $.CONSUME(t.Private) },
        { ALT: () => $.CONSUME(t.Abstract) },
        { ALT: () => $.CONSUME(t.Static) },
        { ALT: () => $.CONSUME(t.Final) },
        { ALT: () => $.CONSUME(t.Strictfp) }
      ]);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-TypeParameters
    $.RULE("typeParameters", () => {
      $.CONSUME(t.Less);
      $.SUBRULE($.typeParameterList);
      $.CONSUME(t.Greater);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-TypeParameterList
    $.RULE("typeParameterList", () => {
      $.SUBRULE($.typeParameter);
      $.MANY(() => {
        $.CONSUME(t.Comma);
        $.SUBRULE2($.typeParameter);
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-Superclass
    $.RULE("superclass", () => {
      $.CONSUME(t.Extends);
      $.SUBRULE($.classType);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-Superinterfaces
    $.RULE("superinterfaces", () => {
      $.CONSUME(t.Implements);
      $.SUBRULE($.interfaceTypeList);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-InterfaceTypeList
    $.RULE("interfaceTypeList", () => {
      $.SUBRULE($.interfaceType);
      $.MANY(() => {
        $.CONSUME(t.Comma);
        $.SUBRULE2($.interfaceType);
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-ClassBody
    $.RULE("classBody", () => {
      $.CONSUME(t.LCurly);
      $.MANY(() => {
        $.SUBRULE($.classBodyDeclaration);
      });
      $.CONSUME(t.RCurly);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-ClassBodyDeclaration
    $.RULE("classBodyDeclaration", () => {
      // TODO: TBD
      $.CONSUME(t.Static);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-EnumDeclaration
    $.RULE("enumDeclaration", () => {
      // TODO: TBD
      $.CONSUME(t.Enum);
    });

    // ---------------------
    // Productions from §9 (Interfaces)
    // ---------------------
    $.RULE("interfaceDeclaration", () => {
      // TODO: TBD
      $.CONSUME(t.Interface);
    });

    $.RULE("annotation", () => {
      $.CONSUME(t.At);
    });

    // ---------------------
    // Backtracking lookahead logic
    // ---------------------
    $.RULE("isModuleCompilationUnit", () => {
      this.isBackTrackingStack.push(1);
      const orgState = this.saveRecogState();
      try {
        $.OPTION(() => {
          $.SUBRULE($.packageDeclaration);
          // a Java Module source code may not contain a package declaration.
          return false;
        });

        try {
          // the "{importDeclaration}" is a common prefix
          $.MANY(() => {
            $.SUBRULE2($.importDeclaration);
          });

          $.MANY2(() => {
            $.SUBRULE($.annotation);
          });
        } catch (e) {
          // This means we had a syntax error in the imports or annotations
          // So we can't keep parsing deep enough to make the decision
          if (isRecognitionException(e)) {
            // TODO: add original syntax error?
            throw "Cannot Identify if the source code is an OrdinaryCompilationUnit or  ModularCompilationUnit";
          } else {
            throw e;
          }
        }

        const nextTokenType = this.LA(1).tokenType;
        return nextTokenType === t.Open || nextTokenType === t.Module;
      } finally {
        this.reloadRecogState(orgState);
        this.isBackTrackingStack.pop();
      }
    });

    $.RULE("isClassDeclaration", () => {
      this.isBackTrackingStack.push(1);
      const orgState = this.saveRecogState();
      try {
        if (
          $.OPTION(() => {
            $.CONSUME(t.Semicolon);
          })
        ) {
          // an empty "TypeDeclaration"
          return false;
        }

        try {
          // The {classModifier} is a super grammar of the "interfaceModifier"
          // So we must parse all the "{classModifier}" before we can distinguish
          // between the alternatives.
          $.MANY(() => {
            $.SUBRULE($.classModifier);
          });
        } catch (e) {
          if (isRecognitionException(e)) {
            // TODO: add original syntax error?
            throw "Cannot Identify if the <TypeDeclaration> is a <ClassDeclaration> or an <InterfaceDeclaration>";
          } else {
            throw e;
          }
        }

        const nextTokenType = this.LA(1).tokenType;
        return nextTokenType === t.Class || nextTokenType === t.Enum;
      } finally {
        this.reloadRecogState(orgState);
        this.isBackTrackingStack.pop();
      }
    });

    this.performSelfAnalysis();
  }

  // hack to turn off CST building side effects during backtracking
  // TODO:
  cstPostNonTerminal(ruleCstResult, ruleName) {
    if (this.isBackTracking() === false) {
      super.cstPostNonTerminal(ruleCstResult, ruleName);
    }
  }
}

// TODO: remove this - only used during development to force self analysis
new JavaParser();

module.exports = JavaParser;
