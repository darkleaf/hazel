import { memo, useState, useEffect } from "react"


function delay(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  });
}

import {Stack} from "immutable"

import DB from "./DB.js"


// вроде как только в https, но на localhost работает
const cacheStorage = await window.caches.open('segments');

async function loaderImpl(address) {
  const url = "/segment/" + address;
  const resp = await (async function(){

    const cached = await cacheStorage.match(url);
    if (cached !== undefined) {
      return cached;
    } else {
      // надо рассмотреть еще код ответа и вот это все
      await cacheStorage.add(url);
      // можно тут сделать "recur", но тогда есть шанс бесконечного цикла
      return await cacheStorage.match(url);
    }
  })();

  const json = await resp.json();
  return json;
}

const cache = new Map()
async function loader(address) {
  if (cache.has(address)) return await cache.get(address);
  const promise = loaderImpl(address);
  cache.set(address, promise);
  return await promise;
}

function EntityImpl({e, db}) {
  const [entity, setEntity] = useState({})

  useEffect(() => {
    let entity = {id: e[0]};
    (async function load() {
      for await (const datom of db.eav.datoms(e[0])) {
        entity[ datom[1] ] = datom[2];
      }
      setEntity(entity);
    })();
    return () => {
      setEntity({});
    };
  }, [])


  return <div>
    id: {entity.id} i: {entity.i} j: {entity.j}
  </div>
}

/*
const Entity = memo(EntityImpl, (x, y) => {
  const ret = function() {
    if (x.db !== y.db) return false;
    if (x.e[0] !== y.e[0]) return false;
    if (x.e[1] !== y.e[1]) return false;
    if (x.e[2] !== y.e[2]) return false;
    return true;
  }()
  console.log(ret)
  return ret;
})
*/

const Entity = EntityImpl;

/*
const Entity = function({e}) {
  return <div>{JSON.stringify(e)}</div>
}
*/

export default function Main() {
  const [attr, setAttr] = useState("i");

  const [db, setDb] = useState(new DB(window.initialRoots, loader))

  const [entities, setEntities] = useState(Stack())


  /*
  useEffect(() => {
    let stopped = false;
    (async function load() {
      for await (let i = 1; i < 1600; i++ ) {
        if (stopped) break
        setEntities(entities => entities.push([i, "i", 42]))
      }
    })();
    return () => {
      stopped = true
      setEntities(Stack())
    };
  }, [i])
  */


  useEffect(() => {
    let stopped = false;
    (async function load() {
      for await (const datom of db.ave.datoms(attr)) {
        if (stopped) break

        //await delay(1000);

        setEntities(entities => entities.push(datom))
      }
    })();
    return () => {
      stopped = true
      setEntities(Stack())
    };
  }, [attr])



  /*
  useEffect(() => {
    (async function load() {
      const es = await Array.fromAsync( db.aev.datoms("i") );
      setEntities(es);
    })();
    return () => {
      setEntities([])
    };
  }, [i])
*/


  return <>
    <div>attr: {attr}</div>
    <div onClick={() => {setAttr("i")}}>by i</div>
    <div onClick={() => {setAttr("j")}}>by j</div>

    <div>{entities.map((e, i) => {
      return <Entity key={e[0]} db={db} e={e} />
    })}</div>
    </>
}
