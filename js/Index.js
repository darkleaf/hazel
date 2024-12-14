export default class Index {
  constructor(
    address,
    loader,
    /*
      comparator,
      // а обратный я сам сделаю
    */

  ) {
    // todo: private?
    this.address = address
    this.loader = loader
  }


  // fix name
  async *seekImpl(addr) {
    const node = await this.loader(addr)

    if (!!node.addresses) { // branch
      for (const addr of node.addresses) {
        yield* this.seekImpl(addr)
      }
    } else {
      for (const key of node.keys) {
        yield key
      }
    }
  }

  seek(to) {
    return this.seekImpl(this.address)
  }

  //rseek(to) { }

}
