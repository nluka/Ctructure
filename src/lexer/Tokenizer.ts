import tokenDetermineCategory from './tokenDetermineCategory';
import tokenDetermineType from './tokenDetermineType';
import tokenEncode from './tokenEncode';
import { tokenFindLastIndex } from './tokenFindLastIndex';
import TokenType from './TokenType';

export default class Tokenizer {
  private cursorPosition = 0;
  private prevTokenType: TokenType | null = null;

  constructor(private fileContents: string) {}

  public extractNextTokenEncoded(): number | null {
    const isThereAnotherToken = this.moveToNextToken();
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
    this.prevTokenType = tokenType;

    const encodedToken = tokenEncode(this.cursorPosition, tokenType);
    return encodedToken;
  }

  /**
   * Moves `this.cursorPosition` to the starting index of the next token (or
   * the end of file if no more tokens exist).
   * @returns True if another token exists, false otherwise.
   */
  private moveToNextToken(): boolean {
    const currentChar = this.fileContents.charAt(this.cursorPosition);

    while (1) {
      if (this.cursorPosition >= this.fileContents.length) {
        // Reached end of file
        return false;
      }
      if (!currentChar.match(/[ \\n\\t]/)) {
        // Reached next token
        return true;
      }
      ++this.cursorPosition;
    }

    return false; // to satisfy tsc
  }
}
