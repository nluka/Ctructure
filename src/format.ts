import TokenArray from './lexer/TokenArray';
import { tokenizeFile } from './lexer/tokenizeFile';
import printer from './printer/printer';

export default function format(filePathname: string) {
  let formatted: string;
  let fileContents: string;
  let tokens: TokenArray;

  {
    const startTime = Date.now();
    [fileContents, tokens] = tokenizeFile(filePathname);
    const endTime = Date.now();
    console.log(`    lexing - ${(endTime - startTime) / 1000}`);
  }

  {
    const startTime = Date.now();
    formatted = printer(fileContents, tokens, 2);
    const endTime = Date.now();
    console.log(`  printing - ${(endTime - startTime) / 1000}`);
  }

  return formatted;
}
