import TokenType from './TokenType';

/**
 * A dynamic container for tokens.
 * Stores start position (index of first character) and type.
 */
export default class TokenSet {
  private startIndices: Uint32Array;
  private types: Uint8Array;
  private size;
  private count = 0;
  private resizeCount = 0;

  constructor(initialSize: number, public readonly resizeMultiplier = 1.25) {
    initialSize = Math.max(Math.ceil(initialSize), 1);
    this.startIndices = new Uint32Array(initialSize);
    this.types = new Uint8Array(initialSize);
    this.size = initialSize;
  }

  public resize(): void {
    const newSize = Math.max(
      Math.ceil(this.size * this.resizeMultiplier),
      this.size + 1,
    );

    {
      // resize startIndices
      const newStartIndices = new Uint32Array(newSize);
      if (newStartIndices !== this.startIndices) {
        for (let i = 0; i < this.count; ++i) {
          newStartIndices[i] = this.startIndices[i];
        }
      }
      this.startIndices = newStartIndices;
    }

    {
      // resize types
      const newTypes = new Uint8Array(newSize);
      if (newTypes !== this.types) {
        for (let i = 0; i < this.count; ++i) {
          newTypes[i] = this.types[i];
        }
      }
      this.types = newTypes;
    }

    this.size = newSize;
    ++this.resizeCount;
  }

  public pushUnpacked(tokStartPos: number, tokenType: TokenType): void {
    if (this.count === this.size) {
      this.resize();
    }
    this.startIndices[this.count] = tokStartPos;
    this.types[this.count] = tokenType;
    ++this.count;
  }

  public pushPacked(token: [number, TokenType]): void {
    if (this.count === this.size) {
      this.resize();
    }
    this.startIndices[this.count] = token[0];
    this.types[this.count] = token[1];
    ++this.count;
  }

  public setTokenType(index: number, type: TokenType): void {
    this.checkIndexBounds(index);
    this.types[index] = type;
  }

  public setToken(
    index: number,
    tokStartPos: number,
    tokType: TokenType,
  ): void {
    this.checkIndexBounds(index);
    this.startIndices[index] = tokStartPos;
    this.types[index] = tokType;
  }

  public getToken(index: number): [number, TokenType] {
    return [this.startIndices[index], this.types[index]];
  }

  public getTokenStartPosition(index: number): number {
    this.checkIndexBounds(index);
    return this.startIndices[index];
  }

  public getTokenType(index: number): TokenType {
    this.checkIndexBounds(index);
    return this.types[index];
  }

  public checkIndexBounds(index: number): void {
    if (index < 0 || index >= this.count) {
      throw new RangeError(
        `TokenSet index ${index} out of bounds (count was ${this.count})`,
      );
    }
  }

  public isIndexInBounds(index: number): boolean {
    return index >= 0 && index < this.count;
  }

  public getValues(): { startIndices: Uint32Array; types: Uint8Array } {
    return {
      startIndices: this.startIndices,
      types: this.types,
    };
  }

  public getSize(): number {
    return this.size;
  }

  public getCount(): number {
    return this.count;
  }

  public getResizeCount(): number {
    return this.resizeCount;
  }

  /**
   * @param firstSearchIndex The first index to search.
   * @param searchTypes The types of tokens to match with `equality`.
   * @param equality The kind of equality to check for when comparing a token
   * with `searchTokenTypes`. If true, will find the first token whose type
   * matches any one of the types in `searchTokenTypes`. If false, will find
   * the first token whose type does not match any of the types in
   * `searchTokenTypes`.
   * @returns The first token type and its index in `tokens` at or ahead of
   * `firstSearchIndex` that matches one of or none of `searchTokenTypes`
   * depending on `equality`.
   */
  findFirstTypeMatchAhead(
    firstSearchIndex: number,
    searchTypes: TokenType[],
    equality: boolean,
  ): [TokenType, number] | [-1, -1] {
    if (!this.isIndexInBounds(firstSearchIndex)) {
      return [-1, -1];
    }

    for (let i = firstSearchIndex; i < this.getCount(); ++i) {
      const tokenType = this.getTokenType(i);
      if (searchTypes.includes(tokenType) === equality) {
        return [tokenType, i];
      }
    }
    return [-1, -1];
  }

  /**
   * @param firstSearchIndex The first index to search.
   * @param searchTokenTypes The types of tokens to match with `equality`.
   * @param equality The kind of equality to check for when comparing a token
   * with `searchTokenTypes`. If true, will find the first token whose type
   * matches any one of the types in `searchTokenTypes`. If false, will find
   * the first token whose type does not match any of the types in
   * `searchTokenTypes`.
   * @returns The first token and its index in `tokens` at or behind
   * `firstSearchIndex` that matches one of or none of `searchTokenTypes`
   * depending on `equality`.
   */
  findFirstTypeMatchBehind(
    firstSearchIndex: number,
    searchTokenTypes: TokenType[],
    equality: boolean,
  ): [TokenType, number] | [-1, -1] {
    if (!this.isIndexInBounds(firstSearchIndex)) {
      return [-1, -1];
    }

    for (let i = firstSearchIndex; i >= 0; --i) {
      const tokenType = this.getTokenType(i);
      if (searchTokenTypes.includes(tokenType) === equality) {
        return [tokenType, i];
      }
    }
    return [-1, -1];
  }
}
