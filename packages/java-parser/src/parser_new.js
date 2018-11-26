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
 * TODO: document guide lines for using back tracking
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
        },
        classBodyDeclaration: {
          OR: true
        },
        classMemberDeclaration: {
          OR: true
        },
        unannReferenceType: {
          OR: true
        },
        formalParameter: {
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
          // Spec Deviation: "typeVariable" alternative is missing because
          //                 it is included in "classOrInterfaceType"
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
      //      extraction is safe because there are no other references to
      //      "normalClassDeclaration" and "enumDeclaration"
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

    const classBodyTypes = {
      unknown: 0,
      fieldDeclaration: 1,
      methodDeclaration: 2,
      classDeclaration: 3,
      interfaceDeclaration: 4,
      semiColon: 5,
      instanceInitializer: 6,
      staticInitializer: 7,
      constructorDeclaration: 8
    };

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-ClassBodyDeclaration
    $.RULE("classBodyDeclaration", () => {
      const nextRuleType = this.identifyClassBodyDeclarationType();

      $.OR([
        {
          GATE: () =>
            nextRuleType >= classBodyTypes.fieldDeclaration &&
            nextRuleType <= classBodyTypes.semiColon,
          ALT: () => $.SUBRULE($.classMemberDeclaration, nextRuleType)
        },
        // no gate needed for the initializers because these are LL(1) rules.
        { ALT: () => $.SUBRULE($.instanceInitializer) },
        { ALT: () => $.SUBRULE($.staticInitializer) },
        {
          GATE: () => nextRuleType === classBodyTypes.constructorDeclaration,
          ALT: () => $.SUBRULE($.constructorDeclaration)
        }
      ]);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-ClassMemberDeclaration
    $.RULE("classMemberDeclaration", nextRuleType => {
      $.OR([
        {
          GATE: () => nextRuleType === classBodyTypes.fieldDeclaration,
          ALT: () => $.SUBRULE($.fieldDeclaration)
        },
        {
          GATE: () => nextRuleType === classBodyTypes.methodDeclaration,
          ALT: () => $.SUBRULE($.methodDeclaration)
        },
        {
          GATE: () => nextRuleType === classBodyTypes.classDeclaration,
          ALT: () => $.SUBRULE($.classDeclaration)
        },
        {
          GATE: () => nextRuleType === classBodyTypes.interfaceDeclaration,
          ALT: () => $.SUBRULE($.interfaceDeclaration)
        },
        {
          // No GATE is needed as this is LL(1)
          ALT: () => $.CONSUME(t.Semicolon)
        }
      ]);
    });

    // // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-FieldDeclaration
    $.RULE("fieldDeclaration", () => {
      $.MANY(() => {
        $.SUBRULE($.fieldModifier);
      });
      $.SUBRULE($.unannType);
      $.SUBRULE($.variableDeclaratorList);
      $.CONSUME(t.Semicolon);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-FieldModifier
    $.RULE("fieldModifier", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.annotation) },
        { ALT: () => $.CONSUME(t.Public) },
        { ALT: () => $.CONSUME(t.Protected) },
        { ALT: () => $.CONSUME(t.Private) },
        { ALT: () => $.CONSUME(t.Static) },
        { ALT: () => $.CONSUME(t.Final) },
        { ALT: () => $.CONSUME(t.Transient) },
        { ALT: () => $.CONSUME(t.Volatile) }
      ]);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-VariableDeclaratorList
    $.RULE("variableDeclaratorList", () => {
      $.SUBRULE($.variableDeclarator);
      $.MANY(() => {
        $.CONSUME(t.Comma);
        $.SUBRULE2($.variableDeclarator);
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-VariableDeclarator
    $.RULE("variableDeclarator", () => {
      $.SUBRULE($.variableDeclaratorId);
      $.OPTION(() => {
        $.CONSUME(t.Equals);
        $.SUBRULE($.variableInitializer);
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-VariableDeclaratorId
    $.RULE("variableDeclaratorId", () => {
      $.CONSUME($.Identifier);
      $.OPTION(() => {
        $.SUBRULE($.dims);
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-VariableInitializer
    $.RULE("variableInitializer", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.expression) },
        { ALT: () => $.SUBRULE($.arrayInitializer) }
      ]);
    });

    // // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-UnannType
    $.RULE("unannType", () => {
      $.OR([
        // The "unannReferenceType" must appear before the "unannPrimitiveType" type
        // due to common prefix
        { ALT: () => $.SUBRULE($.unannReferenceType) },
        { ALT: () => $.SUBRULE($.unannPrimitiveType) }
      ]);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-UnannPrimitiveType
    $.RULE("unannPrimitiveType", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.numericType) },
        { ALT: () => $.CONSUME(t.Boolean) }
      ]);
    });

    $.RULE("unannReferenceType", () => {
      $.OR([
        // "unannArrayType" must appear before "unannClassOrInterfaceType"
        // due to common prefix.
        {
          GATE: () => $.BACKTRACK($.unannArrayType),
          ALT: () => $.SUBRULE($.unannArrayType)
        },
        { ALT: () => $.SUBRULE($.unannClassOrInterfaceType) }
      ]);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-UnannClassType
    $.RULE("unannClassOrInterfaceType", () => {
      // Spec Deviation: The spec says: "UnannClassType  | UnannInterfaceType" but "UnannInterfaceType"
      //                 is not mentioned in the parser because it is identical to "UnannClassType"
      //                 The distinction is **semantic** not syntactic.
      $.SUBRULE($.unannClassType);
    });

    $.RULE("unannClassType", () => {
      // Spec Deviation: Refactored left recursion and alternation to iterations
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

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-UnannInterfaceType
    $.RULE("unannInterfaceType", () => {
      $.SUBRULE($.unannClassType);
    });

    $.RULE("unannTypeVariable", () => {
      // TODO: Semantic Check: This Identifier cannot be "var"
      // TODO: or define as token type?
      $.CONSUME(t.Identifier);
    });

    $.RULE("unannArrayType", () => {
      // Spec Deviation: The alternative with "unannTypeVariable" is not specified
      //      because it's syntax is included in "unannClassOrInterfaceType"
      $.OR([
        { ALT: () => $.SUBRULE($.unannPrimitiveType) },
        { ALT: () => $.SUBRULE($.unannClassOrInterfaceType) }
      ]);
      $.SUBRULE($.dims);
    });

    // // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-MethodDeclaration
    $.RULE("methodDeclaration", () => {
      $.MANY(() => {
        $.SUBRULE($.methodModifier);
      });
      $.SUBRULE($.methodHeader);
      $.SUBRULE($.methodBody);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-MethodModifier
    $.RULE("methodModifier", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.annotation) },
        { ALT: () => $.CONSUME(t.Public) },
        { ALT: () => $.CONSUME(t.Protected) },
        { ALT: () => $.CONSUME(t.Private) },
        { ALT: () => $.CONSUME(t.Abstract) },
        { ALT: () => $.CONSUME(t.Static) },
        { ALT: () => $.CONSUME(t.Final) },
        { ALT: () => $.CONSUME(t.Synchronized) },
        { ALT: () => $.CONSUME(t.Native) },
        { ALT: () => $.CONSUME(t.Strictfp) }
      ]);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-MethodHeader
    $.RULE("methodHeader", () => {
      $.OPTION(() => {
        $.SUBRULE($.typeParameters);
        $.MANY(() => {
          $.SUBRULE($.annotation);
        });
      });
      $.SUBRULE($.result);
      $.SUBRULE($.methodDeclarator);
      $.OPTION2(() => {
        $.SUBRULE($.throws);
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-Result
    $.RULE("result", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.unannType) },
        { ALT: () => $.CONSUME(t.Void) }
      ]);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-MethodHeader
    $.RULE("methodDeclarator", () => {
      $.CONSUME(t.Identifier);
      $.CONSUME(t.LBrace);
      $.OPTION(() => {
        $.SUBRULE($.receiverParameter);
        $.CONSUME(t.Comma);
      });
      $.OPTION2(() => {
        $.SUBRULE($.formalParameterList);
      });
      $.CONSUME(t.RBrace);
      $.OPTION3(() => {
        $.SUBRULE($.dims);
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-ReceiverParameter
    $.RULE("receiverParameter", () => {
      $.MANY(() => {
        $.SUBRULE($.annotation);
      });
      $.SUBRULE($.unannType);
      $.OPTION(() => {
        $.CONSUME(t.Identifier);
        $.CONSUME(t.Dot);
      });
      $.CONSUME(t.This);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-FormalParameterList
    $.RULE("formalParameterList", () => {
      $.SUBRULE($.formalParameter);
      $.MANY(() => {
        $.CONSUME(t.Comma);
        $.SUBRULE2($.formalParameter);
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-FormalParameter
    $.RULE("formalParameter", () => {
      $.OR([
        // Spec Deviation: extracted to "variableParaRegularParameter"
        {
          GATE: () => $.BACKTRACK($.variableParaRegularParameter),
          ALT: () => $.SUBRULE($.variableParaRegularParameter)
        },
        { ALT: () => $.SUBRULE($.variableArityParameter) }
      ]);
    });

    // Spec Deviation: extracted from "formalParameter"
    $.RULE("variableParaRegularParameter", () => {
      $.MANY(() => {
        $.SUBRULE($.variableModifier);
      });
      $.SUBRULE($.unannType);
      $.SUBRULE($.variableDeclaratorId);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-VariableArityParameter
    $.RULE("variableArityParameter", () => {
      $.MANY(() => {
        $.SUBRULE($.variableModifier);
      });
      $.SUBRULE($.unannType);
      $.MANY2(() => {
        $.SUBRULE($.annotation);
      });
      $.CONSUME(t.DotDotDot);
      $.CONSUME(t.Identifier);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-VariableModifier
    $.RULE("variableModifier", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.annotation) },
        { ALT: () => $.CONSUME(t.Final) }
      ]);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-Throws
    $.RULE("throws", () => {
      $.CONSUME(t.Throws);
      $.SUBRULE($.exceptionTypeList);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-ExceptionTypeList
    $.RULE("exceptionTypeList", () => {
      $.SUBRULE($.exceptionType);
      $.MANY(() => {
        $.CONSUME(t.Comma);
        $.SUBRULE2($.exceptionType);
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-ExceptionType
    $.RULE("exceptionType", () => {
      // Spec Deviation: "typeVariable" alternative is missing because
      //                 it is contained in classType.
      $.SUBRULE($.classType);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-MethodBody
    $.RULE("methodBody", () => {
      // Spec Deviation: "typeVariable" alternative is missing because
      //                 it is contained in classType.
      $.SUBRULE($.block);
      $.CONSUME(t.Semicolon);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-InstanceInitializer
    $.RULE("instanceInitializer", () => {
      $.SUBRULE($.block);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-StaticInitializer
    $.RULE("staticInitializer", () => {
      $.CONSUME(t.Static);
      $.SUBRULE($.block);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-ConstructorDeclaration
    $.RULE("constructorDeclaration", () => {
      $.MANY(() => {
        $.SUBRULE($.constructorModifier);
      });
      $.SUBRULE($.constructorDeclarator);
      $.OPTION(() => {
        $.SUBRULE($.throws);
      });
      $.SUBRULE($.constructorBody);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-ConstructorModifier
    $.RULE("constructorModifier", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.annotation) },
        { ALT: () => $.CONSUME(t.Public) },
        { ALT: () => $.CONSUME(t.Protected) },
        { ALT: () => $.CONSUME(t.Private) }
      ]);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-ConstructorDeclarator
    $.RULE("constructorDeclarator", () => {
      $.OPTION(() => {
        $.SUBRULE($.typeParameters);
      });
      $.SUBRULE($.simpleTypeName);
      $.CONSUME(t.LBrace);
      $.OPTION2(() => {
        $.SUBRULE($.receiverParameter);
        $.CONSUME(t.Comma);
      });
      $.OPTION3(() => {
        $.SUBRULE($.formalParameterList);
      });
      $.CONSUME(t.RBrace);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-SimpleTypeName
    $.RULE("simpleTypeName", () => {
      // TODO: implement: Identifier but not var
      $.CONSUME(t.Identifier);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-ConstructorBody
    $.RULE("constructorBody", () => {
      $.CONSUME(t.LCurly);
      $.OPTION(() => {
        $.SUBRULE($.explicitConstructorInvocation);
      });
      $.OPTION2(() => {
        $.SUBRULE($.blockStatements);
      });
      $.CONSUME(t.RCurly);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-ExplicitConstructorInvocation
    $.RULE("explicitConstructorInvocation", () => {
      let noPrefix = false;
      $.OR([
        {
          GATE: () => $.isExpressionName(),
          ALT: () => {
            $.SUBRULE($.expressionName);
            $.CONSUME(t.Dot);
          }
        },
        {
          ALT: () => {
            $.SUBRULE($.primary);
            $.CONSUME2(t.Dot);
          }
        },
        // empty alt
        { ALT: () => (noPrefix = true) }
      ]);

      $.OPTION(() => {
        $.SUBRULE($.typeArguments);
      });

      $.OR2([
        {
          GATE: () => noPrefix,
          ALT: () => $.CONSUME(t.This)
        },
        { ALT: () => $.CONSUME(t.Super) }
      ]);

      $.CONSUME(t.LBrace);
      $.OPTION2(() => {
        $.SUBRULE($.argumentList);
      });
      $.CONSUME(t.RBrace);
      $.CONSUME(t.Semicolon);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-EnumDeclaration
    $.RULE("enumDeclaration", () => {
      $.MANY(() => {
        $.SUBRULE($.classModifier);
      });
      $.CONSUME(t.Enum);
      $.SUBRULE($.typeIdentifier);
      $.OPTION(() => {
        $.SUBRULE($.superinterfaces);
      });
      $.SUBRULE($.enumBody);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-EnumBody
    $.RULE("enumBody", () => {
      $.CONSUME(t.LCurly);
      $.OPTION(() => {
        $.SUBRULE($.enumConstantList);
      });
      $.OPTION2(() => {
        $.CONSUME(t.Comma);
      });
      $.OPTION3(() => {
        $.SUBRULE($.enumBodyDeclarations);
      });
      $.CONSUME(t.RCurly);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-EnumConstantList
    $.RULE("enumConstantList", () => {
      $.SUBRULE($.enumConstant);
      $.MANY(() => {
        $.CONSUME(t.Comma);
        $.SUBRULE2($.enumConstant);
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-EnumConstant
    $.RULE("enumConstant", () => {
      $.MANY(() => {
        $.SUBRULE($.enumConstantModifier);
      });
      $.CONSUME(t.Identifier);
      $.CONSUME(t.LBrace);
      $.OPTION(() => {
        $.SUBRULE($.argumentList);
      });
      $.CONSUME(t.RBrace);
      $.OPTION2(() => {
        $.SUBRULE($.classBody);
      });
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-EnumConstantModifier
    $.RULE("enumConstantModifier", () => {
      $.SUBRULE($.annotation);
    });

    // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-EnumBodyDeclarations
    $.RULE("enumBodyDeclarations", () => {
      $.CONSUME(t.Semicolon);
      $.MANY(() => {
        $.SUBRULE($.classBodyDeclaration);
      });
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
    // Productions from §10 (Arrays)
    // ---------------------
    $.RULE("arrayInitializer", () => {
      $.CONSUME(t.LCurly);
      // TODO: TBD
    });

    // ---------------------
    // Productions from §14 (Blocks and Statements)
    // ---------------------
    $.RULE("block", () => {
      $.CONSUME(t.LCurly);
      // TODO: TBD
    });

    $.RULE("blockStatements", () => {
      $.CONSUME(t.Var);
      // TODO: TBD
    });

    // ---------------------
    // Productions from §15 (Expressions)
    // ---------------------
    $.RULE("expression", () => {
      $.CONSUME(t.CharLiteral);
      // TODO: TBD
    });

    $.RULE("primary", () => {
      $.CONSUME(t.This);
      // TODO: TBD
    });

    $.RULE("argumentList", () => {
      $.SUBRULE($.expression);
      // TODO: TBD
    });

    // ---------------------
    // Backtracking lookahead logic
    // ---------------------

    $.RULE("isExpressionName", () => {
      this.isBackTrackingStack.push(1);
      const orgState = this.saveRecogState();
      try {
        $.SUBRULE($.expressionName);
        const nextTokenType = this.LA(1).tokenType;
        const nextNextTokenType = this.LA(2).tokenType;
        return (
          nextTokenType === t.Dot &&
          (nextNextTokenType === t.Less || nextNextTokenType === t.Super)
        );
      } catch (e) {
        return false;
      } finally {
        this.reloadRecogState(orgState);
        this.isBackTrackingStack.pop();
      }
    });

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

    $.RULE("identifyClassBodyDeclarationType", () => {
      this.isBackTrackingStack.push(1);
      const orgState = this.saveRecogState();
      try {
        let nextTokenType = this.LA(1).tokenType;
        let nextNextTokenType = this.LA(2).tokenType;

        switch (nextTokenType) {
          case t.Semicolon:
            return classBodyTypes.semiColon;
          case t.LCurly:
            return classBodyTypes.instanceInitializer;
          case t.Static:
            switch (nextNextTokenType) {
              case t.LCurly:
                return classBodyTypes.staticInitializer;
            }
        }

        // We have to look beyond the modifiers to distinguish between the declaration types.
        $.MANY(() => {
          // This alternation includes all possible modifiers for all types of "ClassBodyDeclaration"
          // Certain combinations are syntactically invalid, this is **not** checked here,
          // Invalid combinations will cause a descriptive parsing error message to be
          // Created inside the relevant parsing rules **after** this lookahead
          // analysis.
          $.OR([
            { ALT: () => $.SUBRULE($.annotation) },
            { ALT: () => $.CONSUME(t.Public) },
            { ALT: () => $.CONSUME(t.Protected) },
            { ALT: () => $.CONSUME(t.Private) },
            { ALT: () => $.CONSUME(t.Abstract) },
            { ALT: () => $.CONSUME(t.Static) },
            { ALT: () => $.CONSUME(t.Final) },
            { ALT: () => $.CONSUME(t.Transient) },
            { ALT: () => $.CONSUME(t.Volatile) },
            { ALT: () => $.CONSUME(t.Synchronized) },
            { ALT: () => $.CONSUME(t.Native) },
            { ALT: () => $.CONSUME(t.Strictfp) }
          ]);
        });

        nextTokenType = this.LA(1).tokenType;
        nextNextTokenType = this.LA(2).tokenType;
        if (nextTokenType === t.Identifier && nextNextTokenType === t.LBrace) {
          return classBodyTypes.constructorDeclaration;
        }

        if (nextTokenType === t.Class || nextTokenType === t.Enum) {
          return classBodyTypes.classDeclaration;
        }

        if (nextTokenType === t.Interface || nextTokenType === t.At) {
          return classBodyTypes.interfaceDeclaration;
        }

        if (nextTokenType === t.Void) {
          // method with result type "void"
          return classBodyTypes.methodDeclaration;
        }

        // Type Arguments common prefix
        if (nextTokenType === t.Less) {
          this.SUBRULE($.typeParameters);
          const nextTokenType = this.LA(1).tokenType;
          const nextNextTokenType = this.LA(2).tokenType;
          // "<T> foo(" -> constructor
          if (
            nextTokenType === t.Identifier &&
            nextNextTokenType === t.LBrace
          ) {
            return classBodyTypes.constructorDeclaration;
          }
          // typeParameters can only appear in method or constructor
          // declarations, so if it is not a constructor it must be a method
          return classBodyTypes.methodDeclaration;
        }

        // Only field or method declarations may be valid at this point.
        // All other alternatives should have been attempted.
        // **both** start with "unannType"
        this.SUBRULE($.unannType);

        nextTokenType = this.LA(1).tokenType;
        nextNextTokenType = this.LA(2).tokenType;
        // "foo(..." --> look like method start
        if (nextTokenType === t.Identifier && nextNextTokenType === t.LBrace) {
          return classBodyTypes.methodDeclaration;
        }

        // a valid field
        if (nextTokenType === t.Identifier) {
          return classBodyTypes.fieldDeclaration;
        }

        return classBodyTypes.unknown;
      } catch (e) {
        // TODO: add info from the original error
        throw Error("Cannot Identify the type of a <classBodyDeclaration>");
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
