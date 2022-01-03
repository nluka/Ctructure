import path = require('path');
import { tokenizeFile } from '../../lexer/tokenizeFile';
import assert from './assert';

const filePath = path.join(__dirname, '../../sample_code/header_with_guards.h');
const tokenizedfile = tokenizeFile(filePath);

const expectedFormat = `#ifndef HEADER_WITH_GUARDS_H
#define HEADER_WITH_GUARDS_H

#include <stdbool.h>

bool func1(void);
bool func2();

#endif // HEADER_WITH_GUARDS_H
`;

assert(tokenizedfile, expectedFormat, 'header_with_guards.h');
