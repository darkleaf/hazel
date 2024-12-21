// asm.js
// int: x|0
function searchFirst(keys, key, cmp) {
  let low = 0;
  let high = keys.length; // а норм ли постоянно ее спрашивать?
  while (low < high) {
    let mid = (high + low) >>> 1;
    let d = cmp(keys[mid], key);
    if (d < 0)
      low = mid + 1;
    else
      high = mid;
  }
  return low;
}

function searchLast(keys, key, cmp) {
  let low = 0;
  let high = keys.length;
  while (low < high) {
    let mid = (high + low) >>> 1;
    let d = cmp(keys[mid], key);
    if (d <= 0)
      low = mid + 1;
    else
      high = mid;
  }
  return low - 1;
}


// if a === undefined return -1
// if b === undefined return 1


export default class Tree {
  #loader;
  #comparator;
  #address;

  constructor(loader, comparator, address) {
    this.#loader     = loader;
    this.#comparator = comparator;
    this.#address    = address;
  }

  // fix name
  // я тут постоянно длину спрашиваю, это ок?
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

  // можно вызывать просто seek()
  // хз как это указать
  seek(from) {
    return this.#seek(this.#address, from);
  }

  rseek(from) {
    return this.#rseek(this.#address, from);
  }
}
