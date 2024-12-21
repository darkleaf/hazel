import {searchFirst, searchLast} from './utils';

class ArrayTree {
  #array;
  #comparator;

  constructor(array, comparator) {
    this.#array = [...array].sort(comparator);
    this.#comparator = comparator;
  }

  *seek(from) {
    let idx = 0;
    if (from !== undefined)
      idx = searchFirst(this.#array, from, this.#comparator);
    for(; idx < this.#array.length; idx++) {
      yield this.#array[idx];
    }
  }
}

export default class PatchedTree {
  #tree;
  #comparator;
  #patch;
  #op;
  constructor(tree, comparator, patch, op) {
    this.#tree       = tree;
    this.#comparator = comparator;
    this.#patch      = new ArrayTree(patch, comparator);
    this.#op         = op;
  }

  async *seek(from) {
    const tree  = this.#tree.seek(from);
    const patch = this.#patch.seek(from);

    let treeI  = await tree.next();
    let patchI = patch.next();

    while(!treeI.done && !patchI.done) {
      const cmp = this.#comparator(treeI.value, patchI.value);

      if (cmp < 0) {
        yield treeI.value;
        treeI = await tree.next();
      } else if (cmp > 0) {
        yield patchI.value;
        patchI = patch.next();
      } else /* cmp == 0 */ if (this.#op(patchI.value)) { // added
        yield treeI.value;
        treeI = await tree.next();
        patchI = patch.next();
      } else { // retracted
        treeI = await tree.next();
        patchI = patch.next();
      }
    }

    while(!treeI.done) {
      yield treeI.value;
      treeI = await tree.next();
    }

    while(!patchI.done) {
      yield patchI.value;
      patchI = patch.next();
    }
  }

  // todo: rseek
}
