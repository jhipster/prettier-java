"use strict";

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

function isPrettierIgnoreComment(comment) {
  return comment.image.match(
    /(\/\/(\s*)prettier-ignore(\s*))|(\/\*(\s*)prettier-ignore(\s*)\*\/)/gm
  );
}

function pretraitement(tokens, comments) {
  const commentsEndOffset = {};
  const commentsStartOffset = {};

  let position;
  comments.forEach(comment => {
    position = findUpperBoundToken(tokens, comment);
    const startOffset =
      position - 1 < 0 ? comment.startOffset : tokens[position - 1].endOffset;
    const endOffset =
      position == tokens.length
        ? comment.endOffset
        : tokens[position].startOffset;
    comment.extendedOffset = {
      endOffset
    };

    if (commentsEndOffset[endOffset] === undefined) {
      commentsEndOffset[endOffset] = [comment];
    } else {
      commentsEndOffset[endOffset].push(comment);
    }

    if (commentsStartOffset[startOffset] === undefined) {
      commentsStartOffset[startOffset] = [comment];
    } else {
      commentsStartOffset[startOffset].push(comment);
    }
  });

  return { commentsEndOffset, commentsStartOffset };
}

function shouldAttachTrailingComments(comment, node, parser) {
  if (isPrettierIgnoreComment(comment)) {
    return false;
  }

  const nextNode = parser.leadingComments[comment.extendedOffset.endOffset];
  if (nextNode === undefined) {
    return true;
  }

  if (comment.startLine !== node.location.endLine) {
    return false;
  }

  if (
    nextNode !== undefined &&
    comment.endLine === nextNode.location.startLine
  ) {
    return false;
  }

  return true;
}

function attachComments(tokens, comments, parser) {
  // Edge case: only comments
  if (tokens.length === 0) {
    parser.leadingComments[NaN].leadingComments = comments;
    return;
  }

  const { commentsStartOffset, commentsEndOffset } = pretraitement(
    tokens,
    comments
  );
  const commentsToAttach = new Set(comments);

  Object.keys(parser.trailingComments).forEach(endOffset => {
    if (commentsStartOffset[endOffset] !== undefined) {
      const nodeTrailingComments = commentsStartOffset[endOffset].filter(
        comment => {
          return (
            shouldAttachTrailingComments(
              comment,
              parser.trailingComments[endOffset],
              parser
            ) && commentsToAttach.has(comment)
          );
        }
      );

      if (nodeTrailingComments.length > 0) {
        parser.trailingComments[
          endOffset
        ].trailingComments = nodeTrailingComments;
      }

      nodeTrailingComments.forEach(comment => {
        commentsToAttach.delete(comment);
      });
    }
  });

  Object.keys(parser.leadingComments).forEach(startOffset => {
    if (commentsEndOffset[startOffset] !== undefined) {
      const nodeLeadingComments = commentsEndOffset[startOffset].filter(
        comment => commentsToAttach.has(comment)
      );

      parser.leadingComments[startOffset].leadingComments = nodeLeadingComments;

      // prettier ignore support
      let ignoreNode = false;
      for (let i = 0; i < nodeLeadingComments.length; i++) {
        if (isPrettierIgnoreComment(nodeLeadingComments[i])) {
          ignoreNode = true;
        }
      }

      if (ignoreNode) {
        parser.leadingComments[startOffset].ignore = true;
      }

      nodeLeadingComments.forEach(comment => {
        commentsToAttach.delete(comment);
      });
    }
  });

  attachRestCommentsToToken(tokens, commentsToAttach);
}

function attachRestCommentsToToken(tokens, commentsToAttach) {
  let currentToken = 0;
  commentsToAttach.forEach(comment => {
    // find the correct position to place the comment
    while (
      !(
        comment.startOffset > tokens[currentToken].endOffset &&
        comment.endOffset < tokens[currentToken + 1].startOffset
      )
    ) {
      currentToken++;
    }

    // attach comment to the next token by default,
    // it attaches to the current one when the comment and token is on the same line
    if (
      comment.startLine === tokens[currentToken].endLine &&
      comment.startLine !== tokens[currentToken + 1].startLine
    ) {
      if (!tokens[currentToken].trailingComments) {
        tokens[currentToken].trailingComments = [];
      }
      tokens[currentToken].trailingComments.push(comment);
    } else {
      if (!tokens[currentToken + 1].leadingComments) {
        tokens[currentToken + 1].leadingComments = [];
      }
      tokens[currentToken + 1].leadingComments.push(comment);
    }
  });
}

module.exports = {
  attachComments
};
