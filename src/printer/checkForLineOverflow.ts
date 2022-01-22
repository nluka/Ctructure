import tokenDecode from '../lexer/tokenDecode';
import TokenType, { isTokenBinaryOperator } from '../lexer/TokenType';
import PrinterCategory from './PrinterCategory';
import { ContextTypes } from './printer';

export default function checkForLineOverflow(
  fileContents: string,
  context: ContextTypes,
  indexArray: number[],
  typeArray: TokenType[],
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
      indexArray,
      typeArray,
      fileContents,
      index,
      startLineIndex,
    );
  }

  if (context === TokenType.operatorBinaryAssignmentDirect) {
    return isThereAssignmentOverflow(
      indexArray,
      typeArray,
      fileContents,
      index,
      startLineIndex,
    );
  }

  if (context === TokenType.specialBracketOpening) {
    return isThereBracketOverflow(
      indexArray,
      typeArray,
      fileContents,
      index,
      startLineIndex,
    );
  }

  return isThereParenOverflow(
    indexArray,
    typeArray,
    fileContents,
    index,
    startLineIndex,
    blockLevel,
  );
}

function isThereArrayOverflow(
  indexArray: number[],
  typeArray: TokenType[],
  fileContents: string,
  tokenIndex: number,
  startLineIndex: number,
): boolean {
  let lineLength;
  let braceCount = 0;
  let whitespaceCount = 0;

  for (let i = tokenIndex; braceCount >= 0 && i < typeArray.length; ++i) {
    if (typeArray[i] === TokenType.specialBraceOpening) {
      whitespaceCount += 2;
      ++braceCount;
    } else if (typeArray[i] === TokenType.specialBraceClosing) {
      whitespaceCount += 2;
      --braceCount;
      if (braceCount === 0) {
        lineLength =
          removeSpaces(fileContents.slice(startLineIndex, indexArray[i]))
            .length + whitespaceCount;
        if (lineLength > 80) {
          return true;
        }
        return false;
      }
    } else if (typeArray[i] === TokenType.specialComma) {
      ++whitespaceCount;
    }
  }

  return false;
}

function isThereParenOverflow(
  indexArray: number[],
  typeArray: TokenType[],
  fileContents: string,
  tokenIndex: number,
  startLineIndex: number,
  blockLevel: number,
): boolean {
  let lineLength;
  let parenCount = 0;
  let whiteSpace = blockLevel * 2;

  for (let i = tokenIndex; parenCount >= 0 && i < typeArray.length; ++i) {
    if (typeArray[i] === TokenType.specialParenthesisOpening) {
      ++parenCount;
    } else if (typeArray[i] === TokenType.specialParenthesisClosing) {
      --parenCount;
      if (parenCount === 0) {
        lineLength =
          removeSpaces(fileContents.slice(startLineIndex, indexArray[i]))
            .length + whiteSpace;
        if (lineLength > 80) {
          return true;
        }
        return false;
      }
    } else if (typeArray[i] === TokenType.specialComma) {
      ++whiteSpace;
    } else if (typeArray[i] >= 80 && typeArray[i] <= 87) {
      whiteSpace += 2;
    }
  }

  return false;
}

function isThereBracketOverflow(
  indexArray: number[],
  typeArray: TokenType[],
  fileContents: string,
  tokenIndex: number,
  startLineIndex: number,
): boolean {
  let lineLength;
  let bracketCount = 0;
  let whiteSpace = 0;

  for (let i = tokenIndex; bracketCount >= 0 && i < typeArray.length; ++i) {
    if (typeArray[i] === TokenType.specialBracketOpening) {
      ++bracketCount;
    } else if (typeArray[i] === TokenType.specialBracketClosing) {
      --bracketCount;
      if (bracketCount === 0) {
        lineLength =
          removeSpaces(fileContents.slice(startLineIndex, indexArray[i]))
            .length + whiteSpace;
        if (lineLength > 80) {
          return true;
        }
        return false;
      }
    } else if (typeArray[i] === TokenType.specialComma) {
      ++whiteSpace;
    }
  }

  return false;
}

function isThereAssignmentOverflow(
  indexArray: number[],
  typeArray: TokenType[],
  fileContents: string,
  tokenIndex: number,
  startLineIndex: number,
): boolean {
  let lineLength;
  let bracketCount = 0;
  let whiteSpace = 2;

  for (let i = tokenIndex; bracketCount >= 0 && i < typeArray.length; ++i) {
    if (typeArray[i] === TokenType.specialSemicolon) {
      lineLength =
        removeSpaces(fileContents.slice(startLineIndex, indexArray[i])).length +
        whiteSpace;
      if (lineLength > 80) {
        return true;
      }
      return false;
    }
    if (isTokenBinaryOperator(typeArray[i])) {
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
