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

export default class Index {
  constructor(
    loader,
    comparator,
    address,
    added = [],
    retracted = [],
  ) {
    // todo: private?
    this.loader = loader
    this.comparator = comparator
    this.address = address
    this.added = [...added].sort(this.comparator)
    this.retracted = [...retracted].sort(this.comparator)
  }


  // надо хвост реализовывать
  // через генераторы
  //
  // удаленные можно


  /*

    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    компаратор можно


    типа хранить датом с предыдущего шага
    или undefined?

    найти в хвосте 2 индекса
    предыдущий и текущий
    и вставить что нашли в поток

    как-то так


    тест надо писать

    */



  // https://immutable-js.com/docs/v5.0.3/OrderedSet/#sort()
  // Set(...).sort(cmp)
  // какое-то херовое api


  // просто массив отсортировать, и искать слева по комбинатору все меньше заданного



  // fix name
  // я тут постоянно длину спрашиваю, это ок?
  async *seekTree(addr, from) {
    const node = await this.loader(addr)

    let idx = 0
    if (from !== undefined)
      idx = searchFirst(node.keys, from, this.comparator)

    if (!!node.addresses) { // branch
      for(; idx < node.addresses.length; idx++) {
        const addr = node.addresses[idx]
        yield* this.seekTree(addr, from)
      }
    } else {
      for(; idx < node.keys.length; idx++) {
        yield node.keys[idx]
      }
    }
  }

  // по идее по нему нужно тоже итерироваться в seekImpl
  isRetracted(datom) {
    return -1 !== this.retracted.findIndex(item => {
      return 0 === this.comparator(datom, item)
    })
  }

  async *seekImpl(addr, from) {
    const tree = this.seekTree(addr, from);
    const added = this.added.values();

    let treeI = await tree.next();
    let addedI = added.next();

    while(!treeI.done && !addedI.done) {
      const cmp = this.comparator(addedI.value, treeI.value);

      if (cmp < 0) {
        yield addedI.value;
        addedI = added.next();
      } else if (cmp > 0) {
        if (this.isRetracted(treeI.value)) {
          treeI = await tree.next();
          continue;
        }
        yield treeI.value;
        treeI = await tree.next();
      } else {
        if (this.isRetracted(treeI.value)) {
          treeI = await tree.next();
          addedI = added.next();
          continue;
        }
        yield treeI.value;
      }
    }
    while(!treeI.done) {
      yield treeI.value;
      treeI = await tree.next();
    }
    while(!addedI.done) {
      yield addedI.value;
      addedI = added.next();
    }
  }

  async *rseekImpl(addr, from) {
    const node = await this.loader(addr)

    let idx = node.keys.length - 1

    if (from !== undefined)
      idx = searchLast(node.keys, from, this.comparator)

    if (!!node.addresses) { // branch
      for(; idx >= 0; idx--) {
        const addr = node.addresses[idx]
        yield* this.rseekImpl(addr, from)
      }
    } else {
      for(; idx >= 0; idx--) {
        yield node.keys[idx]
      }
    }
  }

  seek(from) {
    return this.seekImpl(this.address, from)
  }

  rseek(from) {
    return this.rseekImpl(this.address, from)
  }
}
