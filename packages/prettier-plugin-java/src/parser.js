import javaParser from "java-parser";

export default function parse(text, parsers, opts) {
  return javaParser.parse(text, opts.entrypoint);
}
