import TokenType, { isTokenBinaryOperator } from '../lexer/TokenType';
import { ContextTypes } from './printer';
import PrinterCategory from './PrinterCategory';

export default function checkForLineOverflow(
  fileContents: string,
  context: ContextTypes,
  tokenStartIndices: Uint32Array,
  tokenTypes: Uint8Array,
  index: number,
  startLineIndex: number,
  blockLevel: number,
): boolean {
  if (
    context === PrinterCategory.variableDecl ||
    context === PrinterCategory.multiVariableDecl
  ) {
    return false;
  }

  if (context === PrinterCategory.array) {
    return isThereArrayOverflow(
      tokenStartIndices,
      tokenTypes,
      fileContents,
      index,
      startLineIndex,
    );
  }

  if (context === TokenType.operatorBinaryAssignmentDirect) {
    return isThereAssignmentOverflow(
      tokenStartIndices,
      tokenTypes,
      fileContents,
      index,
      startLineIndex,
    );
  }

  if (context === TokenType.specialBracketOpening) {
    return isThereBracketOverflow(
      tokenStartIndices,
      tokenTypes,
      fileContents,
      index,
      startLineIndex,
    );
  }

  return isThereParenOverflow(
    tokenStartIndices,
    tokenTypes,
    fileContents,
    index,
    startLineIndex,
    blockLevel,
  );
}

function isThereArrayOverflow(
  tokenStartIndices: Uint32Array,
  tokenTypes: Uint8Array,
  fileContents: string,
  tokenIndex: number,
  startLineIndex: number,
): boolean {
  let lineLength;
  let braceCount = 0;
  let whitespaceCount = 0;

  for (let i = tokenIndex; braceCount >= 0 && i < tokenTypes.length; ++i) {
    if (tokenTypes[i] === TokenType.specialBraceOpening) {
      whitespaceCount += 2;
      ++braceCount;
    } else if (tokenTypes[i] === TokenType.specialBraceClosing) {
      whitespaceCount += 2;
      --braceCount;
      if (braceCount === 0) {
        lineLength =
          removeSpaces(fileContents.slice(startLineIndex, tokenStartIndices[i]))
            .length + whitespaceCount;
        if (lineLength > 80) {
          return true;
        }
        return false;
      }
    } else if (tokenTypes[i] === TokenType.specialComma) {
      ++whitespaceCount;
    }
  }

  return false;
}

function isThereParenOverflow(
  tokenStartIndices: Uint32Array,
  tokenTypes: Uint8Array,
  fileContents: string,
  tokenIndex: number,
  startLineIndex: number,
  blockLevel: number,
): boolean {
  let lineLength;
  let parenCount = 0;
  let whiteSpace = blockLevel * 2;

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

function isThereBracketOverflow(
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

function isThereAssignmentOverflow(
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
