import { tokenizeFile } from './lexer/tokenizeFile';
import printer from './printer/printer';

// For testing purposes
export default function format(filePathname: string) {
  const [fileContents, tokens] = tokenizeFile(filePathname);
  const formatted = printer(fileContents, tokens, 2);
  return formatted;
}
