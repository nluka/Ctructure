import tokenDetermineCategory from '../lexer/tokenDetermineCategory';
import tokenFindEndPosition from '../lexer/tokenFindEndPosition';
import TokenType, { isTokenKeywordTypeOrTypeQualifier } from '../lexer/TokenType';
import { TokenTypeOverflowable } from './printer';

function pairingClosingEnclosure(
  type: TokenType,
):
  | TokenType.specialParenthesisClosing
  | TokenType.specialBracketClosing
  | TokenType.specialBraceClosing {
  if (type === TokenType.specialParenthesisOpening) {
    return TokenType.specialParenthesisClosing;
  }
  if (type === TokenType.specialBracketOpening) {
    return TokenType.specialBracketClosing;
  }
  return TokenType.specialBraceClosing;
}

function charsOfWhiteSpaceInConstantString(fileContents: string, startPos: number): number {
  const constantString = fileContents.slice(
    startPos,
    tokenFindEndPosition(fileContents, startPos, tokenDetermineCategory(fileContents, startPos)) +
      1,
  );
  return constantString.split(' ').length - 1;
}

function whiteSpaceForFormatting(fileContents: string, tokenType: TokenType, startIndex: number) {
  let whiteSpace = 0;
  if (tokenType === TokenType.specialComma || tokenType === TokenType.specialSemicolon) {
    whiteSpace = 1;
  } else if (
    (tokenType >= TokenType.operatorBinaryArithmeticAddition &&
      tokenType < TokenType.operatorMemberSelectionDirect) ||
    isTokenKeywordTypeOrTypeQualifier(tokenType)
  ) {
    whiteSpace = 2;
  } else if (tokenType === TokenType.constantString) {
    // white space in constant strings gets removed when calculating line length, so we add it back here.
    whiteSpace = charsOfWhiteSpaceInConstantString(fileContents, startIndex);
  }
  return whiteSpace;
}

export default function isThereLineOverflow(
  i: number,
  overflowType: TokenTypeOverflowable,
  lineWidth: number,
  tokenCount: number,
  indentation: number,
  fileContents: string,
  startLineIndex: number,
  tokenTypes: Uint8Array,
  tokenStartIndices: Uint32Array,
): boolean {
  function checkOverflowWithMarker(
    marker: TokenType.specialSemicolon | TokenType.specialComma | TokenType.specialBraceClosing,
    tokenIndex: number,
  ): boolean {
    for (let i = tokenIndex; i < tokenCount && i < tokenLimit; ++i) {
      const currTokenType = tokenTypes[i];
      if (currTokenType === marker) {
        const lineLength =
          fileContents.slice(startLineIndex, tokenStartIndices[i] + 1).replace(/\s/g, '').length +
          whiteSpace;
        if (lineLength > lineWidth) {
          return true;
        }
        return false;
      } else {
        whiteSpace += whiteSpaceForFormatting(fileContents, currTokenType, tokenStartIndices[i]);
      }
    }
    return true;
  }

  function checkOverflowWithEnclosure(
    overflowMarkerOpening:
      | TokenType.specialParenthesisOpening
      | TokenType.specialBraceOpening
      | TokenType.specialBracketOpening,
    overflowMarkerClosing:
      | TokenType.specialParenthesisClosing
      | TokenType.specialBraceClosing
      | TokenType.specialBracketClosing,
    tokenIndex: number,
  ): boolean {
    let prevTokenType: TokenType | null = null;
    let overflowMarker = 0;
    for (let i = tokenIndex; i < tokenCount && i < tokenLimit; ++i) {
      const currTokenType = tokenTypes[i];
      if (currTokenType === overflowMarkerOpening) {
        ++overflowMarker;
      } else if (currTokenType === overflowMarkerClosing) {
        --overflowMarker;
        if (overflowMarker === 0) {
          const lineLength =
            fileContents.slice(startLineIndex, tokenStartIndices[i]).replace(/\s/g, '').length +
            whiteSpace;
          if (lineLength > lineWidth) {
            return true;
          }
          return false;
        }
      } else {
        whiteSpace += whiteSpaceForFormatting(fileContents, currTokenType, tokenStartIndices[i]);
        if (prevTokenType === TokenType.constantString && currTokenType === TokenType.constantString){
          return true;
        }
      }
      if (currTokenType !== TokenType.newline) {
        prevTokenType = currTokenType;
      }
    }
    return true;
  }

  const tokenLimit = (lineWidth * 2) / 3 + i;
  let whiteSpace = 2 + indentation;
  if (
    overflowType === TokenType.specialParenthesisOpening ||
    overflowType === TokenType.specialBraceOpening ||
    overflowType === TokenType.specialBracketOpening
  ) {
    return checkOverflowWithEnclosure(overflowType, pairingClosingEnclosure(overflowType), i);
  }
  return checkOverflowWithMarker(overflowType, i);
}
