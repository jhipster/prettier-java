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

createToken({
  name: "WhiteSpace",
  // TODO: align with Java Spec
  pattern: /\s+/,
  group: Lexer.SKIPPED,
  line_breaks: true
});

createToken({
  name: "LineCommentStandalone",
  // TODO: I think the s* in the end is meant to be \s*
  pattern: /\/\/[^\n\r]*((\n|[\r][^\n]|\r\n)s*){2,}/,
  line_breaks: true
});

createToken({
  name: "LineComment",
  pattern: /\/\/[^\n\r]*/
});

createToken({
  name: "JavaDocCommentStandalone",
  pattern: /\/\*\*([^*]|\*(?!\/))*\*\/(((\n)|([\r][^\n])|(\r\n))\s*){2,}/,
  line_breaks: true
});

createToken({
  name: "JavaDocComment",
  pattern: /\/\*\*([^*]|\*(?!\/))*\*\//,
  line_breaks: true
});

createToken({
  name: "TraditionalCommentStandalone",
  pattern: /\/\*([^*]|\*(?!\/))*\*\/(((\n)|([\r][^\n])|(\r\n))\s*){2,}/,
  line_breaks: true
});

createToken({
  name: "TraditionalComment",
  pattern: /\/\*([^*]|\*(?!\/))*\*\//,
  line_breaks: true
});

createToken({
  name: "BinaryLiteral",
  pattern: /0[bB][01]([01_]*[01])?[lL]?/,
  label: "'BinaryLiteral'"
});

createToken({
  name: "OctLiteral",
  pattern: /0_*[0-7]([0-7_]*[0-7])?[lL]?/,
  label: "'OctLiteral'"
});

createToken({
  name: "FloatLiteral",
  pattern: MAKE_PATTERN(
    "-?({{Digits}}\\.({{Digits}})?|\\.{{Digits}})({{ExponentPart}})?[fFdD]?|{{Digits}}({{ExponentPart}}[fFdD]?|[fFdD])"
  ),
  label: "'FloatLiteral'"
});

createToken({
  name: "HexFloatLiteral",
  pattern: MAKE_PATTERN(
    "0[xX]({{HexDigits}}\\.?|({{HexDigits}})?\\.{{HexDigits}})[pP][+-]?{{Digits}}[fFdD]?"
  ),
  label: "'HexFloatLiteral'"
});

createToken({
  name: "HexLiteral",
  pattern: /0[xX][0-9a-fA-F]([0-9a-fA-F_]*[0-9a-fA-F])?[lL]?/,
  label: "'HexLiteral'"
});

createToken({
  name: "DecimalLiteral",
  // TODO: A decimal literal should not contain a minus character
  pattern: MAKE_PATTERN("-?(0|[1-9](({{Digits}})?|_+{{Digits}}))[lL]?"),
  label: "'DecimalLiteral'"
});

// https://docs.oracle.com/javase/specs/jls/se11/html/jls-3.html#jls-3.10.4
createToken({
  name: "CharLiteral",
  pattern: /'(?:[^\\']|\\(?:(?:[btnfr"'\\/]|[0-7]|[0-7]{2}|[0-3][0-7]{2})|u[0-9a-fA-F]{4}))'/,
  start_chars_hint: ["'"],
  label: "'CharLiteral'"
});

createToken({
  name: "StringLiteral",
  // TODO: align with the spec, the pattern below is incorrect
  pattern: /"[^"\\]*(\\.[^"\\]*)*"/,
  label: "'StringLiteral'"
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
    label: `'${word}'`,
    // restricted keywords can also be used as an Identifiers according to the spec.
    // TODO: inspect this causes no ambiguities
    categories: Identifier
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
  const actualName = Array.isArray(word) ? word[1] : word;
  const actualPattern = Array.isArray(word) ? word[0] : word;

  createKeywordLikeToken({
    name: actualName[0].toUpperCase() + actualName.substr(1),
    pattern: actualPattern,
    label: `'${actualName}'`
  });
});

createKeywordLikeToken({
  name: "Var",
  pattern: /var/,
  label: "'var'",
  // https://docs.oracle.com/javase/specs/jls/se11/html/jls-3.html#jls-Keyword
  // "var is not a keyword, but rather an identifier with special meaning as the type of a local variable declaration"
  categories: Identifier
});
createKeywordLikeToken({ name: "True", pattern: /true/, label: "'true'" });
createKeywordLikeToken({ name: "False", pattern: /false/, label: "'false'" });
createKeywordLikeToken({ name: "Null", pattern: /null/, label: "'null'" });
createToken({ name: "LBrace", pattern: /\(/, label: "'('" });
createToken({ name: "RBrace", pattern: /\)/, label: "')'" });
createToken({ name: "LCurly", pattern: "{", label: "'{'" });
createToken({ name: "RCurly", pattern: /}/, label: "'}'" });
createToken({ name: "LSquare", pattern: /\[/, label: "'['" });
createToken({ name: "RSquare", pattern: /]/, label: "']'" });
createToken({ name: "Pointer", pattern: /->/, label: "'->'" });
createToken({ name: "LessEquals", pattern: /<=/, label: "'<='" });
createToken({ name: "LessLessEquals", pattern: /<<=/, label: "'<<='" });
createToken({ name: "LessLess", pattern: /<</, label: "'<<'" });
createToken({ name: "Less", pattern: /</, label: "'<'" });
createToken({ name: "GreaterEquals", pattern: />=/, label: "'>='" });
createToken({ name: "GreaterGreaterEquals", pattern: />>=/, label: "'>>='" });
createToken({
  name: "GreaterGreaterGreaterEquals",
  pattern: />>>=/,
  label: "'>>>='"
});
createToken({ name: "Greater", pattern: />/, label: "'>'" });
createToken({ name: "DotDotDot", pattern: /\.\.\./, label: "'...'" });
createToken({ name: "Dot", pattern: /\./, label: "'.'" });
createToken({ name: "Comma", pattern: /,/, label: "','" });
createToken({
  name: "SemiColonWithFollowEmptyLine",
  pattern: /;[ \t]*(\r\n|\r[^\n]|\n)[ \t]*(\r\n|\r|\n)/,
  label: "';'",
  line_breaks: true
});
createToken({ name: "SemiColon", pattern: /;/, label: "';'" });
createToken({ name: "ColonColon", pattern: /::/, label: "'::'" });
createToken({ name: "Colon", pattern: /:/, label: "':'" });
createToken({ name: "EqualsEquals", pattern: /==/, label: "'=='" });
createToken({ name: "Equals", pattern: /=/, label: "'='" });
createToken({ name: "MinusEquals", pattern: /-=/, label: "'-='" });
createToken({ name: "MinusMinus", pattern: /--/, label: "'--'" });
createToken({ name: "Minus", pattern: /-/, label: "'-'" });
createToken({ name: "PlusEquals", pattern: /\+=/, label: "'+='" });
createToken({ name: "PlusPlus", pattern: /\+\+/, label: "'++'" });
createToken({ name: "Plus", pattern: /\+/, label: "'+'" });
createToken({ name: "AndAnd", pattern: /&&/, label: "'&&'" });
createToken({ name: "AndEquals", pattern: /&=/, label: "'&='" });
createToken({ name: "And", pattern: /&/, label: "'&'" });
createToken({ name: "At", pattern: /@/, label: "'@'" });
createToken({ name: "CaretEquals", pattern: /\^=/, label: "'^='" });
createToken({ name: "Caret", pattern: /\^/, label: "'^'" });
createToken({ name: "Questionmark", pattern: /\?/, label: "'?'" });
createToken({ name: "ExclamationmarkEquals", pattern: /!=/, label: "'!='" });
createToken({ name: "Exclamationmark", pattern: /!/, label: "'!'" });
createToken({ name: "Tilde", pattern: /~/, label: "'~'" });
createToken({ name: "OrOr", pattern: /\|\|/, label: "'||'" });
createToken({ name: "OrEquals", pattern: /\|=/, label: "'|='" });
createToken({ name: "Or", pattern: /\|/, label: "'|'" });
createToken({ name: "StarEquals", pattern: /\*=/, label: "'*='" });
createToken({ name: "Star", pattern: /\*/, label: "'*'" });
createToken({ name: "DashEquals", pattern: /\/=/, label: "'/='" });
createToken({ name: "Dash", pattern: /\//, label: "'/'" });
createToken({ name: "PercentageEquals", pattern: /%=/, label: "'%='" });
createToken({ name: "Percentage", pattern: /%/, label: "'%'" });

// Identifier must appear AFTER all the keywords to avoid ambiguities.
// See: https://github.com/SAP/chevrotain/blob/master/examples/lexer/keywords_vs_identifiers/keywords_vs_identifiers.js
allTokens.push(Identifier);
tokenDictionary["Identifier"] = Identifier;

function sortDescLength(arr) {
  // sort is not stable, but that will not affect the lexing results.
  return arr.sort((a, b) => {
    return (
      // sort by length, if equal then
      b.length - a.length
    );
  });
}

module.exports = {
  allTokens,
  tokens: tokenDictionary
};
