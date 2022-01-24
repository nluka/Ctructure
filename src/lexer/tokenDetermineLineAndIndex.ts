import Tokenizer from './Tokenizer';

/**
 * Determines the line and index of a token within `fileContents`. For example, if the token
 * resides on the fourth line and is the third token on that line, [4, 2] would be returned.
 * @param fileContents The contents of the file the token exists in.
 * @param tokenStartIndex The index of the token's first character within `fileContents`.
 */
export default function tokenDetermineLineAndIndex(
  fileContents: string,
  tokenStartIndex: number,
): { lineNum: number; indexOnLine: number } {
  let lineNum = 1;
  for (let i = 0; i < tokenStartIndex - 1; ++i) {
    if (fileContents.charAt(i) === '\n') {
      ++lineNum;
    }
  }

  let firstNewlineBehindStartIndex = 0;
  for (let i = tokenStartIndex - 1; i > 0; --i) {
    if (fileContents.charAt(i) === '\n') {
      firstNewlineBehindStartIndex = i;
      break;
    }
  }

  const line = fileContents.slice(
    firstNewlineBehindStartIndex + 1,
    tokenStartIndex,
  );
  const tokenizer = new Tokenizer(line);
  let indexOnLine = 0;
  while (tokenizer.extractNextToken() !== null) {
    ++indexOnLine;
  }

  return { lineNum, indexOnLine };
}
