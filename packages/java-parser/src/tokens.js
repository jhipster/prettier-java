/* eslint-disable no-unused-vars */
"use strict";
const { createToken: createTokenOrg, Lexer } = require("chevrotain");
const xregexp = require("xregexp");

// A little mini DSL for easier lexer definition using xRegExp.
const fragments = {};

function FRAGMENT(name, def) {
  fragments[name] = xregexp.build(def, fragments);
}

function MAKE_PATTERN(def, flags) {
  return xregexp.build(def, fragments, flags);
}

// The order of fragments definitions is important
FRAGMENT("Digits", "[0-9]([0-9_]*[0-9])?");
FRAGMENT("ExponentPart", "[eE][+-]?{{Digits}}");
FRAGMENT("HexDigit", "[0-9a-fA-F]");
FRAGMENT("HexDigits", "{{HexDigit}}(({{HexDigit}}|'_')*{{HexDigit}})?");

const Identifier = createTokenOrg({
  name: "Identifier",
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
function createKeywordToken(options) {
  options.longer_alt = Identifier;
  return createToken(options);
}

const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
  line_breaks: true
});

const LineCommentStandalone = createToken({
  name: "LineCommentStandalone",
  // TODO: I think the s* in the end is meant to be \s*
  pattern: /\/\/[^\n\r]*((\n|[\r][^\n]|\r\n)s*){2,}/,
  line_breaks: true
});

const LineComment = createToken({
  name: "LineComment",
  pattern: /\/\/[^\n\r]*/
});

const JavaDocCommentStandalone = createToken({
  name: "JavaDocCommentStandalone",
  pattern: /\/\*\*([^*]|\*(?!\/))*\*\/(((\n)|([\r][^\n])|(\r\n))\s*){2,}/,
  line_breaks: true
});

const JavaDocComment = createToken({
  name: "JavaDocComment",
  pattern: /\/\*\*([^*]|\*(?!\/))*\*\//,
  line_breaks: true
});

const TraditionalCommentStandalone = createToken({
  name: "TraditionalCommentStandalone",
  pattern: /\/\*([^*]|\*(?!\/))*\*\/(((\n)|([\r][^\n])|(\r\n))\s*){2,}/,
  line_breaks: true
});

const TraditionalComment = createToken({
  name: "TraditionalComment",
  pattern: /\/\*([^*]|\*(?!\/))*\*\//,
  line_breaks: true
});

const BinaryLiteral = createToken({
  name: "BinaryLiteral",
  pattern: MAKE_PATTERN("0[bB][01]([01_]*[01])?[lL]?"),
  label: "'BinaryLiteral'"
});

const OctLiteral = createToken({
  name: "OctLiteral",
  pattern: MAKE_PATTERN("0_*[0-7]([0-7_]*[0-7])?[lL]?"),
  label: "'OctLiteral'"
});

const FloatLiteral = createToken({
  name: "FloatLiteral",
  pattern: MAKE_PATTERN(
    "-?({{Digits}}\\.{{Digits}}?|\\.{{Digits}}){{ExponentPart}}?[fFdD]?|{{Digits}}({{ExponentPart}}[fFdD]?|[fFdD])"
  ),
  label: "'FloatLiteral'"
});

const HexFloatLiteral = createToken({
  name: "HexFloatLiteral",
  pattern: MAKE_PATTERN(
    "0[xX]({{HexDigits}}\\.?|{{HexDigits}}?\\.{{HexDigits}})[pP][+-]?{{Digits}}[fFdD]?"
  ),
  label: "'HexFloatLiteral'"
});

const HexLiteral = createToken({
  name: "HexLiteral",
  pattern: MAKE_PATTERN("0[xX][0-9a-fA-F]([0-9a-fA-F_]*[0-9a-fA-F])?[lL]?"),
  label: "'HexLiteral'"
});

const DecimalLiteral = createToken({
  name: "DecimalLiteral",
  pattern: MAKE_PATTERN("-?(0|[1-9]({{Digits}}?|_+{{Digits}}))[lL]?"),
  label: "'DecimalLiteral'"
});

// https://docs.oracle.com/javase/specs/jls/se11/html/jls-3.html#jls-3.10.4
const CharLiteral = createToken({
  name: "CharLiteral",
  pattern: /'(?:[^\\']|\\(?:(?:[btnfr"'\\/]|[0-7]|[0-7]{2}|[0-3][0-7]{2})|u[0-9a-fA-F]{4}))'/,
  start_chars_hint: ["'"],
  label: "'CharLiteral'"
});

const StringLiteral = createToken({
  name: "StringLiteral",
  pattern: MAKE_PATTERN('"[^"\\\\]*(\\\\.[^"\\\\]*)*"'),
  label: "'StringLiteral'"
});

const Package = createKeywordToken({
  name: "Package",
  pattern: /package/,
  label: "'package'"
});

const Case = createKeywordToken({
  name: "Case",
  pattern: /case/,
  label: "'case'"
});

const Catch = createKeywordToken({
  name: "Catch",
  pattern: /catch/,
  label: "'catch'"
});

const Finally = createKeywordToken({
  name: "Finally",
  pattern: /finally/,
  label: "'finally'"
});

const Default = createKeywordToken({
  name: "Default",
  pattern: /default/,
  label: "'default'"
});

const Import = createKeywordToken({
  name: "Import",
  pattern: /import/,
  label: "'import'"
});

const Boolean = createKeywordToken({
  name: "Boolean",
  pattern: /boolean/,
  label: "'boolean'"
});

const Char = createKeywordToken({
  name: "Char",
  pattern: /char/,
  label: "'char'"
});

const Byte = createKeywordToken({
  name: "Byte",
  pattern: /byte/,
  label: "'byte'"
});

const Short = createKeywordToken({
  name: "Short",
  pattern: /short/,
  label: "'short'"
});

const Long = createKeywordToken({
  name: "Long",
  pattern: /long/,
  label: "'long'"
});

const Float = createKeywordToken({
  name: "Float",
  pattern: /float/,
  label: "'float'"
});

const Double = createKeywordToken({
  name: "Double",
  pattern: /double/,
  label: "'double'"
});

const Void = createKeywordToken({
  name: "Void",
  pattern: /void/,
  label: "'void'"
});

const Public = createKeywordToken({
  name: "Public",
  pattern: /public/,
  label: "'public'"
});

const Protected = createKeywordToken({
  name: "Protected",
  pattern: /protected/,
  label: "'protected'"
});

const Private = createKeywordToken({
  name: "Private",
  pattern: /private/,
  label: "'private'"
});

const Static = createKeywordToken({
  name: "Static",
  pattern: /static/,
  label: "'static'"
});

const Abstract = createKeywordToken({
  name: "Abstract",
  pattern: /abstract/,
  label: "'abstract'"
});

const Final = createKeywordToken({
  name: "Final",
  pattern: /final/,
  label: "'final'"
});

const Native = createKeywordToken({
  name: "Native",
  pattern: /native/,
  label: "'native'"
});

const Synchronized = createKeywordToken({
  name: "Synchronized",
  pattern: /synchronized/,
  label: "'synchronized'"
});

const Transient = createKeywordToken({
  name: "Transient",
  pattern: /transient/,
  label: "'transient'"
});

const Extends = createKeywordToken({
  name: "Extends",
  pattern: /extends/,
  label: "'extends'"
});

const Implements = createKeywordToken({
  name: "Implements",
  pattern: /implements/,
  label: "'implements'"
});

const New = createKeywordToken({
  name: "New",
  pattern: /new/,
  label: "'new'"
});

const This = createKeywordToken({
  name: "This",
  pattern: /this/,
  label: "'this'"
});

const Super = createKeywordToken({
  name: "Super",
  pattern: /super/,
  label: "'super'"
});

const Throws = createKeywordToken({
  name: "Throws",
  pattern: /throws/,
  label: "'throws'"
});

const Throw = createKeywordToken({
  name: "Throw",
  pattern: /throw/,
  label: "'throw'"
});

const Return = createKeywordToken({
  name: "Return",
  pattern: /return/,
  label: "'return'"
});

const Break = createKeywordToken({
  name: "Break",
  pattern: /break/,
  label: "'break'"
});

const Continue = createKeywordToken({
  name: "Continue",
  pattern: /continue/,
  label: "'continue'"
});

const If = createKeywordToken({
  name: "If",
  pattern: /if/,
  label: "'if'"
});

const Else = createKeywordToken({
  name: "Else",
  pattern: /else/,
  label: "'else'"
});

const While = createKeywordToken({
  name: "While",
  pattern: /while/,
  label: "'while'"
});

const Do = createKeywordToken({
  name: "Do",
  pattern: /do/,
  label: "'do'"
});

const Try = createKeywordToken({
  name: "Try",
  pattern: /try/,
  label: "'try'"
});

const Switch = createKeywordToken({
  name: "Switch",
  pattern: /switch/,
  label: "'switch'"
});

const For = createKeywordToken({
  name: "For",
  pattern: /for/,
  label: "'for'"
});

const True = createKeywordToken({
  name: "True",
  pattern: /true/,
  label: "'true'"
});

const False = createKeywordToken({
  name: "False",
  pattern: /false/,
  label: "'false'"
});

const Null = createKeywordToken({
  name: "Null",
  pattern: /null/,
  label: "'null'"
});

const Assert = createKeywordToken({
  name: "Assert",
  pattern: /assert/,
  label: "'assert'"
});

const Instanceof = createKeywordToken({
  name: "Instanceof",
  pattern: /instanceof/,
  label: "'instanceof'"
});

const Volatile = createKeywordToken({
  name: "Volatile",
  pattern: /volatile/,
  label: "'volatile'"
});

const Strictfp = createKeywordToken({
  name: "Strictfp",
  pattern: /strictfp/,
  label: "'strictfp'"
});

const Class = createKeywordToken({
  name: "Class",
  pattern: /class/,
  label: "'class'"
});

const Enum = createKeywordToken({
  name: "Enum",
  pattern: /enum/,
  label: "'enum'"
});

const Interface = createKeywordToken({
  name: "Interface",
  pattern: /interface/,
  label: "'interface'"
});

const Int = createKeywordToken({
  name: "Int",
  pattern: /int/,
  label: "'int'"
});

const LBrace = createToken({
  name: "LBrace",
  pattern: /\(/,
  label: "'('"
});

const RBrace = createToken({
  name: "RBrace",
  pattern: /\)/,
  label: "')'"
});

const LCurly = createToken({
  name: "LCurly",
  // using a string literal to get around a bug in regexp-to-ast
  // so lexer optimizations can be enabled.
  pattern: "{",
  label: "'{'"
});

const RCurly = createToken({
  name: "RCurly",
  pattern: /}/,
  label: "'}'"
});

const LSquare = createToken({
  name: "LSquare",
  pattern: /\[/,
  label: "'['"
});

const RSquare = createToken({
  name: "RSquare",
  pattern: /]/,
  label: "']'"
});

const Pointer = createToken({
  name: "Pointer",
  pattern: /->/,
  label: "'->'"
});

const LessEquals = createToken({
  name: "LessEquals",
  pattern: /<=/,
  label: "'<='"
});

const LessLessEquals = createToken({
  name: "LessLessEquals",
  pattern: /<<=/,
  label: "'<<='"
});

const LessLess = createToken({
  name: "LessLess",
  pattern: /<</,
  label: "'<<'"
});

const Less = createToken({
  name: "Less",
  pattern: /</,
  label: "'<'"
});

const GreaterEquals = createToken({
  name: "GreaterEquals",
  pattern: />=/,
  label: "'>='"
});

const GreaterGreaterEquals = createToken({
  name: "GreaterGreaterEquals",
  pattern: />>=/,
  label: "'>>='"
});

const GreaterGreaterGreaterEquals = createToken({
  name: "GreaterGreaterGreaterEquals",
  pattern: />>>=/,
  label: "'>>>='"
});

const Greater = createToken({
  name: "Greater",
  pattern: />/,
  label: "'>'"
});

const DotDotDot = createToken({
  name: "DotDotDot",
  pattern: /\.\.\./,
  label: "'...'"
});

const Dot = createToken({
  name: "Dot",
  pattern: /\./,
  label: "'.'"
});

const Comma = createToken({
  name: "Comma",
  pattern: /,/,
  label: "','"
});

const SemiColonWithFollowEmptyLine = createToken({
  name: "SemiColonWithFollowEmptyLine",
  pattern: /;[ \t]*(\r\n|\r[^\n]|\n)[ \t]*(\r\n|\r|\n)/,
  label: "';'",
  line_breaks: true
});

const SemiColon = createToken({
  name: "SemiColon",
  pattern: /;/,
  label: "';'"
});

const ColonColon = createToken({
  name: "ColonColon",
  pattern: /::/,
  label: "'::'"
});

const Colon = createToken({
  name: "Colon",
  pattern: /:/,
  label: "':'"
});

const EqualsEquals = createToken({
  name: "EqualsEquals",
  pattern: /==/,
  label: "'=='"
});

const Equals = createToken({
  name: "Equals",
  pattern: /=/,
  label: "'='"
});

const MinusEquals = createToken({
  name: "MinusEquals",
  pattern: /-=/,
  label: "'-='"
});

const MinusMinus = createToken({
  name: "MinusMinus",
  pattern: /--/,
  label: "'--'"
});

const Minus = createToken({
  name: "Minus",
  pattern: /-/,
  label: "'-'"
});

const PlusEquals = createToken({
  name: "PlusEquals",
  pattern: /\+=/,
  label: "'+='"
});

const PlusPlus = createToken({
  name: "PlusPlus",
  pattern: /\+\+/,
  label: "'++'"
});

const Plus = createToken({
  name: "Plus",
  pattern: /\+/,
  label: "'+'"
});

const AndAnd = createToken({
  name: "AndAnd",
  pattern: /&&/,
  label: "'&&'"
});

const AndEquals = createToken({
  name: "AndEquals",
  pattern: /&=/,
  label: "'&='"
});

const And = createToken({
  name: "And",
  pattern: /&/,
  label: "'&'"
});

const At = createToken({
  name: "At",
  pattern: /@/,
  label: "'@'"
});

const CaretEquals = createToken({
  name: "CaretEquals",
  pattern: /\^=/,
  label: "'^='"
});

const Caret = createToken({
  name: "Caret",
  pattern: /\^/,
  label: "'^'"
});

const Questionmark = createToken({
  name: "Questionmark",
  pattern: /\?/,
  label: "'?'"
});

const ExclamationmarkEquals = createToken({
  name: "ExclamationmarkEquals",
  pattern: /!=/,
  label: "'!='"
});

const Exclamationmark = createToken({
  name: "Exclamationmark",
  pattern: /!/,
  label: "'!'"
});

const Tilde = createToken({
  name: "Tilde",
  pattern: /~/,
  label: "'~'"
});

const OrOr = createToken({
  name: "OrOr",
  pattern: /\|\|/,
  label: "'||'"
});

const OrEquals = createToken({
  name: "OrEquals",
  pattern: /\|=/,
  label: "'|='"
});

const Or = createToken({
  name: "Or",
  pattern: /\|/,
  label: "'|'"
});

const StarEquals = createToken({
  name: "StarEquals",
  pattern: /\*=/,
  label: "'*='"
});

const Star = createToken({
  name: "Star",
  pattern: /\*/,
  label: "'*'"
});

const DashEquals = createToken({
  name: "DashEquals",
  pattern: /\/=/,
  label: "'/='"
});

const Dash = createToken({
  name: "Dash",
  pattern: /\//,
  label: "'/'"
});

const PercentageEquals = createToken({
  name: "PercentageEquals",
  pattern: /%=/,
  label: "'%='"
});

const Percentage = createToken({
  name: "Percentage",
  pattern: /%/,
  label: "'%'"
});

// Identifier must appear AFTER all the keywords to avoid ambiguities.
// See: https://github.com/SAP/chevrotain/blob/master/examples/lexer/keywords_vs_identifiers/keywords_vs_identifiers.js
allTokens.push(Identifier);
tokenDictionary["Identifier"] = Identifier;

module.exports = {
  allTokens,
  tokens: tokenDictionary
};
