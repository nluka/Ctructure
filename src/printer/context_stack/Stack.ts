import { Context } from '../printer';
import Node from './Node';

export default class Stack {
  private head: Node<{
    context: Context;
    overflow: boolean;
    indentationDepth: number;
  }> | null = null;

  constructor() {}

  push(data: {
    context: Context;
    overflow: boolean;
    indentationDepth: number;
  }) {
    const newHead = new Node<{
      context: Context;
      overflow: boolean;
      indentationDepth: number;
    }>(data, this.head);
    this.head = newHead;
  }

  peek(): { context: Context; overflow: boolean; indentationDepth: number } {
    if (this.head) {
      const oldHead = this.head.data;
      if (oldHead) {
        return oldHead;
      }
    }
    return { context: null, overflow: false, indentationDepth: 0 };
  }

  pop(): { context: Context; overflow: boolean; indentationDepth: number } {
    if (this.head) {
      const oldHead = this.head.data;
      this.head = this.head.next;
      if (oldHead) {
        return oldHead;
      }
    }
    return { context: null, overflow: false, indentationDepth: 0 };
  }
}
