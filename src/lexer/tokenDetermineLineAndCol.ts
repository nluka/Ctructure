export default function tokenDetermineLineAndCol(
  fileContents: string,
  tokenStartIndex: number,
): { lineNum: number; colNum: number } {
  if (tokenStartIndex === 0) {
    return { lineNum: 1, colNum: 1 };
  }

  let lineNum = 1;
  for (let i = 0; i < tokenStartIndex - 1; ++i) {
    if (fileContents.charAt(i) === '\n') {
      ++lineNum;
    }
  }
  if (lineNum === 1) {
    return { lineNum, colNum: tokenStartIndex + 1 };
  }

  let firstNewlineBehindStartIndex = 0;
  for (let i = tokenStartIndex - 1; i > 0; --i) {
    if (fileContents.charAt(i) === '\n') {
      firstNewlineBehindStartIndex = i;
      break;
    }
  }

  const colNum = tokenStartIndex - firstNewlineBehindStartIndex;

  return { lineNum, colNum };
}
