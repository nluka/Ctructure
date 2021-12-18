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

  public push(token: number) {
    if (this.count === this.size) {
      this.resize();
    }
    this.values[this.count++] = token;
  }

  private resize() {
    const newValues = new Uint32Array(this.size * this.resizeMultiplier);
    for (let i = 0; i < this.count; ++i) {
      newValues[i] = this.values[i];
    }
    this.values = newValues;
    ++this.resizeCount;
  }

  public getAtIndex(index: number) {
    if (index < 0 || index >= this.count) {
      throw new RangeError('out of bounds index');
    }
    return this.values[index];
  }

  public getSize() {
    return this.size;
  }

  public getCount() {
    return this.count;
  }

  public getResizeCount() {
    return this.resizeCount;
  }
}
