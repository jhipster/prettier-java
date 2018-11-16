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

// TODO: align with Java Spec
createToken({ name: "WhiteSpace", pattern: /\s+/, group: Lexer.SKIPPED });

createToken({
  name: "LineCommentStandalone",
  // TODO: I think the s* in the end is meant to be \s*
  pattern: /\/\/[^\n\r]*((\n|[\r][^\n]|\r\n)s*){2,}/
});

createToken({ name: "LineComment", pattern: /\/\/[^\n\r]*/ });
createToken({
  name: "JavaDocCommentStandalone",
  pattern: /\/\*\*([^*]|\*(?!\/))*\*\/(((\n)|([\r][^\n])|(\r\n))\s*){2,}/
});
createToken({ name: "JavaDocComment", pattern: /\/\*\*([^*]|\*(?!\/))*\*\// });
createToken({
  name: "TraditionalCommentStandalone",
  pattern: /\/\*([^*]|\*(?!\/))*\*\/(((\n)|([\r][^\n])|(\r\n))\s*){2,}/
});
createToken({
  name: "TraditionalComment",
  pattern: /\/\*([^*]|\*(?!\/))*\*\//
});
createToken({ name: "BinaryLiteral", pattern: /0[bB][01]([01_]*[01])?[lL]?/ });
createToken({ name: "OctLiteral", pattern: /0_*[0-7]([0-7_]*[0-7])?[lL]?/ });
createToken({
  name: "FloatLiteral",
  pattern: MAKE_PATTERN(
    "-?({{Digits}}\\.({{Digits}})?|\\.{{Digits}})({{ExponentPart}})?[fFdD]?|{{Digits}}({{ExponentPart}}[fFdD]?|[fFdD])"
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
  // TODO: A decimal literal should not contain a minus character
  pattern: MAKE_PATTERN("-?(0|[1-9](({{Digits}})?|_+{{Digits}}))[lL]?")
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

// Used a Token Category to mark all restricted keywords.
// This could be used in syntax highlights implementation.
const RestrictedKeyword = createToken({
  name: "RestrictedKeyword",
  pattern: Lexer.NA
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

// Used a Token Category to mark all keywords.
// This could be used in syntax highlights implementation.
const Keyword = createToken({
  name: "Keyword",
  pattern: Lexer.NA
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
  "instanceof",
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
  name: "Var",
  pattern: "var",
  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-3.html#jls-Keyword
  // "var is not a keyword, but rather an identifier with special meaning as the type of a local variable declaration"
  categories: Identifier
});
createKeywordLikeToken({ name: "True", pattern: "true" });
createKeywordLikeToken({ name: "False", pattern: "false" });
createKeywordLikeToken({ name: "Null", pattern: "null" });
createToken({ name: "LBrace", pattern: "(" });
createToken({ name: "RBrace", pattern: ")" });
createToken({ name: "LCurly", pattern: "{" });
createToken({ name: "RCurly", pattern: "}" });
createToken({ name: "LSquare", pattern: "[" });
createToken({ name: "RSquare", pattern: "]" });
createToken({ name: "Pointer", pattern: "->" });
createToken({ name: "LessEquals", pattern: "<=" });
createToken({ name: "LessLessEquals", pattern: "<<=" });
createToken({ name: "LessLess", pattern: "<<" });
createToken({ name: "Less", pattern: "<" });
createToken({ name: "GreaterEquals", pattern: ">=" });
createToken({ name: "GreaterGreaterEquals", pattern: ">>=" });
createToken({ name: "GreaterGreaterGreaterEquals", pattern: ">>>=" });
createToken({ name: "Greater", pattern: ">" });
createToken({ name: "DotDotDot", pattern: "..." });
createToken({ name: "Dot", pattern: "." });
createToken({ name: "Comma", pattern: "," });
createToken({
  name: "SemiColonWithFollowEmptyLine",
  pattern: /;[ \t]*(\r\n|\r[^\n]|\n)[ \t]*(\r\n|\r|\n)/
});
createToken({ name: "SemiColon", pattern: ";" });
createToken({ name: "ColonColon", pattern: "::" });
createToken({ name: "Colon", pattern: ":" });
createToken({ name: "EqualsEquals", pattern: "==" });
createToken({ name: "Equals", pattern: "=" });
createToken({ name: "MinusEquals", pattern: "-=" });
createToken({ name: "MinusMinus", pattern: "--" });
createToken({ name: "Minus", pattern: "-" });
createToken({ name: "PlusEquals", pattern: "+=" });
createToken({ name: "PlusPlus", pattern: "++" });
createToken({ name: "Plus", pattern: "+" });
createToken({ name: "AndAnd", pattern: "&&" });
createToken({ name: "AndEquals", pattern: "&=" });
createToken({ name: "And", pattern: "&" });
createToken({ name: "At", pattern: "@" });
createToken({ name: "CaretEquals", pattern: "^=" });
createToken({ name: "Caret", pattern: "^" });
createToken({ name: "Questionmark", pattern: "?" });
createToken({ name: "ExclamationmarkEquals", pattern: "!=" });
createToken({ name: "Exclamationmark", pattern: "!" });
createToken({ name: "Tilde", pattern: "~" });
createToken({ name: "OrOr", pattern: "||" });
createToken({ name: "OrEquals", pattern: "|=" });
createToken({ name: "Or", pattern: "|" });
createToken({ name: "StarEquals", pattern: "*=" });
createToken({ name: "Star", pattern: "*" });
createToken({ name: "DashEquals", pattern: "/=" });
createToken({ name: "Dash", pattern: "/" });
createToken({ name: "PercentageEquals", pattern: "%=" });
createToken({ name: "Percentage", pattern: "%" });

// Identifier must appear AFTER all the keywords to avoid ambiguities.
// See: https://github.com/SAP/chevrotain/blob/master/examples/lexer/keywords_vs_identifiers/keywords_vs_identifiers.js
allTokens.push(Identifier);
tokenDictionary["Identifier"] = Identifier;

function sortDescLength(arr) {
  // sort is not stable, but that will not affect the lexing results.
  return arr.sort((a, b) => {
    return (
      b.length - a.length
    );
  });
}

module.exports = {
  allTokens,
  tokens: tokenDictionary
};
