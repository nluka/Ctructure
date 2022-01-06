export default class NodeString {
  private data: string | null;
  constructor(data?: string) {
    this.data = data ? data : '';
  }

  getData() {
    return this.data;
  }
  setData(data: string) {
    this.data = data;
  }
}
