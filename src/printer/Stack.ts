import Node from './Node';
import { Types } from './printer';

export default class Stack {
  private head: Node<[Types, boolean, number]> | null = null;

  constructor() {}

  push(data: [Types, boolean, number]) {
    const newHead = new Node<[Types, boolean, number]>(data, this.head);
    this.head = newHead;
  }

  peek(): [Types, boolean, number] {
    if (this.head) {
      const oldHead = this.head.data;
      if (oldHead) {
        return oldHead;
      }
      return [null, false, 0];
    }
    return [null, false, 0];
  }

  pop(): [Types, boolean, number] {
    if (this.head) {
      const oldHead = this.head.data;
      this.head = this.head.next;
      if (oldHead) {
        return oldHead;
      }
      return [null, false, 0];
    }
    return [null, false, 0];
  }
}
