export function defineRules($, t) {
  // https://docs.oracle.com/javase/specs/jls/se22/html/jls-3.html#jls-Literal
  $.RULE("literal", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.integerLiteral) },
      { ALT: () => $.SUBRULE($.floatingPointLiteral) },
      { ALT: () => $.SUBRULE($.booleanLiteral) },
      { ALT: () => $.CONSUME(t.CharLiteral) },
      { ALT: () => $.CONSUME(t.TextBlock) },
      { ALT: () => $.CONSUME(t.StringLiteral) },
      { ALT: () => $.CONSUME(t.Null) }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se22/html/jls-3.html#jls-IntegerLiteral
  $.RULE("integerLiteral", () => {
    $.OR([
      { ALT: () => $.CONSUME(t.DecimalLiteral) },
      { ALT: () => $.CONSUME(t.HexLiteral) },
      { ALT: () => $.CONSUME(t.OctalLiteral) },
      { ALT: () => $.CONSUME(t.BinaryLiteral) }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se22/html/jls-3.html#jls-FloatingPointLiteral
  $.RULE("floatingPointLiteral", () => {
    $.OR([
      { ALT: () => $.CONSUME(t.FloatLiteral) },
      { ALT: () => $.CONSUME(t.HexFloatLiteral) }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se22/html/jls-3.html#jls-BooleanLiteral
  $.RULE("booleanLiteral", () => {
    $.OR([{ ALT: () => $.CONSUME(t.True) }, { ALT: () => $.CONSUME(t.False) }]);
  });

  // https://docs.oracle.com/javase/specs/jls/se22/html/jls-3.html#jls-3.12
  $.RULE("shiftOperator", () => {
    $.OR([
      {
        GATE: () => $.LA(1).startOffset + 1 === $.LA(2).startOffset,
        ALT: () => {
          $.CONSUME(t.Less);
          $.CONSUME2(t.Less);
        }
      },
      {
        GATE: () => $.LA(1).startOffset + 1 === $.LA(2).startOffset,
        ALT: () => {
          $.CONSUME(t.Greater);
          $.CONSUME2(t.Greater);
          $.OPTION({
            GATE: () => $.LA(0).startOffset + 1 === $.LA(1).startOffset,
            DEF: () => $.CONSUME3(t.Greater)
          });
        }
      }
    ]);
  });
}
