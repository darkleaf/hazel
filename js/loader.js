export async function loader(address) {
  const url = "/segment/" + address;
  const resp = await fetch(url);
  // надо рассмотреть еще код ответа и вот это все
  const json = await resp.json();
  return json;
}

export function wrapInMemoryCache(loader) {
  const cache = new Map();
  return async function(address) {
    if (cache.has(address))
      return await cache.get(address);
    const promise = loader(address);
    cache.set(address, promise);
    return await promise;
  }
}

export async function wrapStorageCache(loader) {
  // вроде как только в https, но на localhost работает
  const cache = await window.caches.open('hazel/segments');

  return async function(address) {
    const cached = await cache.match(address);
    if (cached !== undefined) {
      const j = await cached.json();
      console.log("cached:", j);
      return j
    } else {
      const data = await loader(address);
      const resp = Response.json(data);
      await cache.put(address, resp);
      const resp2 = await cache.match(address);
      const j = await resp2.json();
      console.log("now cached:", j);
      return j
    }
  }
}
