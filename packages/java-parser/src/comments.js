"use strict";

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

    // attach comment to the closest token
    if (
      element.startOffset - tokens[currentToken].endOffset <
      tokens[currentToken + 1].startOffset - element.endOffset
    ) {
      if (!tokens[currentToken].hasOwnProperty("trailingComments")) {
        tokens[currentToken].trailingComments = [];
      }
      tokens[currentToken].trailingComments.push(element);
    } else {
      if (!tokens[currentToken + 1].hasOwnProperty("leadingComments")) {
        tokens[currentToken + 1].leadingComments = [];
      }
      tokens[currentToken + 1].leadingComments.push(element);
    }
  });

  return tokens;
}

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
    comment.image.match(/\/\/(\s*)prettier-ignore(\s*)/gm)
  );
}

function shouldIgnore(node, comments, ignoredNodes) {
  for (let i = 0; i < comments.length; i++) {
    if (comments[i].extendedRange.endOffset === node.location.startOffset) {
      ignoredNodes[comments[i].startOffset] = node;
      return true;
    }
  }
  return false;
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
