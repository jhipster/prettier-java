export class Parser {
  parse(input: string | Input, oldTree?: Tree, options?: Options): Tree;
  getIncludedRanges(): Range[];
  getTimeoutMicros(): number;
  setTimeoutMicros(timeout: number): void;
  reset(): void;
  getLanguage(): any;
  setLanguage(language?: any): void;
  getLogger(): Logger;
  setLogger(logFunc?: Logger | false | null): void;
  printDotGraphs(enabled?: boolean, fd?: number): void;
}

export type Options = {
  bufferSize?: number;
  includedRanges?: Range[];
};

export type Point = {
  row: number;
  column: number;
};

export type Range = {
  startIndex: number;
  endIndex: number;
  startPosition: Point;
  endPosition: Point;
};

export type Edit = {
  startIndex: number;
  oldEndIndex: number;
  newEndIndex: number;
  startPosition: Point;
  oldEndPosition: Point;
  newEndPosition: Point;
};

export type Logger = (
  message: string,
  params: { [param: string]: string },
  type: "parse" | "lex"
) => void;

export interface Input {
  (index: number, position?: Point): string | null;
}

interface SyntaxNodeBase {
  tree: Tree;
  id: number;
  typeId: number;
  grammarId: number;
  type: string;
  grammarType: string;
  isNamed: boolean;
  isMissing: boolean;
  isExtra: boolean;
  hasChanges: boolean;
  hasError: boolean;
  isError: boolean;
  text: string;
  parseState: number;
  nextParseState: number;
  startPosition: Point;
  endPosition: Point;
  startIndex: number;
  endIndex: number;
  parent: SyntaxNode | null;
  children: Array<SyntaxNode>;
  namedChildren: Array<SyntaxNode>;
  childCount: number;
  namedChildCount: number;
  firstChild: SyntaxNode | null;
  firstNamedChild: SyntaxNode | null;
  lastChild: SyntaxNode | null;
  lastNamedChild: SyntaxNode | null;
  nextSibling: SyntaxNode | null;
  nextNamedSibling: SyntaxNode | null;
  previousSibling: SyntaxNode | null;
  previousNamedSibling: SyntaxNode | null;
  descendantCount: number;

  toString(): string;
  child(index: number): SyntaxNode | null;
  namedChild(index: number): SyntaxNode | null;
  childForFieldName(fieldName: string): SyntaxNode | null;
  childForFieldId(fieldId: number): SyntaxNode | null;
  fieldNameForChild(childIndex: number): string | null;
  childrenForFieldName(fieldName: string): Array<SyntaxNode>;
  childrenForFieldId(fieldId: number): Array<SyntaxNode>;
  firstChildForIndex(index: number): SyntaxNode | null;
  firstNamedChildForIndex(index: number): SyntaxNode | null;

  descendantForIndex(index: number): SyntaxNode;
  descendantForIndex(startIndex: number, endIndex: number): SyntaxNode;
  namedDescendantForIndex(index: number): SyntaxNode;
  namedDescendantForIndex(startIndex: number, endIndex: number): SyntaxNode;
  descendantForPosition(position: Point): SyntaxNode;
  descendantForPosition(startPosition: Point, endPosition: Point): SyntaxNode;
  namedDescendantForPosition(position: Point): SyntaxNode;
  namedDescendantForPosition(
    startPosition: Point,
    endPosition: Point
  ): SyntaxNode;
  descendantsOfType<T extends TypeString>(
    types: T | readonly T[],
    startPosition?: Point,
    endPosition?: Point
  ): NodeOfType<T>[];

  closest<T extends SyntaxType>(types: T | readonly T[]): NamedNode<T> | null;
  walk(): TreeCursor;
}

export interface TreeCursor {
  nodeType: string;
  nodeTypeId: number;
  nodeStateId: number;
  nodeText: string;
  nodeIsNamed: boolean;
  nodeIsMissing: boolean;
  startPosition: Point;
  endPosition: Point;
  startIndex: number;
  endIndex: number;
  readonly currentNode: SyntaxNode;
  readonly currentFieldName: string;
  readonly currentFieldId: number;
  readonly currentDepth: number;
  readonly currentDescendantIndex: number;

  reset(node: SyntaxNode): void;
  resetTo(cursor: TreeCursor): void;
  gotoParent(): boolean;
  gotoFirstChild(): boolean;
  gotoLastChild(): boolean;
  gotoFirstChildForIndex(goalIndex: number): boolean;
  gotoFirstChildForPosition(goalPosition: Point): boolean;
  gotoNextSibling(): boolean;
  gotoPreviousSibling(): boolean;
  gotoDescendant(goalDescendantIndex: number): void;
}

export interface Tree {
  readonly rootNode: SyntaxNode;

  rootNodeWithOffset(offsetBytes: number, offsetExtent: Point): SyntaxNode;
  edit(edit: Edit): Tree;
  walk(): TreeCursor;
  getChangedRanges(other: Tree): Range[];
  getIncludedRanges(): Range[];
  getEditedRange(other: Tree): Range;
  printDotGraph(fd?: number): void;
}

export interface QueryCapture {
  name: string;
  text?: string;
  node: SyntaxNode;
  setProperties?: { [prop: string]: string | null };
  assertedProperties?: { [prop: string]: string | null };
  refutedProperties?: { [prop: string]: string | null };
}

export interface QueryMatch {
  pattern: number;
  captures: QueryCapture[];
}

export type QueryOptions = {
  startPosition?: Point;
  endPosition?: Point;
  startIndex?: number;
  endIndex?: number;
  matchLimit?: number;
  maxStartDepth?: number;
};

export interface PredicateResult {
  operator: string;
  operands: { name: string; type: string }[];
}

export class Query {
  readonly predicates: { [name: string]: Function }[];
  readonly setProperties: any[];
  readonly assertedProperties: any[];
  readonly refutedProperties: any[];
  readonly matchLimit: number;

  constructor(language: any, source: string | Buffer);

  captures(node: SyntaxNode, options?: QueryOptions): QueryCapture[];
  matches(node: SyntaxNode, options?: QueryOptions): QueryMatch[];
  disableCapture(captureName: string): void;
  disablePattern(patternIndex: number): void;
  isPatternGuaranteedAtStep(byteOffset: number): boolean;
  isPatternRooted(patternIndex: number): boolean;
  isPatternNonLocal(patternIndex: number): boolean;
  startIndexForPattern(patternIndex: number): number;
  didExceedMatchLimit(): boolean;
}

export class LookaheadIterable {
  readonly currentTypeId: number;
  readonly currentType: string;

  reset(language: any, stateId: number): boolean;
  resetState(stateId: number): boolean;
  [Symbol.iterator](): Iterator<string>;
}

interface NamedNodeBase extends SyntaxNodeBase {
  isNamed: true;
}

/** An unnamed node with the given type string. */
export interface UnnamedNode<T extends string = string> extends SyntaxNodeBase {
  type: T;
  isNamed: false;
}

type PickNamedType<Node, T extends string> = Node extends {
  type: T;
  isNamed: true;
}
  ? Node
  : never;

type PickType<Node, T extends string> = Node extends { type: T } ? Node : never;

/** A named node with the given `type` string. */
export type NamedNode<T extends SyntaxType = SyntaxType> = PickNamedType<
  SyntaxNode,
  T
>;

/**
 * A node with the given `type` string.
 *
 * Note that this matches both named and unnamed nodes. Use `NamedNode<T>` to pick only named nodes.
 */
export type NodeOfType<T extends string> = PickType<SyntaxNode, T>;

interface TreeCursorOfType<S extends string, T extends SyntaxNodeBase> {
  nodeType: S;
  currentNode: T;
}

type TreeCursorRecord = {
  [K in TypeString]: TreeCursorOfType<K, NodeOfType<K>>;
};

/**
 * A tree cursor whose `nodeType` correlates with `currentNode`.
 *
 * The typing becomes invalid once the underlying cursor is mutated.
 *
 * The intention is to cast a `TreeCursor` to `TypedTreeCursor` before
 * switching on `nodeType`.
 *
 * For example:
 * ```ts
 * let cursor = root.walk();
 * while (cursor.gotoNextSibling()) {
 *   const c = cursor as TypedTreeCursor;
 *   switch (c.nodeType) {
 *     case SyntaxType.Foo: {
 *       let node = c.currentNode; // Typed as FooNode.
 *       break;
 *     }
 *   }
 * }
 * ```
 */
export type TypedTreeCursor = TreeCursorRecord[keyof TreeCursorRecord];

export interface ErrorNode extends NamedNodeBase {
  type: SyntaxType.ERROR;
  hasError: true;
}

export const enum SyntaxType {
  ERROR = "ERROR",
  AnnotatedType = "annotated_type",
  Annotation = "annotation",
  AnnotationArgumentList = "annotation_argument_list",
  AnnotationTypeBody = "annotation_type_body",
  AnnotationTypeDeclaration = "annotation_type_declaration",
  AnnotationTypeElementDeclaration = "annotation_type_element_declaration",
  ArgumentList = "argument_list",
  ArrayAccess = "array_access",
  ArrayCreationExpression = "array_creation_expression",
  ArrayInitializer = "array_initializer",
  ArrayType = "array_type",
  AssertStatement = "assert_statement",
  AssignmentExpression = "assignment_expression",
  Asterisk = "asterisk",
  BinaryExpression = "binary_expression",
  Block = "block",
  BreakStatement = "break_statement",
  CastExpression = "cast_expression",
  CatchClause = "catch_clause",
  CatchFormalParameter = "catch_formal_parameter",
  CatchType = "catch_type",
  ClassBody = "class_body",
  ClassDeclaration = "class_declaration",
  ClassLiteral = "class_literal",
  CompactConstructorDeclaration = "compact_constructor_declaration",
  ConstantDeclaration = "constant_declaration",
  ConstructorBody = "constructor_body",
  ConstructorDeclaration = "constructor_declaration",
  ContinueStatement = "continue_statement",
  Dimensions = "dimensions",
  DimensionsExpr = "dimensions_expr",
  DoStatement = "do_statement",
  ElementValueArrayInitializer = "element_value_array_initializer",
  ElementValuePair = "element_value_pair",
  EnhancedForStatement = "enhanced_for_statement",
  EnumBody = "enum_body",
  EnumBodyDeclarations = "enum_body_declarations",
  EnumConstant = "enum_constant",
  EnumDeclaration = "enum_declaration",
  ExplicitConstructorInvocation = "explicit_constructor_invocation",
  ExportsModuleDirective = "exports_module_directive",
  ExpressionStatement = "expression_statement",
  ExtendsInterfaces = "extends_interfaces",
  FieldAccess = "field_access",
  FieldDeclaration = "field_declaration",
  FinallyClause = "finally_clause",
  FloatingPointType = "floating_point_type",
  ForStatement = "for_statement",
  FormalParameter = "formal_parameter",
  FormalParameters = "formal_parameters",
  GenericType = "generic_type",
  Guard = "guard",
  IfStatement = "if_statement",
  ImportDeclaration = "import_declaration",
  InferredParameters = "inferred_parameters",
  InstanceofExpression = "instanceof_expression",
  IntegralType = "integral_type",
  InterfaceBody = "interface_body",
  InterfaceDeclaration = "interface_declaration",
  LabeledStatement = "labeled_statement",
  LambdaExpression = "lambda_expression",
  LocalVariableDeclaration = "local_variable_declaration",
  MarkerAnnotation = "marker_annotation",
  MethodDeclaration = "method_declaration",
  MethodInvocation = "method_invocation",
  MethodReference = "method_reference",
  Modifier = "modifier",
  Modifiers = "modifiers",
  ModuleBody = "module_body",
  ModuleDeclaration = "module_declaration",
  MultilineStringFragment = "multiline_string_fragment",
  ObjectCreationExpression = "object_creation_expression",
  OpensModuleDirective = "opens_module_directive",
  PackageDeclaration = "package_declaration",
  ParenthesizedExpression = "parenthesized_expression",
  Pattern = "pattern",
  Permits = "permits",
  Program = "program",
  ProvidesModuleDirective = "provides_module_directive",
  ReceiverParameter = "receiver_parameter",
  RecordDeclaration = "record_declaration",
  RecordPattern = "record_pattern",
  RecordPatternBody = "record_pattern_body",
  RecordPatternComponent = "record_pattern_component",
  RequiresModifier = "requires_modifier",
  RequiresModuleDirective = "requires_module_directive",
  Resource = "resource",
  ResourceSpecification = "resource_specification",
  ReturnStatement = "return_statement",
  ScopedIdentifier = "scoped_identifier",
  ScopedTypeIdentifier = "scoped_type_identifier",
  SpreadParameter = "spread_parameter",
  StaticInitializer = "static_initializer",
  StringInterpolation = "string_interpolation",
  StringLiteral = "string_literal",
  SuperInterfaces = "super_interfaces",
  Superclass = "superclass",
  SwitchBlock = "switch_block",
  SwitchBlockStatementGroup = "switch_block_statement_group",
  SwitchExpression = "switch_expression",
  SwitchLabel = "switch_label",
  SwitchRule = "switch_rule",
  SynchronizedStatement = "synchronized_statement",
  TemplateExpression = "template_expression",
  TernaryExpression = "ternary_expression",
  ThrowStatement = "throw_statement",
  Throws = "throws",
  TryStatement = "try_statement",
  TryWithResourcesStatement = "try_with_resources_statement",
  TypeArguments = "type_arguments",
  TypeBound = "type_bound",
  TypeList = "type_list",
  TypeParameter = "type_parameter",
  TypeParameters = "type_parameters",
  TypePattern = "type_pattern",
  UnaryExpression = "unary_expression",
  UpdateExpression = "update_expression",
  UsesModuleDirective = "uses_module_directive",
  VariableDeclarator = "variable_declarator",
  Visibility = "visibility",
  WhileStatement = "while_statement",
  Wildcard = "wildcard",
  YieldStatement = "yield_statement",
  BinaryIntegerLiteral = "binary_integer_literal",
  BlockComment = "block_comment",
  BooleanType = "boolean_type",
  CharacterLiteral = "character_literal",
  DecimalFloatingPointLiteral = "decimal_floating_point_literal",
  DecimalIntegerLiteral = "decimal_integer_literal",
  EscapeSequence = "escape_sequence",
  False = "false",
  HexFloatingPointLiteral = "hex_floating_point_literal",
  HexIntegerLiteral = "hex_integer_literal",
  Identifier = "identifier",
  LineComment = "line_comment",
  NullLiteral = "null_literal",
  OctalIntegerLiteral = "octal_integer_literal",
  StringFragment = "string_fragment",
  Super = "super",
  This = "this",
  True = "true",
  TypeIdentifier = "type_identifier",
  UnderscorePattern = "underscore_pattern",
  VoidType = "void_type"
}

export type UnnamedType =
  | "!"
  | "!="
  | '"'
  | '"""'
  | "%"
  | "%="
  | "&"
  | "&&"
  | "&="
  | "("
  | ")"
  | "*"
  | "*="
  | "+"
  | "++"
  | "+="
  | ","
  | "-"
  | "--"
  | "-="
  | "->"
  | "."
  | "..."
  | "/"
  | "/="
  | ":"
  | "::"
  | ";"
  | "<"
  | "<<"
  | "<<="
  | "<="
  | "="
  | "=="
  | ">"
  | ">="
  | ">>"
  | ">>="
  | ">>>"
  | ">>>="
  | "?"
  | "@"
  | "@interface"
  | "["
  | "\\{"
  | "]"
  | "^"
  | "^="
  | "abstract"
  | "assert"
  | "break"
  | "byte"
  | "case"
  | "catch"
  | "char"
  | "class"
  | "continue"
  | "default"
  | "do"
  | "double"
  | "else"
  | "enum"
  | "exports"
  | "extends"
  | "final"
  | "finally"
  | "float"
  | "for"
  | "if"
  | "implements"
  | "import"
  | "instanceof"
  | "int"
  | "interface"
  | "long"
  | "module"
  | "native"
  | "new"
  | "non-sealed"
  | "open"
  | "opens"
  | "package"
  | SyntaxType.Permits // both named and unnamed
  | "private"
  | "protected"
  | "provides"
  | "public"
  | "record"
  | "requires"
  | "return"
  | "sealed"
  | "short"
  | "static"
  | "strictfp"
  | "switch"
  | "synchronized"
  | "throw"
  | SyntaxType.Throws // both named and unnamed
  | "to"
  | "transient"
  | "transitive"
  | "try"
  | "uses"
  | "volatile"
  | "when"
  | "while"
  | "with"
  | "yield"
  | "{"
  | "|"
  | "|="
  | "||"
  | "}"
  | "~";

export type TypeString = SyntaxType | UnnamedType;

export type SyntaxNode =
  | LiteralNode
  | SimpleTypeNode
  | TypeNode
  | UnannotatedTypeNode
  | DeclarationNode
  | ExpressionNode
  | ModuleDirectiveNode
  | PrimaryExpressionNode
  | StatementNode
  | AnnotatedTypeNode
  | AnnotationNode
  | AnnotationArgumentListNode
  | AnnotationTypeBodyNode
  | AnnotationTypeDeclarationNode
  | AnnotationTypeElementDeclarationNode
  | ArgumentListNode
  | ArrayAccessNode
  | ArrayCreationExpressionNode
  | ArrayInitializerNode
  | ArrayTypeNode
  | AssertStatementNode
  | AssignmentExpressionNode
  | AsteriskNode
  | BinaryExpressionNode
  | BlockNode
  | BreakStatementNode
  | CastExpressionNode
  | CatchClauseNode
  | CatchFormalParameterNode
  | CatchTypeNode
  | ClassBodyNode
  | ClassDeclarationNode
  | ClassLiteralNode
  | CompactConstructorDeclarationNode
  | ConstantDeclarationNode
  | ConstructorBodyNode
  | ConstructorDeclarationNode
  | ContinueStatementNode
  | DimensionsNode
  | DimensionsExprNode
  | DoStatementNode
  | ElementValueArrayInitializerNode
  | ElementValuePairNode
  | EnhancedForStatementNode
  | EnumBodyNode
  | EnumBodyDeclarationsNode
  | EnumConstantNode
  | EnumDeclarationNode
  | ExplicitConstructorInvocationNode
  | ExportsModuleDirectiveNode
  | ExpressionStatementNode
  | ExtendsInterfacesNode
  | FieldAccessNode
  | FieldDeclarationNode
  | FinallyClauseNode
  | FloatingPointTypeNode
  | ForStatementNode
  | FormalParameterNode
  | FormalParametersNode
  | GenericTypeNode
  | GuardNode
  | IfStatementNode
  | ImportDeclarationNode
  | InferredParametersNode
  | InstanceofExpressionNode
  | IntegralTypeNode
  | InterfaceBodyNode
  | InterfaceDeclarationNode
  | LabeledStatementNode
  | LambdaExpressionNode
  | LocalVariableDeclarationNode
  | MarkerAnnotationNode
  | MethodDeclarationNode
  | MethodInvocationNode
  | MethodReferenceNode
  | ModifierNode
  | ModifiersNode
  | ModuleBodyNode
  | ModuleDeclarationNode
  | MultilineStringFragmentNode
  | ObjectCreationExpressionNode
  | OpensModuleDirectiveNode
  | PackageDeclarationNode
  | ParenthesizedExpressionNode
  | PatternNode
  | PermitsNode
  | ProgramNode
  | ProvidesModuleDirectiveNode
  | ReceiverParameterNode
  | RecordDeclarationNode
  | RecordPatternNode
  | RecordPatternBodyNode
  | RecordPatternComponentNode
  | RequiresModifierNode
  | RequiresModuleDirectiveNode
  | ResourceNode
  | ResourceSpecificationNode
  | ReturnStatementNode
  | ScopedIdentifierNode
  | ScopedTypeIdentifierNode
  | SpreadParameterNode
  | StaticInitializerNode
  | StringInterpolationNode
  | StringLiteralNode
  | SuperInterfacesNode
  | SuperclassNode
  | SwitchBlockNode
  | SwitchBlockStatementGroupNode
  | SwitchExpressionNode
  | SwitchLabelNode
  | SwitchRuleNode
  | SynchronizedStatementNode
  | TemplateExpressionNode
  | TernaryExpressionNode
  | ThrowStatementNode
  | ThrowsNode
  | TryStatementNode
  | TryWithResourcesStatementNode
  | TypeArgumentsNode
  | TypeBoundNode
  | TypeListNode
  | TypeParameterNode
  | TypeParametersNode
  | TypePatternNode
  | UnaryExpressionNode
  | UpdateExpressionNode
  | UsesModuleDirectiveNode
  | VariableDeclaratorNode
  | VisibilityNode
  | WhileStatementNode
  | WildcardNode
  | YieldStatementNode
  | UnnamedNode<"!">
  | UnnamedNode<"!=">
  | UnnamedNode<'"'>
  | UnnamedNode<'"""'>
  | UnnamedNode<"%">
  | UnnamedNode<"%=">
  | UnnamedNode<"&">
  | UnnamedNode<"&&">
  | UnnamedNode<"&=">
  | UnnamedNode<"(">
  | UnnamedNode<")">
  | UnnamedNode<"*">
  | UnnamedNode<"*=">
  | UnnamedNode<"+">
  | UnnamedNode<"++">
  | UnnamedNode<"+=">
  | UnnamedNode<",">
  | UnnamedNode<"-">
  | UnnamedNode<"--">
  | UnnamedNode<"-=">
  | UnnamedNode<"->">
  | UnnamedNode<".">
  | UnnamedNode<"...">
  | UnnamedNode<"/">
  | UnnamedNode<"/=">
  | UnnamedNode<":">
  | UnnamedNode<"::">
  | UnnamedNode<";">
  | UnnamedNode<"<">
  | UnnamedNode<"<<">
  | UnnamedNode<"<<=">
  | UnnamedNode<"<=">
  | UnnamedNode<"=">
  | UnnamedNode<"==">
  | UnnamedNode<">">
  | UnnamedNode<">=">
  | UnnamedNode<">>">
  | UnnamedNode<">>=">
  | UnnamedNode<">>>">
  | UnnamedNode<">>>=">
  | UnnamedNode<"?">
  | UnnamedNode<"@">
  | UnnamedNode<"@interface">
  | UnnamedNode<"[">
  | UnnamedNode<"\\{">
  | UnnamedNode<"]">
  | UnnamedNode<"^">
  | UnnamedNode<"^=">
  | UnnamedNode<"abstract">
  | UnnamedNode<"assert">
  | BinaryIntegerLiteralNode
  | BlockCommentNode
  | BooleanTypeNode
  | UnnamedNode<"break">
  | UnnamedNode<"byte">
  | UnnamedNode<"case">
  | UnnamedNode<"catch">
  | UnnamedNode<"char">
  | CharacterLiteralNode
  | UnnamedNode<"class">
  | UnnamedNode<"continue">
  | DecimalFloatingPointLiteralNode
  | DecimalIntegerLiteralNode
  | UnnamedNode<"default">
  | UnnamedNode<"do">
  | UnnamedNode<"double">
  | UnnamedNode<"else">
  | UnnamedNode<"enum">
  | EscapeSequenceNode
  | UnnamedNode<"exports">
  | UnnamedNode<"extends">
  | FalseNode
  | UnnamedNode<"final">
  | UnnamedNode<"finally">
  | UnnamedNode<"float">
  | UnnamedNode<"for">
  | HexFloatingPointLiteralNode
  | HexIntegerLiteralNode
  | IdentifierNode
  | UnnamedNode<"if">
  | UnnamedNode<"implements">
  | UnnamedNode<"import">
  | UnnamedNode<"instanceof">
  | UnnamedNode<"int">
  | UnnamedNode<"interface">
  | LineCommentNode
  | UnnamedNode<"long">
  | UnnamedNode<"module">
  | UnnamedNode<"native">
  | UnnamedNode<"new">
  | UnnamedNode<"non-sealed">
  | NullLiteralNode
  | OctalIntegerLiteralNode
  | UnnamedNode<"open">
  | UnnamedNode<"opens">
  | UnnamedNode<"package">
  | UnnamedNode<SyntaxType.Permits>
  | UnnamedNode<"private">
  | UnnamedNode<"protected">
  | UnnamedNode<"provides">
  | UnnamedNode<"public">
  | UnnamedNode<"record">
  | UnnamedNode<"requires">
  | UnnamedNode<"return">
  | UnnamedNode<"sealed">
  | UnnamedNode<"short">
  | UnnamedNode<"static">
  | UnnamedNode<"strictfp">
  | StringFragmentNode
  | SuperNode
  | UnnamedNode<"switch">
  | UnnamedNode<"synchronized">
  | ThisNode
  | UnnamedNode<"throw">
  | UnnamedNode<SyntaxType.Throws>
  | UnnamedNode<"to">
  | UnnamedNode<"transient">
  | UnnamedNode<"transitive">
  | TrueNode
  | UnnamedNode<"try">
  | TypeIdentifierNode
  | UnderscorePatternNode
  | UnnamedNode<"uses">
  | VoidTypeNode
  | UnnamedNode<"volatile">
  | UnnamedNode<"when">
  | UnnamedNode<"while">
  | UnnamedNode<"with">
  | UnnamedNode<"yield">
  | UnnamedNode<"{">
  | UnnamedNode<"|">
  | UnnamedNode<"|=">
  | UnnamedNode<"||">
  | UnnamedNode<"}">
  | UnnamedNode<"~">
  | ErrorNode;

export type LiteralNode =
  | BinaryIntegerLiteralNode
  | CharacterLiteralNode
  | DecimalFloatingPointLiteralNode
  | DecimalIntegerLiteralNode
  | FalseNode
  | HexFloatingPointLiteralNode
  | HexIntegerLiteralNode
  | NullLiteralNode
  | OctalIntegerLiteralNode
  | StringLiteralNode
  | TrueNode;

export type SimpleTypeNode =
  | BooleanTypeNode
  | FloatingPointTypeNode
  | GenericTypeNode
  | IntegralTypeNode
  | ScopedTypeIdentifierNode
  | TypeIdentifierNode
  | VoidTypeNode;

export type TypeNode = UnannotatedTypeNode | AnnotatedTypeNode;

export type UnannotatedTypeNode = SimpleTypeNode | ArrayTypeNode;

export type DeclarationNode =
  | AnnotationTypeDeclarationNode
  | ClassDeclarationNode
  | EnumDeclarationNode
  | ImportDeclarationNode
  | InterfaceDeclarationNode
  | ModuleDeclarationNode
  | PackageDeclarationNode
  | RecordDeclarationNode;

export type ExpressionNode =
  | AssignmentExpressionNode
  | BinaryExpressionNode
  | CastExpressionNode
  | InstanceofExpressionNode
  | LambdaExpressionNode
  | PrimaryExpressionNode
  | SwitchExpressionNode
  | TernaryExpressionNode
  | UnaryExpressionNode
  | UpdateExpressionNode;

export type ModuleDirectiveNode =
  | ExportsModuleDirectiveNode
  | OpensModuleDirectiveNode
  | ProvidesModuleDirectiveNode
  | RequiresModuleDirectiveNode
  | UsesModuleDirectiveNode;

export type PrimaryExpressionNode =
  | LiteralNode
  | ArrayAccessNode
  | ArrayCreationExpressionNode
  | ClassLiteralNode
  | FieldAccessNode
  | IdentifierNode
  | MethodInvocationNode
  | MethodReferenceNode
  | ObjectCreationExpressionNode
  | ParenthesizedExpressionNode
  | TemplateExpressionNode
  | ThisNode;

export type StatementNode =
  | UnnamedNode<";">
  | AssertStatementNode
  | BlockNode
  | BreakStatementNode
  | ContinueStatementNode
  | DeclarationNode
  | DoStatementNode
  | EnhancedForStatementNode
  | ExpressionStatementNode
  | ForStatementNode
  | IfStatementNode
  | LabeledStatementNode
  | LocalVariableDeclarationNode
  | ReturnStatementNode
  | SwitchExpressionNode
  | SynchronizedStatementNode
  | ThrowStatementNode
  | TryStatementNode
  | TryWithResourcesStatementNode
  | WhileStatementNode
  | YieldStatementNode;

export interface AnnotatedTypeNode extends NamedNodeBase {
  type: SyntaxType.AnnotatedType;
}

export interface AnnotationNode extends NamedNodeBase {
  type: SyntaxType.Annotation;
  argumentsNode: AnnotationArgumentListNode;
  nameNode: IdentifierNode | ScopedIdentifierNode;
}

export interface AnnotationArgumentListNode extends NamedNodeBase {
  type: SyntaxType.AnnotationArgumentList;
}

export interface AnnotationTypeBodyNode extends NamedNodeBase {
  type: SyntaxType.AnnotationTypeBody;
}

export interface AnnotationTypeDeclarationNode extends NamedNodeBase {
  type: SyntaxType.AnnotationTypeDeclaration;
  bodyNode: AnnotationTypeBodyNode;
  nameNode: IdentifierNode;
}

export interface AnnotationTypeElementDeclarationNode extends NamedNodeBase {
  type: SyntaxType.AnnotationTypeElementDeclaration;
  dimensionsNode?: DimensionsNode;
  nameNode: IdentifierNode;
  typeNode: UnannotatedTypeNode;
  valueNode?:
    | AnnotationNode
    | ElementValueArrayInitializerNode
    | ExpressionNode
    | MarkerAnnotationNode;
}

export interface ArgumentListNode extends NamedNodeBase {
  type: SyntaxType.ArgumentList;
}

export interface ArrayAccessNode extends NamedNodeBase {
  type: SyntaxType.ArrayAccess;
  arrayNode: PrimaryExpressionNode;
  indexNode: ExpressionNode;
}

export interface ArrayCreationExpressionNode extends NamedNodeBase {
  type: SyntaxType.ArrayCreationExpression;
  dimensionsNodes: (DimensionsNode | DimensionsExprNode)[];
  typeNode: SimpleTypeNode;
  valueNode?: ArrayInitializerNode;
}

export interface ArrayInitializerNode extends NamedNodeBase {
  type: SyntaxType.ArrayInitializer;
}

export interface ArrayTypeNode extends NamedNodeBase {
  type: SyntaxType.ArrayType;
  dimensionsNode: DimensionsNode;
  elementNode: UnannotatedTypeNode;
}

export interface AssertStatementNode extends NamedNodeBase {
  type: SyntaxType.AssertStatement;
}

export interface AssignmentExpressionNode extends NamedNodeBase {
  type: SyntaxType.AssignmentExpression;
  leftNode: ArrayAccessNode | FieldAccessNode | IdentifierNode;
  operatorNode:
    | UnnamedNode<"%=">
    | UnnamedNode<"&=">
    | UnnamedNode<"*=">
    | UnnamedNode<"+=">
    | UnnamedNode<"-=">
    | UnnamedNode<"/=">
    | UnnamedNode<"<<=">
    | UnnamedNode<"=">
    | UnnamedNode<">>=">
    | UnnamedNode<">>>=">
    | UnnamedNode<"^=">
    | UnnamedNode<"|=">;
  rightNode: ExpressionNode;
}

export interface AsteriskNode extends NamedNodeBase {
  type: SyntaxType.Asterisk;
}

export interface BinaryExpressionNode extends NamedNodeBase {
  type: SyntaxType.BinaryExpression;
  leftNode: ExpressionNode;
  operatorNode:
    | UnnamedNode<"!=">
    | UnnamedNode<"%">
    | UnnamedNode<"&">
    | UnnamedNode<"&&">
    | UnnamedNode<"*">
    | UnnamedNode<"+">
    | UnnamedNode<"-">
    | UnnamedNode<"/">
    | UnnamedNode<"<">
    | UnnamedNode<"<<">
    | UnnamedNode<"<=">
    | UnnamedNode<"==">
    | UnnamedNode<">">
    | UnnamedNode<">=">
    | UnnamedNode<">>">
    | UnnamedNode<">>>">
    | UnnamedNode<"^">
    | UnnamedNode<"|">
    | UnnamedNode<"||">;
  rightNode: ExpressionNode;
}

export interface BlockNode extends NamedNodeBase {
  type: SyntaxType.Block;
}

export interface BreakStatementNode extends NamedNodeBase {
  type: SyntaxType.BreakStatement;
}

export interface CastExpressionNode extends NamedNodeBase {
  type: SyntaxType.CastExpression;
  typeNodes: TypeNode[];
  valueNode: ExpressionNode;
}

export interface CatchClauseNode extends NamedNodeBase {
  type: SyntaxType.CatchClause;
  bodyNode: BlockNode;
}

export interface CatchFormalParameterNode extends NamedNodeBase {
  type: SyntaxType.CatchFormalParameter;
  dimensionsNode?: DimensionsNode;
  nameNode: IdentifierNode | UnderscorePatternNode;
}

export interface CatchTypeNode extends NamedNodeBase {
  type: SyntaxType.CatchType;
}

export interface ClassBodyNode extends NamedNodeBase {
  type: SyntaxType.ClassBody;
}

export interface ClassDeclarationNode extends NamedNodeBase {
  type: SyntaxType.ClassDeclaration;
  bodyNode: ClassBodyNode;
  interfacesNode?: SuperInterfacesNode;
  nameNode: IdentifierNode;
  permitsNode?: PermitsNode;
  superclassNode?: SuperclassNode;
  type_parametersNode?: TypeParametersNode;
}

export interface ClassLiteralNode extends NamedNodeBase {
  type: SyntaxType.ClassLiteral;
}

export interface CompactConstructorDeclarationNode extends NamedNodeBase {
  type: SyntaxType.CompactConstructorDeclaration;
  bodyNode: BlockNode;
  nameNode: IdentifierNode;
}

export interface ConstantDeclarationNode extends NamedNodeBase {
  type: SyntaxType.ConstantDeclaration;
  declaratorNodes: VariableDeclaratorNode[];
  typeNode: UnannotatedTypeNode;
}

export interface ConstructorBodyNode extends NamedNodeBase {
  type: SyntaxType.ConstructorBody;
}

export interface ConstructorDeclarationNode extends NamedNodeBase {
  type: SyntaxType.ConstructorDeclaration;
  bodyNode: ConstructorBodyNode;
  nameNode: IdentifierNode;
  parametersNode: FormalParametersNode;
  type_parametersNode?: TypeParametersNode;
}

export interface ContinueStatementNode extends NamedNodeBase {
  type: SyntaxType.ContinueStatement;
}

export interface DimensionsNode extends NamedNodeBase {
  type: SyntaxType.Dimensions;
}

export interface DimensionsExprNode extends NamedNodeBase {
  type: SyntaxType.DimensionsExpr;
}

export interface DoStatementNode extends NamedNodeBase {
  type: SyntaxType.DoStatement;
  bodyNode: StatementNode;
  conditionNode: ParenthesizedExpressionNode;
}

export interface ElementValueArrayInitializerNode extends NamedNodeBase {
  type: SyntaxType.ElementValueArrayInitializer;
}

export interface ElementValuePairNode extends NamedNodeBase {
  type: SyntaxType.ElementValuePair;
  keyNode: IdentifierNode;
  valueNode:
    | AnnotationNode
    | ElementValueArrayInitializerNode
    | ExpressionNode
    | MarkerAnnotationNode;
}

export interface EnhancedForStatementNode extends NamedNodeBase {
  type: SyntaxType.EnhancedForStatement;
  bodyNode: StatementNode;
  dimensionsNode?: DimensionsNode;
  nameNode: IdentifierNode | UnderscorePatternNode;
  typeNode: UnannotatedTypeNode;
  valueNode: ExpressionNode;
}

export interface EnumBodyNode extends NamedNodeBase {
  type: SyntaxType.EnumBody;
}

export interface EnumBodyDeclarationsNode extends NamedNodeBase {
  type: SyntaxType.EnumBodyDeclarations;
}

export interface EnumConstantNode extends NamedNodeBase {
  type: SyntaxType.EnumConstant;
  argumentsNode?: ArgumentListNode;
  bodyNode?: ClassBodyNode;
  nameNode: IdentifierNode;
}

export interface EnumDeclarationNode extends NamedNodeBase {
  type: SyntaxType.EnumDeclaration;
  bodyNode: EnumBodyNode;
  interfacesNode?: SuperInterfacesNode;
  nameNode: IdentifierNode;
}

export interface ExplicitConstructorInvocationNode extends NamedNodeBase {
  type: SyntaxType.ExplicitConstructorInvocation;
  argumentsNode: ArgumentListNode;
  constructorNode: SuperNode | ThisNode;
  objectNode?: PrimaryExpressionNode;
  type_argumentsNode?: TypeArgumentsNode;
}

export interface ExportsModuleDirectiveNode extends NamedNodeBase {
  type: SyntaxType.ExportsModuleDirective;
  modulesNodes: (IdentifierNode | ScopedIdentifierNode)[];
  packageNode: IdentifierNode | ScopedIdentifierNode;
}

export interface ExpressionStatementNode extends NamedNodeBase {
  type: SyntaxType.ExpressionStatement;
}

export interface ExtendsInterfacesNode extends NamedNodeBase {
  type: SyntaxType.ExtendsInterfaces;
}

export interface FieldAccessNode extends NamedNodeBase {
  type: SyntaxType.FieldAccess;
  fieldNode: IdentifierNode | ThisNode;
  objectNode: PrimaryExpressionNode | SuperNode;
}

export interface FieldDeclarationNode extends NamedNodeBase {
  type: SyntaxType.FieldDeclaration;
  declaratorNodes: VariableDeclaratorNode[];
  typeNode: UnannotatedTypeNode;
}

export interface FinallyClauseNode extends NamedNodeBase {
  type: SyntaxType.FinallyClause;
}

export interface FloatingPointTypeNode extends NamedNodeBase {
  type: SyntaxType.FloatingPointType;
}

export interface ForStatementNode extends NamedNodeBase {
  type: SyntaxType.ForStatement;
  bodyNode: StatementNode;
  conditionNode?: ExpressionNode;
  initNodes: (ExpressionNode | LocalVariableDeclarationNode)[];
  updateNodes: ExpressionNode[];
}

export interface FormalParameterNode extends NamedNodeBase {
  type: SyntaxType.FormalParameter;
  dimensionsNode?: DimensionsNode;
  nameNode: IdentifierNode | UnderscorePatternNode;
  typeNode: UnannotatedTypeNode;
}

export interface FormalParametersNode extends NamedNodeBase {
  type: SyntaxType.FormalParameters;
}

export interface GenericTypeNode extends NamedNodeBase {
  type: SyntaxType.GenericType;
}

export interface GuardNode extends NamedNodeBase {
  type: SyntaxType.Guard;
}

export interface IfStatementNode extends NamedNodeBase {
  type: SyntaxType.IfStatement;
  alternativeNode?: StatementNode;
  conditionNode: ParenthesizedExpressionNode;
  consequenceNode: StatementNode;
}

export interface ImportDeclarationNode extends NamedNodeBase {
  type: SyntaxType.ImportDeclaration;
}

export interface InferredParametersNode extends NamedNodeBase {
  type: SyntaxType.InferredParameters;
}

export interface InstanceofExpressionNode extends NamedNodeBase {
  type: SyntaxType.InstanceofExpression;
  leftNode: ExpressionNode;
  nameNode?: IdentifierNode;
  patternNode?: RecordPatternNode;
  rightNode?: TypeNode;
}

export interface IntegralTypeNode extends NamedNodeBase {
  type: SyntaxType.IntegralType;
}

export interface InterfaceBodyNode extends NamedNodeBase {
  type: SyntaxType.InterfaceBody;
}

export interface InterfaceDeclarationNode extends NamedNodeBase {
  type: SyntaxType.InterfaceDeclaration;
  bodyNode: InterfaceBodyNode;
  nameNode: IdentifierNode;
  permitsNode?: PermitsNode;
  type_parametersNode?: TypeParametersNode;
}

export interface LabeledStatementNode extends NamedNodeBase {
  type: SyntaxType.LabeledStatement;
}

export interface LambdaExpressionNode extends NamedNodeBase {
  type: SyntaxType.LambdaExpression;
  bodyNode: BlockNode | ExpressionNode;
  parametersNode:
    | FormalParametersNode
    | IdentifierNode
    | InferredParametersNode;
}

export interface LocalVariableDeclarationNode extends NamedNodeBase {
  type: SyntaxType.LocalVariableDeclaration;
  declaratorNodes: VariableDeclaratorNode[];
  typeNode: UnannotatedTypeNode;
}

export interface MarkerAnnotationNode extends NamedNodeBase {
  type: SyntaxType.MarkerAnnotation;
  nameNode: IdentifierNode | ScopedIdentifierNode;
}

export interface MethodDeclarationNode extends NamedNodeBase {
  type: SyntaxType.MethodDeclaration;
  bodyNode?: BlockNode;
  dimensionsNode?: DimensionsNode;
  nameNode: IdentifierNode;
  parametersNode: FormalParametersNode;
  typeNode: UnannotatedTypeNode;
  type_parametersNode?: TypeParametersNode;
}

export interface MethodInvocationNode extends NamedNodeBase {
  type: SyntaxType.MethodInvocation;
  argumentsNode: ArgumentListNode;
  nameNode: IdentifierNode;
  objectNode?: PrimaryExpressionNode | SuperNode;
  type_argumentsNode?: TypeArgumentsNode;
}

export interface MethodReferenceNode extends NamedNodeBase {
  type: SyntaxType.MethodReference;
}

export interface ModifierNode extends NamedNodeBase {
  type: SyntaxType.Modifier;
}

export interface ModifiersNode extends NamedNodeBase {
  type: SyntaxType.Modifiers;
}

export interface ModuleBodyNode extends NamedNodeBase {
  type: SyntaxType.ModuleBody;
}

export interface ModuleDeclarationNode extends NamedNodeBase {
  type: SyntaxType.ModuleDeclaration;
  bodyNode: ModuleBodyNode;
  nameNode: IdentifierNode | ScopedIdentifierNode;
}

export interface MultilineStringFragmentNode extends NamedNodeBase {
  type: SyntaxType.MultilineStringFragment;
}

export interface ObjectCreationExpressionNode extends NamedNodeBase {
  type: SyntaxType.ObjectCreationExpression;
  argumentsNode: ArgumentListNode;
  typeNode: SimpleTypeNode;
  type_argumentsNode?: TypeArgumentsNode;
}

export interface OpensModuleDirectiveNode extends NamedNodeBase {
  type: SyntaxType.OpensModuleDirective;
  modulesNodes: (IdentifierNode | ScopedIdentifierNode)[];
  packageNode: IdentifierNode | ScopedIdentifierNode;
}

export interface PackageDeclarationNode extends NamedNodeBase {
  type: SyntaxType.PackageDeclaration;
}

export interface ParenthesizedExpressionNode extends NamedNodeBase {
  type: SyntaxType.ParenthesizedExpression;
}

export interface PatternNode extends NamedNodeBase {
  type: SyntaxType.Pattern;
}

export interface PermitsNode extends NamedNodeBase {
  type: SyntaxType.Permits;
}

export interface ProgramNode extends NamedNodeBase {
  type: SyntaxType.Program;
}

export interface ProvidesModuleDirectiveNode extends NamedNodeBase {
  type: SyntaxType.ProvidesModuleDirective;
  providedNode: IdentifierNode | ScopedIdentifierNode;
  providerNodes: (IdentifierNode | ScopedIdentifierNode)[];
}

export interface ReceiverParameterNode extends NamedNodeBase {
  type: SyntaxType.ReceiverParameter;
}

export interface RecordDeclarationNode extends NamedNodeBase {
  type: SyntaxType.RecordDeclaration;
  bodyNode: ClassBodyNode;
  interfacesNode?: SuperInterfacesNode;
  nameNode: IdentifierNode;
  parametersNode: FormalParametersNode;
  type_parametersNode?: TypeParametersNode;
}

export interface RecordPatternNode extends NamedNodeBase {
  type: SyntaxType.RecordPattern;
}

export interface RecordPatternBodyNode extends NamedNodeBase {
  type: SyntaxType.RecordPatternBody;
}

export interface RecordPatternComponentNode extends NamedNodeBase {
  type: SyntaxType.RecordPatternComponent;
}

export interface RequiresModifierNode extends NamedNodeBase {
  type: SyntaxType.RequiresModifier;
}

export interface RequiresModuleDirectiveNode extends NamedNodeBase {
  type: SyntaxType.RequiresModuleDirective;
  modifiersNodes: RequiresModifierNode[];
  moduleNode: IdentifierNode | ScopedIdentifierNode;
}

export interface ResourceNode extends NamedNodeBase {
  type: SyntaxType.Resource;
  dimensionsNode?: DimensionsNode;
  nameNode?: IdentifierNode | UnderscorePatternNode;
  typeNode?: UnannotatedTypeNode;
  valueNode?: ExpressionNode;
}

export interface ResourceSpecificationNode extends NamedNodeBase {
  type: SyntaxType.ResourceSpecification;
}

export interface ReturnStatementNode extends NamedNodeBase {
  type: SyntaxType.ReturnStatement;
}

export interface ScopedIdentifierNode extends NamedNodeBase {
  type: SyntaxType.ScopedIdentifier;
  nameNode: IdentifierNode;
  scopeNode: IdentifierNode | ScopedIdentifierNode;
}

export interface ScopedTypeIdentifierNode extends NamedNodeBase {
  type: SyntaxType.ScopedTypeIdentifier;
}

export interface SpreadParameterNode extends NamedNodeBase {
  type: SyntaxType.SpreadParameter;
  annotationsNodes: (AnnotationNode | MarkerAnnotationNode)[];
  modifiersNode?: ModifiersNode;
  typeNode: UnannotatedTypeNode;
}

export interface StaticInitializerNode extends NamedNodeBase {
  type: SyntaxType.StaticInitializer;
}

export interface StringInterpolationNode extends NamedNodeBase {
  type: SyntaxType.StringInterpolation;
}

export interface StringLiteralNode extends NamedNodeBase {
  type: SyntaxType.StringLiteral;
}

export interface SuperInterfacesNode extends NamedNodeBase {
  type: SyntaxType.SuperInterfaces;
}

export interface SuperclassNode extends NamedNodeBase {
  type: SyntaxType.Superclass;
}

export interface SwitchBlockNode extends NamedNodeBase {
  type: SyntaxType.SwitchBlock;
}

export interface SwitchBlockStatementGroupNode extends NamedNodeBase {
  type: SyntaxType.SwitchBlockStatementGroup;
}

export interface SwitchExpressionNode extends NamedNodeBase {
  type: SyntaxType.SwitchExpression;
  bodyNode: SwitchBlockNode;
  conditionNode: ParenthesizedExpressionNode;
}

export interface SwitchLabelNode extends NamedNodeBase {
  type: SyntaxType.SwitchLabel;
}

export interface SwitchRuleNode extends NamedNodeBase {
  type: SyntaxType.SwitchRule;
}

export interface SynchronizedStatementNode extends NamedNodeBase {
  type: SyntaxType.SynchronizedStatement;
  bodyNode: BlockNode;
}

export interface TemplateExpressionNode extends NamedNodeBase {
  type: SyntaxType.TemplateExpression;
  template_argumentNode: StringLiteralNode;
  template_processorNode: PrimaryExpressionNode;
}

export interface TernaryExpressionNode extends NamedNodeBase {
  type: SyntaxType.TernaryExpression;
  alternativeNode: ExpressionNode;
  conditionNode: ExpressionNode;
  consequenceNode: ExpressionNode;
}

export interface ThrowStatementNode extends NamedNodeBase {
  type: SyntaxType.ThrowStatement;
}

export interface ThrowsNode extends NamedNodeBase {
  type: SyntaxType.Throws;
}

export interface TryStatementNode extends NamedNodeBase {
  type: SyntaxType.TryStatement;
  bodyNode: BlockNode;
}

export interface TryWithResourcesStatementNode extends NamedNodeBase {
  type: SyntaxType.TryWithResourcesStatement;
  bodyNode: BlockNode;
  resourcesNode: ResourceSpecificationNode;
}

export interface TypeArgumentsNode extends NamedNodeBase {
  type: SyntaxType.TypeArguments;
}

export interface TypeBoundNode extends NamedNodeBase {
  type: SyntaxType.TypeBound;
}

export interface TypeListNode extends NamedNodeBase {
  type: SyntaxType.TypeList;
}

export interface TypeParameterNode extends NamedNodeBase {
  type: SyntaxType.TypeParameter;
}

export interface TypeParametersNode extends NamedNodeBase {
  type: SyntaxType.TypeParameters;
}

export interface TypePatternNode extends NamedNodeBase {
  type: SyntaxType.TypePattern;
}

export interface UnaryExpressionNode extends NamedNodeBase {
  type: SyntaxType.UnaryExpression;
  operandNode: ExpressionNode;
  operatorNode:
    | UnnamedNode<"!">
    | UnnamedNode<"+">
    | UnnamedNode<"-">
    | UnnamedNode<"~">;
}

export interface UpdateExpressionNode extends NamedNodeBase {
  type: SyntaxType.UpdateExpression;
}

export interface UsesModuleDirectiveNode extends NamedNodeBase {
  type: SyntaxType.UsesModuleDirective;
  typeNode: IdentifierNode | ScopedIdentifierNode;
}

export interface VariableDeclaratorNode extends NamedNodeBase {
  type: SyntaxType.VariableDeclarator;
  dimensionsNode?: DimensionsNode;
  nameNode: IdentifierNode | UnderscorePatternNode;
  valueNode?: ArrayInitializerNode | ExpressionNode;
}

export interface VisibilityNode extends NamedNodeBase {
  type: SyntaxType.Visibility;
}

export interface WhileStatementNode extends NamedNodeBase {
  type: SyntaxType.WhileStatement;
  bodyNode: StatementNode;
  conditionNode: ParenthesizedExpressionNode;
}

export interface WildcardNode extends NamedNodeBase {
  type: SyntaxType.Wildcard;
}

export interface YieldStatementNode extends NamedNodeBase {
  type: SyntaxType.YieldStatement;
}

export interface BinaryIntegerLiteralNode extends NamedNodeBase {
  type: SyntaxType.BinaryIntegerLiteral;
}

export interface BlockCommentNode extends NamedNodeBase {
  type: SyntaxType.BlockComment;
}

export interface BooleanTypeNode extends NamedNodeBase {
  type: SyntaxType.BooleanType;
}

export interface CharacterLiteralNode extends NamedNodeBase {
  type: SyntaxType.CharacterLiteral;
}

export interface DecimalFloatingPointLiteralNode extends NamedNodeBase {
  type: SyntaxType.DecimalFloatingPointLiteral;
}

export interface DecimalIntegerLiteralNode extends NamedNodeBase {
  type: SyntaxType.DecimalIntegerLiteral;
}

export interface EscapeSequenceNode extends NamedNodeBase {
  type: SyntaxType.EscapeSequence;
}

export interface FalseNode extends NamedNodeBase {
  type: SyntaxType.False;
}

export interface HexFloatingPointLiteralNode extends NamedNodeBase {
  type: SyntaxType.HexFloatingPointLiteral;
}

export interface HexIntegerLiteralNode extends NamedNodeBase {
  type: SyntaxType.HexIntegerLiteral;
}

export interface IdentifierNode extends NamedNodeBase {
  type: SyntaxType.Identifier;
}

export interface LineCommentNode extends NamedNodeBase {
  type: SyntaxType.LineComment;
}

export interface NullLiteralNode extends NamedNodeBase {
  type: SyntaxType.NullLiteral;
}

export interface OctalIntegerLiteralNode extends NamedNodeBase {
  type: SyntaxType.OctalIntegerLiteral;
}

export interface StringFragmentNode extends NamedNodeBase {
  type: SyntaxType.StringFragment;
}

export interface SuperNode extends NamedNodeBase {
  type: SyntaxType.Super;
}

export interface ThisNode extends NamedNodeBase {
  type: SyntaxType.This;
}

export interface TrueNode extends NamedNodeBase {
  type: SyntaxType.True;
}

export interface TypeIdentifierNode extends NamedNodeBase {
  type: SyntaxType.TypeIdentifier;
}

export interface UnderscorePatternNode extends NamedNodeBase {
  type: SyntaxType.UnderscorePattern;
}

export interface VoidTypeNode extends NamedNodeBase {
  type: SyntaxType.VoidType;
}
