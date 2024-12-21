/**
 * This Script is used to debug the parsing of **small** code snippets.
 */
import javaParserChev from "../src/index.js";

const input = `
public class VariableTypeInference {

 int foo = 0, bar = 1;
}

`;

javaParserChev.parse(input, "compilationUnit");
