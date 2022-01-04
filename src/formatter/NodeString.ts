export default class NodeString {
  private data: string | null;
  private next: NodeString | null;
  constructor(data?: string, next?: NodeString | null) {
    this.data = data ? data : null;
    this.next = next ? next : null;
  }

  getNext() {
    return this.next;
  }
  setNext(next: NodeString | null) {
    this.next = next;
  }
  getData() {
    if (this.data !== null) {
      return this.data;
    }
    return '';
  }
  setData(data: string) {
    this.data = data;
  }
}
