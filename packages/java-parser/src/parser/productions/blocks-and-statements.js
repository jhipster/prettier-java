"use strict";

// Spec Deviation: The "*NoShortIf" variations were removed as the ambiguity of
//                 the dangling else is resolved by attaching an "else" block
//                 to the nearest "if"
function defineRules($, t) {
  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-Block
  $.RULE("block", () => {
    $.CONSUME(t.LCurly);
    $.SUBRULE($.blockStatements);
    $.CONSUME(t.RCurly);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-BlockStatements
  $.RULE("blockStatements", () => {
    $.SUBRULE($.blockStatement);
    $.MANY(() => {
      $.SUBRULE2($.blockStatement);
    });
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-BlockStatement
  $.RULE("blockStatement", () => {
    $.OR([
      {
        // A variable declaration is normally short, so we uss regular
        // **non optimized** backtracking for simplicity.
        GATE: () => $.BACKTRACK($.localVariableDeclarationStatement),
        ALT: () => $.SUBRULE($.localVariableDeclarationStatement)
      },
      {
        ALT: () => $.SUBRULE($.classDeclaration)
      },
      { ALT: () => $.SUBRULE($.statement) }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-LocalVariableDeclaration
  $.RULE("localVariableDeclarationStatement", () => {
    $.SUBRULE($.localVariableDeclaration);
    $.CONSUME(t.Semicolon);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-LocalVariableDeclaration
  $.RULE("localVariableDeclarationStatement", () => {
    $.MANY(() => {
      $.SUBRULE($.variableModifier);
    });
    $.SUBRULE($.localVariableType);
    $.SUBRULE($.variableDeclaratorList);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-LocalVariableType
  $.RULE("localVariableType", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.unannType) },
      { ALT: () => $.CONSUME(t.Var) }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-Statement
  $.RULE("statement", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.statementWithoutTrailingSubstatement) },
      { ALT: () => $.SUBRULE($.labeledStatement) },
      // Spec deviation: combined "IfThenStatement" and "IfThenElseStatement"
      { ALT: () => $.SUBRULE($.ifStatement) },
      { ALT: () => $.SUBRULE($.whileStatement) },
      { ALT: () => $.SUBRULE($.forStatement) }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-StatementWithoutTrailingSubstatement
  $.RULE("statementWithoutTrailingSubstatement", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.block) },
      { ALT: () => $.SUBRULE($.emptyStatement) },
      { ALT: () => $.SUBRULE($.expressionStatement) },
      { ALT: () => $.SUBRULE($.assertStatement) },
      { ALT: () => $.SUBRULE($.switchStatement) },
      { ALT: () => $.SUBRULE($.doStatement) },
      { ALT: () => $.SUBRULE($.breakStatement) },
      { ALT: () => $.SUBRULE($.continueStatement) },
      { ALT: () => $.SUBRULE($.returnStatement) },
      { ALT: () => $.SUBRULE($.synchronizedStatement) },
      { ALT: () => $.SUBRULE($.throwStatement) },
      { ALT: () => $.SUBRULE($.tryStatement) }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-EmptyStatement
  $.RULE("localVariableDeclarationStatement", () => {
    $.CONSUME(t.Semicolon);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-LabeledStatement
  $.RULE("labeledStatement", () => {
    $.CONSUME(t.Identifier);
    $.CONSUME(t.Colon);
    $.SUBRULE($.statement);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-ExpressionStatement
  $.RULE("expressionStatement", () => {
    $.SUBRULE($.statementExpression);
    $.CONSUME(t.Semicolon);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-StatementExpression
  $.RULE("statementExpression", () => {
    // TODO: implement after the expressions have been implemented
  });

  // Spec deviation: combined "IfThenStatement" and "IfThenElseStatement"
  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-IfThenStatement
  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-IfThenElseStatement
  $.RULE("ifStatement", () => {
    $.CONSUME(t.If);
    $.CONSUME(t.LBrace);
    $.SUBRULE($.expression);
    $.CONSUME(t.RBrace);
    $.SUBRULE($.Statement);
    $.OPTION(() => {
      $.CONSUME(t.Else);
      $.SUBRULE2($.Statement);
    });
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-AssertStatement
  $.RULE("assertStatement", () => {
    $.CONSUME(t.Assert);
    $.SUBRULE($.expression);
    $.OPTION(() => {
      $.CONSUME(t.Colon);
      $.SUBRULE2($.expression);
    });
    $.CONSUME(t.Comma);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-SwitchStatement
  $.RULE("switchStatement", () => {
    $.CONSUME(t.Switch);
    $.CONSUME(t.LBrace);
    $.SUBRULE($.expression);
    $.CONSUME(t.RBrace);
    $.SUBRULE($.switchBlock);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-SwitchBlock
  $.RULE("switchBlock", () => {
    $.CONSUME(t.LCurly);
    $.MANY(() => {
      // Spec Deviation: refactored "switchBlock" for easy post-processing
      //                 each case and block together in the same rule.
      $.SUBRULE($.switchCase);
    });
    $.CONSUME(t.RCurly);
  });

  $.RULE("switchBlock", () => {
    $.SUBRULE($.switchLabel);
    $.OPTION(() => {
      $.SUBRULE($.blockStatements);
    });
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-SwitchLabel
  $.RULE("switchLabel", () => {
    $.OR([
      {
        ALT: () => {
          $.CONSUME(t.Case);
          $.SUBRULE($.constantExpression);
          $.CONSUME(t.Colon);
        }
      },
      {
        ALT: () => {
          $.CONSUME2(t.Case);
          $.SUBRULE($.enumConstantName);
          $.CONSUME2(t.Colon);
        }
      },
      {
        ALT: () => {
          $.CONSUME(t.Default);
          $.CONSUME3(t.Colon);
        }
      }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-EnumConstantName
  $.RULE("enumConstantName", () => {
    $.CONSUME(t.Identifier);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-WhileStatement
  $.RULE("whileStatement", () => {
    $.CONSUME(t.While);
    $.CONSUME(t.LBrace);
    $.SUBRULE($.expression);
    $.CONSUME(t.RBrace);
    $.SUBRULE($.statement);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-DoStatement
  $.RULE("doStatement", () => {
    $.CONSUME(t.Do);
    $.SUBRULE($.statement);
    $.CONSUME(t.While);
    $.CONSUME(t.LBrace);
    $.SUBRULE($.expression);
    $.CONSUME(t.RBrace);
    $.CONSUME(t.Semicolon);
  });
  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-ForStatement
  $.RULE("forStatement", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.basicForStatement) },
      { ALT: () => $.SUBRULE($.enhancedForStatement) }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-BasicForStatement
  $.RULE("basicForStatement", () => {
    $.CONSUME(t.For);
    $.CONSUME(t.LBrace);
    $.OPTION(() => {
      $.SUBRULE($.forInit);
    });
    $.CONSUME(t.Semicolon);
    $.OPTION2(() => {
      $.SUBRULE($.expression);
    });
    $.CONSUME2(t.Semicolon);
    $.OPTION3(() => {
      $.SUBRULE($.forUpdate);
    });
    $.CONSUME(t.RBrace);
    $.SUBRULE($.statement);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-ForInit
  $.RULE("forInit", () => {
    // TODO: this may need backtracking
    $.OR([
      { ALT: () => $.SUBRULE($.statementExpressionList) },
      { ALT: () => $.SUBRULE($.localVariableDeclaration) }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-ForUpdate
  $.RULE("forUpdate", () => {
    $.SUBRULE($.statementExpressionList);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-StatementExpressionList
  $.RULE("statementExpressionList", () => {
    $.SUBRULE($.statementExpression);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.SUBRULE2($.statementExpression);
    });
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-EnhancedForStatement
  $.RULE("basicForStatement", () => {
    $.CONSUME(t.For);
    $.CONSUME(t.LBrace);
    $.MANY(() => {
      $.SUBRULE($.variableModifier);
    });
    $.SUBRULE($.localVariableType);
    $.SUBRULE($.variableDeclaratorId);
    $.CONSUME(t.Colon);
    $.SUBRULE($.expression);
    $.CONSUME(t.RBrace);
    $.SUBRULE($.statement);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-BreakStatement
  $.RULE("breakStatement", () => {
    $.CONSUME(t.Break);
    $.OPTION(() => {
      $.CONSUME(t.Identifier);
    });
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-14.html#jls-ContinueStatement
  $.RULE("continueStatement", () => {
    $.CONSUME(t.Continue);
    $.OPTION(() => {
      $.CONSUME(t.Identifier);
    });
  });
}

module.exports = {
  defineRules
};
