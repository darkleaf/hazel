const e = 0;
const a = 1;
const v = 2;
const op = 3;

// на t не смотрим пока, да и не нужно на нее смотреть тут

// from всегда идет в y в searchFirst & searchLast

const comparators = {
  eav(x, y) {
    let res = function(){
      // хуй знает, как это работает, но пусть пока будет закомменчено
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
    }()

    //console.log("eav", x, y, res)
    return res;
  },

  aev(x, y) {
    let res = function(){
      if (x[a] > y[a]) return 1
      if (x[a] < y[a]) return -1
      if (x[e] > y[e]) return 1
      if (x[e] < y[e]) return -1
      if (x[v] > y[v]) return 1
      if (x[v] < y[v]) return -1
      return 0
    }()
    return res
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

  // rseek
}


class EAVIndex extends Index {

  // constructor(...args) {
  //   super(...args);
  // }

  async *datoms(fromE, fromA, fromV) {
    for await (let datom of this.seek([fromE, fromA, fromV])) {
      if (fromE !== undefined && fromE !== datom[e]) break
      if (fromA !== undefined && fromA !== datom[a]) break
      if (fromV !== undefined && fromV !== datom[v]) break
      yield datom
    }
  }

  //todo rdatoms
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

import Tree from "./Tree.js";
import PatchedTree from "./PatchedTree.js";

function tree(loader, roots, name) {
  const addr = roots[name];
  const cmp  = comparators[name];
  const tail = roots.tail ?? [];

  let res = new Tree(loader, cmp, addr);

  for (const patch of tail) {
    console.log(res, patch);
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
