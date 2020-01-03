"use strict";

function hasLeadingComments(token) {
  return token.leadingComments !== undefined;
}

function hasTrailingComments(token) {
  return token.trailingComments !== undefined;
}

function hasLeadingLineComments(token) {
  return (
    token.leadingComments !== undefined &&
    token.leadingComments.length !== 0 &&
    token.leadingComments[token.leadingComments.length - 1].tokenType.name ===
      "LineComment"
  );
}

function hasTrailingLineComments(token) {
  return (
    token.trailingComments !== undefined &&
    token.trailingComments.length !== 0 &&
    token.trailingComments[token.trailingComments.length - 1].tokenType.name ===
      "LineComment"
  );
}

function hasComments(token) {
  return hasLeadingComments(token) || hasTrailingComments(token);
}

module.exports = {
  hasComments,
  hasLeadingComments,
  hasLeadingLineComments,
  hasTrailingLineComments
};
