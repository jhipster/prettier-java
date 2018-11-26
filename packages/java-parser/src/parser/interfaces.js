"use strict";
function defineRules($, t) {
  const InterfaceType = {
    unknown: 0,
    normalClassDeclaration: 1,
    annotationTypeDeclaration: 2
  };

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
