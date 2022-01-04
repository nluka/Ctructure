import path = require('path');
import { tokenizeFile } from '../../lexer/tokenizeFile';
import checkForLineOverflow from '../checkForLineOverflow';
import FormatCategory from '../FormatCategory';
import formatFile, { toString, Types } from '../formatter';

function assert(
  fileContents: string,
  context: Types,
  tokens: Uint32Array,
  index: number,
  startLineIndex: number,
  name: string,
  expectedFormat: boolean
) {
  test(`test type: ${name}`, () => {
    const stringed = checkForLineOverflow(fileContents, context, tokens, index, startLineIndex);
    expect(stringed).toBe(expectedFormat);
  });
}

const filePath = path.join(__dirname, '../../sample_code/testFileForOverflow.c');
const tokenizedfile = tokenizeFile(filePath);
console.log(toString(formatFile(tokenizedfile)));

assert(tokenizedfile[0], FormatCategory.array, tokenizedfile[1].getValues(), 3, 0, 'over 80 array', true);
assert(tokenizedfile[0], FormatCategory.array, tokenizedfile[1].getValues(), 7, 26, 'under 80 array', false);