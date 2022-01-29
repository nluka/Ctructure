import Node from './Node';
import { ContextTypes } from '../printer';

export default class Stack {
  private head: Node<{
    context: ContextTypes;
    overflow: boolean;
    blockLevel: number;
  }> | null = null;

  constructor() {}

  push(data: { context: ContextTypes; overflow: boolean; blockLevel: number }) {
    const newHead = new Node<{
      context: ContextTypes;
      overflow: boolean;
      blockLevel: number;
    }>(data, this.head);
    this.head = newHead;
  }

  peek(): { context: ContextTypes; overflow: boolean; blockLevel: number } {
    if (this.head) {
      const oldHead = this.head.data;
      if (oldHead) {
        return oldHead;
      }
      return { context: null, overflow: false, blockLevel: 0 };
    }
    return { context: null, overflow: false, blockLevel: 0 };
  }

  pop(): { context: ContextTypes; overflow: boolean; blockLevel: number } {
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
