import { readFileSync } from 'fs';
import removeCarriageReturns from '../utility/removeCarriageReturns';
import TokenArray from './TokenArray';
import tokenDisambiguate from './tokenDisambiguate';
import Tokenizer from './Tokenizer';

/**
 * @param filePathname The pathname of the file to tokenize.
 * @returns An array, the first element is normalized contents of the file, the second
 * is the array of tokens in their order of appearance within the file.
 */
export function tokenizeFile(filePathname: string): [string, TokenArray] {
  const fileBuffer = readFileSync(filePathname);
  const fileContents = removeCarriageReturns(fileBuffer.toString());
  const tokenizer = new Tokenizer(fileContents);
  const tokens = new TokenArray(Math.ceil(fileContents.length / 3));

  while (true) {
    const extractedToken = tokenizer.extractNextToken();
    if (extractedToken === null) {
      break;
    }
    tokens.pushPacked(extractedToken);
  }

  for (const ambigTokenIndex of tokenizer.getAmbiguousTokenIndices()) {
    const disambiguatedTokenType = tokenDisambiguate(
      ambigTokenIndex,
      tokens,
      fileContents,
    );
    tokens.setTokenType(ambigTokenIndex, disambiguatedTokenType);
  }

  return [fileContents, tokens];
}
