import tokenDetermineCategory from './tokenDetermineCategory';
import tokenDetermineType from './tokenDetermineType';
import tokenFindLastIndex from './tokenFindLastIndex';
import TokenType, { isTokenAmbiguous } from './TokenType';

/**
 * An object for extracting tokens from a string.
 */
export default class Tokenizer {
  private cursorPosition = 0;
  private ambiguousTokenIndices: number[] = [];
  private tokensExtractedCount = 0;

  constructor(private fileContents: string) {}

  public extractNextToken(): [number, TokenType] | null {
    const isThereAnotherToken = this.moveCursorToBeginningOfNextToken();
    if (!isThereAnotherToken) {
      return null;
    }

    const tokenCategory = tokenDetermineCategory(
      this.fileContents,
      this.cursorPosition,
    );

    const tokenLastIndex = tokenFindLastIndex(
      this.fileContents,
      this.cursorPosition,
      tokenCategory,
    );

    const tokenType = tokenDetermineType(
      this.fileContents,
      this.cursorPosition,
      tokenLastIndex,
      tokenCategory,
    );
    if (isTokenAmbiguous(tokenType)) {
      this.ambiguousTokenIndices.push(this.tokensExtractedCount);
    }

    const tokenStartIndex = this.cursorPosition;

    this.cursorPosition = tokenLastIndex + 1;
    ++this.tokensExtractedCount;

    return [tokenStartIndex, tokenType];
  }

  /**
   * Moves `this.cursorPosition` to the starting index of the next token (or
   * the end of file if no more tokens exist).
   * @returns True if a new token was found, false otherwise.
   */
  private moveCursorToBeginningOfNextToken(): boolean {
    while (true) {
      if (this.cursorPosition >= this.fileContents.length) {
        // Reached end of file
        return false;
      }

      const currentChar = this.fileContents.charAt(this.cursorPosition);
      if (!currentChar.match(whitespaceRegex)) {
        // Reached next token
        return true;
      }

      ++this.cursorPosition;
    }
  }

  public getAmbiguousTokenIndices() {
    return this.ambiguousTokenIndices;
  }
}

const whitespaceRegex = /[ \t]/;
