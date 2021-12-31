import { readFileSync } from 'fs';
import removeCarriageReturns from '../utility/removeCarriageReturns';
import TokenArray from './TokenArray';
import tokenDisambiguateType from './tokenDisambiguate';
import tokenEncode from './tokenEncode';
import Tokenizer from './Tokenizer';

// TODO: write tests
/**
 * Tokenizes a file, encoding each token into a 32 bit number (using `tokenEncode`).
 * Each token stores its starting index in the first 25 bits and the type
 * (`TokenType`) in the remaining 7 bits.
 * @param filePathname The pathname of the file to tokenize.
 * @returns An array, the first element is the contents of the file, the second
 * is the array of encoded tokens in their order of appearance within the file.
 */
export function tokenizeFile(filePathname: string): [string, TokenArray] {
  const fileContents = removeCarriageReturns(
    readFileSync(filePathname).toString(),
  );
  const tokenizer = new Tokenizer(fileContents);
  const tokens = new TokenArray(Math.ceil(fileContents.length / 3));

  while (true) {
    const extractedToken = tokenizer.extractNextTokenEncoded();
    if (extractedToken === null) {
      break;
    }
    tokens.push(extractedToken);
  }

  try {
    for (const ambiguousTokenIndex of tokenizer.ambiguousTokenIndices) {
      const disambiguatedTokenType = tokenDisambiguateType(
        ambiguousTokenIndex,
        tokens,
      );
      tokens.setToken(
        ambiguousTokenIndex,
        tokenEncode(
          tokens.getTokenDecoded(ambiguousTokenIndex)[0],
          disambiguatedTokenType,
        ),
      );
    }
  } catch (err) {
    throw new Error(`failed to disambiguate token: ${err}`);
  }

  return [fileContents, tokens];
}
