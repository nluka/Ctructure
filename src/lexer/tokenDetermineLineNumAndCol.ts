import findFirstTokenTypeMatchBehind from './findFirstTokenTypeMatchBehind';
import TokenArray from './TokenArray';
import TokenType from './TokenType';

export default function tokenDetermineLineNumAndColNum(
  tokenIndex: number,
  tokens: TokenArray,
): [number, number] {
  const [tokenStartIndex] = tokens.getTokenDecoded(tokenIndex);

  let lineNum = 1;
  for (let i = 0; i < tokenIndex; ++i) {
    const type = tokens.getTokenDecoded(i)[1];
    if (type === TokenType.newline) {
      ++lineNum;
    }
  }
  if (lineNum === 1) {
    return [lineNum, tokenStartIndex + 1];
  }

  const firstNewlineBehind = findFirstTokenTypeMatchBehind(
    tokens,
    tokenIndex - 1,
    [TokenType.newline],
    true,
  ) as [number, TokenType]; // check above ensures this can't be null

  const firstNewlineBehindStartIndex = firstNewlineBehind[0];
  const colNum = tokenStartIndex - firstNewlineBehindStartIndex;

  return [lineNum, colNum];
}
