/**
 * This Script is used to debug the parsing of **small** code snippets.
 */
import javaParserChev from "../src/index";

const input = `
@Anno byte @Nullable ... test
`;

javaParserChev.parse(input, "variableArityParameter");
