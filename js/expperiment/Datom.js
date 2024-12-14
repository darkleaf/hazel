/*
  сделал поиграться, пока не пользуюсь
  может быть стоит перейти на TS, может быть там json получится распарсить на типы
  а может быть и TS + FlatBuffers заюзать
 */

export default class Datom {
  #e; #a; #v;

  constructor(e, a, v) {
    this.#e = e
    this.#a = a
    this.#v = v
  }

  get e() { return this.#e }
  get a() { return this.#a }
  get v() { return this.#v }

  *[Symbol.iterator]() {
    yield this.#e
    yield this.#a
    yield this.#v
  }
}
