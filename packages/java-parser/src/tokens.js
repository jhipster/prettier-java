/* eslint-disable no-unused-vars */
"use strict";
const { createToken: createTokenOrg, Lexer } = require("chevrotain");

// A little mini DSL for easier lexer definition.
const fragments = {};

function inlineFragments(def) {
  let inlinedDef = def;
  Object.keys(fragments).forEach(prevFragmentName => {
    const prevFragmentDef = fragments[prevFragmentName];
    const templateRegExp = new RegExp(`{{${prevFragmentName}}}`, "g");
    inlinedDef = inlinedDef.replace(templateRegExp, prevFragmentDef);
  });
  return inlinedDef;
}

function FRAGMENT(name, def) {
  fragments[name] = inlineFragments(def);
}

function MAKE_PATTERN(def, flags) {
  const inlinedDef = inlineFragments(def);
  return new RegExp(inlinedDef, flags);
}

// The order of fragments definitions is important
FRAGMENT("Digits", "[0-9]([0-9_]*[0-9])?");
FRAGMENT("ExponentPart", "[eE][+-]?{{Digits}}");
FRAGMENT("HexDigit", "[0-9a-fA-F]");
FRAGMENT("HexDigits", "{{HexDigit}}(({{HexDigit}}|'_')*{{HexDigit}})?");
FRAGMENT("FloatTypeSuffix", "[fFdD]");

const Identifier = createTokenOrg({
  name: "Identifier",
  // TODO: Align with the spec, Consider generating the regExp for Identifier
  //       as done in Esprima / Acorn
  pattern: /[a-zA-Z_\\$][a-zA-Z_\\$0-9]*/
});

const allTokens = [];
const tokenDictionary = {};
function createToken(options) {
  // TODO: create a test to check all the tokens have a label defined
  if (!options.label) {
    // simple token (e.g operator)
    if (typeof options.pattern === "string") {
      options.label = `'${options.pattern}'`;
    }
    // Complex token (e.g literal)
    else if (options.pattern instanceof RegExp) {
      options.label = `'${options.name}'`;
    }
  }

  const newTokenType = createTokenOrg(options);
  allTokens.push(newTokenType);
  tokenDictionary[options.name] = newTokenType;
  return newTokenType;
}

function createKeywordLikeToken(options) {
  // A keyword 'like' token uses the "longer_alt" config option
  // to resolve ambiguities, see: http://sap.github.io/chevrotain/docs/features/token_alternative_matches.html
  options.longer_alt = Identifier;
  return createToken(options);
}

// Token Categories
// Used a Token Category to mark all restricted keywords.
// This could be used in syntax highlights implementation.
const RestrictedKeyword = createToken({
  name: "RestrictedKeyword",
  pattern: Lexer.NA
});

// Used a Token Category to mark all keywords.
// This could be used in syntax highlights implementation.
const Keyword = createToken({
  name: "Keyword",
  pattern: Lexer.NA
});

const AssignmentOperator = createToken({
  name: "AssignmentOperator",
  pattern: Lexer.NA
});

const BinaryOperator = createToken({
  name: "BinaryOperator",
  pattern: Lexer.NA
});

const UnaryPrefixOperator = createToken({
  name: "UnaryPrefixOperator",
  pattern: Lexer.NA
});
const UnaryPrefixOperatorNotPlusMinus = createToken({
  name: "UnaryPrefixOperatorNotPlusMinus",
  pattern: Lexer.NA
});

const UnarySuffixOperator = createToken({
  name: "UnarySuffixOperator",
  pattern: Lexer.NA
});

// TODO: align with Java Spec
createToken({ name: "WhiteSpace", pattern: /\s+/, group: Lexer.SKIPPED });
createToken({
  name: "LineComment",
  pattern: /\/\/[^\n\r]*/,
  group: "comments"
});
createToken({
  name: "TraditionalComment",
  pattern: /\/\*([^*]|\*(?!\/))*\*\//,
  group: "comments"
});
createToken({ name: "BinaryLiteral", pattern: /0[bB][01]([01_]*[01])?[lL]?/ });
createToken({ name: "OctalLiteral", pattern: /0_*[0-7]([0-7_]*[0-7])?[lL]?/ });
createToken({
  name: "FloatLiteral",
  pattern: MAKE_PATTERN(
    "{{Digits}}\\.({{Digits}})?({{ExponentPart}})?({{FloatTypeSuffix}})?|" +
      "\\.{{Digits}}({{ExponentPart}})?({{FloatTypeSuffix}})?|" +
      "{{Digits}}{{ExponentPart}}({{FloatTypeSuffix}})?|" +
      "{{Digits}}({{ExponentPart}})?{{FloatTypeSuffix}}"
  )
});
createToken({
  name: "HexFloatLiteral",
  pattern: MAKE_PATTERN(
    "0[xX]({{HexDigits}}\\.?|({{HexDigits}})?\\.{{HexDigits}})[pP][+-]?{{Digits}}[fFdD]?"
  )
});
createToken({
  name: "HexLiteral",
  pattern: /0[xX][0-9a-fA-F]([0-9a-fA-F_]*[0-9a-fA-F])?[lL]?/
});
createToken({
  name: "DecimalLiteral",
  pattern: MAKE_PATTERN("(0|[1-9](_+{{Digits}}|({{Digits}})?))[lL]?")
});
// https://docs.oracle.com/javase/specs/jls/se11/html/jls-3.html#jls-3.10.4
createToken({
  name: "CharLiteral",
  pattern: /'(?:[^\\']|\\(?:(?:[btnfr"'\\/]|[0-7]|[0-7]{2}|[0-3][0-7]{2})|u[0-9a-fA-F]{4}))'/
});
createToken({
  name: "StringLiteral",
  // TODO: align with the spec, the pattern below is incorrect
  pattern: /"[^"\\]*(\\.[^"\\]*)*"/
});

// https://docs.oracle.com/javase/specs/jls/se11/html/jls-3.html#jls-3.9
// TODO: how to handle the special rule (see spec above) for "requires" and "transitive"
const restrictedKeywords = [
  "open",
  "module",
  "requires",
  "transitive",
  "exports",
  "opens",
  "to",
  "uses",
  "provides",
  "with"
];

// By sorting the keywords in descending order we avoid ambiguities
// of common prefixes.
sortDescLength(restrictedKeywords).forEach(word => {
  createKeywordLikeToken({
    name: word[0].toUpperCase() + word.substr(1),
    pattern: word,
    // restricted keywords can also be used as an Identifiers according to the spec.
    // TODO: inspect this causes no ambiguities
    categories: [Identifier, RestrictedKeyword]
  });
});

// https://docs.oracle.com/javase/specs/jls/se11/html/jls-3.html#jls-3.9
const keywords = [
  "abstract",
  "continue",
  "for",
  "new",
  "switch",
  "assert",
  "default",
  "if",
  "package",
  "synchronized",
  "boolean",
  "do",
  "goto",
  "private",
  "this",
  "break",
  "double",
  "implements",
  "protected",
  "throw",
  "byte",
  "else",
  "import",
  "public",
  "throws",
  "case",
  "enum",
  // "instanceof", // special handling for "instanceof" operator below
  "return",
  "transient",
  "catch",
  "extends",
  "int",
  "short",
  "try",
  "char",
  "final",
  "interface",
  "static",
  "void",
  "class",
  "finally",
  "long",
  "strictfp",
  "volatile",
  "const",
  "float",
  "native",
  "super",
  "while",
  ["_", "underscore"]
];

sortDescLength(keywords).forEach(word => {
  // For handling symbols keywords (underscore)
  const isPair = Array.isArray(word);
  const actualName = isPair ? word[1] : word;
  const actualPattern = isPair ? word[0] : word;

  const options = {
    name: actualName[0].toUpperCase() + actualName.substr(1),
    pattern: actualPattern,
    categories: Keyword
  };

  if (isPair) {
    options.label = `'${actualName}'`;
  }
  createKeywordLikeToken(options);
});

createKeywordLikeToken({
  name: "Instanceof",
  pattern: "instanceof",
  categories: [Keyword, BinaryOperator]
});

createKeywordLikeToken({
  name: "Var",
  pattern: "var",
  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-3.html#jls-Keyword
  // "var is not a keyword, but rather an identifier with special meaning as the type of a local variable declaration"
  categories: Identifier
});
createKeywordLikeToken({ name: "True", pattern: "true" });
createKeywordLikeToken({ name: "False", pattern: "false" });
createKeywordLikeToken({ name: "Null", pattern: "null" });

// punctuation and symbols
createToken({ name: "At", pattern: "@" });
createToken({ name: "Arrow", pattern: "->" });
createToken({ name: "DotDotDot", pattern: "..." });
createToken({ name: "Dot", pattern: "." });
createToken({ name: "Comma", pattern: "," });
createToken({ name: "Semicolon", pattern: ";" });
createToken({ name: "ColonColon", pattern: "::" });
createToken({ name: "Colon", pattern: ":" });
createToken({ name: "QuestionMark", pattern: "?" });
createToken({ name: "LBrace", pattern: "(" });
createToken({ name: "RBrace", pattern: ")" });
createToken({ name: "LCurly", pattern: "{" });
createToken({ name: "RCurly", pattern: "}" });
createToken({ name: "LSquare", pattern: "[" });
createToken({ name: "RSquare", pattern: "]" });

// prefix and suffix operators
// must be defined before "-"
createToken({
  name: "MinusMinus",
  pattern: "--",
  categories: [
    UnaryPrefixOperator,
    UnarySuffixOperator,
    UnaryPrefixOperatorNotPlusMinus
  ]
});
// must be defined before "+"
createToken({
  name: "PlusPlus",
  pattern: "++",
  categories: [
    UnaryPrefixOperator,
    UnarySuffixOperator,
    UnaryPrefixOperatorNotPlusMinus
  ]
});
createToken({
  name: "Complement",
  pattern: "~",
  categories: [UnaryPrefixOperator, UnaryPrefixOperatorNotPlusMinus]
});

createToken({
  name: "LessEquals",
  pattern: "<=",
  categories: [BinaryOperator]
});
createToken({
  name: "LessLessEquals",
  pattern: "<<=",
  categories: [AssignmentOperator]
});
createToken({ name: "Less", pattern: "<", categories: [BinaryOperator] });
createToken({
  name: "GreaterEquals",
  pattern: ">=",
  categories: [BinaryOperator]
});
createToken({
  name: "GreaterGreaterEquals",
  pattern: ">>=",
  categories: [AssignmentOperator]
});
createToken({
  name: "GreaterGreaterGreaterEquals",
  pattern: ">>>=",
  categories: [AssignmentOperator]
});
createToken({ name: "Greater", pattern: ">", categories: [BinaryOperator] });
createToken({
  name: "EqualsEquals",
  pattern: "==",
  categories: [BinaryOperator]
});
createToken({
  name: "Equals",
  pattern: "=",
  categories: [BinaryOperator, AssignmentOperator]
});
createToken({
  name: "MinusEquals",
  pattern: "-=",
  categories: [AssignmentOperator]
});
createToken({
  name: "Minus",
  pattern: "-",
  categories: [BinaryOperator, UnaryPrefixOperator]
});
createToken({
  name: "PlusEquals",
  pattern: "+=",
  categories: [AssignmentOperator]
});
createToken({
  name: "Plus",
  pattern: "+",
  categories: [BinaryOperator, UnaryPrefixOperator]
});
createToken({ name: "AndAnd", pattern: "&&", categories: [BinaryOperator] });
createToken({
  name: "AndEquals",
  pattern: "&=",
  categories: [AssignmentOperator]
});
createToken({ name: "And", pattern: "&", categories: [BinaryOperator] });
createToken({
  name: "XorEquals",
  pattern: "^=",
  categories: [AssignmentOperator]
});
createToken({ name: "Xor", pattern: "^", categories: [BinaryOperator] });
createToken({ name: "NotEquals", pattern: "!=", categories: [BinaryOperator] });
createToken({ name: "OrOr", pattern: "||", categories: [BinaryOperator] });
createToken({
  name: "OrEquals",
  pattern: "|=",
  categories: [AssignmentOperator]
});
createToken({ name: "Or", pattern: "|", categories: [BinaryOperator] });
createToken({
  name: "MultiplyEquals",
  pattern: "*=",
  categories: [AssignmentOperator]
});
createToken({ name: "Star", pattern: "*", categories: [BinaryOperator] });
createToken({
  name: "DivideEquals",
  pattern: "/=",
  categories: [AssignmentOperator]
});
createToken({ name: "Divide", pattern: "/", categories: [BinaryOperator] });
createToken({
  name: "ModuloEquals",
  pattern: "%=",
  categories: [AssignmentOperator]
});
createToken({ name: "Modulo", pattern: "%", categories: [BinaryOperator] });

// must be defined after "!="
createToken({
  name: "Not",
  pattern: "!",
  categories: [UnaryPrefixOperator, UnaryPrefixOperatorNotPlusMinus]
});

// Identifier must appear AFTER all the keywords to avoid ambiguities.
// See: https://github.com/SAP/chevrotain/blob/master/examples/lexer/keywords_vs_identifiers/keywords_vs_identifiers.js
allTokens.push(Identifier);
tokenDictionary["Identifier"] = Identifier;

function sortDescLength(arr) {
  // sort is not stable, but that will not affect the lexing results.
  return arr.sort((a, b) => {
    return b.length - a.length;
  });
}

module.exports = {
  allTokens,
  tokens: tokenDictionary
};
