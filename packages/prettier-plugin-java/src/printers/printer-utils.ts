import {
  AnnotationCstNode,
  ClassBodyDeclarationCstNode,
  ConstantModifierCstNode,
  CstElement,
  CstNode,
  FieldModifierCstNode,
  ImportDeclarationCstNode,
  InterfaceMemberDeclarationCstNode,
  InterfaceMethodModifierCstNode,
  IToken,
  LambdaParametersWithBracesCtx,
  MethodModifierCstNode,
  TypeArgumentsCstNode
} from "java-parser";
import findIndex from "lodash/findIndex";
import findLastIndex from "lodash/findLastIndex";
import forEach from "lodash/forEach";
import forEachRight from "lodash/forEachRight";
import includes from "lodash/includes";
import { Doc, doc } from "prettier";
import { builders } from "prettier/doc";
import { isCstNode } from "../types/utils";
import { isEmptyDoc } from "../utils";
import {
  hasComments,
  hasLeadingComments,
  hasTrailingComments
} from "./comments/comments-utils";
import {
  getTokenLeadingComments,
  printTokenWithComments
} from "./comments/format-comments";

import { concat, group, ifBreak, join } from "./prettier-builder";
import Indent = builders.Indent;
import IfBreak = builders.IfBreak;

const { indent, hardline, line } = builders;

const orderedModifiers = [
  "Public",
  "Protected",
  "Private",
  "Abstract",
  "Default",
  "Static",
  "Final",
  "Transient",
  "Volatile",
  "Synchronized",
  "Native",
  "Sealed",
  "NonSealed",
  "Strictfp"
];

export function buildFqn(tokens: IToken[], dots: IToken[] | undefined) {
  return rejectAndJoinSeps(dots ? dots : [], tokens);
}

export function rejectAndJoinSeps(
  sepTokens: (IToken | Doc)[] | undefined,
  elems: (Doc | IToken | undefined)[],
  sep?: string
) {
  if (!Array.isArray(sepTokens)) {
    return rejectAndJoin(sepTokens, elems);
  }
  const actualElements = reject(elems);
  const res = [];

  for (let i = 0; i < sepTokens.length; i++) {
    res.push(actualElements[i], sepTokens[i]);
    if (sep) {
      res.push(sep);
    }
  }
  res.push(...actualElements.slice(sepTokens.length));
  return concat(res);
}

export function reject(elems: (IToken | Doc | undefined)[]): (IToken | Doc)[] {
  return elems.filter(item => {
    if (typeof item === "string") {
      return item !== "";
    }
    // eslint-ignore next - We want the conversion to boolean!
    // @ts-ignore
    return item != false && item !== undefined;
  }) as (IToken | Doc)[];
}

export function rejectSeparators(
  separators: Doc[] | undefined,
  elems: (IToken | Doc | undefined)[]
) {
  const realElements = reject(elems);

  const realSeparators = [];
  for (let i = 0; i < realElements.length - 1; i++) {
    if (realElements[i] !== "") {
      realSeparators.push(separators![i]);
    }
  }

  return realSeparators;
}

export function rejectAndJoin(
  sep: Doc | IToken | undefined,
  elems: (Doc | IToken | undefined)[]
) {
  const actualElements = reject(elems);

  return join(sep, actualElements);
}

export function rejectAndConcat(elems: (Doc | IToken | undefined)[]) {
  const actualElements = reject(elems);

  return concat(actualElements);
}

export function sortAnnotationIdentifier(
  annotations: AnnotationCstNode[] | undefined,
  identifiers: IToken[]
) {
  let tokens: CstElement[] = [...identifiers];

  if (annotations && annotations.length > 0) {
    tokens = [...tokens, ...annotations];
  }

  return tokens.sort((a, b) => {
    const startOffset1 = isCstNode(a)
      ? (a.children.At[0] as IToken).startOffset
      : a.startOffset;
    const startOffset2 = isCstNode(b)
      ? (b.children.At[0] as IToken).startOffset
      : b.startOffset;
    return startOffset1 - startOffset2;
  });
}

export function sortTokens(values: (IToken[] | undefined)[]): IToken[] {
  let tokens: IToken[] = [];

  forEach(values, argument => {
    if (argument) {
      tokens = tokens.concat(argument);
    }
  });

  return tokens.sort((a, b) => {
    return a.startOffset - b.startOffset;
  });
}

export function sortNodes(values: (CstNode[] | undefined)[]) {
  let nodes: CstNode[] = [];

  forEach(values, argument => {
    if (argument) {
      nodes = nodes.concat(argument);
    }
  });

  return nodes.sort((a, b) => {
    const aOffset = a.location.startOffset;
    const bOffset = b.location.startOffset;
    return aOffset - bOffset;
  });
}

export function matchCategory(token: IToken, categoryName: string) {
  const labels = (token.tokenType.CATEGORIES || []).map(category => {
    return category.LABEL;
  });

  return labels.indexOf(categoryName) !== -1;
}

export function sortClassTypeChildren(
  annotations: AnnotationCstNode[] | undefined,
  typeArguments: TypeArgumentsCstNode[] | undefined,
  identifiers: IToken[],
  dots?: IToken[]
) {
  let tokens: CstElement[] = [...identifiers];

  if (annotations && annotations.length > 0) {
    tokens = [...tokens, ...annotations];
  }

  if (typeArguments && typeArguments.length > 0) {
    tokens = [...tokens, ...typeArguments];
  }

  if (dots && dots.length > 0) {
    tokens = [...tokens, ...dots];
  }

  return tokens.sort((a, b) => {
    const startOffsetA = isCstNode(a)
      ? a.children.At
        ? (a.children.At[0] as IToken).startOffset
        : (a.children.Less[0] as IToken).startOffset
      : a.startOffset;
    const startOffsetB = isCstNode(b)
      ? b.children.At
        ? (b.children.At[0] as IToken).startOffset
        : (b.children.Less[0] as IToken).startOffset
      : b.startOffset;
    return startOffsetA - startOffsetB;
  });
}

export function sortModifiers(modifiers: CstNode[] | undefined) {
  let firstAnnotations: CstNode[] = [];
  const otherModifiers: CstNode[] = [];
  let lastAnnotations: CstNode[] = [];
  let hasOtherModifier = false;

  /**
   * iterate in reverse order because we special-case
   * method annotations which come after all other
   * modifiers
   */
  forEachRight(modifiers, modifier => {
    const isAnnotation = modifier.children.annotation !== undefined;
    const isMethodAnnotation =
      isAnnotation &&
      (modifier.name === "methodModifier" ||
        modifier.name === "interfaceMethodModifier");

    if (isAnnotation) {
      if (isMethodAnnotation && !hasOtherModifier) {
        lastAnnotations.unshift(modifier);
      } else {
        firstAnnotations.unshift(modifier);
      }
    } else {
      otherModifiers.unshift(modifier);
      hasOtherModifier = true;
    }
  });

  /**
   * if there are only annotations, move everything from
   * lastAnnotations to firstAnnotations
   */
  if (!hasOtherModifier) {
    firstAnnotations = firstAnnotations.concat(lastAnnotations);
    lastAnnotations = [];
  }

  otherModifiers.sort((a, b) => {
    const modifierIndexA = orderedModifiers.indexOf(Object.keys(a.children)[0]);
    const modifierIndexB = orderedModifiers.indexOf(Object.keys(b.children)[0]);

    return modifierIndexA - modifierIndexB;
  });

  return [firstAnnotations, otherModifiers.concat(lastAnnotations)];
}

export function findDeepElementInPartsArray(item: any, elt: any) {
  if (Array.isArray(item)) {
    if (includes(item, elt)) {
      return true;
    }
    for (let i = 0; i < item.length; i++) {
      if (findDeepElementInPartsArray(item[i], elt)) {
        return true;
      }
    }
  } else {
    for (const key in item) {
      if (
        typeof item[key] === "object" &&
        findDeepElementInPartsArray(item[key], elt)
      ) {
        return true;
      }
    }
  }

  return false;
}

export function displaySemicolon(token: IToken, params?: any) {
  if (params !== undefined && params.allowEmptyStatement) {
    return printTokenWithComments(token);
  }

  if (!hasComments(token)) {
    return "";
  }

  token.image = "";
  return printTokenWithComments(token);
}

export function isExplicitLambdaParameter(ctx: LambdaParametersWithBracesCtx) {
  return (
    ctx &&
    ctx.lambdaParameterList &&
    ctx.lambdaParameterList[0] &&
    ctx.lambdaParameterList[0].children &&
    ctx.lambdaParameterList[0].children.explicitLambdaParameterList
  );
}

export function getBlankLinesSeparator(
  ctx: CstNode[] | undefined,
  separator: builders.Line | builders.Hardline = hardline
): Doc[] {
  if (ctx === undefined) {
    return [];
  }

  const separators: Doc[] = [];
  for (let i = 0; i < ctx.length - 1; i++) {
    const node = ctx[i];
    const previousRuleEndLineWithComment = hasTrailingComments(node)
      ? node.trailingComments[node.trailingComments.length - 1].endLine
      : (node.location.endLine as number);

    const nextNode = ctx[i + 1];
    const nextRuleStartLineWithComment = hasLeadingComments(nextNode)
      ? nextNode.leadingComments[0].startLine
      : nextNode.location.startLine;

    if (nextRuleStartLineWithComment - previousRuleEndLineWithComment > 1) {
      separators.push([hardline, hardline]);
    } else {
      separators.push(separator);
    }
  }

  return separators;
}

const isTwoHardLine = (userBlankLinesSeparator: Doc): boolean => {
  if (!Array.isArray(userBlankLinesSeparator)) {
    return false;
  }

  return (
    userBlankLinesSeparator.length === 2 &&
    userBlankLinesSeparator[0] === hardline &&
    userBlankLinesSeparator[1] === hardline
  );
};

function getDeclarationsSeparator<
  Declaration extends
    | ClassBodyDeclarationCstNode
    | InterfaceMemberDeclarationCstNode
>(
  declarations: Declaration[],
  needLineDeclaration: (decl: Declaration) => boolean,
  isSemicolon: (decl: Declaration) => boolean
) {
  const declarationsWithoutEmptyStatements = declarations.filter(
    declaration => !isSemicolon(declaration)
  );

  const userBlankLinesSeparators = getBlankLinesSeparator(
    declarationsWithoutEmptyStatements
  );
  const additionalBlankLines =
    declarationsWithoutEmptyStatements.map(needLineDeclaration);

  const separators = [];
  let indexNextNotEmptyDeclaration = 0;
  for (let i = 0; i < declarations.length - 1; i++) {
    // if the empty statement has comments
    // we want to print them on their own line
    if (isSemicolon(declarations[i])) {
      if (hasComments(declarations[i])) {
        separators.push(hardline);
      }
    } else if (
      indexNextNotEmptyDeclaration <
      declarationsWithoutEmptyStatements.length - 1
    ) {
      const isNextSeparatorTwoHardLine = isTwoHardLine(
        userBlankLinesSeparators[indexNextNotEmptyDeclaration]
      );
      const additionalSep =
        !isNextSeparatorTwoHardLine &&
        (additionalBlankLines[indexNextNotEmptyDeclaration + 1] ||
          additionalBlankLines[indexNextNotEmptyDeclaration])
          ? hardline
          : "";
      separators.push(
        concat([
          userBlankLinesSeparators![indexNextNotEmptyDeclaration],
          additionalSep
        ])
      );

      indexNextNotEmptyDeclaration += 1;
    }
  }

  return separators;
}

function needLineClassBodyDeclaration(
  declaration: ClassBodyDeclarationCstNode
) {
  if (declaration.children.classMemberDeclaration === undefined) {
    return true;
  }

  const classMemberDeclaration = declaration.children.classMemberDeclaration[0];

  if (classMemberDeclaration.children.fieldDeclaration !== undefined) {
    const fieldDeclaration =
      classMemberDeclaration.children.fieldDeclaration[0];
    if (
      fieldDeclaration.children.fieldModifier !== undefined &&
      hasAnnotation(fieldDeclaration.children.fieldModifier)
    ) {
      return true;
    }
    return false;
  } else if (classMemberDeclaration.children.Semicolon !== undefined) {
    return false;
  }

  return true;
}

function needLineInterfaceMemberDeclaration(
  declaration: InterfaceMemberDeclarationCstNode
) {
  if (declaration.children.constantDeclaration !== undefined) {
    const constantDeclaration = declaration.children.constantDeclaration[0];
    if (
      constantDeclaration.children.constantModifier !== undefined &&
      hasAnnotation(constantDeclaration.children.constantModifier)
    ) {
      return true;
    }
    return false;
  } else if (declaration.children.interfaceMethodDeclaration !== undefined) {
    const interfaceMethodDeclaration =
      declaration.children.interfaceMethodDeclaration[0];
    if (
      interfaceMethodDeclaration.children.interfaceMethodModifier !==
        undefined &&
      hasNonTrailingAnnotation(
        interfaceMethodDeclaration.children.interfaceMethodModifier
      )
    ) {
      return true;
    }
    return false;
  }

  return true;
}

function isClassBodyDeclarationASemicolon(
  classBodyDeclaration: ClassBodyDeclarationCstNode
) {
  if (classBodyDeclaration.children.classMemberDeclaration) {
    if (
      classBodyDeclaration.children.classMemberDeclaration[0].children
        .Semicolon !== undefined
    ) {
      return true;
    }
  }
  return false;
}

function isInterfaceMemberASemicolon(
  interfaceMemberDeclaration: InterfaceMemberDeclarationCstNode
) {
  return interfaceMemberDeclaration.children.Semicolon !== undefined;
}

function hasAnnotation(
  modifiers: FieldModifierCstNode[] | ConstantModifierCstNode[]
) {
  return modifiers.some(modifier => modifier.children.annotation !== undefined);
}

/**
 * Return true if there is a method modifier that does not come after all other modifiers
 * It is useful to know if sortModifiers will add an annotation before other modifiers
 *
 * @param methodModifiers
 * @returns {boolean}
 */
function hasNonTrailingAnnotation(
  methodModifiers: (MethodModifierCstNode | InterfaceMethodModifierCstNode)[]
) {
  const firstAnnotationIndex = findIndex(
    methodModifiers,
    modifier => modifier.children.annotation !== undefined
  );
  const lastNonAnnotationIndex = findLastIndex(
    methodModifiers,
    modifier => modifier.children.annotation === undefined
  );

  return (
    firstAnnotationIndex < lastNonAnnotationIndex ||
    lastNonAnnotationIndex === -1
  );
}

export function getClassBodyDeclarationsSeparator(
  classBodyDeclarationContext: ClassBodyDeclarationCstNode[]
) {
  return getDeclarationsSeparator(
    classBodyDeclarationContext,
    needLineClassBodyDeclaration,
    isClassBodyDeclarationASemicolon
  );
}

export function getInterfaceBodyDeclarationsSeparator(
  interfaceMemberDeclarationContext: InterfaceMemberDeclarationCstNode[]
) {
  return getDeclarationsSeparator(
    interfaceMemberDeclarationContext,
    needLineInterfaceMemberDeclaration,
    isInterfaceMemberASemicolon
  );
}

function getAndRemoveLeadingComment(
  doc: IToken | builders.Indent | builders.IfBreak | string
) {
  const isTokenWithLeadingComment =
    typeof doc !== "string" && "leadingComments" in doc;
  if (!isTokenWithLeadingComment) {
    return [];
  }

  const leadingComments = getTokenLeadingComments(doc);
  delete doc.leadingComments;

  return leadingComments;
}

export function putIntoBraces(
  argument: Doc,
  separator: Doc,
  LBrace: IToken,
  RBrace: IToken | Indent | IfBreak | string
) {
  const rightBraceLeadingComments = getAndRemoveLeadingComment(RBrace);
  const lastBreakLine =
    // check if last element of the array is a line
    rightBraceLeadingComments.length !== 0 &&
    rightBraceLeadingComments[rightBraceLeadingComments.length - 1] === hardline
      ? rightBraceLeadingComments.pop()
      : separator;

  let contentInsideBraces;

  if (isEmptyDoc(argument)) {
    if (rightBraceLeadingComments.length === 0) {
      return concat([LBrace, RBrace]);
    }
    contentInsideBraces = [separator, ...rightBraceLeadingComments];
  } else if (rightBraceLeadingComments.length !== 0) {
    contentInsideBraces = [
      separator,
      argument,
      separator,
      ...rightBraceLeadingComments
    ];
  } else {
    contentInsideBraces = [separator, argument];
  }

  return group(
    rejectAndConcat([
      LBrace,
      indent(concat(contentInsideBraces)),
      lastBreakLine,
      RBrace
    ])
  );
}

export function binary(nodes: Doc[], tokens: IToken[], isRoot = false): Doc {
  let levelOperator: string | undefined;
  let levelPrecedence: number | undefined;
  let level: Doc[] = [];
  while (tokens.length) {
    const nextOperator = getOperator(tokens);
    const nextPrecedence = getOperatorPrecedence(nextOperator);

    if (levelPrecedence === undefined || nextPrecedence === levelPrecedence) {
      const tokenLength = ["<<", ">>", ">>>"].includes(nextOperator)
        ? nextOperator.length
        : 1;
      const operator = concat(tokens.splice(0, tokenLength));
      if (
        levelOperator !== undefined &&
        needsParentheses(levelOperator, nextOperator)
      ) {
        level.push(nodes.shift()!);
        level = [
          concat(["(", group(indent(join(line, level))), ") ", operator])
        ];
      } else {
        level.push(join(" ", [nodes.shift()!, operator]));
      }
      levelOperator = nextOperator;
      levelPrecedence = nextPrecedence;
    } else if (nextPrecedence < levelPrecedence) {
      level.push(nodes.shift()!);
      if (isRoot) {
        const content = group(indent(join(line, level)));
        nodes.unshift(
          levelOperator !== undefined &&
            needsParentheses(levelOperator, nextOperator)
            ? concat(["(", content, ")"])
            : content
        );
        level = [];
        levelOperator = undefined;
        levelPrecedence = undefined;
      } else {
        return group(join(line, level));
      }
    } else {
      const content = indent(binary(nodes, tokens));
      nodes.unshift(
        levelOperator !== undefined &&
          needsParentheses(nextOperator, levelOperator)
          ? concat(["(", content, ")"])
          : content
      );
    }
  }
  level.push(nodes.shift()!);
  return group(join(line, level));
}

function getOperator(tokens: IToken[]) {
  if (!tokens.length) {
    return "";
  }
  const [{ image, startOffset }] = tokens;
  if (!["<", ">"].includes(image)) {
    return image;
  }
  let repeatedTokenCount = 1;
  for (let i = 1; i < Math.min(3, tokens.length); i++) {
    const token = tokens[i];
    if (token.image !== image || token.startOffset !== startOffset + i) {
      break;
    }
    repeatedTokenCount++;
  }
  if (repeatedTokenCount === 1) {
    return image;
  }
  if (image === "<") {
    return "<<";
  } else if (repeatedTokenCount == 2) {
    return ">>";
  } else {
    return ">>>";
  }
}

const PRECEDENCES_BY_OPERATOR = new Map(
  [
    ["||"],
    ["&&"],
    ["|"],
    ["^"],
    ["&"],
    ["==", "!="],
    ["<", ">", "<=", ">=", "instanceof"],
    ["<<", ">>", ">>>"],
    ["+", "-"],
    ["*", "/", "%"]
  ].flatMap((operators, index) => operators.map(operator => [operator, index]))
);
function getOperatorPrecedence(operator: string) {
  return PRECEDENCES_BY_OPERATOR.get(operator) ?? -1;
}

function needsParentheses(operator: string, parentOperator: string) {
  return (
    (operator === "&&" && parentOperator === "||") ||
    (["|", "^", "&", "<<", ">>", ">>>"].includes(parentOperator) &&
      getOperatorPrecedence(operator) >
        getOperatorPrecedence(parentOperator)) ||
    [operator, parentOperator].every(o => ["==", "!="].includes(o)) ||
    [operator, parentOperator].every(o => ["<<", ">>", ">>>"].includes(o)) ||
    (operator === "*" && parentOperator === "/") ||
    (operator === "/" && parentOperator === "*") ||
    (operator === "%" && ["+", "-", "*", "/"].includes(parentOperator)) ||
    (["*", "/"].includes(operator) && parentOperator === "%")
  );
}

export function isStatementEmptyStatement(statement: Doc) {
  return (
    statement === ";" || (Array.isArray(statement) && statement[0] === ";")
  );
}

export function sortImports(imports: ImportDeclarationCstNode[] | undefined) {
  const staticImports: ImportDeclarationCstNode[] = [];
  const nonStaticImports: ImportDeclarationCstNode[] = [];

  if (imports !== undefined) {
    for (let i = 0; i < imports.length; i++) {
      if (imports[i].children.Static !== undefined) {
        staticImports.push(imports[i]);
      } else if (imports[i].children.emptyStatement === undefined) {
        nonStaticImports.push(imports[i]);
      }
    }

    // TODO: Could be optimized as we could expect that the array is already almost sorted
    const comparator = (
      first: ImportDeclarationCstNode,
      second: ImportDeclarationCstNode
    ) =>
      compareFqn(
        first.children.packageOrTypeName![0],
        second.children.packageOrTypeName![0]
      );
    staticImports.sort(comparator);
    nonStaticImports.sort(comparator);
  }

  return {
    staticImports,
    nonStaticImports
  };
}

function compareFqn(
  packageOrTypeNameFirst: { children: { Identifier: IToken[] } },
  packageOrTypeNameSecond: { children: { Identifier: IToken[] } }
) {
  const identifiersFirst = packageOrTypeNameFirst.children.Identifier;
  const identifiersSecond = packageOrTypeNameSecond.children.Identifier;

  const minParts = Math.min(identifiersFirst.length, identifiersSecond.length);
  for (let i = 0; i < minParts; i++) {
    if (identifiersFirst[i].image < identifiersSecond[i].image) {
      return -1;
    } else if (identifiersFirst[i].image > identifiersSecond[i].image) {
      return 1;
    }
  }

  if (identifiersFirst.length < identifiersSecond.length) {
    return -1;
  } else if (identifiersFirst.length > identifiersSecond.length) {
    return 1;
  }

  return 0;
}

export function isUniqueMethodInvocation(
  primarySuffixes: CstNode[] | undefined
) {
  if (primarySuffixes === undefined) {
    return 0;
  }

  let count = 0;
  primarySuffixes.forEach(primarySuffix => {
    if (primarySuffix.children.methodInvocationSuffix !== undefined) {
      count++;

      if (count > 1) {
        return 2;
      }
    }
  });

  return count;
}

export function printArrayList({
  list,
  extraComma,
  LCurly,
  RCurly,
  trailingComma
}: {
  list: doc.builders.Doc;
  extraComma: IToken[] | undefined;
  LCurly: IToken;
  RCurly: IToken;
  trailingComma: any;
}) {
  let optionalComma;
  if (trailingComma !== "none" && list !== "") {
    optionalComma = extraComma
      ? ifBreak(extraComma[0], { ...extraComma[0], image: "" })
      : ifBreak(",", "");
  } else {
    optionalComma = extraComma ? { ...extraComma[0], image: "" } : "";
  }

  return putIntoBraces(
    rejectAndConcat([list, optionalComma]),
    line,
    LCurly,
    RCurly
  );
}
