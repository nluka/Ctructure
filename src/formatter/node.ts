export type nodeType = Node | undefined;

export default class Node {
  private data: any;
  private next: nodeType;
  private child: nodeType;
  constructor(data?: any, next?: nodeType, child?: nodeType) {
    this.data = data;
    this.next = next;
    this.child = child;
  }

  getChild() {
    return this.child;
  }
  setChild(child: nodeType) {
    this.child = child;
  }
  getNext() {
    return this.next;
  }
  setNext(next: nodeType) {
    this.next = next;
  }
  getData() {
    return this.data;
  }
  setData(data: any) {
    this.data = data;
  }
  addDataPost(data: any) {
    this.data = this.data ? this.data + data : data;
  }
  addDataPre(data: any) {
    this.data = this.data ? data + this.data : data;
  }
}
