import TokenType from '../lexer/TokenType';

export default function areThereCommas(
  tokenTypes: Uint8Array,
  index: number,
): boolean {
  for (let i = index + 1; i < tokenTypes.length; ++i) {
    if (tokenTypes[i] === TokenType.specialComma) {
      return true;
    } else if (tokenTypes[i] === TokenType.specialSemicolon) {
      return false;
    }
  }
  return false;
}
