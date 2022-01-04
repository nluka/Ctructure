import path = require('path');
import TokenArray from '../../lexer/TokenArray';
import { tokenizeFile } from '../../lexer/tokenizeFile';

const filePath = path.join(__dirname, '../../sample_code/empty.c');
const tokenizedfile = tokenizeFile(filePath);
const testInfoEmptyC: [[string, TokenArray], string, string] = [
  tokenizedfile,
  '',
  '',
];

export default testInfoEmptyC;
