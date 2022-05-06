import TokenType, {
  isTokenBinaryOperator,
  isTokenKeywordTypeOrTypeQualifier,
} from '../lexer/TokenType';
import { TokenTypeOverflowable } from './printer';

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
    marker:
      | TokenType.specialSemicolon
      | TokenType.specialComma
      | TokenType.specialBraceClosing,
    tokenIndex: number,
    indentationWhiteSpace: number,
  ): boolean {
    let lineLength;
    let whiteSpace = 2 + indentationWhiteSpace;
    const tokenLimit = (lineWidth * 2) / 3 + tokenIndex;

    for (let i = tokenIndex; i < tokenCount && i < tokenLimit; ++i) {
      if (tokenTypes[i] === marker) {
        lineLength =
          fileContents
            .slice(startLineIndex, tokenStartIndices[i])
            .replace(/\s/g, '').length + whiteSpace;
        if (lineLength > lineWidth) {
          return true;
        }
        return false;
      }
      if (doesTokenIncreaseWhiteSpace(tokenTypes[i])) {
        whiteSpace += 2;
      }
    }
    return true;
  }

  function checkOverflowWithEnclosure(
    overflowMarkerOpening: TokenTypeOverflowable,
    overflowMarkerClosing:
      | TokenType.specialParenthesisClosing
      | TokenType.specialBraceClosing
      | TokenType.specialBracketClosing,
    tokenIndex: number,
    indentationWhiteSpace: number,
  ): boolean {
    let lineLength;
    let overflowMarker = 0;
    let whiteSpace = 2 + indentationWhiteSpace;
    const tokenLimit = (lineWidth * 2) / 3 + tokenIndex;

    for (let i = tokenIndex; i < tokenCount && i < tokenLimit; ++i) {
      const currTokenType = tokenTypes[i];
      if (currTokenType === overflowMarkerOpening) {
        ++overflowMarker;
      } else if (currTokenType === overflowMarkerClosing) {
        --overflowMarker;
        if (overflowMarker === 0) {
          lineLength =
            fileContents
              .slice(startLineIndex, tokenStartIndices[i])
              .replace(/\s/g, '').length + whiteSpace;
          if (lineLength > lineWidth) {
            return true;
          }
          return false;
        }
      } else if (currTokenType === TokenType.specialComma) {
        ++whiteSpace;
      } else if (doesTokenIncreaseWhiteSpace(currTokenType)) {
        whiteSpace += 2;
      }
    }
    return true;
  }

  function doesTokenIncreaseWhiteSpace(type: TokenType): boolean {
    return (
      isTokenBinaryOperator(type) ||
      type === TokenType.specialComma ||
      isTokenKeywordTypeOrTypeQualifier(type)
    );
  }

  if (overflowType === TokenType.specialParenthesisOpening) {
    return checkOverflowWithEnclosure(
      TokenType.specialParenthesisOpening,
      TokenType.specialParenthesisClosing,
      i,
      indentation,
    );
  }
  if (overflowType === TokenType.specialBraceOpening) {
    return checkOverflowWithEnclosure(
      TokenType.specialBraceOpening,
      TokenType.specialBraceClosing,
      i,
      indentation,
    );
  }
  if (overflowType === TokenType.specialBracketOpening) {
    return checkOverflowWithEnclosure(
      TokenType.specialBracketOpening,
      TokenType.specialBracketClosing,
      i,
      indentation,
    );
  }
  return checkOverflowWithMarker(overflowType, i, indentation);
}
