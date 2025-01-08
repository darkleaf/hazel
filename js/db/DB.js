const e = 0;
const a = 1;
const v = 2;
const op = 3;

const comparators = {
  eav(x, y) {
    // todo: this is a POC version so it may not be finished
    //if (y[e] === undefined) return 1
    if (x[e] > y[e]) return 1
    if (x[e] < y[e]) return -1
    //if (y[a] === undefined) return 1
    if (x[a] > y[a]) return 1
    if (x[a] < y[a]) return -1
    //if (y[v] === undefined) return 1
    if (x[v] > y[v]) return 1
    if (x[v] < y[v]) return -1
    return 0
  },

  aev(x, y) {
    if (x[a] > y[a]) return 1
    if (x[a] < y[a]) return -1
    if (x[e] > y[e]) return 1
    if (x[e] < y[e]) return -1
    if (x[v] > y[v]) return 1
    if (x[v] < y[v]) return -1
    return 0
  },

  ave(x, y) {
    if (x[a] > y[a]) return 1
    if (x[a] < y[a]) return -1
    if (x[v] > y[v]) return 1
    if (x[v] < y[v]) return -1
    if (x[e] > y[e]) return 1
    if (x[e] < y[e]) return -1
    return 0
  },
}

class Index {
  #tree;

  constructor(tree) {
    this.#tree = tree;
  }

  seek(from) {
    return this.#tree.seek(from);
  }

  // todo: implement rseek
}


class EAVIndex extends Index {
  async *datoms(fromE, fromA, fromV) {
    for await (let datom of this.seek([fromE, fromA, fromV])) {
      if (fromE !== undefined && fromE !== datom[e]) break
      if (fromA !== undefined && fromA !== datom[a]) break
      if (fromV !== undefined && fromV !== datom[v]) break
      yield datom
    }
  }

  //todo: implement rdatoms
}

class AEVIndex extends Index {
  async *datoms(fromA, fromE, fromV) {
    for await (let datom of this.seek([fromE, fromA, fromV])) {
      if (fromA !== undefined && fromA !== datom[a]) break
      if (fromE !== undefined && fromE !== datom[e]) break
      if (fromV !== undefined && fromV !== datom[v]) break
      yield datom
    }
  }
}

class AVEIndex extends Index {
  async *datoms(fromA, fromV, fromE) {
    for await (let datom of this.seek([fromE, fromA, fromV])) {
      if (fromA !== undefined && fromA !== datom[a]) break
      if (fromV !== undefined && fromV !== datom[v]) break
      if (fromE !== undefined && fromE !== datom[e]) break
      yield datom
    }
  }
}


function getOp(d) {
  return d[op];
}

import Tree from "./Tree";
import PatchedTree from "./PatchedTree";

// как-то оно заметно подтормаживает с ростом tail
// нужно подумать, может быть не композицию использовать, а как-то иначе?

// похоже нужно делать "MemoryIndex"
// и похоже, что нужно хранить всю историю, как datomic, но не datascript,
// так проще будет, и это будет именно индекс, а не матрешка из PatchedTree

// я там "наоптимизировал" в parse-tree, вроде работает


function tree(loader, roots, name) {
  const addr = roots[name];
  const cmp  = comparators[name];
  const tail = roots.tail ?? [];

  let res = new Tree(loader, cmp, addr);

  for (const patch of tail) {
    if (patch.length === 0) continue;
    res = new PatchedTree(res, cmp, patch, getOp);
  }

  return res;
}

export default class DB {
  #loader;
  constructor(roots, loader) {
    this.#loader = loader;
    this.eav = new EAVIndex(tree(loader, roots, 'eav'));
    this.aev = new AEVIndex(tree(loader, roots, 'aev'));
    this.ave = new AVEIndex(tree(loader, roots, 'ave'));
  }

  update(roots) {
    return new DB(roots, this.#loader);
  }
}
