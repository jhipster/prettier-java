"use strict";
function defineRules($, t) {
  // TODO: reference existing Java Parsers (statementExpression)
  /*
  productions referenced from outside:
    - primary
    - ClassInstanceCreationExpression
    - MethodInvocation
    - ArgumentList
    - conditionalExpression
    - constantExpression
      // TODO: after refactor this may be described as primary with specific suffix.
    - fieldAccess
    - assignment
    - [pre|post] [increase|decrease] Expression
  */

  $.RULE("expression", () => {
    // $.CONSUME(t.Identifier);
    // $.MANY(() => {
    //   $.CONSUME(t.Dot);
    //   $.CONSUME2(t.Identifier);
    // });
  });

  // TODO: maybe refactor to LL(1)
  // What is the advantage of backtracking if we are already deviating greatly from the
  // Spec?
  $.RULE("primary", () => {
    $.OR([
      { ALT: () => $.CONSUME(t.Super) },
      // TODO: maybe this should be a more general type and include the primitive types?
      { ALT: () => $.SUBRULE($.ambiguousNameOrReferenceType) },
      { ALT: () => $.SUBRULE($.literal) },
      // TODO: class literal shares common "primitives suffix" with methodRef (referenceType)
      { ALT: () => $.SUBRULE($.classLiteralPrefix) },
      { ALT: () => $.CONSUME(t.This) },
      // "postFixExpression" may also start with parenthesis.
      // Perhaps optimized backtracking would be needed to distinguish in ""postFixExpression"
      { ALT: () => $.SUBRULE($.parenthesisExpression) },
      // TODO: rename to ---PREFIX?
      { ALT: () => $.SUBRULE($.unqualifiedClassInstanceCreationExpression) },
      { ALT: () => $.SUBRULE($.arrayCreationExpression) }
    ]);

    $.OPTION(() => {
      $.SUBRULE($.superFieldAccess);
    });

    $.MANY(() => {
      $.SUBRULE($.primaryNoNewArraySuffix);
    });
  });

  $.RULE("primaryNoNewArraySuffix", () => {
    $.CONSUME(t.Dot);
    $.CONSUME(t.Super);
  });

  $.RULE("primaryNoNewArraySuffix", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.fieldAccessSuffix) },
      { ALT: () => $.SUBRULE($.arrayAccessSuffix) },
      { ALT: () => $.SUBRULE($.classInstanceCreationExpressionSuffix) },
      { ALT: () => $.SUBRULE($.classLiteralSuffix) },
      { ALT: () => $.SUBRULE($.methodInvocationSuffix) },
      { ALT: () => $.SUBRULE($.methodReferenceSuffix) }
    ]);
  });

  $.RULE("ambiguousNameOrReferenceType", () => {
    // a Reference Type is a superGrammar of a FQN (ambiguousName)
    // TODO: the above statement may not be true if we consider TypeIdentifier vs Identifier.
    // TODO: "referenceType" uses backtracking which we would rather avoid in a hotspot
    //       such as the "primary" production.
    //       evaluate optimizing the "referenceType rule."
    $.SUBRULE($.referenceType);
  });

  /**
   * Like https://docs.oracle.com/javase/specs/jls/se11/html/jls-15.html#jls-ClassLiteral
   * But without "TypeName {[ ]} . class" as that alternative would be parsed
   * using the "ClassLiteralSuffix"
   */
  $.RULE("ClassLiteralPrefix", () => {
    $.OR([
      {
        ALT: () => {
          $.OR2([
            { ALT: () => $.SUBRULE($.numericType) },
            { ALT: () => $.CONSUME(t.Boolean) }
          ]);
          $.MANY(() => {
            $.CONSUME(t.LSquare);
            $.CONSUME(t.RSquare);
          });
          $.CONSUME(t.Dot);
          $.CONSUME(t.Class);
        }
      },
      {
        ALT: () => {
          $.CONSUME(t.Void);
          $.CONSUME(t.Dot);
          $.CONSUME(t.Class);
        }
      }
    ]);
  });

  $.RULE("fieldAccessSuffix", () => {
    $.CONSUME(t.Dot);
    $.CONSUME(t.Identifier);
  });

  $.RULE("methodInvocationSuffix", () => {
    $.CONSUME(t.Dot);
    $.OPTION(() => {
      $.SUBRULE($.typeArguments);
    });
    $.CONSUME(t.Identifier);
    $.CONSUME(t.LBrace);
    $.OPTION2(() => {
      $.SUBRULE($.argumentList);
    });
    $.CONSUME(t.RBrace);
  });

  $.RULE("methodReferenceSuffix", () => {
    $.CONSUME(t.ColonColon);
    $.OPTION(() => {
      $.SUBRULE($.typeArguments);
    });

    $.OR([
      { ALT: () => $.CONSUME(t.Identifier) },
      // TODO: a constructor method reference ("new") can only be used
      //   in specific contexts, but perhaps this verification is best left
      //   for a semantic analysis phase
      { ALT: () => $.CONSUME(t.New) }
    ]);
  });

  $.RULE("argumentList", () => {
    $.SUBRULE($.expression);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.SUBRULE($.expression);
    });
  });

  $.RULE("classLiteralSuffix", () => {
    $.MANY(() => {
      $.CONSUME(t.LSquare);
      $.CONSUME(t.RSquare);
    });
    $.CONSUME(t.Dot);
    $.CONSUME(t.Class);
  });

  $.RULE("arrayAccessSuffix", () => {
    $.CONSUME(t.LSquare);
    $.SUBRULE($.expression);
    $.CONSUME(t.RSquare);
  });

  $.RULE("classInstanceCreationExpressionSuffix", () => {
    $.CONSUME(t.Dot);
    $.SUBRULE($.unqualifiedClassInstanceCreationExpression);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-15.html#jls-UnqualifiedClassInstanceCreationExpression
  $.RULE("unqualifiedClassInstanceCreationExpression", () => {
    $.CONSUME(t.New);
    $.OPTION(() => {
      $.SUBRULE($.typeArguments);
    });
    $.SUBRULE($.classOrInterfaceTypeToInstantiate);
    $.CONSUME(t.LBrace);
    $.OPTION2(() => {
      $.SUBRULE($.argumentList);
    });
    $.CONSUME(t.RBrace);
    $.OPTION3(() => {
      $.SUBRULE($.classBody);
    });
  });

  $.RULE("classOrInterfaceTypeToInstantiate", () => {
    $.MANY(() => {
      $.SUBRULE($.annotation);
    });
    $.CONSUME(t.Identifier);
    $.MANY2(() => {
      $.CONSUME(t.Dot);
      $.MANY3(() => {
        $.SUBRULE2($.annotation);
        $.CONSUME2(t.Identifier);
      });
    });
    $.SUBRULE($.typeArgumentsOrDiamond);
  });

  $.RULE("primaryNoNewArraySuffix", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.typeArguments) },
      {
        ALT: () => {
          $.CONSUME2(t.Less);
          $.CONSUME2(t.Greater);
        }
      }
    ]);
  });

  // Spec Deviation: extracted from "primaryNoNewArray"
  $.RULE("parenthesisExpression", () => {
    $.CONSUME(t.LBrace);
    $.SUBRULE($.expression);
    $.CONSUME(t.RBrace);
  });
}

module.exports = {
  defineRules
};
