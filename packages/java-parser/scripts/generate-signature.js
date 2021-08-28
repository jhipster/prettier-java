/* eslint-disable no-console */
"use strict";

const _ = require("lodash");
const path = require("path");
const fs = require("fs");
const JavaParser = require("../src/parser");

const parseRule = rule => {
  const children = {};

  if (rule.definition !== undefined) {
    rule.definition.forEach(definition => {
      enrichChild({ definition, children });
    });
  }

  return { name: rule.name, children };
};

const enrichChild = ({ definition, children, optional }) => {
  switch (definition.type) {
    case "NonTerminal":
    case "Terminal":
      enrichChildTerminal(definition, optional || false, children);
      break;
    case "Alternation":
    case "Repetition":
      enrichChildrenWithRepetition(definition, children);
      break;
    case "RepetitionMandatory":
      enrichChildrenWithMandatoryRepetition(definition, children);
      break;
    case "Flat":
      definition.definition.forEach(innerDefinition => {
        enrichChild({ definition: innerDefinition, optional, children });
      });
      break;
    case "Alternative":
    case "Option":
      definition.definition.forEach(innerDefinition => {
        enrichChild({ definition: innerDefinition, optional: true, children });
      });
      break;
    // TODO: add other GAST structures
    default:
      console.error(definition);
      throw new Error("Not Handled");
  }
};

const enrichChildrenWithRepetition = (rule, children) => {
  rule.definition.forEach(definition => {
    enrichChild({ definition, children, optional: true });
  });
};

const enrichChildrenWithMandatoryRepetition = (rule, children) => {
  rule.definition.forEach(definition => {
    enrichChild({ definition, children, optional: false });
  });
};

const enrichChildTerminal = (rule, optional, children) => {
  if (children[rule.name] !== undefined) {
    if (!optional) {
      children[rule.name].optional = false;
    }
  } else {
    children[rule.name] = {
      name: rule.name,
      optional,
      type: getType(rule)
    };
  }
};

const getType = rule => {
  if (rule.type === "Terminal") {
    return "IToken";
  }

  return _.upperFirst(rule.name) + "CstNode";
};

const printTypes = node => {
  const nodeCstInterface = printNode(node) + "\n\n";
  const nodeCtxInterface = printNodeCtx(node) + "\n";

  return nodeCstInterface + nodeCtxInterface;
};

const printNode = node => {
  const nodeNameUpperFirst = _.upperFirst(node.name);

  return `export interface ${nodeNameUpperFirst}CstNode extends CstNode {
  name: "${node.name}";
  children: ${nodeNameUpperFirst}Ctx;
}`;
};

const printNodeCtx = node => {
  const nodeNameUpperFirst = _.upperFirst(node.name);

  return `export type ${nodeNameUpperFirst}Ctx = {
  ${Object.values(node.children)
    .map(child => printChild(child))
    .join("\n  ")}
};`;
};

const printChild = child => {
  return `${child.name}${child.optional ? "?" : ""}: ${child.type}[];`;
};

const printBeginning = parsedNodes => {
  return `import { CstNode, ICstVisitor, IToken } from "chevrotain";

export function parse(text: string, startProduction?: string): CstNode;


export const BaseJavaCstVisitor: JavaCstVisitorConstructor<any, any>;
export const BaseJavaCstVisitorWithDefaults: JavaCstVisitorWithDefaultsConstructor<
  any,
  any
>;

export abstract class JavaCstVisitor<IN, OUT> implements ICstVisitor<IN, OUT> {
  // No need to implement these two methods
  // Generic Visit method implemented by the Chevrotain Library
  visit(cstNode: CstNode | CstNode[], param?: IN): OUT;
  validateVisitor(): void;

  ${parsedNodes.map(node => getVisitorFunction(node)).join("\n  ")}
}

interface JavaCstVisitorConstructor<IN, OUT> {
  new (): JavaCstVisitor<IN, OUT>;
}

export abstract class JavaCstVisitorWithDefaults<IN, OUT>
  implements ICstVisitor<IN, OUT> {
  // No need to implement these two methods
  // Generic Visit method implemented by the Chevrotain Library
  visit(cstNode: CstNode | CstNode[], param?: IN): OUT;
  validateVisitor(): void;

  ${parsedNodes.map(node => getVisitorFunction(node)).join("\n  ")}
}

interface JavaCstVisitorWithDefaultsConstructor<IN, OUT> {
  new (): JavaCstVisitorWithDefaults<IN, OUT>;
}
`;
};

const getVisitorFunction = node => {
  const nodeNameUpperFirst = _.upperFirst(node.name);
  return `${node.name}(ctx: ${nodeNameUpperFirst}Ctx, param?: IN): OUT;`;
};

const buildSignature = () => {
  // extract the serialized grammar.
  const parserInstance = new JavaParser([]);
  const serializedGrammar = parserInstance.getSerializedGastProductions();

  const parsedNodes = serializedGrammar.map(node => parseRule(node));

  let signatureContent = printBeginning(parsedNodes);
  signatureContent += parsedNodes.map(node => printTypes(node)).join("\n");

  const outPath = path.resolve(__dirname, "./");
  fs.writeFileSync(outPath + "/../api.d.ts", signatureContent);
};

buildSignature();
