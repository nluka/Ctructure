import TokenArray from './lexer/TokenArray';
import tokenTypeToNameMap from './lexer/tokenTypeToNameMap';

export function debugLogFileContents(fileContents: string) {
  console.log('FILE CONTENTS:');
  console.log('--------------------');
  console.log(fileContents);
  console.log('--------------------\n');
}

export function debugLogTokens(tokens: TokenArray) {
  console.log('TOKENS:');
  console.log('number - startIndex - type');
  for (let i = 0; i < tokens.getCount(); ++i) {
    const [startIndex, tokenType] = tokens.getToken(i);
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

export function debugLogFormatResult(result: string) {
  console.log('FORMAT RESULT:');
  console.log('--------------------');
  console.log(result);
  console.log('--------------------\n');
}
