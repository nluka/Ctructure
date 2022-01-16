import TokenArray from './lexer/TokenArray';
import tokenTypeToNameMap from './lexer/tokenTypeToNameMap';

export default function debugLogTokens(tokens: TokenArray) {
  console.log('TOKENS:');
  console.log('number - startIndex - type');
  for (let i = 0; i < tokens.getCount(); ++i) {
    const [startIndex, tokenType] = tokens.getTokenDecoded(i);
    console.log(
      `${i + 1}`.padStart(6),
      '-',
      `${startIndex}`.padStart(10),
      '-',
      tokenTypeToNameMap.get(tokenType),
    );
  }
  console.log('');
}
