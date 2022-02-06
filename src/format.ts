import tokenizeFile from './lexer/tokenizeFile';
import printer from './printer/printer';

// For testing purposes
export default function format(filePathname: string, testing: boolean = false) {
  const [fileContents, tokens] = tokenizeFile(filePathname);
  const formatted = printer(fileContents, tokens, testing);
  return formatted;
}
