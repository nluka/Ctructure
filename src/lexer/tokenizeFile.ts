import { readFileSync } from 'fs';
import removeCarriageReturns from '../utility/removeCarriageReturns';
import cleanTokenSet from './cleanTokenSet';
import attemptTokenDisambiguate from './tokenDisambiguate';
import Tokenizer from './Tokenizer';
import TokenSet from './TokenSet';
import * as vscode from 'vscode';

/**
 * Parses a file and extracts all tokens, storing them in a `TokenSet` in the
 * order they appear in the file.
 * @param filePathname The pathname of the file to tokenize.
 * @returns An array, first is the normalized contents of the file, second is
 * the set of tokens.
 */
export default function tokenizeFile(filePathname: string): [string, TokenSet] {
  const fileBuffer = readFileSync(filePathname);
  const fileContents = removeCarriageReturns(fileBuffer.toString());

  const tokenizer = new Tokenizer(fileContents);
  const tokSet = new TokenSet(fileContents.length / 3);

  while (true) {
    const extractedTok = tokenizer.extractNextToken();
    if (extractedTok === null) {
      break;
    }
    tokSet.pushPacked(extractedTok);
  }

  for (const ambigTokIndex of tokenizer.getAmbiguousTokenIndices()) {
    const disambiguatedTokenType = attemptTokenDisambiguate(
      ambigTokIndex,
      tokSet,
      fileContents,
    );
    tokSet.setTokenType(ambigTokIndex, disambiguatedTokenType);
  }

  cleanTokenSet(tokSet);

  return [fileContents, tokSet];
}

export function tokenizeFileOnSave(
  document: vscode.TextDocument,
): [string, TokenSet] {
  const fileContents = removeCarriageReturns(document.getText());

  const tokenizer = new Tokenizer(fileContents);
  const tokSet = new TokenSet(fileContents.length / 3);

  while (true) {
    const extractedTok = tokenizer.extractNextToken();
    if (extractedTok === null) {
      break;
    }
    tokSet.pushPacked(extractedTok);
  }

  for (const ambigTokIndex of tokenizer.getAmbiguousTokenIndices()) {
    const disambiguatedTokenType = attemptTokenDisambiguate(
      ambigTokIndex,
      tokSet,
      fileContents,
    );
    tokSet.setTokenType(ambigTokIndex, disambiguatedTokenType);
  }

  cleanTokenSet(tokSet);

  return [fileContents, tokSet];
}
