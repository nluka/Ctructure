import TokenSet from '../lexer/TokenSet';
import tokenTypeToNameMap from '../lexer/tokenTypeToNameMap';

export function debugLogFileContents(fileContents: string) {
  console.log('FILE CONTENTS:');
  console.log('--------------------');
  console.log(fileContents);
  console.log('--------------------\n');
}

export function debugLogTokens(tokSet: TokenSet) {
  console.log('TOKENS:');
  console.log('number - startPos - type');
  for (let i = 0; i < tokSet.getCount(); ++i) {
    const [tokStartPos, tokType] = tokSet.getToken(i);
    console.log(
      `${i + 1}`.padStart(6),
      '-',
      `${tokStartPos}`.padStart(8),
      '-',
      tokenTypeToNameMap.get(tokType),
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
