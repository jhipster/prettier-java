"use strict";
function defineRules($, t) {
  $.RULE("expression", () => {
    $.OR([
      {
        GATE: this.isLambdaExpression(),
        ALT: () => $.SUBRULE($.lambdaExpression)
      },
      { ALT: () => $.SUBRULE($.assignmentExpression) }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-15.html#jls-LambdaExpression
  $.RULE("lambdaExpression", () => {
    $.SUBRULE($.lambdaParameters);
    $.CONSUME(t.Arrow);
    $.SUBRULE($.lambdaBody);
  });

  $.RULE("lambdaParameters", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.lambdaParametersWithBraces) },
      { ALT: () => $.CONSUME(t.Identifier) }
    ]);
  });

  $.RULE("lambdaParametersWithBraces", () => {
    $.CONSUME(t.LBrace);
    $.OPTION(() => {
      $.SUBRULE($.lambdaParameterList);
    });
    $.CONSUME(t.RBrace);
  });

  $.RULE("lambdaParameterList", () => {
    $.OR([
      {
        GATE: () => {
          const nextTokType = this.LA(1).tokenType;
          const nextNextTokType = this.LA(2).tokenType;
          return (
            nextTokType === t.Identifier &&
            (nextNextTokType === t.RBrace || nextNextTokType === t.Comma)
          );
        },
        ALT: () => $.SUBRULE($.inferredLambdaParameterList)
      },
      { ALT: () => $.SUBRULE($.explicitLambdaParameterList) }
    ]);
  });

  $.RULE("inferredLambdaParameterList", () => {
    $.CONSUME(t.Identifier);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.CONSUME2(t.Identifier);
    });
  });

  $.RULE("explicitLambdaParameterList", () => {
    $.SUBRULE($.lambdaParameter);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.SUBRULE2($.lambdaParameter);
    });
  });

  $.RULE("lambdaParameter", () => {
    $.OR([
      {
        GATE: () => $.BACKTRACK($.regularLambdaParameter),
        ALT: () => $.SUBRULE($.regularLambdaParameter)
      },
      { ALT: () => $.SUBRULE($.variableArityParameter) }
    ]);
  });

  $.RULE("regularLambdaParameter", () => {
    $.MANY(() => {
      $.SUBRULE($.variableModifier);
    });
    $.SUBRULE($.lambdaParameterType);
    $.SUBRULE($.variableDeclaratorId);
  });

  $.RULE("lambdaParameterType", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.unannType) },
      { ALT: () => $.CONSUME(t.Var) }
    ]);
  });

  $.RULE("lambdaBody", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.expression) },
      { ALT: () => $.SUBRULE($.block) }
    ]);
  });

  $.RULE("assignmentExpression", () => {
    $.SUBRULE($.binaryExpression);
    $.OPTION(() => {
      $.CONSUME(t.QuestionMark);
      $.SUBRULE($.assignmentExpression);
      $.CONSUME(t.Colon);
      $.SUBRULE2($.assignmentExpression);
    });
  });

  $.RULE("binaryExpression", () => {
    $.SUBRULE($.unaryExpression);
    $.MANY(() => {
      $.CONSUME(t.BinaryOperator);
      $.SUBRULE2($.unaryExpression);
    });
  });

  $.RULE("unaryExpression", () => {
    $.MANY(() => {
      $.CONSUME(t.UnaryPrefixOperator);
    });
    $.SUBRULE($.primary);
    $.MANY2(() => {
      $.CONSUME(t.UnarySuffixOperator);
    });
  });

  $.RULE("unaryExpressionNotPlusMinus", () => {
    $.MANY(() => {
      $.CONSUME(t.UnaryPrefixOperatorNotPlusMinus);
    });
    $.SUBRULE($.primary);
    $.MANY2(() => {
      $.CONSUME(t.UnarySuffixOperator);
    });
  });

  $.RULE("primary", () => {
    $.SUBRULE($.primaryPrefix);
    $.MANY(() => {
      $.SUBRULE($.primarySuffix);
    });
  });

  $.RULE("primaryPrefix", () => {
    let isCastExpression = false;
    if ($.LA(1).tokenType === t.LBrace) {
      isCastExpression = this.isCastExpression();
    }

    $.OR([
      { ALT: () => $.SUBRULE($.literal) },
      { ALT: () => $.CONSUME(t.This) },
      { ALT: () => $.CONSUME(t.Void) },
      // should be extracted to primitive type with optional dims suffix?
      { ALT: () => $.SUBRULE($.numericType) },
      { ALT: () => $.CONSUME(t.Boolean) },
      { ALT: () => $.SUBRULE($.fqnOrRefType) },
      {
        GATE: () => isCastExpression,
        ALT: () => $.SUBRULE($.castExpression)
      },
      { ALT: () => $.SUBRULE($.parenthesisExpression) },
      { ALT: () => $.SUBRULE($.newExpression) }
    ]);
  });

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
            { ALT: () => $.SUBRULE($.methodInvocationSuffix) },
            { ALT: () => $.CONSUME(t.Identifier) }
          ]);
        }
      },
      { ALT: () => $.SUBRULE($.classLiteralSuffix) },
      { ALT: () => $.SUBRULE($.arrayAccessSuffix) },
      { ALT: () => $.SUBRULE($.methodReferenceSuffix) }
    ]);
  });

  $.RULE("fqnOrRefType", () => {
    $.SUBRULE($.fqnOrRefTypePart);

    $.MANY2(() => {
      $.CONSUME(t.Dot);
      $.SUBRULE2($.fqnOrRefTypePart);
    });
  });

  // TODO: validation:
  //       1. "annotation" cannot be mixed with "methodTypeArguments" or "Super".
  //       2. "methodTypeArguments" cannot be mixed with "classTypeArguments" or "annotation".
  //       3. "Super" cannot be mixed with "classTypeArguments" or "annotation".
  //       4. At most one "Super" may be used.
  //       5. "Super" may be last or one before last (last may also be first if there is only a single part).
  $.RULE("fqnOrRefTypePart", () => {
    $.MANY(() => {
      $.SUBRULE($.annotation);
    });

    $.OPTION({
      NAME: "$methodTypeArguments",
      DEF: () => {
        $.SUBRULE2($.typeArguments);
      }
    });

    $.OR([
      { ALT: () => $.CONSUME(t.Identifier) },
      { ALT: () => $.CONSUME(t.Super) }
    ]);

    $.OPTION2({
      NAME: "$classTypeArguments",
      DEF: () => {
        $.SUBRULE3($.typeArguments);
      }
    });
  });

  $.RULE("parenthesisExpression", () => {
    $.CONSUME(t.LBrace);
    $.SUBRULE($.expression);
    $.CONSUME(t.RBrace);
  });

  $.RULE("castExpression", () => {
    $.OR([
      {
        GATE: () => this.isPrimitiveCastExpression(),
        ALT: () => $.SUBRULE($.primitiveCastExpression)
      },
      { ALT: () => $.SUBRULE($.referenceTypeCastExpression) }
    ]);
  });

  $.RULE("primitiveCastExpression", () => {
    $.CONSUME(t.LBrace);
    $.SUBRULE($.primitiveType);
    $.CONSUME(t.RBrace);
    $.SUBRULE($.unaryExpression);
  });

  $.RULE("referenceTypeCastExpression", () => {
    $.CONSUME(t.LBrace);
    $.SUBRULE($.referenceType);
    $.MANY(() => {
      $.SUBRULE($.additionalBound);
    });
    $.CONSUME(t.RBrace);
    $.OR([
      {
        GATE: this.isLambdaExpression(),
        ALT: () => $.SUBRULE($.lambdaExpression)
      },
      { ALT: () => $.SUBRULE($.unaryExpressionNotPlusMinus) }
    ]);
  });

  const newExpressionTypes = {
    arrayCreationExpression: 1,
    unqualifiedClassInstanceCreationExpression: 2
  };
  $.RULE("newExpression", () => {
    const type = this.identifyNewExpressionType();

    $.OR([
      {
        GATE: () => type === newExpressionTypes.arrayCreationExpression,
        ALT: () => $.SUBRULE($.arrayCreationExpression)
      },
      {
        GATE: () =>
          type ===
          newExpressionTypes.unqualifiedClassInstanceCreationExpression,
        ALT: () => $.SUBRULE($.unqualifiedClassInstanceCreationExpression)
      }
    ]);
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
      });
      $.CONSUME2(t.Identifier);
    });
    $.SUBRULE($.typeArgumentsOrDiamond);
  });

  $.RULE("typeArgumentsOrDiamond", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.diamond) },
      { ALT: () => $.SUBRULE($.typeArguments) }
    ]);
  });

  $.RULE("diamond", () => {
    $.CONSUME(t.Less);
    $.CONSUME(t.Greater);
  });

  $.RULE("methodInvocationSuffix", () => {
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

  $.RULE("argumentList", () => {
    $.SUBRULE($.expression);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.SUBRULE2($.expression);
    });
  });

  $.RULE("arrayCreationExpression", () => {
    $.CONSUME(t.New);
    $.OR([
      {
        GATE: () => $.BACKTRACK($.primitiveType),
        ALT: () => $.SUBRULE($.primitiveType)
      },
      { ALT: () => $.SUBRULE($.classOrInterfaceType) }
    ]);

    $.OR2([
      {
        GATE: () => $.BACKTRACK($.arrayCreationDefaultInitSuffix),
        ALT: () => $.SUBRULE($.arrayCreationDefaultInitSuffix)
      },
      { ALT: () => $.SUBRULE($.arrayCreationExplicitInitSuffix) }
    ]);
  });

  $.RULE("arrayCreationDefaultInitSuffix", () => {
    $.SUBRULE($.dimExprs);
    $.OPTION(() => {
      $.SUBRULE($.dims);
    });
  });

  $.RULE("arrayCreationExplicitInitSuffix", () => {
    $.SUBRULE($.dims);
    $.SUBRULE($.arrayInitializer);
  });

  $.RULE("dimExprs", () => {
    $.SUBRULE($.dimExpr);
    $.OPTION(() => {
      $.SUBRULE2($.dimExpr);
    });
  });

  $.RULE("dimExpr", () => {
    $.MANY(() => {
      $.SUBRULE($.annotation);
    });
    $.CONSUME(t.LSquare);
    $.SUBRULE($.expression);
    $.CONSUME(t.RSquare);
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

  // backtracking lookahead logic
  $.RULE("identifyNewExpressionType", () => {
    this.isBackTrackingStack.push(1);
    const orgState = this.saveRecogState();
    try {
      $.CONSUME(t.New);
      const firstTokenAfterNew = this.LA(1).tokenType;

      // not an array initialization due to the prefix "TypeArguments"
      if (firstTokenAfterNew === t.Less) {
        return newExpressionTypes.unqualifiedClassInstanceCreationExpression;
      }

      const classTypeCst = $.SUBRULE($.classType);
      // not an array initialization due to the fqn "TypeArguments"
      if (classTypeCst.typeArguments.length > 0) {
        return newExpressionTypes.unqualifiedClassInstanceCreationExpression;
      }

      const firstTokenAfterClassType = this.LA(1).tokenType;
      if (firstTokenAfterClassType === t.LBrace) {
        return newExpressionTypes.unqualifiedClassInstanceCreationExpression;
      }

      // The LBrace above is mandatory in "classInstanceCreation..." so
      // it must be an "arrayCreationExp" (if the input is valid)
      // TODO: upgrade the logic to return "unknown" type if at this
      //       point it does not match "arrayCreation" either.
      //   - This will provide a better error message to the user
      //     in case of invalid inputs
      return newExpressionTypes.arrayCreationExpression;
    } catch (e) {
      return false;
    } finally {
      this.reloadRecogState(orgState);
      this.isBackTrackingStack.pop();
    }
  });

  // Optimized backtracking, only scan ahead until the arrow("->").
  $.RULE("isLambdaExpression", () => {
    this.isBackTrackingStack.push(1);
    const orgState = this.saveRecogState();
    try {
      const firstTokenType = this.LA(1).tokenType;
      const secondTokenType = this.LA(2).tokenType;
      // no parent lambda "x -> x * 2"
      if (firstTokenType === t.Identifier && secondTokenType === t.Arrow) {
        return true;
      }

      $.SUBRULE($.lambdaParametersWithBraces);
      const followedByArrow = this.LA(1).tokenType === t.Arrow;
      return followedByArrow;
    } catch (e) {
      return false;
    } finally {
      this.reloadRecogState(orgState);
      this.isBackTrackingStack.pop();
    }
  });

  $.RULE("isCastExpression", () => {
    this.isBackTrackingStack.push(1);
    const orgState = this.saveRecogState();
    try {
      if (this.isPrimitiveCastExpression()) {
        return true;
      }
      return this.isReferenceTypeCastExpression();
    } catch (e) {
      return false;
    } finally {
      this.reloadRecogState(orgState);
      this.isBackTrackingStack.pop();
    }
  });

  $.RULE("isPrimitiveCastExpression", () => {
    this.isBackTrackingStack.push(1);
    const orgState = this.saveRecogState();
    try {
      $.CONSUME(t.LBrace);
      $.SUBRULE($.primitiveType);
      // No dims so this is not a reference Type
      $.CONSUME(t.RBrace);
      return true;
    } catch (e) {
      return false;
    } finally {
      this.reloadRecogState(orgState);
      this.isBackTrackingStack.pop();
    }
  });

  let firstForUnaryExpressionNotPlusMinus = undefined;
  $.RULE("isReferenceTypeCastExpression", () => {
    if (firstForUnaryExpressionNotPlusMinus === undefined) {
      const firstUnaryExpressionNotPlusMinus = this.computeContentAssist(
        "unaryExpressionNotPlusMinus",
        []
      );
      const nextTokTypes = firstUnaryExpressionNotPlusMinus.map(
        x => x.nextTokenType
      );
      // uniq
      firstForUnaryExpressionNotPlusMinus = nextTokTypes.filter(
        (v, i, a) => a.indexOf(v) === i
      );
    }
    this.isBackTrackingStack.push(1);
    const orgState = this.saveRecogState();
    try {
      $.CONSUME(t.LBrace);
      $.SUBRULE($.referenceType);
      $.MANY(() => {
        $.SUBRULE($.additionalBound);
      });
      $.CONSUME(t.RBrace);
      const firstTokTypeAfterRBrace = this.LA(1).tokenType;

      return (
        firstForUnaryExpressionNotPlusMinus.find(
          tokType => tokType === firstTokTypeAfterRBrace
        ) !== undefined
      );
    } catch (e) {
      return false;
    } finally {
      this.reloadRecogState(orgState);
      this.isBackTrackingStack.pop();
    }
  });
}

module.exports = {
  defineRules
};
