import TokenType from '../lexer/TokenType';

export default function findEnd(decodedFile: any[], index: number): number {
  let count = 1;
  const fileLength = decodedFile.length;
  while (count > 0 && index++ < fileLength) {
    const type = decodedFile[index][1];
    if (type === TokenType.specialBraceRight) {
      --count;
    } else if (type === TokenType.specialBraceLeft) {
      ++count;
    }
  }
  return index;
}
