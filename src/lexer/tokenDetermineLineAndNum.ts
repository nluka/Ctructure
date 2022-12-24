import Tokenizer from './Tokenizer';

/**
 * Determines the line and numeric position of a token in `fileContents`.
 * For example, if the token resides on the fourth line and is the third
 * token on that line, [4, 3] would be returned.
 * @param fileContents The contents of the file the token exists in.
 * @param tokStartPos The index of the token's first character in `fileContents`.
 */
export default function tokenDetermineLineAndNum(
  fileContents: string,
  tokStartPos: number,
): { lineNum: number; tokenNum: number } {
  let lineNum = 1;
  for (let i = 0; i < tokStartPos; ++i) {
    if (fileContents.charAt(i) === '\n') {
      ++lineNum;
    }
  }

  let firstNewlineBehindStartPos = 0;
  for (let i = tokStartPos - 1; i > 0; --i) {
    if (fileContents.charAt(i) === '\n') {
      firstNewlineBehindStartPos = i;
      break;
    }
  }

  const line = fileContents.slice(firstNewlineBehindStartPos + 1, tokStartPos);
  const tokenizer = new Tokenizer(line);
  let tokenNum = 1;
  while (tokenizer.extractNextToken() !== null) {
    ++tokenNum;
  }

  return { lineNum, tokenNum };
}
