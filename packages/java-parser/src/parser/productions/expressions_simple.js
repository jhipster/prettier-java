"use strict";
function defineRules($, t) {
  $.RULE("expression", () => {
    $.SUBRULE($.primary);
  });

  $.RULE("primary", () => {
    $.SUBRULE($.primaryPrefix);
    $.MANY(() => {
      $.SUBRULE($.primarySuffix);
    });
  });

  // PREFIX:
  // literal
  // this
  // void
  // numericType
  // boolean
  // fqn (that includes ".super")
  //   - also referenceType
  // ( Expression )
  // UnqualifiedClassInstanceCreationExpression | ArrayCreationExpression ("new" Expression)
  $.RULE("primaryPrefix", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.literal) },
      { ALT: () => $.CONSUME(t.This) },
      { ALT: () => $.CONSUME(t.Void) },
      { ALT: () => $.SUBRULE($.numericType) },
      { ALT: () => $.CONSUME(t.boolean) },
      { ALT: () => $.SUBRULE($.fqnOrRefType) },
      { ALT: () => $.SUBRULE($.parenthesisExpression) },
      { ALT: () => $.SUBRULE($.newExpression) }
    ]);
  });

  // SUFFIX:
  // . this
  // . UnqualifiedClassInstanceCreationExpression
  // {[]}. class
  // . Identifier
  // [ Expression ]
  // . [TypeArguments] Identifier ( [ArgumentList] )
  // :: [TypeArguments] Identifier
  // :: [TypeArguments] new
  $.RULE("primarySuffix", () => {
    $.OR([
      {
        ALT: () => {
          $.CONSUME(t.Dot);
          $.OR2([
            { ALT: () => $.CONSUME(t.This) },
            {
              ALT: () => $.SUBRULE($.unqualifiedClassInstanceCreationExpression)
            },
            { ALT: () => $.CONSUME(t.Identifier) },
            { ALT: () => $.SUBRULE($.methodInvocationSuffix) }
          ]);
        }
      },
      { ALT: () => $.SUBRULE($.classLiteralSuffix) },
      { ALT: () => $.SUBRULE($.arrayAccessSuffix) },
      { ALT: () => $.SUBRULE($.methodReferenceSuffix) }
    ]);
  });
}

module.exports = {
  defineRules
};
