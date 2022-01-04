import path = require('path');
import TokenArray from '../../lexer/TokenArray';
import { tokenizeFile } from '../../lexer/tokenizeFile';

const filePath = path.join(__dirname, '../../sample_code/header_with_guards.h');
const tokenizedfile = tokenizeFile(filePath);

const expectedFormat = `#ifndef HEADER_WITH_GUARDS_H
#define HEADER_WITH_GUARDS_H

#include <stdbool.h>

bool func1(void);
bool func2();

#endif // HEADER_WITH_GUARDS_H
`;

const testInfoHeaderGH: [[string, TokenArray], string, string] = [
  tokenizedfile,
  expectedFormat,
  'header_with_guards.h',
];

export default testInfoHeaderGH;
