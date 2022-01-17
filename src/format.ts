import TokenArray from './lexer/TokenArray';
import { tokenizeFile } from './lexer/tokenizeFile';
import printer from './printer/printer';

export default function format(
  filePathname: string,
  options = { shouldLogFileSize: false },
): {
  formatted: string;
  lexerElapsedSeconds: number;
  printerElapsedSeconds: number;
} {
  let formatted: string;
  let fileContents: string;
  let tokens: TokenArray;
  let lexerElapsedSeconds: number;
  let printerElapsedSeconds: number;

  {
    const startTime = Date.now();
    [fileContents, tokens] = tokenizeFile(
      filePathname,
      options.shouldLogFileSize,
    );
    const endTime = Date.now();
    lexerElapsedSeconds = (endTime - startTime) / 1000;
  }

  {
    const startTime = Date.now();
    formatted = printer(fileContents, tokens, 2);
    const endTime = Date.now();
    printerElapsedSeconds = (endTime - startTime) / 1000;
  }

  return { formatted, lexerElapsedSeconds, printerElapsedSeconds };
}
