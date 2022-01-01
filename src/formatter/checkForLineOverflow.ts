import { tokenDecode } from '../lexer/tokenDecode';
import TokenType from '../lexer/TokenType';

export default function checkForLineOverflow(
  tokens: Uint32Array,
  fileContents: string,
  index: number,
  startLineIndex: number,
): boolean {
  let lineLength;
  let parenCount = 1;
  for (let i = index + 1; i < tokens.length; ++i) {
    const decodedToken = tokenDecode(tokens[i]);
    if (decodedToken[1] === TokenType.specialParenthesisRight) {
      lineLength = removeSpaces(
        fileContents.slice(startLineIndex, decodedToken[0]),
      ).length;
      --parenCount;
      if (lineLength > 80) {
        return true;
      } else if (parenCount === 0) {
        return false;
      }
    } else if (decodedToken[1] === TokenType.specialParenthesisLeft) {
      ++parenCount;
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
