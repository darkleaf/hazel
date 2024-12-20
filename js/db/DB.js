const e = 0;
const a = 1;
const v = 2;
// на t не смотрим пока, да и не нужно на нее смотреть тут

// from всегда идет в y в searchFirst & searchLast
function eav(x, y) {
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
  return res
}


function aev(x, y) {
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
}

function ave(x, y) {
  if (x[a] > y[a]) return 1
  if (x[a] < y[a]) return -1
  if (x[v] > y[v]) return 1
  if (x[v] < y[v]) return -1
  if (x[e] > y[e]) return 1
  if (x[e] < y[e]) return -1
  return 0
}

import Index from "./Index.js"

class EAVIndex extends Index {
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

export default class DB {
  #loader;
  constructor(roots, loader) {
    this.#loader = loader;
    this.eav = new EAVIndex(loader, eav, roots.eav,)
    this.aev = new AEVIndex(loader, aev, roots.aev,)
    this.ave = new AVEIndex(loader, ave, roots.ave,)
  }

  // rdatoms(index, c1, c2, c3) {
  // }

  update(roots) {
    return new DB(roots, this.#loader);
  }
}


  // avet
  // aevt
  // index-pull(index, selector, start)
  //index-rpull //??

  /*
    vaet, он для графовых запросов

    pull же может взять обратную ссылку
  */
