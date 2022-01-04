export default class Node<T> {
  private data: T | null;
  private next: Node<T> | null;
  constructor(data?: T, next?: Node<T> | null) {
    this.data = data ? data : null;
    this.next = next ? next : null;
  }

  getNext() {
    return this.next;
  }
  setNext(next: Node<T> | null) {
    this.next = next;
  }
  getData() {
    return this.data;
  }
  setData(data: T) {
    this.data = data;
  }
}
