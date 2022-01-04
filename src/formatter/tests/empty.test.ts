import path = require("path");
import { tokenizeFile } from "../../lexer/tokenizeFile";
import assert from "./assert";

const filePath = path.join(__dirname, '../../sample_code/empty.c');
const tokenizedfile = tokenizeFile(filePath);
assert(tokenizedfile, '', '');