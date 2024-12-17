import { memo, useState, useEffect } from "react"

import {Stack} from "immutable"

import DB from "./DB.js"



async function loaderImpl(address) {
  const resp = await fetch("/segment/" + address)
  const json = await resp.json()
  return json
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
    id: {entity.id} i: {entity.i} j: {entity.j} {new Date().toString()}
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

export default function Main() {
  const [i, inc] = useState(0);

  const [db, setDb] = useState(new DB(window.initialRoots, loader))

  const [entities, setEntities] = useState(Stack())



  // походу тут нужно использовать memo, чтобы  <Entity не нужно было ререндерить
  useEffect(() => {
    let stopped = false;
    (async function load() {
      for await (const datom of db.aev.datoms("i")) {
        if (stopped) break
        setEntities(entities => entities.push(datom))
      }
    })();
    return () => {
      stopped = true
      setEntities(Stack())
    };
  }, [i])



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
    <div onClick={() => {inc(a => a + 1)}}>inc {i}</div>
    <div>{entities.map((e, i) => {
      return <Entity key={e[0]} db={db} e={e} />
    })}</div>
    </>
}
