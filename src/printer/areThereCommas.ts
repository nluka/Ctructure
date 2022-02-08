import TokenType from '../lexer/TokenType';

export default function areThereCommas(tokTypes: Uint8Array, index: number): boolean {
  for (let i = index + 1; i < tokTypes.length; ++i) {
    if (tokTypes[i] === TokenType.specialComma) {
      return true;
    } else if (tokTypes[i] === TokenType.specialSemicolon) {
      return false;
    }
  }
  return false;
}
