"use strict";
function defineRules($, t) {
  const InterfaceType = {
    unknown: 0,
    normalClassDeclaration: 1,
    annotationTypeDeclaration: 2
  };

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-InterfaceDeclaration
  $.RULE("interfaceDeclaration", () => {
    const type = this.identifyInterfaceType();
    $.OR([
      {
        GATE: () => type === InterfaceType.normalClassDeclaration,
        ALT: () => $.SUBRULE($.normalClassDeclaration)
      },
      {
        GATE: () => type === InterfaceType.annotationTypeDeclaration,
        ALT: () => $.SUBRULE($.annotationTypeDeclaration)
      }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-NormalInterfaceDeclaration
  $.RULE("normalInterfaceDeclaration", () => {
    $.MANY(() => {
      $.SUBRULE($.interfaceModifier);
    });
    $.CONSUME(t.Interface);
    $.SUBRULE($.typeIdentifier);
    $.OPTION(() => {
      $.SUBRULE($.typeParameters);
    });
    $.OPTION2(() => {
      $.SUBRULE($.extendsInterfaces);
    });
    $.SUBRULE($.interfaceBody);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-InterfaceModifier
  $.RULE("interfaceModifier", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.annotation) },
      { ALT: () => $.CONSUME(t.Public) },
      { ALT: () => $.CONSUME(t.Protected) },
      { ALT: () => $.CONSUME(t.Private) },
      { ALT: () => $.CONSUME(t.Abstract) },
      { ALT: () => $.CONSUME(t.Static) },
      { ALT: () => $.CONSUME(t.Strictfp) }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-ExtendsInterfaces
  $.RULE("extendsInterfaces", () => {
    $.CONSUME(t.Extends);
    $.SUBRULE($.interfaceTypeList);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-InterfaceBody
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

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-InterfaceMemberDeclaration
  $.RULE("interfaceMemberDeclaration", () => {
    const detectedType = this.identifyInterfaceBodyDeclarationType();
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

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-ConstantDeclaration
  $.RULE("constantDeclaration", () => {
    $.MANY(() => {
      $.SUBRULE($.constantModifier);
    });
    $.SUBRULE($.unannType);
    $.SUBRULE($.variableDeclaratorList);
    $.CONSUME(t.Semicolon);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-ConstantModifier
  $.RULE("constantModifier", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.annotation) },
      { ALT: () => $.CONSUME(t.Public) },
      { ALT: () => $.CONSUME(t.Static) },
      { ALT: () => $.CONSUME(t.Final) }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-InterfaceMethodDeclaration
  $.RULE("interfaceMethodDeclaration", () => {
    $.MANY(() => {
      $.SUBRULE($.interfaceMethodModifier);
    });
    $.SUBRULE($.methodHeader);
    $.SUBRULE($.methodBody);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-InterfaceMethodModifier
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

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-AnnotationTypeDeclaration
  $.RULE("annotationTypeDeclaration", () => {
    $.MANY(() => {
      $.SUBRULE($.interfaceModifier);
    });
    $.CONSUME(t.At);
    $.CONSUME(t.Interface);
    $.SUBRULE($.typeIdentifier);
    $.SUBRULE($.annotationTypeBody);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-AnnotationTypeBody
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

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-InterfaceMemberDeclaration
  $.RULE("annotationTypeMemberDeclaration", () => {
    const detectedType = this.identifyAnnotationBodyDeclarationType();
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

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-AnnotationTypeElementDeclaration
  $.RULE("annotationTypeElementDeclaration", () => {
    $.MANY(() => {
      $.SUBRULE($.annotationTypeElementModifier);
    });
    $.CONSUME(t.Identifier);
    $.CONSUME(t.LBrace);
    $.CONSUME(t.RBrace);
    $.OPTION(() => {
      $.SUBRULE($.dims);
    });
    $.OPTION2(() => {
      $.SUBRULE($.defaultValue);
    });
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-AnnotationTypeElementModifier
  $.RULE("annotationTypeElementModifier", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.annotation) },
      { ALT: () => $.CONSUME(t.Public) },
      { ALT: () => $.CONSUME(t.Abstract) }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-DefaultValue
  $.RULE("defaultValue", () => {
    $.CONSUME(t.Default);
    $.SUBRULE($.elementValue);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-Annotation
  $.RULE("annotation", () => {
    $.OR([
      {
        GATE: () => $.BACKTRACK($.normalAnnotation),
        ALT: () => $.SUBRULE($.normalAnnotation)
      },
      // "singleElementAnnotation" must appear before "markerAnnotation" due to common
      // prefix.
      {
        GATE: () => $.BACKTRACK($.singleElementAnnotation),
        ALT: () => $.SUBRULE($.singleElementAnnotation)
      },
      { ALT: () => $.SUBRULE($.markerAnnotation) }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-NormalAnnotation
  $.RULE("normalAnnotation", () => {
    $.CONSUME(t.At);
    $.SUBRULE($.typeName);
    $.CONSUME(t.LBrace);
    $.OPTION(() => {
      $.SUBRULE($.elementValuePairList);
    });
    $.CONSUME(t.RBrace);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-ElementValuePairList
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

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-ElementValue
  $.RULE("elementValue", () => {
    $.OR([
      { ALT: () => $.SUBRULE($.conditionalExpression) },
      { ALT: () => $.SUBRULE($.elementValueArrayInitializer) },
      { ALT: () => $.SUBRULE($.annotation) }
    ]);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-ElementValueArrayInitializer
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

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-ElementValueList
  $.RULE("elementValueList", () => {
    $.SUBRULE($.elementValue);
    $.MANY(() => {
      $.CONSUME(t.Comma);
      $.SUBRULE2($.elementValue);
    });
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-MarkerAnnotation
  $.RULE("markerAnnotation", () => {
    $.CONSUME(t.At);
    $.SUBRULE($.typeName);
  });

  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-SingleElementAnnotation
  $.RULE("singleElementAnnotation", () => {
    $.CONSUME(t.At);
    $.SUBRULE($.typeName);
    $.CONSUME(t.LBrace);
    $.SUBRULE($.elementValue);
    $.CONSUME(t.RBrace);
  });

  // ------------------------------------
  // Special optimized backtracking rules.
  // ------------------------------------
  $.RULE("identifyInterfaceBodyDeclarationType", () => {
    this.isBackTrackingStack.push(1);
    const orgState = this.saveRecogState();
    try {
      let nextTokenType = this.LA(1).tokenType;
      if (nextTokenType === t.Semicolon) {
        return InterfaceBodyTypes.semiColon;
      }

      // We have to look beyond the modifiers to distinguish between the declaration types.
      $.MANY(() => {
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
          { ALT: () => $.CONSUME(t.Static) },
          { ALT: () => $.CONSUME(t.Final) },
          { ALT: () => $.CONSUME(t.Abstract) },
          { ALT: () => $.CONSUME(t.Default) },
          { ALT: () => $.CONSUME(t.Strictfp) }
        ]);
      });

      nextTokenType = this.LA(1).tokenType;
      if (nextTokenType === t.Class || nextTokenType === t.Enum) {
        return InterfaceBodyTypes.classDeclaration;
      }
      if (nextTokenType === t.Interface || nextTokenType === t.At) {
        return InterfaceBodyTypes.interfaceDeclaration;
      }
      if (nextTokenType === t.Void) {
        // method with result type "void"
        return InterfaceBodyTypes.interfaceMethodDeclaration;
      }

      // Only constant or interfaceMethod declarations may be valid at this point.
      // All other alternatives should have been attempted.
      // **both** start with "unannType"
      this.SUBRULE($.unannType);

      nextTokenType = this.LA(1).tokenType;
      const nextNextTokenType = this.LA(2).tokenType;
      // "foo(..." --> look like method start
      if (nextTokenType === t.Identifier && nextNextTokenType === t.LBrace) {
        return InterfaceBodyTypes.interfaceMethodDeclaration;
      }
      // a valid constant
      if (nextTokenType === t.Identifier) {
        return InterfaceBodyTypes.constantDeclaration;
      }
      return InterfaceBodyTypes.unknown;
    } catch (e) {
      // TODO: add info from the original error?
      throw Error("Cannot Identify the type of a <interfaceMemberDeclaration>");
    } finally {
      this.reloadRecogState(orgState);
      this.isBackTrackingStack.pop();
    }
  });

  $.RULE("identifyAnnotationBodyDeclarationType", () => {
    this.isBackTrackingStack.push(1);
    const orgState = this.saveRecogState();
    try {
      let nextTokenType = this.LA(1).tokenType;
      if (nextTokenType === t.Semicolon) {
        return AnnotationBodyTypes.semiColon;
      }

      // We have to look beyond the modifiers to distinguish between the declaration types.
      $.MANY(() => {
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
      });

      nextTokenType = this.LA(1).tokenType;
      if (nextTokenType === t.Class || nextTokenType === t.Enum) {
        return AnnotationBodyTypes.classDeclaration;
      }
      if (nextTokenType === t.Interface || nextTokenType === t.At) {
        return AnnotationBodyTypes.interfaceDeclaration;
      }

      // Only constant or annotationTypeElement declarations may be valid at this point.
      // All other alternatives should have been attempted.
      // **both** start with "unannType"
      this.SUBRULE($.unannType);

      nextTokenType = this.LA(1).tokenType;
      const nextNextTokenType = this.LA(2).tokenType;
      // "foo(..." --> look like annotationTypeElement start
      if (nextTokenType === t.Identifier && nextNextTokenType === t.LBrace) {
        return AnnotationBodyTypes.annotationTypeElementDeclaration;
      }
      // a valid constant
      if (nextTokenType === t.Identifier) {
        return AnnotationBodyTypes.constantDeclaration;
      }
      return AnnotationBodyTypes.unknown;
    } catch (e) {
      // TODO: add info from the original error?
      throw Error("Cannot Identify the type of a <interfaceMemberDeclaration>");
    } finally {
      this.reloadRecogState(orgState);
      this.isBackTrackingStack.pop();
    }
  });

  $.RULE("identifyInterfaceType", () => {
    this.isBackTrackingStack.push(1);
    const orgState = this.saveRecogState();
    try {
      $.MANY(() => {
        $.SUBRULE($.interfaceModifier);
      });
      const nextTokenType = this.LA(1).tokenType;

      switch (nextTokenType) {
        case t.Interface:
          return InterfaceType.normalClassDeclaration;
        case t.At:
          return InterfaceType.normalClassDeclaration;
        default:
          return InterfaceType.unknown;
      }
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
