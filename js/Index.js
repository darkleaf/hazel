export default class Index {
  constructor(address, loader) {
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

  seek(/* ? */) {
    return this.seekImpl(this.address)
  }
}
