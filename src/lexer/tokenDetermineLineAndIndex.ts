import Tokenizer from './Tokenizer';

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
