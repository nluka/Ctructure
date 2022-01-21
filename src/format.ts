import { tokenizeFile } from './lexer/tokenizeFile';
import printer from './printer/printer';

export default function format(filePathname: string) {
  const [fileContents, tokens] = tokenizeFile(filePathname);
  const formatted = printer(fileContents, tokens, 2);
  return formatted;
}
