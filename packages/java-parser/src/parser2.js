"use strict";
const { Parser } = require("chevrotain");
const { allTokens, tokens: t } = require("./tokens");

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
    super(allTokens);

    const $ = this;

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
        $.SUBRULE($.ModuleDirective);
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
    $.RULE("classDeclaration", () => {
      // TODO: TBD
      $.CONSUME(t.Class);
    });

    // ---------------------
    // Productions from §9 (Interfaces)
    // ---------------------
    $.RULE("interfaceDeclaration", () => {
      // TODO: TBD
      $.CONSUME(t.Interface);
    });

    this.performSelfAnalysis();
  }
}

module.exports = JavaParser;
