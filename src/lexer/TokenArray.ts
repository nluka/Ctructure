import TokenType from './TokenType';

export default class TokenArray {
  private startIndices: Uint32Array;
  private types: Uint8Array;
  private size;
  private count = 0;
  private resizeCount = 0;

  constructor(initialSize: number, private readonly resizeMultiplier = 1.25) {
    this.startIndices = new Uint32Array(initialSize);
    this.types = new Uint8Array(initialSize);
    this.size = initialSize;
  }

  public resize(): void {
    const newSize = Math.max(
      Math.ceil(this.size * this.resizeMultiplier),
      this.size + 1,
    );

    const newStartIndices = new Uint32Array(newSize);
    if (newStartIndices !== this.startIndices) {
      for (let i = 0; i < this.count; ++i) {
        newStartIndices[i] = this.startIndices[i];
      }
    }
    this.startIndices = newStartIndices;

    const newTypes = new Uint8Array(newSize);
    if (newTypes !== this.types) {
      for (let i = 0; i < this.count; ++i) {
        newTypes[i] = this.types[i];
      }
    }
    this.types = newTypes;

    this.size = newSize;
    ++this.resizeCount;
  }

  public pushUnpacked(tokenStartIndex: number, tokenType: TokenType): void {
    if (this.count === this.size) {
      this.resize();
    }
    this.startIndices[this.count] = tokenStartIndex;
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

  public setTokenType(index: number, type: TokenType) {
    this.checkIndexBounds(index);
    this.types[index] = type;
  }

  public setToken(
    index: number,
    tokenStartIndex: number,
    tokenType: TokenType,
  ) {
    this.checkIndexBounds(index);
    this.startIndices[index] = tokenStartIndex;
    this.types[index] = tokenType;
  }

  public getToken(index: number): [number, TokenType] {
    return [this.startIndices[index], this.types[index]];
  }

  public getTokenStartIndex(index: number): number {
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
        `TokenArray index ${index} out of bounds (count was ${this.count})`,
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
}
