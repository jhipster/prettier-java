"use strict";
const { tokenMatcher } = require("chevrotain");

function defineRules($, t) {
  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-InterfaceDeclaration
  $.RULE("interfaceDeclaration", () => {
    // Spec Deviation: extracted the common "interfaceModifier" prefix to avoid backtracking.
    $.MANY({
      DEF: () => {
        $.SUBRULE($.interfaceModifier);
      },
      MAX_LOOKAHEAD: 2
    });

    $.OR([
      { ALT: () => $.SUBRULE($.normalInterfaceDeclaration) },
      { ALT: () => $.SUBRULE($.annotationTypeDeclaration) }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-NormalInterfaceDeclaration
  $.RULE("normalInterfaceDeclaration", () => {
    // Spec Deviation: The "interfaceModifier" prefix was extracted to the "interfaceDeclaration"
    $.CONSUME(t.Interface);
    $.SUBRULE($.typeIdentifier);
    $.OPTION(() => {
      $.SUBRULE($.typeParameters);
    });
    $.OPTION2(() => {
      $.SUBRULE($.extendsInterfaces);
    });
    $.OPTION3(() => {
      $.SUBRULE($.interfacePermits);
    });
    $.SUBRULE($.interfaceBody);
  });

  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-InterfaceModifier
  $.RULE("interfaceModifier", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.annotation) },
      { ALT: () => $.CONSUME(t.Public) },
      { ALT: () => $.CONSUME(t.Protected) },
      { ALT: () => $.CONSUME(t.Private) },
      { ALT: () => $.CONSUME(t.Abstract) },
      { ALT: () => $.CONSUME(t.Static) },
      { ALT: () => $.CONSUME(t.Sealed) },
      { ALT: () => $.CONSUME(t.NonSealed) },
      { ALT: () => $.CONSUME(t.Strictfp) }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-InterfaceExtends
  $.RULE("extendsInterfaces", () => {
    $.CONSUME(t.Extends);
    $.SUBRULE($.interfaceTypeList);
  });

  // https://docs.oracle.com/javase/specs/jls/se16/preview/specs/sealed-classes-jls.html
  $.RULE("interfacePermits", () => {
    $.CONSUME(t.Permits);
    $.SUBRULE($.typeName);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.SUBRULE2($.typeName);
    });
  });

  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-InterfaceBody
  $.RULE("interfaceBody", () => {
    $.CONSUME(t.LCurly);
    $.MANY(() => {
      $.SUBRULE($.interfaceMemberDeclaration);
    });
    $.CONSUME(t.RCurly);
  });

  const InterfaceBodyTypes = {
    unknown: 0,
    constantDeclaration: 1,
    interfaceMethodDeclaration: 2,
    classDeclaration: 3,
    interfaceDeclaration: 4,
    semiColon: 5
  };

  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-InterfaceMemberDeclaration
  $.RULE("interfaceMemberDeclaration", () => {
    const detectedType = this.BACKTRACK_LOOKAHEAD(
      $.identifyInterfaceBodyDeclarationType
    );

    $.OR([
      {
        GATE: () => detectedType === InterfaceBodyTypes.constantDeclaration,
        ALT: () => $.SUBRULE($.constantDeclaration)
      },
      {
        GATE: () =>
          detectedType === InterfaceBodyTypes.interfaceMethodDeclaration,
        ALT: () => $.SUBRULE($.interfaceMethodDeclaration)
      },
      {
        GATE: () => detectedType === InterfaceBodyTypes.classDeclaration,
        ALT: () => $.SUBRULE($.classDeclaration)
      },
      {
        GATE: () => detectedType === InterfaceBodyTypes.interfaceDeclaration,
        ALT: () => $.SUBRULE($.interfaceDeclaration)
      },
      {
        // No GATE is needed as this is LL(1)
        ALT: () => $.CONSUME(t.Semicolon)
      }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-ConstantDeclaration
  $.RULE("constantDeclaration", () => {
    $.MANY(() => {
      $.SUBRULE($.constantModifier);
    });
    $.SUBRULE($.unannType);
    $.SUBRULE($.variableDeclaratorList);
    $.CONSUME(t.Semicolon);
  });

  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-ConstantModifier
  $.RULE("constantModifier", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.annotation) },
      { ALT: () => $.CONSUME(t.Public) },
      { ALT: () => $.CONSUME(t.Static) },
      { ALT: () => $.CONSUME(t.Final) }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-InterfaceMethodDeclaration
  $.RULE("interfaceMethodDeclaration", () => {
    $.MANY(() => {
      $.SUBRULE($.interfaceMethodModifier);
    });
    $.SUBRULE($.methodHeader);
    $.SUBRULE($.methodBody);
  });

  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-InterfaceMethodModifier
  $.RULE("interfaceMethodModifier", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.annotation) },
      { ALT: () => $.CONSUME(t.Public) },
      { ALT: () => $.CONSUME(t.Private) },
      { ALT: () => $.CONSUME(t.Abstract) },
      { ALT: () => $.CONSUME(t.Default) },
      { ALT: () => $.CONSUME(t.Static) },
      { ALT: () => $.CONSUME(t.Strictfp) }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-AnnotationTypeDeclaration
  $.RULE("annotationTypeDeclaration", () => {
    // Spec Deviation: The "interfaceModifier" prefix was extracted to the "interfaceDeclaration"
    $.CONSUME(t.At);
    $.CONSUME(t.Interface);
    $.SUBRULE($.typeIdentifier);
    $.SUBRULE($.annotationTypeBody);
  });

  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-AnnotationTypeBody
  $.RULE("annotationTypeBody", () => {
    $.CONSUME(t.LCurly);
    $.MANY(() => {
      $.SUBRULE($.annotationTypeMemberDeclaration);
    });
    $.CONSUME(t.RCurly);
  });

  const AnnotationBodyTypes = {
    unknown: 0,
    annotationTypeElementDeclaration: 2,
    constantDeclaration: 1,
    classDeclaration: 3,
    interfaceDeclaration: 4,
    semiColon: 5
  };

  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-InterfaceMemberDeclaration
  $.RULE("annotationTypeMemberDeclaration", () => {
    const detectedType = this.BACKTRACK_LOOKAHEAD(
      $.identifyAnnotationBodyDeclarationType
    );

    $.OR([
      {
        GATE: () =>
          detectedType === AnnotationBodyTypes.annotationTypeElementDeclaration,
        ALT: () => $.SUBRULE($.annotationTypeElementDeclaration)
      },
      {
        GATE: () => detectedType === AnnotationBodyTypes.constantDeclaration,
        ALT: () => $.SUBRULE($.constantDeclaration)
      },
      {
        GATE: () => detectedType === AnnotationBodyTypes.classDeclaration,
        ALT: () => $.SUBRULE($.classDeclaration)
      },
      {
        GATE: () => detectedType === AnnotationBodyTypes.interfaceDeclaration,
        ALT: () => $.SUBRULE($.interfaceDeclaration)
      },
      {
        // No GATE is needed as this is LL(1)
        ALT: () => $.CONSUME(t.Semicolon)
      }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-AnnotationTypeElementDeclaration
  $.RULE("annotationTypeElementDeclaration", () => {
    $.MANY(() => {
      $.SUBRULE($.annotationTypeElementModifier);
    });
    $.SUBRULE($.unannType);
    $.CONSUME(t.Identifier);
    $.CONSUME(t.LBrace);
    $.CONSUME(t.RBrace);
    $.OPTION(() => {
      $.SUBRULE($.dims);
    });
    $.OPTION2(() => {
      $.SUBRULE($.defaultValue);
    });
    $.CONSUME(t.Semicolon);
  });

  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-AnnotationTypeElementModifier
  $.RULE("annotationTypeElementModifier", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.annotation) },
      { ALT: () => $.CONSUME(t.Public) },
      { ALT: () => $.CONSUME(t.Abstract) }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-DefaultValue
  $.RULE("defaultValue", () => {
    $.CONSUME(t.Default);
    $.SUBRULE($.elementValue);
  });

  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-Annotation
  $.RULE("annotation", () => {
    // Spec Deviation: The common prefix for all three annotation types was extracted to this rule.
    // This was done to avoid the use of backtracking for performance reasons.
    $.CONSUME(t.At);
    $.SUBRULE($.typeName);

    // If this optional grammar was not invoked we have a markerAnnotation
    // https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-MarkerAnnotation
    $.OPTION(() => {
      $.CONSUME(t.LBrace);
      $.OR({
        DEF: [
          // normal annotation - https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-NormalAnnotation
          { ALT: () => $.SUBRULE($.elementValuePairList) },
          // Single Element Annotation - https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-SingleElementAnnotation
          {
            ALT: () => $.SUBRULE($.elementValue)
          },
          {
            ALT: () => {
              /* empty normal annotation contents */
            }
          }
        ],
        IGNORE_AMBIGUITIES: true,
        MAX_LOOKAHEAD: 2
      });
      $.CONSUME(t.RBrace);
    });
  });

  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-ElementValuePairList
  $.RULE("elementValuePairList", () => {
    $.SUBRULE($.elementValuePair);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.SUBRULE2($.elementValuePair);
    });
  });

  $.RULE("elementValuePair", () => {
    $.CONSUME(t.Identifier);
    $.CONSUME(t.Equals);
    $.SUBRULE($.elementValue);
  });

  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-ElementValue
  $.RULE("elementValue", () => {
    const isSimpleElementValueAnnotation = this.BACKTRACK_LOOKAHEAD(
      $.isSimpleElementValueAnnotation
    );

    $.OR([
      // Spec Deviation: "conditionalExpression" replaced with "expression"
      // Because we cannot differentiate between the two using fixed lookahead.
      {
        GATE: () => isSimpleElementValueAnnotation === false,
        ALT: () => $.SUBRULE($.expression)
      },
      { ALT: () => $.SUBRULE($.elementValueArrayInitializer) },
      {
        GATE: () => isSimpleElementValueAnnotation === true,
        ALT: () => $.SUBRULE($.annotation)
      }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-ElementValueArrayInitializer
  $.RULE("elementValueArrayInitializer", () => {
    $.CONSUME(t.LCurly);
    $.OPTION(() => {
      $.SUBRULE($.elementValueList);
    });
    $.OPTION2(() => {
      $.CONSUME(t.Comma);
    });
    $.CONSUME(t.RCurly);
  });

  // https://docs.oracle.com/javase/specs/jls/se16/html/jls-9.html#jls-ElementValueList
  $.RULE("elementValueList", () => {
    $.SUBRULE($.elementValue);
    $.MANY({
      GATE: () => tokenMatcher($.LA(2).tokenType, t.RCurly) === false,
      DEF: () => {
        $.CONSUME(t.Comma);
        $.SUBRULE2($.elementValue);
      }
    });
  });

  // ------------------------------------
  // Special optimized backtracking rules.
  // ------------------------------------
  $.RULE("identifyInterfaceBodyDeclarationType", () => {
    let nextTokenType = this.LA(1).tokenType;
    if (tokenMatcher(nextTokenType, t.Semicolon)) {
      return InterfaceBodyTypes.semiColon;
    }

    // We have to look beyond the modifiers to distinguish between the declaration types.
    $.MANY({
      // To avoid ambiguity with @interface ("AnnotationTypeDeclaration" vs "Annotaion")
      GATE: () =>
        (tokenMatcher($.LA(1).tokenType, t.At) &&
          tokenMatcher($.LA(2).tokenType, t.Interface)) === false,
      DEF: () => {
        // This alternation includes all possible modifiers for all types of "interfaceMemberDeclaration"
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
          { ALT: () => $.CONSUME(t.Sealed) },
          { ALT: () => $.CONSUME(t.NonSealed) },
          { ALT: () => $.CONSUME(t.Strictfp) },
          { ALT: () => $.CONSUME(t.Final) },
          { ALT: () => $.CONSUME(t.Default) }
        ]);
      }
    });

    nextTokenType = this.LA(1).tokenType;
    if (
      tokenMatcher(nextTokenType, t.Class) ||
      tokenMatcher(nextTokenType, t.Enum) ||
      tokenMatcher(nextTokenType, t.Record)
    ) {
      return InterfaceBodyTypes.classDeclaration;
    }
    if (
      tokenMatcher(nextTokenType, t.Interface) ||
      tokenMatcher(nextTokenType, t.At)
    ) {
      return InterfaceBodyTypes.interfaceDeclaration;
    }
    if (
      tokenMatcher(nextTokenType, t.Void) ||
      tokenMatcher(nextTokenType, t.Less)
    ) {
      // method with result type "void"
      return InterfaceBodyTypes.interfaceMethodDeclaration;
    }

    // Only constant or interfaceMethod declarations may be valid at this point.
    // All other alternatives should have been attempted.
    // **both** start with "unannType"
    this.SUBRULE($.unannType);

    const nextToken = this.LA(1);
    const nextNextTokenType = this.LA(2).tokenType;
    // "foo(..." --> look like method start
    if (
      tokenMatcher(nextToken, t.Identifier) &&
      tokenMatcher(nextNextTokenType, t.LBrace)
    ) {
      return InterfaceBodyTypes.interfaceMethodDeclaration;
    }
    // a valid constant
    if (tokenMatcher(nextToken, t.Identifier)) {
      return InterfaceBodyTypes.constantDeclaration;
    }
    return InterfaceBodyTypes.unknown;
  });

  $.RULE("identifyAnnotationBodyDeclarationType", () => {
    let nextTokenType = this.LA(1).tokenType;
    if (tokenMatcher(nextTokenType, t.Semicolon)) {
      return AnnotationBodyTypes.semiColon;
    }

    // We have to look beyond the modifiers to distinguish between the declaration types.
    $.MANY({
      // To avoid ambiguity with @interface ("AnnotationTypeDeclaration" vs "Annotaion")
      GATE: () =>
        (tokenMatcher($.LA(1).tokenType, t.At) &&
          tokenMatcher($.LA(2).tokenType, t.Interface)) === false,
      DEF: () => {
        // This alternation includes all possible modifiers for all types of "annotationTypeMemberDeclaration"
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
          { ALT: () => $.CONSUME(t.Strictfp) }
        ]);
      }
    });

    nextTokenType = this.LA(1).tokenType;
    if (
      tokenMatcher(nextTokenType, t.Class) ||
      tokenMatcher(nextTokenType, t.Enum)
    ) {
      return AnnotationBodyTypes.classDeclaration;
    }
    if (
      tokenMatcher(nextTokenType, t.Interface) ||
      tokenMatcher(nextTokenType, t.At)
    ) {
      return AnnotationBodyTypes.interfaceDeclaration;
    }

    // Only constant or annotationTypeElement declarations may be valid at this point.
    // All other alternatives should have been attempted.
    // **both** start with "unannType"
    this.SUBRULE($.unannType);

    nextTokenType = this.LA(1).tokenType;
    const nextNextTokenType = this.LA(2).tokenType;
    // "foo(..." --> look like annotationTypeElement start
    if (
      tokenMatcher(nextTokenType, t.Identifier) &&
      tokenMatcher(nextNextTokenType, t.LBrace)
    ) {
      return AnnotationBodyTypes.annotationTypeElementDeclaration;
    }
    // a valid constant
    if (tokenMatcher(nextTokenType, t.Identifier)) {
      return AnnotationBodyTypes.constantDeclaration;
    }
    return AnnotationBodyTypes.unknown;
  });

  $.RULE("isSimpleElementValueAnnotation", () => {
    $.SUBRULE($.annotation);
    const nextTokenType = this.LA(1).tokenType;
    switch (nextTokenType) {
      // annotation in "ElementValue" would be followed by one of those
      // any other TokenType would indicate it is an annotation in a "referenceType"
      // as part of a "methodReference" in "primary"
      case t.Comma:
      case t.Semicolon:
      case t.RCurly:
      case t.RBrace:
        return true;
      default:
        return false;
    }
  });
}

module.exports = {
  defineRules
};
