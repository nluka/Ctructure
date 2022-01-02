import { tokenDecode } from '../lexer/tokenDecode';
import TokenType from '../lexer/TokenType';

export default function checkForLineOverflow(
  tokens: Uint32Array,
  fileContents: string,
  index: number,
  startLineIndex: number,
): [boolean, number] {
  let lineLength;
  let parenCount = 0;
  for (let i = index; i < tokens.length; ++i) {
    const decodedToken = tokenDecode(tokens[i]);
    if (decodedToken[1] === TokenType.specialParenthesisClosing) {
      lineLength = removeSpaces(
        fileContents.slice(startLineIndex, decodedToken[0]),
      ).length;
      --parenCount;
      if (lineLength > 80) {
        return [true, i];
      } else if (parenCount === 0) {
        return [false, i];
      }
    } else if (decodedToken[1] === TokenType.specialParenthesisOpening) {
      ++parenCount;
    }
  }
  return [false, 0];
}

function removeSpaces(str: string) {
  let inside = 0;
  return str.replace(/ +|"/g, (m) =>
    m === '"' ? ((inside ^= 1), '"') : inside ? m : '',
  );
}
