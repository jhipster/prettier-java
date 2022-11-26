import { Doc } from "prettier";

const isEmptyDoc = (argument: Doc) => {
  return argument === "" || (Array.isArray(argument) && argument.length) === 0;
};

export default isEmptyDoc;
