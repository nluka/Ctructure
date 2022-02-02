import TokenType, { isTokenBinaryOperator } from '../lexer/TokenType';
import PrinterCategory from './PrinterCategory';

export type OverflowableContext =
  | PrinterCategory.array
  | PrinterCategory.variableDecl
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
  if (context === PrinterCategory.variableDecl) {
    return false;
  }

  if (context === PrinterCategory.array) {
    return overflowArray(
      TokenType.specialBraceOpening,
      TokenType.specialBraceClosing,
      tokenStartIndices,
      tokenTypes,
      fileContents,
      index,
      startLineIndex,
      whiteSpace,
    );
  }

  if (context === TokenType.specialSemicolon) {
    return overflowSemicolon(
      tokenStartIndices,
      tokenTypes,
      fileContents,
      index,
      startLineIndex,
    );
  }

  if (context === TokenType.specialBracketOpening) {
    return overflowBracket(
      tokenStartIndices,
      tokenTypes,
      fileContents,
      index,
      startLineIndex,
    );
  }

  return overflowParen(
    tokenStartIndices,
    tokenTypes,
    fileContents,
    index,
    startLineIndex,
    whiteSpace,
  );

  // if (context === PrinterCategory.variableDecl) {
  //   return false;
  // }

  // if (
  //   context === TokenType.operatorBinaryAssignmentDirect ||
  //   context === PrinterCategory.multiVariableDecl
  // ) {
  //   return overflowSemicolon(
  //     tokenStartIndices,
  //     tokenTypes,
  //     fileContents,
  //     index,
  //     startLineIndex,
  //   );
  // }

  // function overflowCaller(
  //   overflowMarkerOpening: OverflowableContext,
  //   overflowMarkerClosing: OverflowableContext,
  // ) {
  //   return checkOverflow(
  //     overflowMarkerOpening,
  //     overflowMarkerClosing,
  //     tokenStartIndices,
  //     tokenTypes,
  //     fileContents,
  //     index,
  //     startLineIndex,
  //     whiteSpace,
  //   );
  // }

  // if (context === TokenType.specialBraceOpening)
  //   return overflowCaller(
  //     TokenType.specialBraceOpening,
  //     TokenType.specialBraceClosing,
  //   );

  // if (context === TokenType.specialBracketOpening)
  //   return overflowCaller(
  //     TokenType.specialBracketOpening,
  //     TokenType.specialBracketClosing,
  //   );

  // return overflowCaller(
  //   TokenType.specialParenthesisOpening,
  //   TokenType.specialParenthesisClosing,
  // );
}

function overflowArray(
  overflowMarkerOpening: OverflowableContext,
  overflowMarkerClosing: ClosingMarkers,
  tokenStartIndices: Uint32Array,
  tokenTypes: Uint8Array,
  fileContents: string,
  tokenIndex: number,
  startLineIndex: number,
  whiteSpace: number,
): boolean {
  let lineLength;
  let braceCount = 0;
  for (let i = tokenIndex; braceCount >= 0 && i < tokenTypes.length; ++i) {
    const currTokenType = tokenTypes[i];
    if (currTokenType === overflowMarkerOpening) {
      whiteSpace += 2;
      ++braceCount;
    } else if (currTokenType === overflowMarkerClosing) {
      whiteSpace += 2;
      --braceCount;
      if (braceCount === 0) {
        lineLength =
          removeSpaces(fileContents.slice(startLineIndex, tokenStartIndices[i]))
            .length + whiteSpace;
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

function overflowParen(
  tokenStartIndices: Uint32Array,
  tokenTypes: Uint8Array,
  fileContents: string,
  tokenIndex: number,
  startLineIndex: number,
  whiteSpace: number,
): boolean {
  let lineLength;
  let parenCount = 0;

  for (let i = tokenIndex; parenCount >= 0 && i < tokenTypes.length; ++i) {
    if (tokenTypes[i] === TokenType.specialParenthesisOpening) {
      ++parenCount;
    } else if (tokenTypes[i] === TokenType.specialParenthesisClosing) {
      --parenCount;
      if (parenCount === 0) {
        lineLength =
          removeSpaces(fileContents.slice(startLineIndex, tokenStartIndices[i]))
            .length + whiteSpace;
        if (lineLength > 80) {
          return true;
        }
        return false;
      }
    } else if (tokenTypes[i] === TokenType.specialComma) {
      ++whiteSpace;
    } else if (tokenTypes[i] >= 80 && tokenTypes[i] <= 87) {
      whiteSpace += 2;
    }
  }

  return false;
}

function overflowBracket(
  tokenStartIndices: Uint32Array,
  tokenTypes: Uint8Array,
  fileContents: string,
  tokenIndex: number,
  startLineIndex: number,
): boolean {
  let lineLength;
  let bracketCount = 0;
  let whiteSpace = 0;

  for (let i = tokenIndex; bracketCount >= 0 && i < tokenTypes.length; ++i) {
    if (tokenTypes[i] === TokenType.specialBracketOpening) {
      ++bracketCount;
    } else if (tokenTypes[i] === TokenType.specialBracketClosing) {
      --bracketCount;
      if (bracketCount === 0) {
        lineLength =
          removeSpaces(fileContents.slice(startLineIndex, tokenStartIndices[i]))
            .length + whiteSpace;
        if (lineLength > 80) {
          return true;
        }
        return false;
      }
    } else if (tokenTypes[i] === TokenType.specialComma) {
      ++whiteSpace;
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
