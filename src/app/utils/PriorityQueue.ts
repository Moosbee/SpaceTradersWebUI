class PriorityQueue<T> {
  private _heap: T[] = [];
  private _comparator: (a: T, b: T) => boolean;

  constructor(comparator: (a: T, b: T) => boolean = (a, b) => a > b) {
    this._comparator = comparator;
  }

  size(): number {
    return this._heap.length;
  }

  isEmpty(): boolean {
    return this.size() === 0;
  }

  peek(): T | undefined {
    return this._heap[0];
  }

  push(...values: T[]): number {
    values.forEach((value) => {
      this._heap.push(value);
      this._siftUp();
    });
    return this.size();
  }

  pop(): T | undefined {
    const poppedValue = this.peek();
    const bottom = this.size() - 1;
    if (bottom > 0) {
      this._swap(0, bottom);
    }
    this._heap.pop();
    this._siftDown();
    return poppedValue;
  }

  replace(value: T): T | undefined {
    const replacedValue = this.peek();
    this._heap[0] = value;
    this._siftDown();
    return replacedValue;
  }

  removeAll(filterFunction: (value: T) => boolean): number {
    // Filter out all instances of `value` from the heap
    this._heap = this._heap.filter(filterFunction);

    // Rebuild the heap
    this._heapify();

    // Return the new size of the heap
    return this.size();
  }

  private _greater(i: number, j: number): boolean {
    return this._comparator(this._heap[i], this._heap[j]);
  }

  private _swap(i: number, j: number): void {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }

  private _siftUp(): void {
    let node = this.size() - 1;
    while (node > 0 && this._greater(node, Math.floor((node - 1) / 2))) {
      this._swap(node, Math.floor((node - 1) / 2));
      node = Math.floor((node - 1) / 2);
    }
  }

  private _siftDown(): void {
    let node = 0;
    while (
      (2 * node + 1 < this.size() && this._greater(2 * node + 1, node)) ||
      (2 * node + 2 < this.size() && this._greater(2 * node + 2, node))
    ) {
      let maxChild =
        2 * node + 2 < this.size() && this._greater(2 * node + 2, 2 * node + 1)
          ? 2 * node + 2
          : 2 * node + 1;
      this._swap(node, maxChild);
      node = maxChild;
    }
  }

  // Helper method to rebuild the heap after removal
  private _heapify(): void {
    // Start from the last non-leaf node and sift down to maintain the heap property
    for (let i = Math.floor(this.size() / 2) - 1; i >= 0; i--) {
      this._siftDownFrom(i);
    }
  }

  private _siftDownFrom(index: number): void {
    let node = index;
    while (
      (2 * node + 1 < this.size() && this._greater(2 * node + 1, node)) ||
      (2 * node + 2 < this.size() && this._greater(2 * node + 2, node))
    ) {
      let maxChild =
        2 * node + 2 < this.size() && this._greater(2 * node + 2, 2 * node + 1)
          ? 2 * node + 2
          : 2 * node + 1;
      this._swap(node, maxChild);
      node = maxChild;
    }
  }
}

export default PriorityQueue;
