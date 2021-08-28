import { CstElement, IToken } from "java-parser";

type LeadingComments<T extends CstElement> = T & {
  leadingComments: IToken[];
};

type TrailingComments<T extends CstElement> = T & {
  trailingComments: IToken[];
};

export function hasLeadingComments(
  token: CstElement
): token is LeadingComments<CstElement> {
  return token.leadingComments !== undefined;
}

export function hasTrailingComments(
  token: CstElement
): token is TrailingComments<CstElement> {
  return token.trailingComments !== undefined;
}

export function hasLeadingLineComments(
  token: CstElement
): token is LeadingComments<CstElement> {
  return (
    token.leadingComments !== undefined &&
    token.leadingComments.length !== 0 &&
    token.leadingComments[token.leadingComments.length - 1].tokenType.name ===
      "LineComment"
  );
}

export function hasTrailingLineComments(
  token: CstElement
): token is TrailingComments<CstElement> {
  return (
    token.trailingComments !== undefined &&
    token.trailingComments.length !== 0 &&
    token.trailingComments[token.trailingComments.length - 1].tokenType.name ===
      "LineComment"
  );
}

export function hasComments(token: CstElement) {
  return hasLeadingComments(token) || hasTrailingComments(token);
}
