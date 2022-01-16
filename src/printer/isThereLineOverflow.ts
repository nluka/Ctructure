import tokenDecode from '../lexer/tokenDecode';
import TokenType from '../lexer/TokenType';
import PrinterCategory from './FormatCategory';
import { Types } from './printer';

export default function isThereLineOverflow(
  fileContents: string,
  context: Types,
  tokens: Uint32Array,
  index: number,
  startLineIndex: number,
): boolean {
  if (context === PrinterCategory.array) {
    return isThereArrayOverflow(tokens, fileContents, index, startLineIndex);
  }

  if (
    context === PrinterCategory.variableDecl ||
    context === PrinterCategory.multiVariableDecl
  ) {
    return false;
  }

  if (context === TokenType.specialBracketOpening) {
    return isThereBracketOverflow(tokens, fileContents, index, startLineIndex);
  }

  return isThereParenOverflow(tokens, fileContents, index, startLineIndex);
}

function isThereArrayOverflow(
  tokens: Uint32Array,
  fileContents: string,
  tokenIndex: number,
  startLineIndex: number,
): boolean {
  let lineLength;
  let braceCount = 0;
  let whitespaceCount = 0;

  for (let i = tokenIndex; braceCount >= 0 && i < tokens.length; ++i) {
    const decodedToken = tokenDecode(tokens[i]);
    if (decodedToken[1] === TokenType.specialBraceOpening) {
      whitespaceCount += 2;
      ++braceCount;
    } else if (decodedToken[1] === TokenType.specialBraceClosing) {
      whitespaceCount += 2;
      --braceCount;
      if (braceCount === 0) {
        lineLength =
          removeSpaces(fileContents.slice(startLineIndex, decodedToken[0]))
            .length + whitespaceCount;
        if (lineLength > 80) {
          return true;
        }
        return false;
      }
    } else if (decodedToken[1] === TokenType.specialComma) {
      ++whitespaceCount;
    }
  }
  return false;
}

function isThereParenOverflow(
  tokens: Uint32Array,
  fileContents: string,
  tokenIndex: number,
  startLineIndex: number,
): boolean {
  let lineLength;
  let parenCount = 0;
  let whiteSpace = 0;

  for (let i = tokenIndex; parenCount >= 0 && i < tokens.length; ++i) {
    const decodedToken = tokenDecode(tokens[i]);
    if (decodedToken[1] === TokenType.specialParenthesisOpening) {
      ++parenCount;
    } else if (decodedToken[1] === TokenType.specialParenthesisClosing) {
      --parenCount;
      if (parenCount === 0) {
        lineLength =
          removeSpaces(fileContents.slice(startLineIndex, decodedToken[0]))
            .length + whiteSpace;
        if (lineLength > 80) {
          return true;
        }
        return false;
      }
    } else if (decodedToken[1] === TokenType.specialComma) {
      ++whiteSpace;
    } else if (decodedToken[1] >= 80 && decodedToken[1] <= 87) {
      whiteSpace += 2;
    }
  }

  return false;
}
function isThereBracketOverflow(
  tokens: Uint32Array,
  fileContents: string,
  tokenIndex: number,
  startLineIndex: number,
): boolean {
  let lineLength;
  let bracketCount = 0;
  let whiteSpace = 0;

  for (let i = tokenIndex; bracketCount >= 0 && i < tokens.length; ++i) {
    const decodedToken = tokenDecode(tokens[i]);
    if (decodedToken[1] === TokenType.specialBracketOpening) {
      ++bracketCount;
    } else if (decodedToken[1] === TokenType.specialBracketClosing) {
      --bracketCount;
      if (bracketCount === 0) {
        lineLength =
          removeSpaces(fileContents.slice(startLineIndex, decodedToken[0]))
            .length + whiteSpace;
        if (lineLength > 80) {
          return true;
        }
        return false;
      }
    } else if (decodedToken[1] === TokenType.specialComma) {
      ++whiteSpace;
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
