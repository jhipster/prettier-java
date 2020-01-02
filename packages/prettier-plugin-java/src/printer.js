"use strict";
const { createPrettierDoc } = require("./cst-printer");

// eslint-disable-next-line no-unused-vars
function genericPrint(path, options, print) {
  const node = path.getValue();
  // console.log(node);
  // if (node.comments) {
  //   console.log(node.type, node.comments);
  // }

  // node["comments"] = [
  //   {
  //     ast_type: "comment",
  //     value: "// a",
  //     leading: false,
  //     trailing: true,
  //     printed: false
  //   },
  //   {
  //     ast_type: "comment",
  //     value: "// b",
  //     leading: true,
  //     trailing: false,
  //     printed: false
  //   }
  // ];

  return createPrettierDoc(node, options);
}

module.exports = genericPrint;
