// // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-ClassBodyDeclaration
// $.RULE("classBodyDeclaration", () => {
//   // Spec Deviation: Common prefix of **first** "{annotation}" was extracted from
//   // "constructorDeclaration" and "classMemberDeclaration"
//   // TODO: refactor the "semi" common prefix of annotations and modifiers
//   //       and use GATES to determine which of the alternatives are valid
//   //       depending on which modifiers are present
//   $.MANY(() => {
//     $.SUBRULE($.annotation);
//   });
//
//   // TODO: evaluate implementing "fast" custom backtracking logic
//   //       here to keep the structure of the original grammar
//   $.OR([
//     { ALT: () => $.SUBRULE($.classMemberDeclaration) },
//     { ALT: () => $.SUBRULE($.instanceInitializer) },
//     { ALT: () => $.SUBRULE($.staticInitializer) },
//     // constructor is like method without type. also it may have typeParameters
//     { ALT: () => $.SUBRULE($.constructorDeclaration) }
//   ]);
// });
//
// // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-ClassMemberDeclaration
// $.RULE("classMemberDeclaration", () => {
//   $.OR([
//     // {FieldModifier} UnannType VariableDeclaratorList ;
//     { ALT: () => $.SUBRULE($.fieldDeclaration) },
//     // {MethodModifier} (UnannType | void) Identifier "("
//     { ALT: () => $.SUBRULE($.methodDeclaration) },
//     // {ClassModifier} class
//     // {ClassModifier} enum
//     { ALT: () => $.SUBRULE($.classDeclaration) },
//     // {InterfaceModifier} interface
//     { ALT: () => $.SUBRULE($.interfaceDeclaration) },
//     // {InterfaceModifier} @ interface
//     { ALT: () => $.CONSUME(t.Semicolon) }
//   ]);
// });
//
// // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-FieldDeclaration
// $.RULE("fieldDeclaration", () => {
//   $.MANY(() => {
//     $.SUBRULE($.fieldModifier);
//   });
//   $.SUBRULE($.UnannType);
//   $.SUBRULE($.variableDeclaratorList);
//   $.CONSUME(t.Semicolon);
// });
//
// // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-VariableDeclaratorList
// $.RULE("variableDeclaratorList", () => {
//   $.SUBRULE($.variableDeclarator);
//   $.MANY(() => {
//     $.CONSUME(t.Comma);
//     $.SUBRULE2($.variableDeclarator);
//   });
// });
//
// // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-VariableDeclarator
// $.RULE("variableDeclarator", () => {
//   $.SUBRULE($.variableDeclaratorId);
//   $.OPTION(() => {
//     $.CONSUME(t.Equals);
//     $.SUBRULE($.variableInitializer);
//   });
// });
//
// // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-VariableDeclaratorId
// $.RULE("variableDeclaratorId", () => {
//   $.SUBRULE($.identifier);
//   $.OPTION(() => {
//     $.SUBRULE($.dims);
//   });
// });
//
// // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-VariableInitializer
// $.RULE("variableInitializer", () => {
//   $.OR([
//     { ALT: () => $.SUBRULE($.expression) },
//     { ALT: () => $.SUBRULE($.arrayInitializer) }
//   ]);
// });
//
// // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-UnannType
// $.RULE("UnannType", () => {
//   $.OR([
//     { ALT: () => $.SUBRULE($.unannPrimitiveType) },
//     { ALT: () => $.SUBRULE($.unannReferenceType) }
//   ]);
//   // Spec Deviation: The common suffix of "arrayType" was extracted to the "UnannType" nonTerminal
//   $.OPTION(() => {
//     $.SUBRULE($.dims);
//   });
// });
//
// $.RULE("unannPrimitiveType", () => {
//   $.OR([
//     { ALT: () => $.SUBRULE($.numericType) },
//     { ALT: () => $.CONSUME(t.Boolean) }
//   ]);
// });
//
// // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-UnannReferenceType
// $.RULE("unannReferenceType", () => {
//   // Spec Deviation: "UnannClassOrInterfaceType", "UnannTypeVariable", "UnannArrayType", "UnannClassType"
//   //                 and "UnannInterfaceType" were merged into "referenceType" to to be LL(k)
//   // TODO: Semantic Check: This Identifier cannot be "var" and also followed by annotations/typeArguments
//   $.CONSUME(t.Identifier);
//   $.OPTION(() => {
//     $.SUBRULE($.typeArguments);
//   });
//   $.MANY(() => {
//     $.CONSUME(t.Dot);
//     $.MANY2(() => {
//       $.SUBRULE($.annotation);
//     });
//     // TODO: Semantic Check: This Identifier cannot be "var" and also followed by annotations/typeArguments
//     $.CONSUME2(t.Identifier);
//     $.OPTION2(() => {
//       $.SUBRULE2($.typeArguments);
//     });
//   });
// });
//
// // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-MethodDeclaration
// $.RULE("methodDeclaration", () => {
//   // Spec Deviation: The repetition of modifiers was moved from this nonTerminal to
//   //                 "methodModifiers" to handle ambiguity with the first annotation.
//   $.OPTION(() => {
//     $.SUBRULE($.methodModifiers);
//   });
//   $.SUBRULE($.methodHeader);
//   $.SUBRULE($.methodBody);
// });
//
// // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-InstanceInitializer
// $.RULE("instanceInitializer", () => {
//   $.SUBRULE($.block);
// });
//
// // https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-StaticInitializer
// $.RULE("staticInitializer", () => {
//   $.CONSUME(t.Static);
//   $.SUBRULE($.block);
// });
//
// $.RULE("methodModifiers", () => {
//   // Spec Deviation: The first annotation was extracted to "classBodyDeclaration"
//   //                 And the repetition of modifiers was moved from "methodDeclaration"
//   //                 to this nonTerminal
//   $.OR([
//     { ALT: () => $.CONSUME(t.Public) },
//     { ALT: () => $.CONSUME(t.Protected) },
//     { ALT: () => $.CONSUME(t.Private) },
//     { ALT: () => $.CONSUME(t.Abstract) },
//     { ALT: () => $.CONSUME(t.Static) },
//     { ALT: () => $.CONSUME(t.Final) },
//     { ALT: () => $.CONSUME(t.Synchronized) },
//     { ALT: () => $.CONSUME(t.Native) },
//     { ALT: () => $.CONSUME(t.Strictfp) }
//   ]);
// });
