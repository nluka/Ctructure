import TokenType from '../lexer/TokenType';

export default function checkForMultiVar(
  index: number,
  tokenCount: number,
  tokenTypes: Uint8Array,
) {
  let depthCount = 0;
  for (let i = index; i < tokenCount; ++i) {
    const tokenType = tokenTypes[i];
    if (
      tokenType === TokenType.specialParenthesisOpening ||
      tokenType === TokenType.specialBracketOpening
    ) {
      ++depthCount;
    } else if (
      tokenType === TokenType.specialParenthesisClosing ||
      tokenType === TokenType.specialBracketClosing
    ) {
      --depthCount;
    } else if (depthCount === 0 && tokenType === TokenType.specialComma) {
      return true;
    } else if (tokenType === TokenType.specialSemicolon) {
      return false;
    }
  }
  return false;
}
