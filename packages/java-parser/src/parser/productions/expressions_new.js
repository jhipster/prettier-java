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

  $.RULE("expression", () => {});

  $.RULE("primary", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.superPrimaryPrefix) },
      { ALT: () => $.SUBRULE($.literal) },
      { ALT: () => $.SUBRULE($.voidClassLiteralPrefix) },
      { ALT: () => $.SUBRULE($.primitivePrimaryPrefix) },
      { ALT: () => $.CONSUME($.This) },
      { ALT: () => $.SUBRULE($.fqnOrRefTypePrefix) }
      // TODO: "new" expression
    ]);

    $.MANY(() => {
      $.SUBRULE($.primarySuffix);
    });
  });

  $.RULE("superPrimaryPrefix", () => {
    $.CONSUME(t.Super);

    $.OR([
      { ALT: () => $.SUBRULE($.fieldAccessSuffix) },
      { ALT: () => $.SUBRULE($.methodInvocationSuffix) },
      { ALT: () => $.SUBRULE($.methodReferenceSuffix) }
    ]);
  });

  $.RULE("voidClassLiteralPrefix", () => {
    $.CONSUME(t.Void);
    $.SUBRULE($.classLiteralSuffix);
  });

  $.RULE("primitivePrimaryPrefix", () => {
    let hasAnnotation = false;
    let hasDims = false;

    $.OR([
      { ALT: () => $.SUBRULE($.numericType) },
      { ALT: () => $.CONSUME(t.Boolean) }
    ]);

    // TODO: use "dims" production and reflect on the CST it creates?
    $.MANY(() => {
      $.MANY2(() => {
        $.SUBRULE($.annotation);
        hasAnnotation = true;
      });
      // The "[][][]...." is already included in "classLiteralSuffix"
      // But because it is optional we can process it here as well safely.
      $.CONSUME(t.LSquare);
      $.CONSUME(t.RSquare);
      hasDims = true;
    });

    $.OR([
      {
        GATE: () => hasDims === true,
        ALT: () => $.SUBRULE($.primitiveMethodReferenceSuffix)
      },
      {
        GATE: () => hasAnnotation === false,
        ALT: () => $.SUBRULE($.classLiteralSuffix)
      }
    ]);
  });

  $.RULE("fqnOrRefTypePrefix", () => {
    // The primitive types prefix is handled separately
    // So we only care about classType or arrayType here
    $.SUBRULE($.classType);

    $.OPTION(() => {
      // Now it is an array Type
      $.SUBRULE($.dims);
    });

    // FQN suffix
    // {[ ]} . class - V
    // .this - V
    // . UnqualifiedClassInstanceCreationExpression
    // [ Expression ]
    // ( [ArgumentList] )
    // . [TypeArguments] Identifier ( [ArgumentList] )
    // . super . Identifier
    // . super . [TypeArguments] Identifier ( [ArgumentList] )
    // . super :: [TypeArguments] Identifier
    // :: [TypeArguments] new

    // arrayType suffix
    // :: new
    $.OR([
      { ALT: () => $.SUBRULE($.classLiteralSuffix) },
      { ALT: () => $.SUBRULE($.thisSuffix) },
      { ALT: () => $.SUBRULE($.superSuffix) },
      { ALT: () => $.SUBRULE($.arrayAccessSuffix) },
      { ALT: () => $.SUBRULE($.methodReferenceSuffix) },
      { ALT: () => $.SUBRULE($.arrayTypeReferenceSuffix) }
    ]);
  });

  $.RULE("classLiteralSuffix", () => {
    $.MANY(() => {
      $.CONSUME(t.LSquare);
      $.CONSUME(t.RSquare);
    });
    $.CONSUME(t.Dot);
    $.CONSUME(t.Class);
  });

  $.RULE("thisSuffix", () => {
    $.CONSUME(t.Dot);
    $.CONSUME(t.This);
  });

  $.RULE("superSuffix", () => {
    $.CONSUME(t.Dot);
    $.CONSUME(t.Super);

    $.OR([
      { ALT: () => $.SUBRULE($.fieldAccessSuffix) },
      { ALT: () => $.SUBRULE($.MethodInvocationSuffix) },
      { ALT: () => $.SUBRULE($.methodReferenceSuffix) }
    ]);
  });

  $.RULE("primarySuffix", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.classInstanceCreationExpressionSuffix) },
      // TODO: This cannot follow an arrayCreationExpression (do we care?)
      { ALT: () => $.SUBRULE($.fieldAccessSuffix) },
      { ALT: () => $.SUBRULE($.arrayAccessSuffix) },
      { ALT: () => $.SUBRULE($.methodInvocationSuffix) },
      { ALT: () => $.SUBRULE($.methodReferenceSuffix) }
    ]);
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

  $.RULE("fieldAccessSuffix", () => {
    $.CONSUME(t.Dot);
    $.CONSUME(t.Identifier);
  });

  $.RULE("arrayAccessSuffix", () => {
    $.CONSUME(t.LSquare);
    $.SUBRULE($.expression);
    $.CONSUME(t.RSquare);
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

  // TODO: evaluate combining the method references productions
  //       by using a parameterized rule and gates.
  $.RULE("primitiveMethodReferenceSuffix", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.methodReferenceSuffix) },
      { ALT: () => $.SUBRULE($.arrayTypeReferenceSuffix) }
    ]);
  });

  $.RULE("methodReferenceSuffix", () => {
    $.CONSUME(t.ColonColon);
    $.OPTION(() => {
      $.SUBRULE($.typeArguments);
    });
    $.CONSUME(t.Identifier);
  });

  $.RULE("arrayTypeReferenceSuffix", () => {
    $.CONSUME(t.ColonColon);
    $.CONSUME(t.New);
  });
}

module.exports = {
  defineRules
};
