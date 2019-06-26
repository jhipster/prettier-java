"use strict";
const _ = require("lodash");

function attachComments(tokens, comments) {
  const attachComments = [...comments];

  // edge case: when the file contains only one token (;/if no token then EOF)
  if (tokens.length === 1) {
    attachComments.forEach(comment => {
      if (comment.endOffset < tokens[0].startOffset) {
        if (!tokens[0].leadingComments) {
          tokens[0].leadingComments = [];
        }
        tokens[0].leadingComments.push(comment);
      } else {
        if (!tokens[0].trailingComments) {
          tokens[0].trailingComments = [];
        }
        tokens[0].trailingComments.push(comment);
      }
    });
    return tokens;
  }

  // edge case: when the file start with comments, it attaches as leadingComments to the first token
  const firstToken = tokens[0];
  const headComments = [];
  while (
    attachComments.length > 0 &&
    attachComments[0].endOffset < firstToken.startOffset
  ) {
    headComments.push(attachComments[0]);
    attachComments.splice(0, 1);
  }

  if (headComments.length > 0) {
    firstToken.leadingComments = headComments;
  }

  // edge case: when the file end with comments, it attaches as trailingComments to the last token
  const lastToken = tokens[tokens.length - 1];
  const tailComments = [];
  while (
    attachComments.length > 0 &&
    attachComments[attachComments.length - 1].startOffset > lastToken.endOffset
  ) {
    tailComments.push(attachComments[attachComments.length - 1]);
    attachComments.splice(attachComments.length - 1, 1);
  }

  if (tailComments.length > 0) {
    lastToken.trailingComments = tailComments.reverse();
  }

  let currentToken = 0;
  attachComments.forEach(element => {
    // find the correct position to place the comment
    while (
      !(
        element.startOffset > tokens[currentToken].endOffset &&
        element.endOffset < tokens[currentToken + 1].startOffset
      )
    ) {
      currentToken++;
    }

    // attach comment to the next token by default,
    // it attaches to the current one when the comment and token is on the same line
    if (
      element.startLine === tokens[currentToken].endLine &&
      element.startLine !== tokens[currentToken + 1].startLine
    ) {
      if (!tokens[currentToken].trailingComments) {
        tokens[currentToken].trailingComments = [];
      }
      tokens[currentToken].trailingComments.push(element);
    } else {
      if (!tokens[currentToken + 1].leadingComments) {
        tokens[currentToken + 1].leadingComments = [];
      }
      tokens[currentToken + 1].leadingComments.push(element);
    }
  });

  return tokens;
}

/**
 * Search where is the position of the comment in the token array by
 * using dichotomic search.
 * @param {*} tokens ordered array of tokens
 * @param {*} comment comment token
 * @return the position of the token next to the comment
 */
function findUpperBoundToken(tokens, comment) {
  let diff;
  let i;
  let current;

  let len = tokens.length;
  i = 0;

  while (len) {
    diff = len >>> 1;
    current = i + diff;
    if (tokens[current].startOffset > comment.startOffset) {
      len = diff;
    } else {
      i = current + 1;
      len -= diff + 1;
    }
  }
  return i;
}

/**
 * Extends each comments offsets to the left and the right in order to match the
 * previous and next token offset. This allow to directly match the prettier-ignore
 * comment to the correct CSTNode.
 * @param {*} tokens ordered array of tokens
 * @param {*} comments array of prettier-ignore comments
 * @return prettier-ignore comment array with extended location
 */
function extendCommentRange(tokens, comments) {
  const ignoreComments = [...comments];
  let position;
  ignoreComments.forEach(comment => {
    position = findUpperBoundToken(tokens, comment);
    comment.extendedRange = {};
    comment.extendedRange.startOffset =
      position - 1 < 0 ? comment.startOffset : tokens[position - 1].endOffset;
    comment.extendedRange.endOffset =
      position == tokens.length
        ? comment.endOffset
        : tokens[position].startOffset;
  });
  return ignoreComments;
}

function filterPrettierIgnore(comments) {
  return [...comments].filter(comment =>
    comment.image.match(
      /(\/\/(\s*)prettier-ignore(\s*))|(\/\*(\s*)prettier-ignore(\s*)\*\/)/gm
    )
  );
}

function shouldIgnore(node, comments, ignoredNodes) {
  const matchingComment = _.find(
    comments,
    comment => comment.extendedRange.endOffset === node.location.startOffset
  );
  if (matchingComment) {
    ignoredNodes[matchingComment.startOffset] = node;
  }
}

function attachIgnoreNodes(ignoreComments, ignoredNodes) {
  ignoreComments.forEach(comment => {
    if (ignoredNodes[comment.startOffset]) {
      ignoredNodes[comment.startOffset].ignore = true;
    }
  });
}

function ignoredComments(tokens, comments) {
  return extendCommentRange(tokens, filterPrettierIgnore(comments));
}

module.exports = {
  attachComments,
  shouldIgnore,
  ignoredComments,
  attachIgnoreNodes
};
