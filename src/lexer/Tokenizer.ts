import tokenDetermineCategory from './tokenDetermineCategory';
import tokenDetermineType from './tokenDetermineType';
import tokenEncode from './tokenEncode';
import { tokenFindLastIndex } from './tokenFindLastIndex';
import TokenType, { isTokenAmbiguous } from './TokenType';

export default class Tokenizer {
  private cursorPosition = 0;
  private prevTokenType: TokenType | null = null;
  private tokensExtractedCount = 0;
  public ambiguousTokenIndices: number[] = [];

  constructor(private fileContents: string) {}

  public extractNextTokenEncoded(): number | null {
    const isThereAnotherToken = this.moveCursorToBeginningOfNextToken();
    if (!isThereAnotherToken) {
      return null;
    }

    const tokenCategory = tokenDetermineCategory(
      this.fileContents.charAt(this.cursorPosition),
      this.cursorPosition,
    );

    const tokenLastIndex = tokenFindLastIndex(
      this.fileContents,
      this.cursorPosition,
      tokenCategory,
      this.prevTokenType,
    );

    const tokenType = tokenDetermineType(
      this.fileContents,
      this.cursorPosition,
      tokenLastIndex,
      tokenCategory,
    );

    const encodedToken = tokenEncode(this.cursorPosition, tokenType);

    this.prevTokenType = tokenType;
    this.cursorPosition = tokenLastIndex + 1;
    if (isTokenAmbiguous(tokenType)) {
      this.ambiguousTokenIndices.push(this.tokensExtractedCount);
    }
    ++this.tokensExtractedCount;

    return encodedToken;
  }

  /**
   * Moves `this.cursorPosition` to the starting index of the next token (or
   * the last character of the file if no more tokens exist).
   * @returns True if another token exists, false otherwise.
   */
  private moveCursorToBeginningOfNextToken(): boolean {
    while (true) {
      const currentChar = this.fileContents.charAt(this.cursorPosition);

      if (this.cursorPosition >= this.fileContents.length) {
        // Reached end of file
        return false;
      }
      if (!currentChar.match(whitespaceRegex)) {
        // Reached next token
        return true;
      }

      ++this.cursorPosition;
    }
  }
}

const whitespaceRegex = /[ \t]/;
