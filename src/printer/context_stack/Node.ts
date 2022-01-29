export default class Node<T> {
  public data: T | null;
  public next: Node<T> | null;

  constructor(data?: T, next?: Node<T> | null) {
    this.data = data || null;
    this.next = next || null;
  }
}
