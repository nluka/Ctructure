import TokenType from '../lexer/TokenType';

export default function findEndOfSwitch(
  decodedFile: any[],
  index: number,
): number {
  let count = 0;
  const fileLength = decodedFile.length;
  while (count >= 0) {
    const type = decodedFile[index][1];
    if (type === TokenType.specialBraceRight) {
      --count;
      if (count === 0) {
        return index;
      }
    } else if (type === TokenType.specialBraceLeft) {
      ++count;
    }
    ++index;
  }
  return index;
}
