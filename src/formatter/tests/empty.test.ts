import path = require("path");
import TokenArray from "../../lexer/TokenArray";
import { tokenizeFile } from "../../lexer/tokenizeFile";
import formatFile, { toString } from "../formatter";

describe('formatter', () => {
  function assert(
    tokenizedFile: [string, TokenArray],
    expectedFormat: string,
  ) {
    test(`format file: empty.c`, () => {
      const stringed = toString(formatFile(tokenizedFile));
      console.log(stringed);
      expect(stringed).toBe(expectedFormat);
    });
  }

  {
    const filePath = path.join(__dirname, '../../sample_code/empty.c');
    const tokenizedfile = tokenizeFile(filePath);
    assert(tokenizedfile, "");
  }

}
);