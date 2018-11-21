"use strict";
const { Parser } = require("chevrotain");
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
 */
class JavaParser extends Parser {
  constructor() {
    super(allTokens, {
      ignoredIssues: {
        // ambiguity resolved by backtracking
        referenceType: {
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
      $.AT_LEAST_ONE(() => {
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
      $.CONSUME(t.Identifier);
      $.MANY(() => {
        $.CONSUME(t.Dot);
        $.CONSUME2(t.Identifier);
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-6.html#jls-PackageOrTypeName
    $.RULE("packageOrTypeName", () => {
      $.CONSUME(t.Identifier);
      $.MANY({
        // In some contexts a "Dot Star" (.*) may appear
        // at the end of a packageOrTypeName, by default Chevrotain will
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

    // ---------------------
    // Productions from §7 (Packages and Modules)
    // ---------------------

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-7.html#CompilationUnit
    $.RULE("compilationUnit", () => {
      // Spec Deviation: "ordinaryCompilationUnit" and "modularCompilationUnit" have been combined
      // due to possible common prefix.
      let hasPackage = false;
      $.OPTION(() => {
        $.SUBRULE($.packageDeclaration);
        hasPackage = true;
      });

      $.MANY(() => {
        $.SUBRULE($.importDeclaration);
      });

      $.MANY2(() => {
        // Spec Deviation: Common prefix of "annotations" was extracted from
        //                 "typeDeclaration" and "moduleDeclaration"
        $.MANY3(() => {
          $.SUBRULE($.annotation);
        });
        // TODO: post parsing semantic check:
        //       - "typeDeclarations" and "moduleDeclarations" cannot be mixed.
        $.OR([
          // ordinaryCompilationUnit
          { ALT: () => $.SUBRULE($.typeDeclaration) },
          // modularCompilationUnit
          {
            GATE: () => !hasPackage,
            // TODO: post parsing semantic check:
            //       - there can only be one moduleDeclaration per input.
            ALT: () => $.SUBRULE($.moduleDeclaration)
          }
        ]);
      });
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
      // Spec Deviation: The spec defines our different kinds of import declarations.
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
      $.OR([
        { ALT: () => $.SUBRULE($.classDeclaration) },
        { ALT: () => $.SUBRULE($.interfaceDeclaration) },
        { ALT: () => $.CONSUME(t.Semicolon) }
      ]);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-7.html#jls-ModuleDeclaration
    $.RULE("moduleDeclaration", () => {
      // Spec Deviation: Common prefix of "annotations" was extracted to "compilationUnit"
      $.OPTION(() => {
        $.CONSUME(t.Open);
      });
      $.CONSUME(t.Module);
      $.CONSUME(t.Identifier);
      $.MANY(() => {
        $.CONSUME(t.Dot);
        $.CONSUME2(t.Identifier);
      });
      $.CONSUME(t.LCurly);
      $.MANY2(() => {
        $.SUBRULE($.moduleDirective);
      });
      $.CONSUME(t.RCurly);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-7.html#jls-ModuleDirective
    $.RULE("moduleDirective", () => {
      // Spec Deviation: Each of the alternatives of "moduleDirective" was extracted
      //                 to its own nonTerminal.
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
