export default class PatchedTree {
  #tree;
  #comparator;
  #patch;
  #op;
  constructor(tree, comparator, patch, op) {
    this.#tree       = tree;
    this.#comparator = comparator;
    this.#patch      = [...patch].sort(comparator);
    this.#op         = op;
  }

  async *seek(from) {
    const tree  = this.#tree.seek(from);
    const patch = this.#patch.values();

    let treeI  = await tree.next();
    let patchI = patch.next();

    // seek(from)
    while(!patchI.done && (this.#comparator(patchI.value, from) < 0)) {
      patchI = patch.next();
    }

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
