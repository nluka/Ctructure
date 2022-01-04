import { Types } from './formatter';
import Node from './Node';

export default class Stack {
  private head: Node<[Types, boolean, number]> | null;
  constructor() {
    this.head = null;
  }

  push(data: [Types, boolean, number]) {
    const newHead = new Node<[Types, boolean, number]>(data, this.head);
    this.head = newHead;
  }
  peek(): [Types, boolean, number] {
    if (this.head) {
      const oldHead = this.head.getData();
      if (oldHead) {
        return oldHead;
      }
      return [null, false, 0];
    }
    return [null, false, 0];
  }
  pop(): [Types, boolean, number] {
    if (this.head) {
      const oldHead = this.head.getData();
      this.head = this.head.getNext();
      if (oldHead) {
        return oldHead;
      }
      return [null, false, 0];
    }
    return [null, false, 0];
  }
}
