import tokenDetermineCategory from './tokenDetermineCategory';
import tokenDetermineType from './tokenDetermineType';
import tokenFindEndPosition from './tokenFindEndPosition';
import TokenType, { isTokenAmbiguous } from './TokenType';

const whitespaceRegex = /^[ \t\f]$/;

/**
 * An object for statefully extracting tokens from a string.
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

    const tokCategory = tokenDetermineCategory(
      this.fileContents,
      this.cursorPosition,
    );

    const tokEndPos = tokenFindEndPosition(
      this.fileContents,
      this.cursorPosition,
      tokCategory,
    );

    const tokType = tokenDetermineType(
      this.fileContents,
      this.cursorPosition,
      tokEndPos,
      tokCategory,
    );
    if (isTokenAmbiguous(tokType)) {
      this.ambiguousTokenIndices.push(this.tokensExtractedCount);
    }

    const tokStartPos = this.cursorPosition;

    this.cursorPosition = tokEndPos + 1;
    ++this.tokensExtractedCount;

    return [tokStartPos, tokType];
  }

  /**
   * Moves `this.cursorPosition` to the starting index of the next token (or the
   * end of file if no more tokens exist).
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
