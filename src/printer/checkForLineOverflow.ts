import TokenType, { isTokenBinaryOperator } from '../lexer/TokenType';

export type OverflowableContext =
  | TokenType.specialSemicolon
  | TokenType.specialBracketOpening
  | TokenType.specialBraceOpening
  | TokenType.specialParenthesisOpening;

type ClosingMarkers =
  | TokenType.specialParenthesisClosing
  | TokenType.specialBraceClosing
  | TokenType.specialBracketClosing;

export default function checkForLineOverflow(
  fileContents: string,
  context: OverflowableContext,
  tokenStartIndices: Uint32Array,
  tokenTypes: Uint8Array,
  index: number,
  startLineIndex: number,
  whiteSpace: number,
): boolean {
  if (context === TokenType.specialSemicolon) {
    return overflowSemicolon(
      tokenStartIndices,
      tokenTypes,
      fileContents,
      index,
      startLineIndex,
    );
  }

  function overflowCaller(
    overflowMarkerOpening: OverflowableContext,
    overflowMarkerClosing: ClosingMarkers,
  ) {
    return checkOverflow(
      overflowMarkerOpening,
      overflowMarkerClosing,
      tokenStartIndices,
      tokenTypes,
      fileContents,
      index,
      startLineIndex,
      whiteSpace,
    );
  }

  if (context === TokenType.specialBraceOpening)
    return overflowCaller(
      TokenType.specialBraceOpening,
      TokenType.specialBraceClosing,
    );

  if (context === TokenType.specialBracketOpening)
    return overflowCaller(
      TokenType.specialBracketOpening,
      TokenType.specialBracketClosing,
    );

  return overflowCaller(
    TokenType.specialParenthesisOpening,
    TokenType.specialParenthesisClosing,
  );
}

function checkOverflow(
  overflowMarkerOpening: OverflowableContext,
  overflowMarkerClosing: ClosingMarkers,
  tokenStartIndices: Uint32Array,
  tokenTypes: Uint8Array,
  fileContents: string,
  tokenIndex: number,
  startLineIndex: number,
  indentation: number,
): boolean {
  let lineLength;
  let overflowMarker = 0;
  let whiteSpace = 0;
  for (let i = tokenIndex; overflowMarker >= 0 && i < tokenTypes.length; ++i) {
    const currTokenType = tokenTypes[i];
    if (currTokenType === overflowMarkerOpening) {
      ++overflowMarker;
    } else if (currTokenType === overflowMarkerClosing) {
      --overflowMarker;
      if (overflowMarker === 0) {
        lineLength =
          removeSpaces(fileContents.slice(startLineIndex, tokenStartIndices[i]))
            .length +
          whiteSpace +
          indentation;
        if (lineLength > 80) {
          return true;
        }
        return false;
      }
    } else if (currTokenType === TokenType.specialComma) {
      ++whiteSpace;
    } else if (isTokenBinaryOperator(currTokenType)) {
      whiteSpace += 2;
    }
  }

  return false;
}

function overflowSemicolon(
  tokenStartIndices: Uint32Array,
  tokenTypes: Uint8Array,
  fileContents: string,
  tokenIndex: number,
  startLineIndex: number,
): boolean {
  let lineLength;
  let bracketCount = 0;
  let whiteSpace = 2;

  for (let i = tokenIndex; bracketCount >= 0 && i < tokenTypes.length; ++i) {
    if (tokenTypes[i] === TokenType.specialSemicolon) {
      lineLength =
        removeSpaces(fileContents.slice(startLineIndex, tokenStartIndices[i]))
          .length + whiteSpace;
      if (lineLength > 80) {
        return true;
      }
      return false;
    }
    if (isTokenBinaryOperator(tokenTypes[i])) {
      whiteSpace += 2;
    }
  }

  return false;
}

function removeSpaces(str: string) {
  let inside = 0;
  return str.replace(/ +|"/g, (m) =>
    m === '"' ? ((inside ^= 1), '"') : inside ? m : '',
  );
}
