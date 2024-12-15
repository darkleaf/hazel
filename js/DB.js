const e = 0;
const a = 1;
const v = 2;

// значения пока только строки

export function eav(x, y) {
  if (x[e] > y[e]) return 1
  if (x[e] < y[e]) return -1
  if (x[a] > y[a]) return 1
  if (x[a] < y[a]) return -1
  if (x[v] > y[v]) return 1
  if (x[v] < y[v]) return -1
  return 0
}

export function aev(x, y) {
  if (x[a] > y[a]) return 1
  if (x[a] < y[a]) return -1
  if (x[e] > y[e]) return 1
  if (x[e] < y[e]) return -1
  if (x[v] > y[v]) return 1
  if (x[v] < y[v]) return -1
  return 0
}

export function ave(x, y) {
  if (x[a] > y[a]) return 1
  if (x[a] < y[a]) return -1
  if (x[v] > y[v]) return 1
  if (x[v] < y[v]) return -1
  if (x[e] > y[e]) return 1
  if (x[e] < y[e]) return -1
  return 0
}

import Index from "./Index.js"

export default class DB {
  constructor(roots, loader) {
    this.eav = new Index(roots.eav, loader, eav)
    this.aev = new Index(roots.aev, loader, aev)
    this.ave = new Index(roots.ave, loader, ave)
  }

  // читает пока префикс сохраняется
  datoms(index, c1, c2, c3) {

  }

  // rdatoms(index, c1, c2, c3) {
  // }
}


  // avet
  // aevt
  // index-pull(index, selector, start)
  //index-rpull //??

  /*
    vaet, он для графовых запросов

    pull же может взять обратную ссылку
  */
