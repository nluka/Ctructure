import { tokenizeFile } from './lexer/tokenizeFile';
import printer from './printer/printer';

export default function format(filePathname: string) {
  const [fileContents, tokens] = tokenizeFile(filePathname);

  const formatted = printer(fileContents, tokens, 2);

  // TODO: this is inefficient and empty lines should be trimmed within `printer`
  const formattedAndTrimmed = formatted.replace(/\n +\n/g, '\n\n').trim();

  return formattedAndTrimmed;
}
