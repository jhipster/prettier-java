[![npm](https://img.shields.io/npm/v/java-parser.svg)](https://www.npmjs.com/package/java-parser)

# java-parser

** This Project is in Alpha Status **

A Java Parser implemented in JavaScript using the [Chevrotain Parsing ToolKit](https://github.com/SAP/chevrotain).
It outputs a **C**oncrete **S**yntax **T**ree, rather than an **A**bstract **S**yntax **T**ree.

- [On the Difference between a CST and an AST](https://stackoverflow.com/questions/1888854/what-is-the-difference-between-an-abstract-syntax-tree-and-a-concrete-syntax-tre)

Currently the main focus of this project is to be used in implementing a prettier Java plugin.
But it could also be used as the basis for other Java related tools in the JavaScript ecosystem.

## Installation

- **npm**: `npm install chevrotain --save-dev`

## Usage

```javascript
const { parse } = require("java-parser");
const javaText = `
public class HelloWorldExample{
  public static void main(String args[]){
    System.out.println("Hello World !");
  }
}
`;

const cst = parse(javaText);
// explore the CST
```
