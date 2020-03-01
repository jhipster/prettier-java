import prettier from "prettier/standalone";
import prettierPluginJava from "prettier-plugin-java";

export const formatCode = (code, options) => {
  let formattedCode = code;
  try {
    formattedCode = prettier.format(code, {
      parser: "java",
      plugins: [prettierPluginJava],
      ...options
    });
  } catch (e) {}

  return formattedCode;
};
