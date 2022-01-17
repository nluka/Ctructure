import tokenDecode from './tokenDecode';
import TokenType from './TokenType';

export default class TokenArray {
  private values: Uint32Array;
  private size;
  private count = 0;
  private resizeCount = 0;

  constructor(initialSize: number, private readonly resizeMultiplier = 1.25) {
    this.values = new Uint32Array(initialSize);
    this.size = initialSize;
  }

  public getValues(): Uint32Array {
    return this.values;
  }

  public push(encodedToken: number): void {
    if (this.count === this.size) {
      this.resize();
    }
    this.values[this.count++] = encodedToken;
  }

  public resize(): void {
    const newSize = Math.max(
      Math.ceil(this.size * this.resizeMultiplier),
      this.size + 1,
    );
    const newValues = new Uint32Array(newSize);
    for (let i = 0; i < this.count; ++i) {
      newValues[i] = this.values[i];
    }
    this.values = newValues;
    this.size = newSize;
    ++this.resizeCount;
  }

  public getTokenEncoded(index: number): number {
    this.checkIndexBounds(index);
    return this.values[index];
  }

  public getTokenDecoded(index: number): [number, TokenType] {
    this.checkIndexBounds(index);
    return tokenDecode(this.values[index]);
  }

  public setTokenEncoded(index: number, encodedToken: number) {
    this.checkIndexBounds(index);
    this.values[index] = encodedToken;
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
