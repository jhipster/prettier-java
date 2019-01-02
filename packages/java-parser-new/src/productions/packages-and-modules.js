"use strict";
const { isRecognitionException } = require("chevrotain");

function defineRules($, t) {
  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-7.html#CompilationUnit
  $.RULE("compilationUnit", () => {
    // custom optimized backtracking lookahead logic
    const isModule = $.BACKTRACK_LOOKAHEAD($.isModuleCompilationUnit);
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

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-7.html#jls-ModularCompilationUnit
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
    $.CONSUME2(t.Semicolon);
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
    const isClassDeclaration = this.BACKTRACK_LOOKAHEAD($.isClassDeclaration);
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

  $.RULE("isModuleCompilationUnit", () => {
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
  });
}

module.exports = {
  defineRules
};
