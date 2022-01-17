import { tokenizeFile } from './lexer/tokenizeFile';
import printer from './printer/printer';

export default function format(filePathname: string) {
  const lexerStartTime = Date.now();
  const [fileContents, tokens] = tokenizeFile(filePathname);
  const lexerEndTime = Date.now();
  const lexerElapsedSecs = (lexerEndTime - lexerStartTime) / 1000;
  console.log(`    lexing - ${lexerElapsedSecs}`);

  const printerStartTime = Date.now();
  const formatted = printer(fileContents, tokens, 2);
  const printerEndTime = Date.now();
  const printerElapsedSecs = (printerEndTime - printerStartTime) / 1000;
  console.log(`  printing - ${printerElapsedSecs}`);

  return formatted;
}
