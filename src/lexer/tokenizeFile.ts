import { readFileSync } from 'fs';
import removeCarriageReturns from '../utility/removeCarriageReturns';
import TokenArray from './TokenArray';
import Tokenizer from './Tokenizer';

// TODO: write tests (once fully implemented)
/**
 * Tokenizes a file, encoding each token into a 32-bit number (using `_tokenEncode`).
 * Each token stores its starting index in the first 24-bits and the type
 * (`TokenType`) in the remaining 8 bits. Use `tokenDecode` to extract the start
 * index and type for any encoded token.
 * @param filePathname The pathname of the file to tokenize.
 * @returns An array, the first element is the contents of the file, the second
 * element is the array of encoded tokens in their order of appearance within the file.
 */
export function tokenizeFile(filePathname: string): [string, TokenArray] {
  const fileContents = removeCarriageReturns(
    readFileSync(filePathname).toString(),
  );
  const tokenizer = new Tokenizer(fileContents);
  // TODO: figure out good formula for initial size of TokenArray
  const tokens = new TokenArray(fileContents.length);

  // while (1) {
  for (let i = 0; i < 1; ++i) {
    const extractedToken = tokenizer.extractNextTokenEncoded();
    if (extractedToken === null) {
      break;
    }
    tokens.push(extractedToken);
  }

  // console.log('token count =', tokens.getCount());
  // for (let i = 0; i < tokens.getCount(); ++i) {
  //   const [startIndex, type] = tokenDecode(tokens.getAtIndex(i));
  //   console.log(`tokens[${i}]: ${startIndex} ${type}`);
  // }

  return [fileContents, tokens];
}
