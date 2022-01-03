import TokenArray from '../../lexer/TokenArray';
import formatFile, { toString } from '../formatter';

export default function assert(
  tokenizedFile: [string, TokenArray],
  expectedFormat: string,
  name: string,
) {
  test(`test type: ${name}`, () => {
    const stringed = toString(formatFile(tokenizedFile));
    //console.log(stringed);
    expect(stringed).toBe(expectedFormat);
  });
}
