export default class PatchedIndex {
  constructor(index, patch, op) {
    this.index = index;
    this.patch = patch;
    this.op = op;
  }

  async *seek(from) {
    const tree = this.index.seek(from);
    const patch = this.patch.values();

    let treeI  = await tree.next();
    let patchI = patch.next();

    // seek(from)
    while(!patchI.done && (this.index.comparator(patchI.value, from) < 0)) {
      patchI = patch.next();
    }

    while(!treeI.done && !patchI.done) {
      const cmp = this.index.comparator(treeI.value, patchI.value);

      if (cmp < 0) {
        yield treeI.value;
        treeI = await tree.next();
      } else if (cmp > 0) {
        yield patchI.value;
        patchI = patch.next();
      } else /* cmp == 0 */ if (this.op(patchI.value)) { // added
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
}
