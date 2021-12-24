import { tokenDecode } from './tokenDecode';
import TokenType from './TokenType';

// TODO: write tests
export default class TokenArray {
  private values: Uint32Array;
  private size;
  private count = 0;
  private resizeCount = 0;

  constructor(initialSize: number, private readonly resizeMultiplier = 1.25) {
    this.values = new Uint32Array(initialSize);
    this.size = initialSize;
  }

  public slice(startIndex: number, endIndex: number): Uint32Array {
    return this.values.slice(startIndex, endIndex);
  }

  public push(token: number): void {
    if (this.count === this.size) {
      this.resize();
    }
    this.values[this.count++] = token;
  }

  public resize(): void {
    const newSize = Math.max(this.size * this.resizeMultiplier, this.size + 1);
    const newValues = new Uint32Array(newSize);
    for (let i = 0; i < this.count; ++i) {
      newValues[i] = this.values[i];
    }
    this.values = newValues;
    this.size = newSize;
    ++this.resizeCount;
  }

  public getEncoded(index: number): number {
    this.checkIndexBounds(index);
    return this.values[index];
  }

  public getDecoded(index: number): [number, TokenType] {
    this.checkIndexBounds(index);
    return tokenDecode(this.values[index]);
  }

  public checkIndexBounds(index: number): void {
    if (index < 0 || index >= this.count) {
      throw new RangeError(
        `index ${index} out of bounds (count was ${this.count})`,
      );
    }
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
