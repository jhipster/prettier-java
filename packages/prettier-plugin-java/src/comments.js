"use strict";
const { concat } = require("./printers/prettier-builder");
const { hardline } = require("prettier").doc.builders;

function processComments(ctx, value) {
  if (!Array.isArray(ctx)) {
    return processComentsOnNode(ctx, value);
  }

  if (ctx.length === 1) {
    return processComentsOnNode(ctx[0], value);
  }

  return concat(
    ctx.map(elt => {
      return processComentsOnNode(elt, value);
    })
  );
}

function processComentsOnNode(node, value) {
  const arr = [];
  if (Object.prototype.hasOwnProperty.call(node, "leadingComments")) {
    node.leadingComments.forEach(element => {
      if (element.startLine !== node.location.startLine) {
        arr.push(concat(formatComment(element)));
        arr.push(hardline);
      } else {
        arr.push(concat(formatComment(element)));
      }
    });
  }

  arr.push(value);

  if (Object.prototype.hasOwnProperty.call(node, "trailingComments")) {
    if (node.trailingComments[0].startLine !== node.location.startLine) {
      arr.push(hardline);
    }
    node.trailingComments.forEach(element => {
      if (element.startLine !== node.location.startLine) {
        arr.push(concat(formatComment(element)));
        arr.push(hardline);
      } else if (element.tokenType.tokenName === "LineComment") {
        // Do not add extra space in case of empty statement
        const separator = " ";
        arr.push(concat([separator, concat(formatComment(element))]));
      } else {
        arr.push(concat(formatComment(element)));
      }
    });
    if (
      node.trailingComments[node.trailingComments.length - 1].startLine !==
      node.location.startLine
    ) {
      arr.pop();
    }
  }

  return arr.length === 1 ? value : concat(arr);
}

function formatComment(comment) {
  const res = [];
  comment.image.split("\n").forEach(l => {
    if (l.match(/(\s+)(\*)(.*)/gm) && !l.match(/(\/)(\*)(.*)(\*)(\/)/gm)) {
      res.push(" " + l.trim());
    } else {
      res.push(l);
    }
    res.push(hardline);
  });
  if (res[res.length - 1] === hardline) {
    res.pop();
  }
  return res;
}

module.exports = {
  processComments
};
