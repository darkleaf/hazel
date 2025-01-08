import {searchFirst, searchLast} from './utils';

export default class Tree {
  #loader;
  #comparator;
  #address;

  constructor(loader, comparator, address) {
    this.#loader     = loader;
    this.#comparator = comparator;
    this.#address    = address;
  }

  // todo: should I use something like this?
  // const len = addresses.length
  async *#seek(addr, from) {
    const node = await this.#loader(addr);

    let idx = 0;
    if (from !== undefined)
      idx = searchFirst(node.keys, from, this.#comparator);

    if (!!node.addresses) { // branch
      for(; idx < node.addresses.length; idx++) {
        const addr = node.addresses[idx];
        yield* this.#seek(addr, from);
      }
    } else {
      for(; idx < node.keys.length; idx++) {
        yield node.keys[idx];
      }
    }
  }

  async *#rseek(addr, from) {
    const node = await this.#loader(addr);

    let idx = node.keys.length - 1;

    if (from !== undefined)
      idx = searchLast(node.keys, from, this.#comparator);

    if (!!node.addresses) { // branch
      for(; idx >= 0; idx--) {
        const addr = node.addresses[idx];
        yield* this.#rseek(addr, from);
      }
    } else {
      for(; idx >= 0; idx--) {
        yield node.keys[idx];
      }
    }
  }

  // todo: should it be like this?
  // seek(from = undefined) { ... }
  // we can call it without parameters
  seek(from) {
    return this.#seek(this.#address, from);
  }

  rseek(from) {
    return this.#rseek(this.#address, from);
  }
}
