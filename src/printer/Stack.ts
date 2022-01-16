import Node from './Node';
import { Types } from './printer';

export default class Stack {
  private head: Node<{
    context: Types;
    overflow: boolean;
    blockLevel: number;
  }> | null = null;

  constructor() {}

  push(data: { context: Types; overflow: boolean; blockLevel: number }) {
    const newHead = new Node<{
      context: Types;
      overflow: boolean;
      blockLevel: number;
    }>(data, this.head);
    this.head = newHead;
  }

  peek(): { context: Types; overflow: boolean; blockLevel: number } {
    if (this.head) {
      const oldHead = this.head.data;
      if (oldHead) {
        return oldHead;
      }
      return { context: null, overflow: false, blockLevel: 0 };
    }
    return { context: null, overflow: false, blockLevel: 0 };
  }

  pop(): { context: Types; overflow: boolean; blockLevel: number } {
    if (this.head) {
      const oldHead = this.head.data;
      this.head = this.head.next;
      if (oldHead) {
        return oldHead;
      }
      return { context: null, overflow: false, blockLevel: 0 };
    }
    return { context: null, overflow: false, blockLevel: 0 };
  }
}
